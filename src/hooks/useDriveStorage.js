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
                try {
                    console.log(`[Storage] Fetching ${file}...`);
                    const fileData = await driveService.getFile(`${file}.json`, fid);
                    
                    if (fileData) {
                        if (file === 'settings') {
                            newSettings = { 
                                ...newSettings, 
                                ...fileData.content, 
                                categories: { ...(newSettings.categories || {}), ...(fileData.content.categories || {}) } 
                            };
                        } else {
                            newData[file] = Array.isArray(fileData.content) ? fileData.content : [];
                        }
                        newFileIds[file] = fileData.id;
                        console.log(`[Storage] ✅ ${file} loaded. Items:`, newData[file]?.length || 'settings');
                    } else {
                        // File NOT found, only then create it
                        const initialContent = file === 'settings' ? settings : [];
                        console.log(`[Storage] ❓ ${file}.json not found, creating new...`);
                        const savedFile = await driveService.saveFile(`${file}.json`, initialContent, fid);
                        if (file === 'settings') {
                            newSettings = initialContent;
                        } else {
                            newData[file] = initialContent;
                        }
                        newFileIds[file] = savedFile.id;
                    }
                } catch (fileError) {
                    console.error(`[Storage] ❌ Error loading ${file}:`, fileError);
                    // Critical: if a core file fails, keep the previous state if possible
                    newData[file] = data[file] || [];
                }
            }

            setData(newData);
            setSettings(newSettings);
            setFileIds(newFileIds);
            console.log('[Storage] All data loaded from Drive.');
        } catch (error) {
            console.error('[Storage] 🔥 CRITICAL: Failed to initialize storage:', error);
            // If we already had some data, don't wipe it with empty state
            setData(prev => {
                const isActuallyEmpty = !prev.activities.length && !prev.meetings.length;
                if (isActuallyEmpty) return prev; // Stay empty if we were never loaded
                return prev; // Keep what we have if we hit an error mid-session
            });
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
