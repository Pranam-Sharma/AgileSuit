'use client';

import * as React from 'react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    PanelRightClose,
    PanelRightOpen,
    Layers,
    UserCircle,
    Clock,
    AlertTriangle,
    CheckCircle2,
    Target,
    Zap,
    History,
    Smartphone,
    Globe,
    Server,
    Laptop,
    Tag,
    ChevronDown,
    ChevronRight,
    Users,
    Download,
    RefreshCw,
    Settings,
    Sparkles,
    Search,
    Activity
} from 'lucide-react';
import type { Platform } from '@/backend/actions/platforms.actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { motion, AnimatePresence } from 'framer-motion';

interface Story {
    id: string;
    story_code?: string;
    team_id?: string;
    platform_id?: string;
    title: string;
    description: string;
    storyPoints?: number;
    completedStoryPoints?: number;
    assignee?: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status?: 'todo' | 'in_progress' | 'in_review' | 'done' | 'blocked';
    tags?: string[];
    due_date?: string;
    updated_at?: string;
}

interface Column {
    id: string;
    title: string;
    stories: Story[];
}

interface ExecutionSidebarProps {
    columns: Column[];
    teams: any[];
    platforms: Platform[];
    orgMembers: any[];
    user: any;

    isSidebarExpanded: boolean;
    setIsSidebarExpanded: (v: boolean) => void;

    showCompletedStories: boolean;
    setShowCompletedStories: (v: boolean) => void;

    filterPriority: string[];
    setFilterPriority: (v: string[]) => void;

    sortBy: string;
    setSortBy: (v: string) => void;

    filterPlatforms: string[];
    setFilterPlatforms: (v: string[]) => void;

    filterAssignee: string;
    setFilterAssignee: (v: string) => void;

    activeQuickView: string;
    setActiveQuickView: (v: string) => void;

    onExportData: () => void;
    onRefreshBoard: () => void;
}

// Helper to check if it's within current week
const isThisWeek = (dateString?: string) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return date >= today && date <= nextWeek;
};

// Helper for overdue
const isOverdue = (dateString?: string) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
};

const SectionHeader = ({ title, defaultOpen = false, children }: { title: string, defaultOpen?: boolean, children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);
    return (
        <div className="mb-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full group px-2 py-1.5 rounded-md hover:bg-[#3a302a]/5 transition-colors"
            >
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#3a302a]/60 group-hover:text-[#3a302a] transition-colors">
                    {title}
                </span>
                <motion.div
                    initial={false}
                    animate={{ rotate: isOpen ? 0 : -90 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown className="h-3.5 w-3.5 text-[#3a302a]/40 group-hover:text-[#3a302a]/70 transition-colors" />
                </motion.div>
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="mt-1.5 space-y-0.5 bg-[#3a302a]/[0.02] p-1.5 rounded-lg border border-[#3a302a]/[0.03]">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export function ExecutionSidebar({
    columns,
    teams,
    platforms,
    orgMembers,
    user,
    isSidebarExpanded,
    setIsSidebarExpanded,
    showCompletedStories,
    setShowCompletedStories,
    filterPriority,
    setFilterPriority,
    sortBy,
    setSortBy,
    filterPlatforms,
    setFilterPlatforms,
    filterAssignee,
    setFilterAssignee,
    activeQuickView,
    setActiveQuickView,
    onExportData,
    onRefreshBoard
}: ExecutionSidebarProps) {

    const [activeSavedView, setActiveSavedView] = React.useState<string>('');

    const allStories = columns.flatMap(c => c.stories);

    // Derived counts for Quick Views
    const myWorkCount = allStories.filter(s => s.assignee === user?.displayName || s.assignee === user?.email).length;
    const dueSoonCount = allStories.filter(s => isThisWeek(s.due_date)).length;
    const unassignedCount = allStories.filter(s => !s.assignee).length;
    const completedCount = columns.find(c => c.id === 'done')?.stories.length || 0;
    const highPriorityCount = allStories.filter(s => s.priority === 'high' || s.priority === 'critical').length;
    
    // New Quick Views counts
    const recentlyUpdatedCount = allStories.filter(s => {
        if (!s.updated_at) return false;
        const updatedDate = new Date(s.updated_at);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return updatedDate >= yesterday;
    }).length;
    const techDebtCount = allStories.filter(s => s.tags?.some(t => t.toLowerCase().includes('debt'))).length;
    const carryForwardCount = allStories.filter(s => s.tags?.some(t => t.toLowerCase().includes('carry'))).length;

    // Signals counts
    const unestimatedCount = allStories.filter(s => !s.storyPoints).length;
    const overdueCount = allStories.filter(s => isOverdue(s.due_date)).length;
    const blockedCount = allStories.filter(s => s.status === 'blocked').length;
    const dependencyHeavyCount = allStories.filter(s => s.tags?.some(t => t.toLowerCase().includes('depend'))).length;

    const togglePriority = (p: string) => {
        setFilterPriority(filterPriority.includes(p) ? filterPriority.filter(x => x !== p) : [...filterPriority, p]);
    };

    const togglePlatform = (p: string) => {
        setFilterPlatforms(filterPlatforms.includes(p) ? filterPlatforms.filter(x => x !== p) : [...filterPlatforms, p]);
    };

    const getPlatformIcon = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('android') || n.includes('ios') || n.includes('mobile')) return <Smartphone className="h-3.5 w-3.5" />;
        if (n.includes('web') || n.includes('frontend')) return <Globe className="h-3.5 w-3.5" />;
        if (n.includes('backend') || n.includes('api') || n.includes('server')) return <Server className="h-3.5 w-3.5" />;
        return <Laptop className="h-3.5 w-3.5" />;
    };

    if (!isSidebarExpanded) {
        return (
            <aside className="w-16 border-r border-[#3a302a]/10 bg-[#faf5ee]/60 backdrop-blur-xl transition-all duration-300 flex flex-col items-center py-4 space-y-6 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => setIsSidebarExpanded(true)} className="h-8 w-8 text-[#3a302a]/60 hover:bg-[#3a302a]/5 hover:text-[#3a302a]">
                    <PanelRightOpen className="h-4 w-4" />
                </Button>
                <div className="flex flex-col gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setActiveQuickView('my-work')} className={cn("h-8 w-8 rounded-lg", activeQuickView === 'my-work' ? "bg-[#c2652a]/10 text-[#c2652a]" : "text-[#3a302a]/50 hover:bg-[#3a302a]/5 hover:text-[#3a302a]")}>
                        <UserCircle className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setActiveQuickView('due-soon')} className={cn("h-8 w-8 rounded-lg", activeQuickView === 'due-soon' ? "bg-[#c2652a]/10 text-[#c2652a]" : "text-[#3a302a]/50 hover:bg-[#3a302a]/5 hover:text-[#3a302a]")}>
                        <Clock className="h-4 w-4" />
                    </Button>
                </div>
            </aside>
        );
    }

    return (
        <aside className="w-[260px] border-r border-[#3a302a]/10 bg-[#faf5ee]/60 backdrop-blur-xl transition-all duration-300 flex flex-col h-full shrink-0">
            {/* Header */}
            <div className="flex items-center justify-between p-4 px-5 border-b border-[#3a302a]/5 sticky top-0 bg-[#faf5ee]/80 z-10 backdrop-blur-md">
                <h2 className="text-[11px] font-eb-garamond font-bold text-[#3a302a] uppercase tracking-widest">Execution Control</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsSidebarExpanded(false)} className="h-7 w-7 text-[#3a302a]/50 hover:text-[#3a302a] hover:bg-[#3a302a]/5 rounded-md">
                    <PanelRightClose className="h-3.5 w-3.5" />
                </Button>
            </div>

            <ScrollArea className="flex-1 px-3 py-4">
                
                {/* 1. Saved Views */}
                <SectionHeader title="Saved Views">
                    <div className="space-y-0.5">
                        {[
                            { id: 'android-sprint', label: 'Android Sprint', icon: Smartphone },
                            { id: 'backend-risks', label: 'Backend Risks', icon: Server },
                            { id: 'critical-issues', label: 'Critical Issues', icon: AlertTriangle },
                            { id: 'daily-standup', label: 'Daily Standup', icon: Users },
                        ].map(view => (
                            <button
                                key={view.id}
                                onClick={() => setActiveSavedView(activeSavedView === view.id ? '' : view.id)}
                                className={cn(
                                    "flex items-center justify-between w-full px-2.5 py-1.5 rounded-md text-sm transition-all duration-150 group",
                                    activeSavedView === view.id
                                        ? "bg-[#3a302a] text-white font-medium shadow-sm"
                                        : "text-[#3a302a]/70 hover:bg-[#3a302a]/5 hover:text-[#3a302a]"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <view.icon className={cn("h-3.5 w-3.5", activeSavedView === view.id ? "opacity-100" : "opacity-60 group-hover:opacity-100")} />
                                    <span>{view.label}</span>
                                </div>
                                <Tag className={cn("h-3 w-3", activeSavedView === view.id ? "opacity-50" : "opacity-0 group-hover:opacity-30")} />
                            </button>
                        ))}
                    </div>
                </SectionHeader>

                <div className="h-px bg-[#3a302a]/5 mx-2 my-4" />

                {/* 2. Quick Views */}
                <SectionHeader title="Quick Views">
                    {[
                        { id: 'all', label: 'All Stories', icon: Layers, count: allStories.length },
                        { id: 'my-work', label: 'My Work', icon: UserCircle, count: myWorkCount },
                        { id: 'recently-updated', label: 'Recently Updated', icon: History, count: recentlyUpdatedCount },
                        { id: 'due-soon', label: 'Due Soon', icon: Clock, count: dueSoonCount },
                        { id: 'unassigned', label: 'Unassigned', icon: Users, count: unassignedCount },
                        { id: 'high-priority', label: 'High Priority', icon: Target, count: highPriorityCount },
                        { id: 'tech-debt', label: 'Technical Debt', icon: AlertTriangle, count: techDebtCount },
                        { id: 'carry-forward', label: 'Carry Forward', icon: RefreshCw, count: carryForwardCount },
                    ].map(view => (
                        <button
                            key={view.id}
                            onClick={() => setActiveQuickView(activeQuickView === view.id ? 'all' : view.id)}
                            className={cn(
                                "flex items-center justify-between w-full px-2.5 py-1.5 rounded-md text-sm transition-all duration-150",
                                activeQuickView === view.id
                                    ? "bg-[#c2652a]/10 text-[#c2652a] font-semibold"
                                    : "text-[#3a302a]/70 hover:bg-[#3a302a]/5 hover:text-[#3a302a]"
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <view.icon className="h-3.5 w-3.5 opacity-70" />
                                <span>{view.label}</span>
                            </div>
                            {view.count > 0 && (
                                <Badge variant="secondary" className={cn(
                                    "px-1.5 py-0 min-w-[20px] text-center text-[10px] font-bold rounded-full h-4 leading-4 bg-transparent",
                                    activeQuickView === view.id ? "bg-[#c2652a]/20 text-[#c2652a]" : "bg-[#3a302a]/10 text-[#3a302a]/60"
                                )}>
                                    {view.count}
                                </Badge>
                            )}
                        </button>
                    ))}
                    <button
                        onClick={() => setShowCompletedStories(!showCompletedStories)}
                        className={cn(
                            "flex items-center justify-between w-full px-2.5 py-1.5 rounded-md text-sm transition-all duration-150 text-[#3a302a]/70 hover:bg-[#3a302a]/5 hover:text-[#3a302a]",
                            !showCompletedStories && "opacity-60"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 opacity-70" />
                            <span>Show Completed</span>
                        </div>
                    </button>
                </SectionHeader>

                <div className="h-px bg-[#3a302a]/5 mx-2 my-4" />

                {/* 3. Platform Filters */}
                {platforms.length > 0 && (
                    <SectionHeader title="Platforms">
                        <div className="space-y-1">
                            {platforms.map(platform => {
                                const isActive = filterPlatforms.includes(platform.id);
                                const count = allStories.filter(s => s.platform_id === platform.id).length;
                                return (
                                    <div
                                        key={platform.id}
                                        onClick={() => togglePlatform(platform.id)}
                                        className={cn(
                                            "flex items-center justify-between w-full px-2.5 py-1.5 rounded-md text-sm transition-all duration-150 group cursor-pointer",
                                            isActive
                                                ? "bg-white border-[#3a302a]/10 shadow-sm"
                                                : "text-[#3a302a]/70 hover:bg-[#3a302a]/5 hover:text-[#3a302a]"
                                        )}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <Checkbox 
                                                checked={isActive}
                                                className={cn(
                                                    "h-3.5 w-3.5 rounded-sm border-[#3a302a]/20",
                                                    isActive && "data-[state=checked]:bg-[#c2652a] data-[state=checked]:border-[#c2652a]"
                                                )}
                                                onCheckedChange={(checked) => {
                                                    // Toggle already handled by div onClick, but stop propagation if needed or just let it bubble
                                                    // Actually, Checkbox onCheckedChange is better for accessibility. 
                                                    // But since we want the whole row clickable, we handle it on div.
                                                }}
                                            />
                                            <div className="flex items-center gap-1.5">
                                                <div className={cn("text-[#3a302a]/50 group-hover:text-[#3a302a]/70", isActive && "text-[#c2652a]")}>
                                                    {getPlatformIcon(platform.name)}
                                                </div>
                                                <span className={cn(isActive && "font-medium text-[#3a302a]")}>{platform.name}</span>
                                            </div>
                                        </div>
                                        {count > 0 && (
                                            <span className={cn("text-[10px] font-medium", isActive ? "text-[#c2652a]" : "text-[#3a302a]/40")}>
                                                {count}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </SectionHeader>
                )}

                {(platforms.length > 0) && <div className="h-px bg-[#3a302a]/5 mx-2 my-4" />}

                {/* 4. Priority Filters */}
                <SectionHeader title="Priority">
                    <div className="grid grid-cols-2 gap-1 px-1">
                        {[
                            { id: 'critical', label: 'Critical', color: 'bg-red-500', count: allStories.filter(s => s.priority === 'critical').length },
                            { id: 'high', label: 'High', color: 'bg-orange-500', count: allStories.filter(s => s.priority === 'high').length },
                            { id: 'medium', label: 'Medium', color: 'bg-amber-500', count: allStories.filter(s => s.priority === 'medium').length },
                            { id: 'low', label: 'Low', color: 'bg-emerald-500', count: allStories.filter(s => s.priority === 'low').length },
                        ].map(priority => {
                            const isActive = filterPriority.includes(priority.id);
                            return (
                                <button
                                    key={priority.id}
                                    onClick={() => togglePriority(priority.id)}
                                    className={cn(
                                        "flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-xs transition-all border",
                                        isActive
                                            ? "bg-white border-[#3a302a]/20 shadow-sm text-[#3a302a] font-medium"
                                            : "border-transparent text-[#3a302a]/60 hover:bg-[#3a302a]/5 hover:text-[#3a302a]"
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={cn("h-1.5 w-1.5 rounded-full", priority.color)} />
                                        {priority.label}
                                    </div>
                                    {priority.count > 0 && <span className="opacity-40 text-[9px]">{priority.count}</span>}
                                </button>
                            );
                        })}
                    </div>
                </SectionHeader>

                <div className="h-px bg-[#3a302a]/5 mx-2 my-4" />

                {/* 5. Ownership Filters */}
                <SectionHeader title="Ownership">
                    <div className="px-2 space-y-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#3a302a]/40" />
                            <select
                                className="w-full h-8 pl-8 pr-3 text-xs bg-white border border-[#3a302a]/10 rounded-md focus:outline-none focus:ring-1 focus:ring-[#c2652a] text-[#3a302a] appearance-none"
                                value={filterAssignee}
                                onChange={(e) => setFilterAssignee(e.target.value)}
                            >
                                <option value="">Any Assignee</option>
                                <option value="unassigned">Unassigned</option>
                                {orgMembers.map(member => (
                                    <option key={member.id} value={member.display_name || member.email}>
                                        {member.display_name || member.email}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </SectionHeader>

                <div className="h-px bg-[#3a302a]/5 mx-2 my-4" />

                {/* 6. Execution Signals */}
                <SectionHeader title="Execution Signals">
                    <div className="flex flex-col gap-1.5 px-1">
                        <button 
                            onClick={() => setActiveQuickView(activeQuickView === 'unestimated' ? 'all' : 'unestimated')}
                            className={cn(
                                "flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-medium transition-colors border",
                                activeQuickView === 'unestimated' ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-white border-[#3a302a]/10 text-[#3a302a]/60 hover:border-[#3a302a]/30"
                            )}
                        >
                            <div className="flex items-center gap-1.5">
                                <AlertTriangle className="h-3.5 w-3.5" />
                                Missing Estimation
                            </div>
                            {unestimatedCount > 0 && <span className={cn("px-1.5 rounded-full bg-black/5 text-[9px]", activeQuickView === 'unestimated' && "bg-amber-100")}>{unestimatedCount}</span>}
                        </button>
                        <button 
                            onClick={() => setActiveQuickView(activeQuickView === 'overdue' ? 'all' : 'overdue')}
                            className={cn(
                                "flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-medium transition-colors border",
                                activeQuickView === 'overdue' ? "bg-red-50 border-red-200 text-red-700" : "bg-white border-[#3a302a]/10 text-[#3a302a]/60 hover:border-[#3a302a]/30"
                            )}
                        >
                            <div className="flex items-center gap-1.5">
                                <History className="h-3.5 w-3.5" />
                                Overdue
                            </div>
                            {overdueCount > 0 && <span className={cn("px-1.5 rounded-full bg-black/5 text-[9px]", activeQuickView === 'overdue' && "bg-red-100")}>{overdueCount}</span>}
                        </button>
                        <button 
                            onClick={() => setActiveQuickView(activeQuickView === 'blocked' ? 'all' : 'blocked')}
                            className={cn(
                                "flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-medium transition-colors border",
                                activeQuickView === 'blocked' ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-white border-[#3a302a]/10 text-[#3a302a]/60 hover:border-[#3a302a]/30"
                            )}
                        >
                            <div className="flex items-center gap-1.5">
                                <Zap className="h-3.5 w-3.5" />
                                Blocked Tasks
                            </div>
                            {blockedCount > 0 && <span className={cn("px-1.5 rounded-full bg-black/5 text-[9px]", activeQuickView === 'blocked' && "bg-rose-100")}>{blockedCount}</span>}
                        </button>
                        <button 
                            onClick={() => setActiveQuickView(activeQuickView === 'dependency-heavy' ? 'all' : 'dependency-heavy')}
                            className={cn(
                                "flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-medium transition-colors border",
                                activeQuickView === 'dependency-heavy' ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-[#3a302a]/10 text-[#3a302a]/60 hover:border-[#3a302a]/30"
                            )}
                        >
                            <div className="flex items-center gap-1.5">
                                <Layers className="h-3.5 w-3.5" />
                                Dependency Heavy
                            </div>
                            {dependencyHeavyCount > 0 && <span className={cn("px-1.5 rounded-full bg-black/5 text-[9px]", activeQuickView === 'dependency-heavy' && "bg-indigo-100")}>{dependencyHeavyCount}</span>}
                        </button>
                    </div>
                </SectionHeader>

                <div className="h-px bg-[#3a302a]/5 mx-2 my-4" />

                {/* 7. Execution Intelligence */}
                <SectionHeader title="Execution Intelligence" defaultOpen={false}>
                    <div className="px-1.5 space-y-1.5">
                        <div className="group relative flex flex-col gap-1 px-2.5 py-2 rounded-md text-sm bg-gradient-to-br from-white to-[#faf5ee] border border-[#3a302a]/10 shadow-sm cursor-not-allowed overflow-hidden">
                            <div className="absolute top-0 right-0 p-1.5 opacity-20 group-hover:opacity-40 transition-opacity">
                                <Sparkles className="h-4 w-4 text-[#c2652a]" />
                            </div>
                            <div className="flex items-center gap-1.5 text-[#3a302a] font-medium text-xs">
                                <Activity className="h-3.5 w-3.5 text-rose-500" />
                                Bottleneck Detected
                            </div>
                            <span className="text-[10px] text-[#3a302a]/60 leading-tight">Backend review queue is 3x higher than normal.</span>
                        </div>
                        <div className="group relative flex flex-col gap-1 px-2.5 py-2 rounded-md text-sm bg-gradient-to-br from-white to-[#faf5ee] border border-[#3a302a]/10 shadow-sm cursor-not-allowed overflow-hidden">
                            <div className="absolute top-0 right-0 p-1.5 opacity-20 group-hover:opacity-40 transition-opacity">
                                <Sparkles className="h-4 w-4 text-[#c2652a]" />
                            </div>
                            <div className="flex items-center gap-1.5 text-[#3a302a] font-medium text-xs">
                                <Target className="h-3.5 w-3.5 text-amber-500" />
                                Scope Expansion Risk
                            </div>
                            <span className="text-[10px] text-[#3a302a]/60 leading-tight">3 stories added after sprint start.</span>
                        </div>
                    </div>
                </SectionHeader>

                <div className="h-px bg-[#3a302a]/5 mx-2 my-4" />

                {/* 8. Smart Scrum Mode */}
                <SectionHeader title="Smart Scrum Mode" defaultOpen={false}>
                    <div className="px-2 space-y-1">
                        <div className="group relative flex items-center justify-between px-2.5 py-1.5 rounded-md text-sm text-[#3a302a]/40 bg-[#3a302a]/[0.02] border border-[#3a302a]/[0.05] cursor-not-allowed">
                            <div className="flex items-center gap-2">
                                <UserCircle className="h-3.5 w-3.5 opacity-50" />
                                <span className="text-xs">My Blockers</span>
                            </div>
                            <span className="text-[9px] uppercase tracking-wider text-[#c2652a] font-bold opacity-0 group-hover:opacity-100 transition-opacity">Beta</span>
                        </div>
                        <div className="group relative flex items-center justify-between px-2.5 py-1.5 rounded-md text-sm text-[#3a302a]/40 bg-[#3a302a]/[0.02] border border-[#3a302a]/[0.05] cursor-not-allowed">
                            <div className="flex items-center gap-2">
                                <History className="h-3.5 w-3.5 opacity-50" />
                                <span className="text-xs">Updated Yesterday</span>
                            </div>
                            <span className="text-[9px] uppercase tracking-wider text-[#c2652a] font-bold opacity-0 group-hover:opacity-100 transition-opacity">Beta</span>
                        </div>
                    </div>
                </SectionHeader>

                <div className="h-px bg-[#3a302a]/5 mx-2 my-4" />

                {/* 9. Sorting */}
                <SectionHeader title="Sorting">
                    <div className="px-2">
                        <select
                            className="w-full h-8 px-2 text-xs bg-white border border-[#3a302a]/10 rounded-md focus:outline-none focus:ring-1 focus:ring-[#c2652a] text-[#3a302a]"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="none">Manual Order</option>
                            <option value="priority">Priority (Highest first)</option>
                            <option value="points">Story Points (Highest first)</option>
                            <option value="assignee">Assignee</option>
                            <option value="newest">Newest Created</option>
                        </select>
                    </div>
                </SectionHeader>

            </ScrollArea>

            {/* 8. Utility Actions Footer */}
            <div className="p-3 border-t border-[#3a302a]/10 bg-[#faf5ee]/80 backdrop-blur-md">
                <div className="flex items-center justify-between gap-1">
                    <Button variant="ghost" size="sm" onClick={onExportData} className="flex-1 h-8 text-[11px] text-[#3a302a]/60 hover:bg-[#3a302a]/5 hover:text-[#3a302a]">
                        <Download className="h-3.5 w-3.5 mr-1.5" /> Export
                    </Button>
                    <div className="w-px h-4 bg-[#3a302a]/10 mx-1" />
                    <Button variant="ghost" size="sm" onClick={onRefreshBoard} className="flex-1 h-8 text-[11px] text-[#3a302a]/60 hover:bg-[#3a302a]/5 hover:text-[#3a302a]">
                        <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh
                    </Button>
                    <div className="w-px h-4 bg-[#3a302a]/10 mx-1" />
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-[#3a302a]/60 hover:bg-[#3a302a]/5 hover:text-[#3a302a]">
                        <Settings className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>
        </aside>
    );
}
