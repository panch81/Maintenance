import React, { useState } from 'react';
import {
    Settings,
    Plus,
    Trash2,
    UserPlus,
    ShieldCheck,
    Tag,
    Save,
    CheckCircle2,
    X
} from 'lucide-react';

export const AdminModule = ({ settings, onSaveSettings }) => {
    const [activeSection, setActiveSection] = useState('categories');
    const [newCat, setNewCat] = useState({ section: 'activities', name: '' });
    const [newUser, setNewUser] = useState('');
    const [statusMessage, setStatusMessage] = useState(null);

    const handleSave = async (updated) => {
        setStatusMessage('Saving...');
        try {
            await onSaveSettings(updated);
            setStatusMessage('Settings saved successfully!');
            setTimeout(() => setStatusMessage(null), 3000);
        } catch (e) {
            setStatusMessage('Error saving settings.');
        }
    };

    const addCategory = () => {
        if (!newCat.name.trim()) return;
        const updated = { ...settings };
        updated.categories[newCat.section] = [...(updated.categories[newCat.section] || []), newCat.name.trim()];
        handleSave(updated);
        setNewCat({ ...newCat, name: '' });
    };

    const removeCategory = (section, name) => {
        const updated = { ...settings };
        updated.categories[section] = updated.categories[section].filter(c => c !== name);
        handleSave(updated);
    };

    const addUser = () => {
        if (!newUser.trim() || !newUser.includes('@')) return;
        const updated = { ...settings };
        updated.allowedUsers = [...new Set([...(updated.allowedUsers || []), newUser.trim().toLowerCase()])];
        handleSave(updated);
        setNewUser('');
    };

    const removeUser = (email) => {
        const updated = { ...settings };
        updated.allowedUsers = updated.allowedUsers.filter(u => u !== email);
        handleSave(updated);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-20 transition-colors">
            <div className="flex justify-between items-center bg-bg-secondary p-6 rounded-2xl shadow-sm border border-border-dim">
                <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-50 dark:bg-sky-900/30 text-workday-blue dark:text-sky-400 rounded-xl">
                        <Settings size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-text-primary">Administration Console</h2>
                        <p className="text-sm text-text-secondary">Manage classifications and access control.</p>
                    </div>
                </div>
                {statusMessage && (
                    <div className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center space-x-2 ${statusMessage.includes('Error') ? 'bg-red-50 dark:bg-red-900/40 text-red-600' : 'bg-green-50 dark:bg-green-900/40 text-green-600'
                        }`}>
                        {statusMessage.includes('Saving') ? <Save className="animate-pulse" size={16} /> : <CheckCircle2 size={16} />}
                        <span>{statusMessage}</span>
                    </div>
                )}
            </div>

            <div className="flex space-x-4 border-b border-gray-200 dark:border-slate-800">
                <button
                    onClick={() => setActiveSection('categories')}
                    className={`pb-4 px-2 font-bold text-sm transition-all relative ${activeSection === 'categories' ? 'text-workday-blue' : 'text-gray-400 hover:text-gray-600 dark:hover:text-slate-300'
                        }`}
                >
                    <div className="flex items-center space-x-2">
                        <Tag size={16} />
                        <span>Categories</span>
                    </div>
                    {activeSection === 'categories' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-workday-blue rounded-full" />}
                </button>
                <button
                    onClick={() => setActiveSection('users')}
                    className={`pb-4 px-2 font-bold text-sm transition-all relative ${activeSection === 'users' ? 'text-workday-blue' : 'text-gray-400 hover:text-gray-600 dark:hover:text-slate-300'
                        }`}
                >
                    <div className="flex items-center space-x-2">
                        <ShieldCheck size={16} />
                        <span>User Management</span>
                    </div>
                    {activeSection === 'users' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-workday-blue rounded-full" />}
                </button>
            </div>

            {activeSection === 'categories' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {['activities', 'documentation', 'meetings', 'pending', 'projects'].map(section => (
                        <div key={section} className="bg-bg-secondary p-6 rounded-2xl shadow-sm border border-border-dim flex flex-col h-full">
                            <h3 className="font-black text-[10px] text-text-secondary mb-4 uppercase tracking-widest text-center">{section}</h3>
                            <div className="space-y-1 mb-6 flex-1">
                                {(settings.categories[section] || []).map(cat => (
                                    <div key={cat} className="flex items-center justify-between group p-2 hover:bg-gray-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
                                        <span className="text-sm font-bold text-gray-700 dark:text-slate-300">{cat}</span>
                                        <button onClick={() => removeCategory(section, cat)} className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                                    </div>
                                ))}
                            </div>
                            <div className="relative font-bold">
                                <input type="text" placeholder="New Category..." className="w-full pl-3 pr-10 py-2 bg-gray-50 dark:bg-slate-800/30 border border-gray-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-1 focus:ring-workday-blue dark:text-white" value={newCat.section === section ? newCat.name : ''} onFocus={() => setNewCat({ ...newCat, section })} onChange={(e) => setNewCat({ ...newCat, name: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && addCategory()} />
                                <button onClick={addCategory} className="absolute right-2 top-1/2 -translate-y-1/2 text-workday-blue hover:text-workday-lightBlue"><Plus size={18} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeSection === 'users' && (
                <div className="bg-bg-secondary p-8 rounded-2xl shadow-sm border border-border-dim animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-border-dim gap-4">
                        <div>
                            <h3 className="font-bold text-lg text-text-primary">Allowed Access</h3>
                            <p className="text-sm text-text-secondary">Restricted personnel list.</p>
                        </div>
                        <div className="flex space-x-2 font-bold">
                            <input type="email" placeholder="email@example.com" className="w-64 p-3 bg-gray-50 dark:bg-slate-800/30 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-workday-blue dark:text-white" value={newUser} onChange={(e) => setNewUser(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addUser()} />
                            <button onClick={addUser} className="bg-workday-blue text-white px-4 py-2 rounded-xl flex items-center space-x-2 hover:bg-workday-lightBlue transition-all shadow-md group"><UserPlus size={18} /><span className="text-sm uppercase tracking-widest text-[10px] font-black">Add</span></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {settings.allowedUsers.map(email => (
                            <div key={email} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-blue-100 dark:hover:border-slate-700 transition-all group">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-workday-blue border border-gray-200 dark:border-slate-700 font-bold uppercase group-hover:scale-110 transition-transform">{email[0]}</div>
                                    <div className="font-bold">
                                        <p className="text-sm text-gray-900 dark:text-slate-200 truncate">{email}</p>
                                        <p className="text-[10px] text-green-600 dark:text-green-400 font-black uppercase tracking-tighter">Authorized</p>
                                    </div>
                                </div>
                                <button onClick={() => removeUser(email)} disabled={settings.allowedUsers.length <= 1} className="p-3 text-gray-300 hover:text-red-500 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all disabled:opacity-0"><Trash2 size={20} /></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
