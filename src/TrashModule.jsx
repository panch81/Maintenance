import React from 'react';
import { Trash2, RotateCcw, Calendar, Activity, FileText, MessageSquare, Briefcase, AlertCircle, Info } from 'lucide-react';

export const TrashModule = ({ data, onRestore, onDeletePermanent }) => {
    const getIcon = (type) => {
        switch (type) {
            case 'activities': return <Activity size={16} className="text-blue-500" />;
            case 'documentation': return <FileText size={16} className="text-orange-500" />;
            case 'meetings': return <MessageSquare size={16} className="text-green-500" />;
            case 'projects': return <Briefcase size={16} className="text-purple-500" />;
            default: return <Activity size={16} />;
        }
    };

    const getDaysLeft = (deletedAt) => {
        const deletedDate = new Date(deletedAt);
        const now = new Date();
        const diffTime = Math.abs(now - deletedDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, 30 - diffDays);
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-center bg-bg-secondary p-6 rounded-2xl shadow-sm border border-border-dim">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl">
                        <Trash2 size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-text-primary uppercase tracking-tighter">Recycle Bin</h2>
                        <p className="text-sm text-text-secondary font-medium italic">Items will be permanently deleted after 30 days.</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2 text-xs font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/10 px-4 py-2 rounded-lg border border-orange-100 dark:border-orange-900/20">
                    <AlertCircle size={14} />
                    <span>Auto-cleaning enabled</span>
                </div>
            </div>

            <div className="bg-bg-secondary rounded-3xl shadow-sm border border-border-dim overflow-hidden">
                {data.length === 0 ? (
                    <div className="p-20 text-center space-y-4">
                        <div className="w-16 h-16 bg-bg-primary rounded-full flex items-center justify-center mx-auto text-text-secondary opacity-30">
                            <Trash2 size={32} />
                        </div>
                        <p className="font-black text-text-secondary uppercase tracking-[2px] text-xs">Your recycle bin is empty</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-bg-primary/50 border-b border-border-dim">
                                    <th className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest">Type</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest">Original Title / Topic</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest text-center">Remaining Days</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                                {data.map(item => {
                                    const daysLeft = getDaysLeft(item.deletedAt);
                                    return (
                                        <tr key={item.id} className="group hover:bg-gray-50/30 dark:hover:bg-slate-800/10 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    {getIcon(item.originalType)}
                                                    <span className="text-[10px] font-black uppercase text-text-secondary tracking-widest">{item.originalType}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-sm text-text-primary">{item.title || item.topic}</p>
                                                <p className="text-[10px] text-text-secondary font-mono italic">Deleted on: {new Date(item.deletedAt).toLocaleDateString()}</p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className={`inline-flex flex-col items-center px-3 py-1 rounded-lg ${daysLeft < 5 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'} dark:bg-opacity-10`}>
                                                    <span className="font-black text-sm">{daysLeft}</span>
                                                    <span className="text-[8px] uppercase tracking-tighter">Days Left</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <button 
                                                        onClick={() => onRestore(item.id)} 
                                                        className="group/btn flex items-center space-x-1 p-2 bg-blue-50 text-workday-blue hover:bg-workday-blue hover:text-white rounded-lg transition-all"
                                                        title="Restore Item"
                                                    >
                                                        <RotateCcw size={16} />
                                                        <span className="text-[10px] font-black uppercase max-w-0 overflow-hidden group-hover/btn:max-w-[100px] transition-all duration-300">Restore</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            if (window.confirm('This will be permanently deleted. Are you sure?')) {
                                                                onDeletePermanent(item.id);
                                                            }
                                                        }} 
                                                        className="group/btn flex items-center space-x-1 p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                                                        title="Delete Permanently"
                                                    >
                                                        <Trash2 size={16} />
                                                        <span className="text-[10px] font-black uppercase max-w-0 overflow-hidden group-hover/btn:max-w-[100px] transition-all duration-300">Delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
