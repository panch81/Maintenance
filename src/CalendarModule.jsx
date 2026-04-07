import React, { useState } from 'react';
import {
    ChevronLeft, ChevronRight, Calendar as CalendarIcon,
    Clock, CheckCircle, FileText, Users, Flag
} from 'lucide-react';

export const CalendarModule = ({ data }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => {
        const day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1; // 0=Mon, 6=Sun
    };

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    const activities = data.activities || [];
    const meetings = data.meetings || [];
    const docs = data.documentation || [];
    const projects = data.projects || [];

    const getDayItems = (day) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const current = new Date(dateStr);

        return [
            ...activities.filter(a => a.date === dateStr).map(i => ({ ...i, type: 'Activity', color: 'bg-blue-500' })),
            ...meetings.filter(m => m.date === dateStr).map(i => ({ ...i, type: 'Meeting', color: 'bg-green-500' })),
            ...docs.filter(d => d.date === dateStr).map(i => ({ ...i, type: 'Doc', color: 'bg-orange-500' })),
            ...projects.filter(p => {
                const s = new Date(p.startDate);
                const e = new Date(p.endDate);
                return current >= s && current <= e;
            }).map(i => {
                const isStart = i.startDate === dateStr;
                const isEnd = i.endDate === dateStr;
                return { ...i, type: 'Project', color: 'bg-purple-500', isStart, isEnd };
            }),
            ...activities.filter(a => a.dueDate === dateStr).map(i => ({ ...i, type: 'Due', color: 'bg-red-500' })),
            ...meetings.filter(m => m.dueDate === dateStr).map(i => ({ ...i, type: 'Due', color: 'bg-red-400' })),
            ...docs.filter(d => d.dueDate === dateStr).map(i => ({ ...i, type: 'Due', color: 'bg-red-300' })),
        ];
    };

    const calendarDays = [];
    const totalDays = daysInMonth(year, month);
    const offset = firstDayOfMonth(year, month);

    for (let i = 0; i < offset; i++) calendarDays.push(null);
    for (let i = 1; i <= totalDays; i++) calendarDays.push(i);

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-700">
            <div className="flex justify-between items-center bg-bg-secondary p-6 rounded-2xl shadow-sm border border-border-dim">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-workday-blue text-white rounded-xl shadow-lg transition-transform hover:rotate-3 cursor-pointer">
                        <CalendarIcon size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-text-primary capitalize tracking-tight">{monthName} {year}</h2>
                        <p className="text-sm text-text-secondary font-bold uppercase tracking-widest text-[10px]">Monthly Schedule Overview</p>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <button onClick={prevMonth} className="p-3 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all border border-gray-100 dark:border-slate-700">
                        <ChevronLeft size={20} className="text-gray-600 dark:text-slate-300" />
                    </button>
                    <button onClick={nextMonth} className="p-3 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all border border-gray-100 dark:border-slate-700">
                        <ChevronRight size={20} className="text-gray-600 dark:text-slate-300" />
                    </button>
                </div>
            </div>

            <div className="bg-bg-secondary rounded-[2.5rem] shadow-xl border border-border-dim overflow-hidden transition-colors">
                <div className="grid grid-cols-7 bg-bg-primary/50 py-4 border-b border-border-dim">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                        <div key={d} className="text-center text-[10px] font-black text-text-secondary uppercase tracking-[2px]">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 auto-rows-[120px] divide-x divide-y divide-border-dim">
                    {calendarDays.map((day, i) => {
                        const items = day ? getDayItems(day) : [];
                        const isToday = day && new Date().toDateString() === new Date(year, month, day).toDateString();

                        return (
                            <div key={i} className={`p-2 transition-colors overflow-hidden flex flex-col ${day ? 'bg-transparent hover:bg-blue-50/20 dark:hover:bg-sky-900/10' : 'bg-gray-50/50 dark:bg-slate-900/50'}`}>
                                {day && (
                                    <>
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-sm font-black w-6 h-6 flex items-center justify-center rounded-full transition-all ${isToday ? 'bg-workday-blue text-white shadow-md scale-110' : 'text-gray-400 dark:text-slate-500'}`}>
                                                {day}
                                            </span>
                                        </div>
                                        <div className="space-y-1 overflow-y-auto scrollbar-hide flex-1">
                                            {items.map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    title={item.title || item.topic}
                                                    className={`flex items-center space-x-1 px-2 py-0.5 text-[8px] font-bold text-white transition-all hover:scale-105 cursor-default shadow-sm ${item.color} ${item.type === 'Project'
                                                        ? `${item.isStart ? 'rounded-l-lg ml-1' : ''} ${item.isEnd ? 'rounded-r-lg mr-1' : ''} !scale-100 h-5 mb-0.5 flex items-center justify-center`
                                                        : 'rounded truncate'
                                                        }`}
                                                >
                                                    <span className="flex-shrink-0">
                                                        {item.type === 'Due' ? '🚩' : (item.type === 'Project' ? '' : '•')}
                                                    </span>
                                                    <span className="truncate">{item.title || item.topic}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 justify-center py-4">
                {[
                    { label: 'Activity', color: 'bg-blue-500' },
                    { label: 'Meeting', color: 'bg-green-500' },
                    { label: 'Doc', color: 'bg-orange-500' },
                    { label: 'Project', color: 'bg-purple-500' },
                    { label: 'Due Date', color: 'bg-red-500' },
                ].map(l => (
                    <div key={l.label} className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${l.color}`}></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">{l.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
