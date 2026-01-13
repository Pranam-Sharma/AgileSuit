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
  ArrowRight
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
    <div className="flex min-h-screen w-full flex-col bg-zinc-50 dark:bg-zinc-950 font-sans">

      {/* Premium Header */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-primary/10 bg-primary px-4 text-white sm:px-8 shadow-sm backdrop-blur-xl bg-opacity-95 supports-[backdrop-filter]:bg-primary/95">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-colors" onClick={() => router.push('/dashboard')}>
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Back to Dashboard</span>
          </Button>
          <div className="h-6 w-px bg-white/20 mx-1" />
          <Logo variant="white" />
        </div>
        <div className="flex items-center gap-4">
          <UserNav user={user} />
        </div>
      </header>

      <main className="flex-1">
        <div className="relative overflow-hidden bg-primary pb-24 pt-10">
          {/* Abstract Background Decoration */}
          <div className="absolute inset-0 z-0">
            <div className="absolute -top-[100px] -left-[100px] h-[500px] w-[500px] bg-white/5 rounded-full blur-3xl" />
            <div className="absolute top-[20%] right-[-50px] h-[300px] w-[300px] bg-orange-500/20 rounded-full blur-3xl mix-blend-overlay" />
          </div>

          <div className="relative z-10 mx-auto max-w-5xl px-6 lg:px-8 text-center text-white">
            <Badge variant="secondary" className="mb-4 bg-white/10 text-white hover:bg-white/20 border-white/10 px-3 py-1 text-xs uppercase tracking-wider font-semibold backdrop-blur-sm">
              Sprint #{sprint.sprintNumber}
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-2 drop-shadow-sm">
              {sprint.sprintName}
            </h1>
            <p className="text-lg text-white/80 font-medium mb-6 flex items-center justify-center gap-2">
              <span className="opacity-70">Project:</span> {sprint.projectName}
            </p>

            <div className="inline-flex items-center gap-6 rounded-full bg-white/10 px-6 py-2 backdrop-blur-md border border-white/10 text-sm font-medium">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-white/70" />
                <span>{sprint.team}</span>
              </div>
              <div className="h-4 w-px bg-white/20" />
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-white/70" />
                <span>Facilitator: {sprint.facilitatorName || 'Unassigned'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-20 mx-auto max-w-5xl px-6 lg:px-8 -mt-16">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">

            {/* Planning Card */}
            <Card
              className="group relative overflow-hidden bg-white/95 dark:bg-zinc-900 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              onClick={() => router.push(`/sprint/${sprintId}/planning`)}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600" />
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <ClipboardList className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold flex items-center justify-between">
                  Planning
                  <ArrowRight className="h-5 w-5 text-zinc-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </CardTitle>
                <CardDescription className="text-sm font-medium text-zinc-500">
                  Setup scope & goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Define user stories, assign story points, and establish sprint objectives for the team.
                </p>
              </CardContent>
            </Card>

            {/* Track Board Card - Highlighted as Primary */}
            <Card
              className="group relative overflow-hidden bg-white/95 dark:bg-zinc-900 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer ring-1 ring-primary/5"
              onClick={() => router.push(`/sprint/${sprintId}/board`)}
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-orange-600" />
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <Briefcase className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold flex items-center justify-between text-primary">
                  Track Board
                  <ArrowRight className="h-5 w-5 text-primary/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </CardTitle>
                <CardDescription className="text-sm font-medium text-primary/60">
                  Manage execution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                  Monitor progress, move tasks across the board, and view real-time sprint analytics.
                </p>
              </CardContent>
            </Card>

            {/* Retrospective Card */}
            <Card
              className="group relative overflow-hidden bg-white/95 dark:bg-zinc-900 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              onClick={() => router.push(`/sprint/${sprintId}/retrospective`)}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-400 to-violet-600" />
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-colors duration-300">
                  <History className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold flex items-center justify-between">
                  Retrospective
                  <ArrowRight className="h-5 w-5 text-zinc-300 group-hover:text-violet-600 group-hover:translate-x-1 transition-all" />
                </CardTitle>
                <CardDescription className="text-sm font-medium text-zinc-500">
                  Review & Improve
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Reflect on the sprint outcome, identify bottlenecks, and plan improvements.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
