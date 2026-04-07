import React, { useState, useMemo, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { useDriveStorage } from './hooks/useDriveStorage';
import { Layout } from './Layout';
import { Dashboard } from './Dashboard';
import { ActivityModule } from './ActivityModule';
import { DocModule } from './DocModule';
import { MeetingModule } from './MeetingModule';
import { ProjectModule } from './ProjectModule';
import { CalendarModule } from './CalendarModule';
import { TrashModule } from './TrashModule';
import { AdminModule } from './AdminModule';
import { LogIn, Loader2, ShieldAlert, Bot } from 'lucide-react';

const AppContent = () => {
  const { isAuthenticated, login, user, logout, isAuthorized, setAuthorized } = useAuth();
  const { isDark } = useTheme();
  const { data, settings, loading, saveData, uploadAttachment } = useDriveStorage();
  const [currentTab, setTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isAuthenticated && user?.email && settings?.allowedUsers) {
      const allowed = settings.allowedUsers.some(u => u.toLowerCase() === user.email.toLowerCase());
      if (allowed !== isAuthorized) {
        setAuthorized(allowed);
      }
    }
  }, [isAuthenticated, user, settings, isAuthorized, setAuthorized]);

  // Centralized Save Logic to prevent data loss from filtering
  const handleSaveItem = async (type, newItem) => {
    try {
      const fullList = data[type] || [];
      const exists = fullList.some(i => i.id === newItem.id);
      const newList = exists
        ? fullList.map(i => i.id === newItem.id ? newItem : i)
        : [newItem, ...fullList];
      await saveData(type, newList);
    } catch (e) {
      if (e.message === 'AUTH_EXPIRED' || e.message === 'No access token found') {
        alert('Tu sesión de Google ha caducado o no se encuentra. Por favor, inicia sesión de nuevo para guardar los cambios.');
        logout();
      }
      throw e;
    }
  };

  const handleDeleteItem = async (type, id) => {
    try {
      const fullList = data[type] || [];
      const itemToDelete = fullList.find(i => i.id === id);
      if (!itemToDelete) return;

      // 1. Mark item for trash with original type and deletion date
      const trashItem = {
        ...itemToDelete,
        originalType: type,
        deletedAt: new Date().toISOString()
      };

      // 2. Remove from original list and add to trash
      const newOriginalList = fullList.filter(i => i.id !== id);
      const newTrash = [trashItem, ...(data.trash || [])];

      // 3. Save both changes
      await saveData(type, newOriginalList);
      await saveData('trash', newTrash);
    } catch (e) {
      alert('Error moving item to trash: ' + e.message);
    }
  };

  const handleRestoreItem = async (id) => {
    try {
      const currentTrash = data.trash || [];
      const itemToRestore = currentTrash.find(i => i.id === id);
      if (!itemToRestore) return;

      const { originalType, deletedAt, ...restoredItem } = itemToRestore;
      const originalList = data[originalType] || [];

      // 1. Move back to original and remove from trash
      const newOriginalList = [restoredItem, ...originalList];
      const newTrash = currentTrash.filter(i => i.id !== id);

      // 2. Save both
      await saveData(originalType, newOriginalList);
      await saveData('trash', newTrash);
    } catch (e) {
      alert('Error restoring item: ' + e.message);
    }
  };

  const handlePermanentDelete = async (id) => {
    try {
      const newTrash = (data.trash || []).filter(i => i.id !== id);
      await saveData('trash', newTrash);
    } catch (e) {
      alert('Error permanently deleting item: ' + e.message);
    }
  };

  // Auto-purge old trash (> 30 days) on load
  useEffect(() => {
    if (isAuthenticated && data.trash?.length > 0) {
      const now = new Date();
      const cleanTrash = data.trash.filter(item => {
        const deletedDate = new Date(item.deletedAt);
        const diffDays = (now - deletedDate) / (1000 * 60 * 60 * 24);
        return diffDays <= 30; // 30 days limit
      });
      
      if (cleanTrash.length !== data.trash.length) {
        console.log(`[Storage] Purging ${data.trash.length - cleanTrash.length} items older than 30 days...`);
        saveData('trash', cleanTrash);
      }
    }
  }, [isAuthenticated, data.trash]);

  // Hybrid Search Logic
  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const safeData = {
      activities: data?.activities || [],
      documentation: data?.documentation || [],
      meetings: data?.meetings || [],
      projects: data?.projects || []
    };

    if (!query) return safeData;

    return {
      activities: safeData.activities.filter(a =>
        a.title?.toLowerCase().includes(query) || a.content?.toLowerCase().includes(query) || a.category?.toLowerCase().includes(query)
      ),
      documentation: safeData.documentation.filter(d =>
        d.title?.toLowerCase().includes(query) || d.notes?.toLowerCase().includes(query) || d.snippet?.toLowerCase().includes(query) || d.category?.toLowerCase().includes(query)
      ),
      meetings: safeData.meetings.filter(m =>
        m.topic?.toLowerCase().includes(query) || m.notes?.toLowerCase().includes(query) || m.category?.toLowerCase().includes(query)
      ),
      projects: safeData.projects.filter(p =>
        p.title?.toLowerCase().includes(query) || p.description?.toLowerCase().includes(query) || p.category?.toLowerCase().includes(query)
      )
    };
  }, [data, searchQuery]);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary transition-colors duration-500">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-border-dim rounded-full" />
            <div className="w-16 h-16 border-4 border-t-workday-blue rounded-full animate-spin absolute top-0" />
            <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-workday-blue animate-pulse" size={24} />
          </div>
          <p className="font-black text-text-secondary uppercase tracking-[4px] text-[10px]">Syncing with Drive...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary p-6 transition-colors duration-500">
        <div className="bg-bg-secondary p-12 rounded-[3.5rem] shadow-2xl border border-border-dim flex flex-col items-center space-y-10 max-w-md w-full animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-workday-blue rounded-[2.5rem] flex items-center justify-center shadow-xl shadow-blue-200 dark:shadow-none transform rotate-3 hover:rotate-0 transition-transform">
            <Bot size={50} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-black text-text-primary tracking-tight italic">Service Hub</h1>
            <p className="text-xs font-black text-text-secondary uppercase tracking-[4px] mt-3">Workday Maintenance v3.0</p>
          </div>
          <div className="w-full h-px bg-border-dim" />
          <div className="text-center space-y-6">
            <p className="text-text-secondary font-medium text-sm leading-relaxed px-4">
              Enter your secure workstation. Please sign in to access your persistent data on Google Drive.
            </p>
            <div className="flex justify-center flex-col space-y-4 w-full">
              <button
                onClick={() => login()}
                className="w-full flex items-center justify-center space-x-3 bg-bg-secondary dark:bg-bg-primary border-2 border-border-dim py-4 rounded-2xl font-black text-text-primary hover:border-workday-blue transition-all group shadow-sm active:scale-95"
              >
                <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-6 h-6 group-hover:scale-110 transition-transform" alt="Google" />
                <span className="uppercase tracking-widest text-xs">Sign in with Google</span>
              </button>
              <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest text-center">Authorized Personnel Only</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary p-6 transition-colors duration-500">
        <div className="bg-bg-secondary p-12 rounded-[3.5rem] shadow-2xl border border-red-100 dark:border-red-900/20 flex flex-col items-center space-y-8 max-w-md w-full text-center animate-in slide-in-from-bottom-8 duration-500">
          <div className="p-5 bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-3xl shadow-inner">
            <ShieldAlert size={48} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-text-primary tracking-tight">Access Denied</h2>
            <p className="text-text-secondary mt-4 text-sm font-medium leading-relaxed">
              Account <b>{user?.email}</b> is not authorized. <br />Contact an administrator to grant access.
            </p>
          </div>
          <button
            onClick={() => logout()}
            className="w-full bg-slate-900 dark:bg-bg-primary text-white font-black uppercase text-xs tracking-widest py-5 rounded-[2rem] hover:bg-black transition-all shadow-lg active:scale-95 border border-border-dim"
          >
            Switch Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <Layout
      currentTab={currentTab}
      setTab={setTab}
      onSearch={setSearchQuery}
      user={user}
      showAdminTab={true}
      contextData={data}
    >
      <div className="relative">
        {currentTab === 'dashboard' && <Dashboard data={filteredData} settings={settings} onSaveSettings={(s) => saveData('settings', s)} onTabChange={setTab} />}
        {currentTab === 'activities' && (
          <ActivityModule
            data={filteredData.activities}
            categories={settings.categories.activities}
            pendingStatuses={settings.categories.pending || []}
            onSave={(item) => handleSaveItem('activities', item)}
            onDelete={(id) => handleDeleteItem('activities', id)}
            onUpload={uploadAttachment}
            projects={data.projects}
          />
        )}
        {currentTab === 'docs' && (
          <DocModule
            data={filteredData.documentation}
            categories={settings.categories.documentation}
            onSave={(item) => handleSaveItem('documentation', item)}
            onDelete={(id) => handleDeleteItem('documentation', id)}
            onUpload={uploadAttachment}
            projects={data.projects}
          />
        )}
        {currentTab === 'meetings' && (
          <MeetingModule
            data={filteredData.meetings}
            categories={settings.categories.meetings}
            onSave={(item) => handleSaveItem('meetings', item)}
            onDelete={(id) => handleDeleteItem('meetings', id)}
            onUpload={uploadAttachment}
            projects={data.projects}
          />
        )}
        {currentTab === 'projects' && (
          <ProjectModule
            data={filteredData.projects}
            allItems={data}
            categories={settings.categories.projects}
            onSave={(item) => handleSaveItem('projects', item)}
            onDelete={(id) => handleDeleteItem('projects', id)}
            onUpload={uploadAttachment}
          />
        )}
        {currentTab === 'calendar' && <CalendarModule data={data} setTab={setTab} onSearch={setSearchQuery} />}
        {currentTab === 'trash' && (
          <TrashModule 
            data={data.trash || []} 
            onRestore={handleRestoreItem} 
            onDeletePermanent={handlePermanentDelete} 
          />
        )}
        {currentTab === 'admin' && (
          <AdminModule settings={settings} onSaveSettings={(s) => saveData('settings', s)} />
        )}
      </div>
    </Layout>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
