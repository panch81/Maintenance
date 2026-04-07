import React, { useState, useEffect, useRef } from 'react';
import {
    Clock, Calendar, CheckCircle, Sunrise, Briefcase, ChevronRight, Loader2, Flag, AlertCircle
} from 'lucide-react';

export const Dashboard = ({ data, settings, onSaveSettings, onTabChange }) => {
    const [mañanaText, setMañanaText] = useState(settings?.mañana || '');
    const [isSaving, setIsSaving] = useState(false);
    const saveTimeout = useRef(null);

    const handleMañanaChange = (val) => {
        setMañanaText(val);
        if (saveTimeout.current) clearTimeout(saveTimeout.current);

        setIsSaving(true);
        saveTimeout.current = setTimeout(async () => {
            try {
                await onSaveSettings({ ...settings, mañana: val });
            } finally {
                setIsSaving(false);
            }
        }, 1500);
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const twoWeeks = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);

    const futureTasks = data.activities.filter(a => (a.dueDate ? new Date(a.dueDate) > today : new Date(a.date) > today) && !a.closed).sort((a, b) => new Date(a.dueDate || a.date) - new Date(b.dueDate || b.date));

    const activeProjects = (data.projects || []).filter(p => !p.closed).sort((a, b) => new Date(a.endDate) - new Date(b.endDate));

    const priorityItems = [
        ...data.activities.map(i => ({ ...i, type: 'Activity' })),
        ...data.documentation.map(i => ({ ...i, type: 'Doc' })),
        ...data.meetings.map(i => ({ ...i, type: 'Meeting' }))
    ].filter(item => {
        const due = item.dueDate ? new Date(item.dueDate) : null;
        const isUpcoming = due && due >= today && due <= twoWeeks;
        return (item.followUp || isUpcoming) && (item.pending !== 'Completed' && item.pending !== 'Finalizado') && !item.closed;
    }).sort((a, b) => {
        if (a.followUp && !b.followUp) return -1;
        if (!a.followUp && b.followUp) return 1;
        return (new Date(a.dueDate || '9999-12-31') - new Date(b.dueDate || '9999-12-31'));
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div>
                <h2 className="text-4xl font-black text-text-primary tracking-tight italic">Dashboard</h2>
                <p className="text-text-secondary font-bold uppercase tracking-[3px] text-[10px] mt-1">Focused Overview</p>
            </div>

            {/* Mañana Focus (Reduced) */}
            <div className="bg-gradient-to-br from-workday-blue to-workday-dark-blue dark:from-bg-secondary dark:to-bg-primary p-6 rounded-[2rem] shadow-xl relative overflow-hidden group border border-border-dim">
                <div className="absolute top-0 right-0 p-8 bg-white/5 rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-700" />
                <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="flex items-center space-x-3">
                        <Sunrise size={20} className="text-white" />
                        <h3 className="text-lg font-black tracking-tight text-white uppercase italic">Mañana</h3>
                    </div>
                    <div className="flex items-center space-x-2 text-blue-200">
                        {isSaving ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-60">
                            {isSaving ? 'Syncing...' : 'Saved'}
                        </span>
                    </div>
                </div>
                <textarea
                    className="w-full bg-white/10 dark:bg-black/20 backdrop-blur-sm border border-white/20 rounded-xl p-4 h-24 outline-none focus:bg-white/20 transition-all font-medium text-base text-white placeholder:text-blue-200/50 resize-none shadow-inner"
                    placeholder="Tomorrow's focus..."
                    value={mañanaText}
                    onChange={(e) => handleMañanaChange(e.target.value)}
                />
            </div>

            {/* Main Grid: 2/3 for Future Tasks & Projects, 1/3 for Priority Watchlist */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Area (Ongoing & Future) */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-bg-secondary p-7 rounded-[2rem] border border-border-dim shadow-sm flex flex-col min-h-[250px]">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-2">
                                <Clock size={18} className="text-orange-500" />
                                <h4 className="text-[10px] font-black uppercase tracking-[2px] text-text-primary">Next Tasks (Future)</h4>
                            </div>
                            <span className="text-[9px] font-black bg-bg-primary px-2 py-0.5 rounded border border-border-dim text-text-secondary">{futureTasks.length}</span>
                        </div>
                        <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-1">
                            {futureTasks.length > 0 ? futureTasks.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => onTabChange('activities')}
                                    className="p-4 bg-bg-primary/50 rounded-2xl border border-border-dim hover:border-workday-blue group cursor-pointer transition-all flex items-center justify-between"
                                >
                                    <div className="flex-1 min-w-0">
                                        <h5 className="font-bold text-sm text-text-primary truncate">{item.title}</h5>
                                        <p className="text-[10px] text-text-secondary font-bold mt-0.5">{item.date}</p>
                                    </div>
                                    <ChevronRight size={14} className="text-text-secondary opacity-0 group-hover:opacity-100 transition-all ml-2" />
                                </div>
                            )) : (
                                <div className="flex flex-col items-center justify-center h-full opacity-20 py-10">
                                    <CheckCircle size={40} className="mb-2" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No future tasks</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-bg-secondary p-7 rounded-[2rem] border border-border-dim shadow-sm flex flex-col min-h-[250px]">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-2">
                                <Briefcase size={18} className="text-purple-500" />
                                <h4 className="text-[10px] font-black uppercase tracking-[2px] text-text-primary">Ongoing Projects</h4>
                            </div>
                            <span className="text-[9px] font-black bg-bg-primary px-2 py-0.5 rounded border border-border-dim text-text-secondary">{activeProjects.length}</span>
                        </div>
                        <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-1">
                            {activeProjects.length > 0 ? activeProjects.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => onTabChange('projects')}
                                    className="p-4 bg-bg-primary/50 rounded-2xl border border-border-dim hover:border-purple-500 group cursor-pointer transition-all flex items-center justify-between"
                                >
                                    <div className="flex-1 min-w-0">
                                        <h5 className="font-bold text-sm text-text-primary truncate">{item.title}</h5>
                                        <div className="flex items-center space-x-2 mt-0.5">
                                            <p className="text-[9px] font-black text-purple-500 uppercase">Ends:</p>
                                            <p className="text-[10px] text-text-secondary font-bold">{item.endDate}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={14} className="text-text-secondary opacity-0 group-hover:opacity-100 transition-all ml-2" />
                                </div>
                            )) : (
                                <div className="flex flex-col items-center justify-center h-full opacity-20 py-10">
                                    <Briefcase size={40} className="mb-2" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No active projects</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Area (Priority Watchlist) */}
                <div className="bg-bg-secondary p-7 rounded-[2rem] border border-border-dim shadow-sm flex flex-col h-full sticky top-0">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-2">
                            <Flag size={18} className="text-red-500 fill-red-500" />
                            <h4 className="text-[10px] font-black uppercase tracking-[2px] text-text-primary">Priority Watchlist</h4>
                        </div>
                        <span className="text-[9px] font-black bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400">{priorityItems.length}</span>
                    </div>

                    <p className="text-[9px] text-text-secondary font-bold mb-4 italic opacity-60">Items flagged or due within 2 weeks.</p>

                    <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                        {priorityItems.length > 0 ? priorityItems.map((item, i) => (
                            <div
                                key={i}
                                onClick={() => onTabChange(item.type === 'Meeting' ? 'meetings' : item.type === 'Doc' ? 'docs' : 'activities')}
                                className={`p-4 rounded-2xl border transition-all cursor-pointer group ${item.followUp ? 'bg-red-50/30 dark:bg-red-900/10 border-red-100 dark:border-red-900/20' : 'bg-bg-primary/30 border-border-dim'} hover:shadow-md hover:translate-x-1`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary opacity-50">{item.type}</span>
                                    {item.followUp && <Flag size={10} className="text-red-500 fill-red-500" />}
                                </div>
                                <h5 className="font-bold text-xs text-text-primary truncate">{item.title || item.topic}</h5>
                                {item.dueDate && (
                                    <div className="flex items-center space-x-1 mt-2">
                                        <AlertCircle size={10} className="text-red-500" />
                                        <span className="text-[9px] font-black text-red-500/80 uppercase">Due: {item.dueDate}</span>
                                    </div>
                                )}
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center py-20 opacity-20">
                                <CheckCircle size={40} className="text-green-500" />
                                <p className="text-[10px] font-black uppercase tracking-widest mt-2">All Clear</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
