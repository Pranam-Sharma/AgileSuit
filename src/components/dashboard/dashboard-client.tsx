'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  LogOut,
  ListFilter,
  Search,
  Shield,
  LayoutDashboard,
  Plus,
  Sparkles,
  Zap,
  CheckCircle2,
  Target,
  TrendingUp,
  CalendarDays,
  Clock
} from 'lucide-react';
import { useUserRole } from '@/hooks/use-user-role';
import { Logo } from '../logo';
import { Button } from '@/components/ui/button';
import { LoadingScreen } from '@/components/ui/loading-screen';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CreateSprintDialog, type Sprint } from './create-sprint-dialog';
import { SprintCard } from './sprint-card';
import { Input } from '../ui/input';
import { getSprints } from '@/lib/sprints-client';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { type User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { UserNav } from './user-nav';

type Filters = {
  department: string[];
  team: string[];
  status: string[];
};

export function DashboardClient() {
  const [user, setUser] = React.useState<any>(null);
  const [isUserLoading, setIsUserLoading] = React.useState(true);
  const { isAdmin } = useUserRole();
  const router = useRouter();
  const { toast } = useToast();
  const [sprints, setSprints] = React.useState<(Sprint & { id: string })[]>([]);
  const [isSprintsLoading, setIsSprintsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filters, setFilters] = React.useState<Filters>({
    department: [],
    team: [],
    status: [],
  });

  const supabase = createClient();

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
  }, [router]);

  React.useEffect(() => {
    if (isUserLoading) return;
    if (!user) return;

    async function fetchSprints() {
      setIsSprintsLoading(true);
      try {
        const { getSprintsAction } = await import('@/app/actions/sprints');
        const userSprints = await getSprintsAction();
        setSprints(userSprints as any);
      } catch (error) {
        console.error("Failed to fetch sprints:", error);
      } finally {
        setIsSprintsLoading(false);
      }
    }
    fetchSprints();
  }, [user, isUserLoading]);


  const handleCreateSprint = (sprintData: Sprint & { id: string }) => {
    setSprints((prevSprints) => [sprintData, ...prevSprints]);
  };

  const handleDeleteSprint = (sprintId: string) => {
    setSprints((prevSprints) => prevSprints.filter(sprint => sprint.id !== sprintId));
  };

  const activeSprintsCount = sprints.length; // Simply count for now
  const completionRate = 84; // Static for demo as per previous design request

  const allDepartments = React.useMemo(() => Array.from(new Set(sprints.map(s => s.department))), [sprints]);
  const allTeams = React.useMemo(() => Array.from(new Set(sprints.map(s => s.team))), [sprints]);

  const handleFilterChange = (category: keyof Filters, value: string) => {
    setFilters(prev => {
      const newValues = prev[category].includes(value) ? prev[category].filter(i => i !== value) : [...prev[category], value];
      return { ...prev, [category]: newValues };
    });
  }

  const filteredSprints = React.useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    return sprints.filter(sprint => {
      const departmentMatch = filters.department.length === 0 || filters.department.includes(sprint.department);
      const teamMatch = filters.team.length === 0 || filters.team.includes(sprint.team);
      const statusMatch = filters.status.length === 0 || filters.status.includes(sprint.status || 'planning');

      if (!departmentMatch || !teamMatch || !statusMatch) {
        return false;
      }
      if (searchQuery === '') return true;
      return (
        sprint.sprintNumber.toLowerCase().includes(lowercasedQuery) ||
        sprint.sprintName.toLowerCase().includes(lowercasedQuery) ||
        sprint.projectName.toLowerCase().includes(lowercasedQuery) ||
        sprint.department.toLowerCase().includes(lowercasedQuery) ||
        sprint.team.toLowerCase().includes(lowercasedQuery) ||
        (sprint.facilitatorName && sprint.facilitatorName.toLowerCase().includes(lowercasedQuery))
      );
    });
  }, [sprints, filters, searchQuery]);


  if (isUserLoading || !user) {
    return (
      <LoadingScreen message="Loading Dashboard..." />
    );
  }

  const firstName = user.user_metadata?.full_name?.split(' ')[0] || 'User';

  // Helper function for time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-zinc-50/50 dark:bg-zinc-950/50 font-sans">

      {/* Clean White Header */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 sm:px-8">
        <Logo />

        <div className="flex items-center gap-4">
          <div className="relative group hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
            <Input
              type="text"
              placeholder="Search..."
              className="pl-9 w-64 bg-zinc-100 dark:bg-zinc-900 border-transparent focus-visible:bg-white dark:focus-visible:bg-black focus-visible:ring-primary/20 transition-all rounded-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />
          <UserNav user={user} />
        </div>
      </header>

      <main className="flex-1">

        {/* Hero Section with Gradient */}
        <div className="relative bg-gradient-to-br from-orange-300 via-orange-400 via-30% to-red-400 to-90% pt-8 pb-12 px-6 sm:px-8 shadow-xl">
          {/* Background Texture/Pattern */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />

          {/* Abstract Shapes - Enhanced gradient effect */}
          <div className="absolute top-0 right-0 p-12 opacity-20 pointer-events-none">
            <div className="h-64 w-64 rounded-full bg-yellow-200 blur-3xl opacity-30 -mr-20 -mt-20" />
          </div>
          <div className="absolute bottom-0 left-0 p-12 opacity-20 pointer-events-none">
            <div className="h-48 w-48 rounded-full bg-pink-200 blur-3xl opacity-30 -ml-20 -mb-20" />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="h-96 w-96 rounded-full bg-orange-200 blur-3xl opacity-20" />
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            {/* Greeting & Header Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-1 relative">
                <Badge variant="outline" className="text-white border-white/20 bg-white/10 backdrop-blur-sm mb-2 hover:bg-white/20 transition-colors cursor-default">
                  <Sparkles className="h-3 w-3 mr-1 text-yellow-200" />
                  Workspace Overview
                </Badge>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-sm">
                  {getGreeting()}, {firstName}
                </h1>
                <p className="text-white/90 font-medium flex items-center gap-2 text-lg">
                  Your workspace is moving fast today.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Overlapping Content Container */}
        <div className="px-6 sm:px-8 max-w-7xl mx-auto -mt-8 relative z-20">
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl p-6 md:p-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

            {/* Sprint Section Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Your Sprints</h3>
                </div>
                <p className="text-muted-foreground text-sm">Manage and track your active agile cycles.</p>
              </div>

              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-9">
                      <ListFilter className="mr-2 h-4 w-4" />
                      Filter
                      {(filters.department.length > 0 || filters.team.length > 0 || filters.status.length > 0) && (
                        <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-zinc-900 text-white rounded-full">
                          {filters.department.length + filters.team.length + filters.status.length}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>Filter Sprints</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="px-2 py-1.5 text-xs font-semibold text-zinc-500">Status</div>
                    {['planning', 'active', 'completed', 'archived'].map(status => (
                      <DropdownMenuCheckboxItem
                        key={status}
                        checked={filters.status.includes(status)}
                        onCheckedChange={() => handleFilterChange('status', status)}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </DropdownMenuCheckboxItem>
                    ))}
                    <DropdownMenuSeparator />
                    <div className="px-2 py-1.5 text-xs font-semibold text-zinc-500">Department</div>
                    {allDepartments.map(d => (
                      <DropdownMenuCheckboxItem key={d} checked={filters.department.includes(d)} onCheckedChange={() => handleFilterChange('department', d)}>{d}</DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Sprints Grid */}
            {isSprintsLoading ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-[240px] bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {/* Create New Sprint Card - Always First */}
                <CreateSprintDialog
                  onCreateSprint={handleCreateSprint}
                  trigger={
                    <div className="group border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center p-6 h-full min-h-[220px] hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer">
                      <div className="h-14 w-14 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Plus className="h-6 w-6 text-zinc-400 group-hover:text-primary transition-colors" />
                      </div>
                      <p className="font-semibold text-zinc-600 dark:text-zinc-400 group-hover:text-primary transition-colors">Create New Sprint</p>
                      <p className="text-xs text-muted-foreground mt-2 text-center max-w-[150px]">Start a new cycle for your team</p>
                    </div>
                  }
                />

                {filteredSprints.length > 0 && filteredSprints.map((sprint) => (
                  <SprintCard key={sprint.id} sprint={sprint} onDelete={handleDeleteSprint} />
                ))}
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
