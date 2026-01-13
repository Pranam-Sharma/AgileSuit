'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import {
  Loader2,
  LogOut,
  ChevronLeft,
  CheckCircle2,
  Circle,
  Calendar as CalendarIcon,
  LayoutDashboard,
  Users,
  Target,
  FileText,
  ShieldCheck,
  Save,
  BarChart3,
  Milestone,
  Presentation,
  Info,
  Crown,
  Shield,
  Code,
  Bug,
  Palette,
  Briefcase,
  Zap,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '../logo';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Sprint } from '../dashboard/create-sprint-dialog';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { DateRange } from 'react-day-picker';
import { addDays, format, isWeekend } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';

// --- Types ---

type ChecklistState = Record<string, boolean>;

type SprintPlanningClientProps = {
  sprintId: string;
};

// --- Constants ---

const PLANNING_SECTIONS = [
  { id: 'general', label: 'General Info', icon: LayoutDashboard, description: 'Dates, duration, and capacity.' },
  { id: 'team', label: 'Team Composition', icon: Users, description: 'Availability and role assignments.' },
  { id: 'priority', label: 'Project Priority', icon: FileText, description: 'Focus areas for this sprint.' },
  { id: 'metrics', label: 'Platform Metrics', icon: BarChart3, description: 'KPIs and success criteria.' },
  { id: 'goals', label: 'Sprint Goals', icon: Target, description: 'Primary objectives.' },
  { id: 'milestones', label: 'Milestones', icon: Milestone, description: 'Project tracking.' },
  { id: 'demo', label: 'Sprint Demo', icon: Presentation, description: 'Demo plan and owner.' },
  { id: 'security', label: 'Security Audit', icon: ShieldCheck, description: 'Compliance checks.' },
  { id: 'save', label: 'Review & Save', icon: Save, description: 'Finalize planning.' },
];

const CHECKLIST_ITEMS = [
  { id: 'dates', label: 'Confirm Dates' },
  { id: 'members', label: 'Confirm Members' },
  { id: 'points', label: 'Target Points' },
  { id: 'goals', label: 'Sprint Goals' },
  { id: 'backlog', label: 'Backlog Ready' },
  { id: 'assignments', label: 'Tasks Assigned' },
  { id: 'demoTopic', label: 'Demo Topic' },
  { id: 'demoPic', label: 'Demo Owner' },
  { id: 'security', label: 'Security Audit' },
];

// --- Sub-Components ---

function UserNav({ user }: { user: User }) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const userInitial = user.email ? user.email.charAt(0).toUpperCase() : 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-white/10 hover:ring-white/20 transition-all">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.user_metadata?.avatar_url || ''} alt={user.user_metadata?.full_name || ''} />
            <AvatarFallback className='bg-primary text-white font-medium'>{userInitial}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.user_metadata?.full_name || 'User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600 focus:bg-red-50">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ChecklistSidebar({ checklist, onToggle }: { checklist: ChecklistState, onToggle: (id: string) => void }) {
  const completedCount = Object.values(checklist).filter(Boolean).length;
  const progress = Math.round((completedCount / CHECKLIST_ITEMS.length) * 100);

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="p-0 pb-4">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Planning Progress
          </CardTitle>
          <span className="text-xs font-bold text-primary">{progress}%</span>
        </div>
        <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0 space-y-1">
        {CHECKLIST_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => onToggle(item.id)}
            className={cn(
              "flex items-center w-full gap-3 p-2 rounded-md text-sm transition-all text-left group",
              checklist[item.id]
                ? "text-zinc-600 dark:text-zinc-400"
                : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
            )}
          >
            <div className={cn(
              "h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
              checklist[item.id]
                ? "border-green-500 bg-green-500 text-white border-transparent"
                : "border-zinc-300 dark:border-zinc-700 group-hover:border-zinc-400"
            )}>
              {checklist[item.id] && <CheckCircle2 className="h-3.5 w-3.5" />}
            </div>
            <span className={cn(
              "truncate transition-all",
              checklist[item.id] && "line-through opacity-70"
            )}>
              {item.label}
            </span>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

// --- Main Component ---

export function SprintPlanningClient({ sprintId }: SprintPlanningClientProps) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = React.useState(true);

  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const [sprint, setSprint] = React.useState<(Sprint & { id: string }) | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeSection, setActiveSection] = React.useState('general');
  const [checklist, setChecklist] = React.useState<ChecklistState>(() =>
    CHECKLIST_ITEMS.reduce((acc, item) => ({ ...acc, [item.id]: false }), {})
  );

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 13),
  });

  // Project Priorities State
  const [projects, setProjects] = React.useState<Array<{
    id: string;
    name: string;
    priority: 'critical' | 'high' | 'medium' | 'low' | 'negligible';
    remarks: string;
  }>>([
    {
      id: '1',
      name: 'User Authentication Overhaul',
      priority: 'critical',
      remarks: 'Security vulnerability fix'
    },
    {
      id: '2',
      name: 'Dashboard Redesign',
      priority: 'medium',
      remarks: 'UX improvements'
    }
  ]);

  const addProject = () => {
    const newProject = {
      id: Date.now().toString(),
      name: '',
      priority: 'medium' as const,
      remarks: ''
    };
    setProjects(prev => [...prev, newProject]);
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const moveProject = (id: string, direction: 'up' | 'down') => {
    setProjects(prev => {
      const index = prev.findIndex(p => p.id === id);
      if (index === -1) return prev;
      if (direction === 'up' && index === 0) return prev;
      if (direction === 'down' && index === prev.length - 1) return prev;

      const newProjects = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [newProjects[index], newProjects[targetIndex]] = [newProjects[targetIndex], newProjects[index]];
      return newProjects;
    });
  };

  const updateProject = (id: string, field: 'name' | 'priority' | 'remarks', value: string) => {
    setProjects(prev => prev.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const handleChecklistToggle = (id: string) => {
    setChecklist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const calculateSprintDays = React.useCallback(() => {
    if (!date || !date.from || !date.to) return 0;
    let count = 0;
    let currentDate = new Date(date.from);
    const endDate = new Date(date.to);
    const dayBeforeEnd = new Date(endDate);
    dayBeforeEnd.setDate(endDate.getDate() - 1);
    if (currentDate > dayBeforeEnd) return 0;
    while (currentDate <= dayBeforeEnd) {
      if (!isWeekend(currentDate)) count++;
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return count;
  }, [date]);

  // Auth & Fetch Layout
  React.useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push('/login');
      } else {
        setUser(user);
      }
      setIsUserLoading(false);
    };
    checkUser();
  }, [router, supabase.auth]);

  React.useEffect(() => {
    if (isUserLoading) return;
    if (!user) return;

    const fetchSprint = async () => {
      setIsLoading(true);
      try {
        const { getSprintAction } = await import('@/app/actions/sprints');
        const sprintData = await getSprintAction(sprintId);

        if (sprintData) {
          setSprint(sprintData as any);
        } else {
          setSprint(null);
          toast({
            title: 'Sprint Not Found',
            description: "The sprint you are trying to plan for doesn't exist.",
            variant: 'destructive',
          });
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSprint();
  }, [sprintId, user, isUserLoading, toast]);

  if (isUserLoading || isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-50" />
      </div>
    );
  }

  if (!sprint) return null;

  return (
    <div className="flex h-screen w-full flex-col bg-zinc-50 dark:bg-zinc-950 overflow-hidden font-sans">

      {/* Top Navigation */}
      {/* Top Navigation */}
      <header className="flex-shrink-0 h-14 bg-primary border-b border-primary/10 flex items-center justify-between px-6 z-20 shadow-md">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10" onClick={() => router.back()}>
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-4 divide-x divide-white/20">
            <Logo variant="white" className="hidden md:flex" />
            <div className="pl-4 flex flex-col">
              <h1 className="text-lg font-bold text-white leading-tight">
                {sprint.sprintName}
              </h1>
              <div className="flex items-center gap-2 text-xs text-white/80">
                <span className="font-medium bg-white/20 px-1.5 py-0.5 rounded text-white">#{sprint.sprintNumber}</span>
                <span className="text-white">{sprint.department}</span>
              </div>
            </div>
          </div>
        </div>
        <UserNav user={user} />
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar Navigation */}
        <aside className="w-64 hidden xl:flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
          <div className="flex-1 overflow-y-auto p-4 space-y-6">

            {/* Navigation Menu */}
            <div className="space-y-1">
              <h3 className="px-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Sections</h3>
              {PLANNING_SECTIONS.map(section => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-md transition-all",
                      isActive
                        ? "bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-300"
                        : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", isActive ? "text-violet-600" : "text-zinc-400")} />
                    {section.label}
                  </button>
                )
              })}
            </div>

            <Separator />

            {/* Checklist Component */}
            <ChecklistSidebar checklist={checklist} onToggle={handleChecklistToggle} />

          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 scroll-smooth">
          <div className="w-full max-w-none mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header for Active Section */}
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {PLANNING_SECTIONS.find(s => s.id === activeSection)?.label}
              </h2>
              <p className="text-muted-foreground mt-1">
                {PLANNING_SECTIONS.find(s => s.id === activeSection)?.description}
              </p>
            </div>

            <Separator />

            {/* Content Switcher */}
            <div className="min-h-[400px]">
              {activeSection === 'general' && (
                <div className="space-y-6">
                  {/* General Information Card */}
                  <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <CardHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10 shadow-sm">
                          <LayoutDashboard className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50">General Information</CardTitle>
                          <CardDescription>Setup the foundational details for this sprint.</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-8 pt-8">

                      {/* Reference Sprint Section */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-baseline">
                          <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            Reference Sprint
                          </label>
                          <span className="text-xs text-muted-foreground">Optional source for targets</span>
                        </div>
                        <Select>
                          <SelectTrigger className="h-12 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus:ring-primary/20 transition-all hover:border-primary/50">
                            <SelectValue placeholder="Select a past sprint to copy data..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sprint-45">Sprint 45 - Checkout Flow (Past)</SelectItem>
                            <SelectItem value="sprint-44">Sprint 44 - Auth (Past)</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Theme-Consistent Info Alert */}
                        <div className="rounded-lg bg-primary/5 p-4 border border-primary/10 flex gap-3 items-start">
                          <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                            <Info className="h-3 w-3 text-primary" />
                          </div>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Selection will pull <span className="font-medium text-primary">Team Velocity</span>, <span className="font-medium text-primary">Goals</span>, and <span className="font-medium text-primary">Milestones</span> from the reference sprint to populate your target baselines.
                          </p>
                        </div>
                      </div>

                      <Separator />

                      {/* Date & Duration Section */}
                      <div className="grid gap-6 md:grid-cols-3">

                        {/* Days in Sprint */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Sprint Duration</label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-primary transition-colors" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Working days (excludes weekends)</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <div className="relative group">
                            <div className="absolute inset-0 bg-primary/5 rounded-md -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="h-12 flex items-center px-4 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 font-mono text-lg font-medium shadow-sm group-hover:border-primary/30 transition-colors">
                              {calculateSprintDays()}
                              <span className="ml-2 text-xs text-muted-foreground font-sans font-normal uppercase tracking-wider">Work Days</span>
                            </div>
                          </div>
                        </div>

                        {/* Start Date */}
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Start Date</label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full h-12 justify-start text-left font-normal border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-primary/30 transition-all",
                                  !date?.from && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4 text-primary/70" />
                                {date?.from ? format(date.from, "PPP") : <span>Pick a date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={date?.from}
                                onSelect={(selected) => setDate(prev => ({ ...prev, from: selected, to: prev?.to }))}
                                initialFocus
                                className="rounded-md border border-zinc-100 shadow-xl"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* End Date */}
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">End Date</label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full h-12 justify-start text-left font-normal border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-primary/30 transition-all",
                                  !date?.to && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4 text-primary/70" />
                                {date?.to ? format(date.to, "PPP") : <span>Pick a date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={date?.to}
                                onSelect={(selected) => setDate(prev => ({ ...prev, to: selected, from: prev?.from }))}
                                initialFocus
                                className="rounded-md border border-zinc-100 shadow-xl"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeSection === 'team' && (
                <div className="space-y-6">
                  {/* Team Composition Card */}
                  <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <CardHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10 shadow-sm">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Team Composition</CardTitle>
                          <CardDescription>Assign team members and define their roles for this sprint.</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-8 pt-8">

                      {/* Team Roles Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Product Owners */}
                        <div className="group space-y-3 p-5 rounded-xl border-2 border-zinc-100 dark:border-zinc-800 hover:border-primary/30 hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-zinc-50/50 dark:from-zinc-950 dark:to-zinc-900/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Crown className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Product Owners</h4>
                                <p className="text-xs text-muted-foreground">Strategic vision</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-400">
                              0 / 2
                            </Badge>
                          </div>
                          <Select>
                            <SelectTrigger className="h-11 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-primary/50 transition-colors">
                              <SelectValue placeholder="Select Product Owners..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="po-1">Sarah Johnson</SelectItem>
                              <SelectItem value="po-2">Michael Chen</SelectItem>
                              <SelectItem value="po-3">Emily Rodriguez</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Scrum Masters */}
                        <div className="group space-y-3 p-5 rounded-xl border-2 border-zinc-100 dark:border-zinc-800 hover:border-primary/30 hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-zinc-50/50 dark:from-zinc-950 dark:to-zinc-900/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Scrum Masters</h4>
                                <p className="text-xs text-muted-foreground">Process guardians</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-400">
                              0 / 2
                            </Badge>
                          </div>
                          <Select>
                            <SelectTrigger className="h-11 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-primary/50 transition-colors">
                              <SelectValue placeholder="Select Scrum Masters..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sm-1">David Kim</SelectItem>
                              <SelectItem value="sm-2">Lisa Wang</SelectItem>
                              <SelectItem value="sm-3">James Anderson</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Developers */}
                        <div className="group space-y-3 p-5 rounded-xl border-2 border-zinc-100 dark:border-zinc-800 hover:border-primary/30 hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-zinc-50/50 dark:from-zinc-950 dark:to-zinc-900/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Code className="h-5 w-5 text-green-600 dark:text-green-500" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Developers</h4>
                                <p className="text-xs text-muted-foreground">Core builders</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs border-green-200 dark:border-green-900 text-green-700 dark:text-green-400">
                              0 / 8
                            </Badge>
                          </div>
                          <Select>
                            <SelectTrigger className="h-11 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-primary/50 transition-colors">
                              <SelectValue placeholder="Select Developers..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="dev-1">Alex Thompson</SelectItem>
                              <SelectItem value="dev-2">Rachel Green</SelectItem>
                              <SelectItem value="dev-3">Tom Martinez</SelectItem>
                              <SelectItem value="dev-4">Nina Patel</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* QA Engineers */}
                        <div className="group space-y-3 p-5 rounded-xl border-2 border-zinc-100 dark:border-zinc-800 hover:border-primary/30 hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-zinc-50/50 dark:from-zinc-950 dark:to-zinc-900/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Bug className="h-5 w-5 text-purple-600 dark:text-purple-500" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">QA Engineers</h4>
                                <p className="text-xs text-muted-foreground">Quality assurance</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-400">
                              0 / 3
                            </Badge>
                          </div>
                          <Select>
                            <SelectTrigger className="h-11 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-primary/50 transition-colors">
                              <SelectValue placeholder="Select QA Engineers..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="qa-1">Sophie Miller</SelectItem>
                              <SelectItem value="qa-2">Chris Davis</SelectItem>
                              <SelectItem value="qa-3">Maya Singh</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* UI/UX Designers */}
                        <div className="group space-y-3 p-5 rounded-xl border-2 border-zinc-100 dark:border-zinc-800 hover:border-primary/30 hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-zinc-50/50 dark:from-zinc-950 dark:to-zinc-900/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-lg bg-pink-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Palette className="h-5 w-5 text-pink-600 dark:text-pink-500" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">UI/UX Designers</h4>
                                <p className="text-xs text-muted-foreground">User experience</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs border-pink-200 dark:border-pink-900 text-pink-700 dark:text-pink-400">
                              0 / 2
                            </Badge>
                          </div>
                          <Select>
                            <SelectTrigger className="h-11 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-primary/50 transition-colors">
                              <SelectValue placeholder="Select Designers..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="des-1">Emma Wilson</SelectItem>
                              <SelectItem value="des-2">Lucas Brown</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Project Managers */}
                        <div className="group space-y-3 p-5 rounded-xl border-2 border-zinc-100 dark:border-zinc-800 hover:border-primary/30 hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-zinc-50/50 dark:from-zinc-950 dark:to-zinc-900/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Briefcase className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Project Managers</h4>
                                <p className="text-xs text-muted-foreground">Execution leads</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs border-primary/20 text-primary">
                              0 / 2
                            </Badge>
                          </div>
                          <Select>
                            <SelectTrigger className="h-11 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-primary/50 transition-colors">
                              <SelectValue placeholder="Select Project Managers..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pm-1">Jessica Lee</SelectItem>
                              <SelectItem value="pm-2">Robert Taylor</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                      </div>

                      {/* Team Summary */}
                      <Separator />
                      <div className="rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 p-6 border border-primary/20">
                        <div className="flex items-start gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Team Size Overview</h4>
                            <p className="text-sm text-muted-foreground mb-4">
                              Current team composition: <strong>0 members</strong> assigned across <strong>6 roles</strong>
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="secondary" className="text-xs">
                                <Target className="h-3 w-3 mr-1" />
                                Recommended: 12-15 members
                              </Badge>
                              <Badge variant="outline" className="text-xs border-primary/20 text-primary">
                                <Zap className="h-3 w-3 mr-1" />
                                Velocity: TBD
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                    </CardContent>
                  </Card>
                </div>
              )}

              {activeSection === 'priority' && (
                <div className="space-y-6">
                  {/* Project Priority Card */}
                  <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <CardHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10 shadow-sm">
                          <Target className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Project Priority</CardTitle>
                          <CardDescription>Define and prioritize projects for this sprint cycle.</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-8">

                      {/* Priority Distribution Summary */}
                      <div className="rounded-xl bg-gradient-to-br from-zinc-50 to-zinc-100/50 dark:from-zinc-900/50 dark:to-zinc-800/30 p-6 border border-zinc-200 dark:border-zinc-800 mb-6 relative overflow-hidden">

                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

                        <div className="flex items-center justify-between mb-6 relative z-10">
                          <div>
                            <h4 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                              <BarChart3 className="h-5 w-5 text-primary" />
                              Priority Distribution
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              Overview of project urgency and impact
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{projects.length}</span>
                            <span className="text-sm text-muted-foreground ml-2">Total Projects</span>
                          </div>
                        </div>

                        {/* Visual Distribution Bar */}
                        <div className="w-full h-4 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex mb-6 shadow-inner">
                          {['critical', 'high', 'medium', 'low', 'negligible'].map((priority) => {
                            const count = projects.filter(p => p.priority === priority).length;
                            if (count === 0) return null;
                            const width = (count / projects.length) * 100;
                            let colorClass = '';
                            switch (priority) {
                              case 'critical': colorClass = 'bg-red-500'; break;
                              case 'high': colorClass = 'bg-orange-500'; break;
                              case 'medium': colorClass = 'bg-yellow-500'; break;
                              case 'low': colorClass = 'bg-blue-500'; break;
                              case 'negligible': colorClass = 'bg-gray-500'; break;
                            }
                            return (
                              <div
                                key={priority}
                                style={{ width: `${width}%` }}
                                className={`${colorClass} h-full transition-all duration-500 ease-out border-r border-white/20 last:border-0`}
                                title={`${priority.charAt(0).toUpperCase() + priority.slice(1)}: ${count}`}
                              />
                            );
                          })}
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 relative z-10">
                          {[
                            { id: 'critical', label: 'Critical', color: 'text-red-600 dark:text-red-500', bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-100 dark:border-red-900/50', indicator: 'bg-red-500' },
                            { id: 'high', label: 'High', color: 'text-orange-600 dark:text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-100 dark:border-orange-900/50', indicator: 'bg-orange-500' },
                            { id: 'medium', label: 'Medium', color: 'text-yellow-600 dark:text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950/30', border: 'border-yellow-100 dark:border-yellow-900/50', indicator: 'bg-yellow-500' },
                            { id: 'low', label: 'Low', color: 'text-blue-600 dark:text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-100 dark:border-blue-900/50', indicator: 'bg-blue-500' },
                            { id: 'negligible', label: 'Negligible', color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-900/30', border: 'border-gray-100 dark:border-gray-800', indicator: 'bg-gray-500' }
                          ].map((stat) => {
                            const count = projects.filter(p => p.priority === stat.id).length;
                            return (
                              <div key={stat.id} className={`p-4 rounded-xl border ${stat.bg} ${stat.border} flex flex-col items-center justify-center transition-transform hover:scale-105 duration-200`}>
                                <div className={`text-3xl font-bold ${stat.color} mb-1 tracking-tight`}>{count}</div>
                                <div className="flex items-center gap-1.5">
                                  <div className={`w-2 h-2 rounded-full ${stat.indicator}`} />
                                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <Separator className="mb-6" />

                      {/* Priority Info Banner */}
                      <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-5 border border-amber-200/50 dark:border-amber-800/30">
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                            <Info className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-amber-900 dark:text-amber-100 mb-1">Priority Guidelines</h4>
                            <p className="text-xs text-amber-700 dark:text-amber-300">
                              Rank projects by business impact and urgency. Critical projects require immediate attention, while lower priorities can be deferred if capacity is limited.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Project List */}
                      <div className="space-y-4">
                        {projects.map((project, index) => {
                          const getPriorityColor = (priority: string) => {
                            switch (priority) {
                              case 'critical': return 'from-red-500 to-red-600';
                              case 'high': return 'from-orange-500 to-orange-600';
                              case 'medium': return 'from-yellow-500 to-yellow-600';
                              case 'low': return 'from-blue-500 to-blue-600';
                              case 'negligible': return 'from-gray-500 to-gray-600';
                              default: return 'from-gray-500 to-gray-600';
                            }
                          };

                          return (
                            <div key={project.id} className="group relative rounded-xl border-2 border-zinc-200 dark:border-zinc-800 hover:border-primary/30 transition-all duration-300 bg-white dark:bg-zinc-950 overflow-hidden">
                              {/* Priority Indicator Strip */}
                              <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${getPriorityColor(project.priority)}`} />

                              <div className="p-5 pl-6">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                                  {/* Drag Handle / Reorder Buttons */}
                                  <div className="hidden lg:flex lg:col-span-1 flex-col items-center justify-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                                      onClick={() => moveProject(project.id, 'up')}
                                      disabled={index === 0}
                                    >
                                      <ArrowUp className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                                      onClick={() => moveProject(project.id, 'down')}
                                      disabled={index === projects.length - 1}
                                    >
                                      <ArrowDown className="h-3 w-3" />
                                    </Button>
                                  </div>

                                  {/* Project Name */}
                                  <div className="lg:col-span-4">
                                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5 block">Project Name</label>
                                    <Input
                                      placeholder="Enter project name..."
                                      className="h-10 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:border-primary/50 transition-colors"
                                      value={project.name}
                                      onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                                    />
                                  </div>

                                  {/* Priority */}
                                  <div className="lg:col-span-3">
                                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5 block">Priority Level</label>
                                    <Select value={project.priority} onValueChange={(value) => updateProject(project.id, 'priority', value)}>
                                      <SelectTrigger className="h-10 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="critical">
                                          <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-red-500" />
                                            <span>Critical</span>
                                          </div>
                                        </SelectItem>
                                        <SelectItem value="high">
                                          <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-orange-500" />
                                            <span>High</span>
                                          </div>
                                        </SelectItem>
                                        <SelectItem value="medium">
                                          <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-yellow-500" />
                                            <span>Medium</span>
                                          </div>
                                        </SelectItem>
                                        <SelectItem value="low">
                                          <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                                            <span>Low</span>
                                          </div>
                                        </SelectItem>
                                        <SelectItem value="negligible">
                                          <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-gray-500" />
                                            <span>Negligible</span>
                                          </div>
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  {/* Remarks */}
                                  <div className="lg:col-span-3">
                                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5 block">Remarks</label>
                                    <Input
                                      placeholder="Brief notes..."
                                      className="h-10 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:border-primary/50 transition-colors"
                                      value={project.remarks}
                                      onChange={(e) => updateProject(project.id, 'remarks', e.target.value)}
                                    />
                                  </div>

                                  {/* Delete Button */}
                                  <div className="lg:col-span-1 flex items-end justify-end">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-10 w-10 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => deleteProject(project.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Add Project Button */}
                      <Button
                        variant="outline"
                        className="w-full h-12 border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                        onClick={addProject}
                      >
                        <Plus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                        Add Project Priority
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeSection !== 'general' && activeSection !== 'team' && activeSection !== 'priority' && (
                <div className="flex flex-col items-center justify-center p-12 text-center rounded-lg border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
                  <div className="h-12 w-12 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
                    {React.createElement(PLANNING_SECTIONS.find(s => s.id === activeSection)?.icon || Circle, { className: "h-6 w-6 text-zinc-400" })}
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {PLANNING_SECTIONS.find(s => s.id === activeSection)?.label} Content
                  </h3>
                  <p className="text-muted-foreground max-w-sm mt-2">
                    This section is tailored for <strong>{activeSection}</strong> planning tasks. Form fields will be implemented here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
