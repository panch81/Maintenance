import React, { useState } from 'react';
import {
    Plus, Trash2, Link as LinkIcon, FileText,
    Search, Flag, ExternalLink, X, Calendar, Edit3
} from 'lucide-react';
import RichTextEditor from './components/RichTextEditor';

export const DocModule = ({ data, categories = [], projects = [], onSave, onDelete, onUpload }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        title: '', link: '', snippet: '', notes: '', category: '', projectId: '',
        date: new Date().toISOString().split('T')[0], dueDate: '', followUp: false
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newItem = { id: editingId || Date.now().toString(), ...formData };
        try {
            await onSave(newItem);
            setIsAdding(false);
            setEditingId(null);
            setFormData({
                title: '', link: '', snippet: '', notes: '', category: '', projectId: '',
                date: new Date().toISOString().split('T')[0], dueDate: '', followUp: false
            });
        } catch (e) {
            alert('Error saving documentation: ' + e.message);
        }
    };

    return (
        <div className="space-y-6 pb-20 transition-colors">
            <div className="flex justify-between items-center bg-bg-secondary p-6 rounded-2xl shadow-sm border border-border-dim">
                <div>
                    <h2 className="text-2xl font-black text-text-primary">Documentation</h2>
                    <p className="text-sm text-text-secondary font-medium">Knowledge base and reference links.</p>
                </div>
                <button
                    onClick={() => { setIsAdding(true); setEditingId(null); }}
                    className="flex items-center space-x-2 bg-workday-blue text-white px-6 py-3 rounded-xl hover:bg-workday-lightBlue transition-all shadow-md active:scale-95"
                >
                    <Plus size={20} />
                    <span className="font-bold uppercase tracking-widest text-xs">Add Doc</span>
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit} className="bg-bg-secondary p-8 rounded-3xl shadow-2xl border border-border-dim animate-in slide-in-from-top-4 duration-500 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="col-span-2">
                            <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[2px] mb-2 block">Title</label>
                            <input
                                required
                                className="w-full p-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-workday-blue outline-none font-bold text-gray-800 dark:text-slate-100"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[2px] mb-2 block">Link (URL)</label>
                            <input
                                placeholder="https://..."
                                className="w-full p-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-workday-blue outline-none text-sm dark:text-slate-300"
                                value={formData.link}
                                onChange={e => setFormData({ ...formData, link: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[2px] mb-2 block">Category</label>
                                <select
                                    className="w-full p-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-workday-blue outline-none text-sm font-bold dark:text-slate-300"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="">None</option>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[2px] mb-2 block">Link to Project</label>
                                <select
                                    className="w-full p-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-workday-blue outline-none text-sm font-bold dark:text-slate-300"
                                    value={formData.projectId}
                                    onChange={e => setFormData({ ...formData, projectId: e.target.value })}
                                >
                                    <option value="">No Project</option>
                                    {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 col-span-2 md:col-span-1">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[2px] mb-2 block">Date</label>
                                <input type="date" className="w-full p-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-workday-blue outline-none text-sm dark:text-slate-300" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[2px] mb-2 block">Due Date</label>
                                <input type="date" className="w-full p-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-workday-blue outline-none text-sm dark:text-slate-300" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} />
                            </div>
                        </div>

                        <div className="pt-6">
                            <label className="flex items-center space-x-3 cursor-pointer group">
                                <input type="checkbox" className="w-6 h-6 rounded-lg text-workday-blue focus:ring-workday-blue border-gray-200 dark:border-slate-700 dark:bg-slate-800" checked={formData.followUp} onChange={e => setFormData({ ...formData, followUp: e.target.checked })} />
                                <span className="font-black text-[10px] uppercase tracking-widest text-gray-500 dark:text-slate-500 group-hover:text-workday-blue transition-colors">Flag For Follow-up</span>
                            </label>
                        </div>

                        <div className="col-span-2">
                            <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[2px] mb-2 block">Notes / Snippet</label>
                            <RichTextEditor
                                value={formData.notes}
                                onChange={val => setFormData({ ...formData, notes: val })}
                                placeholder="Add snippets, code, or detailed documentation notes..."
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2 text-xs font-black uppercase text-gray-400 hover:text-gray-600 transition-colors">Cancel</button>
                        <button type="submit" className="bg-workday-blue text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-[2px] shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all">
                            {editingId ? 'Update Doc' : 'Save Doc'}
                        </button>
                    </div>
                </form>
            )}

            <div className="bg-bg-secondary rounded-3xl shadow-sm border border-border-dim overflow-hidden animate-in fade-in duration-500">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-bg-primary/50 border-b border-border-dim">
                                <th className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest">Title</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest">Project</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest">Category</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest">Due Date</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest text-center">F.U.</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                            {data.map(item => (
                                <tr key={item.id} className="group hover:bg-blue-50/30 dark:hover:bg-sky-900/10 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                                                <FileText size={16} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-slate-200 text-sm group-hover:text-workday-blue transition-colors line-clamp-1">{item.title}</p>
                                                {item.link && <p className="text-[10px] text-workday-blue dark:text-sky-400 truncate max-w-[200px] flex items-center space-x-1">
                                                    <LinkIcon size={10} />
                                                    <span>{item.link}</span>
                                                </p>}
                                                <div
                                                    className="text-[10px] text-gray-400 dark:text-slate-500 truncate max-w-[200px] line-clamp-1"
                                                    dangerouslySetInnerHTML={{ __html: item.notes?.replace(/<[^>]*>?/gm, ' ') || '' }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-md text-[9px] font-black uppercase tracking-widest">
                                            {projects.find(p => p.id === item.projectId)?.title || 'No Project'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 rounded-md text-[9px] font-black uppercase tracking-widest">{item.category || 'None'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-gray-600 dark:text-slate-400 font-mono tracking-tighter">{item.date}</td>
                                    <td className="px-6 py-4 text-xs font-bold text-gray-600 dark:text-slate-400 font-mono tracking-tighter">{item.dueDate || '-'}</td>
                                    <td className="px-6 py-4 text-center">
                                        {item.followUp && <Flag size={14} className="mx-auto text-orange-500 fill-orange-500" />}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {item.link && <a href={item.link} target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-workday-blue hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all"><ExternalLink size={16} /></a>}
                                            <button onClick={() => { setFormData(item); setEditingId(item.id); setIsAdding(true); }} className="p-2 text-gray-400 hover:text-workday-blue hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all"><Edit3 size={16} /></button>
                                            <button onClick={() => onDelete(item.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
