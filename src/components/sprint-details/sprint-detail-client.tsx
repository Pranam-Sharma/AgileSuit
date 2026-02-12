'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
    MoreHorizontal, Search, Bell, ChevronRight, Plus, Lock, RotateCcw,
    Layout, ListTodo, Calendar, FileText, Settings, AlertCircle, Clock,
    CheckCircle2, TrendingUp, Play, MessageSquare
} from 'lucide-react';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '../logo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import type { Sprint } from '../dashboard/create-sprint-dialog';
import { EditSprintDialog } from '../dashboard/edit-sprint-dialog';

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
            const { startSprintAction, completeSprintAction } = await import('@/app/actions/sprints');
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
        <div className="min-h-screen bg-[#f0f1f5]" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>

            {/* ╔══ TOP NAV BAR ══════════════════════════════════════╗ */}
            <header className="flex items-center justify-between px-8 py-2 bg-white/60 backdrop-blur-sm sticky top-0 z-50 border-b border-white/20">
                <div className="flex items-center gap-3">
                    <Logo className="h-8 w-8" />
                    <span className="text-xl font-bold text-slate-900 tracking-tight">AgileSuit</span>
                </div>
                <div className="flex items-center gap-5">
                    <div className="flex items-center gap-2 text-slate-500 cursor-pointer hover:text-slate-700">
                        <Search className="h-4 w-4" />
                        <span className="text-sm font-medium">Search</span>
                        <span className="text-xs text-slate-400 ml-1">⌘</span>
                    </div>
                    <Bell className="h-5 w-5 text-slate-500 cursor-pointer hover:text-slate-700" />
                    <UserNav user={user} />
                </div>
            </header>

            <main className="px-8 pt-4 pb-10 max-w-[1500px] mx-auto">

                {/* ╔══ SPRINT HEADER CARD ═════════════════════════════╗ */}
                <div className="mb-4">
                    {/* Title row */}
                    <div className="flex items-start justify-between relative z-10 mb-5">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-[26px] font-bold text-slate-800 leading-tight tracking-tight">
                                    {sprint.sprintName}{sprint.projectName ? ` - ${sprint.projectName}` : ''}
                                </h1>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-700 text-white shadow-sm">
                                    {sprint.status === 'active' ? 'Active' : sprint.status?.charAt(0).toUpperCase() + sprint.status?.slice(1)}
                                </span>
                            </div>
                            <p className="text-[13px] text-slate-500 font-medium ml-0.5">
                                {sprint.startDate
                                    ? `${new Date(sprint.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${new Date(sprint.endDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} (14 days)`
                                    : 'Dates TBD'}
                            </p>
                        </div>

                        <div className="flex items-center gap-3 pt-1">
                            <button className="h-9 px-4 rounded-lg border border-slate-200 bg-white text-[13px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
                                onClick={() => handleAction('complete')}>
                                Close Sprint
                            </button>
                            <button className="h-9 px-4 rounded-lg border border-slate-200 bg-white text-[13px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2">
                                <RotateCcw className="h-3.5 w-3.5" /> Reopen Sprint
                            </button>
                            <button className="h-9 px-4 rounded-lg bg-[#9B2335] text-white text-[13px] font-semibold shadow-sm hover:bg-[#832030] transition-colors flex items-center gap-1.5">
                                <Lock className="h-3.5 w-3.5" /> Lock <ChevronRight className="h-3.5 w-3.5 opacity-60 ml-1" />
                            </button>
                        </div>
                    </div>

                    {/* Tags + Sprint Goal */}
                    <div className="flex items-center gap-4 bg-white rounded-xl shadow-md border border-slate-200/60 p-4 relative z-10">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#1e40af] text-white shadow-sm">
                            <span className="bg-white/20 rounded-full p-0.5"><TrendingUp className="h-2.5 w-2.5" /></span> Azure
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#3b82f6] text-white shadow-sm">
                            <span className="bg-white/20 rounded-full p-0.5"><Plus className="h-2.5 w-2.5" /></span> Backend
                        </span>
                        <p className="text-[14px] text-slate-600">
                            <strong className="text-slate-800 font-semibold">Sprint Goal:</strong> Migrate legacy API systems to the new microservices architecture for improved scalability and performance.
                        </p>
                    </div>
                </div>



                {/* ╔══ MAIN CONTENT GRID ══════════════════╗ */}
                <div className="flex flex-col gap-3">

                    {/* ═══ TOP ROW: KPIs + Analytics (Line Chart) ═══ */}
                    <div className="relative">
                        {/* KPIs - normal flow, determines row height */}
                        <div className="xl:pr-[25.5%]">
                            <div className="flex items-stretch h-[130px]">
                                {/* Planned */}
                                <div className="flex-1 rounded-xl px-4 py-2.5 shadow-md border border-white/60 relative flex flex-col justify-between" style={{ backgroundColor: '#e6f0ff', zIndex: 1 }}>
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-md bg-blue-100"><ListTodo className="h-4 w-4 text-blue-900 stroke-[2.5]" /></div>
                                        <span className="text-[15px] font-bold text-slate-700">Planned</span>
                                    </div>
                                    <div className="text-[26px] font-bold text-slate-900 leading-none mt-1">{total} <span className="text-[13px] font-semibold text-slate-400">sp</span></div>
                                    <div className="text-[11px] text-slate-400 font-medium mb-0.5">{total} sp</div>
                                </div>

                                {/* Completed */}
                                <div className="flex-1 rounded-xl px-4 py-2.5 shadow-md border border-white/60 relative -ml-3 flex flex-col justify-between" style={{ backgroundColor: '#e0fce9', zIndex: 2 }}>
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-md bg-green-100"><CheckCircle2 className="h-4 w-4 text-green-900 stroke-[2.5]" /></div>
                                        <span className="text-[15px] font-bold text-slate-700">Completed</span>
                                    </div>
                                    <div className="text-[26px] font-bold text-slate-900 leading-none mt-1">{done} <span className="text-[13px] font-semibold text-slate-400">sp</span></div>
                                    <div className="w-full">
                                        <Progress value={pct} className="h-2 bg-slate-100 w-full" indicatorClassName="bg-green-500" />
                                        <div className="mt-1.5 flex items-center gap-1 text-[11px] leading-none">
                                            <span className="text-green-600 font-bold">2³</span> <span className="text-slate-400">47%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Remaining */}
                                <div className="flex-1 rounded-xl px-4 py-2.5 shadow-md border border-white/60 relative -ml-3 flex flex-col justify-between" style={{ backgroundColor: '#fff5db', zIndex: 3 }}>
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-md bg-amber-100"><Clock className="h-4 w-4 text-orange-800 stroke-[2.5]" /></div>
                                        <span className="text-[15px] font-bold text-slate-700">Remaining</span>
                                    </div>
                                    <div className="text-[26px] font-bold text-slate-900 leading-none mt-1">{remaining} <span className="text-[13px] font-semibold text-slate-400">sp</span></div>
                                    <div className="w-full">
                                        <Progress value={100 - pct} className="h-2 bg-slate-100 w-full" indicatorClassName="bg-amber-400" />
                                        <div className="mt-1.5 flex items-center gap-1 text-[11px] leading-none">
                                            <span className="text-amber-500 font-bold">1</span> <span className="text-slate-400">13%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Velocity */}
                                <div className="flex-1 rounded-xl px-4 py-2.5 shadow-md border border-white/60 relative -ml-3 flex flex-col justify-between" style={{ backgroundColor: '#eaeff0', zIndex: 4 }}>
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-md bg-slate-200"><TrendingUp className="h-4 w-4 text-slate-900 stroke-[2.5]" /></div>
                                        <span className="text-[15px] font-bold text-slate-700">Velocity</span>
                                    </div>
                                    <div className="text-[26px] font-bold text-slate-900 leading-none mt-1">7.5 <span className="text-[13px] font-semibold text-slate-400">sp</span></div>
                                    <div className="w-full">
                                        <Progress value={75} className="h-2 bg-slate-100 w-full" indicatorClassName="bg-slate-700" />
                                        <div className="mt-1.5 text-[11px] text-slate-400 leading-none">Avg: 9.2 sp</div>
                                    </div>
                                </div>

                                {/* 53% Blocked / On Track */}
                                <div className="flex-1 rounded-xl px-4 py-2.5 shadow-md border border-white/60 relative -ml-3 flex flex-col justify-between" style={{ backgroundColor: '#ffe8e8', zIndex: 5 }}>
                                    <div className="flex items-center gap-2">
                                        <div className="relative h-6 w-6 shrink-0 flex items-center justify-center">
                                            <div className="absolute inset-0 rounded-full border-[3px] border-red-200" />
                                            <div className="absolute inset-0 rounded-full border-[3px] border-red-700 border-l-transparent border-b-transparent -rotate-45" />
                                            <Play className="h-3 w-3 text-red-900 fill-red-900 ml-0.5" />
                                        </div>
                                        <span className="text-[26px] font-bold text-slate-900 leading-none">53%</span>
                                    </div>
                                    <div className="text-[11px] font-semibold text-red-700 flex items-center justify-between">
                                        Blocked <ChevronRight className="h-3 w-3 text-slate-400" />
                                    </div>
                                    <button className="w-full h-7 rounded-md bg-green-700 hover:bg-green-800 transition-colors text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-sm">
                                        <CheckCircle2 className="h-3 w-3" /> On Track
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Analytics - absolutely positioned on xl+ so it doesn't stretch row height */}
                        <div className="mt-4 xl:mt-0 xl:absolute xl:top-0 xl:right-0 xl:w-[24.5%] xl:z-10">
                            <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[15px] font-bold text-slate-800">Analytics</span>
                                    <button className="text-[12px] font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                                        onClick={() => router.push(`/sprint/${sprintId}/board`)}>
                                        View Board &gt;
                                    </button>
                                </div>
                                <div className="h-[170px]">
                                    <ResponsiveContainer width="100%" height={170}>
                                        <AreaChart data={MOCK_ANALYTICS} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                                            <defs>
                                                <linearGradient id="gAnalytics" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.25} />
                                                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.02} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} domain={[0, 20]} ticks={[0, 5, 10, 15, 20]} />
                                            <Area type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} fill="url(#gAnalytics)" dot={{ r: 0 }} activeDot={{ r: 4, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex items-center justify-center gap-5 mt-1 text-[10px] font-bold text-slate-400">
                                    <span className="flex items-center gap-1.5"><span className="inline-block h-[2px] w-3 bg-slate-300" /> Ideal</span>
                                    <span className="flex items-center gap-1.5"><span className="inline-block h-[2px] w-3 bg-red-500" /> Actual</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ═══ BOTTOM ROW: Content ═══ */}
                    <div className="grid grid-cols-12 gap-3">

                        {/* Left Side: Blockers + Activity (6 cols) */}
                        <div className="col-span-12 xl:col-span-6 flex flex-col gap-3">
                            {/* Blockers & Dependencies */}
                            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                                <div className="flex items-center justify-between px-5 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-red-100 rounded-full"><AlertCircle className="h-4 w-4 text-red-800 stroke-[2.5]" /></div>
                                        <span className="text-[15px] font-bold text-slate-800">Blockers & Dependencies</span>
                                    </div>
                                    <button className="text-[12px] font-medium text-slate-400 hover:text-slate-600">View all &gt;</button>
                                </div>
                                <div className="w-full">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-slate-50/80 border-y border-slate-100">
                                                <th className="text-left py-2.5 pl-5 pr-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                    <div className="flex items-center gap-1.5"><ListTodo className="h-3 w-3" /> Reason</div>
                                                </th>
                                                <th className="text-left py-2.5 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-[140px]">Owner</th>
                                                <th className="text-right py-2.5 pl-2 pr-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-[120px]">Blocked since</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {MOCK_BLOCKERS.map((b) => (
                                                <tr key={b.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group">
                                                    <td className="py-3 pl-5 pr-2 align-top">
                                                        <div className="flex items-start gap-3">
                                                            <Avatar className="h-8 w-8 mt-0.5">
                                                                <AvatarFallback className="bg-slate-200 text-[10px] text-slate-600">{b.initial}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="text-[13px] font-bold text-slate-800 leading-snug group-hover:text-blue-700 transition-colors">{b.reason}</p>
                                                                <p className="text-[11px] text-slate-400 mt-0.5">{b.subtext}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-2 align-top">
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <Avatar className="h-5 w-5">
                                                                <AvatarFallback className="text-[8px] bg-slate-800 text-white">{b.ownerInitials}</AvatarFallback>
                                                            </Avatar>
                                                            <span className="text-[11px] font-semibold text-slate-700">{b.ownerName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 pl-2 pr-5 align-top">
                                                        <div className="flex items-center justify-end gap-1.5 mt-1">
                                                            <div className="h-1.5 w-1.5 rounded-full bg-slate-300 group-hover:bg-red-500 transition-colors" />
                                                            <span className="text-[11px] font-medium text-slate-400 group-hover:text-slate-600 transition-colors">{b.blockedSince}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="h-2" />
                            </div>

                            {/* Activity Grid */}
                            <div className="bg-white rounded-2xl shadow-md p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[15px] font-bold text-slate-800">Activity</span>
                                    <button className="text-[12px] font-medium text-slate-400 hover:text-slate-600">View all &gt;</button>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {/* Planning */}
                                    <div className="rounded-2xl p-4 bg-gradient-to-br from-[#e0e7ff] to-[#dbeafe] cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-3 min-h-[100px]"
                                        onClick={() => router.push(`/sprint/${sprintId}/planning`)}>
                                        <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                            <Calendar className="h-5 w-5 text-indigo-900 stroke-[2]" />
                                        </div>
                                        <div>
                                            <p className="text-[14px] font-bold text-slate-800 leading-snug">Planning</p>
                                            <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-tight">Plan and assign host sprint&#39;s tasks</p>
                                        </div>
                                    </div>

                                    {/* Sprint Board */}
                                    <div className="rounded-2xl p-4 bg-gradient-to-br from-blue-900 via-indigo-900 to-rose-900 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-3 relative overflow-hidden group min-h-[100px]"
                                        onClick={() => router.push(`/sprint/${sprintId}/board`)}>
                                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light pointer-events-none"></div>
                                        <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center shadow-sm backdrop-blur-sm shrink-0 z-10">
                                            <Layout className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="z-10">
                                            <p className="text-[14px] font-bold text-white leading-snug">Sprint Board</p>
                                            <p className="text-[11px] text-indigo-100/80 font-medium mt-0.5 leading-tight">Manage and tasks sprint&#39;s progress</p>
                                        </div>
                                    </div>

                                    {/* Retrospective */}
                                    <div className="rounded-2xl p-4 bg-gradient-to-br from-green-200 via-lime-200 to-yellow-200 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-3 min-h-[100px]"
                                        onClick={() => router.push(`/sprint/${sprintId}/retrospective`)}>
                                        <div className="h-10 w-10 bg-white/60 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                            <MessageSquare className="h-5 w-5 text-green-950 stroke-[2]" />
                                        </div>
                                        <div>
                                            <p className="text-[14px] font-bold text-green-950 leading-snug">Retrospective</p>
                                            <p className="text-[11px] text-green-900/80 font-medium mt-0.5 leading-tight">Review wed actect on the last sprint</p>
                                        </div>
                                    </div>

                                    {/* Reports */}
                                    <div className="rounded-2xl p-4 bg-gradient-to-br from-[#ffedd5] to-[#fcd34d] cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-3 min-h-[100px]">
                                        <div className="h-10 w-10 bg-white/60 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                            <FileText className="h-5 w-5 text-orange-900 stroke-[2]" />
                                        </div>
                                        <div>
                                            <p className="text-[14px] font-bold text-orange-950 leading-snug">Reports</p>
                                            <p className="text-[11px] text-orange-800 font-medium mt-0.5 leading-tight">View detailed insights across all</p>
                                        </div>
                                    </div>

                                    {/* Adviin */}
                                    <div className="rounded-2xl p-4 bg-gradient-to-br from-[#f1f5f9] to-[#cbd5e1] cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-3 min-h-[100px]">
                                        <div className="h-10 w-10 bg-white/60 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                            <Settings className="h-5 w-5 text-slate-950 stroke-[2]" />
                                        </div>
                                        <div>
                                            <p className="text-[14px] font-bold text-slate-800 leading-snug">Adviin</p>
                                            <p className="text-[11px] text-slate-600 font-medium mt-0.5 leading-tight">Manage</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Wrapper: Burndown + Velocity + Feed (6 cols) */}
                        <div className="col-span-12 xl:col-span-6 flex flex-col gap-3">
                            {/* Row 1: Burndown + Velocity */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* Sprint Burndown */}
                                <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1 rounded bg-slate-100"><TrendingUp className="h-3 w-3 text-slate-900 stroke-[2.5]" /></div>
                                            <span className="text-[15px] font-bold text-slate-800">Sprint Burndown</span>
                                        </div>
                                        <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                    </div>
                                    <div className="h-[250px]">
                                        <ResponsiveContainer width="100%" height={250}>
                                            <AreaChart data={MOCK_BURNDOWN} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                                                <defs>
                                                    <linearGradient id="gBurndown" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.25} />
                                                        <stop offset="100%" stopColor="#ef4444" stopOpacity={0.02} />
                                                    </linearGradient>
                                                </defs>
                                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} domain={[0, 20]} ticks={[0, 5, 10, 15]} />
                                                <Area type="monotone" dataKey="ideal" stroke="#cbd5e1" strokeWidth={1.5} strokeDasharray="5 3" fill="none" dot={false} />
                                                <Area type="monotone" dataKey="actual" stroke="#ef4444" strokeWidth={2} fill="url(#gBurndown)" dot={{ r: 0 }} activeDot={{ r: 4, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex items-center justify-center gap-5 mt-2 text-[10px] font-bold text-slate-400">
                                        <span className="flex items-center gap-1.5"><span className="inline-block h-[2px] w-3 bg-slate-300" /> Ideal</span>
                                        <span className="flex items-center gap-1.5"><span className="inline-block h-[2px] w-3 bg-red-500" /> Actual</span>
                                    </div>
                                </div>

                                {/* Velocity Trend */}
                                <div className="bg-white rounded-2xl shadow-md p-5 xl:mt-[130px]">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[15px] font-bold text-slate-800">Velocity Trend</span>
                                        <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                    </div>
                                    <div className="bg-slate-50/80 rounded-xl border border-slate-100/80 p-4">
                                        <div className="space-y-4">
                                            {MOCK_VELOCITY.map((v, i) => (
                                                <div key={i} className="flex items-center text-[12px]">
                                                    <div className="flex items-center gap-2.5 w-[90px] shrink-0">
                                                        <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: v.color }} />
                                                        <span className="font-semibold text-slate-700 truncate" title={v.name}>{v.name}</span>
                                                    </div>

                                                    {/* Vertical Separator */}
                                                    <div className="h-3 w-[1px] bg-slate-300 mx-3 shrink-0"></div>

                                                    <div className="flex-1 h-2 bg-slate-200/60 rounded-full overflow-hidden shadow-inner">
                                                        <div className="h-full rounded-full transition-all" style={{ width: `${(v.sp / 15) * 100}%`, backgroundColor: v.color }} />
                                                    </div>

                                                    <div className="w-[50px] text-right shrink-0">
                                                        <span className="text-slate-400 mr-1.5 font-light">—</span>
                                                        <span className="font-bold text-slate-700">{v.sp}</span>
                                                        <span className="text-[10px] text-slate-400 ml-0.5">sp</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Feed (Full Width) */}
                            <div className="bg-white rounded-2xl shadow-md p-5">
                                <div className="flex items-center justify-end mb-4">
                                    <button className="text-[12px] font-medium text-slate-400 hover:text-slate-600">View all &gt;</button>
                                </div>
                                <div className="space-y-4">
                                    {MOCK_FEED.map((item, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <Avatar className="h-8 w-8 mt-0.5 border border-white shadow-sm">
                                                <AvatarFallback className="bg-slate-800 text-white text-[9px] font-bold">U</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-[11px] text-slate-400 font-semibold">{item.time}</p>
                                                <p className="text-[13px] font-semibold text-slate-800">{item.text}</p>
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
