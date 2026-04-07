const FOLDER_NAME = 'Workday_Tracker_Data';
const FILES = {
    activities: 'activities.json',
    documentation: 'documentation.json',
    meetings: 'meetings.json'
};

export const driveService = {
    async getAccessToken() {
        // This will be handled by the token stored in our Auth context
        return localStorage.getItem('google_access_token');
    },

    async fetchWithAuth(url, options = {}) {
        const token = await this.getAccessToken();
        if (!token) throw new Error('No access token found');

        const response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            if (response.status === 401) {
                localStorage.removeItem('google_access_token');
                throw new Error('AUTH_EXPIRED');
            }
            throw new Error(error.error?.message || 'Drive API error');
        }

        return response;
    },

    async getFolderId() {
        const q = `name = '${FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
        const response = await this.fetchWithAuth(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id)`);
        const data = await response.json();

        if (data.files.length > 0) {
            return data.files[0].id;
        }

        // Create folder if not found
        const createResponse = await this.fetchWithAuth('https://www.googleapis.com/drive/v3/files', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: FOLDER_NAME,
                mimeType: 'application/vnd.google-apps.folder',
            }),
        });
        const folder = await createResponse.json();
        return folder.id;
    },

    async getFile(fileName, folderId) {
        const q = `name = '${fileName}' and '${folderId}' in parents and trashed = false`;
        const response = await this.fetchWithAuth(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id)`);
        const data = await response.json();

        if (data.files.length === 0) return null;

        const fileId = data.files[0].id;
        const contentResponse = await this.fetchWithAuth(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`);
        return { id: fileId, content: await contentResponse.json() };
    },

    async saveFile(fileName, content, folderId, existingFileId = null) {
        const metadata = {
            name: fileName,
            parents: (folderId && !existingFileId) ? [folderId] : undefined,
        };

        const formData = new FormData();
        formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        formData.append('file', new Blob([JSON.stringify(content)], { type: 'application/json' }));

        const url = existingFileId
            ? `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`
            : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

        const response = await this.fetchWithAuth(url, {
            method: existingFileId ? 'PATCH' : 'POST',
            body: formData,
        });

        return response.json();
    },

    async uploadAttachment(file, folderId) {
        const metadata = {
            name: file.name,
            parents: [folderId],
        };

        const formData = new FormData();
        formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        formData.append('file', file);

        const response = await this.fetchWithAuth('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
            method: 'POST',
            body: formData,
        });

        return response.json();
    }
};
