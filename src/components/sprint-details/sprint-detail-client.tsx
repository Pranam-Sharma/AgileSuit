
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { signOut, type User } from 'firebase/auth';
import {
  Loader2,
  LogOut,
  ChevronLeft,
  Bot,
  Calendar,
  Users,
  BarChart2,
  TrendingDown,
  Smile,
  ClipboardList,
  Briefcase,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Circle,
  Clock,
} from 'lucide-react';
import { useAuth, useFirestore } from '@/firebase/provider';
import { useUser } from '@/hooks/use-user';
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
import { doc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Area, AreaChart, Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Badge } from '../ui/badge';

function UserNav({ user }: { user: User }) {
  const router = useRouter();
  const auth = useAuth();

  const handleSignOut = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/login');
  };

  const userInitial = user.email ? user.email.charAt(0).toUpperCase() : 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-white/10">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? ''} />
            <AvatarFallback className='bg-white/20 text-white'>{userInitial}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.displayName ?? 'User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
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

const chartData = [
    { name: 'Sep 10', value: 200 },
    { name: 'Sep 19', value: 300 },
    { name: 'Sep 24', value: 450 },
  ];

const velocityData = [
    { name: 'Spr 1', value: 35 },
    { name: 'Sprt', value: 42 },
    { name: 'Sp 3', value: 38 },
];


function StatCard({ title, value, children }: { title: string; value: string; children?: React.ReactNode }) {
    return (
        <Card className="shadow-sm bg-violet-50/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-bold">{value}</div>
                {children && <div className="h-16 -mx-6 -mb-6 mt-2">{children}</div>}
            </CardContent>
        </Card>
    );
}

type SprintDetailClientProps = {
    sprintId: string;
};

export function SprintDetailClient({ sprintId }: SprintDetailClientProps) {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [sprint, setSprint] = React.useState<(Sprint & { id: string }) | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!firestore || !user) return;

    const fetchSprint = async () => {
      setIsLoading(true);
      try {
        const sprintDocRef = doc(firestore, 'sprints', sprintId);
        const sprintDoc = await getDoc(sprintDocRef);

        if (sprintDoc.exists()) {
          const sprintData = sprintDoc.data() as Sprint;
          if (sprintData.userId === user.uid) {
            setSprint({ id: sprintDoc.id, ...sprintData });
          } else {
            setSprint(null);
            toast({
                title: 'Access Denied',
                description: "You don't have permission to view this sprint.",
                variant: 'destructive',
            });
            router.push('/dashboard');
          }
        } else {
          setSprint(null);
        }
      } catch (error: any) {
        toast({
          title: 'Error fetching sprint',
          description: error.message || 'Could not load sprint details.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSprint();
  }, [sprintId, firestore, user, toast, router]);
  
  const goalsAchieved = React.useMemo(() => {
    if (!sprint || !sprint.plannedPoints || sprint.plannedPoints === 0) {
        return 0;
    }
    return Math.round(((sprint.completedPoints ?? 0) / sprint.plannedPoints) * 100);
  }, [sprint]);

  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-white">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-violet-700/50 bg-violet-600 px-4 text-white sm:px-8">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="h-9 w-9 bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={() => router.push('/dashboard')}>
                <ChevronLeft className="h-5 w-5" />
                <span className="sr-only">Back to Dashboard</span>
            </Button>
            <Logo className="text-white" />
        </div>
        <div className="flex items-center gap-4">
          <UserNav user={user} />
        </div>
      </header>
       <main className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center pt-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : sprint ? (
          <>
            <div className="border-b bg-white">
              <div className="mx-auto max-w-7xl p-6 lg:p-8">
                <div className="flex flex-col items-start gap-4 rounded-xl bg-violet-50 p-6 md:flex-row md:items-center">
                    <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
                        <div className='text-center'>
                            <p className='text-sm font-bold -mb-1'>sprint</p>
                            <p className='text-4xl font-extrabold tracking-tighter'>{sprint.sprintNumber}</p>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            {sprint.sprintName} – {sprint.projectName}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">Facilitator: {sprint.facilitatorName}</p>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                    <StatCard title="Planned Points" value={sprint.plannedPoints?.toString() ?? '0'} />
                    <StatCard title="Completed" value={sprint.completedPoints?.toString() ?? '0'} />
                    <StatCard title="Velocity" value="12,5 SP" />
                    <StatCard title="Goals Achieved" value={`${goalsAchieved}%`}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#colorUv)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </StatCard>
                     <StatCard title="Burndown Chart" value="">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData.slice().reverse()} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                                <defs>
                                     <linearGradient id="colorBurndown" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" hide />
                                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#colorBurndown)" />
                            </AreaChart>
                        </ResponsiveContainer>
                     </StatCard>
                </div>
              </div>
            </div>

            <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
              <Tabs defaultValue="summary" className="w-full">
                <TabsList className="mb-6 grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 bg-muted text-muted-foreground p-1 rounded-lg">
                    <TabsTrigger value="ai-insights" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">AI Insights</TabsTrigger>
                    <TabsTrigger value="timeline" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Project Timeline</TabsTrigger>
                    <TabsTrigger value="huddle" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Daily Huddle</TabsTrigger>
                    <TabsTrigger value="charts" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Sprint Charts</TabsTrigger>
                    <TabsTrigger value="burndown" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Daily Burndown</TabsTrigger>
                    <TabsTrigger value="performance" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Individual Metrics</TabsTrigger>
                    <TabsTrigger value="mood" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Team Mood Trend</TabsTrigger>
                    <TabsTrigger value="summary" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Sprint Summary</TabsTrigger>
                </TabsList>
                <TabsContent value="ai-insights">
                    <p>AI Insights Content</p>
                </TabsContent>
                <TabsContent value="timeline">
                    <p>Project Timeline Content</p>
                </TabsContent>
                <TabsContent value="huddle">
                    <p>Daily Huddle Report Content</p>
                </TabsContent>
                <TabsContent value="charts">
                    <p>Sprint Summary Chart View Content</p>
                </TabsContent>
                <TabsContent value="burndown">
                    <p>Daily Burndown Chart Content</p>
                </TabsContent>
                <TabsContent value="performance">
                    <p>Individual Performance Content</p>
                </TabsContent>
                <TabsContent value="mood">
                    <p>Mood trend over sprints Content</p>
                </TabsContent>
                <TabsContent value="summary">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <CardHeader><CardTitle>Sprint Goals</CardTitle></CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                        <span>Complete migration of APIC platform to DSDK 3.0.0</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>Open Stories</CardTitle>
                                    <span className="text-sm font-medium text-muted-foreground">Status</span>
                                </div>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <div className="flex justify-between items-center">
                                    <div className='flex items-center gap-2'>
                                        <Circle className="h-4 w-4 text-orange-500 fill-current" />
                                        <span>Sprint 46-1</span>
                                    </div>
                                    <Badge variant="outline" className='text-orange-600 border-orange-200'>To Do</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className='flex items-center gap-2'>
                                        <Clock className="h-4 w-4 text-blue-500" />
                                        <span>Sprint 46-2</span>
                                    </div>
                                    <Badge variant="outline" className='text-blue-600 border-blue-200'>In Progress</Badge>
                                </div>
                            </CardContent>
                        </Card>
                         <Card className='bg-primary/5 border-primary/20'>
                            <CardHeader><CardTitle className='flex items-center gap-2 text-primary'><Lightbulb className='h-5 w-5' /> AI Insights</CardTitle></CardHeader>
                            <CardContent>
                                <p className="text-sm">The sprint is on track: 15 points remaining. API deprecation requires additional attention.</p>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                             <CardHeader><CardTitle>Burndown Chart</CardTitle></CardHeader>
                             <CardContent className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                                         <defs>
                                            <linearGradient id="burndownContent" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#burndownContent)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                             </CardContent>
                        </Card>
                         <Card className='bg-primary/5 border-primary/20'>
                            <CardHeader><CardTitle className='flex items-center gap-2 text-primary'><Lightbulb className='h-5 w-5' /> AI Insights</CardTitle></CardHeader>
                            <CardContent>
                                <p className="text-sm">The sprint is on track: 15.75 points remaining. API deprecation.</p>
                            </CardContent>
                        </Card>
                    </div>
                     <div className="lg:col-span-1 space-y-6">
                        <Card>
                             <CardHeader><CardTitle>Velocity Chart</CardTitle></CardHeader>
                             <CardContent className="h-[180px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsBarChart data={velocityData}>
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                    </RechartsBarChart>
                                </ResponsiveContainer>
                             </CardContent>
                        </Card>
                         <Card>
                            <CardHeader><CardTitle>Mood</CardTitle></CardHeader>
                            <CardContent>
                                <div className='flex items-center justify-center gap-4 p-4 rounded-lg bg-green-50 border border-green-200'>
                                    <Smile className='h-10 w-10 text-green-600' />
                                    <span className='text-xl font-semibold text-green-700'>Positive</span>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Risks / Blockers</CardTitle></CardHeader>
                            <CardContent>
                               <div className='flex items-center gap-2 text-amber-700'>
                                 <AlertTriangle className='h-5 w-5' />
                                 <p>Legacy support could cause delays</p>
                               </div>
                            </CardContent>
                        </Card>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center pt-20 text-center">
            <h2 className="text-2xl font-bold">Sprint Not Found</h2>
            <p className="text-muted-foreground">The sprint you are looking for does not exist or you do not have permission to view it.</p>
            <Button onClick={() => router.push('/dashboard')} className="mt-4">
              Back to Dashboard
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
