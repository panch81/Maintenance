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
        projects: []
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
        settings: null
    });

    const initialize = useCallback(async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const fid = await driveService.getFolderId();
            setFolderId(fid);

            const files = ['activities', 'documentation', 'meetings', 'projects', 'settings'];
            const newData = { ...data };
            const newFileIds = { ...fileIds };
            let newSettings = { ...settings };

            for (const file of files) {
                const fileData = await driveService.getFile(`${file}.json`, fid);
                if (fileData) {
                    if (file === 'settings') {
                        newSettings = { ...settings, ...fileData.content, categories: { ...settings.categories, ...fileData.content.categories } };
                    } else {
                        newData[file] = fileData.content;
                    }
                    newFileIds[file] = fileData.id;
                } else {
                    const initialContent = file === 'settings' ? settings : [];
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
        } catch (error) {
            console.error('Failed to initialize storage:', error);
            // Default to empty arrays instead of undefined if it crashes during loop
            if (!data.activities) setData({ activities: [], documentation: [], meetings: [] });
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
