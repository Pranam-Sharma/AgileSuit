'use client';

import * as React from 'react';
import { useUser } from '@/hooks/use-user';
import { RbacContext, RoleLevel } from '@/auth/rbac';
import { useRBAC } from '@/hooks/use-rbac';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Building2, Users, UserCog, Plus, ArrowRight, ShieldAlert, Search, Network, Shield, ChevronUp, Pencil, Filter, List, LayoutGrid, ShieldCheck, User, Zap, Lock, Check } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Sidebar } from '@/modules/dashboard/sidebar';
import { UserNav } from '@/modules/dashboard/user-nav';
import { getDepartmentsAction, getTeamsAction, getOrganizationMembersAction, getPendingTeamRequestsAction, processTeamRequestAction } from '@/backend/actions/teams.actions';

import { CreateDepartmentDialog } from './create-department-dialog';
import { CreateTeamDialog } from './create-team-dialog';
import { ManageUserDialog } from './manage-user-dialog';
import { AssignTeamMemberDialog } from './assign-team-member-dialog';

export function TeamClient() {
    const { user } = useUser();
    const { rbacContext: initialRbacContext, isInitializing, forceRefresh } = useRBAC();


    // Data State
    const [departments, setDepartments] = React.useState<any[]>([]);
    const [teams, setTeams] = React.useState<any[]>([]);
    const [members, setMembers] = React.useState<any[]>([]);
    const [pendingRequests, setPendingRequests] = React.useState<any[]>([]);

    // Selection State (from the provided snippet, though not directly used in the original context)
    const [selectedDepartment, setSelectedDepartment] = React.useState<string | null>(null);
    const [selectedTeam, setSelectedTeam] = React.useState<string | null>(null);

    const [refreshKey, setRefreshKey] = React.useState(0);
    const triggerRefresh = () => setRefreshKey(prev => prev + 1);

    const [activeTab, setActiveTab] = React.useState<'map' | 'personnel' | 'authority'>('map');

    // Initial Load
    React.useEffect(() => {
        async function loadInitialData() {
            try {
                const deps = await getDepartmentsAction();
                const tms = await getTeamsAction();
                const mems = await getOrganizationMembersAction();

                setDepartments(deps);
                setTeams(tms);
                setMembers(mems);

                if (initialRbacContext?.roleLevel && initialRbacContext.roleLevel >= 3) {
                    const reqs = await getPendingTeamRequestsAction();
                    setPendingRequests(reqs);
                }
            } catch (error) {
                console.error("Failed to load generic departments:", error);
            }
        }
        loadInitialData();
    }, [refreshKey, initialRbacContext?.roleLevel, initialRbacContext?.departmentId]);

    const containerRef = React.useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (departments.length === 0 && members.length === 0) return;

        gsap.fromTo('.gsap-stagger-item',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.4, stagger: { amount: 0.2 }, ease: "power2.out", clearProps: "all" }
        );
    }, [departments.length, members.length]);


    const roleName = (level: number) => {
        switch (level) {
            case 4: return 'Super Admin';
            case 3: return 'Department Head';
            case 2: return 'Team Lead';
            case 1: return 'Member';
            default: return 'Unknown';
        }
    };

    const roleColor = (level: number) => {
        switch (level) {
            case 4: return 'bg-purple-100 text-purple-700';
            case 3: return 'bg-blue-100 text-blue-700';
            case 2: return 'bg-emerald-100 text-emerald-700';
            case 1: return 'bg-slate-100 text-slate-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const handleProcessRequest = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
        try {
            await processTeamRequestAction(requestId, status);
            triggerRefresh();
        } catch (error) {
            console.error("Failed to process request:", error);
        }
    };

    // Ensure initialRbacContext is available before rendering content that depends on it
    if (isInitializing || !initialRbacContext) {
        return <div>Loading RBAC context...</div>; // Or a proper loading spinner
    }

    return (
        <div className="min-h-screen w-full bg-[#f8fafc] font-sans selection:bg-rose-100 text-slate-900 overflow-x-hidden">
            {/* Background elements */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-[#8b2635]/20 to-[#6d1d2b]/20 blur-[130px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-[#a63d40]/15 to-[#8b2635]/15 blur-[160px]" />
                <div className="absolute top-[20%] right-[10%] w-[35%] h-[35%] rounded-full bg-[#8b2635]/10 blur-[120px]" />
                <div className="absolute bottom-[20%] left-[10%] w-[45%] h-[45%] rounded-full bg-[#6d1d2b]/15 blur-[140px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay" />
            </div>

            <div className="flex relative z-10">
                {/* Sleek Glass Sidebar */}
                <Sidebar />

                <main className="flex-1 ml-72 min-h-screen p-8 lg:p-12" ref={containerRef}>
                    <div className="max-w-[1400px] mx-auto space-y-10">
                        {/* Header Section from Mockup */}
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-transparent rounded-md px-3 font-semibold text-xs uppercase tracking-wider shadow-none">
                                        Enterprise Edition
                                    </Badge>
                                </div>
                                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                                    Organization
                                </h1>
                                <p className="text-slate-500 mt-2 text-lg max-w-xl">
                                    Manage cross-functional departments and authority hierarchies.
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="relative w-64 lg:w-80 group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Search organization..."
                                        className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm text-slate-700 shadow-sm"
                                    />
                                </div>
                                {initialRbacContext.roleLevel === 4 && (
                                    <CreateDepartmentDialog
                                        users={members}
                                        onSuccess={triggerRefresh}
                                        trigger={
                                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md rounded-xl h-11 px-6 font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5">
                                                <Plus className="h-4 w-4 mr-2" /> New Entity
                                            </Button>
                                        }
                                    />
                                )}
                                <UserNav user={{}} />
                            </div>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="flex items-center p-1 bg-white border border-slate-200/60 rounded-xl w-fit shadow-sm">
                            <button
                                onClick={() => setActiveTab('map')}
                                className={cn(
                                    "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all",
                                    activeTab === 'map' ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                                )}
                            >
                                <Network className="h-4 w-4" />
                                Organization Map
                            </button>
                            <button
                                onClick={() => setActiveTab('personnel')}
                                className={cn(
                                    "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all",
                                    activeTab === 'personnel' ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                                )}
                            >
                                <Users className="h-4 w-4" />
                                Personnel
                            </button>
                            <button
                                onClick={() => setActiveTab('authority')}
                                className={cn(
                                    "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all",
                                    activeTab === 'authority' ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                                )}
                            >
                                <Shield className="h-4 w-4" />
                                Authority Control
                            </button>
                        </div>

                        {/* Tab Contents */}
                        <div className="mt-8 transition-all duration-300">
                            {activeTab === 'map' && (
                                <div className="space-y-6 gsap-stagger-item">
                                    {/* Pending Requests Section */}
                                    {pendingRequests.length > 0 && initialRbacContext.roleLevel >= 3 && (
                                        <Card className="border-indigo-100 bg-indigo-50/30 overflow-hidden rounded-2xl">
                                            <CardHeader className="pb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                                        <ShieldAlert className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-lg">Pending Governance Actions</CardTitle>
                                                        <CardDescription>Approval requests for team assignments within your jurisdiction.</CardDescription>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                {pendingRequests.map((req) => (
                                                    <div key={req.id} className="flex items-center justify-between p-4 bg-white border border-indigo-100 rounded-xl shadow-sm">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-sm">
                                                                {req.user.display_name?.charAt(0) || 'U'}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-slate-900">{req.user.display_name}</div>
                                                                <div className="text-xs text-slate-500">Requested for <span className="font-bold text-indigo-600">{req.team.name}</span> by {req.requester.display_name}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 text-xs border-slate-200 hover:bg-slate-50"
                                                                onClick={() => handleProcessRequest(req.id, 'REJECTED')}
                                                            >
                                                                Decline
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700"
                                                                onClick={() => handleProcessRequest(req.id, 'APPROVED')}
                                                            >
                                                                Approve
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Departments & Teams Grid */}
                                    <div className="space-y-6 pt-6">
                                        <div className="flex items-end justify-between px-2">
                                            <div>
                                                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                                                    <Building2 className="w-7 h-7 text-indigo-500 bg-indigo-50 p-1.5 rounded-lg" />
                                                    Departments Area
                                                </h2>
                                                <p className="text-slate-500 mt-1 text-sm">Organize and manage structural divisions across the company.</p>
                                            </div>
                                            {initialRbacContext.roleLevel === 4 && (
                                                <CreateDepartmentDialog
                                                    users={members}
                                                    onSuccess={triggerRefresh}
                                                    trigger={
                                                        <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md hover:shadow-lg transition-all">
                                                            <Plus className="h-4 w-4 mr-2" /> New Department
                                                        </Button>
                                                    }
                                                />
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 gap-6">
                                            {departments.map((dept) => {
                                                const isMyDept = initialRbacContext.departmentId === dept.id;
                                                const canManage = initialRbacContext.roleLevel === 4 || (initialRbacContext.roleLevel === 3 && isMyDept);

                                                return (
                                                    <Card key={dept.id} className={cn(
                                                        "gsap-stagger-item overflow-hidden border border-slate-200/60 shadow-sm bg-white rounded-2xl transition-all duration-300",
                                                        !isMyDept && initialRbacContext.roleLevel < 4 && "opacity-60 grayscale-[50%]"
                                                    )}>
                                                        <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100/80">
                                                            <div className="flex items-center gap-5">
                                                                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                                                                    <Building2 className="w-7 h-7" />
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-3">
                                                                        <h3 className="text-2xl font-bold text-slate-900">{dept.name}</h3>
                                                                        <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-transparent shadow-none px-2 rounded-md font-semibold text-xs">Dept</Badge>
                                                                    </div>
                                                                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 font-medium">
                                                                        <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-slate-400" /> {members.filter(m => m.department_id === dept.id).length} Members</span>
                                                                        <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-slate-400" /> {teams.filter(t => t.department_id === dept.id).length} Teams</span>
                                                                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-semibold">$450k Budget</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3 text-slate-400">
                                                                <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors"><Pencil className="w-5 h-5" /></button>
                                                                <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors"><ChevronUp className="w-5 h-5" /></button>
                                                            </div>
                                                        </div>
                                                        <CardContent className="p-6 md:p-8 bg-slate-50/30">
                                                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                                                                {teams.filter(t => t.department_id === dept.id).map(team => {
                                                                    const teamMembers = members.filter(m => m.memberships?.some((ms: any) => ms.team_id === team.id));
                                                                    const lead = members.find(m => m.id === team.lead_id);

                                                                    return (
                                                                        <div key={team.id} className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-300">
                                                                            <div className="mb-6">
                                                                                <h4 className="font-bold text-slate-900 text-lg">{team.name}</h4>
                                                                                <p className="text-sm text-slate-500 mt-1 font-medium">
                                                                                    Lead: <span className="text-slate-600">{lead ? lead.display_name : 'Unassigned'}</span>
                                                                                </p>
                                                                            </div>
                                                                            <div className="flex items-center justify-between">
                                                                                <div className="flex -space-x-2">
                                                                                    {teamMembers.slice(0, 4).map((m, i) => (
                                                                                        <div key={i} className="h-9 w-9 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center overflow-hidden ring-1 ring-black/5 z-0" style={{ zIndex: 10 - i }}>
                                                                                            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${m.id}`} alt={m.display_name || ''} className="w-full h-full object-cover" />
                                                                                        </div>
                                                                                    ))}
                                                                                    {teamMembers.length > 4 && (
                                                                                        <div className="h-9 w-9 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 z-0">
                                                                                            +{teamMembers.length - 4}
                                                                                        </div>
                                                                                    )}
                                                                                    {teamMembers.length === 0 && (
                                                                                        <span className="text-xs text-slate-400 font-medium px-1">No members</span>
                                                                                    )}
                                                                                </div>
                                                                                {canManage && (
                                                                                    <AssignTeamMemberDialog
                                                                                        teamId={team.id}
                                                                                        teamName={team.name}
                                                                                        departmentId={dept.id}
                                                                                        users={members}
                                                                                        onSuccess={triggerRefresh}
                                                                                        trigger={
                                                                                            <button className="text-xs font-bold text-indigo-700 tracking-wider uppercase hover:text-indigo-800 transition-colors">ASSIGN MEMBER</button>
                                                                                        }
                                                                                    />
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                })}

                                                                {canManage && (
                                                                    <CreateTeamDialog
                                                                        departmentId={dept.id}
                                                                        departmentName={dept.name}
                                                                        users={members}
                                                                        onSuccess={triggerRefresh}
                                                                        trigger={
                                                                            <button className="w-full h-full min-h-[140px] p-6 border-2 border-dashed border-slate-200/80 rounded-2xl flex flex-col items-center justify-center text-center gap-2 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 transition-all text-slate-500 hover:text-slate-700 font-semibold focus:outline-none">
                                                                                <span className="flex items-center gap-2"><Plus className="h-5 w-5" /> Add Team to {dept.name}</span>
                                                                            </button>
                                                                        }
                                                                    />
                                                                )}

                                                                {!canManage && teams.filter(t => t.department_id === dept.id).length === 0 && (
                                                                    <div className="col-span-full p-8 border-2 border-dashed border-slate-200/80 rounded-2xl flex flex-col items-center justify-center text-center gap-3 bg-slate-50/50">
                                                                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                                                            <Users className="h-6 w-6 text-slate-400" />
                                                                        </div>
                                                                        <p className="text-slate-500 font-medium">No teams initialized in this department yet.</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'personnel' && (
                                <div className="space-y-6 pt-2 gsap-stagger-item">
                                    {/* Personnel Roster Header */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 px-2">
                                        <h2 className="text-3xl font-extrabold text-slate-900">
                                            Personnel Roster
                                        </h2>
                                        <div className="flex items-center gap-3">
                                            <button className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm focus:outline-none">
                                                <Filter className="w-5 h-5" />
                                            </button>
                                            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                                                <button className="p-2 rounded-lg text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"><List className="w-5 h-5" /></button>
                                                <button className="p-2 rounded-lg bg-slate-900 text-white shadow-sm transition-colors focus:outline-none"><LayoutGrid className="w-5 h-5" /></button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm whitespace-nowrap">
                                                <thead className="bg-white border-b border-slate-100 text-slate-400 font-bold uppercase tracking-widest text-[11px]">
                                                    <tr>
                                                        <th className="px-8 py-6">Identity</th>
                                                        <th className="px-6 py-6">Authority Level</th>
                                                        <th className="px-6 py-6">Business Unit</th>
                                                        <th className="px-6 py-6">Connectivity</th>
                                                        <th className="px-8 py-6 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {members.map(member => {
                                                        const isManageable =
                                                            initialRbacContext.roleLevel === 4 ||
                                                            (initialRbacContext.roleLevel === 3 && member.department_id === initialRbacContext.departmentId) ||
                                                            (initialRbacContext.roleLevel === 2 && member.memberships?.some((ms: any) => ms.team_id === initialRbacContext.teamId));

                                                        const initials = member.display_name
                                                            ? member.display_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
                                                            : (member.email ? member.email.substring(0, 2).toUpperCase() : member.id.substring(0, 2).toUpperCase());

                                                        // Fake status logic for mockup (Super Admin away for fun, rest active)
                                                        const isActive = member.role_level !== 4;

                                                        return (
                                                            <tr key={member.id} className="gsap-stagger-item hover:bg-slate-50 transition-colors group/row">
                                                                <td className="px-8 py-5">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className={cn("w-12 h-12 rounded-full border-2 border-white shadow-sm flex items-center justify-center font-bold text-lg shrink-0", roleColor(member.role_level))}>
                                                                            {initials}
                                                                        </div>
                                                                        <div>
                                                                            <div className="font-bold text-slate-900 text-[15px] group-hover/row:text-indigo-600 transition-colors">
                                                                                {member.display_name || (member.email ? member.email.split('@')[0] : `User ${member.id.substring(0, 8)}`)}
                                                                            </div>
                                                                            <div className="text-[13px] text-slate-500 mt-0.5">{member.email || 'No email provided'}</div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-5">
                                                                    <Badge variant="outline" className={cn("px-3 py-1 min-w-[120px] justify-center text-xs border-transparent font-bold capitalize", roleColor(member.role_level))}>
                                                                        {roleName(member.role_level)}
                                                                    </Badge>
                                                                </td>
                                                                <td className="px-6 py-5 text-slate-700 font-semibold">
                                                                    {member.department?.name ? member.department.name : (
                                                                        <span className="text-slate-300 italic">Unassigned</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-6 py-5">
                                                                    <span className="flex items-center gap-2 text-slate-600 font-medium text-sm">
                                                                        <div className={cn("w-2 h-2 rounded-full", isActive ? "bg-emerald-400" : "bg-slate-300")}></div>
                                                                        {isActive ? 'Active' : 'Away'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-8 py-5 text-right">
                                                                    <ManageUserDialog
                                                                        userProfile={member}
                                                                        departments={departments}
                                                                        teams={teams}
                                                                        currentUserLevel={initialRbacContext.roleLevel}
                                                                        onSuccess={triggerRefresh}
                                                                        trigger={
                                                                            <Button variant="ghost" size="sm" className="opacity-0 group-hover/row:opacity-100 transition-opacity" disabled={!isManageable || member.id === initialRbacContext.userId}>
                                                                                <UserCog className="w-4 h-4 mr-2" />
                                                                                Manage
                                                                            </Button>
                                                                        }
                                                                    />
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'authority' && (
                                <div className="space-y-8 pt-2 gsap-stagger-item animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {/* Chain of Command */}
                                    <div className="bg-white rounded-[24px] p-8 md:p-10 text-slate-900 border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-4 mb-8">
                                                <div className="w-12 h-12 rounded-[14px] bg-slate-50 border border-slate-200 flex items-center justify-center">
                                                    <ShieldCheck className="w-6 h-6 text-indigo-500" strokeWidth={1.5} />
                                                </div>
                                                <div>
                                                    <h2 className="text-[26px] font-bold tracking-tight text-slate-900 mb-1">Access Chain of Command</h2>
                                                    <p className="text-slate-500 text-sm font-medium">Hierarchical structure of permissions natively inherited by levels.</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col xl:flex-row items-center justify-between gap-6">
                                                {/* Card 1: Member */}
                                                <div className="bg-slate-50 border border-slate-200/60 rounded-[16px] flex-1 w-full h-[180px] p-7 flex flex-col justify-between hover:border-slate-300 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-slate-200/50 flex items-center justify-center text-slate-600">
                                                            <User className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-900 text-[15px] mb-1">Member</div>
                                                            <div className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">Lvl 1 Access</div>
                                                        </div>
                                                    </div>
                                                    <p className="text-[13px] text-slate-500 leading-relaxed font-medium mt-4">Personal workspace visibility and standard tooling access.</p>
                                                </div>

                                                <ArrowRight className="text-slate-300 hidden xl:block shrink-0 w-5 h-5" />

                                                {/* Card 2: Team Lead */}
                                                <div className="bg-emerald-50/50 border border-emerald-100 rounded-[16px] flex-1 w-full h-[180px] p-7 flex flex-col justify-between hover:border-emerald-200 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                            <Zap className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-emerald-900 text-[15px] mb-1">Team Lead</div>
                                                            <div className="text-[10px] text-emerald-600 font-bold tracking-wider uppercase">Lvl 2 Access</div>
                                                        </div>
                                                    </div>
                                                    <p className="text-[13px] text-emerald-700/80 leading-relaxed font-medium mt-4">Management of team members, project assignments and squad settings.</p>
                                                </div>

                                                <ArrowRight className="text-slate-300 hidden xl:block shrink-0 w-5 h-5" />

                                                {/* Card 3: Department Head */}
                                                <div className="bg-blue-50/50 border border-blue-100 rounded-[16px] flex-1 w-full h-[180px] p-7 flex flex-col justify-between hover:border-blue-200 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                            <Building2 className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-blue-900 text-[15px] mb-1">Department Head</div>
                                                            <div className="text-[10px] text-blue-600 font-bold tracking-wider uppercase">Lvl 3 Access</div>
                                                        </div>
                                                    </div>
                                                    <p className="text-[13px] text-blue-700/80 leading-relaxed font-medium mt-4">Department-wide oversight, cross-team performance analytics and budget controls.</p>
                                                </div>

                                                <ArrowRight className="text-slate-300 hidden xl:block shrink-0 w-5 h-5" />

                                                {/* Card 4: Super Admin */}
                                                <div className="bg-indigo-50 border border-indigo-100 rounded-[16px] flex-1 w-full h-[180px] p-7 flex flex-col justify-between hover:border-indigo-200 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-md">
                                                            <Shield className="w-4 h-4 fill-indigo-200" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-indigo-900 text-[15px] mb-1">Super Admin</div>
                                                            <div className="text-[10px] text-indigo-600 font-bold tracking-wider uppercase">Lvl 4 Access</div>
                                                        </div>
                                                    </div>
                                                    <p className="text-[13px] text-indigo-700/80 leading-relaxed font-medium mt-4">Unrestricted access to global settings, billing infrastructure, and core architecture.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Permission Matrix */}
                                    <div className="bg-white rounded-[24px] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden mt-6">
                                        <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                                                    <Lock className="w-7 h-7" />
                                                </div>
                                                <div>
                                                    <h3 className="text-[22px] font-bold text-slate-900 mb-1">Permission Capabilities</h3>
                                                    <p className="text-sm text-slate-500 font-medium">Fine-grained platform access mapping across all roles.</p>
                                                </div>
                                            </div>
                                            <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-[0_4px_14px_rgba(79,70,229,0.39)] transition-colors whitespace-nowrap focus:outline-none">
                                                Default Security Profiles
                                            </button>
                                        </div>

                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm whitespace-nowrap">
                                                <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-widest text-[11px] border-b border-slate-100">
                                                    <tr>
                                                        <th className="px-8 py-5 w-[40%]">Capability Name</th>
                                                        <th className="px-6 py-5 text-center">Member</th>
                                                        <th className="px-6 py-5 text-center">Team Lead</th>
                                                        <th className="px-6 py-5 text-center">Dept Head</th>
                                                        <th className="px-6 py-5 text-center">Super Admin</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100/60">
                                                    {/* Section Header */}
                                                    <tr className="bg-slate-50/40">
                                                        <td colSpan={5} className="px-8 py-4 text-xs font-extrabold text-slate-800 tracking-wider uppercase">
                                                            Organization Management
                                                        </td>
                                                    </tr>

                                                    {/* Rows */}
                                                    <tr className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-8 py-4 font-semibold text-slate-700">Create/Delete Departments</td>
                                                        <td className="px-6 py-4"><Lock className="w-4 h-4 text-slate-300 mx-auto" /></td>
                                                        <td className="px-6 py-4"><Lock className="w-4 h-4 text-slate-300 mx-auto" /></td>
                                                        <td className="px-6 py-4"><Lock className="w-4 h-4 text-slate-300 mx-auto" /></td>
                                                        <td className="px-6 py-4"><Check className="w-5 h-5 text-emerald-500 mx-auto" strokeWidth={3} /></td>
                                                    </tr>
                                                    <tr className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-8 py-4 font-semibold text-slate-700">Assign Users to Teams</td>
                                                        <td className="px-6 py-4"><Lock className="w-4 h-4 text-slate-300 mx-auto" /></td>
                                                        <td className="px-6 py-4"><Check className="w-5 h-5 text-emerald-500 mx-auto" strokeWidth={3} /></td>
                                                        <td className="px-6 py-4"><Check className="w-5 h-5 text-emerald-500 mx-auto" strokeWidth={3} /></td>
                                                        <td className="px-6 py-4"><Check className="w-5 h-5 text-emerald-500 mx-auto" strokeWidth={3} /></td>
                                                    </tr>
                                                    <tr className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-8 py-4 font-semibold text-slate-700">Billing & Subscriptions</td>
                                                        <td className="px-6 py-4"><Lock className="w-4 h-4 text-slate-300 mx-auto" /></td>
                                                        <td className="px-6 py-4"><Lock className="w-4 h-4 text-slate-300 mx-auto" /></td>
                                                        <td className="px-6 py-4"><Lock className="w-4 h-4 text-slate-300 mx-auto" /></td>
                                                        <td className="px-6 py-4"><Check className="w-5 h-5 text-emerald-500 mx-auto" strokeWidth={3} /></td>
                                                    </tr>

                                                    {/* Section Header */}
                                                    <tr className="bg-slate-50/40">
                                                        <td colSpan={5} className="px-8 py-4 text-xs font-extrabold text-slate-800 tracking-wider uppercase border-t border-slate-100">
                                                            Project Visibility
                                                        </td>
                                                    </tr>
                                                    <tr className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-8 py-4 font-semibold text-slate-700">View Active Sprints</td>
                                                        <td className="px-6 py-4 text-center text-slate-500 font-bold text-xs uppercase tracking-wider">Self Only</td>
                                                        <td className="px-6 py-4 text-center text-slate-500 font-bold text-xs uppercase tracking-wider">Team Only</td>
                                                        <td className="px-6 py-4 text-center text-slate-500 font-bold text-xs uppercase tracking-wider">Dept Only</td>
                                                        <td className="px-6 py-4 text-center text-indigo-600 bg-indigo-50 rounded-lg mx-6 inline-block font-bold text-xs uppercase tracking-wider py-1">Global</td>
                                                    </tr>
                                                    <tr className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-8 py-4 font-semibold text-slate-700">Edit Task Priorities</td>
                                                        <td className="px-6 py-4"><Lock className="w-4 h-4 text-slate-300 mx-auto" /></td>
                                                        <td className="px-6 py-4"><Check className="w-5 h-5 text-emerald-500 mx-auto" strokeWidth={3} /></td>
                                                        <td className="px-6 py-4"><Check className="w-5 h-5 text-emerald-500 mx-auto" strokeWidth={3} /></td>
                                                        <td className="px-6 py-4"><Check className="w-5 h-5 text-emerald-500 mx-auto" strokeWidth={3} /></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
