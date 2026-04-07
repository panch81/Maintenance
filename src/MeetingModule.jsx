import React, { useState } from 'react';
import {
    Plus, Trash2, Calendar, FileText, Paperclip,
    ExternalLink, Flag, Image as ImageIcon, X, Edit3, Clock,
    AlertCircle, Eye
} from 'lucide-react';
import RichTextEditor from './components/RichTextEditor';

export const MeetingModule = ({ data, categories = [], projects = [], onSave, onDelete, onUpload }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        topic: '', notes: '', date: new Date().toISOString().split('T')[0],
        dueDate: '', category: '', projectId: '', followUp: false, attachments: []
    });
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [expandedImage, setExpandedImage] = useState(null);
    const [viewingItem, setViewingItem] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    const handlePaste = async (e) => {
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (const item of items) {
            if (item.type.indexOf('image') !== -1) {
                setUploading(true);
                try {
                    const blob = item.getAsFile();
                    const res = await onUpload(blob);
                    const attachment = { id: res.id, name: res.name, link: res.webViewLink, isImage: true };
                    setFormData(prev => ({ ...prev, attachments: [...(prev.attachments || []), attachment] }));
                } catch (err) {
                    alert('Error pasting image: ' + err.message);
                } finally {
                    setUploading(false);
                }
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let attachment = null;
            if (file) {
                setUploading(true);
                const res = await onUpload(file);
                attachment = { id: res.id, name: res.name, link: res.webViewLink, isImage: file.type.startsWith('image/') };
                setUploading(false);
            }

            const newItem = {
                id: editingId || Date.now().toString(),
                ...formData,
                attachments: (formData.attachments || []).concat(attachment ? [attachment] : [])
            };

            await onSave(newItem);
            setIsAdding(false);
            setEditingId(null);
            setFormData({ topic: '', notes: '', date: new Date().toISOString().split('T')[0], dueDate: '', category: '', projectId: '', followUp: false, attachments: [] });
            setFile(null);
        } catch (error) {
            alert('Error al guardar Reunión: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6 pb-20 transition-colors">
            <div className="flex justify-between items-center bg-bg-secondary p-6 rounded-2xl shadow-sm border border-border-dim">
                <div>
                    <h2 className="text-2xl font-black text-text-primary">Meetings</h2>
                    <p className="text-sm text-text-secondary font-medium">Log discussions and outcomes.</p>
                </div>
                <button
                    onClick={() => { setIsAdding(true); setEditingId(null); }}
                    className="flex items-center space-x-2 bg-workday-blue text-white px-6 py-3 rounded-xl hover:bg-workday-lightBlue transition-all shadow-md active:scale-95"
                >
                    <Plus size={20} />
                    <span className="font-bold uppercase tracking-widest text-xs">New Meeting</span>
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit} className="bg-bg-secondary p-8 rounded-3xl shadow-2xl border border-border-dim animate-in slide-in-from-top-4 duration-500 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="col-span-2">
                            <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[2px] mb-2 block">Meeting Topic</label>
                            <input
                                placeholder="What was the focus?"
                                required
                                className="w-full p-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-workday-blue outline-none font-bold text-gray-800 dark:text-slate-100"
                                value={formData.topic}
                                onChange={e => setFormData({ ...formData, topic: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[2px] mb-2 block">Date</label>
                            <div className="date-input-wrapper">
                                <input type="date" required className="w-full p-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-workday-blue text-sm dark:text-slate-300" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                                <Calendar className="date-input-icon text-text-secondary" size={16} />
                            </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[2px] mb-2 block">Due Date</label>
                            <div className="date-input-wrapper">
                                <input type="date" required className="w-full p-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-workday-blue text-sm dark:text-slate-300" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} />
                                <Calendar className="date-input-icon text-text-secondary" size={16} />
                            </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[2px] mb-2 block">Category</label>
                                <select className="w-full p-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-workday-blue text-sm font-bold dark:text-slate-300" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                    <option value="">No Category</option>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[2px] mb-2 block">Link to Project</label>
                                <select className="w-full p-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-workday-blue text-sm font-bold dark:text-slate-300" value={formData.projectId} onChange={e => setFormData({ ...formData, projectId: e.target.value })}>
                                    <option value="">No Project</option>
                                    {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[2px] mb-2 block">Key Points</label>
                            <RichTextEditor
                                value={formData.notes}
                                onChange={val => setFormData({ ...formData, notes: val })}
                                onImagePaste={handlePaste}
                                placeholder="Summary of discussions and decisions..."
                            />
                        </div>

                        <div className="flex items-center space-x-6 col-span-2">
                            <div className="flex-1">
                                <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[2px] mb-2 block">Attachment</label>
                                <input type="file" id="meeting-file" className="hidden" onChange={e => setFile(e.target.files[0])} />
                                <label htmlFor="meeting-file" className="cursor-pointer bg-gray-100 dark:bg-slate-800 p-3 border border-dashed border-gray-300 dark:border-slate-600 rounded-xl flex items-center justify-center space-x-2 text-xs font-bold text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all font-mono italic">
                                    <Paperclip size={16} />
                                    <span>{file ? file.name : 'Attach File'}</span>
                                </label>
                            </div>

                            <label className="flex items-center space-x-3 cursor-pointer group pt-6">
                                <input type="checkbox" className="w-6 h-6 rounded-lg text-workday-blue focus:ring-workday-blue border-gray-200 dark:border-slate-700 dark:bg-slate-800" checked={formData.followUp} onChange={e => setFormData({ ...formData, followUp: e.target.checked })} />
                                <span className="font-black text-[10px] uppercase tracking-widest text-gray-500 dark:text-slate-500 group-hover:text-workday-blue transition-colors">Flag For Follow-up</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2 text-xs font-black uppercase text-gray-400 hover:text-gray-600 transition-colors">Cancel</button>
                        <button type="submit" disabled={uploading} className="bg-workday-blue text-white px-10 py-3 rounded-xl font-black uppercase text-[10px] tracking-[2px] shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all disabled:bg-gray-200">
                            {uploading ? 'Uploading...' : (editingId ? 'Update Meeting' : 'Save Meeting')}
                        </button>
                    </div>
                </form>
            )}

            <div className="bg-bg-secondary rounded-3xl shadow-sm border border-border-dim overflow-hidden animate-in fade-in duration-500">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-bg-primary/50 border-b border-border-dim">
                                <th className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest">Topic</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest">Project</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest">Category</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest">Due Date</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest text-center">F.U.</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                            {(data || [])
                                .sort((a, b) => new Date(b.date) - new Date(a.date))
                                .map(item => (
                                <tr key={item.id} className="group hover:bg-blue-50/30 dark:hover:bg-sky-900/10 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-sky-900/20 text-workday-blue dark:text-sky-400 flex items-center justify-center">
                                                <Calendar size={16} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-slate-200 text-sm group-hover:text-workday-blue transition-colors line-clamp-1">{item.topic}</p>
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
                                            <button onClick={() => setViewingItem(item)} className="p-2 text-gray-400 hover:text-green-500 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all" title="View Details"><Eye size={16} /></button>
                                            <button onClick={() => { setFormData(item); setEditingId(item.id); setIsAdding(true); }} className="p-2 text-gray-400 hover:text-workday-blue hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all" title="Edit Item"><Edit3 size={16} /></button>
                                            <button onClick={() => setConfirmDeleteId(item.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all" title="Delete to Trash"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Detail Modal */}
            {viewingItem && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-bg-secondary w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-border-dim overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 space-y-6">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black text-text-primary tracking-tight">{viewingItem.topic}</h3>
                                    <div className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest text-text-secondary">
                                        <span className="flex items-center space-x-1"><Calendar size={12} /> <span>{viewingItem.date}</span></span>
                                        {viewingItem.category && <span className="px-2 py-0.5 bg-bg-primary rounded border border-border-dim">{viewingItem.category}</span>}
                                    </div>
                                </div>
                                <button onClick={() => setViewingItem(null)} className="p-2 hover:bg-bg-primary rounded-xl text-text-secondary transition-all"><X size={24} /></button>
                            </div>

                            <div className="bg-bg-primary/50 p-6 rounded-3xl border border-border-dim max-h-[40vh] overflow-y-auto rich-text-view">
                                <div dangerouslySetInnerHTML={{ __html: viewingItem.notes || '<p class="italic opacity-50">No notes provided.</p>' }} />
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="bg-bg-primary/30 p-4 rounded-2xl border border-border-dim">
                                    <p className="text-[10px] font-black uppercase text-text-secondary mb-1">Due Date</p>
                                    <p className="font-bold text-text-primary">{viewingItem.dueDate || 'None'}</p>
                                </div>
                                <div className="bg-bg-primary/30 p-4 rounded-2xl border border-border-dim">
                                    <p className="text-[10px] font-black uppercase text-text-secondary mb-1">Project</p>
                                    <p className="font-bold text-text-primary">
                                        {projects.find(p => p.id === viewingItem.projectId)?.title || 'No Project'}
                                    </p>
                                </div>
                            </div>

                            {viewingItem.attachments?.length > 0 && (
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black uppercase text-text-secondary tracking-widest">Attachments</p>
                                    <div className="flex flex-wrap gap-2">
                                        {viewingItem.attachments.map(att => (
                                            <a key={att.id} href={att.link} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-sky-900/20 text-workday-blue rounded-xl text-xs font-bold hover:bg-blue-100 transition-all border border-blue-100 dark:border-sky-900/40">
                                                <Paperclip size={14} />
                                                <span>{att.name}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end pt-4">
                                <button onClick={() => setViewingItem(null)} className="bg-text-primary text-bg-primary px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all">Close View</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Pop */}
            {confirmDeleteId && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-bg-secondary p-8 rounded-[2rem] shadow-2xl border border-red-100 dark:border-red-900/20 max-w-sm w-full text-center space-y-6 animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
                            <AlertCircle size={32} />
                        </div>
                        <div>
                            <h4 className="text-xl font-black text-text-primary">Move to Trash?</h4>
                            <p className="text-sm text-text-secondary mt-2">You can restore this item from the Recycle Bin within 30 days.</p>
                        </div>
                        <div className="flex flex-col space-y-3">
                            <button 
                                onClick={() => { onDelete(confirmDeleteId); setConfirmDeleteId(null); }} 
                                className="w-full bg-red-500 text-white font-black py-4 rounded-xl uppercase text-xs tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-200 dark:shadow-none"
                            >
                                Yes, move to trash
                            </button>
                            <button 
                                onClick={() => setConfirmDeleteId(null)} 
                                className="w-full font-black py-3 rounded-xl uppercase text-xs tracking-widest text-text-secondary hover:bg-bg-primary transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
