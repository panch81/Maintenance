import React, { useState } from 'react';
import {
    Plus, Trash2, Edit3, Paperclip, Briefcase,
    Calendar, ChevronDown, ChevronUp, Clock, ExternalLink,
    Activity, FileText, MessageSquare, X, Check, Loader2, Link as LinkIcon
} from 'lucide-react';
import RichTextEditor from './components/RichTextEditor';

export const ProjectModule = ({ data, allItems = {}, categories = [], onSave, onDelete, onUpload, onSaveItem }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [quickAdd, setQuickAdd] = useState(null); // { type, projectId }
    const [pendingLinks, setPendingLinks] = useState({ activities: [], documentation: [], meetings: [] });

    const [formData, setFormData] = useState({
        title: '', description: '', startDate: new Date().toISOString().split('T')[0], endDate: '', category: '', closed: false, attachments: []
    });
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

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

            const projectId = editingId || Date.now().toString();
            const newItem = {
                id: projectId,
                ...formData,
                attachments: (formData.attachments || []).concat(attachment ? [attachment] : [])
            };

            await onSave(newItem);

            // Handle pending links for new project
            if (!editingId) {
                for (const type of ['activities', 'documentation', 'meetings']) {
                    for (const itemId of pendingLinks[type]) {
                        const item = allItems[type].find(i => i.id === itemId);
                        if (item) {
                            await onSaveItem(type, { ...item, projectId });
                        }
                    }
                }
            }

            setIsAdding(false);
            setEditingId(null);
            setFormData({ title: '', description: '', startDate: new Date().toISOString().split('T')[0], endDate: '', category: '', attachments: [] });
            setPendingLinks({ activities: [], documentation: [], meetings: [] });
            setFile(null);
        } catch (err) {
            alert('Error saving project: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleLinkExisting = async (type, itemId) => {
        if (!itemId) return;

        if (editingId) {
            // Immediate update for existing project
            const item = allItems[type].find(i => i.id === itemId);
            if (item) {
                await onSaveItem(type, { ...item, projectId: editingId });
            }
        } else {
            // Queue for new project
            setPendingLinks(prev => ({
                ...prev,
                [type]: [...prev[type], itemId]
            }));
        }
    };

    const getLinkedItems = (projectId) => {
        return {
            activities: (allItems.activities || []).filter(a => a.projectId === projectId),
            docs: (allItems.documentation || []).filter(d => d.projectId === projectId),
            meetings: (allItems.meetings || []).filter(m => m.projectId === projectId)
        };
    };

    const getUnlinkedItems = () => {
        const checkUnlinked = (item) => !item.projectId || item.projectId === "" || item.projectId === "None";
        return {
            activities: (allItems.activities || []).filter(a => checkUnlinked(a) && !pendingLinks.activities.includes(a.id)),
            docs: (allItems.documentation || []).filter(d => checkUnlinked(d) && !pendingLinks.documentation.includes(d.id)),
            meetings: (allItems.meetings || []).filter(m => checkUnlinked(m) && !pendingLinks.meetings.includes(m.id))
        };
    };

    const unlinked = getUnlinkedItems();

    return (
        <div className="space-y-6 pb-20 transition-colors">
            <div className="flex justify-between items-center bg-bg-secondary p-6 rounded-2xl shadow-sm border border-border-dim">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 dark:bg-sky-900/30 text-workday-blue rounded-xl">
                        <Briefcase size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-text-primary">Projects</h2>
                        <p className="text-sm text-text-secondary font-medium">Track long-term initiatives and milestones.</p>
                    </div>
                </div>
                <button
                    onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ title: '', description: '', startDate: new Date().toISOString().split('T')[0], endDate: '', category: '', attachments: [] }); setPendingLinks({ activities: [], documentation: [], meetings: [] }); }}
                    className="flex items-center space-x-2 bg-workday-blue text-white px-6 py-3 rounded-xl hover:bg-workday-lightBlue transition-all shadow-md active:scale-95"
                >
                    <Plus size={20} />
                    <span className="font-bold uppercase tracking-widest text-xs">New Project</span>
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit} className="bg-bg-secondary p-8 rounded-3xl shadow-2xl border border-border-dim animate-in slide-in-from-top-4 duration-500 z-10 relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="col-span-2 text-text-primary">
                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-[2px] mb-2 block">Project Title</label>
                            <input
                                type="text"
                                required
                                className="w-full p-4 bg-bg-primary border border-border-dim rounded-2xl focus:ring-2 focus:ring-workday-blue outline-none transition-all font-bold"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="col-span-2 text-text-primary font-bold">
                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-[2px] mb-2 block">Description</label>
                            <RichTextEditor
                                value={formData.description}
                                onChange={val => setFormData({ ...formData, description: val })}
                                placeholder="Project goals, scope, and key details..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 col-span-2 md:col-span-1">
                            <div>
                                <label className="text-[10px] font-black text-text-secondary uppercase tracking-[2px] mb-2 block">Start Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full p-3 bg-bg-primary border border-border-dim rounded-xl focus:ring-2 focus:ring-workday-blue outline-none text-sm text-text-primary font-bold"
                                    value={formData.startDate}
                                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-text-secondary uppercase tracking-[2px] mb-2 block">End Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full p-3 bg-bg-primary border border-border-dim rounded-xl focus:ring-2 focus:ring-workday-blue outline-none text-sm text-text-primary font-bold"
                                    value={formData.endDate}
                                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                />
                            </div>
                        </div>

                        <div className="col-span-2 md:col-span-1">
                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-[2px] mb-2 block">Category</label>
                            <select
                                className="w-full p-3 bg-bg-primary border border-border-dim rounded-xl focus:ring-2 focus:ring-workday-blue outline-none text-sm font-bold text-text-primary"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="">None</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        {/* Link Existing Section */}
                        <div className="col-span-2 p-6 bg-bg-primary/50 border border-dashed border-border-dim rounded-2xl space-y-6">
                            <div className="flex items-center space-x-2 text-text-secondary">
                                <LinkIcon size={14} />
                                <h4 className="text-[10px] font-black uppercase tracking-widest">Link Existing Content</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="text-[9px] font-black text-text-secondary uppercase mb-2 block">Tasks</label>
                                    <select
                                        className="w-full p-3 bg-bg-secondary border border-border-dim rounded-xl text-xs font-bold text-text-primary outline-none focus:ring-2 focus:ring-workday-blue"
                                        onChange={(e) => handleLinkExisting('activities', e.target.value)}
                                        value=""
                                    >
                                        <option value="">Select Task...</option>
                                        {unlinked.activities.map(a => <option key={a.id} value={a.id}>{a.title || 'Untitled Task'}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-text-secondary uppercase mb-2 block">Documentation</label>
                                    <select
                                        className="w-full p-3 bg-bg-secondary border border-border-dim rounded-xl text-xs font-bold text-text-primary outline-none focus:ring-2 focus:ring-workday-blue"
                                        onChange={(e) => handleLinkExisting('documentation', e.target.value)}
                                        value=""
                                    >
                                        <option value="">Select Doc...</option>
                                        {unlinked.docs.map(d => <option key={d.id} value={d.id}>{d.title || 'Untitled Doc'}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-text-secondary uppercase mb-2 block">Meetings</label>
                                    <select
                                        className="w-full p-3 bg-bg-secondary border border-border-dim rounded-xl text-xs font-bold text-text-primary outline-none focus:ring-2 focus:ring-workday-blue"
                                        onChange={(e) => handleLinkExisting('meetings', e.target.value)}
                                        value=""
                                    >
                                        <option value="">Select Meeting...</option>
                                        {unlinked.meetings.map(m => <option key={m.id} value={m.id}>{m.topic || 'Untitled Meeting'}</option>)}
                                    </select>
                                </div>
                            </div>
                            {(pendingLinks.activities.length > 0 || pendingLinks.documentation.length > 0 || pendingLinks.meetings.length > 0) && (
                                <div className="mt-4 flex flex-wrap gap-2 animate-in fade-in duration-300">
                                    {[...pendingLinks.activities, ...pendingLinks.documentation, ...pendingLinks.meetings].length} items will be linked on save.
                                </div>
                            )}
                        </div>

                        <div className="col-span-2">
                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-[2px] mb-2 block">Attachments</label>
                            <input type="file" id="proj-file" className="hidden" onChange={e => setFile(e.target.files[0])} />
                            <label htmlFor="proj-file" className="cursor-pointer bg-bg-primary p-3 rounded-xl border border-dashed border-border-dim flex items-center justify-center space-x-2 text-xs font-bold text-text-secondary hover:bg-bg-secondary transition-all">
                                <Paperclip size={16} />
                                <span>{file ? file.name : 'Click to Upload Attachment'}</span>
                            </label>
                            {formData.attachments?.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {formData.attachments.map(att => (
                                        <a key={att.id} href={att.link} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 px-3 py-1 bg-blue-50 dark:bg-sky-900/20 text-workday-blue rounded-full text-[10px] font-bold hover:bg-blue-100 dark:hover:bg-sky-900/40 transition-all border border-blue-100 dark:border-sky-800">
                                            <Paperclip size={10} />
                                            <span>{att.name}</span>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="col-span-2 pt-4">
                            <label className="flex items-center space-x-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    className="w-6 h-6 rounded-lg text-red-500 focus:ring-red-500 border-border-dim dark:bg-bg-primary cursor-pointer"
                                    checked={formData.closed}
                                    onChange={e => setFormData({ ...formData, closed: e.target.checked })}
                                />
                                <span className="font-black text-[10px] uppercase tracking-widest text-text-secondary group-hover:text-red-500 transition-colors">Project Closed / Archived</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2 text-xs font-black uppercase text-text-secondary hover:text-text-primary transition-colors">Cancel</button>
                        <button
                            type="submit"
                            disabled={uploading}
                            className="bg-workday-blue text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-[2px] shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                        >
                            {uploading ? 'Uploading...' : (editingId ? 'Update Project' : 'Create Project')}
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-4">
                {data.map(item => {
                    const linked = getLinkedItems(item.id);
                    const isExpanded = expandedId === item.id;

                    return (
                        <div key={item.id} className={`bg-bg-secondary rounded-3xl shadow-sm border border-border-dim overflow-hidden animate-in fade-in duration-500 overflow-visible ${item.closed ? 'opacity-50 grayscale-[0.5]' : ''}`}>
                            <div className="flex items-center justify-between p-6 hover:bg-gray-50/30 dark:hover:bg-sky-900/10 transition-colors cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : item.id)}>
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-sky-900/20 flex items-center justify-center text-workday-blue">
                                        <Briefcase size={24} />
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 rounded-md text-red-500 focus:ring-red-500 border-border-dim dark:bg-bg-primary cursor-pointer transition-all hover:scale-110"
                                            checked={item.closed || false}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                onSave({ ...item, closed: e.target.checked });
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <div>
                                            <h3 className="font-black text-lg text-text-primary">{item.title}</h3>
                                            <div className="flex items-center space-x-3 mt-1">
                                                <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest bg-bg-primary px-2 py-0.5 rounded border border-border-dim">{item.category || 'Standard'}</span>
                                                <span className="text-[10px] font-bold text-text-secondary flex items-center space-x-1">
                                                    <Calendar size={12} />
                                                    <span>{item.startDate} → {item.endDate}</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-6">
                                    <div className="hidden md:flex items-center space-x-4 text-text-secondary">
                                        <div className="text-center">
                                            <p className="text-[9px] font-black uppercase mb-0.5">Tasks</p>
                                            <p className="font-bold text-sm text-text-primary">{linked.activities.length}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[9px] font-black uppercase mb-0.5">Docs</p>
                                            <p className="font-bold text-sm text-text-primary">{linked.docs.length}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[9px] font-black uppercase mb-0.5">Meetings</p>
                                            <p className="font-bold text-sm text-text-primary">{linked.meetings.length}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button onClick={(e) => { e.stopPropagation(); setFormData(item); setEditingId(item.id); setIsAdding(true); setPendingLinks({ activities: [], documentation: [], meetings: [] }); }} className="p-2 text-text-secondary hover:text-workday-blue hover:bg-bg-primary rounded-xl transition-all"><Edit3 size={18} /></button>
                                        <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="p-2 text-text-secondary hover:text-red-500 hover:bg-bg-primary rounded-xl transition-all"><Trash2 size={18} /></button>
                                        <div className="ml-2 text-text-secondary">
                                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="p-8 border-t border-border-dim bg-bg-primary/30 animate-in slide-in-from-top-2 duration-300">
                                    <div className="mb-8">
                                        <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-[2px] mb-3">Project Description</h4>
                                        <div
                                            className="text-sm text-text-secondary leading-relaxed bg-bg-secondary p-4 rounded-2xl border border-border-dim quill-content"
                                            dangerouslySetInnerHTML={{ __html: item.description || '<p class="opacity-50 italic">No description provided.</p>' }}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <LinkedSection
                                            title="Associated Tasks"
                                            items={linked.activities}
                                            icon={Activity}
                                            color="text-blue-500"
                                            onAdd={() => setQuickAdd({ type: 'activities', projectId: item.id })}
                                            showForm={quickAdd?.type === 'activities' && quickAdd?.projectId === item.id}
                                            onCloseForm={() => setQuickAdd(null)}
                                            onSave={(data) => onSaveItem('activities', { ...data, projectId: item.id })}
                                        />
                                        <LinkedSection
                                            title="Associated Docs"
                                            items={linked.docs}
                                            icon={FileText}
                                            color="text-orange-500"
                                            onAdd={() => setQuickAdd({ type: 'documentation', projectId: item.id })}
                                            showForm={quickAdd?.type === 'documentation' && quickAdd?.projectId === item.id}
                                            onCloseForm={() => setQuickAdd(null)}
                                            onSave={(data) => onSaveItem('documentation', { ...data, projectId: item.id })}
                                        />
                                        <LinkedSection
                                            title="Associated Meetings"
                                            items={linked.meetings}
                                            icon={MessageSquare}
                                            color="text-green-500"
                                            onAdd={() => setQuickAdd({ type: 'meetings', projectId: item.id })}
                                            showForm={quickAdd?.type === 'meetings' && quickAdd?.projectId === item.id}
                                            onCloseForm={() => setQuickAdd(null)}
                                            onSave={(data) => onSaveItem('meetings', { ...data, projectId: item.id })}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const LinkedSection = ({ title, items, icon: Icon, color, onAdd, showForm, onCloseForm, onSave }) => {
    const [inputValue, setInputValue] = useState('');
    const [saving, setSaving] = useState(false);

    const handleQuickSubmit = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        setSaving(true);
        try {
            const newItem = {
                id: Date.now().toString(),
                title: inputValue, // for activities/docs
                topic: inputValue, // for meetings
                date: new Date().toISOString().split('T')[0],
                notes: 'Created from project view.',
                content: ''
            };
            await onSave(newItem);
            setInputValue('');
            onCloseForm();
        } catch (err) {
            alert('Error adding item: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-bg-secondary rounded-2xl border border-border-dim p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Icon size={16} className={color} />
                    <h5 className="text-[10px] font-black text-text-primary uppercase tracking-widest">{title}</h5>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold bg-bg-primary px-2 py-0.5 rounded border border-border-dim text-text-secondary">{items.length}</span>
                    <button
                        onClick={onAdd}
                        className="p-1 hover:bg-bg-primary rounded-md text-text-secondary hover:text-workday-blue transition-all"
                    >
                        <Plus size={14} />
                    </button>
                </div>
            </div>

            {showForm && (
                <form onSubmit={handleQuickSubmit} className="mb-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="relative">
                        <input
                            autoFocus
                            placeholder="Enter title..."
                            className="w-full p-3 pr-20 bg-bg-primary border border-border-dim rounded-xl text-xs font-bold text-text-primary outline-none focus:ring-2 focus:ring-workday-blue"
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                            <button type="button" onClick={onCloseForm} className="p-1 text-text-secondary hover:text-red-500"><X size={14} /></button>
                            <button type="submit" disabled={saving} className="p-1 text-workday-blue hover:text-workday-lightBlue disabled:opacity-50">
                                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                            </button>
                        </div>
                    </div>
                </form>
            )}

            <div className="space-y-3 flex-1 max-h-[300px] overflow-y-auto pr-1 text-text-primary">
                {items.length > 0 ? items.map(i => (
                    <div key={i.id} className="p-3 bg-bg-primary/50 rounded-xl border border-border-dim text-xs font-bold line-clamp-1 group hover:border-workday-blue transition-colors flex items-center justify-between">
                        <span className="truncate">{i.title || i.topic}</span>
                        {i.dueDate && <span className="text-[9px] text-text-secondary ml-2 whitespace-nowrap">{i.dueDate}</span>}
                    </div>
                )) : (
                    <div className="h-20 flex items-center justify-center border border-dashed border-border-dim rounded-xl opacity-30 text-[10px] font-black uppercase tracking-widest">
                        No items linked
                    </div>
                )}
            </div>
        </div>
    );
};
