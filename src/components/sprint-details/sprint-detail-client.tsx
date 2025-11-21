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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { doc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function UserNav({ user }: { user: User }) {
  const router = useRouter();
  const auth = useAuth();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const userInitial = user.email ? user.email.charAt(0).toUpperCase() : 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? ''} />
            <AvatarFallback>{userInitial}</AvatarFallback>
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
          // Security check: ensure the user owns this sprint
          if (sprintData.userId === user.uid) {
            setSprint({ id: sprintDoc.id, ...sprintData });
          } else {
            // If not the owner, treat as not found.
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
  
  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-blue-50 via-fuchsia-50 to-orange-50">
      <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-8">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => router.push('/dashboard')}>
                <ChevronLeft className="h-5 w-5" />
                <span className="sr-only">Back to Dashboard</span>
            </Button>
            <Logo />
        </div>
        <div className="flex items-center gap-4">
          <UserNav user={user} />
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-8">
        <div className="mx-auto max-w-5xl">
            {isLoading ? (
                <div className="flex items-center justify-center pt-20">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            ) : sprint ? (
              <Tabs defaultValue="summary" className="w-full">
                <Card className="w-full shadow-lg shadow-blue-200/50 mb-6">
                    <CardHeader>
                        <CardDescription>{sprint.projectName} / Sprint {sprint.sprintNumber}</CardDescription>
                        <CardTitle className='text-3xl font-bold text-fuchsia-700'>{sprint.sprintName}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TabsList className="grid w-full grid-cols-4 md:grid-cols-8 h-auto">
                          <TabsTrigger value="ai-report"><Bot className='h-4 w-4 md:mr-2' /><span className='hidden md:inline'>AI Report</span></TabsTrigger>
                          <TabsTrigger value="timeline"><Calendar className='h-4 w-4 md:mr-2'/><span className='hidden md:inline'>Timeline</span></TabsTrigger>
                          <TabsTrigger value="huddle"><Users className='h-4 w-4 md:mr-2' /><span className='hidden md:inline'>Huddle</span></TabsTrigger>
                          <TabsTrigger value="sprint-charts"><BarChart2 className='h-4 w-4 md:mr-2'/><span className='hidden md:inline'>Charts</span></TabsTrigger>
                          <TabsTrigger value="burndown"><TrendingDown className='h-4 w-4 md:mr-2'/><span className='hidden md:inline'>Burndown</span></TabsTrigger>
                          <TabsTrigger value="performance"><span className='mr-2'>🏆</span><span className='hidden md:inline'>Performance</span></TabsTrigger>
                          <TabsTrigger value="mood"><Smile className='h-4 w-4 md:mr-2'/><span className='hidden md:inline'>Mood</span></TabsTrigger>
                          <TabsTrigger value="summary"><ClipboardList className='h-4 w-4 md:mr-2' /><span className='hidden md:inline'>Summary</span></TabsTrigger>
                      </TabsList>
                    </CardContent>
                </Card>
                <TabsContent value="ai-report">
                  <Card><CardContent className='p-6'>AI Report Content</CardContent></Card>
                </TabsContent>
                <TabsContent value="timeline">
                  <Card><CardContent className='p-6'>Project Timeline Content</CardContent></Card>
                </TabsContent>
                <TabsContent value="huddle">
                  <Card><CardContent className='p-6'>Daily Huddle Report Content</CardContent></Card>
                </TabsContent>
                <TabsContent value="sprint-charts">
                   <Card><CardContent className='p-6'>Sprint Summary Chart Content</CardContent></Card>
                </TabsContent>
                 <TabsContent value="burndown">
                   <Card><CardContent className='p-6'>Daily Burndown Chart Content</CardContent></Card>
                </TabsContent>
                 <TabsContent value="performance">
                   <Card><CardContent className='p-6'>Individual Performance Content</CardContent></Card>
                </TabsContent>
                 <TabsContent value="mood">
                   <Card><CardContent className='p-6'>Mood trend over sprints Content</CardContent></Card>
                </TabsContent>
                <TabsContent value="summary">
                    <Card>
                        <CardHeader>
                          <CardTitle>Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="font-medium text-muted-foreground">Department</div>
                                <div>{sprint.department}</div>
                                <div className="font-medium text-muted-foreground">Team</div>
                                <div>{sprint.team}</div>
                                <div className="font-medium text-muted-foreground">Facilitator</div>
                                <div>{sprint.facilitatorName}</div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
              </Tabs>
            ) : (
                <div className="flex flex-col items-center justify-center pt-20 text-center">
                    <h2 className="text-2xl font-bold">Sprint Not Found</h2>
                    <p className="text-muted-foreground">The sprint you are looking for does not exist or you do not have permission to view it.</p>
                    <Button onClick={() => router.push('/dashboard')} className="mt-4">
                        Back to Dashboard
                    </Button>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}
