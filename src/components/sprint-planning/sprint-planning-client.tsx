
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
  Presentation
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
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

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
                <div className="space-y-8">
                  <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <CardHeader>
                      <CardTitle>Sprint Duration</CardTitle>
                      <CardDescription>Define the timeline for this sprint cycle.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Start & End Date
                          </label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal h-11 border-zinc-300 dark:border-zinc-700",
                                  !date && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4 text-zinc-500" />
                                {date?.from ? (
                                  date.to ? (
                                    <>
                                      {format(date.from, "LLL dd, y")} -{" "}
                                      {format(date.to, "LLL dd, y")}
                                    </>
                                  ) : (
                                    format(date.from, "LLL dd, y")
                                  )
                                ) : (
                                  <span>Pick a date range</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={2}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium leading-none">Working Days</label>
                          <div className="flex items-center h-11 px-4 rounded-md border border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900">
                            <span className="text-2xl font-bold text-primary mr-2">{calculateSprintDays()}</span>
                            <span className="text-sm text-muted-foreground">days</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <CardHeader>
                      <CardTitle>Sprint Cadence</CardTitle>
                      <CardDescription>Verify the routine capabilities.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground italic">
                        Calculated velocity settings and capacity planning inputs will appear here.
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeSection !== 'general' && (
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
