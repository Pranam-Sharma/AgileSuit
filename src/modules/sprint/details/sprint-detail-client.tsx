'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
    MoreHorizontal, Search, Bell, ChevronRight, Plus, Lock, RotateCcw,
    Layout, ListTodo, Calendar, FileText, Settings, AlertCircle, Clock,
    CheckCircle2, TrendingUp, Play, MessageSquare
} from 'lucide-react';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { createClient } from '@/auth/supabase/client';
import { Logo } from '@/components/layout/logo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/utils/cn';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import type { Sprint } from '@/modules/dashboard/create-sprint-dialog';
import { EditSprintDialog } from '@/modules/dashboard/edit-sprint-dialog';

// ── Mock Data ──────────────────────────────────────────────

const MOCK_BURNDOWN = [
    { day: 'Jan 16', ideal: 15, actual: 15 },
    { day: 'Jan 19', ideal: 12, actual: 14 },
    { day: 'Jan 22', ideal: 8, actual: 10 },
    { day: 'Jan 25', ideal: 4, actual: 6 },
    { day: 'Jan 29', ideal: 0, actual: 5 },
];

const MOCK_ANALYTICS = [
    { day: 'Jan 16', value: 5 },
    { day: 'Jan 19', value: 10 },
    { day: 'Jan 22', value: 15 },
    { day: 'Jan 25', value: 12 },
    { day: 'Jan 29', value: 20 },
];

const MOCK_BLOCKERS = [
    {
        id: 1,
        reason: 'Handle API throttling issues in new environment',
        subtext: 'Pending access to production environment',
        ownerName: 'Rahul Sharma',
        ownerInitials: 'RS',
        blockedSince: '2 days ago',
        initial: 'U',
    },
    {
        id: 2,
        reason: 'Payment Gateway sandbox credentials invalid',
        subtext: 'Awaiting new API keys from the finance team',
        ownerName: 'Mike Chen',
        ownerInitials: 'MC',
        blockedSince: '1 day ago',
        initial: 'P',
    },
];

const MOCK_VELOCITY = [
    { name: 'Surnt Sprint', sp: 7, color: '#1e293b' },
    { name: 'Previous', sp: 11, color: '#ef4444' },
    { name: 'Sprint', sp: 5, color: '#6366f1' },
];

const MOCK_FEED = [
    { time: '2 hours ago', text: '3 issues completed' },
    { time: 'Yesterday', text: 'Saad M started the sprint' },
    { time: '2 days ago', text: 'Backend API documentation updated' },
];

// ── Helpers ────────────────────────────────────────────────

type SprintDetailClientProps = {
    sprint?: Sprint & { id: string };
    sprintId: string;
};

function UserNav({ user }: { user: any }) {
    const router = useRouter();
    const supabase = createClient();
    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.replace('/login');
    };
    const initial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border-2 border-white shadow">
                        <AvatarImage src={user?.photoURL ?? ''} />
                        <AvatarFallback className="bg-slate-800 text-white font-semibold text-sm">{initial}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem onClick={handleSignOut}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// ── Main Component ─────────────────────────────────────────

export function SprintDetailClient({ sprint: initialSprint, sprintId }: SprintDetailClientProps) {
    const [user, setUser] = React.useState<any>(null);
    const router = useRouter();
    const { toast } = useToast();
    const supabase = createClient();
    const [sprint, setSprint] = React.useState<(Sprint & { id: string }) | undefined>(initialSprint);
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

    React.useEffect(() => {
        (async () => {
            const { data: { user: u } } = await supabase.auth.getUser();
            setUser(u);
        })();
    }, []);

    React.useEffect(() => {
        if (sprint || !sprintId) return;
        (async () => {
            try {
                const { data: s } = await supabase.from('sprints').select('*').eq('id', sprintId).single();
                if (s) {
                    setSprint({
                        id: s.id, sprintNumber: s.sprint_number, sprintName: s.name,
                        projectName: s.project_name, department: s.department, team: s.team,
                        facilitatorName: s.facilitator_name, plannedPoints: s.planned_points,
                        completedPoints: s.completed_points, startDate: s.start_date,
                        endDate: s.end_date, status: s.status || 'planning',
                        isFacilitator: false, userId: s.created_by,
                    } as any);
                }
            } catch (e) { console.error(e); }
        })();
    }, [sprintId, sprint]);

    const handleAction = async (action: 'start' | 'complete') => {
        if (!sprint) return;
        try {
            const { startSprintAction, completeSprintAction } = await import('@/backend/actions/sprints.actions');
            if (action === 'start') await startSprintAction(sprint.id);
            else await completeSprintAction(sprint.id);
            setSprint(p => p ? { ...p, status: action === 'start' ? 'active' : 'completed' } : p);
            toast({ title: `Sprint ${action === 'start' ? 'Started' : 'Completed'}` });
        } catch (e: any) {
            toast({ title: 'Error', description: e.message, variant: 'destructive' });
        }
    };

    if (!sprint) return <LoadingScreen message="Loading Sprint..." />;

    const total = sprint.plannedPoints || 15;
    const done = sprint.completedPoints || 8;
    const remaining = total - done;
    const pct = Math.round((done / total) * 100);

    /* ── Render ─────────────────────────────────────────────── */
    return (
        <div className="min-h-screen bg-[#f8f5f0]" style={{ fontFamily: "'Manrope', sans-serif" }}>

            {/* ╔══ TOP NAV BAR ══════════════════════════════════════╗ */}
            <header className="flex items-center justify-between px-8 py-3 bg-[#f8f5f0]/80 backdrop-blur-md sticky top-0 z-50 border-b border-[#3a302a]/10">
                <div className="flex items-center gap-3">
                    <Logo className="h-8 w-8" />
                    <span className="text-xl font-bold text-[#3a302a] tracking-tight" style={{ fontFamily: "'EB Garamond', serif" }}>AgileSuit</span>
                </div>
                <div className="flex items-center gap-5">
                    <div className="flex items-center gap-2 text-[#3a302a]/60 cursor-pointer hover:text-[#3a302a]">
                        <Search className="h-4 w-4" />
                        <span className="text-sm font-medium">Search</span>
                        <span className="text-xs opacity-50 ml-1">⌘</span>
                    </div>
                    <Bell className="h-5 w-5 text-[#3a302a]/60 cursor-pointer hover:text-[#3a302a]" />
                    <UserNav user={user} />
                </div>
            </header>

            <main className="px-8 pt-6 pb-10 max-w-[1500px] mx-auto">

                {/* ╔══ SPRINT HEADER CARD ═════════════════════════════╗ */}
                <div className="mb-6">
                    {/* Title row */}
                    <div className="flex items-start justify-between relative z-10 mb-6">
                        <div>
                            <div className="flex items-center gap-4 mb-1">
                                <h1 className="text-[32px] font-bold text-[#3a302a] leading-tight tracking-tight" style={{ fontFamily: "'EB Garamond', serif" }}>
                                    {sprint.sprintName}{sprint.projectName ? ` - ${sprint.projectName}` : ''}
                                </h1>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold bg-[#c2652a] text-white shadow-sm">
                                    {sprint.status === 'active' ? 'Active' : sprint.status?.charAt(0).toUpperCase() + sprint.status?.slice(1)}
                                </span>
                            </div>
                            <p className="text-[14px] text-[#3a302a]/50 font-medium ml-0.5 italic">
                                {sprint.startDate
                                    ? `${new Date(sprint.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${new Date(sprint.endDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} (14 days)`
                                    : 'Dates TBD'}
                            </p>
                        </div>

                        <div className="flex items-center gap-3 pt-1">
                            <button className="h-10 px-5 rounded-lg border border-[#3a302a]/10 bg-white text-[13px] font-bold text-[#3a302a] shadow-sm hover:bg-[#f8f5f0] transition-colors"
                                onClick={() => handleAction('complete')}>
                                Close Sprint
                            </button>
                            <button className="h-10 px-5 rounded-lg border border-[#3a302a]/10 bg-white text-[13px] font-bold text-[#3a302a] shadow-sm hover:bg-[#f8f5f0] transition-colors flex items-center gap-2">
                                <RotateCcw className="h-3.5 w-3.5" /> Reopen Sprint
                            </button>
                            <button className="h-10 px-5 rounded-lg bg-[#c2652a] text-white text-[13px] font-bold shadow-md hover:bg-[#a35423] transition-all flex items-center gap-1.5 active:scale-95">
                                <Lock className="h-3.5 w-3.5" /> Lock <ChevronRight className="h-3.5 w-3.5 opacity-60 ml-1" />
                            </button>
                        </div>
                    </div>

                    {/* Tags + Sprint Goal */}
                    <div className="flex items-center gap-6 bg-white/40 backdrop-blur-sm rounded-2xl shadow-sm border border-[#3a302a]/5 p-5 relative z-10">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#3a302a] text-white shadow-sm">
                                Azure
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#c2652a] text-white shadow-sm">
                                Backend
                            </span>
                        </div>
                        <p className="text-[15px] text-[#3a302a]/70 leading-relaxed">
                            <strong className="text-[#3a302a] font-bold" style={{ fontFamily: "'EB Garamond', serif", fontSize: '18px' }}>Sprint Goal:</strong> Migrate legacy API systems to the new microservices architecture for improved scalability and performance.
                        </p>
                    </div>
                </div>



                {/* ╔══ MAIN CONTENT GRID ══════════════════╗ */}
                <div className="flex flex-col gap-3">

                    {/* ═══ TOP ROW: KPIs + Analytics (Line Chart) ═══ */}
                    <div className="relative">
                        {/* KPIs - normal flow, determines row height */}
                        <div className="xl:pr-[25.5%]">
                            <div className="flex items-stretch h-[140px] gap-1">
                                {/* Planned */}
                                <div className="flex-1 rounded-2xl px-5 py-4 shadow-sm border border-[#3a302a]/5 relative flex flex-col justify-between overflow-hidden" style={{ backgroundColor: '#ffffff', zIndex: 1 }}>
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-[#3a302a]/5"><ListTodo className="h-4 w-4 text-[#3a302a] stroke-[2]" /></div>
                                        <span className="text-[14px] font-bold text-[#3a302a]/60 uppercase tracking-wider">Planned</span>
                                    </div>
                                    <div className="text-[34px] font-bold text-[#3a302a] leading-none mt-1" style={{ fontFamily: "'EB Garamond', serif" }}>
                                        {total} <span className="text-[14px] font-semibold text-[#3a302a]/30">sp</span>
                                    </div>
                                    <div className="text-[11px] text-[#3a302a]/30 font-bold uppercase tracking-tighter">{total} Story Points</div>
                                </div>

                                {/* Completed */}
                                <div className="flex-1 rounded-2xl px-5 py-4 shadow-sm border border-[#3a302a]/5 relative flex flex-col justify-between overflow-hidden" style={{ backgroundColor: '#ffffff', zIndex: 2 }}>
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-[#c2652a]/10"><CheckCircle2 className="h-4 w-4 text-[#c2652a] stroke-[2]" /></div>
                                        <span className="text-[14px] font-bold text-[#c2652a] uppercase tracking-wider">Completed</span>
                                    </div>
                                    <div className="text-[34px] font-bold text-[#3a302a] leading-none mt-1" style={{ fontFamily: "'EB Garamond', serif" }}>
                                        {done} <span className="text-[14px] font-semibold text-[#3a302a]/30">sp</span>
                                    </div>
                                    <div className="w-full">
                                        <div className="h-1.5 bg-[#f8f5f0] rounded-full overflow-hidden w-full">
                                            <div className="h-full bg-[#c2652a] rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
                                        </div>
                                        <div className="mt-2 flex items-center gap-2 text-[11px] leading-none font-bold">
                                            <span className="text-[#c2652a]">{pct}% Done</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Remaining */}
                                <div className="flex-1 rounded-2xl px-5 py-4 shadow-sm border border-[#3a302a]/5 relative flex flex-col justify-between overflow-hidden" style={{ backgroundColor: '#ffffff', zIndex: 3 }}>
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-[#3a302a]/5"><Clock className="h-4 w-4 text-[#3a302a] stroke-[2]" /></div>
                                        <span className="text-[14px] font-bold text-[#3a302a]/60 uppercase tracking-wider">Remaining</span>
                                    </div>
                                    <div className="text-[34px] font-bold text-[#3a302a] leading-none mt-1" style={{ fontFamily: "'EB Garamond', serif" }}>
                                        {remaining} <span className="text-[14px] font-semibold text-[#3a302a]/30">sp</span>
                                    </div>
                                    <div className="w-full">
                                        <div className="h-1.5 bg-[#f8f5f0] rounded-full overflow-hidden w-full">
                                            <div className="h-full bg-[#3a302a] rounded-full transition-all duration-1000" style={{ width: `${100 - pct}%` }} />
                                        </div>
                                        <div className="mt-2 flex items-center gap-2 text-[11px] leading-none font-bold">
                                            <span className="text-[#3a302a]/40">{100 - pct}% Left</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Velocity */}
                                <div className="flex-1 rounded-2xl px-5 py-4 shadow-sm border border-[#3a302a]/5 relative flex flex-col justify-between overflow-hidden" style={{ backgroundColor: '#ffffff', zIndex: 4 }}>
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-[#3a302a]/5"><TrendingUp className="h-4 w-4 text-[#3a302a] stroke-[2]" /></div>
                                        <span className="text-[14px] font-bold text-[#3a302a]/60 uppercase tracking-wider">Velocity</span>
                                    </div>
                                    <div className="text-[34px] font-bold text-[#3a302a] leading-none mt-1" style={{ fontFamily: "'EB Garamond', serif" }}>
                                        7.5 <span className="text-[14px] font-semibold text-[#3a302a]/30">sp</span>
                                    </div>
                                    <div className="w-full">
                                        <div className="h-1.5 bg-[#f8f5f0] rounded-full overflow-hidden w-full">
                                            <div className="h-full bg-[#3a302a]/40 rounded-full transition-all" style={{ width: '75%' }} />
                                        </div>
                                        <div className="mt-2 text-[11px] text-[#3a302a]/30 font-bold uppercase tracking-tight">Avg: 9.2 sp</div>
                                    </div>
                                </div>

                                {/* 53% Blocked / On Track */}
                                <div className="flex-1 rounded-2xl px-5 py-4 shadow-sm border border-[#3a302a]/5 relative flex flex-col justify-between overflow-hidden bg-[#3a302a] text-white" style={{ zIndex: 5 }}>
                                    <div className="flex items-center gap-3">
                                        <div className="relative h-7 w-7 shrink-0 flex items-center justify-center">
                                            <div className="absolute inset-0 rounded-full border-[2px] border-white/20" />
                                            <div className="absolute inset-0 rounded-full border-[2px] border-[#c2652a] border-l-transparent border-b-transparent -rotate-45" />
                                            <div className="text-[9px] font-bold text-white">53%</div>
                                        </div>
                                        <span className="text-[28px] font-bold text-white leading-none" style={{ fontFamily: "'EB Garamond', serif" }}>Blocked</span>
                                    </div>
                                    <button className="w-full h-8 rounded-lg bg-[#c2652a] hover:bg-[#a35423] transition-all text-white text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm active:scale-95">
                                        <CheckCircle2 className="h-3 w-3" /> Fix Now
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Analytics - absolutely positioned on xl+ so it doesn't stretch row height */}
                        <div className="mt-4 xl:mt-0 xl:absolute xl:top-0 xl:right-0 xl:w-[24.5%] xl:z-10">
                            <div className="bg-white rounded-2xl shadow-sm border border-[#3a302a]/5 p-6 flex flex-col h-[140px] justify-center overflow-hidden">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[14px] font-bold text-[#3a302a]/60 uppercase tracking-widest">Analytics</span>
                                    <button className="text-[12px] font-bold text-[#c2652a] hover:underline transition-all"
                                        onClick={() => router.push(`/sprint/${sprintId}/board`)}>
                                        Board &gt;
                                    </button>
                                </div>
                                <div className="h-[60px] w-full">
                                    <ResponsiveContainer width="100%" height={60}>
                                        <AreaChart data={MOCK_ANALYTICS} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                                            <defs>
                                                <linearGradient id="gAnalytics" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#c2652a" stopOpacity={0.2} />
                                                    <stop offset="100%" stopColor="#c2652a" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Area type="monotone" dataKey="value" stroke="#c2652a" strokeWidth={2.5} fill="url(#gAnalytics)" dot={{ r: 0 }} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ═══ BOTTOM ROW: Content ═══ */}
                    <div className="grid grid-cols-12 gap-4">

                        {/* Left Side: Blockers + Activity (6 cols) */}
                        <div className="col-span-12 xl:col-span-6 flex flex-col gap-4">
                            {/* Blockers & Dependencies */}
                            <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-sm border border-[#3a302a]/5 overflow-hidden">
                                <div className="flex items-center justify-between px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-[#3a302a] rounded-xl"><AlertCircle className="h-4 w-4 text-white stroke-[2.5]" /></div>
                                        <span className="text-[22px] font-bold text-[#3a302a]" style={{ fontFamily: "'EB Garamond', serif" }}>Blockers & Dependencies</span>
                                    </div>
                                    <button className="text-[11px] font-bold text-[#3a302a]/40 uppercase tracking-widest hover:text-[#c2652a] transition-colors">View all</button>
                                </div>
                                <div className="w-full">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-[#3a302a]/5 border-y border-[#3a302a]/5">
                                                <th className="text-left py-3 pl-6 pr-2 text-[10px] font-bold text-[#3a302a]/40 uppercase tracking-widest">
                                                    <div className="flex items-center gap-1.5">Reason</div>
                                                </th>
                                                <th className="text-left py-3 px-2 text-[10px] font-bold text-[#3a302a]/40 uppercase tracking-widest w-[140px]">Owner</th>
                                                <th className="text-right py-3 pl-2 pr-6 text-[10px] font-bold text-[#3a302a]/40 uppercase tracking-widest w-[120px]">Timeline</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {MOCK_BLOCKERS.map((b) => (
                                                <tr key={b.id} className="border-b border-[#3a302a]/5 last:border-0 hover:bg-[#3a302a]/5 transition-colors group">
                                                    <td className="py-4 pl-6 pr-2 align-top">
                                                        <div className="flex items-start gap-3">
                                                            <Avatar className="h-9 w-9 border-2 border-white shadow-sm mt-0.5">
                                                                <AvatarFallback className="bg-[#f8f5f0] text-[10px] font-bold text-[#3a302a]">{b.initial}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="text-[14px] font-bold text-[#3a302a] leading-snug group-hover:text-[#c2652a] transition-colors">{b.reason}</p>
                                                                <p className="text-[11px] text-[#3a302a]/40 mt-1 italic leading-tight">{b.subtext}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-2 align-top">
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Avatar className="h-5 w-5">
                                                                <AvatarFallback className="text-[8px] bg-[#3a302a] text-white">{b.ownerInitials}</AvatarFallback>
                                                            </Avatar>
                                                            <span className="text-[11px] font-bold text-[#3a302a]/70">{b.ownerName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 pl-2 pr-6 align-top text-right">
                                                        <span className="text-[11px] font-bold text-[#3a302a]/30 uppercase tracking-tighter">{b.blockedSince}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Activity Grid */}
                            <div className="bg-white/40 backdrop-blur-sm rounded-2xl shadow-sm border border-[#3a302a]/5 p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <span className="text-[22px] font-bold text-[#3a302a]" style={{ fontFamily: "'EB Garamond', serif" }}>Resources & Tools</span>
                                    <button className="text-[11px] font-bold text-[#3a302a]/40 uppercase tracking-widest">Explore</button>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {/* Planning */}
                                    <div className="rounded-2xl p-5 bg-white border border-[#3a302a]/5 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all flex flex-col gap-4 min-h-[140px] group"
                                        onClick={() => router.push(`/sprint/${sprintId}/planning`)}>
                                        <div className="h-10 w-10 bg-[#f8f5f0] rounded-xl flex items-center justify-center shadow-sm shrink-0 transition-colors group-hover:bg-[#3a302a]">
                                            <Calendar className="h-5 w-5 text-[#3a302a] group-hover:text-white transition-colors" />
                                        </div>
                                        <div>
                                            <p className="text-[15px] font-bold text-[#3a302a]">Planning</p>
                                            <p className="text-[11px] text-[#3a302a]/40 font-bold uppercase tracking-tight mt-1">Strategy & Tasks</p>
                                        </div>
                                    </div>

                                    {/* Sprint Board */}
                                    <div className="rounded-2xl p-5 bg-[#3a302a] cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col gap-4 min-h-[140px] group"
                                        onClick={() => router.push(`/sprint/${sprintId}/board`)}>
                                        <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md shrink-0">
                                            <Layout className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-[15px] font-bold text-white">Sprint Board</p>
                                            <p className="text-[11px] text-white/40 font-bold uppercase tracking-tight mt-1">Live Execution</p>
                                        </div>
                                    </div>

                                    {/* Retrospective */}
                                    <div className="rounded-2xl p-5 bg-[#c2652a] cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col gap-4 min-h-[140px] group"
                                        onClick={() => router.push(`/sprint/${sprintId}/retrospective`)}>
                                        <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md shrink-0">
                                            <MessageSquare className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-[15px] font-bold text-white">Retrospective</p>
                                            <p className="text-[11px] text-white/40 font-bold uppercase tracking-tight mt-1">Review & Improve</p>
                                        </div>
                                    </div>

                                    {/* Reports */}
                                    <div className="rounded-2xl p-5 bg-white border border-[#3a302a]/5 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all flex flex-col gap-4 min-h-[140px] group">
                                        <div className="h-10 w-10 bg-[#f8f5f0] rounded-xl flex items-center justify-center shadow-sm shrink-0 group-hover:bg-[#3a302a] transition-colors">
                                            <FileText className="h-5 w-5 text-[#3a302a] group-hover:text-white transition-colors" />
                                        </div>
                                        <div>
                                            <p className="text-[15px] font-bold text-[#3a302a]">Insights</p>
                                            <p className="text-[11px] text-[#3a302a]/40 font-bold uppercase tracking-tight mt-1">Data Reports</p>
                                        </div>
                                    </div>

                                    {/* Settings */}
                                    <div className="rounded-2xl p-5 bg-white border border-[#3a302a]/5 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all flex flex-col gap-4 min-h-[140px] group">
                                        <div className="h-10 w-10 bg-[#f8f5f0] rounded-xl flex items-center justify-center shadow-sm shrink-0 group-hover:bg-[#3a302a] transition-colors">
                                            <Settings className="h-5 w-5 text-[#3a302a] group-hover:text-white transition-colors" />
                                        </div>
                                        <div>
                                            <p className="text-[15px] font-bold text-[#3a302a]">Configure</p>
                                            <p className="text-[11px] text-[#3a302a]/40 font-bold uppercase tracking-tight mt-1">Sprint Rules</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Wrapper: Burndown + Velocity + Feed (6 cols) */}
                        <div className="col-span-12 xl:col-span-6 flex flex-col gap-4">
                            {/* Row 1: Burndown + Velocity */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Sprint Burndown */}
                                <div className="bg-white rounded-2xl shadow-sm border border-[#3a302a]/5 p-6 flex flex-col">
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1 rounded bg-[#3a302a]/5"><TrendingUp className="h-3 w-3 text-[#3a302a]" /></div>
                                            <span className="text-[18px] font-bold text-[#3a302a]" style={{ fontFamily: "'EB Garamond', serif" }}>Burndown Chart</span>
                                        </div>
                                        <MoreHorizontal className="h-4 w-4 text-[#3a302a]/20" />
                                    </div>
                                    <div className="h-[250px] w-full">
                                        <ResponsiveContainer width="100%" height={250}>
                                            <AreaChart data={MOCK_BURNDOWN} margin={{ top: 5, right: 0, bottom: 0, left: -25 }}>
                                                <defs>
                                                    <linearGradient id="gBurndown" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#c2652a" stopOpacity={0.15} />
                                                        <stop offset="100%" stopColor="#c2652a" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#3a302a', opacity: 0.3 }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#3a302a', opacity: 0.3 }} domain={[0, 20]} />
                                                <Area type="monotone" dataKey="ideal" stroke="#3a302a" strokeWidth={1} strokeDasharray="4 4" fill="none" opacity={0.2} dot={false} />
                                                <Area type="monotone" dataKey="actual" stroke="#c2652a" strokeWidth={3} fill="url(#gBurndown)" dot={{ r: 0 }} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex items-center justify-center gap-6 mt-4 text-[10px] font-bold uppercase tracking-widest text-[#3a302a]/30">
                                        <span className="flex items-center gap-1.5">Ideal Line</span>
                                        <span className="flex items-center gap-1.5 text-[#c2652a]">Current Pace</span>
                                    </div>
                                </div>

                                {/* Velocity Trend */}
                                <div className="bg-white rounded-2xl shadow-sm border border-[#3a302a]/5 p-6 flex flex-col">
                                    <div className="flex items-center justify-between mb-5">
                                        <span className="text-[18px] font-bold text-[#3a302a]" style={{ fontFamily: "'EB Garamond', serif" }}>Velocity Trend</span>
                                        <MoreHorizontal className="h-4 w-4 text-[#3a302a]/20" />
                                    </div>
                                    <div className="space-y-5 flex-1 flex flex-col justify-center">
                                        {MOCK_VELOCITY.map((v, i) => (
                                            <div key={i} className="space-y-1.5">
                                                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-tight text-[#3a302a]/40">
                                                    <span>{v.name}</span>
                                                    <span className="text-[#3a302a]">{v.sp} SP</span>
                                                </div>
                                                <div className="h-2 bg-[#f8f5f0] rounded-full overflow-hidden">
                                                    <div className="h-full rounded-full transition-all duration-700" 
                                                        style={{ width: `${(v.sp / 15) * 100}%`, backgroundColor: i === 2 ? '#c2652a' : '#3a302a' }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Feed (Full Width) */}
                            <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-sm border border-[#3a302a]/5 p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <span className="text-[18px] font-bold text-[#3a302a]" style={{ fontFamily: "'EB Garamond', serif" }}>Sprint Activity</span>
                                    <button className="text-[10px] font-bold text-[#c2652a] uppercase tracking-widest">History</button>
                                </div>
                                <div className="space-y-5">
                                    {MOCK_FEED.map((item, i) => (
                                        <div key={i} className="flex items-start gap-4">
                                            <div className="h-9 w-9 rounded-full bg-[#f8f5f0] flex items-center justify-center shrink-0 border border-[#3a302a]/5 shadow-sm text-[10px] font-bold text-[#3a302a]">
                                                {i === 0 ? <CheckCircle2 className="h-4 w-4 text-[#c2652a]" /> : <Play className="h-3 w-3 fill-[#3a302a]" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[13px] font-bold text-[#3a302a] leading-snug">{item.text}</p>
                                                <p className="text-[11px] text-[#3a302a]/30 font-bold uppercase tracking-tighter mt-1">{item.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </main>

            {/* Edit Dialog */}
            <EditSprintDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                sprint={sprint}
                onUpdate={(updated: Sprint & { id: string }) => setSprint(updated)}
            />
        </div>
    );
}
