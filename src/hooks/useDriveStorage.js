import { useState, useEffect, useCallback } from 'react';
import { driveService } from '../services/driveService';
import { useAuth } from '../context/AuthContext';

export const useDriveStorage = () => {
    const { isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [folderId, setFolderId] = useState(null);
    const [data, setData] = useState({
        activities: [],
        documentation: [],
        meetings: [],
        projects: [],
        trash: []
    });
    const [settings, setSettings] = useState({
        categories: { activities: [], documentation: [], meetings: [], pending: [], projects: [] },
        allowedUsers: ['panch81@gmail.com', 'angelgomezdiez@gmail.com'],
        mañana: ''
    });
    const [fileIds, setFileIds] = useState({
        activities: null,
        documentation: null,
        meetings: null,
        projects: null,
        settings: null,
        trash: null
    });

    const initialize = useCallback(async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const fid = await driveService.getFolderId();
            setFolderId(fid);

            const files = ['activities', 'documentation', 'meetings', 'projects', 'settings', 'trash'];
            const newData = { ...data };
            const newFileIds = { ...fileIds };
            let newSettings = { ...settings };

            for (const file of files) {
                console.log(`[Storage] Initializing ${file}...`);
                const fileData = await driveService.getFile(`${file}.json`, fid);
                if (fileData) {
                    if (file === 'settings') {
                        newSettings = { ...newSettings, ...fileData.content, categories: { ...(newSettings.categories || {}), ...(fileData.content.categories || {}) } };
                    } else {
                        newData[file] = Array.isArray(fileData.content) ? fileData.content : [];
                    }
                    newFileIds[file] = fileData.id;
                    console.log(`[Storage] Loaded ${file} successfully.`);
                } else {
                    const initialContent = file === 'settings' ? settings : [];
                    console.log(`[Storage] File ${file}.json not found, creating from template...`);
                    const savedFile = await driveService.saveFile(`${file}.json`, initialContent, fid);
                    if (file === 'settings') {
                        newSettings = initialContent;
                    } else {
                        newData[file] = initialContent;
                    }
                    newFileIds[file] = savedFile.id;
                }
            }

            setData(newData);
            setSettings(newSettings);
            setFileIds(newFileIds);
            console.log('[Storage] All data loaded from Drive.');
        } catch (error) {
            console.error('[Storage] CRITICAL: Failed to initialize storage:', error);
            // Ensure we don't return an incomplete object which would crash components
            setData(prev => ({
                activities: prev.activities || [],
                documentation: prev.documentation || [],
                meetings: prev.meetings || [],
                projects: prev.projects || [],
                trash: prev.trash || []
            }));
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        initialize();
    }, [initialize]);

    const saveData = async (type, newData) => {
        try {
            if (type === 'settings') {
                await driveService.saveFile('settings.json', newData, folderId, fileIds.settings);
                setSettings(newData);
            } else {
                await driveService.saveFile(`${type}.json`, newData, folderId, fileIds[type]);
                setData(prev => ({ ...prev, [type]: newData }));
            }
        } catch (error) {
            console.error(`Failed to save ${type}:`, error);
            throw error;
        }
    };

    const uploadAttachment = async (file) => {
        return driveService.uploadAttachment(file, folderId);
    };

    return { data, settings, loading, saveData, uploadAttachment, refresh: initialize };
};
