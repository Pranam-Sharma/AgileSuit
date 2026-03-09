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
  ArrowDown,
  ChevronDown,
  ChevronUp,
  Activity,
  GripVertical,
  ShieldAlert,
  Search,
  ListTodo,
  Menu,
  Network
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
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
import { Skeleton } from '../ui/skeleton';
import { DateRange } from 'react-day-picker';
import { addDays, format, isWeekend } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel, SelectSeparator } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  saveSprintPlanningAction,
  getSprintPlanningAction,
  type SprintPlanningData,
  type SprintGoalData,
  type MilestoneData,
  type DemoItemData,
  type PlatformData,
  type ProjectPriorityData,
} from '@/app/actions/sprint-planning';


// --- Types ---

type ChecklistState = Record<string, boolean>;

type Allocation = {
  projectId: string; // Link to project priorities
  allocatedPercent: number;
};

type Holiday = {
  id: string;
  country: string;
  days: number;
};

type DeveloperLeave = {
  id: string;
  name: string;
  country: string;
  capacity: number;
  plannedLeave: number;
};

type Platform = {
  id: string;
  name: string;
  members: string[]; // List of developer IDs
  totalStoryPoints: number;
  allocations: Allocation[];
  targetImprovement: number;
  targetVelocity: number;
  holidays: Holiday[];
  developerLeaves: DeveloperLeave[];
  isExpanded: boolean;
};

type SprintGoal = {
  id: string;
  description: string;
  status: 'draft' | 'proposed' | 'on-track' | 'at-risk' | 'off-track' | 'blocked' | 'achieved' | 'partially-achieved' | 'missed' | 'abandoned';
  remark: string;
  order: number;
};

type MilestonePhase = {
  id: string;
  name: string;
  pic: string; // Member ID/Name
  startDate: Date | undefined;
  dueDate: Date | undefined;
  status: 'pending' | 'in-progress' | 'completed' | 'delayed';
  remarks: string;
};

type Milestone = {
  id: string;
  name: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  description: string;
  phases: MilestonePhase[];
  isExpanded: boolean;
};

type DemoStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

type SprintDemoItem = {
  id: string;
  topic: string;
  presenter: string;
  dueDate: Date | undefined;
  dueTime: string;
  status: DemoStatus;
  attendees: string;
  description: string;
  duration: string;
};

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

const createEmptyDemoItem = (): SprintDemoItem => ({
  id: crypto.randomUUID(),
  topic: '',
  presenter: '',
  dueDate: undefined,
  dueTime: '',
  status: 'scheduled',
  attendees: '',
  description: '',
  duration: '30',
});

const DEMO_STATUS_CONFIG: Record<DemoStatus, { label: string; color: string; bgColor: string }> = {
  scheduled: { label: 'Scheduled', color: 'text-blue-700 dark:text-blue-300', bgColor: 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800' },
  in_progress: { label: 'In Progress', color: 'text-amber-700 dark:text-amber-300', bgColor: 'bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800' },
  completed: { label: 'Completed', color: 'text-emerald-700 dark:text-emerald-300', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800' },
  cancelled: { label: 'Cancelled', color: 'text-red-700 dark:text-red-300', bgColor: 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800' },
};

// --- Sub-Components ---

function SectionLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <CardHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

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
  const [isPlanningDataLoading, setIsPlanningDataLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);
  const [activeSection, setActiveSection] = React.useState('general');
  const [checklist, setChecklist] = React.useState<ChecklistState>(() =>
    CHECKLIST_ITEMS.reduce((acc, item) => ({ ...acc, [item.id]: false }), {})
  );

  // --- Delete Confirmation State ---
  const [deleteConfig, setDeleteConfig] = React.useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    action: () => { },
  });

  const confirmDelete = (title: string, description: string, action: () => void) => {
    setDeleteConfig({
      isOpen: true,
      title,
      description,
      action,
    });
  };

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
  }>>([]);

  const addProject = () => {
    const newProject = {
      id: Date.now().toString(),
      name: '',
      priority: 'medium' as const,
      remarks: ''
    };
    setProjects(prev => [...prev, newProject]);
  };

  // Platform Metrics State
  const [platforms, setPlatforms] = React.useState<Platform[]>([]);
  const [sprintGoals, setSprintGoals] = React.useState<SprintGoal[]>([]);

  const addSprintGoal = () => {
    const newGoal: SprintGoal = {
      id: Date.now().toString(),
      description: '',
      status: 'draft',
      remark: '',
      order: sprintGoals.length,
    };
    setSprintGoals([...sprintGoals, newGoal]);
  };

  const [milestones, setMilestones] = React.useState<Milestone[]>([]);

  const addMilestone = () => {
    const newMilestone: Milestone = {
      id: Date.now().toString(),
      name: 'New Milestone',
      startDate: undefined,
      endDate: undefined,
      status: 'planning',
      description: '',
      phases: [],
      isExpanded: true,
    };
    setMilestones([...milestones, newMilestone]);
  };

  const updateMilestone = (id: string, field: keyof Milestone, value: any) => {
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const deleteMilestone = (id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id));
  };

  const addPhase = (milestoneId: string) => {
    setMilestones(prev => prev.map(m => {
      if (m.id !== milestoneId) return m;
      return {
        ...m,
        phases: [...m.phases, {
          id: Date.now().toString(),
          name: '',
          pic: '',
          startDate: undefined,
          dueDate: undefined,
          status: 'pending',
          remarks: ''
        }]
      };
    }));
  };

  const updatePhase = (milestoneId: string, phaseId: string, field: keyof MilestonePhase, value: any) => {
    setMilestones(prev => prev.map(m => {
      if (m.id !== milestoneId) return m;
      return {
        ...m,
        phases: m.phases.map(p => p.id === phaseId ? { ...p, [field]: value } : p)
      };
    }));
  };

  const deletePhase = (milestoneId: string, phaseId: string) => {
    setMilestones(prev => prev.map(m => {
      if (m.id !== milestoneId) return m;
      return { ...m, phases: m.phases.filter(p => p.id !== phaseId) };
    }));
  };

  // Sprint Demo State and Handlers
  const [demoItems, setDemoItems] = React.useState<SprintDemoItem[]>([createEmptyDemoItem()]);

  const addDemoItem = () => {
    setDemoItems(prev => [...prev, createEmptyDemoItem()]);
  };

  const removeDemoItem = (id: string) => {
    if (demoItems.length > 1) {
      setDemoItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const updateDemoItem = (id: string, field: keyof SprintDemoItem, value: any) => {
    setDemoItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const onPhaseDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const milestoneId = result.source.droppableId.replace('phases-', '');

    setMilestones(prev => prev.map(m => {
      if (m.id !== milestoneId) return m;
      const items = Array.from(m.phases);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination!.index, 0, reorderedItem);
      return { ...m, phases: items };
    }));
  };

  const updateSprintGoal = (id: string, field: keyof SprintGoal, value: string | number) => {
    setSprintGoals(prev => prev.map(g => g.id === id ? { ...g, [field]: value } : g));
  };

  const deleteSprintGoal = (id: string) => {
    setSprintGoals(prev => prev.filter(g => g.id !== id));
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(sprintGoals);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order field based on new index
    const updatedItems = items.map((item, index) => ({ ...item, order: index }));
    setSprintGoals(updatedItems);
  };
  const [newPlatformName, setNewPlatformName] = React.useState('');
  const [isAddingPlatform, setIsAddingPlatform] = React.useState(false);

  const addPlatform = () => {
    if (!newPlatformName.trim()) return;

    const newPlatform: Platform = {
      id: Date.now().toString(),
      name: newPlatformName.trim(),
      members: [],
      totalStoryPoints: 0,
      allocations: [],
      targetImprovement: 0,
      targetVelocity: 0,
      holidays: [],
      developerLeaves: [],
      isExpanded: true,
    };

    setPlatforms(prev => [...prev, newPlatform]);
    setNewPlatformName('');
    setIsAddingPlatform(false);
  };

  const togglePlatform = (id: string) => {
    setPlatforms(prev => prev.map(p => p.id === id ? { ...p, isExpanded: !p.isExpanded } : p));
  };

  const deletePlatform = (id: string) => {
    setPlatforms(prev => prev.filter(p => p.id !== id));
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

  const containerRef = React.useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (isLoading || isPlanningDataLoading) return;

    gsap.fromTo('.gsap-stagger-item',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, stagger: { amount: 0.2 }, ease: "power2.out", clearProps: "all" }
    );
  }, [isLoading, isPlanningDataLoading, activeSection]);

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

  // Load saved planning data
  React.useEffect(() => {
    if (!sprint) return;

    const loadPlanningData = async () => {
      setIsPlanningDataLoading(true);
      try {
        const planningData = await getSprintPlanningAction(sprintId);
        if (planningData) {
          // Restore date range
          if (planningData.start_date || planningData.end_date) {
            setDate({
              from: planningData.start_date ? new Date(planningData.start_date) : undefined,
              to: planningData.end_date ? new Date(planningData.end_date) : undefined,
            });
          }

          // Restore checklist
          if (planningData.checklist && Object.keys(planningData.checklist).length > 0) {
            setChecklist(planningData.checklist);
          }

          // Restore projects
          if (planningData.projects && planningData.projects.length > 0) {
            setProjects(planningData.projects.map((p: any) => ({
              id: p.id,
              name: p.name,
              priority: p.priority || 'medium',
              remarks: p.remarks || '',
            })));
          }

          // Restore platforms
          if (planningData.platforms && planningData.platforms.length > 0) {
            setPlatforms(planningData.platforms.map((p: any) => ({
              id: p.id,
              name: p.name || '',
              members: p.members || [],
              totalStoryPoints: p.total_story_points ?? p.totalStoryPoints ?? 0,
              allocations: (p.allocations || []).map((a: any) => ({
                projectId: a.project_id ?? a.projectId ?? '',
                allocatedPercent: a.allocated_percent ?? a.allocatedPercent ?? 0,
              })),
              targetImprovement: p.target_improvement ?? p.targetImprovement ?? 0,
              targetVelocity: p.target_velocity ?? p.targetVelocity ?? 0,
              holidays: (p.holidays || []).map((h: any) => ({
                id: h.id,
                country: h.country || '',
                days: h.days ?? 0,
              })),
              developerLeaves: (p.developer_leaves || p.developerLeaves || []).map((d: any) => ({
                id: d.id,
                name: d.name || '',
                country: d.country || '',
                capacity: d.capacity ?? 0,
                plannedLeave: d.planned_leave ?? d.plannedLeave ?? 0,
              })),
              isExpanded: false,
            })));
          }

          // Restore goals
          if (planningData.goals && planningData.goals.length > 0) {
            setSprintGoals(planningData.goals);
          }

          // Restore milestones
          if (planningData.milestones && planningData.milestones.length > 0) {
            setMilestones(planningData.milestones.map((m: any) => ({
              ...m,
              startDate: m.start_date ? new Date(m.start_date) : undefined,
              endDate: m.end_date ? new Date(m.end_date) : undefined,
              isExpanded: false,
              phases: (m.phases || []).map((p: any) => ({
                ...p,
                startDate: p.start_date ? new Date(p.start_date) : undefined,
                dueDate: p.due_date ? new Date(p.due_date) : undefined,
              })),
            })));
          }

          // Restore demo items
          if (planningData.demo_items && planningData.demo_items.length > 0) {
            setDemoItems(planningData.demo_items.map((d: any) => ({
              ...d,
              dueDate: d.due_date ? new Date(d.due_date) : undefined,
              dueTime: d.due_time || '',
            })));
          }

          setLastSaved(new Date(planningData.updated_at));
        }
      } catch (error) {
        console.error('Error loading planning data:', error);
      } finally {
        setIsPlanningDataLoading(false);
      }
    };

    loadPlanningData();
  }, [sprint, sprintId]);

  // Save all planning data
  const handleSaveAll = async () => {
    if (!sprint) return;

    setIsSaving(true);
    try {
      const planningData: SprintPlanningData = {
        sprint_id: sprintId,
        start_date: date?.from ? date.from.toISOString().split('T')[0] : null,
        end_date: date?.to ? date.to.toISOString().split('T')[0] : null,
        sprint_days: calculateSprintDays(),
        team_members: [], // Add when team composition is implemented
        projects: projects.map(p => ({
          id: p.id,
          name: p.name,
          code: '',
          priority: ['critical', 'high', 'medium', 'low', 'negligible'].indexOf(p.priority),
          allocation: 0,
          color: '',
          icon: '',
        })),
        platforms: platforms.map(p => ({
          id: p.id,
          name: p.name,
          members: p.members,
          total_story_points: p.totalStoryPoints,
          allocations: p.allocations.map(a => ({
            project_id: a.projectId,
            allocated_percent: a.allocatedPercent,
          })),
          target_improvement: p.targetImprovement,
          target_velocity: p.targetVelocity,
          holidays: p.holidays,
          developer_leaves: p.developerLeaves.map(d => ({
            id: d.id,
            name: d.name,
            country: d.country,
            capacity: d.capacity,
            planned_leave: d.plannedLeave,
          })),
        })),
        goals: sprintGoals.map(g => ({
          id: g.id,
          description: g.description,
          status: g.status,
          remark: g.remark,
          order: g.order,
        })),
        milestones: milestones.map(m => ({
          id: m.id,
          name: m.name,
          start_date: m.startDate ? m.startDate.toISOString().split('T')[0] : null,
          end_date: m.endDate ? m.endDate.toISOString().split('T')[0] : null,
          status: m.status,
          description: m.description,
          phases: m.phases.map(p => ({
            id: p.id,
            name: p.name,
            pic: p.pic,
            start_date: p.startDate ? p.startDate.toISOString().split('T')[0] : null,
            due_date: p.dueDate ? p.dueDate.toISOString().split('T')[0] : null,
            status: p.status,
            remarks: p.remarks,
          })),
        })),
        demo_items: demoItems.map(d => ({
          id: d.id,
          topic: d.topic,
          presenter: d.presenter,
          due_date: d.dueDate ? d.dueDate.toISOString().split('T')[0] : null,
          due_time: d.dueTime,
          status: d.status,
          attendees: d.attendees,
          description: d.description,
          duration: d.duration,
        })),
        checklist: checklist,
      };

      await saveSprintPlanningAction(planningData);
      setLastSaved(new Date());
      toast({
        title: 'Planning Saved',
        description: 'Your sprint planning data has been saved successfully.',
      });
    } catch (error: any) {
      console.error('Error saving planning:', error);
      toast({
        title: 'Save Failed',
        description: error.message || 'Failed to save planning data.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isUserLoading || isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-50" />
      </div>
    );
  }

  if (!sprint) return null;

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] font-sans selection:bg-rose-100 text-slate-900 overflow-x-hidden">
      {/* Background elements - Enterprise Theme */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-[#8b2635]/15 to-[#6d1d2b]/15 blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-[#a63d40]/10 to-[#8b2635]/10 blur-[160px]" />
        <div className="absolute top-[20%] right-[10%] w-[35%] h-[35%] rounded-full bg-[#8b2635]/8 blur-[120px]" />
        <div className="absolute bottom-[20%] left-[10%] w-[45%] h-[45%] rounded-full bg-[#6d1d2b]/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen transition-all duration-500">
        {/* Navigation Bar - Refined Glassmorphism */}
        <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/70 backdrop-blur-xl shadow-[0_2px_20px_rgba(0,0,0,0.03)]">
          <div className="max-w-[1600px] mx-auto flex h-16 items-center justify-between px-6 lg:px-12">
            <div className="flex items-center gap-6">
              <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 transition-all" onClick={() => router.back()}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Logo />
              <div className="h-6 w-px bg-slate-200/60" />
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-indigo-50/50 text-indigo-700 border-indigo-100 px-2 py-0.5 text-[10px] uppercase tracking-tighter font-bold shadow-none">
                  Beta
                </Badge>
                <div className="h-1 w-1 rounded-full bg-slate-300" />
                <span className="text-sm font-semibold text-slate-600">Strategy Module</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/50 backdrop-blur-md rounded-full border border-white/40 shadow-sm transition-all hover:shadow-md group">
                <Target className="h-3.5 w-3.5 text-indigo-600 transition-transform group-hover:scale-110" />
                <span className="text-xs font-bold text-slate-700">
                  {sprint ? sprint.sprintName : 'Loading...'}
                </span>
                <Badge className="ml-1 bg-slate-900 text-white text-[9px] hover:bg-slate-900 shadow-none px-1.5 h-4">
                  #{sprint?.sprintNumber}
                </Badge>
              </div>
              {user && <UserNav user={user} />}
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Planning Area */}
          <main className="flex-1 overflow-y-auto custom-scrollbar lg:p-12 p-6" ref={containerRef}>
            <div className="w-full">
              {/* Premium Header Section */}
              <div className="mb-14 space-y-5 gsap-stagger-item">
                <div className="flex items-center gap-3">
                  <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-transparent rounded-md px-3 py-1 font-semibold text-[10px] uppercase tracking-widest shadow-none">
                    Mission Control
                  </Badge>
                  <div className="flex -space-x-2.5">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 shadow-sm flex items-center justify-center overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 animate-pulse" />
                      </div>
                    ))}
                    <div className="w-7 h-7 rounded-full border-2 border-white bg-indigo-600 text-[10px] text-white flex items-center justify-center font-bold shadow-sm">+8</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h1 className="text-6xl font-black text-slate-900 tracking-tight leading-[1.1] drop-shadow-sm">
                    {activeSection === 'general' ? 'Sprint Parameters' :
                      activeSection === 'team' ? 'Force Composition' :
                        activeSection === 'priority' ? 'Core Objectives' :
                          PLANNING_SECTIONS.find(s => s.id === activeSection)?.label}
                  </h1>
                  <p className="text-slate-500 mt-4 text-[19px] max-w-2xl font-medium leading-relaxed">
                    {PLANNING_SECTIONS.find(s => s.id === activeSection)?.description} Orchestrate your team's collective brilliance in this tactical planning phase.
                  </p>
                </div>
              </div>

              {/* Enhanced Navigation Tabs - Modern Glassmorphism */}
              <div className="sticky top-0 z-30 mb-10 pb-2 flex items-center justify-between gap-4 gsap-stagger-item">
                <div className="flex items-center gap-1.5 bg-white/60 backdrop-blur-xl p-1.5 rounded-2xl border border-white/50 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all">
                  {PLANNING_SECTIONS.filter(s => ['general', 'team', 'priority', 'metrics', 'goals', 'milestones', 'demo'].includes(s.id)).map(section => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    const isCompleted = checklist[section.id];
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={cn(
                          "px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 group",
                          isActive
                            ? "bg-slate-900 text-white shadow-lg scale-[1.02] translate-y-[-1px]"
                            : "text-slate-500 hover:bg-white/80 hover:text-slate-900 hover:shadow-sm"
                        )}
                      >
                        <Icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive ? "text-indigo-400" : "text-slate-400")} />
                        <span className="tracking-wide uppercase">{section.label}</span>
                        {isCompleted && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />}
                      </button>
                    );
                  })}
                </div>

                {/* Tactical Actions */}
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    className="rounded-2xl h-12 px-6 border-white/50 bg-white/40 backdrop-blur-md shadow-sm hover:bg-white/60 hover:shadow-md transition-all text-slate-600 font-bold text-xs uppercase tracking-wider"
                  >
                    Sync Data
                  </Button>
                  <Button
                    onClick={handleSaveAll}
                    disabled={isSaving}
                    className="rounded-2xl h-12 px-8 bg-indigo-600 hover:bg-indigo-700 shadow-[0_8px_20px_rgba(79,70,229,0.25)] hover:shadow-[0_12px_24px_rgba(79,70,229,0.35)] transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest"
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Deploy Strategy
                  </Button>
                </div>
              </div>

              <div className="w-full">
                <div className="space-y-10">
                  <div className="gsap-stagger-item">


                    <Separator />

                    {/* Content Switcher */}
                    <div className="min-h-[400px]">
                      {isPlanningDataLoading ? (
                        <SectionLoadingSkeleton />
                      ) : (
                        <>
                          {activeSection === 'general' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                              {/* General Parameters Card */}
                              <Card className="border-white/40 bg-white/50 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden rounded-[2.5rem] border-2 group">
                                <CardHeader className="pb-6 border-b border-slate-100 bg-slate-50/50 p-8">
                                  <div className="flex items-center gap-5">
                                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 flex items-center justify-center border border-indigo-500/10 shadow-sm transition-transform group-hover:scale-105">
                                      <LayoutDashboard className="h-7 w-7 text-indigo-600" />
                                    </div>
                                    <div>
                                      <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Core Logistics</CardTitle>
                                      <CardDescription className="text-sm font-medium text-slate-500">Configure the operational boundaries of this sprint cycle.</CardDescription>
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent className="space-y-10 p-10">
                                  {/* Strategic Alignment Alert */}
                                  <div className="rounded-3xl bg-indigo-50/40 p-6 border border-indigo-100/50 flex gap-5 items-start shadow-inner relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
                                    <div className="h-8 w-8 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm border border-indigo-100">
                                      <Info className="h-4 w-4 text-indigo-600" />
                                    </div>
                                    <div className="space-y-1 relative z-10">
                                      <h4 className="text-sm font-bold text-indigo-900">Strategic Alignment</h4>
                                      <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                        Strategic planning mode enabled. Selection will pull <span className="text-indigo-700 font-bold underline decoration-indigo-200 underline-offset-4">Team Velocity</span>, <span className="text-indigo-700 font-bold underline decoration-indigo-200 underline-offset-4">Goals</span>, and <span className="text-indigo-700 font-bold underline decoration-indigo-200 underline-offset-4">Milestones</span> to establish baseline targets.
                                      </p>
                                    </div>
                                  </div>

                                  <div className="grid gap-10 md:grid-cols-2">
                                    {/* Inception Date */}
                                    <div className="space-y-4">
                                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 pl-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                        Inception Date
                                      </label>
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <Button
                                            variant={"outline"}
                                            className={cn(
                                              "w-full h-16 justify-start text-left font-bold border-2 border-slate-100 rounded-2xl bg-white hover:bg-slate-50 hover:border-indigo-300 transition-all shadow-sm text-lg",
                                              !date?.from && "text-slate-400"
                                            )}
                                          >
                                            <CalendarIcon className="mr-4 h-5 w-5 text-indigo-500" />
                                            {date?.from ? format(date.from, "PPP") : <span>Set Start Date</span>}
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 rounded-3xl border-0 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                                          <Calendar
                                            mode="single"
                                            selected={date?.from}
                                            onSelect={(selected: Date | undefined) => setDate(prev => ({ ...prev, from: selected, to: prev?.to }))}
                                            initialFocus
                                            className="p-4"
                                          />
                                        </PopoverContent>
                                      </Popover>
                                    </div>

                                    {/* Conclusion Date */}
                                    <div className="space-y-4">
                                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 pl-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                        Conclusion Date
                                      </label>
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <Button
                                            variant={"outline"}
                                            className={cn(
                                              "w-full h-16 justify-start text-left font-bold border-2 border-slate-100 rounded-2xl bg-white hover:bg-slate-50 hover:border-indigo-300 transition-all shadow-sm text-lg",
                                              !date?.to && "text-slate-400"
                                            )}
                                          >
                                            <CalendarIcon className="mr-4 h-5 w-5 text-indigo-500" />
                                            {date?.to ? format(date.to, "PPP") : <span>Set End Date</span>}
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 rounded-3xl border-0 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                                          <Calendar
                                            mode="single"
                                            selected={date?.to}
                                            onSelect={(selected: Date | undefined) => setDate(prev => ({ ...prev, to: selected, from: prev?.from }))}
                                            initialFocus
                                            className="p-4"
                                          />
                                        </PopoverContent>
                                      </Popover>
                                    </div>
                                  </div>

                                  {/* Deployment Scope Summary */}
                                  <div className="pt-4">
                                    <div className="p-8 rounded-[2rem] bg-slate-900 text-white relative overflow-hidden shadow-2xl group/scope">
                                      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -mr-32 -mt-32 transition-transform duration-700 group-hover/scope:scale-110" />
                                      <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                                        <div className="space-y-3">
                                          <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                                              <Zap className="h-5 w-5 text-white" />
                                            </div>
                                            <h3 className="text-xl font-black tracking-tight">Deployment Window</h3>
                                          </div>
                                          <p className="text-slate-400 text-sm font-medium max-w-sm">The automated release pipeline will be primed for this specific duration.</p>
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                          <span className="text-6xl font-black text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                                            {calculateSprintDays()}
                                          </span>
                                          <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Op-Days</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          )}

                          {activeSection === 'team' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
                              <div className="flex items-center justify-between px-2">
                                <div className="space-y-1">
                                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Force Composition</h3>
                                  <p className="text-sm font-medium text-slate-500">Deploy elite personnel to strategic mission roles.</p>
                                </div>
                                <Button className="rounded-2xl h-11 bg-slate-900 hover:bg-slate-800 font-bold text-xs uppercase tracking-widest px-6 shadow-lg shadow-black/5">
                                  Add Resource
                                </Button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                                {[
                                  { id: 'po', label: 'Product Owners', icon: Crown, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', desc: 'Strategy & Vision Mapping' },
                                  { id: 'sm', label: 'Scrum Masters', icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', desc: 'Operational Flow Control' },
                                  { id: 'dev', label: 'Engineering Root', icon: Code, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', desc: 'Technical Architecture & Build' },
                                  { id: 'qa', label: 'System Validation', icon: ShieldAlert, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', desc: 'Quality Guard & Hardening' }
                                ].map((role) => (
                                  <Card key={role.id} className="border-white/40 bg-white/60 backdrop-blur-md rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border-2 group hover:shadow-2xl hover:translate-y-[-4px] transition-all duration-500 overflow-hidden">
                                    <CardHeader className="pb-6 p-8">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-5">
                                          <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110", role.bg)}>
                                            <role.icon className={cn("h-7 w-7", role.color)} />
                                          </div>
                                          <div>
                                            <h4 className="text-xl font-black text-slate-900 tracking-tight leading-none">{role.label}</h4>
                                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-2">{role.desc}</p>
                                          </div>
                                        </div>
                                        <div className="h-10 w-10 rounded-full border-2 border-slate-50 flex items-center justify-center bg-white shadow-sm">
                                          <span className="text-xs font-black text-slate-900">0</span>
                                        </div>
                                      </div>
                                    </CardHeader>
                                    <CardContent className="px-8 pb-8">
                                      <Select>
                                        <SelectTrigger className="h-14 bg-white/80 rounded-2xl border-2 border-slate-100 focus:ring-4 ring-indigo-500/5 group-hover:border-indigo-200 transition-all font-bold text-slate-700 text-base">
                                          <SelectValue placeholder={`Assign ${role.label}...`} />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-0 shadow-2xl p-2">
                                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">Available Members</div>
                                          <SelectItem value="1" className="rounded-xl font-bold py-3">Sarah Johnson (Lead)</SelectItem>
                                          <SelectItem value="2" className="rounded-xl font-bold py-3">Michael Chen (Expert)</SelectItem>
                                          <SelectItem value="3" className="rounded-xl font-bold py-3">Elena Rodriguez</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          )}

                          {activeSection === 'priority' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
                              <div className="flex items-center justify-between px-2">
                                <div className="space-y-1">
                                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Core Objectives</h3>
                                  <p className="text-sm font-medium text-slate-500">Define high-impact initiatives for the upcoming cycle.</p>
                                </div>
                                <Button
                                  onClick={addProject}
                                  className="rounded-2xl h-11 bg-slate-900 hover:bg-slate-800 font-bold text-xs uppercase tracking-widest px-6 shadow-lg shadow-black/5"
                                >
                                  Define Objective
                                </Button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                  { label: 'Critical Path', value: projects.filter(p => p.priority === 'critical').length, color: 'text-rose-600', bg: 'bg-rose-50', icon: ShieldAlert },
                                  { label: 'High Velocity', value: projects.filter(p => p.priority === 'high').length, color: 'text-indigo-600', bg: 'bg-indigo-50', icon: Zap },
                                  { label: 'Strategic Ops', value: projects.filter(p => p.priority === 'medium').length, color: 'text-slate-600', bg: 'bg-slate-50', icon: Target }
                                ].map((stat, i) => (
                                  <div key={i} className="p-6 rounded-[2rem] bg-white/60 backdrop-blur-md border-2 border-white/40 shadow-sm flex items-center justify-between group hover:shadow-xl transition-all duration-500">
                                    <div className="space-y-1">
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                      <p className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
                                    </div>
                                    <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12", stat.bg)}>
                                      <stat.icon className={cn("h-6 w-6", stat.color)} />
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <Card className="border-white/40 bg-white/50 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden rounded-[2.5rem] border-2">
                                <CardHeader className="p-8 border-b border-slate-100 bg-slate-50/50">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-5">
                                      <div className="h-14 w-14 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg">
                                        <ListTodo className="h-7 w-7 text-white" />
                                      </div>
                                      <div>
                                        <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Project Pipeline</CardTitle>
                                        <CardDescription className="text-sm font-medium text-slate-500">Sequencing mission-critical deliverables.</CardDescription>
                                      </div>
                                    </div>
                                    <Badge className="bg-slate-900 text-white rounded-full px-4 py-1.5 font-bold text-xs tracking-widest uppercase border-0">
                                      {projects.length} Entries
                                    </Badge>
                                  </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                  <div className="divide-y divide-slate-100">
                                    {projects.map((project, idx) => (
                                      <div key={project.id} className="p-8 flex items-center justify-between hover:bg-slate-50/80 transition-all group">
                                        <div className="flex-1 space-y-6">
                                          <div className="flex items-center gap-6">
                                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-400 border border-slate-200">
                                              {idx + 1}
                                            </div>
                                            <div className="flex-1">
                                              <Input
                                                value={project.name}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProject(project.id, 'name', e.target.value)}
                                                className="border-0 bg-transparent p-0 h-auto text-xl font-black text-slate-900 focus-visible:ring-0 placeholder:text-slate-200"
                                                placeholder="Mission Name..."
                                              />
                                              <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Impact Layer Alpha</span>
                                              </div>
                                            </div>
                                          </div>

                                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-16">
                                            <div className="md:col-span-1">
                                              <Select
                                                value={project.priority}
                                                onValueChange={(val: string) => updateProject(project.id, 'priority', val)}
                                              >
                                                <SelectTrigger className="h-10 bg-white border-slate-200 rounded-xl font-bold text-xs uppercase tracking-wider">
                                                  <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-0 shadow-2xl">
                                                  <SelectItem value="critical" className="font-bold text-rose-600">Critical</SelectItem>
                                                  <SelectItem value="high" className="font-bold text-indigo-600">High</SelectItem>
                                                  <SelectItem value="medium" className="font-bold">Medium</SelectItem>
                                                  <SelectItem value="low" className="font-bold text-slate-400">Low</SelectItem>
                                                </SelectContent>
                                              </Select>
                                            </div>
                                            <div className="md:col-span-2">
                                              <Input
                                                value={project.remarks}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProject(project.id, 'remarks', e.target.value)}
                                                className="h-10 bg-slate-50 border-slate-100 rounded-xl text-xs font-medium"
                                                placeholder="Mission parameters and strategic remarks..."
                                              />
                                            </div>
                                            <div className="md:col-span-1 flex justify-end">
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-10 w-10 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                                                onClick={() => {
                                                  setDeleteConfig({
                                                    isOpen: true,
                                                    title: "Strategic Termination",
                                                    description: `Abort project "${project.name}" from current cycle?`,
                                                    action: () => deleteProject(project.id)
                                                  });
                                                }}
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                    {projects.length === 0 && (
                                      <div className="p-20 text-center space-y-4">
                                        <div className="h-20 w-20 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center mx-auto">
                                          <Target className="h-8 w-8 text-slate-300" />
                                        </div>
                                        <div>
                                          <p className="font-black text-slate-900 tracking-tight">No active objectives</p>
                                          <p className="text-sm font-medium text-slate-500">Start by defining your primary mission targets.</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          )}




                          {activeSection === 'metrics' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-none px-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                    <BarChart3 className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                                  </div>
                                  <div>
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic">Velocity Intelligence</h2>
                                    <p className="text-slate-500 font-medium mt-1 text-sm">Orchestrate platform allocations & cross-functional capacity.</p>
                                  </div>
                                </div>
                              </div>

                              <Card className="border-0 rounded-[2.5rem] bg-white/40 dark:bg-slate-950/40 backdrop-blur-xl shadow-sm border border-white/50 dark:border-slate-800/50 overflow-hidden">
                                <CardContent className="p-10 space-y-10">
                                  {/* Add Platform Section */}
                                  <div className="flex gap-4 items-center group/input">
                                    <div className="flex-1 relative">
                                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-indigo-500 transition-colors">
                                        <LayoutDashboard className="h-5 w-5" />
                                      </div>
                                      <Input
                                        placeholder="Define Strategic Platform (e.g. Android Core, Cloud Infra)..."
                                        value={newPlatformName}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPlatformName(e.target.value)}
                                        className="h-14 pl-12 text-lg font-bold bg-white/80 dark:bg-slate-900/80 border-0 focus-visible:ring-2 focus-visible:ring-indigo-500/20 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-none placeholder:text-slate-300 transition-all"
                                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                          if (e.key === 'Enter') addPlatform();
                                        }}
                                      />
                                    </div>
                                    <Button
                                      type="button"
                                      onClick={addPlatform}
                                      className="h-14 px-8 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-slate-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-98 disabled:opacity-50"
                                      disabled={!newPlatformName.trim()}
                                    >
                                      <Plus className="h-5 w-5 mr-2" />
                                      Incorporate Platform
                                    </Button>
                                  </div>

                                  <Separator className="bg-slate-100 dark:bg-slate-800" />

                                  {/* Platforms List */}
                                  <div className="space-y-6">
                                    {platforms.length === 0 ? (
                                      <div className="text-center py-24 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] bg-slate-50/50 dark:bg-slate-900/20 flex flex-col items-center gap-6 group">
                                        <div className="h-20 w-20 rounded-3xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500 border border-slate-100 dark:border-slate-800">
                                          <LayoutDashboard className="h-10 w-10 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                        </div>
                                        <div className="space-y-2">
                                          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">No Active Platforms</h3>
                                          <p className="text-slate-500 font-medium max-w-sm mx-auto">Configure your cross-functional strategic units to orchestrate delivery metrics.</p>
                                        </div>
                                        <Button
                                          onClick={addPlatform}
                                          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold px-8 shadow-lg shadow-indigo-100 dark:shadow-none"
                                        >
                                          Initialize First Platform
                                        </Button>
                                      </div>
                                    ) : (
                                      platforms.map((platform, index) => {
                                        const colors = [
                                          'bg-indigo-500', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-violet-500'
                                        ];
                                        const colorClass = colors[index % colors.length];

                                        return (
                                          <div
                                            key={platform.id}
                                            className={cn(
                                              "group relative rounded-[2.5rem] border-0 transition-all duration-500 overflow-hidden",
                                              platform.isExpanded
                                                ? "bg-white dark:bg-slate-950 shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800"
                                                : "bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-sm"
                                            )}
                                          >
                                            {/* Platform Header */}
                                            <div
                                              className="flex items-center justify-between p-8 cursor-pointer select-none"
                                              onClick={() => togglePlatform(platform.id)}
                                            >
                                              <div className="flex items-center gap-6">
                                                <div className={cn("h-12 w-1.5 rounded-full transition-transform duration-500", colorClass, platform.isExpanded ? "scale-y-125" : "opacity-40")} />
                                                <div>
                                                  <h4 className={cn("text-xl font-black tracking-tight transition-colors duration-300",
                                                    platform.isExpanded ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400 group-hover:text-slate-900"
                                                  )}>
                                                    {platform.name}
                                                  </h4>
                                                  <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Strategic Unit</span>
                                                    <div className="h-1 w-1 rounded-full bg-slate-300" />
                                                    <span className="text-[10px] font-bold text-slate-500">{platform.members.length} Intellectuals</span>
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="flex items-center gap-3">
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  onClick={(e: React.MouseEvent) => {
                                                    e.stopPropagation();
                                                    confirmDelete(
                                                      "Terminate Platform?",
                                                      `Are you sure you want to remove sequence "${platform.name}"? All metrics and allocations will be permanently purged.`,
                                                      () => deletePlatform(platform.id)
                                                    );
                                                  }}
                                                  className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-900 shadow-sm hover:shadow-lg transition-all text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100"
                                                >
                                                  <Trash2 className="h-5 w-5" />
                                                </Button>
                                                <div className={cn("h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 transform transition-all duration-500", platform.isExpanded ? "rotate-180 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40" : "")}>
                                                  <ChevronDown className="h-6 w-6" />
                                                </div>
                                              </div>
                                            </div>

                                            {/* Platform Details Body */}
                                            {platform.isExpanded && (
                                              <div className="p-10 bg-slate-50/20 dark:bg-slate-900/10 space-y-12 animate-in slide-in-from-top-4 duration-500">

                                                {/* Members Section */}
                                                <div className="space-y-6">
                                                  <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                      <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800">
                                                        <Users className="h-5 w-5 text-indigo-500" />
                                                      </div>
                                                      <div>
                                                        <h5 className="text-lg font-black text-slate-900 dark:text-white tracking-tight italic">Resource Distribution</h5>
                                                        <p className="text-xs text-slate-500 font-medium">Assign strategic thinkers to this platform.</p>
                                                      </div>
                                                    </div>
                                                    <Badge variant="outline" className="rounded-lg px-3 py-1 border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-bold">
                                                      {platform.members.length} Intellectuals
                                                    </Badge>
                                                  </div>

                                                  <div className="relative group/member">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/member:text-indigo-500 transition-colors">
                                                      <Plus className="h-4 w-4" />
                                                    </div>
                                                    <Input
                                                      placeholder="Enter name to incorporate member (Press Enter)..."
                                                      className="h-12 pl-12 bg-white dark:bg-slate-900 border-0 focus-visible:ring-2 focus-visible:ring-indigo-500/20 rounded-2xl shadow-sm text-sm font-medium"
                                                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                                        if (e.key === 'Enter') {
                                                          const val = e.currentTarget.value.trim();
                                                          if (val) {
                                                            setPlatforms(prev => prev.map(p => p.id === platform.id ? { ...p, members: [...p.members, val] } : p));
                                                            e.currentTarget.value = '';
                                                          }
                                                        }
                                                      }}
                                                    />
                                                  </div>

                                                  {platform.members.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 pt-2">
                                                      {platform.members.map((member, idx) => (
                                                        <Badge
                                                          key={idx}
                                                          variant="secondary"
                                                          className="group/badge px-4 py-2 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-xl flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300 shadow-sm hover:shadow-md transition-all hover:scale-105"
                                                        >
                                                          <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                                                          {member}
                                                          <button
                                                            onClick={() => confirmDelete(
                                                              "Remove Strategic Member?",
                                                              `Are you sure you want to remove ${member} from this platform sequence?`,
                                                              () => setPlatforms(prev => prev.map(p => p.id === platform.id ? { ...p, members: p.members.filter((_, i) => i !== idx) } : p))
                                                            )}
                                                            className="ml-1 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover/badge:opacity-100"
                                                          >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                          </button>
                                                        </Badge>
                                                      ))}
                                                    </div>
                                                  )}
                                                </div>

                                                <Separator className="bg-slate-100/50 dark:bg-slate-800/50" />

                                                {/* Metrics Inputs - Stat Cards Style */}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                  {/* Total Story Points */}
                                                  <div className="group/stat bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-500">
                                                    <div className="flex items-center gap-4 mb-6">
                                                      <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover/stat:scale-110 transition-transform">
                                                        <Zap className="h-6 w-6" />
                                                      </div>
                                                      <div>
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Capacity</label>
                                                        <div className="text-sm font-bold text-slate-900 dark:text-white">Story Points</div>
                                                      </div>
                                                    </div>
                                                    <Input
                                                      type="number"
                                                      className="h-14 text-2xl font-black bg-slate-50 dark:bg-slate-950 border-0 focus-visible:ring-2 focus-visible:ring-indigo-500/20 rounded-2xl text-center"
                                                      placeholder="0"
                                                      value={platform.totalStoryPoints || ''}
                                                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlatforms(prev => prev.map(p => p.id === platform.id ? { ...p, totalStoryPoints: Number(e.target.value) } : p))}
                                                    />
                                                  </div>

                                                  {/* Target Improvement */}
                                                  <div className="group/stat bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-500">
                                                    <div className="flex items-center gap-4 mb-6">
                                                      <div className="h-12 w-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover/stat:scale-110 transition-transform">
                                                        <ArrowUp className="h-6 w-6" />
                                                      </div>
                                                      <div>
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Alpha</label>
                                                        <div className="text-sm font-bold text-slate-900 dark:text-white">Improvement %</div>
                                                      </div>
                                                    </div>
                                                    <Input
                                                      type="number"
                                                      className="h-14 text-2xl font-black bg-slate-50 dark:bg-slate-950 border-0 focus-visible:ring-2 focus-visible:ring-rose-500/20 rounded-2xl text-center"
                                                      placeholder="0%"
                                                      value={platform.targetImprovement || ''}
                                                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlatforms(prev => prev.map(p => p.id === platform.id ? { ...p, targetImprovement: Number(e.target.value) } : p))}
                                                    />
                                                  </div>

                                                  {/* Target Velocity */}
                                                  <div className="group/stat bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-500">
                                                    <div className="flex items-center gap-4 mb-6">
                                                      <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover/stat:scale-110 transition-transform">
                                                        <Activity className="h-6 w-6" />
                                                      </div>
                                                      <div>
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Velocity Node</label>
                                                        <div className="text-sm font-bold text-slate-900 dark:text-white">Target Rhythm</div>
                                                      </div>
                                                    </div>
                                                    <Input
                                                      type="number"
                                                      className="h-14 text-2xl font-black bg-slate-50 dark:bg-slate-950 border-0 focus-visible:ring-2 focus-visible:ring-amber-500/20 rounded-2xl text-center"
                                                      placeholder="0"
                                                      value={platform.targetVelocity || ''}
                                                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlatforms(prev => prev.map(p => p.id === platform.id ? { ...p, targetVelocity: Number(e.target.value) } : p))}
                                                    />
                                                  </div>
                                                </div>

                                                <Separator className="bg-slate-100/50 dark:bg-slate-800/50" />

                                                {/* Project Allocations */}
                                                <div className="space-y-6">
                                                  <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                      <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800">
                                                        <Target className="h-5 w-5 text-indigo-500" />
                                                      </div>
                                                      <div>
                                                        <h5 className="text-lg font-black text-slate-900 dark:text-white tracking-tight italic">Strategic Allocation</h5>
                                                        <p className="text-xs text-slate-500 font-medium">Distribute story points across active projects.</p>
                                                      </div>
                                                    </div>
                                                    <Button
                                                      variant="outline"
                                                      size="sm"
                                                      onClick={() => {
                                                        setPlatforms(prev => prev.map(p => p.id === platform.id ? { ...p, allocations: [...p.allocations, { projectId: projects[0]?.id || '', allocatedPercent: 0 }] } : p));
                                                      }}
                                                      className="rounded-xl border-slate-200 dark:border-slate-800 font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
                                                    >
                                                      <Plus className="h-3.5 w-3.5 mr-2" />
                                                      Initialize Allocation
                                                    </Button>
                                                  </div>

                                                  <div className="rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950 shadow-sm">
                                                    <table className="w-full text-sm border-collapse">
                                                      <thead>
                                                        <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                                                          <th className="text-left font-black uppercase tracking-widest text-[10px] text-slate-400 p-6">Strategic Project</th>
                                                          <th className="text-left font-black uppercase tracking-widest text-[10px] text-slate-400 p-6 w-32">Allocation %</th>
                                                          <th className="text-left font-black uppercase tracking-widest text-[10px] text-slate-400 p-6 w-32">Points</th>
                                                          <th className="w-20"></th>
                                                        </tr>
                                                      </thead>
                                                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                        {platform.allocations.map((alloc, idx) => {
                                                          const project = projects.find(p => p.id === alloc.projectId);
                                                          const points = Math.round((platform.totalStoryPoints * alloc.allocatedPercent) / 100);
                                                          return (
                                                            <tr key={idx} className="group/row hover:bg-slate-50/30 dark:hover:bg-slate-900/30 transition-colors">
                                                              <td className="p-6">
                                                                <Select
                                                                  value={alloc.projectId}
                                                                  onValueChange={(val: string) => {
                                                                    setPlatforms(prev => prev.map(p => p.id === platform.id ? {
                                                                      ...p,
                                                                      allocations: p.allocations.map((a, i) => i === idx ? { ...a, projectId: val } : a)
                                                                    } : p));
                                                                  }}
                                                                >
                                                                  <SelectTrigger className="h-10 border-slate-200 dark:border-slate-800 bg-transparent rounded-xl font-bold text-slate-700 dark:text-slate-300">
                                                                    <SelectValue placeholder="Select Project" />
                                                                  </SelectTrigger>
                                                                  <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-2xl">
                                                                    {projects.map(p => (
                                                                      <SelectItem key={p.id} value={p.id} className="rounded-xl focus:bg-indigo-50 dark:focus:bg-indigo-950/40">{p.name}</SelectItem>
                                                                    ))}
                                                                  </SelectContent>
                                                                </Select>
                                                              </td>
                                                              <td className="p-6">
                                                                <div className="relative group/percent">
                                                                  <Input
                                                                    type="number"
                                                                    className="h-10 pr-8 text-right font-black border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl focus:ring-indigo-500/20"
                                                                    value={alloc.allocatedPercent}
                                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                                      setPlatforms(prev => prev.map(p => p.id === platform.id ? {
                                                                        ...p,
                                                                        allocations: p.allocations.map((a, i) => i === idx ? { ...a, allocatedPercent: Number(e.target.value) } : a)
                                                                      } : p));
                                                                    }}
                                                                  />
                                                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 group-focus-within/percent:text-indigo-500">%</span>
                                                                </div>
                                                              </td>
                                                              <td className="p-6">
                                                                <div className="flex flex-col">
                                                                  <span className="text-base font-black text-slate-900 dark:text-white">{points}</span>
                                                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Points</span>
                                                                </div>
                                                              </td>
                                                              <td className="p-6 text-right">
                                                                <button
                                                                  onClick={() => confirmDelete(
                                                                    "Purge Allocation?",
                                                                    `Are you sure you want to remove the resource distribution for "${project?.name || 'this Project'}"?`,
                                                                    () => setPlatforms(prev => prev.map(p => p.id === platform.id ? { ...p, allocations: p.allocations.filter((_, i) => i !== idx) } : p))
                                                                  )}
                                                                  className="h-10 w-10 flex items-center justify-center rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all opacity-0 group-hover/row:opacity-100"
                                                                >
                                                                  <Trash2 className="h-4 w-4" />
                                                                </button>
                                                              </td>
                                                            </tr>
                                                          );
                                                        })}
                                                        {platform.allocations.length === 0 && (
                                                          <tr>
                                                            <td colSpan={4} className="p-12 text-center">
                                                              <div className="flex flex-col items-center gap-3 text-slate-400">
                                                                <Target className="h-10 w-10 opacity-10" />
                                                                <p className="text-sm font-medium italic">No strategic allocations defined.</p>
                                                              </div>
                                                            </td>
                                                          </tr>
                                                        )}
                                                        <tr className="bg-slate-50/50 dark:bg-slate-900/50 font-black text-slate-900 dark:text-white border-t-2 border-slate-100 dark:border-slate-800">
                                                          <td className="p-6 text-right text-[10px] uppercase tracking-widest text-slate-400">Aggregated Total</td>
                                                          <td className="p-6 text-lg">
                                                            {platform.allocations.reduce((sum, a) => sum + a.allocatedPercent, 0)}%
                                                          </td>
                                                          <td className="p-6 text-lg">
                                                            {Math.round((platform.totalStoryPoints * platform.allocations.reduce((sum, a) => sum + a.allocatedPercent, 0)) / 100)} pts
                                                          </td>
                                                          <td></td>
                                                        </tr>
                                                      </tbody>
                                                    </table>
                                                  </div>
                                                </div>

                                                <Separator />

                                                {/* Holidays */}
                                                <div className="space-y-6">
                                                  <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                      <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800">
                                                        <CalendarIcon className="h-5 w-5 text-indigo-500" />
                                                      </div>
                                                      <div>
                                                        <h5 className="text-lg font-black text-slate-900 dark:text-white tracking-tight italic">Temporal Exceptions</h5>
                                                        <p className="text-xs text-slate-500 font-medium">Define regional holidays and mandatory downtime.</p>
                                                      </div>
                                                    </div>
                                                    <Button
                                                      variant="outline"
                                                      size="sm"
                                                      onClick={() => {
                                                        setPlatforms(prev => prev.map(p => p.id === platform.id ? {
                                                          ...p,
                                                          holidays: [...p.holidays, { id: Date.now().toString(), country: '', days: 0 }]
                                                        } : p));
                                                      }}
                                                      className="rounded-xl border-slate-200 dark:border-slate-800 font-bold"
                                                    >
                                                      <Plus className="h-3.5 w-3.5 mr-2" />
                                                      Record Holiday
                                                    </Button>
                                                  </div>

                                                  <div className="space-y-3">
                                                    {platform.holidays.map((holiday, idx) => (
                                                      <div key={holiday.id} className="group/holiday flex gap-4 items-center p-4 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all">
                                                        <div className="flex-1">
                                                          <Input
                                                            placeholder="Country / Region Name"
                                                            className="h-10 border-0 bg-transparent font-bold text-slate-700 dark:text-slate-300 focus-visible:ring-0 px-0"
                                                            value={holiday.country}
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlatforms(prev => prev.map(p => p.id === platform.id ? { ...p, holidays: p.holidays.map((h, i) => i === idx ? { ...h, country: e.target.value } : h) } : p))}
                                                          />
                                                        </div>
                                                        <div className="relative w-32">
                                                          <Input
                                                            type="number"
                                                            placeholder="Days"
                                                            className="h-10 pr-12 text-right font-black border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl"
                                                            value={holiday.days || ''}
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlatforms(prev => prev.map(p => p.id === platform.id ? { ...p, holidays: p.holidays.map((h, i) => i === idx ? { ...h, days: Number(e.target.value) } : h) } : p))}
                                                          />
                                                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">Days</span>
                                                        </div>
                                                        <Button
                                                          variant="ghost"
                                                          size="icon"
                                                          className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl opacity-0 group-hover/holiday:opacity-100 transition-all"
                                                          onClick={() => confirmDelete(
                                                            "Expunge Holiday?",
                                                            `Are you sure you want to remove the temporal entry for "${holiday.country || 'Specified Region'}"?`,
                                                            () => setPlatforms(prev => prev.map(p => p.id === platform.id ? { ...p, holidays: p.holidays.filter((_, i) => i !== idx) } : p))
                                                          )}
                                                        >
                                                          <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                      </div>
                                                    ))}
                                                    {platform.holidays.length === 0 && (
                                                      <div className="text-sm text-slate-400 italic px-4 py-8 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] text-center">
                                                        No temporal exceptions registered for this platform sequence.
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>

                                                <Separator className="bg-slate-100/50 dark:bg-slate-800/50" />

                                                {/* Developer Details */}
                                                <div className="space-y-8">
                                                  <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800">
                                                      <Briefcase className="h-5 w-5 text-indigo-500" />
                                                    </div>
                                                    <div>
                                                      <h5 className="text-lg font-black text-slate-900 dark:text-white tracking-tight italic">Unit Capacity & Deployment</h5>
                                                      <p className="text-xs text-slate-500 font-medium">Fine-tune individual contributor throughput and leave schedules.</p>
                                                    </div>
                                                  </div>

                                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {platform.members.map((member, idx) => {
                                                      const details = platform.developerLeaves.find(d => d.name === member) || { id: '', name: member, country: '', capacity: 1, plannedLeave: 0 };

                                                      const updateDetails = (field: keyof DeveloperLeave, value: any) => {
                                                        setPlatforms(prev => prev.map(p => p.id === platform.id ? {
                                                          ...p,
                                                          developerLeaves: (() => {
                                                            const textExists = p.developerLeaves.find(d => d.name === member);
                                                            if (textExists) {
                                                              return p.developerLeaves.map(d => d.name === member ? { ...d, [field]: value } : d);
                                                            }
                                                            return [...p.developerLeaves, { id: Date.now().toString(), name: member, country: '', capacity: 1, plannedLeave: 0, [field]: value }];
                                                          })()
                                                        } : p));
                                                      };

                                                      return (
                                                        <div key={idx} className="p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-500 group/dev">
                                                          <div className="flex items-center gap-4 mb-6">
                                                            <div className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400 group-hover/dev:text-indigo-500 transition-colors">
                                                              <Users className="h-6 w-6" />
                                                            </div>
                                                            <div className="font-black text-lg text-slate-900 dark:text-white tracking-tight italic">{member}</div>
                                                          </div>

                                                          <div className="grid grid-cols-1 gap-6">
                                                            {/* Country Selection */}
                                                            <div className="space-y-2">
                                                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-1">Geographical Node</label>
                                                              <Select value={details.country} onValueChange={(val: string) => updateDetails('country', val)}>
                                                                <SelectTrigger className="h-12 bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-2xl font-bold">
                                                                  <SelectValue placeholder="Select Deployment Country" />
                                                                </SelectTrigger>
                                                                <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-2xl">
                                                                  {platform.holidays.filter(h => h.country).map(h => (
                                                                    <SelectItem key={h.id} value={h.country} className="rounded-xl">{h.country} ({h.days} Regional Days)</SelectItem>
                                                                  ))}
                                                                  <SelectItem value="Other" className="rounded-xl tracking-wide">Global / Standard Node</SelectItem>
                                                                </SelectContent>
                                                              </Select>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4">
                                                              {/* Capacity */}
                                                              <div className="space-y-2">
                                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-1">Throughput Scale</label>
                                                                <div className="relative">
                                                                  <Input
                                                                    type="number"
                                                                    step="0.1"
                                                                    max="1"
                                                                    min="0"
                                                                    className="h-12 bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-2xl font-black text-center pr-12"
                                                                    value={details.capacity}
                                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDetails('capacity', Number(e.target.value))}
                                                                  />
                                                                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">FPS</span>
                                                                </div>
                                                              </div>

                                                              {/* Planned Leave */}
                                                              <div className="space-y-2">
                                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-1">Planned Absense</label>
                                                                <div className="relative">
                                                                  <Input
                                                                    type="number"
                                                                    className="h-12 bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-2xl font-black text-center pr-12"
                                                                    value={details.plannedLeave}
                                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDetails('plannedLeave', Number(e.target.value))}
                                                                  />
                                                                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">Days</span>
                                                                </div>
                                                              </div>
                                                            </div>
                                                          </div>
                                                        </div>
                                                      );
                                                    })}
                                                  </div>
                                                </div>
                                                {/* Final Summary Table */}
                                                <div className="p-8 bg-slate-900 dark:bg-black rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden relative group/summary">
                                                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-rose-500/5 opacity-50" />
                                                  <div className="relative z-10 space-y-6">
                                                    <div className="flex items-center gap-4">
                                                      <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
                                                        <Activity className="h-6 w-6 text-indigo-400" />
                                                      </div>
                                                      <div>
                                                        <h5 className="text-xl font-black text-white tracking-tight italic">Consolidated Temporal Impact</h5>
                                                        <p className="text-xs text-slate-400 font-medium">Aggregated man-days of planned inactivity across the sequence.</p>
                                                      </div>
                                                    </div>

                                                    <div className="rounded-2xl border border-white/5 overflow-hidden">
                                                      <table className="w-full text-sm">
                                                        <thead>
                                                          <tr className="bg-white/5 text-left border-b border-white/5">
                                                            <th className="p-4 font-black uppercase tracking-widest text-[10px] text-slate-500">Resource Unit</th>
                                                            <th className="p-4 font-black uppercase tracking-widest text-[10px] text-slate-500 text-right">Inactivity Magnitude</th>
                                                          </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-white/5">
                                                          {platform.members.map((member, idx) => {
                                                            const details = platform.developerLeaves.find(d => d.name === member);
                                                            const countryHoliday = platform.holidays.find(h => h.country === details?.country);
                                                            const holidayDays = countryHoliday?.days || 0;
                                                            const leaveDays = details?.plannedLeave || 0;
                                                            const totalOff = holidayDays + leaveDays;

                                                            return (
                                                              <tr key={idx} className="hover:bg-white/5 transition-colors">
                                                                <td className="p-4 font-bold text-slate-300">{member}</td>
                                                                <td className="p-4 text-right">
                                                                  <div className="flex flex-col items-end">
                                                                    <div className="flex items-center gap-2">
                                                                      <span className="text-lg font-black text-white">{totalOff.toFixed(1)}</span>
                                                                      <span className="text-[10px] font-bold text-slate-500 uppercase">Days</span>
                                                                    </div>
                                                                    {(leaveDays > 0 || holidayDays > 0) && (
                                                                      <div className="text-[10px] text-indigo-400 font-bold tracking-tight">
                                                                        {leaveDays > 0 && `${leaveDays}L`}
                                                                        {leaveDays > 0 && holidayDays > 0 && " + "}
                                                                        {holidayDays > 0 && `${holidayDays}H (${details?.country})`}
                                                                      </div>
                                                                    )}
                                                                  </div>
                                                                </td>
                                                              </tr>
                                                            );
                                                          })}
                                                        </tbody>
                                                      </table>
                                                    </div>
                                                  </div>
                                                </div>

                                              </div>
                                            )}
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          )}

                          {activeSection === 'goals' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                              <Card className="border-none shadow-xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                                <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 pb-6 bg-white/50 dark:bg-zinc-900/50">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                        <Target className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                      </div>
                                      <div>
                                        <CardTitle className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Sprint Vision</CardTitle>
                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <div className="flex items-center gap-1.5 mt-1 cursor-pointer group/info">
                                              <p className="text-sm text-slate-500 font-medium group-hover/info:text-indigo-600 transition-colors">
                                                Strategic alignment guide & status legend
                                              </p>
                                              <Info className="h-4 w-4 text-slate-400 group-hover/info:text-indigo-500 transition-colors" />
                                            </div>
                                          </DialogTrigger>
                                          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl border-0 shadow-2xl bg-white/95 backdrop-blur-xl">
                                            <DialogHeader className="space-y-4">
                                              <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100 mb-2">
                                                <Target className="h-7 w-7 text-indigo-600" />
                                              </div>
                                              <div>
                                                <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Strategic Goal Framework</DialogTitle>
                                                <DialogDescription className="text-slate-500 font-medium text-base">
                                                  Master the art of defining outcome-driven objectives.
                                                </DialogDescription>
                                              </div>
                                            </DialogHeader>

                                            <Tabs defaultValue="best-practices" className="w-full mt-4">
                                              <TabsList className="grid w-full grid-cols-2">
                                                <TabsTrigger value="best-practices">Best Practices</TabsTrigger>
                                                <TabsTrigger value="legend">Status Legend</TabsTrigger>
                                              </TabsList>

                                              <TabsContent value="best-practices" className="space-y-6 pt-4 h-[60vh] overflow-y-auto pr-2">
                                                {/* 1. Golden Rule */}
                                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                                                  <h4 className="font-bold text-amber-900 dark:text-amber-100 flex items-center gap-2 mb-2">
                                                    <Crown className="h-5 w-5" /> 1. The Golden Rule: Goal vs. Scope
                                                  </h4>
                                                  <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-2">
                                                    A common mistake is treating the Sprint Goal as a summary of all tickets.
                                                  </p>
                                                  <ul className="text-sm space-y-1 list-disc list-inside text-zinc-600 dark:text-zinc-400">
                                                    <li><strong>The Reality:</strong> The Goal is the objective, the backlog is the plan.</li>
                                                    <li><strong>Why it matters:</strong> If time runs out, drop non-essential tickets (scope) while still delivering the Goal (value).</li>
                                                    <li><strong>Best Practice:</strong> The Goal should only require 70-80% of capacity, leaving room for the unknown.</li>
                                                  </ul>
                                                </div>

                                                {/* 2. Laundry List Trap */}
                                                <div className="space-y-3">
                                                  <h4 className="font-semibold text-lg">2. The "Laundry List" Trap</h4>
                                                  <p className="text-sm text-muted-foreground">Avoid combining unrelated items just to make them fit.</p>
                                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800 rounded-lg">
                                                      <div className="flex items-center gap-2 font-bold text-red-700 dark:text-red-300 mb-2">
                                                        <LogOut className="h-4 w-4 rotate-180" /> Bad (To-Do List)
                                                      </div>
                                                      <p className="text-xs text-red-600 dark:text-red-400">
                                                        "Complete the payment page, fix the header bug, and upgrade the database."
                                                      </p>
                                                    </div>
                                                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-lg">
                                                      <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-300 mb-2">
                                                        <CheckCircle2 className="h-4 w-4" /> Good (Value Driven)
                                                      </div>
                                                      <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                                        "Enable users to complete a purchase securely." <span className="opacity-75">(The bug/upgrade support this).</span>
                                                      </p>
                                                    </div>
                                                  </div>
                                                </div>

                                                {/* 3. Writing Formula Table */}
                                                <div className="space-y-3">
                                                  <h4 className="font-semibold text-lg">3. Writing Formula & Examples</h4>
                                                  <div className="bg-zinc-100 dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm font-medium text-center text-indigo-600 dark:text-indigo-400 mb-2">
                                                    "Our goal is to [Action/Change] so that [User/Business Value] is achieved."
                                                  </div>

                                                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                                                    <table className="w-full text-sm text-left">
                                                      <thead className="bg-zinc-50 dark:bg-zinc-900 text-zinc-500 uppercase text-xs">
                                                        <tr>
                                                          <th className="px-4 py-2 font-medium">Type</th>
                                                          <th className="px-4 py-2 font-medium text-red-500">❌ Weak Goal</th>
                                                          <th className="px-4 py-2 font-medium text-emerald-500">✅ Strong Goal</th>
                                                        </tr>
                                                      </thead>
                                                      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                                        <tr className="bg-white dark:bg-zinc-950">
                                                          <td className="px-4 py-3 font-medium">Feature</td>
                                                          <td className="px-4 py-3 text-zinc-500">"Finish the new Search tickets."</td>
                                                          <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">"Improve search relevance so customers find products faster."</td>
                                                        </tr>
                                                        <tr className="bg-white dark:bg-zinc-950">
                                                          <td className="px-4 py-3 font-medium">Risk</td>
                                                          <td className="px-4 py-3 text-zinc-500">"Do the research spike."</td>
                                                          <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">"Validate the new architecture to ensure it handles 10k users."</td>
                                                        </tr>
                                                        <tr className="bg-white dark:bg-zinc-950">
                                                          <td className="px-4 py-3 font-medium">Fix</td>
                                                          <td className="px-4 py-3 text-zinc-500">"Close 10 bugs."</td>
                                                          <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">"Stabilize the checkout flow to reduce cart abandonment."</td>
                                                        </tr>
                                                      </tbody>
                                                    </table>
                                                  </div>
                                                </div>

                                                {/* 4. SMART Checklist */}
                                                <div className="space-y-3">
                                                  <h4 className="font-semibold text-lg">4. The "SMART" Checklist</h4>
                                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
                                                    {['Specific?', 'Measurable?', 'Achievable?', 'Value-Driven?'].map((item) => (
                                                      <div key={item} className="p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-sm font-bold text-zinc-700 dark:text-zinc-300">
                                                        {item}
                                                      </div>
                                                    ))}
                                                  </div>
                                                  <p className="text-sm text-zinc-500 italic text-center">
                                                    "If we finish the tickets but miss this goal, did we fail? (Answer should be Yes)."
                                                  </p>
                                                </div>

                                                {/* 5. During Sprint */}
                                                <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 rounded-xl p-4">
                                                  <h4 className="font-bold text-indigo-900 dark:text-indigo-100 mb-2">5. During the Sprint</h4>
                                                  <div className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                                                    <div className="flex gap-2">
                                                      <span className="font-bold whitespace-nowrap">Daily Focus:</span>
                                                      <span>Ask "How is our progress toward the Goal?" (Not just "What did you do?").</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                      <span className="font-bold whitespace-nowrap">Swarming:</span>
                                                      <span>If status is <span className="text-yellow-600 font-bold">At Risk</span>, the whole team should pause and "swarm" to unblock the goal.</span>
                                                    </div>
                                                  </div>
                                                </div>
                                              </TabsContent>

                                              <TabsContent value="legend" className="space-y-6 pt-4 h-[60vh] overflow-y-auto pr-2">
                                                {/* Phase 1 */}
                                                <div className="space-y-4">
                                                  <h4 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold text-xs">1</div>
                                                    Phase 1: Planning & Definition
                                                  </h4>
                                                  <p className="text-sm text-muted-foreground italic">Use these statuses before the Sprint officially starts.</p>

                                                  <div className="grid gap-3">
                                                    <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800">
                                                      <div className="flex items-center gap-2 mb-1">
                                                        <Circle className="h-3 w-3 text-zinc-400" />
                                                        <span className="font-bold text-zinc-700 dark:text-zinc-300">Draft</span>
                                                      </div>
                                                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                                        <span className="font-semibold text-zinc-900 dark:text-zinc-200">Meaning:</span> The goal is currently being written or brainstormed by the Product Owner.<br />
                                                        <span className="font-semibold text-zinc-900 dark:text-zinc-200">Action:</span> Refine the wording to ensure it is SMART.
                                                      </p>
                                                    </div>

                                                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50">
                                                      <div className="flex items-center gap-2 mb-1">
                                                        <div className="h-3 w-3 rounded-full bg-blue-500" />
                                                        <span className="font-bold text-blue-900 dark:text-blue-100">Proposed</span>
                                                      </div>
                                                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                                        <span className="font-semibold text-zinc-900 dark:text-zinc-200">Meaning:</span> Presented to the team for feasibility checking during Sprint Planning.<br />
                                                        <span className="font-semibold text-zinc-900 dark:text-zinc-200">Action:</span> Developers and QA must review the goal for capacity fit.
                                                      </p>
                                                    </div>
                                                  </div>
                                                </div>

                                                {/* Phase 2 */}
                                                <div className="space-y-4">
                                                  <h4 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold text-xs">2</div>
                                                    Phase 2: Execution (Health Check)
                                                  </h4>
                                                  <p className="text-sm text-muted-foreground italic">Use these statuses to update stakeholders during Daily Standups.</p>

                                                  <div className="grid gap-3">
                                                    <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50">
                                                      <div className="flex items-center gap-2 mb-1">
                                                        <div className="h-3 w-3 rounded-full bg-emerald-500" />
                                                        <span className="font-bold text-emerald-900 dark:text-emerald-100">On Track</span>
                                                      </div>
                                                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                                        <span className="font-semibold text-zinc-900 dark:text-zinc-200">Meaning:</span> "Business as usual." The team is confident the goal will be met.<br />
                                                        <span className="font-semibold text-zinc-900 dark:text-zinc-200">Action:</span> Continue current execution strategy. No major blockers exist.
                                                      </p>
                                                    </div>

                                                    <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800/50">
                                                      <div className="flex items-center gap-2 mb-1">
                                                        <div className="h-3 w-3 rounded-full bg-yellow-500" />
                                                        <span className="font-bold text-yellow-900 dark:text-yellow-100">At Risk</span>
                                                      </div>
                                                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                                        <span className="font-semibold text-zinc-900 dark:text-zinc-200">Meaning:</span> "Warning." Impediments or scope creep have been identified.<br />
                                                        <span className="font-semibold text-zinc-900 dark:text-zinc-200">Action:</span> Discuss immediately. May need to swarm or deprioritize work.
                                                      </p>
                                                    </div>

                                                    <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50">
                                                      <div className="flex items-center gap-2 mb-1">
                                                        <div className="h-3 w-3 rounded-full bg-red-500" />
                                                        <span className="font-bold text-red-900 dark:text-red-100">Off Track</span>
                                                      </div>
                                                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                                        <span className="font-semibold text-zinc-900 dark:text-zinc-200">Meaning:</span> "Critical Alert." Highly unlikely the goal will be met.<br />
                                                        <span className="font-semibold text-zinc-900 dark:text-zinc-200">Action:</span> Immediate escalation to Product Owner. Decide to pivot or descope.
                                                      </p>
                                                    </div>

                                                    <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/50">
                                                      <div className="flex items-center gap-2 mb-1">
                                                        <div className="h-3 w-3 rounded-full bg-purple-500" />
                                                        <span className="font-bold text-purple-900 dark:text-purple-100">Blocked</span>
                                                      </div>
                                                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                                        <span className="font-semibold text-zinc-900 dark:text-zinc-200">Meaning:</span> Progress is completely halted due to an external dependency.<br />
                                                        <span className="font-semibold text-zinc-900 dark:text-zinc-200">Action:</span> Scrum Master must intervene. Team cannot proceed until resolved.
                                                      </p>
                                                    </div>
                                                  </div>
                                                </div>

                                                {/* Phase 3 */}
                                                <div className="space-y-4">
                                                  <h4 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold text-xs">3</div>
                                                    Phase 3: Completion (Retrospective)
                                                  </h4>
                                                  <p className="text-sm text-muted-foreground italic">Select these when closing the Sprint.</p>

                                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                                                      <div className="flex items-center gap-2 mb-2">
                                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                        <span className="font-semibold">Achieved</span>
                                                      </div>
                                                      <p className="text-xs text-muted-foreground">Delivered and met "Definition of Done."</p>
                                                    </div>
                                                    <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                                                      <div className="flex items-center gap-2 mb-2">
                                                        <div className="h-4 w-4 rounded-full border-2 border-orange-500 border-t-transparent -rotate-45" />
                                                        <span className="font-semibold">Partially Achieved</span>
                                                      </div>
                                                      <p className="text-xs text-muted-foreground">Value delivered, but missed some criteria.</p>
                                                    </div>
                                                    <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                                                      <div className="flex items-center gap-2 mb-2">
                                                        <LogOut className="h-4 w-4 text-red-500 rotate-180" />
                                                        <span className="font-semibold">Missed</span>
                                                      </div>
                                                      <p className="text-xs text-muted-foreground">Primary objective not completed.</p>
                                                    </div>
                                                    <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                                                      <div className="flex items-center gap-2 mb-2">
                                                        <Circle className="h-4 w-4 text-zinc-400" />
                                                        <span className="font-semibold">Abandoned</span>
                                                      </div>
                                                      <p className="text-xs text-muted-foreground">Removed mid-sprint due to priority change.</p>
                                                    </div>
                                                  </div>
                                                </div>
                                              </TabsContent>

                                              <TabsContent value="best-practices" className="space-y-6 pt-4">
                                                <div className="space-y-4">
                                                  <h4 className="font-semibold text-lg">What is a Sprint Goal?</h4>
                                                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                                    The Sprint Goal is the single, overarching objective for the Sprint. It acts as the "North Star," providing the <strong>Why</strong> behind the work. It allows the team to focus on value and collaboration, rather than just clearing a list of tickets.
                                                  </p>
                                                </div>

                                                <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
                                                  <div className="flex items-center gap-2 mb-3">
                                                    <Zap className="h-5 w-5 text-amber-500 fill-amber-500" />
                                                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100">Pro Tip: How to write a good Goal</h4>
                                                  </div>
                                                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                                                    Don't just list tasks. Use this simple formula:
                                                  </p>

                                                  <div className="bg-white dark:bg-zinc-950 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 font-mono text-sm text-indigo-600 dark:text-indigo-400 mb-4 shadow-sm">
                                                    "We will [Action] the [Feature] to achieve [Outcome/Value]."
                                                  </div>

                                                  <div className="text-sm">
                                                    <span className="font-semibold text-zinc-900 dark:text-zinc-200">Example:</span>
                                                    <span className="text-zinc-600 dark:text-zinc-400 italic"> "Implement Face ID Login to reduce user sign-in time by 50%."</span>
                                                  </div>
                                                </div>
                                              </TabsContent>
                                            </Tabs>
                                          </DialogContent>
                                        </Dialog>
                                      </div>
                                    </div>
                                    <Button
                                      onClick={addSprintGoal}
                                      className="bg-slate-900 hover:bg-indigo-600 text-white shadow-xl shadow-slate-200 dark:shadow-none transition-all duration-300 rounded-2xl px-6 h-12 font-bold group"
                                    >
                                      <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                                      Define New Goal
                                    </Button>
                                  </div>
                                </CardHeader>
                                <CardContent className="pt-10 pb-10 px-8">
                                  {sprintGoals.length === 0 ? (
                                    <div className="text-center py-24 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] bg-slate-50/50 dark:bg-slate-900/20 flex flex-col items-center gap-6 group">
                                      <div className="h-20 w-20 rounded-3xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500 border border-slate-100 dark:border-slate-800">
                                        <Target className="h-10 w-10 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                      </div>
                                      <div className="space-y-2">
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">No Objectives Defined</h3>
                                        <p className="text-slate-500 font-medium max-w-sm mx-auto">Establish high-impact outcome statements to align the engineering force.</p>
                                      </div>
                                      <Button
                                        onClick={addSprintGoal}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold px-8 shadow-lg shadow-indigo-100 dark:shadow-none"
                                      >
                                        Establish First Goal
                                      </Button>
                                    </div>
                                  ) : (
                                    <DragDropContext onDragEnd={onDragEnd}>
                                      <Droppable droppableId="sprint-goals">
                                        {(provided) => (
                                          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                                            {sprintGoals.map((goal, index) => (
                                              <Draggable key={goal.id} draggableId={goal.id} index={index}>
                                                {(provided, snapshot) => (
                                                  <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className={cn(
                                                      "group relative border-0 rounded-[2rem] p-6 transition-all duration-300",
                                                      snapshot.isDragging ? "shadow-2xl ring-4 ring-indigo-500/10 rotate-1 z-50 scale-[1.02] bg-white" : "bg-white/40 dark:bg-slate-950/40 backdrop-blur-sm shadow-sm hover:shadow-xl hover:bg-white dark:hover:bg-slate-900 ring-1 ring-slate-200/50 dark:ring-slate-800/50",
                                                      goal.status === 'achieved' && "ring-emerald-500/20 bg-emerald-50/30",
                                                    )}
                                                  >
                                                    <div
                                                      {...provided.dragHandleProps}
                                                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-12 flex items-center justify-center cursor-grab active:cursor-grabbing text-slate-300 hover:text-indigo-500 transition-all rounded-xl opacity-0 group-hover:opacity-100"
                                                    >
                                                      <GripVertical className="h-5 w-5" />
                                                    </div>

                                                    <div className="pl-6 flex flex-col xl:flex-row gap-6 items-start w-full">
                                                      {/* Description */}
                                                      <div className="flex-1 w-full space-y-3">
                                                        <div className="flex items-center gap-2">
                                                          <div className="h-6 w-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center">
                                                            <Target className="h-3.5 w-3.5 text-indigo-600" />
                                                          </div>
                                                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Objective Statement</label>
                                                        </div>
                                                        <div className="relative group/field">
                                                          <Textarea
                                                            value={goal.description}
                                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                                                              updateSprintGoal(goal.id, 'description', e.target.value);
                                                              e.target.style.height = 'auto';
                                                              e.target.style.height = `${e.target.scrollHeight}px`;
                                                            }}
                                                            placeholder="Empower users with seamless biometric authentication..."
                                                            className="min-h-[64px] overflow-hidden text-lg font-bold tracking-tight resize-none bg-transparent border-0 focus-visible:ring-0 p-0 text-slate-900 dark:text-white placeholder:text-slate-300"
                                                          />
                                                          <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 group-focus-within/field:w-1/2 transition-all duration-500" />
                                                        </div>
                                                      </div>

                                                      {/* Status & Remark Middle Layer */}
                                                      <div className="flex flex-col md:flex-row gap-6 w-full xl:w-auto">
                                                        {/* Status */}
                                                        <div className="w-full md:w-56 space-y-3">
                                                          <div className="flex items-center gap-2">
                                                            <div className="h-6 w-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center">
                                                              <Activity className="h-3.5 w-3.5 text-indigo-600" />
                                                            </div>
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Execution Pulse</label>
                                                          </div>
                                                          <Select
                                                            value={goal.status}
                                                            onValueChange={(val: any) => updateSprintGoal(goal.id, 'status', val)}
                                                          >
                                                            <SelectTrigger className={cn(
                                                              "h-14 border-0 shadow-lg transition-all duration-300 rounded-2xl font-bold px-4",
                                                              goal.status === 'draft' ? "bg-slate-100 text-slate-600 shadow-slate-200/50" :
                                                                goal.status === 'proposed' ? "bg-blue-50 text-blue-700 shadow-blue-100" :
                                                                  goal.status === 'on-track' ? "bg-emerald-50 text-emerald-700 shadow-emerald-100" :
                                                                    goal.status === 'at-risk' ? "bg-amber-50 text-amber-700 shadow-amber-100" :
                                                                      goal.status === 'off-track' ? "bg-rose-50 text-rose-700 shadow-rose-100" :
                                                                        goal.status === 'blocked' ? "bg-purple-50 text-purple-700 shadow-purple-100" :
                                                                          goal.status === 'achieved' ? "bg-emerald-600 text-white shadow-emerald-200 ring-2 ring-emerald-400/20" :
                                                                            goal.status === 'partially-achieved' ? "bg-orange-50 text-orange-700 shadow-orange-100" :
                                                                              goal.status === 'missed' ? "bg-rose-600 text-white shadow-rose-200" :
                                                                                "bg-slate-200 text-slate-400 line-through"
                                                            )}>
                                                              <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent className="rounded-2xl border-0 shadow-2xl">
                                                              <SelectGroup>
                                                                <SelectLabel className="text-[10px] font-black uppercase text-slate-400 p-4 tracking-widest">Initiation</SelectLabel>
                                                                <SelectItem value="draft" className="rounded-xl">⚪ Draft Stage</SelectItem>
                                                                <SelectItem value="proposed" className="rounded-xl">🔵 Proposed Objective</SelectItem>
                                                              </SelectGroup>
                                                              <SelectSeparator />
                                                              <SelectGroup>
                                                                <SelectLabel className="text-[10px] font-black uppercase text-slate-400 p-4 tracking-widest">In-Flight Pulse</SelectLabel>
                                                                <SelectItem value="on-track" className="rounded-xl">🟢 Nominal Performance</SelectItem>
                                                                <SelectItem value="at-risk" className="rounded-xl">🟡 Performance Degradation</SelectItem>
                                                                <SelectItem value="off-track" className="rounded-xl">🔴 Critical Deviation</SelectItem>
                                                                <SelectItem value="blocked" className="rounded-xl">🟣 Pipeline Blocked</SelectItem>
                                                              </SelectGroup>
                                                              <SelectSeparator />
                                                              <SelectGroup>
                                                                <SelectLabel className="text-[10px] font-black uppercase text-slate-400 p-4 tracking-widest">Final Resolution</SelectLabel>
                                                                <SelectItem value="achieved" className="rounded-xl">✅ Mission Accomplished</SelectItem>
                                                                <SelectItem value="partially-achieved" className="rounded-xl">🌗 Partial Success</SelectItem>
                                                                <SelectItem value="missed" className="rounded-xl">❌ Mission Failed</SelectItem>
                                                                <SelectItem value="abandoned" className="rounded-xl">🚫 Strategy Pivoted</SelectItem>
                                                              </SelectGroup>
                                                            </SelectContent>
                                                          </Select>
                                                        </div>

                                                        {/* Remark */}
                                                        <div className="flex-1 min-w-[300px] space-y-3">
                                                          <div className="flex items-center gap-2">
                                                            <div className="h-6 w-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center">
                                                              <FileText className="h-3.5 w-3.5 text-indigo-600" />
                                                            </div>
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Deployment Intelligence</label>
                                                          </div>
                                                          <div className="relative group/remark">
                                                            <Textarea
                                                              value={goal.remark}
                                                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                                                                updateSprintGoal(goal.id, 'remark', e.target.value);
                                                                e.target.style.height = 'auto';
                                                                e.target.style.height = `${e.target.scrollHeight}px`;
                                                              }}
                                                              placeholder="Add critical context or status updates..."
                                                              className="min-h-[56px] overflow-hidden text-sm font-medium resize-none bg-slate-50/50 dark:bg-slate-900/50 border-0 focus-visible:ring-2 focus-visible:ring-indigo-500/20 rounded-2xl transition-all shadow-inner"
                                                            />
                                                          </div>
                                                        </div>
                                                      </div>

                                                      {/* Actions */}
                                                      <div className="pt-8 opacity-0 group-hover:opacity-100 transition-opacity self-center">
                                                        <Button
                                                          variant="ghost"
                                                          size="icon"
                                                          onClick={() => confirmDelete(
                                                            "Terminate Objective?",
                                                            "Are you sure you want to remove this strategic goal from the current mission?",
                                                            () => deleteSprintGoal(goal.id)
                                                          )}
                                                          className="h-12 w-12 bg-white hover:bg-rose-50 text-slate-300 hover:text-rose-600 rounded-2xl shadow-sm hover:shadow-lg transition-all border border-slate-100"
                                                        >
                                                          <Trash2 className="h-5 w-5" />
                                                        </Button>
                                                      </div>
                                                    </div>
                                                  </div>
                                                )}
                                              </Draggable>
                                            ))}
                                            {provided.placeholder}
                                          </div>
                                        )}
                                      </Droppable>
                                    </DragDropContext>
                                  )}
                                </CardContent>
                              </Card>
                            </div>
                          )}

                          {activeSection === 'milestones' && (
                            <div className="w-full max-w-none px-4 space-y-6">
                              <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                  <Milestone className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic">Mission Milestones</h2>
                                  <div className="flex items-center gap-2 mt-1">
                                    <p className="text-slate-500 font-medium">Strategic checkpoints & phase-gate orchestration.</p>
                                    <div className="h-1 w-1 rounded-full bg-indigo-300 mx-1" />
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <button className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 transition-colors text-sm font-bold group/help cursor-pointer">
                                          <Info className="h-4 w-4" />
                                          Orchestration Protocol
                                        </button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto rounded-3xl border-0 shadow-2xl bg-white/95 backdrop-blur-xl">
                                        <DialogHeader className="space-y-4">
                                          <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100 mb-2">
                                            <Milestone className="h-7 w-7 text-indigo-600" />
                                          </div>
                                          <div>
                                            <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Milestone Execution Framework</DialogTitle>
                                            <DialogDescription className="text-slate-500 font-medium text-base">
                                              Advanced protocol for multi-phase strategic delivery.
                                            </DialogDescription>
                                          </div>
                                        </DialogHeader>

                                        <Tabs defaultValue="status" className="w-full">
                                          <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="status">Status Legend</TabsTrigger>
                                            <TabsTrigger value="practices">Best Practices</TabsTrigger>
                                          </TabsList>

                                          {/* Status Legend Tab */}
                                          <TabsContent value="status" className="space-y-6 mt-4">
                                            <div className="space-y-4">
                                              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 border border-zinc-100 dark:border-zinc-800">
                                                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-2">
                                                  <Info className="h-4 w-4 text-indigo-500" />
                                                  What is a Milestone?
                                                </h3>
                                                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                                  A Milestone marks a <strong>significant achievement or event</strong> in your project. Unlike Sprints, which are time-based (e.g., "Two Weeks"), Milestones are <strong>outcome-based</strong>. They typically span multiple Sprints and group together specific Phases (like Research, Execution, Review) to track progress toward a major goal, such as a Product Launch, a Marketing Campaign, or a Compliance Audit.
                                                </p>
                                              </div>

                                              {/* Phase 1 */}
                                              <div className="space-y-3">
                                                <h4 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
                                                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 font-bold text-xs dark:bg-zinc-800 dark:text-zinc-400">1</span>
                                                  Phase 1: Planning
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                  <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
                                                    <div className="flex items-center gap-2 font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                                                      <Circle className="h-3 w-3 fill-zinc-200 text-zinc-400" /> Draft
                                                    </div>
                                                    <p className="text-xs text-muted-foreground"><span className="font-semibold">Meaning:</span> Ideas are being formed. Visible to Planners.</p>
                                                    <p className="text-xs text-muted-foreground mt-1"><span className="font-semibold">Action:</span> Define key phases & timeline.</p>
                                                  </div>
                                                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800">
                                                    <div className="flex items-center gap-2 font-bold text-blue-700 dark:text-blue-300 mb-1">
                                                      <Circle className="h-3 w-3 fill-blue-500 text-blue-600" /> Scheduled
                                                    </div>
                                                    <p className="text-xs text-muted-foreground"><span className="font-semibold">Meaning:</span> Confirmed in the plan. Team is ready.</p>
                                                    <p className="text-xs text-muted-foreground mt-1"><span className="font-semibold">Action:</span> Ensure resources are available.</p>
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Phase 2 */}
                                              <div className="space-y-3">
                                                <h4 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
                                                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold text-xs dark:bg-indigo-900 dark:text-indigo-300">2</span>
                                                  Phase 2: Execution (Health Check)
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800">
                                                    <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-300 mb-1">
                                                      <div className="h-3 w-3 rounded-full bg-emerald-500" /> On Track
                                                    </div>
                                                    <p className="text-xs text-muted-foreground"><span className="font-semibold">Meaning:</span> Going to plan. Will hit deadline.</p>
                                                    <p className="text-xs text-muted-foreground mt-1"><span className="font-semibold">Action:</span> Keep up the good work.</p>
                                                  </div>
                                                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100 dark:bg-yellow-900/20 dark:border-yellow-800">
                                                    <div className="flex items-center gap-2 font-bold text-yellow-700 dark:text-yellow-300 mb-1">
                                                      <div className="h-3 w-3 rounded-full bg-yellow-500" /> At Risk
                                                    </div>
                                                    <p className="text-xs text-muted-foreground"><span className="font-semibold">Meaning:</span> Minor delays (e.g., waiting for approvals).</p>
                                                    <p className="text-xs text-muted-foreground mt-1"><span className="font-semibold">Action:</span> Adjust resources to catch up.</p>
                                                  </div>
                                                  <div className="p-3 bg-red-50 rounded-lg border border-red-100 dark:bg-red-900/20 dark:border-red-800">
                                                    <div className="flex items-center gap-2 font-bold text-red-700 dark:text-red-300 mb-1">
                                                      <div className="h-3 w-3 rounded-full bg-red-500" /> Critical / Delayed
                                                    </div>
                                                    <p className="text-xs text-muted-foreground"><span className="font-semibold">Meaning:</span> Major blockers. Deadline will be missed.</p>
                                                    <p className="text-xs text-muted-foreground mt-1"><span className="font-semibold">Action:</span> Notify stakeholders immediately.</p>
                                                  </div>
                                                  <div className="p-3 bg-zinc-100 rounded-lg border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700">
                                                    <div className="flex items-center gap-2 font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                                                      <div className="h-3 w-3 rounded-full bg-zinc-400" /> Paused
                                                    </div>
                                                    <p className="text-xs text-muted-foreground"><span className="font-semibold">Meaning:</span> Work stopped due to other priorities.</p>
                                                    <p className="text-xs text-muted-foreground mt-1"><span className="font-semibold">Action:</span> Move team to active tasks.</p>
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Phase 3 */}
                                              <div className="space-y-3">
                                                <h4 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
                                                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-purple-600 font-bold text-xs dark:bg-purple-900 dark:text-purple-300">3</span>
                                                  Phase 3: Conclusion
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800">
                                                    <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-300 mb-1">
                                                      <CheckCircle2 className="h-4 w-4" /> Achieved
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">Goal met. Project complete.</p>
                                                  </div>
                                                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 dark:bg-purple-900/20 dark:border-purple-800">
                                                    <div className="flex items-center gap-2 font-bold text-purple-700 dark:text-purple-300 mb-1">
                                                      <ArrowUp className="h-4 w-4 rotate-45" /> Deferred
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">Postponed to a future date.</p>
                                                  </div>
                                                  <div className="p-3 bg-red-50 rounded-lg border border-red-100 dark:bg-red-900/20 dark:border-red-800">
                                                    <div className="flex items-center gap-2 font-bold text-red-700 dark:text-red-300 mb-1">
                                                      <LogOut className="h-4 w-4" /> Cancelled
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">Stopped permanently.</p>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </TabsContent>

                                          {/* Best Practices Tab */}
                                          <TabsContent value="practices" className="space-y-6 mt-4">
                                            {/* Rule 1 */}
                                            <div className="space-y-2">
                                              <h4 className="font-bold flex items-center gap-2 text-amber-600 dark:text-amber-500">
                                                <Crown className="h-4 w-4" /> 1. The "Goldilocks" Rule for Granularity
                                              </h4>
                                              <p className="text-sm text-zinc-600 dark:text-zinc-400">Avoid Milestones that are too small (micro-management) or too big (vague dreams).</p>
                                              <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                                                <div className="p-2 rounded bg-red-50 text-red-700 border border-red-100">
                                                  <strong>Too Small:</strong> "Draft one email"<br />(This is a task!)
                                                </div>
                                                <div className="p-2 rounded bg-red-50 text-red-700 border border-red-100">
                                                  <strong>Too Big:</strong> "Become Market Leader"<br />(This is a vision!)
                                                </div>
                                                <div className="p-2 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                  <strong>Just Right:</strong> "Q1 Employee Training"<br />(Specific, valuable, 3-4 months)
                                                </div>
                                              </div>
                                            </div>

                                            <Separator />

                                            {/* Rule 2 */}
                                            <div className="space-y-2">
                                              <h4 className="font-bold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                                                <Milestone className="h-4 w-4" /> 2. The Hierarchy of Value
                                              </h4>
                                              <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 text-sm space-y-2">
                                                <div className="flex gap-2">
                                                  <span className="font-bold w-20">Milestone:</span>
                                                  <span>The "What" & "When" (e.g., Annual Conference Launch)</span>
                                                </div>
                                                <div className="flex gap-2">
                                                  <span className="font-bold w-20">Phases:</span>
                                                  <span>The "How" - Sequential stages (Concept → Planning → Execution → Review)</span>
                                                </div>
                                                <div className="flex gap-2">
                                                  <span className="font-bold w-20">Sprints:</span>
                                                  <span>The "Execution" - Time-boxed cycles (e.g. 2-week blocks) where work happens.</span>
                                                </div>
                                              </div>
                                            </div>

                                            {/* Rule 3 & 4 */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                              <div className="space-y-2">
                                                <h4 className="font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                                                  <CalendarIcon className="h-4 w-4" /> 3. Managing Dates
                                                </h4>
                                                <ul className="text-xs space-y-1.5 text-muted-foreground list-disc pl-4">
                                                  <li><strong>Start Date (Commitment):</strong> The day work *actually* begins.</li>
                                                  <li><strong>Due Date (Target):</strong> Driven by business needs (e.g. "Before Holidays").</li>
                                                  <li><strong>Buffer Strategy:</strong> Leave the last week empty for unexpected issues.</li>
                                                </ul>
                                              </div>
                                              <div className="space-y-2">
                                                <h4 className="font-bold flex items-center gap-2 text-red-600 dark:text-red-400">
                                                  <Activity className="h-4 w-4" /> 4. Early Warning System
                                                </h4>
                                                <div className="text-xs p-2 bg-red-50 dark:bg-red-900/10 text-red-800 dark:text-red-300 rounded border border-red-100 dark:border-red-900/50">
                                                  <strong>The Rule:</strong> If any critical Phase is blocked &gt; 3 days, the Milestone status must flip to <strong>🟡 At Risk</strong>. Do not wait for the deadline!
                                                </div>
                                              </div>
                                            </div>

                                            <Separator />

                                            {/* Rule 5 */}
                                            <div className="space-y-2">
                                              <h4 className="font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-500">
                                                <Target className="h-4 w-4" /> 5. Writing Value-Based Descriptions
                                              </h4>
                                              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">Answer: "If we cancel this, what business value do we lose?"</p>
                                              <div className="grid grid-cols-1 gap-2 text-sm">
                                                <div className="group flex items-start gap-2 p-2 rounded hover:bg-zinc-50 dark:hover:bg-zinc-900">
                                                  <span className="text-red-500 font-bold">Weak:</span>
                                                  <span className="text-zinc-500">"Upgrade office software."</span>
                                                </div>
                                                <div className="group flex items-start gap-2 p-2 rounded bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800">
                                                  <span className="text-emerald-600 font-bold">Strong:</span>
                                                  <span className="text-zinc-700 dark:text-zinc-300">"System Upgrade: Update internal software to fix security gaps and reduce crash rates by 20%."</span>
                                                </div>
                                              </div>
                                            </div>

                                          </TabsContent>
                                        </Tabs>
                                      </DialogContent>
                                    </Dialog>
                                  </div>
                                </div>
                                <Button
                                  onClick={addMilestone}
                                  className="bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl font-bold px-6 h-12 shadow-xl shadow-slate-200 dark:shadow-none group transition-all duration-300"
                                >
                                  <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                                  Initialize Milestone
                                </Button>
                              </div>

                              {milestones.length === 0 ? (
                                <div className="text-center py-24 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] bg-slate-50/50 dark:bg-slate-900/20 flex flex-col items-center gap-6 group">
                                  <div className="h-20 w-20 rounded-3xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500 border border-slate-100 dark:border-slate-800">
                                    <Milestone className="h-10 w-10 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                  </div>
                                  <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">No Strategic Gates</h3>
                                    <p className="text-slate-500 font-medium max-w-sm mx-auto">Establish multi-phase checkpoints to orchestrate complex mission delivery.</p>
                                  </div>
                                  <Button
                                    onClick={addMilestone}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold px-8 shadow-lg shadow-indigo-100 dark:shadow-none"
                                  >
                                    Create First Milestone
                                  </Button>
                                </div>
                              ) : (
                                <DragDropContext onDragEnd={onPhaseDragEnd}>
                                  <div className="space-y-8">
                                    {milestones.map((milestone) => (
                                      <Card key={milestone.id} className="border-0 rounded-[2.5rem] bg-white/40 dark:bg-slate-950/40 backdrop-blur-md shadow-sm border border-slate-200/50 dark:border-slate-800/50 overflow-hidden transition-all duration-300 hover:shadow-xl">
                                        <CardHeader className="pb-8 pt-8 px-8 border-b border-slate-100 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60">
                                          <div className="flex items-start justify-between gap-6">
                                            <div className="space-y-6 flex-1">
                                              {/* Milestone Header Row */}
                                              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                                                <div className="xl:col-span-2 space-y-3">
                                                  <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center">
                                                      <Target className="h-3.5 w-3.5 text-indigo-600" />
                                                    </div>
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Strategic Objective</label>
                                                  </div>
                                                  <Input
                                                    value={milestone.name}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateMilestone(milestone.id, 'name', e.target.value)}
                                                    className="text-xl font-black tracking-tight h-14 bg-transparent border-0 focus-visible:ring-0 p-0 text-slate-900 dark:text-white placeholder:text-slate-300"
                                                    placeholder="OSDK 5.3.0 Release Authorization"
                                                  />
                                                </div>
                                                <div className="space-y-3">
                                                  <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center">
                                                      <CalendarIcon className="h-3.5 w-3.5 text-indigo-600" />
                                                    </div>
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Temporal Window</label>
                                                  </div>
                                                  <div className="flex gap-2">
                                                    <Popover>
                                                      <PopoverTrigger asChild>
                                                        <Button variant="outline" className={cn("w-full justify-start text-left font-bold h-14 border-0 shadow-lg rounded-2xl bg-white dark:bg-slate-900 px-4 transition-all hover:bg-slate-50", !milestone.startDate && "text-slate-400")}>
                                                          {milestone.startDate ? format(milestone.startDate, "MM/dd") : <span>Launch</span>}
                                                        </Button>
                                                      </PopoverTrigger>
                                                      <PopoverContent className="w-auto p-0 border-0 shadow-2xl rounded-3xl overflow-hidden" align="start">
                                                        <Calendar mode="single" selected={milestone.startDate} onSelect={(date: Date | undefined) => updateMilestone(milestone.id, 'startDate', date)} initialFocus />
                                                      </PopoverContent>
                                                    </Popover>
                                                    <Popover>
                                                      <PopoverTrigger asChild>
                                                        <Button variant="outline" className={cn("w-full justify-start text-left font-bold h-14 border-0 shadow-lg rounded-2xl bg-white dark:bg-slate-900 px-4 transition-all hover:bg-slate-50", !milestone.endDate && "text-slate-400")}>
                                                          {milestone.endDate ? format(milestone.endDate, "MM/dd") : <span>Target</span>}
                                                        </Button>
                                                      </PopoverTrigger>
                                                      <PopoverContent className="w-auto p-0 border-0 shadow-2xl rounded-3xl overflow-hidden" align="start">
                                                        <Calendar mode="single" selected={milestone.endDate} onSelect={(date: Date | undefined) => updateMilestone(milestone.id, 'endDate', date)} initialFocus />
                                                      </PopoverContent>
                                                    </Popover>
                                                  </div>
                                                </div>
                                                <div className="space-y-3">
                                                  <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center">
                                                      <Activity className="h-3.5 w-3.5 text-indigo-600" />
                                                    </div>
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Gate Status</label>
                                                  </div>
                                                  <Select
                                                    value={milestone.status}
                                                    onValueChange={(val: 'planning' | 'active' | 'completed' | 'on-hold') => updateMilestone(milestone.id, 'status', val)}
                                                  >
                                                    <SelectTrigger className={cn(
                                                      "h-14 border-0 shadow-lg transition-all duration-300 rounded-2xl font-bold px-4",
                                                      milestone.status === 'planning' ? "bg-slate-100 text-slate-600" :
                                                        milestone.status === 'active' ? "bg-indigo-600 text-white shadow-indigo-200" :
                                                          milestone.status === 'completed' ? "bg-emerald-600 text-white shadow-emerald-200" :
                                                            "bg-rose-600 text-white shadow-rose-200"
                                                    )}>
                                                      <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl border-0 shadow-2xl">
                                                      <SelectItem value="planning" className="rounded-xl">⚪ Strategic Planning</SelectItem>
                                                      <SelectItem value="active" className="rounded-xl">🔵 Active Execution</SelectItem>
                                                      <SelectItem value="completed" className="rounded-xl">✅ Mission Achieved</SelectItem>
                                                      <SelectItem value="on-hold" className="rounded-xl">🟡 Execution Paused</SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                                </div>
                                              </div>

                                              {/* Description (Collapsible) */}
                                              {milestone.isExpanded && (
                                                <div className="space-y-3 animate-in slide-in-from-top-4 duration-500">
                                                  <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center">
                                                      <FileText className="h-3.5 w-3.5 text-indigo-600" />
                                                    </div>
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Deployment Intelligence</label>
                                                  </div>
                                                  <Textarea
                                                    value={milestone.description}
                                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                                                      updateMilestone(milestone.id, 'description', e.target.value);
                                                      e.target.style.height = 'auto';
                                                      e.target.style.height = `${e.target.scrollHeight}px`;
                                                    }}
                                                    placeholder="Define the critical success factors for this milestone..."
                                                    className="min-h-[80px] text-sm font-medium resize-none overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 border-0 focus-visible:ring-2 focus-visible:ring-indigo-500/20 rounded-[1.5rem] p-4 transition-all shadow-inner"
                                                  />
                                                </div>
                                              )}
                                            </div>
                                            <div className="flex flex-col gap-2 pt-8">
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => updateMilestone(milestone.id, 'isExpanded', !milestone.isExpanded)}
                                                className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-900 shadow-sm hover:shadow-lg transition-all text-slate-400 hover:text-indigo-600"
                                              >
                                                <ChevronDown className={cn("h-6 w-6 transition-transform duration-500", milestone.isExpanded ? "rotate-180" : "")} />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-900 shadow-sm hover:shadow-lg transition-all text-slate-400 hover:text-rose-600"
                                                onClick={() => confirmDelete(
                                                  "Terminate Milestone?",
                                                  `Are you sure you want to delete "${milestone.name || 'this milestone'}"? All internal phases will be permanently purged.`,
                                                  () => deleteMilestone(milestone.id)
                                                )}
                                              >
                                                <Trash2 className="h-5 w-5" />
                                              </Button>
                                            </div>
                                          </div>
                                        </CardHeader>

                                        {milestone.isExpanded && (
                                          <>
                                            <Separator />

                                            <CardContent className="bg-slate-50/30 dark:bg-slate-900/10 pt-10 pb-10 px-8">
                                              <div className="space-y-6">
                                                <div className="flex items-center justify-between px-4">
                                                  <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center border border-slate-100 dark:border-slate-800">
                                                      <Activity className="h-5 w-5 text-indigo-600" />
                                                    </div>
                                                    <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Mission Phases</h4>
                                                  </div>
                                                  <Button
                                                    onClick={() => addPhase(milestone.id)}
                                                    size="sm"
                                                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl px-4 border border-indigo-100 dark:bg-indigo-950/40 dark:border-indigo-900/50 dark:text-indigo-400"
                                                  >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add Phase
                                                  </Button>
                                                </div>

                                                <Droppable droppableId={`phases-${milestone.id}`}>
                                                  {(provided) => (
                                                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                                                      {milestone.phases.map((phase, index) => (
                                                        <Draggable key={phase.id} draggableId={phase.id} index={index}>
                                                          {(provided, snapshot) => (
                                                            <div
                                                              ref={provided.innerRef}
                                                              {...provided.draggableProps}
                                                              className={cn(
                                                                "group relative flex flex-col xl:flex-row gap-6 p-6 transition-all duration-300 rounded-[2rem]",
                                                                snapshot.isDragging ? "shadow-2xl ring-4 ring-indigo-500/10 rotate-1 z-50 scale-[1.02] bg-white" : "bg-white/40 dark:bg-slate-950/40 backdrop-blur-sm border border-slate-100 dark:border-slate-800/50 hover:shadow-xl hover:bg-white dark:hover:bg-slate-900",
                                                                phase.status === 'completed' && "border-emerald-200/50 bg-emerald-50/20"
                                                              )}
                                                            >
                                                              <div {...provided.dragHandleProps} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-indigo-500 cursor-grab active:cursor-grabbing">
                                                                <GripVertical className="h-5 w-5" />
                                                              </div>

                                                              {/* Phase Name */}
                                                              <div className="flex-1 min-w-[200px] pl-6">
                                                                <Input
                                                                  value={phase.name}
                                                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePhase(milestone.id, phase.id, 'name', e.target.value)}
                                                                  className="h-10 text-base font-bold tracking-tight bg-transparent border-0 focus-visible:ring-0 p-0 text-slate-900 dark:text-white placeholder:text-slate-300"
                                                                  placeholder="Phase Authorization (e.g. UX Design)"
                                                                />
                                                              </div>

                                                              {/* PIC */}
                                                              <div className="w-full xl:w-56">
                                                                <Select value={phase.pic} onValueChange={(val: any) => updatePhase(milestone.id, phase.id, 'pic', val)}>
                                                                  <SelectTrigger className="h-12 border-0 bg-white/50 dark:bg-slate-900/50 shadow-sm hover:shadow-md rounded-2xl px-4 transition-all">
                                                                    <div className="flex items-center gap-3">
                                                                      <Avatar className="h-6 w-6 ring-2 ring-indigo-100">
                                                                        <AvatarFallback className="bg-indigo-50 text-indigo-600 text-[10px] font-black">{phase.pic ? phase.pic.substring(0, 2).toUpperCase() : '??'}</AvatarFallback>
                                                                      </Avatar>
                                                                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{phase.pic || 'Assign Intelligence'}</span>
                                                                    </div>
                                                                  </SelectTrigger>
                                                                  <SelectContent className="rounded-2xl border-0 shadow-2xl">
                                                                    <SelectItem value="Pranam Sharma">Pranam Sharma</SelectItem>
                                                                    <SelectItem value="Sarah Lee">Sarah Lee</SelectItem>
                                                                    <SelectItem value="Mike Chen">Mike Chen</SelectItem>
                                                                    <SelectSeparator />
                                                                    <SelectItem value="Unassigned">Not Configured</SelectItem>
                                                                  </SelectContent>
                                                                </Select>
                                                              </div>

                                                              {/* Dates */}
                                                              <div className="flex items-center gap-3 w-full xl:w-auto">
                                                                <Popover>
                                                                  <PopoverTrigger asChild>
                                                                    <Button variant="outline" className="h-12 border-0 bg-white/50 dark:bg-slate-900/50 shadow-sm hover:shadow-md rounded-2xl px-4 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-all">
                                                                      {phase.startDate ? format(phase.startDate, "MM/dd") : "Launch"}
                                                                    </Button>
                                                                  </PopoverTrigger>
                                                                  <PopoverContent className="w-auto p-0 border-0 shadow-2xl rounded-3xl" align="start"><Calendar mode="single" selected={phase.startDate} onSelect={(d: any) => updatePhase(milestone.id, phase.id, 'startDate', d)} initialFocus /></PopoverContent>
                                                                </Popover>
                                                                <span className="text-slate-200 font-black">/</span>
                                                                <Popover>
                                                                  <PopoverTrigger asChild>
                                                                    <Button variant="outline" className="h-12 border-0 bg-white/50 dark:bg-slate-900/50 shadow-sm hover:shadow-md rounded-2xl px-4 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-all">
                                                                      {phase.dueDate ? format(phase.dueDate, "MM/dd") : "Due"}
                                                                    </Button>
                                                                  </PopoverTrigger>
                                                                  <PopoverContent className="w-auto p-0 border-0 shadow-2xl rounded-3xl" align="start"><Calendar mode="single" selected={phase.dueDate} onSelect={(d: any) => updatePhase(milestone.id, phase.id, 'dueDate', d)} initialFocus /></PopoverContent>
                                                                </Popover>
                                                              </div>

                                                              {/* Status */}
                                                              <div className="w-full xl:w-40">
                                                                <Select value={phase.status} onValueChange={(val: any) => updatePhase(milestone.id, phase.id, 'status', val)}>
                                                                  <SelectTrigger className={cn("h-12 text-xs border-0 font-black uppercase tracking-widest rounded-2xl justify-center px-0 shadow-sm transition-all",
                                                                    phase.status === 'in-progress' ? "bg-blue-50 text-blue-700 shadow-blue-100 hover:shadow-lg" :
                                                                      phase.status === 'completed' ? "bg-emerald-600 text-white shadow-emerald-200" :
                                                                        phase.status === 'delayed' ? "bg-rose-50 text-rose-700 shadow-rose-100" :
                                                                          "bg-slate-100 text-slate-400"
                                                                  )}>
                                                                    <SelectValue />
                                                                  </SelectTrigger>
                                                                  <SelectContent className="rounded-2xl border-0 shadow-2xl">
                                                                    <SelectItem value="pending">⚪ Pending</SelectItem>
                                                                    <SelectItem value="in-progress">🔵 Active</SelectItem>
                                                                    <SelectItem value="completed">✅ Achieved</SelectItem>
                                                                    <SelectItem value="delayed">🔴 Delayed</SelectItem>
                                                                  </SelectContent>
                                                                </Select>
                                                              </div>

                                                              {/* Remarks */}
                                                              <div className="flex-1 w-full min-w-[200px]">
                                                                <Input
                                                                  value={phase.remarks}
                                                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePhase(milestone.id, phase.id, 'remarks', e.target.value)}
                                                                  placeholder="Telemetry notes..."
                                                                  className="h-12 text-sm font-medium bg-white/30 dark:bg-slate-900/30 border-0 rounded-2xl px-6 focus-visible:ring-2 focus-visible:ring-indigo-500/20 shadow-inner"
                                                                />
                                                              </div>

                                                              <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-900 text-slate-300 hover:text-rose-600 shadow-sm hover:shadow-lg transition-all opacity-0 group-hover:opacity-100"
                                                                onClick={() => confirmDelete(
                                                                  "Purge Phase?",
                                                                  `Are you sure you want to remove "${phase.name || 'this phase'}"?`,
                                                                  () => deletePhase(milestone.id, phase.id)
                                                                )}
                                                              >
                                                                <Trash2 className="h-5 w-5" />
                                                              </Button>
                                                            </div>
                                                          )}
                                                        </Draggable>
                                                      ))}
                                                      {provided.placeholder}

                                                      <Button variant="outline" size="sm" onClick={() => addPhase(milestone.id)} className="w-full border-dashed text-muted-foreground hover:text-primary hover:border-primary/50">
                                                        <Plus className="h-4 w-4 mr-2" /> Add Phase
                                                      </Button>
                                                    </div>
                                                  )}
                                                </Droppable>
                                              </div>
                                            </CardContent>
                                          </>
                                        )}
                                      </Card>
                                    ))}
                                  </div>
                                </DragDropContext>
                              )}
                            </div>
                          )}
                          {activeSection === 'demo' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                              <Card className="border-none shadow-xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                                <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 pb-6 bg-white/50 dark:bg-zinc-900/50">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 flex items-center justify-center border border-violet-500/20 shadow-sm">
                                        <Presentation className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                                      </div>
                                      <div>
                                        <CardTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Sprint Demo</CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">
                                          Plan and track demo topics, presenters, and schedules for the sprint review.
                                        </p>
                                      </div>
                                    </div>
                                    <Button onClick={addDemoItem} size="sm" className="gap-1.5 bg-violet-600 hover:bg-violet-700 text-white shadow-sm">
                                      <Plus className="h-4 w-4" />
                                      Add Demo
                                    </Button>
                                  </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                  {demoItems.map((item, index) => (
                                    <Card key={item.id} className="border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                                      <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
                                      <CardHeader className="pb-4 bg-zinc-50/50 dark:bg-zinc-900/30">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400 font-bold text-sm">
                                              {index + 1}
                                            </div>
                                            <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                                              {item.topic || 'New Demo Topic'}
                                            </CardTitle>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Badge className={cn("border text-xs font-medium", DEMO_STATUS_CONFIG[item.status].bgColor, DEMO_STATUS_CONFIG[item.status].color)}>
                                              {DEMO_STATUS_CONFIG[item.status].label}
                                            </Badge>
                                            {demoItems.length > 1 && (
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                onClick={() => removeDemoItem(item.id)}
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            )}
                                          </div>
                                        </div>
                                      </CardHeader>
                                      <CardContent className="p-4 space-y-4">
                                        {/* Row 1: Topic and Presenter */}
                                        <div className="grid gap-4 md:grid-cols-2">
                                          <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                                              <Presentation className="h-4 w-4 text-zinc-400" />
                                              Demo Topic <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                              placeholder="e.g., User Authentication Feature"
                                              value={item.topic}
                                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDemoItem(item.id, 'topic', e.target.value)}
                                              className="bg-white dark:bg-zinc-900"
                                            />
                                          </div>
                                          <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                                              <Users className="h-4 w-4 text-zinc-400" />
                                              Presenter / PIC <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                              placeholder="e.g., John Doe"
                                              value={item.presenter}
                                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDemoItem(item.id, 'presenter', e.target.value)}
                                              className="bg-white dark:bg-zinc-900"
                                            />
                                          </div>
                                        </div>

                                        {/* Row 2: Date, Time, Duration */}
                                        <div className="grid gap-4 md:grid-cols-3">
                                          <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                                              <CalendarIcon className="h-4 w-4 text-zinc-400" />
                                              Demo Date <span className="text-red-500">*</span>
                                            </label>
                                            <Popover>
                                              <PopoverTrigger asChild>
                                                <Button
                                                  variant="outline"
                                                  className={cn(
                                                    "w-full justify-start text-left font-normal bg-white dark:bg-zinc-900",
                                                    !item.dueDate && "text-muted-foreground"
                                                  )}
                                                >
                                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                                  {item.dueDate ? format(item.dueDate, "PPP") : "Select date"}
                                                </Button>
                                              </PopoverTrigger>
                                              <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                  mode="single"
                                                  selected={item.dueDate}
                                                  onSelect={(date: Date | undefined) => updateDemoItem(item.id, 'dueDate', date)}
                                                  initialFocus
                                                />
                                              </PopoverContent>
                                            </Popover>
                                          </div>
                                          <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                                              <Activity className="h-4 w-4 text-zinc-400" />
                                              Demo Time
                                            </label>
                                            <Input
                                              type="time"
                                              value={item.dueTime}
                                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDemoItem(item.id, 'dueTime', e.target.value)}
                                              className="bg-white dark:bg-zinc-900"
                                            />
                                          </div>
                                          <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                                              <Activity className="h-4 w-4 text-zinc-400" />
                                              Duration
                                            </label>
                                            <Select
                                              value={item.duration}
                                              onValueChange={(value: string) => updateDemoItem(item.id, 'duration', value)}
                                            >
                                              <SelectTrigger className="bg-white dark:bg-zinc-900">
                                                <SelectValue placeholder="Select duration" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="15">15 minutes</SelectItem>
                                                <SelectItem value="30">30 minutes</SelectItem>
                                                <SelectItem value="45">45 minutes</SelectItem>
                                                <SelectItem value="60">60 minutes</SelectItem>
                                                <SelectItem value="90">90 minutes</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                        </div>

                                        {/* Row 3: Status and Attendees */}
                                        <div className="grid gap-4 md:grid-cols-2">
                                          <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Status</label>
                                            <Select
                                              value={item.status}
                                              onValueChange={(value: string) => updateDemoItem(item.id, 'status', value as DemoStatus)}
                                            >
                                              <SelectTrigger className="bg-white dark:bg-zinc-900">
                                                <SelectValue placeholder="Select status" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="scheduled">
                                                  <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                                                    Scheduled
                                                  </div>
                                                </SelectItem>
                                                <SelectItem value="in_progress">
                                                  <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                                                    In Progress
                                                  </div>
                                                </SelectItem>
                                                <SelectItem value="completed">
                                                  <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                                    Completed
                                                  </div>
                                                </SelectItem>
                                                <SelectItem value="cancelled">
                                                  <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-red-500" />
                                                    Cancelled
                                                  </div>
                                                </SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                                              <Users className="h-4 w-4 text-zinc-400" />
                                              Attendees
                                            </label>
                                            <Input
                                              placeholder="e.g., Product Team, Stakeholders"
                                              value={item.attendees}
                                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDemoItem(item.id, 'attendees', e.target.value)}
                                              className="bg-white dark:bg-zinc-900"
                                            />
                                          </div>
                                        </div>

                                        {/* Row 4: Description */}
                                        <div className="space-y-2">
                                          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Demo Description / Notes</label>
                                          <Textarea
                                            placeholder="Describe what will be demonstrated, key features to highlight, any dependencies or prerequisites..."
                                            value={item.description}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateDemoItem(item.id, 'description', e.target.value)}
                                            className="min-h-[80px] bg-white dark:bg-zinc-900"
                                          />
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}

                                  {/* Empty State */}
                                  {demoItems.length === 0 && (
                                    <div className="flex flex-col items-center justify-center p-12 text-center rounded-lg border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
                                      <Presentation className="h-12 w-12 text-zinc-300 dark:text-zinc-600 mb-4" />
                                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">No demos scheduled</h3>
                                      <p className="text-muted-foreground max-w-sm mt-2">
                                        Add demo topics to plan your sprint review presentation.
                                      </p>
                                      <Button onClick={addDemoItem} className="mt-4 gap-1.5">
                                        <Plus className="h-4 w-4" />
                                        Add First Demo
                                      </Button>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            </div>
                          )}

                          {activeSection === 'save' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                              {/* Hero Header with Animated Background */}
                              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 p-8 shadow-2xl">
                                {/* Animated Background Effects */}
                                <div className="absolute inset-0 opacity-20">
                                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                                </div>
                                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-300/20 rounded-full blur-2xl" />

                                <div className="relative z-10">
                                  {/* Header Section */}
                                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                                    <div className="flex items-start gap-4">
                                      <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-xl">
                                        <Save className="h-8 w-8 text-white" />
                                      </div>
                                      <div>
                                        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Sprint Planning Review</h2>
                                        <p className="text-emerald-50 text-sm max-w-md">
                                          Comprehensive overview of your sprint planning data across all sections
                                        </p>
                                      </div>
                                    </div>
                                    {lastSaved && (
                                      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 shadow-lg">
                                        <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                                          <CheckCircle2 className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="text-white">
                                          <div className="text-xs font-medium opacity-90">Last Saved</div>
                                          <div className="text-sm font-bold">{format(lastSaved, 'MMM dd, h:mm a')}</div>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Quick Stats Grid - Glassmorphic Cards */}
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {(() => {
                                      const completedCount = Object.values(checklist).filter(Boolean).length;
                                      const totalCount = CHECKLIST_ITEMS.length;
                                      const percentage = Math.round((completedCount / totalCount) * 100);
                                      return (
                                        <>
                                          {/* Progress Card */}
                                          <div className="relative group">
                                            <div className="absolute inset-0 bg-white/30 dark:bg-white/10 rounded-2xl blur group-hover:blur-md transition-all" />
                                            <div className="relative p-4 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-xl">
                                              <div className="flex items-center justify-between mb-3">
                                                <div className="text-5xl font-black text-white drop-shadow-lg">{percentage}%</div>
                                                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                                                  <CheckCircle2 className="h-6 w-6 text-white" />
                                                </div>
                                              </div>
                                              <div className="text-sm font-bold text-white/90 mb-2">Progress</div>
                                              <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                                                <div className="h-full bg-white transition-all shadow-lg" style={{ width: `${percentage}%` }} />
                                              </div>
                                            </div>
                                          </div>

                                          {/* Duration Card */}
                                          <div className="relative group">
                                            <div className="absolute inset-0 bg-white/30 dark:bg-white/10 rounded-2xl blur group-hover:blur-md transition-all" />
                                            <div className="relative p-4 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-xl">
                                              <div className="flex items-center justify-between mb-3">
                                                <div className="text-5xl font-black text-white drop-shadow-lg">{calculateSprintDays()}</div>
                                                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                                                  <CalendarIcon className="h-6 w-6 text-white" />
                                                </div>
                                              </div>
                                              <div className="text-sm font-bold text-white/90 mb-1">Duration</div>
                                              <div className="text-xs text-white/70 truncate">
                                                {date?.from && date?.to ? `${format(date.from, 'MMM dd')} - ${format(date.to, 'MMM dd')}` : 'No dates set'}
                                              </div>
                                            </div>
                                          </div>

                                          {/* Goals Card */}
                                          <div className="relative group">
                                            <div className="absolute inset-0 bg-white/30 dark:bg-white/10 rounded-2xl blur group-hover:blur-md transition-all" />
                                            <div className="relative p-4 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-xl">
                                              <div className="flex items-center justify-between mb-3">
                                                <div className="text-5xl font-black text-white drop-shadow-lg">{sprintGoals.length}</div>
                                                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                                                  <Target className="h-6 w-6 text-white" />
                                                </div>
                                              </div>
                                              <div className="text-sm font-bold text-white/90 mb-1">Goals</div>
                                              <div className="text-xs text-white/70">Sprint objectives</div>
                                            </div>
                                          </div>

                                          {/* Milestones Card */}
                                          <div className="relative group">
                                            <div className="absolute inset-0 bg-white/30 dark:bg-white/10 rounded-2xl blur group-hover:blur-md transition-all" />
                                            <div className="relative p-4 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-xl">
                                              <div className="flex items-center justify-between mb-3">
                                                <div className="text-5xl font-black text-white drop-shadow-lg">{milestones.length}</div>
                                                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                                                  <Milestone className="h-6 w-6 text-white" />
                                                </div>
                                              </div>
                                              <div className="text-sm font-bold text-white/90 mb-1">Milestones</div>
                                              <div className="text-xs text-white/70">Key deliverables</div>
                                            </div>
                                          </div>
                                        </>
                                      );
                                    })()}
                                  </div>
                                </div>
                              </div>

                              {/* Detailed Review Cards */}
                              <div className="space-y-6">
                                {/* General Information Review */}
                                <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg hover:shadow-xl transition-shadow">
                                  <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                                    <div className="flex items-center gap-3">
                                      <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                        <LayoutDashboard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                      </div>
                                      <CardTitle className="text-base font-semibold">General Information</CardTitle>
                                    </div>
                                  </CardHeader>
                                  <CardContent className="pt-4 space-y-3">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Start Date</div>
                                        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                          {date?.from ? format(date.from, 'MMMM dd, yyyy') : 'Not set'}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">End Date</div>
                                        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                          {date?.to ? format(date.to, 'MMMM dd, yyyy') : 'Not set'}
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                {/* Project Priorities Review */}
                                {projects.length > 0 && (
                                  <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                                    <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                            <FileText className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                          </div>
                                          <CardTitle className="text-base font-semibold">Project Priorities</CardTitle>
                                        </div>
                                        <Badge variant="secondary">{projects.length} projects</Badge>
                                      </div>
                                    </CardHeader>
                                    <CardContent className="pt-4">
                                      <div className="space-y-2">
                                        {projects.map((project, index) => (
                                          <div key={project.id} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                                            <div className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-400">
                                              {index + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                                {project.name || 'Untitled Project'}
                                              </div>
                                              {project.remarks && (
                                                <div className="text-xs text-muted-foreground truncate mt-0.5">{project.remarks}</div>
                                              )}
                                            </div>
                                            <Badge variant={
                                              project.priority === 'critical' ? 'destructive' :
                                                project.priority === 'high' ? 'default' :
                                                  project.priority === 'medium' ? 'secondary' : 'outline'
                                            } className="shrink-0 capitalize">
                                              {project.priority}
                                            </Badge>
                                          </div>
                                        ))}
                                      </div>
                                    </CardContent>
                                  </Card>
                                )}

                                {/* Platform Metrics Review */}
                                {platforms.length > 0 && (
                                  <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                                    <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <div className="h-8 w-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                                            <BarChart3 className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                                          </div>
                                          <CardTitle className="text-base font-semibold">Platform Metrics</CardTitle>
                                        </div>
                                        <Badge variant="secondary">{platforms.length} platforms</Badge>
                                      </div>
                                    </CardHeader>
                                    <CardContent className="pt-4">
                                      <div className="grid gap-4">
                                        {platforms.map((platform) => (
                                          <div key={platform.id} className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                                            <div className="flex items-center justify-between mb-3">
                                              <div className="font-medium text-zinc-900 dark:text-zinc-100">{platform.name || 'Untitled Platform'}</div>
                                              <Badge variant="outline">{platform.members.length} members</Badge>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                              <div>
                                                <div className="text-muted-foreground">Story Points</div>
                                                <div className="font-semibold text-zinc-900 dark:text-zinc-100 mt-1">{platform.totalStoryPoints}</div>
                                              </div>
                                              <div>
                                                <div className="text-muted-foreground">Target Velocity</div>
                                                <div className="font-semibold text-zinc-900 dark:text-zinc-100 mt-1">{platform.targetVelocity}</div>
                                              </div>
                                              <div>
                                                <div className="text-muted-foreground">Improvement</div>
                                                <div className="font-semibold text-zinc-900 dark:text-zinc-100 mt-1">{platform.targetImprovement}%</div>
                                              </div>
                                              <div>
                                                <div className="text-muted-foreground">Holidays</div>
                                                <div className="font-semibold text-zinc-900 dark:text-zinc-100 mt-1">
                                                  {platform.holidays.reduce((sum, h) => sum + h.days, 0)} days
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </CardContent>
                                  </Card>
                                )}

                                {/* Sprint Goals Review */}
                                {sprintGoals.length > 0 && (
                                  <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                                    <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                            <Target className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                          </div>
                                          <CardTitle className="text-base font-semibold">Sprint Goals</CardTitle>
                                        </div>
                                        <Badge variant="secondary">{sprintGoals.length} goals</Badge>
                                      </div>
                                    </CardHeader>
                                    <CardContent className="pt-4">
                                      <div className="space-y-2">
                                        {sprintGoals.map((goal, index) => (
                                          <div key={goal.id} className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                                            <div className="h-7 w-7 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                                              {index + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{goal.description || 'Untitled Goal'}</div>
                                              {goal.remark && (
                                                <div className="text-xs text-muted-foreground mt-1">{goal.remark}</div>
                                              )}
                                            </div>
                                            <Badge variant="outline" className="shrink-0 capitalize text-xs">{goal.status}</Badge>
                                          </div>
                                        ))}
                                      </div>
                                    </CardContent>
                                  </Card>
                                )}

                                {/* Milestones Review */}
                                {milestones.length > 0 && (
                                  <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                                    <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                            <Milestone className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                          </div>
                                          <CardTitle className="text-base font-semibold">Milestones</CardTitle>
                                        </div>
                                        <Badge variant="secondary">{milestones.length} milestones</Badge>
                                      </div>
                                    </CardHeader>
                                    <CardContent className="pt-4">
                                      <div className="space-y-3">
                                        {milestones.map((milestone) => (
                                          <div key={milestone.id} className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                                            <div className="flex items-start justify-between mb-3">
                                              <div className="flex-1">
                                                <div className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">{milestone.name}</div>
                                                {milestone.description && (
                                                  <div className="text-xs text-muted-foreground">{milestone.description}</div>
                                                )}
                                              </div>
                                              <Badge variant="outline" className="shrink-0 ml-3 capitalize">{milestone.status}</Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs">
                                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <CalendarIcon className="h-3 w-3" />
                                                <span>{milestone.startDate ? format(milestone.startDate, 'MMM dd') : 'No start'} - {milestone.endDate ? format(milestone.endDate, 'MMM dd') : 'No end'}</span>
                                              </div>
                                              {milestone.phases.length > 0 && (
                                                <Badge variant="secondary" className="text-xs">{milestone.phases.length} phases</Badge>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </CardContent>
                                  </Card>
                                )}

                                {/* Demo Items Review */}
                                {demoItems.filter(d => d.topic).length > 0 && (
                                  <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                                    <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <div className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                                            <Presentation className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                                          </div>
                                          <CardTitle className="text-base font-semibold">Sprint Demos</CardTitle>
                                        </div>
                                        <Badge variant="secondary">{demoItems.filter(d => d.topic).length} demos</Badge>
                                      </div>
                                    </CardHeader>
                                    <CardContent className="pt-4">
                                      <div className="space-y-2">
                                        {demoItems.filter(d => d.topic).map((demo) => (
                                          <div key={demo.id} className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                                            <div className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                                              <Presentation className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <div className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">{demo.topic}</div>
                                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                  <Users className="h-3 w-3" />
                                                  {demo.presenter || 'No presenter'}
                                                </span>
                                                {demo.dueDate && (
                                                  <span className="flex items-center gap-1">
                                                    <CalendarIcon className="h-3 w-3" />
                                                    {format(demo.dueDate, 'MMM dd')}
                                                    {demo.dueTime && ` at ${demo.dueTime}`}
                                                  </span>
                                                )}
                                                {demo.duration && (
                                                  <span className="flex items-center gap-1">
                                                    <Activity className="h-3 w-3" />
                                                    {demo.duration} min
                                                  </span>
                                                )}
                                              </div>
                                              {demo.description && (
                                                <div className="text-xs text-muted-foreground mt-2 line-clamp-2">{demo.description}</div>
                                              )}
                                            </div>
                                            <Badge className={cn("border text-xs shrink-0", DEMO_STATUS_CONFIG[demo.status].bgColor, DEMO_STATUS_CONFIG[demo.status].color)}>
                                              {DEMO_STATUS_CONFIG[demo.status].label}
                                            </Badge>
                                          </div>
                                        ))}
                                      </div>
                                    </CardContent>
                                  </Card>
                                )}

                                {/* Save Action Section */}
                                <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50">
                                  <CardContent className="p-6">
                                    <div className="flex flex-col items-center text-center gap-4">
                                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                        <Save className="h-8 w-8 text-white" />
                                      </div>
                                      <div>
                                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">Ready to Save?</h3>
                                        <p className="text-sm text-muted-foreground max-w-md">
                                          Review the information above and click save to persist all your planning data to the database.
                                        </p>
                                      </div>
                                      <Button
                                        onClick={handleSaveAll}
                                        disabled={isSaving}
                                        size="lg"
                                        className="w-full max-w-sm gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg shadow-emerald-500/20 h-12 text-base font-semibold"
                                      >
                                        {isSaving ? (
                                          <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Saving to Database...
                                          </>
                                        ) : (
                                          <>
                                            <Save className="h-5 w-5" />
                                            Save All Planning Data
                                          </>
                                        )}
                                      </Button>
                                      <div className="flex items-center gap-6 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                          <span>Auto-saves to cloud</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                          <span>Syncs across devices</span>
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            </div>
                          )}

                          {activeSection === 'security' && (
                            <div className="flex flex-col items-center justify-center p-12 text-center rounded-lg border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
                              <div className="h-12 w-12 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
                                <ShieldCheck className="h-6 w-6 text-zinc-400" />
                              </div>
                              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                Security Audit Content
                              </h3>
                              <p className="text-muted-foreground max-w-sm mt-2">
                                This section is for security audit planning tasks. Form fields will be implemented here.
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div >
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfig.isOpen} onOpenChange={(open: boolean) => !open && setDeleteConfig(prev => ({ ...prev, isOpen: false }))}>
        <AlertDialogContent className="rounded-3xl border-0 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-slate-900">{deleteConfig.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium">
              {deleteConfig.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-2xl font-bold">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold px-8"
              onClick={() => {
                deleteConfig.action();
                setDeleteConfig(prev => ({ ...prev, isOpen: false }));
              }}
            >
              Terminate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog >

    </div >
  );
}
