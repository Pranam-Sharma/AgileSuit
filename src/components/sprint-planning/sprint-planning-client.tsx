'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { signOut, type User } from 'firebase/auth';
import {
  Loader2,
  LogOut,
  ChevronLeft,
  CheckCircle2,
  Circle,
  Calendar as CalendarIcon,
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { DateRange } from 'react-day-picker';
import { addDays, format, isWeekend, differenceInDays } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';


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

const planningChecklist = [
    { id: 'dates', label: 'Confirm start date and end date' },
    { id: 'members', label: 'Confirm assigned members' },
    { id: 'points', label: 'Confirm target points' },
    { id: 'goals', label: 'Confirm Sprint Goals' },
    { id: 'backlog', label: 'Add stories to Sprint Backlog (if needed, estimate new stories)' },
    { id: 'assignments', label: 'Confirm initial assignments of highest priority tasks' },
    { id: 'demoTopic', label: 'Confirm Sprint Demo Topic and Date' },
    { id: 'demoPic', label: 'Confirm Sprint Demo PIC' },
    { id: 'security', label: 'Confirm Security Audit PIC' },
];

type ChecklistState = Record<string, boolean>;

function ChecklistItem({ id, label, checked, onCheckedChange }: { id: string; label: string; checked: boolean; onCheckedChange: (id: string, checked: boolean) => void; }) {
    const Icon = checked ? CheckCircle2 : Circle;
    const color = checked ? 'text-primary' : 'text-muted-foreground';

    return (
        <div
            className="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-muted cursor-pointer"
            onClick={() => onCheckedChange(id, !checked)}
        >
            <Icon className={`h-5 w-5 flex-shrink-0 ${color}`} />
            <span className={`flex-grow ${checked ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{label}</span>
        </div>
    );
}

type SprintPlanningClientProps = {
    sprintId: string;
};

export function SprintPlanningClient({ sprintId }: SprintPlanningClientProps) {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [sprint, setSprint] = React.useState<(Sprint & { id: string }) | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [checklist, setChecklist] = React.useState<ChecklistState>(() =>
    planningChecklist.reduce((acc, item) => ({ ...acc, [item.id]: false }), {})
  );
  
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 13), // Default to a 2-week sprint
  });

  const handleChecklistChange = (id: string, checked: boolean) => {
    setChecklist(prev => ({ ...prev, [id]: checked }));
  };
  
  const calculateSprintDays = React.useCallback(() => {
    if (!date || !date.from || !date.to) {
        return 0;
    }

    let count = 0;
    let currentDate = new Date(date.from);
    const endDate = new Date(date.to);

    // Don't count the last day (retrospective)
    const dayBeforeEnd = new Date(endDate);
    dayBeforeEnd.setDate(endDate.getDate() - 1);

    if (currentDate > dayBeforeEnd) return 0;
    
    // Loop through each day in the range
    while (currentDate <= dayBeforeEnd) {
        // Check if the day is not a weekend (Saturday or Sunday)
        if (!isWeekend(currentDate)) {
            count++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return count;
  }, [date]);

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
            toast({
                title: 'Access Denied',
                description: "You don't have permission to view this sprint's planning.",
                variant: 'destructive',
            });
            router.push('/dashboard');
          }
        } else {
          setSprint(null);
          toast({
            title: 'Sprint Not Found',
            description: "The sprint you are trying to plan for doesn't exist.",
            variant: 'destructive',
        });
        router.push('/dashboard');
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

  if (isUserLoading || isLoading || !user) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-violet-700/50 bg-violet-600 px-4 text-white sm:px-8">
            <div className='flex items-center gap-4'>
                <Button variant="outline" size="icon" className="h-9 w-9 bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={() => router.push('/dashboard')}>
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <Logo className="text-white" />
            </div>
            <div className="flex items-center justify-center flex-1">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
             <div className="flex items-center gap-4">
               {user && <UserNav user={user} />}
            </div>
        </header>
        <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
       <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-violet-700/50 bg-violet-600 px-4 text-white sm:px-8">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="h-9 w-9 bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={() => router.back()}>
                <ChevronLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
            </Button>
            <Logo className="text-white" />
        </div>
        <div className="flex items-center gap-4">
          <UserNav user={user} />
        </div>
      </header>
       <main className="flex-1">
        {sprint ? (
          <>
            <div className="border-b bg-white">
              <div className="mx-auto max-w-7xl p-6 lg:p-8">
                <h1 className="text-3xl font-bold text-foreground">
                    Sprint Planning: {sprint.sprintName} ({sprint.sprintNumber})
                </h1>
                <p className="mt-1 text-muted-foreground">Use the checklist and tabs below to complete your sprint planning.</p>
              </div>
            </div>

            <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Planning Checklist</CardTitle>
                            <CardDescription>Track your sprint planning progress.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            {planningChecklist.map(item => (
                                <ChecklistItem
                                    key={item.id}
                                    id={item.id}
                                    label={item.label}
                                    checked={checklist[item.id]}
                                    onCheckedChange={handleChecklistChange}
                                />
                            ))}
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                     <Tabs defaultValue="general" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9 bg-muted/50 p-1 h-auto flex-wrap">
                            <TabsTrigger value="general" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">General Information</TabsTrigger>
                            <TabsTrigger value="team" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Team Composition</TabsTrigger>
                            <TabsTrigger value="priority" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Project Priority</TabsTrigger>
                            <TabsTrigger value="metrics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Platform Metrics</TabsTrigger>
                            <TabsTrigger value="goals" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Sprint Goals</TabsTrigger>
                            <TabsTrigger value="milestones" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Project Milestones</TabsTrigger>
                            <TabsTrigger value="demo" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Sprint Demo</TabsTrigger>
                            <TabsTrigger value="security" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Security Audit</TabsTrigger>
                            <TabsTrigger value="save" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Save Summary</TabsTrigger>
                        </TabsList>
                        <Card className="mt-4">
                            <CardContent className="pt-6">
                                <TabsContent value="general">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-medium">Sprint Dates</h3>
                                            <p className="text-sm text-muted-foreground">Select the start and end date for the sprint.</p>
                                        </div>
                                        <div className="grid gap-4 md:grid-cols-2">
                                             <Popover>
                                                <PopoverTrigger asChild>
                                                <Button
                                                    id="date"
                                                    variant={"outline"}
                                                    className={cn(
                                                    "w-full justify-start text-left font-normal h-12",
                                                    !date && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
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
                                                    <span>Pick a date</span>
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
                                            <div className="flex items-center justify-center rounded-lg border bg-muted p-4">
                                                <div className="text-center">
                                                    <div className="text-4xl font-bold text-primary">{calculateSprintDays()}</div>
                                                    <div className="text-sm text-muted-foreground">Days in Sprint</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent value="team"><p>Team Composition form fields will go here.</p></TabsContent>
                                <TabsContent value="priority"><p>Project Priority form fields will go here.</p></TabsContent>
                                <TabsContent value="metrics"><p>Platform Metrics form fields will go here.</p></TabsContent>
                                <TabsContent value="goals"><p>Sprint Goals form fields will go here.</p></TabsContent>
                                <TabsContent value="milestones"><p>Project Milestones form fields will go here.</p></TabsContent>
                                <TabsContent value="demo"><p>Sprint Demo form fields will go here.</p></TabsContent>
                                <TabsContent value="security"><p>Security Audit form fields will go here.</p></TabsContent>
                                <TabsContent value="save"><p>Save Summary section will go here.</p></TabsContent>
                            </CardContent>
                        </Card>
                     </Tabs>
                </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center pt-20">
            <p>Sprint not found or you do not have permission.</p>
          </div>
        )}
      </main>
    </div>
  );
}
