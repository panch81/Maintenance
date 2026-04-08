import React, { useState } from 'react';
import {
    Plus, Trash2, Edit3, Paperclip, CheckCircle,
    ExternalLink, Flag, Image as ImageIcon, X,
    Activity, Calendar, ChevronDown, ChevronUp,
    AlertCircle, Eye
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import RichTextEditor from './components/RichTextEditor';

export const ActivityModule = ({ data, categories = [], pendingStatuses = [], projects = [], onSave, onDelete, onUpload }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        title: '', content: '', date: new Date().toISOString().split('T')[0], dueDate: '', status: 'Regular', category: '', pending: '', projectId: '', followUp: false, closed: false, attachments: []
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
            setFormData({ title: '', content: '', date: new Date().toISOString().split('T')[0], dueDate: '', status: 'Regular', category: '', pending: '', projectId: '', followUp: false, attachments: [] });
            setFile(null);
        } catch (err) {
            alert('Error saving activity: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6 pb-20 transition-colors">
            <div className="flex justify-between items-center bg-bg-secondary p-6 rounded-2xl shadow-sm border border-border-dim">
                <div>
                    <h2 className="text-2xl font-black text-text-primary">Activities</h2>
                    <p className="text-sm text-text-secondary font-medium">Manage your tasks and deadlines.</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center space-x-2 bg-workday-blue text-white px-6 py-3 rounded-xl hover:bg-workday-lightBlue transition-all shadow-md active:scale-95"
                >
                    <Plus size={20} />
                    <span className="font-bold uppercase tracking-widest text-xs">New Activity</span>
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit} className="bg-bg-secondary p-8 rounded-3xl shadow-2xl border border-border-dim animate-in slide-in-from-top-4 duration-500 z-10 relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="col-span-2">
                            <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[2px] mb-2 block">Item Title</label>
                            <input
                                type="text"
                                required
                                className="w-full p-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-workday-blue outline-none transition-all font-bold text-gray-800 dark:text-slate-100"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[2px] mb-2 block">Notes / Content</label>
                            <RichTextEditor
                                value={formData.content}
                                onChange={val => setFormData({ ...formData, content: val })}
                                onImagePaste={handlePaste}
                                placeholder="Add detailed notes, links, or lists..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 col-span-2 md:col-span-1">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[2px] mb-2 block">Date</label>
                            <div className="date-input-wrapper">
                                <input
                                    type="date"
                                    required
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-workday-blue outline-none text-sm dark:text-slate-300"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                />
                                <Calendar className="date-input-icon text-text-secondary" size={16} />
                            </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[2px] mb-2 block">Due Date</label>
                            <div className="date-input-wrapper">
                                <input
                                    type="date"
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-workday-blue outline-none text-sm dark:text-slate-300"
                                    value={formData.dueDate}
                                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                />
                                <Calendar className="date-input-icon text-text-secondary" size={16} />
                            </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 col-span-2">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 col-span-2">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[2px] mb-2 block">Category</label>
                                    <select
                                        className="w-full p-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-workday-blue outline-none text-sm font-bold dark:text-slate-300"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="">None</option>
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[2px] mb-2 block">Pending</label>
                                    <select
                                        className="w-full p-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-workday-blue outline-none text-sm font-bold dark:text-slate-300"
                                        value={formData.pending}
                                        onChange={e => setFormData({ ...formData, pending: e.target.value })}
                                    >
                                        <option value="">None</option>
                                        {pendingStatuses.map(ps => <option key={ps} value={ps}>{ps}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[2px] mb-2 block">Link to Project</label>
                                    <select
                                        className="w-full p-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-workday-blue outline-none text-sm font-bold dark:text-slate-300"
                                        value={formData.projectId}
                                        onChange={e => setFormData({ ...formData, projectId: e.target.value })}
                                    >
                                        <option value="">No Project</option>
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[2px] mb-2 block">Status</label>
                                    <select
                                        className="w-full p-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-workday-blue outline-none text-sm font-bold dark:text-slate-300"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option>Regular</option>
                                        <option>High Priority</option>
                                        <option>Completed</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-6 col-span-2">
                            <div className="flex-1">
                                <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[2px] mb-2 block">File Upload</label>
                                <input type="file" id="act-file" className="hidden" onChange={e => setFile(e.target.files[0])} />
                                <label htmlFor="act-file" className="cursor-pointer bg-gray-100 dark:bg-slate-800 p-3 rounded-xl border border-dashed border-gray-300 dark:border-slate-600 flex items-center justify-center space-x-2 text-xs font-bold text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all">
                                    <Paperclip size={16} />
                                    <span>{file ? file.name : 'Choose File'}</span>
                                </label>
                            </div>
                            <label className="flex items-center space-x-3 cursor-pointer group pt-6">
                                <input
                                    type="checkbox"
                                    className="w-6 h-6 rounded-lg text-workday-blue focus:ring-workday-blue border-gray-200 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
                                    checked={formData.followUp}
                                    onChange={e => setFormData({ ...formData, followUp: e.target.checked })}
                                />
                                <span className="font-black text-[10px] uppercase tracking-widest text-gray-500 dark:text-slate-500 group-hover:text-workday-blue transition-colors">Flag For Follow-up</span>
                            </label>

                            <label className="flex items-center space-x-3 cursor-pointer group pt-6">
                                <input
                                    type="checkbox"
                                    className="w-6 h-6 rounded-lg text-red-500 focus:ring-red-500 border-gray-200 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
                                    checked={formData.closed}
                                    onChange={e => setFormData({ ...formData, closed: e.target.checked })}
                                />
                                <span className="font-black text-[10px] uppercase tracking-widest text-gray-500 dark:text-slate-500 group-hover:text-red-500 transition-colors">Closed / Archived</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2 text-xs font-black uppercase text-gray-400 hover:text-gray-600 transition-colors">Cancel</button>
                        <button
                            type="submit"
                            disabled={uploading}
                            className="bg-workday-blue text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-[2px] shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all disabled:bg-gray-200"
                        >
                            {uploading ? 'Processing...' : (editingId ? 'Update Item' : 'Create Item')}
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
                                <th className="px-6 py-4 text-left text-[10px] font-black pointer-events-none uppercase tracking-[2px]">Status</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black pointer-events-none uppercase tracking-[2px]">Pending</th>
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
                                <tr key={item.id} className={`group hover:bg-blue-50/30 dark:hover:bg-sky-900/10 transition-colors ${item.closed ? 'opacity-50 grayscale-[0.5]' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${(item.pending === 'Completed' || item.pending === 'Finalizado') ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-blue-50 dark:bg-sky-900/20 text-workday-blue'}`}>
                                                {(item.pending === 'Completed' || item.pending === 'Finalizado') ? <CheckCircle size={16} /> : <Activity size={16} />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-slate-200 text-sm group-hover:text-workday-blue transition-colors line-clamp-1">{item.title}</p>
                                                <div
                                                    className="text-[10px] text-gray-400 dark:text-slate-500 truncate max-w-[200px] line-clamp-1"
                                                    dangerouslySetInnerHTML={{ __html: item.content?.replace(/<[^>]*>?/gm, ' ') || '' }}
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
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 rounded-md text-red-500 focus:ring-red-500 border-gray-200 dark:border-slate-700 dark:bg-slate-800 cursor-pointer transition-all hover:scale-110"
                                                checked={item.closed || false}
                                                onChange={(e) => onSave({ ...item, closed: e.target.checked })}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${item.closed ? 'text-red-500' : 'text-gray-400 dark:text-slate-500'}`}>
                                                {item.closed ? 'Closed' : 'Active'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-blue-50 dark:bg-sky-900/20 text-workday-blue dark:text-sky-400 rounded-md text-[9px] font-black uppercase tracking-widest">{item.pending || 'None'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-gray-600 dark:text-slate-400 font-mono tracking-tighter">{item.date}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2 text-xs font-bold text-gray-600 dark:text-slate-400 font-mono tracking-tighter">
                                            {item.dueDate ? (
                                                <>
                                                    <Calendar size={12} className="text-gray-300 dark:text-slate-600" />
                                                    <span className={new Date(item.dueDate) < new Date() ? 'text-red-500' : ''}>{item.dueDate}</span>
                                                </>
                                            ) : '-'}
                                        </div>
                                    </td>
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
                                    <h3 className="text-2xl font-black text-text-primary tracking-tight">{viewingItem.title}</h3>
                                    <div className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest text-text-secondary">
                                        <span className="flex items-center space-x-1"><Calendar size={12} /> <span>{viewingItem.date}</span></span>
                                        {viewingItem.category && <span className="px-2 py-0.5 bg-bg-primary rounded border border-border-dim">{viewingItem.category}</span>}
                                    </div>
                                </div>
                                <button onClick={() => setViewingItem(null)} className="p-2 hover:bg-bg-primary rounded-xl text-text-secondary transition-all"><X size={24} /></button>
                            </div>

                            <div className="bg-bg-primary/50 p-6 rounded-3xl border border-border-dim max-h-[40vh] overflow-y-auto rich-text-view">
                                <div dangerouslySetInnerHTML={{ __html: viewingItem.content || '<p class="italic opacity-50">No content provided.</p>' }} />
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="bg-bg-primary/30 p-4 rounded-2xl border border-border-dim">
                                    <p className="text-[10px] font-black uppercase text-text-secondary mb-1">Due Date</p>
                                    <p className="font-bold text-text-primary">{viewingItem.dueDate || 'None'}</p>
                                </div>
                                <div className="bg-bg-primary/30 p-4 rounded-2xl border border-border-dim">
                                    <p className="text-[10px] font-black uppercase text-text-secondary mb-1">Status</p>
                                    <p className="font-bold text-text-primary">{viewingItem.status}</p>
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
