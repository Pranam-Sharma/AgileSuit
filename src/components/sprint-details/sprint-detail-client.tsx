'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  ClipboardList,
  Briefcase,
  History,
  Loader2,
  LogOut,
  ChevronLeft,
  CalendarDays,
  Users,
  ArrowRight,
  Target,
  CheckCircle2,
  Zap,
  TrendingUp,
  AlertCircle,
  Clock,
  Smile
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
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const getStatusBadgeStyle = (status?: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-500/20 text-white border-green-300/30';
    case 'completed':
      return 'bg-blue-500/20 text-white border-blue-300/30';
    case 'archived':
      return 'bg-slate-500/20 text-white border-slate-300/30';
    case 'planning':
    default:
      return 'bg-white/20 text-white border-white/30';
  }
};

const getStatusLabel = (status?: string) => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'completed':
      return 'Completed';
    case 'archived':
      return 'Archived';
    case 'planning':
    default:
      return 'Planning';
  }
};

function UserNav({ user }: { user: any }) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-white/10 ring-2 ring-white/10 transition-shadow hover:ring-white/30">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.photoURL ?? ''} alt={user?.displayName ?? ''} />
            <AvatarFallback className="bg-primary-foreground/10 text-white font-medium">{userInitial}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.displayName ?? 'User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type SprintDetailClientProps = {
  sprint?: Sprint & { id: string };
  sprintId: string;
};

export function SprintDetailClient({ sprint: initialSprint, sprintId }: SprintDetailClientProps) {
  const [user, setUser] = React.useState<any>(null);
  const [isUserLoading, setIsUserLoading] = React.useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const [sprint, setSprint] = React.useState<(Sprint & { id: string }) | undefined>(initialSprint);
  const [isLoadingSprint, setIsLoadingSprint] = React.useState(!initialSprint);
  const [activeTab, setActiveTab] = React.useState('sprint-summary');

  React.useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsUserLoading(false);
    };
    checkUser();
  }, []);

  React.useEffect(() => {
    async function fetchSprint() {
      if (sprint || !sprintId) return;

      try {
        const { data: fetchedSprint, error } = await supabase
          .from('sprints')
          .select('*')
          .eq('id', sprintId)
          .single();

        if (fetchedSprint) {
          const mappedSprint = {
            id: fetchedSprint.id,
            sprintNumber: fetchedSprint.sprint_number,
            sprintName: fetchedSprint.name,
            projectName: fetchedSprint.project_name,
            department: fetchedSprint.department,
            team: fetchedSprint.team,
            facilitatorName: fetchedSprint.facilitator_name,
            plannedPoints: fetchedSprint.planned_points,
            completedPoints: fetchedSprint.completed_points,
            isFacilitator: false,
            userId: fetchedSprint.created_by
          };
          setSprint(mappedSprint as any);
        } else {
          toast({
            title: 'Sprint Not Found',
            description: "The requested sprint could not be found.",
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error("Failed to fetch sprint client-side", error);
        toast({
          title: 'Error',
          description: "Failed to load sprint details.",
          variant: 'destructive',
        });
      } finally {
        setIsLoadingSprint(false);
      }
    }

    if (!initialSprint) {
      fetchSprint();
    }
  }, [sprintId, sprint, initialSprint, toast]);


  if (isUserLoading || isLoadingSprint || !user || !sprint) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 font-sans">

      {/* Modern Header */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-zinc-950/60">
        <div className="flex h-16 items-center justify-between px-6 lg:px-12">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all hover:scale-105"
              onClick={() => router.push('/dashboard')}
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Back to Dashboard</span>
            </Button>
            <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800" />
            <Logo />
          </div>
          <div className="flex items-center gap-4">
            <UserNav user={user} />
          </div>
        </div>
      </header>

      <main className="flex-1 w-full">
        {/* Hero Section - Full Width */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-orange-600 dark:from-primary dark:via-zinc-900 dark:to-orange-900">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 z-0 opacity-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-300 rounded-full mix-blend-overlay filter blur-3xl animate-pulse delay-1000" />
          </div>

          <div className="relative z-10 px-6 lg:px-12 py-8 lg:py-10">
            <div className="max-w-7xl mx-auto">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm px-3 py-1 text-xs font-semibold">
                    Sprint #{sprint.sprintNumber}
                  </Badge>
                  <Badge className={cn("backdrop-blur-sm px-3 py-1 text-xs font-semibold border", getStatusBadgeStyle(sprint.status))}>
                    {getStatusLabel(sprint.status)}
                  </Badge>
                </div>
                <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
                  {sprint.sprintName}
                </h1>
                <p className="text-lg text-white/90 font-medium">
                  {sprint.projectName}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                    <Users className="h-4 w-4 text-white/80" />
                    <span className="text-white text-sm font-medium">{sprint.team}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                    <CalendarDays className="h-4 w-4 text-white/80" />
                    <span className="text-white text-sm font-medium">{sprint.facilitatorName || 'Unassigned'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Full Width */}
        <div className="w-full -mt-20">
          {/* Action Cards Container - Constrained Width */}
          <div className="px-6 lg:px-12">
            <div className="max-w-7xl mx-auto">
              {/* Action Cards - Horizontal Grid (Overlapping Hero) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-20">
                {/* Planning Card */}
                <Card
                  className="group relative overflow-hidden bg-white dark:bg-zinc-900 border-t-4 border-t-blue-500 hover:border-t-blue-600 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
                  onClick={() => router.push(`/sprint/${sprintId}/planning`)}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardHeader className="relative pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <ClipboardList className="h-7 w-7" />
                      </div>
                      <ArrowRight className="h-6 w-6 text-zinc-400 group-hover:text-blue-600 group-hover:translate-x-2 transition-all" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-zinc-900 dark:text-white">Planning</CardTitle>
                    <CardDescription className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-2">
                      Setup scope & goals
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Define user stories, assign story points, and establish sprint objectives for the team.
                    </p>
                  </CardContent>
                </Card>

                {/* Track Board Card */}
                <Card
                  className="group relative overflow-hidden bg-gradient-to-br from-white to-primary/5 dark:from-zinc-900 dark:to-primary/10 border-t-4 border-t-primary hover:border-t-orange-600 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
                  onClick={() => router.push(`/sprint/${sprintId}/board`)}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardHeader className="relative pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-orange-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Briefcase className="h-7 w-7" />
                      </div>
                      <ArrowRight className="h-6 w-6 text-primary/50 group-hover:text-primary group-hover:translate-x-2 transition-all" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-primary">Track Board</CardTitle>
                    <CardDescription className="text-sm font-medium text-primary/70 mt-2">
                      Manage execution
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                      Monitor progress, move tasks across the board, and view real-time sprint analytics.
                    </p>
                  </CardContent>
                </Card>

                {/* Retrospective Card */}
                <Card
                  className="group relative overflow-hidden bg-white dark:bg-zinc-900 border-t-4 border-t-violet-500 hover:border-t-violet-600 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
                  onClick={() => router.push(`/sprint/${sprintId}/retrospective`)}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-violet-50/50 to-transparent dark:from-violet-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardHeader className="relative pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <History className="h-7 w-7" />
                      </div>
                      <ArrowRight className="h-6 w-6 text-zinc-400 group-hover:text-violet-600 group-hover:translate-x-2 transition-all" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-zinc-900 dark:text-white">Retrospective</CardTitle>
                    <CardDescription className="text-sm font-medium text-violet-600 dark:text-violet-400 mt-2">
                      Review & Improve
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Reflect on the sprint outcome, identify bottlenecks, and plan improvements.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Sprint Analytics Dashboard - Full Width */}
          <div className="w-full mt-12 px-6 lg:px-12">
            <div className="space-y-8 pt-8">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">Sprint Analytics</h2>
                <p className="text-zinc-600 dark:text-zinc-400 mt-1">Real-time insights and metrics</p>
              </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {/* Planned Points */}
              <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Planned Points</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-black text-blue-900 dark:text-blue-100">{sprint.plannedPoints || 0}</div>
                </CardContent>
                <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-blue-200/30 dark:bg-blue-800/20 blur-2xl" />
              </Card>

              {/* Completed */}
              <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wider">Completed</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-black text-green-900 dark:text-green-100">{sprint.completedPoints || 0}</div>
                </CardContent>
                <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-green-200/30 dark:bg-green-800/20 blur-2xl" />
              </Card>

              {/* Velocity */}
              <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wider">Velocity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-black text-purple-900 dark:text-purple-100">12.5 <span className="text-xl">SP</span></div>
                </CardContent>
                <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-purple-200/30 dark:bg-purple-800/20 blur-2xl" />
              </Card>

              {/* Goals Achieved */}
              <Card className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs font-semibold text-orange-700 dark:text-orange-400 uppercase tracking-wider">Goals Achieved</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-black text-orange-900 dark:text-orange-100">0%</div>
                </CardContent>
                <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-orange-200/30 dark:bg-orange-800/20 blur-2xl" />
              </Card>

              {/* Burndown Chart Preview */}
              <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 to-primary/20 dark:from-primary/20 dark:to-primary/10 border-0 shadow-lg">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs font-semibold text-primary uppercase tracking-wider">Burndown</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="h-20 rounded-lg overflow-hidden">
                    <svg viewBox="0 0 100 50" className="w-full h-full" preserveAspectRatio="none">
                      <path d="M 0 10 L 30 15 L 60 25 L 100 45" stroke="currentColor" strokeWidth="2.5" fill="none" className="text-primary drop-shadow-lg" />
                      <path d="M 0 10 L 30 15 L 60 25 L 100 45 L 100 50 L 0 50 Z" fill="url(#miniGradient)" />
                      <defs>
                        <linearGradient id="miniGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="currentColor" stopOpacity="0.4" className="text-primary" />
                          <stop offset="100%" stopColor="currentColor" stopOpacity="0.1" className="text-primary" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </CardContent>
                <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />
              </Card>
            </div>

            {/* Tab Navigation */}
            <div className="relative">
              <div className="flex flex-wrap gap-3">
                {[
                  { id: 'sprint-summary', label: 'Sprint Summary' },
                  { id: 'ai-insights', label: 'AI Insights' },
                  { id: 'project-timeline', label: 'Project Timeline' },
                  { id: 'daily-huddle', label: 'Daily Huddle' },
                  { id: 'sprint-charts', label: 'Sprint Charts' },
                  { id: 'daily-burndown', label: 'Daily Burndown' },
                  { id: 'individual-metrics', label: 'Individual Metrics' },
                  { id: 'team-mood', label: 'Team Mood Trend' },
                ].map((tab) => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? 'default' : 'ghost'}
                    size="lg"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'font-semibold transition-all duration-200 rounded-xl',
                      activeTab === tab.id
                        ? 'bg-primary text-white shadow-lg scale-105'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    )}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent mt-6" />
            </div>

            {/* Tab Content */}
            {activeTab === 'sprint-summary' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
                {/* Left Column */}
                <div className="space-y-8">
                  {/* Sprint Goals */}
                  <Card className="bg-white dark:bg-zinc-900 border-0 shadow-xl">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-2xl font-bold flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10">
                          <Target className="h-6 w-6 text-primary" />
                        </div>
                        Sprint Goals
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="group flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800/50 dark:to-zinc-800/30 border border-zinc-200 dark:border-zinc-700 hover:border-red-300 dark:hover:border-red-700 transition-all">
                        <div className="mt-1 p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30">
                          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed">
                          Complete migration of APIC platform to DSDK 3.0.0
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Open Stories */}
                  <Card className="bg-white dark:bg-zinc-900 border-0 shadow-xl">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl font-bold flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-blue-500/10">
                            <ClipboardList className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          Open Stories
                        </CardTitle>
                        <Badge variant="outline" className="text-xs font-semibold">2 Active</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/10 border border-orange-200 dark:border-orange-800">
                        <div className="flex items-center gap-3">
                          <div className="h-3 w-3 rounded-full bg-orange-500 animate-pulse" />
                          <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Sprint 46-1</span>
                        </div>
                        <Badge className="bg-orange-500 text-white hover:bg-orange-600 text-xs font-bold">To Do</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/10 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-3">
                          <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse" />
                          <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Sprint 46-2</span>
                        </div>
                        <Badge className="bg-blue-500 text-white hover:bg-blue-600 text-xs font-bold">In Progress</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI Insights */}
                  <Card className="relative overflow-hidden bg-gradient-to-br from-red-50 via-orange-50 to-red-100 dark:from-red-950/30 dark:via-orange-950/20 dark:to-red-900/20 border-2 border-red-200 dark:border-red-800 shadow-xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-200/30 dark:bg-red-800/20 rounded-full blur-3xl" />
                    <CardHeader className="pb-4 relative">
                      <CardTitle className="text-2xl font-bold text-red-900 dark:text-red-100 flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-red-500/20">
                          <Zap className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        AI Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative">
                      <p className="text-base font-medium text-red-900 dark:text-red-200 leading-relaxed">
                        The sprint is on track: 15 points remaining. API deprecation requires additional attention.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                  {/* Burndown Chart */}
                  <Card className="bg-white dark:bg-zinc-900 border-0 shadow-xl">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-2xl font-bold flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10">
                          <TrendingUp className="h-6 w-6 text-primary" />
                        </div>
                        Burndown Chart
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-72 rounded-2xl bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800/50 dark:to-zinc-900/50 p-6 border border-zinc-200 dark:border-zinc-700">
                        <svg viewBox="0 0 300 200" className="w-full h-full" preserveAspectRatio="none">
                          {/* Grid */}
                          {[0, 50, 100, 150, 200].map((y) => (
                            <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="currentColor" strokeWidth="0.5" className="text-zinc-300 dark:text-zinc-600" strokeDasharray="4 4" />
                          ))}

                          {/* Burndown line */}
                          <path d="M 0 50 L 100 80 L 200 120 L 300 150" stroke="currentColor" strokeWidth="4" fill="none" className="text-primary drop-shadow-lg" strokeLinecap="round" />
                          <path d="M 0 50 L 100 80 L 200 120 L 300 150 L 300 200 L 0 200 Z" fill="url(#burndownGradient2)" />

                          {/* Data points */}
                          <circle cx="0" cy="50" r="5" fill="currentColor" className="text-primary" />
                          <circle cx="100" cy="80" r="5" fill="currentColor" className="text-primary" />
                          <circle cx="200" cy="120" r="5" fill="currentColor" className="text-primary" />
                          <circle cx="300" cy="150" r="5" fill="currentColor" className="text-primary" />

                          <defs>
                            <linearGradient id="burndownGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" className="text-primary" />
                              <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" className="text-primary" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-sm font-medium text-zinc-600 dark:text-zinc-400 px-2">
                        <span>Sep 10</span>
                        <span>Sep 19</span>
                        <span>Sep 24</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Velocity Chart */}
                  <Card className="bg-white dark:bg-zinc-900 border-0 shadow-xl">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-2xl font-bold flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-purple-500/10">
                          <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        Velocity Chart
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-end justify-center gap-6 p-6 rounded-2xl bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800/50 dark:to-zinc-900/50 border border-zinc-200 dark:border-zinc-700">
                        {[
                          { label: 'Sprint 1', value: 30, color: 'from-blue-500 to-blue-600' },
                          { label: 'Sprint 2', value: 35, color: 'from-primary to-orange-600' },
                          { label: 'Sprint 3', value: 28, color: 'from-purple-500 to-purple-600' }
                        ].map((sprint, idx) => (
                          <div key={idx} className="flex flex-col items-center gap-3 flex-1 group">
                            <div className={`relative w-full bg-gradient-to-t ${sprint.color} rounded-t-xl flex items-end justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg`} style={{ height: `${sprint.value * 3}px` }}>
                              <span className="text-white font-bold text-lg mb-2 drop-shadow-md">{sprint.value}</span>
                              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 rounded-t-xl transition-all" />
                            </div>
                            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{sprint.label}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Mood */}
                  <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-green-950/30 dark:via-emerald-950/20 dark:to-green-900/20 border-2 border-green-200 dark:border-green-800 shadow-xl">
                    <div className="absolute bottom-0 right-0 w-40 h-40 bg-green-200/30 dark:bg-green-800/20 rounded-full blur-3xl" />
                    <CardHeader className="pb-4 relative">
                      <CardTitle className="text-2xl font-bold text-green-900 dark:text-green-100 flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-green-500/20">
                          <Smile className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        Team Mood
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-green-500/20">
                          <Smile className="h-12 w-12 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-4xl font-black text-green-900 dark:text-green-100">Positive</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Risks / Blockers */}
                  <Card className="bg-white dark:bg-zinc-900 border-0 shadow-xl">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-2xl font-bold flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-orange-500/10">
                          <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        Risks / Blockers
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/10 border-2 border-orange-200 dark:border-orange-800">
                        <div className="mt-1 p-1.5 rounded-lg bg-orange-500/20">
                          <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <p className="text-base font-medium text-orange-900 dark:text-orange-200">
                          Legacy support could cause delays
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* AI Insights Tab Content */}
            {activeTab === 'ai-insights' && (
              <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border border-red-200 dark:border-red-900">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-red-900 dark:text-red-400 flex items-center gap-2">
                    <Zap className="h-6 w-6" />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-red-800 dark:text-red-300">
                    The sprint is on track: 15.75 points remaining. API deprecation.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="p-4 bg-white/50 dark:bg-zinc-900/50 rounded-lg border border-red-200 dark:border-red-900">
                      <h4 className="font-semibold text-red-900 dark:text-red-400 mb-2">Key Observations</h4>
                      <ul className="space-y-2 text-sm text-red-800 dark:text-red-300">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>Sprint velocity is stable</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>API deprecation needs attention</span>
                        </li>
                      </ul>
                    </div>
                    <div className="p-4 bg-white/50 dark:bg-zinc-900/50 rounded-lg border border-red-200 dark:border-red-900">
                      <h4 className="font-semibold text-red-900 dark:text-red-400 mb-2">Recommendations</h4>
                      <ul className="space-y-2 text-sm text-red-800 dark:text-red-300">
                        <li className="flex items-start gap-2">
                          <TrendingUp className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>Allocate additional resources for API migration</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>Consider extending timeline if blockers persist</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Other tabs can show placeholder content */}
            {activeTab !== 'sprint-summary' && activeTab !== 'ai-insights' && (
              <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <CardContent className="py-12">
                  <div className="text-center text-zinc-500">
                    <p className="text-lg font-medium">Coming Soon</p>
                    <p className="text-sm mt-2">This feature is under development</p>
                  </div>
                </CardContent>
              </Card>
            )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
