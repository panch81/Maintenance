import React, { useState, useRef, useEffect } from 'react';
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
import ReactMarkdown from 'react-markdown';

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

    // AI Search States
    const [searchVal, setSearchVal] = useState('');
    const [aiResponse, setAiResponse] = useState(null);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const scrollRef = useRef(null);

    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

    const handleAiAsk = async (query = searchVal) => {
        if (!query.trim() || !GEMINI_API_KEY) return;
        setIsAiLoading(true);
        setAiResponse(null);

        try {
            // 1. DYNAMIC DISCOVERY: Ask Google what models we actually have access to
            console.log("[AI] Discovering available models...");
            const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
            const listResponse = await fetch(listUrl);
            
            if (!listResponse.ok) {
                throw new Error("Failed to list models. Please check your API Key.");
            }

            const listData = await listResponse.json();
            
            // Filter models that support generating content
            const availableModels = listData.models
                .filter(m => m.supportedGenerationMethods.includes('generateContent'))
                .map(m => m.name);

            if (availableModels.length === 0) {
                throw new Error("No compatible Gemini models found in your account.");
            }

            // 2. GENERATE CONTENT with auto-retry on multiple models
            const systemPrompt = `You are the AI Search Assistant for the Workday Maintenance Hub. 
            Analyze the user's data: ${JSON.stringify(contextData)}
            
            Instructions:
            1. Answer precisely based on the data provided.
            2. If you find a relevant activity, doc, meeting, or project, format it as a link: [[link:TYPE:ID:TITLE]].
               - TYPE must be exactly: "activities", "docs", "meetings", or "projects".
            3. Use the user's language (Spanish/English). Be professional.`;

            // Sort models by priority (latest first)
            const sortedModels = availableModels.sort((a, b) => {
                const priority = (name) => {
                    if (name.includes('gemini-3.1')) return 10;
                    if (name.includes('gemini-3')) return 9;
                    if (name.includes('gemini-2.5')) return 8;
                    if (name.includes('gemini-1.5')) return 7;
                    return 0;
                };
                return priority(b) - priority(a);
            });

            console.log(`[AI] Sorted Models for attempt:`, sortedModels);

            let lastErrorMessage = "";
            for (const modelName of sortedModels) {
                try {
                    console.log(`[AI] Attempting with model: ${modelName}`);
                    const generateUrl = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
                    
                    const response = await fetch(generateUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{
                                role: 'user',
                                parts: [
                                    { text: "SYSTEM INSTRUCTIONS:\n" + systemPrompt },
                                    { text: "\n\nUSER QUERY:\n" + query }
                                ]
                            }]
                        })
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        const msg = errorData.error?.message || 'Error';
                        console.warn(`[AI] Model ${modelName} failed: ${msg}`);
                        lastErrorMessage = msg;
                        continue; // Try next model!
                    }

                    const result = await response.json();
                    const text = result.candidates[0].content.parts[0].text;
                    setAiResponse(text);
                    return; // EXIT loop on success!
                } catch (loopErr) {
                    console.error(`[AI] Exception in loop for ${modelName}:`, loopErr);
                    lastErrorMessage = loopErr.message;
                }
            }
            
            throw new Error(`All available models are busy or returned error: ${lastErrorMessage}`);
        } catch (err) {
            console.error("[AI] Final Error:", err.message);
            setAiResponse("⚠️ Hubo un problema con la IA: " + err.message + ". Asegúrate de que tu API Key es correcta y permite estos modelos.");
        } finally {
            setIsAiLoading(false);
        }
    };

    const parseLinks = (text) => {
        const regex = /\[\[link:(.*?):(.*?):(.*?)\]\]/g;
        const links = [];
        let match;
        while ((match = regex.exec(text)) !== null) {
            links.push({ type: match[1], id: match[2], title: match[3] });
        }
        return links;
    };

    const cleanText = (text) => {
        return text.replace(/\[\[link:.*?:.*?:.*?\]\]/g, '');
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

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative overflow-hidden transition-colors duration-300">
                {/* Header / Search */}
                <header className="h-20 bg-bg-secondary border-b border-border-dim flex items-center px-8 justify-between z-40 shadow-sm">
                    <div className="flex-1 max-w-2xl relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
                        <input
                            type="text"
                            placeholder="Search or ask AI (ends with ?)..."
                            className="w-full pl-12 pr-12 py-3 bg-bg-primary border-2 border-transparent rounded-2xl text-sm font-bold text-text-primary focus:ring-2 focus:ring-workday-blue focus:border-workday-blue/20 focus:bg-bg-secondary transition-all outline-none"
                            value={searchVal}
                            onChange={(e) => {
                                setSearchVal(e.target.value);
                                onSearch(e.target.value);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    if (searchVal.includes('?') || searchVal.length > 20) {
                                        handleAiAsk();
                                    }
                                }
                            }}
                        />
                        <button
                            onClick={() => handleAiAsk()}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-workday-blue hover:bg-bg-secondary rounded-xl transition-all group"
                            title="Ask AI"
                        >
                            {isAiLoading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} className="group-hover:scale-110" />}
                        </button>
                    </div>
                </header>

                {/* AI Response Overlay */}
                {(aiResponse || isAiLoading) && (
                    <div className="absolute top-24 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 animate-in slide-in-from-top-4 duration-500">
                        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border-2 border-workday-blue/30 mx-4">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center space-x-3 text-workday-blue">
                                    <Bot size={24} />
                                    <h4 className="font-black uppercase tracking-widest text-xs">AI Insight</h4>
                                </div>
                                <button onClick={() => setAiResponse(null)} className="p-2 hover:bg-bg-secondary rounded-full transition-all">
                                    <X size={20} className="text-text-secondary" />
                                </button>
                            </div>

                            {isAiLoading ? (
                                <div className="flex flex-col items-center py-10 space-y-4">
                                    <Loader2 className="animate-spin text-workday-blue" size={40} />
                                    <p className="text-xs font-black uppercase tracking-widest text-text-secondary animate-pulse text-center">Reading Documents &<br />Generating Analysis...</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="prose prose-sm dark:prose-invert max-w-none text-text-primary font-medium leading-relaxed">
                                        <ReactMarkdown>{cleanText(aiResponse)}</ReactMarkdown>
                                    </div>

                                    {parseLinks(aiResponse).length > 0 && (
                                        <div className="pt-6 border-t border-border-dim flex flex-wrap gap-3">
                                            {parseLinks(aiResponse).map((link, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => {
                                                        const itemTitle = link.title;
                                                        setTab(link.type);
                                                        setSearchVal(itemTitle);
                                                        onSearch(itemTitle);
                                                        setAiResponse(null);
                                                    }}
                                                    className="flex items-center space-x-2 px-4 py-2 bg-bg-primary border border-border-dim hover:border-workday-blue rounded-xl text-[10px] font-black uppercase tracking-widest text-workday-blue transition-all active:scale-95"
                                                >
                                                    <ArrowRight size={14} />
                                                    <span>View {link.title}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Dynamic Content */}
                <div className="flex-1 overflow-y-auto p-8 relative scrollbar-hide">
                    {children}
                </div>
            </main>
        </div>
    );
};
