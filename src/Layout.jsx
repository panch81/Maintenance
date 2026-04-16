import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    LayoutDashboard,
    Activity,
    FileText,
    Users,
    Search,
    MessageSquare,
    LogOut,
    ChevronRight,
    Menu,
    X,
    Moon,
    Sun,
    Settings as SettingsIcon,
    Calendar as CalendarIcon,
    Briefcase,
    Sparkles,
    Loader2,
    ArrowRight,
    Bot,
    Sparkle,
    Trash2,
    CheckSquare,
    Settings,
    Bell,
    User,
    ShieldCheck,
    Mail
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${active
            ? 'bg-workday-blue text-white shadow-md'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
    >
        <Icon size={20} />
        <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">{label}</span>
        {active && <ChevronRight size={16} className="ml-auto flex-shrink-0" />}
    </button>
);

export const Layout = ({ children, currentTab, setTab, onSearch, showAdminTab, contextData }) => {
    const { logout, user } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    // Search States
    const [searchVal, setSearchVal] = useState('');
    const [localResults, setLocalResults] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [boxHeight, setBoxHeight] = useState(400); // Default height
    const handleLocalSearch = useCallback((query = searchVal) => {
        if (!query.trim()) {
            setLocalResults(null);
            onSearch('');
            return;
        }

        setIsSearching(true);
        onSearch(query); // Filters the modules below

        const results = [];
        const q = query.toLowerCase();

        // Deep search across all context data
        if (contextData) {
            Object.keys(contextData).forEach(type => {
                if (Array.isArray(contextData[type]) && type !== 'trash' && type !== 'settings') {
                    contextData[type].forEach(item => {
                        const contentToSearch = [
                            item.title,
                            item.topic,
                            item.content,
                            item.notes,
                            item.description,
                            item.snippet,
                            item.category,
                            item.tags?.join(' ')
                        ].filter(Boolean).join(' ').toLowerCase();

                        if (contentToSearch.includes(q)) {
                            results.push({
                                type: type === 'documentation' ? 'docs' : type,
                                id: item.id,
                                title: item.title || item.topic || 'Untitled',
                                snippet: item.content || item.notes || item.description || ''
                            });
                        }
                    });
                }
            });
        }

        setLocalResults(results);
        setIsSearching(false);
    }, [searchVal, contextData, onSearch]);

    // Resize Logic
    const resizerData = useRef({ startY: 0, startHeight: 0 });
    
    const stopResizing = useCallback(() => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', stopResizing);
    }, [handleMouseMove]);

    const handleMouseMove = useCallback((e) => {
        const delta = e.clientY - resizerData.current.startY;
        const newHeight = resizerData.current.startHeight + delta;
        if (newHeight > 200 && newHeight < 900) {
            setBoxHeight(newHeight);
        }
    }, []);

    const startResizing = useCallback((e) => {
        resizerData.current = {
            startY: e.clientY,
            startHeight: boxHeight
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', stopResizing);
    }, [boxHeight, handleMouseMove, stopResizing]);

    const cleanSnippet = (text) => {
        if (!text) return '';
        // Remove markdown or html simple tags if any
        return text.replace(/[#*`]/g, '').slice(0, 150) + (text.length > 150 ? '...' : '');
    };

    return (
        <div className="flex h-screen bg-bg-primary text-text-primary overflow-hidden font-sans transition-colors duration-300">
            {/* Sidebar */}
            <aside
                className={`${isSidebarOpen ? 'w-64' : 'w-20'
                    } bg-bg-secondary border-r border-border-dim flex flex-col transition-all duration-300 ease-in-out`}
            >
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-2 overflow-hidden">
                        <div className="w-8 h-8 bg-workday-blue rounded-md flex-shrink-0 flex items-center justify-center">
                            <span className="text-white font-bold text-xs uppercase">W</span>
                        </div>
                        {isSidebarOpen && (
                            <h1 className="font-bold text-xl text-workday-blue whitespace-nowrap dark:text-sky-400">Service Hub</h1>
                        )}
                    </div>
                    <button
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md text-gray-500"
                    >
                        {isSidebarOpen ? <ChevronRight className="rotate-180" size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto overflow-x-hidden">
                    <SidebarItem icon={LayoutDashboard} label={isSidebarOpen ? "Dashboard" : ""} active={currentTab === 'dashboard'} onClick={() => setTab('dashboard')} />
                    <SidebarItem icon={Activity} label={isSidebarOpen ? "Activities" : ""} active={currentTab === 'activities'} onClick={() => setTab('activities')} />
                    <SidebarItem icon={FileText} label={isSidebarOpen ? "Documentation" : ""} active={currentTab === 'docs'} onClick={() => setTab('docs')} />
                    <SidebarItem icon={Users} label={isSidebarOpen ? "Meetings" : ""} active={currentTab === 'meetings'} onClick={() => setTab('meetings')} />
                    <SidebarItem icon={Briefcase} label={isSidebarOpen ? "Projects" : ""} active={currentTab === 'projects'} onClick={() => setTab('projects')} />
                    <SidebarItem icon={CalendarIcon} label={isSidebarOpen ? "Calendar" : ""} active={currentTab === 'calendar'} onClick={() => setTab('calendar')} />
                    <SidebarItem icon={Trash2} label={isSidebarOpen ? "Recycle Bin" : ""} active={currentTab === 'trash'} onClick={() => setTab('trash')} />
                    {showAdminTab && (
                        <div className="pt-4 mt-4 border-t border-gray-100 dark:border-slate-800">
                            <SidebarItem icon={SettingsIcon} label={isSidebarOpen ? "Admin Console" : ""} active={currentTab === 'admin'} onClick={() => setTab('admin')} />
                        </div>
                    )}
                </nav>

                <div className="p-4 border-t border-border-dim space-y-4">
                    <button onClick={toggleTheme} className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-text-secondary hover:bg-bg-primary transition-colors">
                        {isDark ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-blue-600" />}
                        {isSidebarOpen && <span className="text-sm font-bold uppercase tracking-widest">{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
                    </button>

                    <div className="flex items-center space-x-3 px-2 py-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-sky-900/30 flex items-center justify-center text-workday-blue border border-blue-200 dark:border-sky-800 font-bold text-xs flex-shrink-0">
                            {user?.name?.[0] || 'U'}
                        </div>
                        {isSidebarOpen && (
                            <div className="flex-1 overflow-hidden font-bold">
                                <p className="text-sm text-gray-900 dark:text-white truncate">{user?.name}</p>
                                <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
                            </div>
                        )}
                        <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex-shrink-0">
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative overflow-hidden transition-colors duration-300">
                {/* Minimalist Header */}
                <header className="h-20 bg-bg-secondary border-b border-border-dim flex items-center px-8 justify-between z-40 shadow-sm">
                    <div className="flex items-center space-x-4">
                        <button 
                            onClick={() => setSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-bg-primary rounded-xl transition-colors text-text-secondary"
                        >
                            <Menu size={20} />
                        </button>
                        <h1 className="text-xl font-black text-workday-blue tracking-tighter italic">HUB</h1>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 relative scrollbar-hide">
                    {/* New "Mañana"-style Search Box */}
                    <div className="mb-10 max-w-3xl mx-auto">
                        <div className="bg-bg-secondary p-5 rounded-[2rem] shadow-xl border border-border-dim group focus-within:border-workday-blue transition-all duration-300">
                            <div className="flex items-center space-x-4">
                                <Search className="text-text-secondary group-focus-within:text-workday-blue transition-colors" size={22} />
                                <input
                                    type="text"
                                    placeholder="Buscar por contenido (pulsa Enter)..."
                                    className="flex-1 bg-transparent border-none outline-none text-text-primary placeholder:text-text-secondary/50 font-medium text-lg"
                                    value={searchVal}
                                    onChange={(e) => setSearchVal(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleLocalSearch();
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => handleLocalSearch()}
                                    disabled={isSearching || !searchVal.trim()}
                                    className="p-2.5 bg-gradient-to-r from-workday-blue to-workday-dark-blue text-white rounded-2xl shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100"
                                >
                                    {isSearching ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Local Search Results Box (Integrated & Resizable) */}
                    {(localResults !== null || isSearching) && (
                        <div className="mb-12 max-w-3xl mx-auto animate-in slide-in-from-top-4 duration-500 relative">
                            <div 
                                className="bg-bg-secondary border-2 border-workday-blue/20 rounded-[2rem] shadow-2xl overflow-hidden relative flex flex-col"
                                style={{ height: `${boxHeight}px` }}
                            >
                                <div className="p-8 pb-4 flex justify-between items-center bg-bg-secondary/80 backdrop-blur-sm sticky top-0 z-10">
                                    <div className="flex items-center space-x-3 text-workday-blue">
                                        <Search size={20} />
                                        <h4 className="font-black uppercase tracking-widest text-xs">Resultados de Búsqueda</h4>
                                    </div>
                                    <button onClick={() => setLocalResults(null)} className="p-2 hover:bg-bg-primary rounded-full transition-all">
                                        <X size={20} className="text-text-secondary" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto px-8 pb-8 scrollbar-hide">
                                    {isSearching ? (
                                        <div className="flex flex-col items-center py-20 space-y-4">
                                            <Loader2 className="animate-spin text-workday-blue" size={40} />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary animate-pulse">Escaneando contenido...</p>
                                        </div>
                                    ) : localResults.length === 0 ? (
                                        <div className="py-20 text-center">
                                            <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                                <Search size={30} />
                                            </div>
                                            <p className="text-text-secondary font-medium">No se encontraron coincidencias para "{searchVal}"</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="border-b border-border-dim">
                                                        <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-text-secondary">Tipo</th>
                                                        <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-text-secondary">Título / Tema</th>
                                                        <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-text-secondary">Vista Previa</th>
                                                        <th className="py-3 px-4"></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {localResults.map((item, idx) => (
                                                        <tr 
                                                            key={idx} 
                                                            onClick={() => setTab(item.type)}
                                                            className="border-b border-border-dim/50 hover:bg-workday-blue/5 transition-colors cursor-pointer group"
                                                        >
                                                            <td className="py-4 px-4">
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-workday-blue bg-workday-blue/10 px-2 py-1 rounded-md">
                                                                    {item.type}
                                                                </span>
                                                            </td>
                                                            <td className="py-4 px-4">
                                                                <div className="font-bold text-text-primary text-sm line-clamp-1 group-hover:text-workday-blue transition-colors">
                                                                    {item.title}
                                                                </div>
                                                            </td>
                                                            <td className="py-4 px-4 max-w-xs">
                                                                <div className="text-xs text-text-secondary line-clamp-1 italic">
                                                                    {cleanSnippet(item.snippet)}
                                                                </div>
                                                            </td>
                                                            <td className="py-4 px-4 text-right">
                                                                <ArrowRight size={16} className="text-text-secondary group-hover:text-workday-blue group-hover:translate-x-1 transition-all inline" />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>

                                {/* Resize Handle */}
                                <div 
                                    onMouseDown={startResizing}
                                    className="h-2 w-full cursor-ns-resize hover:bg-workday-blue/20 transition-colors flex items-center justify-center group"
                                >
                                    <div className="w-12 h-1 bg-border-dim rounded-full group-hover:bg-workday-blue/50 transition-colors" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Dynamic Modules (Activities, Docs, etc) */}
                    <div className="pb-20">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};
