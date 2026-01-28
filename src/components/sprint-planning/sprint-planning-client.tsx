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
  Menu
} from 'lucide-react';
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

  const updateSprintGoal = (id: string, field: keyof SprintGoal, value: any) => {
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
    <div className="flex h-screen w-full flex-col bg-zinc-50 dark:bg-zinc-950 overflow-hidden font-sans">

      {/* Top Navigation */}
      {/* Top Navigation */}
      <header className="flex-shrink-0 h-14 bg-primary border-b border-primary/10 flex items-center justify-between px-6 z-20 shadow-md">
        <div className="flex items-center gap-2 md:gap-6">
          <div className="xl:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex-1 overflow-y-auto p-4 space-y-6 h-full flex flex-col">
                  <div className="space-y-1">
                    <h3 className="px-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Sections</h3>
                    {PLANNING_SECTIONS.map(section => {
                      const Icon = section.icon;
                      const isCompleted = checklist[section.id];
                      const isActive = activeSection === section.id;

                      return (
                        <Button
                          key={section.id}
                          variant={isActive ? "secondary" : "ghost"}
                          className={cn(
                            "w-full justify-start gap-3 relative overflow-hidden transition-all duration-200",
                            isActive
                              ? "bg-primary/10 text-primary font-semibold shadow-sm"
                              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200",
                            isCompleted && !isActive && "text-emerald-600 dark:text-emerald-500"
                          )}
                          onClick={() => {
                            setActiveSection(section.id as any);
                            // Sheet will auto-close if we don't preventDefault, which is what we want
                          }}
                        >
                          {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary animate-in fade-in slide-in-from-left-1" />}
                          <Icon className={cn("h-4 w-4", isCompleted ? "text-emerald-500" : isActive ? "text-primary" : "text-zinc-400")} />
                          <span className="flex-1 text-left">{section.label}</span>
                          {isCompleted && <CheckCircle2 className="h-4 w-4 text-emerald-500 animate-in zoom-in" />}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
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
              {isPlanningDataLoading ? (
                <SectionLoadingSkeleton />
              ) : (
                <>
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
                                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProject(project.id, 'name', e.target.value)}
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
                                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProject(project.id, 'remarks', e.target.value)}
                                    />
                                  </div>

                                  {/* Delete Button */}
                                  <div className="lg:col-span-1 flex items-end justify-end">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-10 w-10 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => confirmDelete(
                                        "Delete Project Priority?",
                                        `Are you sure you want to remove "${project.name}"? This action cannot be undone.`,
                                        () => deleteProject(project.id)
                                      )}
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

              {activeSection === 'metrics' && (
                <div className="space-y-6">
                  <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <CardHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10 shadow-sm">
                          <BarChart3 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Platform Metrics</CardTitle>
                          <CardDescription>Define metrics and allocations for each platform.</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-8 pt-8">
                      {/* Add Platform Section */}
                      <div className="flex gap-4 items-center">
                        <div className="flex-1">
                          <Input
                            placeholder="e.g. Android Team, iOS Squad..."
                            value={newPlatformName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPlatformName(e.target.value)}
                            className="h-12 text-lg bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 focus:ring-indigo-500/20"
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                              if (e.key === 'Enter') addPlatform();
                            }}
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={addPlatform}
                          className="h-12 px-6 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-md shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
                          disabled={!newPlatformName.trim()}
                        >
                          <Plus className="h-5 w-5 mr-2" />
                          Add Platform
                        </Button>
                      </div>

                      <Separator />

                      {/* Platforms List */}
                      <div className="space-y-5">
                        {platforms.length === 0 ? (
                          <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/20">
                            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                              <LayoutDashboard className="h-8 w-8 opacity-20" />
                            </div>
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">No platforms configured</h3>
                            <p className="opacity-60">Add your first platform above to start planning.</p>
                          </div>
                        ) : (
                          platforms.map((platform, index) => {
                            // Assign a color strip based on index (cycling through priority-like colors)
                            const colorStripClass = [
                              'from-indigo-500 to-indigo-600',
                              'from-violet-500 to-violet-600',
                              'from-purple-500 to-purple-600',
                              'from-fuchsia-500 to-fuchsia-600',
                              'from-pink-500 to-pink-600'
                            ][index % 5];

                            return (
                              <div
                                key={platform.id}
                                className={`
                                  group relative rounded-xl border-2 transition-all duration-300 overflow-hidden bg-white dark:bg-zinc-950
                                  ${platform.isExpanded
                                    ? 'border-indigo-100 dark:border-indigo-900/50 shadow-md'
                                    : 'border-zinc-200 dark:border-zinc-800 hover:border-primary/30'
                                  }
                                `}
                              >
                                {/* Indicator Strip */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${colorStripClass}`} />

                                {/* Platform Header */}
                                <div
                                  className="flex items-center justify-between p-5 pl-6 cursor-pointer select-none"
                                  onClick={() => togglePlatform(platform.id)}
                                >
                                  <div className="flex items-center gap-4">
                                    <h4 className={`font-semibold text-base ${platform.isExpanded ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-700 dark:text-zinc-400'}`}>
                                      {platform.name}
                                    </h4>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={(e: React.MouseEvent) => {
                                        e.stopPropagation();
                                        confirmDelete(
                                          "Delete Platform?",
                                          `Are you sure you want to remove "${platform.name}"? This will also delete all associated metrics and allocations.`,
                                          () => deletePlatform(platform.id)
                                        );
                                      }}
                                      className="h-8 w-8 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <div className={`transform transition-transform duration-200 ${platform.isExpanded ? 'rotate-180' : ''}`}>
                                      <ChevronDown className="h-4 w-4 text-zinc-400" />
                                    </div>
                                  </div>
                                </div>

                                {/* Platform Details Body */}
                                {platform.isExpanded && (
                                  <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-8 animate-in slide-in-from-top-2 duration-200">

                                    {/* Members Section */}
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between">
                                        <h5 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                          <Users className="h-4 w-4 text-primary" />
                                          Team Members
                                        </h5>
                                        <span className="text-xs text-muted-foreground">{platform.members.length} member(s)</span>
                                      </div>

                                      <div className="flex gap-3">
                                        <Input
                                          placeholder="Add team member name (Press Enter)..."
                                          className="h-9 bg-zinc-50 dark:bg-zinc-900"
                                          onKeyDown={(e) => {
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
                                        <div className="flex flex-wrap gap-2">
                                          {platform.members.map((member, idx) => (
                                            <Badge key={idx} variant="secondary" className="px-3 py-1 bg-white border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 flex items-center gap-2 text-sm font-normal">
                                              {member}
                                              <button
                                                onClick={() => confirmDelete(
                                                  "Remove Team Member?",
                                                  `Are you sure you want to remove ${member} from this platform?`,
                                                  () => setPlatforms(prev => prev.map(p => p.id === platform.id ? { ...p, members: p.members.filter((_, i) => i !== idx) } : p))
                                                )}
                                                className="ml-1 hover:text-red-500 transition-colors"
                                              >
                                                <Trash2 className="h-3 w-3" />
                                              </button>
                                            </Badge>
                                          ))}
                                        </div>
                                      )}
                                    </div>

                                    <Separator />

                                    {/* Metrics Inputs - Stat Cards Style */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-zinc-50/50 dark:bg-zinc-900/20 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50">
                                      {/* Total Story Points */}
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                          <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                            <Zap className="h-4 w-4" />
                                          </div>
                                          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Total Points</label>
                                        </div>
                                        <Input
                                          type="number"
                                          className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus:ring-indigo-500/20"
                                          placeholder="0"
                                          value={platform.totalStoryPoints || ''}
                                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlatforms(prev => prev.map(p => p.id === platform.id ? { ...p, totalStoryPoints: Number(e.target.value) } : p))}
                                        />
                                      </div>

                                      {/* Target Improvement */}
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                          <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                            <ArrowUp className="h-4 w-4" />
                                          </div>
                                          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Improvement (%)</label>
                                        </div>
                                        <Input
                                          type="number"
                                          className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus:ring-emerald-500/20"
                                          placeholder="0%"
                                          value={platform.targetImprovement || ''}
                                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlatforms(prev => prev.map(p => p.id === platform.id ? { ...p, targetImprovement: Number(e.target.value) } : p))}
                                        />
                                      </div>

                                      {/* Target Velocity */}
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                          <div className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                                            <Activity className="h-4 w-4" />
                                          </div>
                                          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Target Velocity</label>
                                        </div>
                                        <Input
                                          type="number"
                                          className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus:ring-violet-500/20"
                                          placeholder="0"
                                          value={platform.targetVelocity || ''}
                                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlatforms(prev => prev.map(p => p.id === platform.id ? { ...p, targetVelocity: Number(e.target.value) } : p))}
                                        />
                                      </div>
                                    </div>


                                    <Separator />

                                    {/* Project Allocations */}
                                    <div className="space-y-4">
                                      <div className="flex items-center justify-between">
                                        <h5 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                          <Target className="h-4 w-4 text-primary" />
                                          Story Point Allocation
                                        </h5>
                                        <Button variant="outline" size="sm" onClick={() => {
                                          setPlatforms(prev => prev.map(p => p.id === platform.id ? { ...p, allocations: [...p.allocations, { projectId: projects[0]?.id || '', allocatedPercent: 0 }] } : p));
                                        }}>
                                          <Plus className="h-3 w-3 mr-1" />
                                          Add Allocation
                                        </Button>
                                      </div>

                                      <div className="border border-zinc-200 dark:border-zinc-800 rounded-md overflow-hidden font-sans">
                                        <table className="w-full text-sm">
                                          <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                                            <tr className="border-b border-zinc-200 dark:border-zinc-800">
                                              <th className="text-left font-medium p-3 text-muted-foreground w-1/2">Project Name</th>
                                              <th className="text-left font-medium p-3 text-muted-foreground">Allocation (%)</th>
                                              <th className="text-left font-medium p-3 text-muted-foreground">Points</th>
                                              <th className="w-10"></th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                            {platform.allocations.map((alloc, idx) => {
                                              const project = projects.find(p => p.id === alloc.projectId);
                                              const points = Math.round((platform.totalStoryPoints * alloc.allocatedPercent) / 100);
                                              return (
                                                <tr key={idx} className="bg-white dark:bg-zinc-950">
                                                  <td className="p-3">
                                                    <Select
                                                      value={alloc.projectId}
                                                      onValueChange={(val: string) => {
                                                        setPlatforms(prev => prev.map(p => p.id === platform.id ? {
                                                          ...p,
                                                          allocations: p.allocations.map((a, i) => i === idx ? { ...a, projectId: val } : a)
                                                        } : p));
                                                      }}
                                                    >
                                                      <SelectTrigger className="h-8 border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 bg-transparent">
                                                        <SelectValue placeholder="Select Project" />
                                                      </SelectTrigger>
                                                      <SelectContent>
                                                        {projects.map(p => (
                                                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                        ))}
                                                      </SelectContent>
                                                    </Select>
                                                  </td>
                                                  <td className="p-3">
                                                    <div className="relative w-24">
                                                      <Input
                                                        type="number"
                                                        className="h-8 pr-6 text-right border-zinc-200 dark:border-zinc-800"
                                                        value={alloc.allocatedPercent}
                                                        onChange={(e) => {
                                                          setPlatforms(prev => prev.map(p => p.id === platform.id ? {
                                                            ...p,
                                                            allocations: p.allocations.map((a, i) => i === idx ? { ...a, allocatedPercent: Number(e.target.value) } : a)
                                                          } : p));
                                                        }}
                                                      />
                                                      <span className="absolute right-2 top-1.5 text-xs text-muted-foreground">%</span>
                                                    </div>
                                                  </td>
                                                  <td className="p-3 font-medium">
                                                    {points} pts
                                                  </td>
                                                  <td className="p-3 text-right">
                                                    <button
                                                      onClick={() => confirmDelete(
                                                        "Remove Allocation?",
                                                        `Are you sure you want to remove the allocation for "${project?.name || 'this project'}"?`,
                                                        () => setPlatforms(prev => prev.map(p => p.id === platform.id ? { ...p, allocations: p.allocations.filter((_, i) => i !== idx) } : p))
                                                      )}
                                                      className="text-zinc-400 hover:text-red-500 transition-colors"
                                                    >
                                                      <Trash2 className="h-4 w-4" />
                                                    </button>
                                                  </td>
                                                </tr>
                                              );
                                            })}
                                            {platform.allocations.length === 0 && (
                                              <tr>
                                                <td colSpan={4} className="p-4 text-center text-muted-foreground text-xs italic">
                                                  No project allocations yet. Add an allocation to distribute story points.
                                                </td>
                                              </tr>
                                            )}
                                            <tr className="bg-zinc-50 dark:bg-zinc-900/50 font-semibold text-zinc-900 dark:text-zinc-100 border-t-2 border-zinc-200 dark:border-zinc-800">
                                              <td className="p-3 text-right">Total</td>
                                              <td className="p-3">
                                                {platform.allocations.reduce((sum, a) => sum + a.allocatedPercent, 0)}%
                                              </td>
                                              <td className="p-3">
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
                                    <div className="space-y-4">
                                      <div className="flex items-center justify-between">
                                        <h5 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                          <CalendarIcon className="h-4 w-4 text-primary" />
                                          Regional Holidays
                                        </h5>
                                        <Button variant="outline" size="sm" onClick={() => {
                                          setPlatforms(prev => prev.map(p => p.id === platform.id ? {
                                            ...p,
                                            holidays: [...p.holidays, { id: Date.now().toString(), country: '', days: 0 }]
                                          } : p));
                                        }}>
                                          <Plus className="h-3 w-3 mr-1" />
                                          Add Holiday
                                        </Button>
                                      </div>

                                      {/* Holiday List */}
                                      <div className="space-y-2">
                                        {platform.holidays.map((holiday, idx) => (
                                          <div key={holiday.id} className="flex gap-4 items-center">
                                            <Input
                                              placeholder="Country Name"
                                              className="flex-1 bg-zinc-50 dark:bg-zinc-900"
                                              value={holiday.country}
                                              onChange={(e) => setPlatforms(prev => prev.map(p => p.id === platform.id ? { ...p, holidays: p.holidays.map((h, i) => i === idx ? { ...h, country: e.target.value } : h) } : p))}
                                            />
                                            <div className="relative w-32">
                                              <Input
                                                type="number"
                                                placeholder="Days"
                                                className="pr-12"
                                                value={holiday.days || ''}
                                                onChange={(e) => setPlatforms(prev => prev.map(p => p.id === platform.id ? { ...p, holidays: p.holidays.map((h, i) => i === idx ? { ...h, days: Number(e.target.value) } : h) } : p))}
                                              />
                                              <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">Days</span>
                                            </div>
                                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500" onClick={() => confirmDelete(
                                              "Remove Holiday?",
                                              `Are you sure you want to remove the holiday entry for "${holiday.country || 'New Holiday'}"?`,
                                              () => setPlatforms(prev => prev.map(p => p.id === platform.id ? { ...p, holidays: p.holidays.filter((_, i) => i !== idx) } : p))
                                            )}>
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        ))}
                                        {platform.holidays.length === 0 && (
                                          <div className="text-sm text-muted-foreground italic px-2">No holidays added.</div>
                                        )}
                                      </div>
                                    </div>

                                    <Separator />

                                    {/* Developer Details */}
                                    <div className="space-y-6">
                                      <h5 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                        <Briefcase className="h-4 w-4 text-primary" />
                                        Developer Capacity & Leave
                                      </h5>

                                      <div className="grid grid-cols-1 gap-4">
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
                                            <div key={idx} className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/10">
                                              <div className="font-medium text-sm mb-3">{member}</div>
                                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                                {/* Country Selection */}
                                                {/* Country Selection */}
                                                <div className="space-y-1">
                                                  <label className="text-xs text-muted-foreground">Country (for Holidays)</label>
                                                  <Select value={details.country} onValueChange={(val: string) => updateDetails('country', val)}>
                                                    <SelectTrigger className="h-9 bg-white dark:bg-zinc-950">
                                                      <SelectValue placeholder="Select Country" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      {platform.holidays.filter(h => h.country).map(h => (
                                                        <SelectItem key={h.id} value={h.country}>{h.country} ({h.days} days)</SelectItem>
                                                      ))}
                                                      <SelectItem value="Other">Other / No Holiday</SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                                </div>

                                                {/* Capacity */}
                                                <div className="space-y-1">
                                                  <label className="text-xs text-muted-foreground">Capacity (0-1)</label>
                                                  <Input
                                                    type="number"
                                                    step="0.1"
                                                    max="1"
                                                    min="0"
                                                    className="h-9 bg-white dark:bg-zinc-950"
                                                    value={details.capacity}
                                                    onChange={(e) => updateDetails('capacity', Number(e.target.value))}
                                                  />
                                                </div>

                                                {/* Planned Leave */}
                                                <div className="space-y-1">
                                                  <label className="text-xs text-muted-foreground">Planned Leave (Days)</label>
                                                  <Input
                                                    type="number"
                                                    min="0"
                                                    className="h-9 bg-white dark:bg-zinc-950"
                                                    value={details.plannedLeave}
                                                    onChange={(e) => updateDetails('plannedLeave', Number(e.target.value))}
                                                  />
                                                </div>

                                              </div>
                                            </div>
                                          );
                                        })}
                                        {platform.members.length === 0 && (
                                          <p className="text-sm text-muted-foreground italic">Add members above to configure capacity and leaves.</p>
                                        )}
                                      </div>
                                    </div>

                                    <Separator />

                                    {/* Final Summary Table */}
                                    <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
                                      <h5 className="text-sm font-semibold mb-4">Total Planned Time Off (Man-Days)</h5>
                                      <table className="w-full text-sm">
                                        <thead>
                                          <tr className="border-b border-zinc-200 dark:border-zinc-700 text-left">
                                            <th className="pb-2 font-medium text-muted-foreground">Developer</th>
                                            <th className="pb-2 font-medium text-muted-foreground text-right">Total Off</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {platform.members.map((member, idx) => {
                                            const details = platform.developerLeaves.find(d => d.name === member);
                                            const countryHoliday = platform.holidays.find(h => h.country === details?.country);
                                            const holidayDays = countryHoliday?.days || 0;
                                            const leaveDays = details?.plannedLeave || 0;
                                            const totalOff = holidayDays + leaveDays;

                                            // Explanation string
                                            const explanation = [];
                                            if (leaveDays > 0) explanation.push(`${leaveDays} planned leave`);
                                            if (holidayDays > 0) explanation.push(`${holidayDays} ${details?.country} holiday`);
                                            const explanationStr = explanation.length > 0 ? `(${explanation.join(' + ')})` : '';

                                            return (
                                              <tr key={idx} className="border-b border-dashed border-zinc-200 dark:border-zinc-800 last:border-0">
                                                <td className="py-2">{member}</td>
                                                <td className="py-2 text-right">
                                                  <span className="font-mono font-medium">{totalOff.toFixed(2)}</span>
                                                  {explanationStr && <span className="text-xs text-muted-foreground ml-2">{explanationStr}</span>}
                                                </td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                      </table>
                                    </div>

                                  </div>
                                )}
                              </div>
                            )
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
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 flex items-center justify-center border border-indigo-500/20 shadow-sm">
                            <Target className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <CardTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Sprint Goals</CardTitle>
                            <Dialog>
                              <DialogTrigger asChild>
                                <div className="flex items-center gap-1.5 mt-1 cursor-pointer group">
                                  <p className="text-sm text-muted-foreground group-hover:text-indigo-500 transition-colors">
                                    Need help defining a goal? Read our guide on goals & statuses.
                                  </p>
                                  <Info className="h-4 w-4 text-muted-foreground group-hover:text-indigo-500 transition-colors" />
                                </div>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="text-xl font-bold">Sprint Goal Guide & Status Legend</DialogTitle>
                                  <DialogDescription>
                                    Learn how to define effective goals and track them throughout the sprint.
                                  </DialogDescription>
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
                          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Goal
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-8">
                      {sprintGoals.length === 0 ? (
                        <div className="text-center py-20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/20 flex flex-col items-center gap-4">
                          <div className="h-16 w-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                            <Target className="h-8 w-8 text-zinc-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">No Goals Defined</h3>
                            <p className="text-muted-foreground mt-1 max-w-sm mx-auto">Set clear, measurable goals for this sprint to keep the team focused.</p>
                          </div>
                          <Button variant="outline" onClick={addSprintGoal}>
                            Create First Goal
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
                                          "group relative border rounded-xl p-5 shadow-sm transition-all hover:shadow-md",
                                          snapshot.isDragging && "shadow-xl ring-2 ring-indigo-500/20 rotate-1 z-50 scale-105",
                                          goal.status === 'achieved' ? "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800" :
                                            goal.status === 'on-track' ? "bg-emerald-50/30 dark:bg-emerald-900/5 border-emerald-100/50 dark:border-emerald-800/50" :
                                              goal.status === 'at-risk' ? "bg-yellow-50/50 dark:bg-yellow-900/10 border-yellow-100 dark:border-yellow-800" :
                                                (goal.status === 'off-track' || goal.status === 'missed') ? "bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-800" :
                                                  goal.status === 'blocked' ? "bg-purple-50/50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-800" :
                                                    goal.status === 'proposed' ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800" :
                                                      goal.status === 'partially-achieved' ? "bg-orange-50/50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-800" :
                                                        "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-800"
                                        )}
                                      >
                                        <div
                                          {...provided.dragHandleProps}
                                          className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-grab active:cursor-grabbing text-zinc-300 hover:text-indigo-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 border-r border-transparent hover:border-zinc-100 dark:hover:border-zinc-800 transition-all rounded-l-xl"
                                        >
                                          <GripVertical className="h-5 w-5" />
                                        </div>

                                        <div className="pl-10 flex flex-col md:flex-row gap-4 items-start w-full">
                                          {/* Description */}
                                          <div className="flex-1 w-full space-y-2">
                                            <div className="flex items-center gap-2 h-4">
                                              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Description</label>
                                            </div>
                                            <div className="relative group/field">
                                              <Textarea
                                                value={goal.description}
                                                onChange={(e) => {
                                                  updateSprintGoal(goal.id, 'description', e.target.value);
                                                  e.target.style.height = 'auto';
                                                  e.target.style.height = `${e.target.scrollHeight}px`;
                                                }}
                                                placeholder="Complete User Authentication Overhaul"
                                                className="min-h-[56px] overflow-hidden text-sm font-medium resize-none bg-white/80 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-700 focus:ring-0 focus:border-indigo-500 transition-all shadow-sm rounded-lg"
                                              />
                                              <div className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-green-500 opacity-0 group-focus-within/field:opacity-100 transition-opacity" />
                                            </div>
                                          </div>

                                          {/* Status */}
                                          <div className="w-full md:w-48 space-y-2">
                                            <div className="flex items-center gap-2 h-4">
                                              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</label>
                                            </div>
                                            <Select
                                              value={goal.status}
                                              onValueChange={(val: any) => updateSprintGoal(goal.id, 'status', val)}
                                            >
                                              <SelectTrigger className={cn(
                                                "h-[56px] border-zinc-200 dark:border-zinc-700 font-bold transition-all shadow-sm rounded-lg",
                                                goal.status === 'draft' ? "bg-zinc-100 text-zinc-700 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-600" :
                                                  goal.status === 'proposed' ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700" :
                                                    goal.status === 'on-track' ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700" :
                                                      goal.status === 'at-risk' ? "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-700" :
                                                        goal.status === 'off-track' ? "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700" :
                                                          goal.status === 'blocked' ? "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-700" :
                                                            goal.status === 'achieved' ? "bg-emerald-500 text-white border-emerald-600 dark:bg-emerald-600 dark:text-white dark:border-emerald-500 shadow-md shadow-emerald-500/20" :
                                                              goal.status === 'partially-achieved' ? "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-700" :
                                                                goal.status === 'missed' ? "bg-red-500 text-white border-red-600 dark:bg-red-600 dark:text-white dark:border-red-500 shadow-md shadow-red-500/20" :
                                                                  "bg-zinc-200 text-zinc-500 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-500 dark:border-zinc-700 line-through decoration-zinc-500" // Abandoned
                                              )}>
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectGroup>
                                                  <SelectLabel>Phase 1: Planning</SelectLabel>
                                                  <SelectItem value="draft">⚪ Draft</SelectItem>
                                                  <SelectItem value="proposed">🔵 Proposed</SelectItem>
                                                </SelectGroup>
                                                <SelectSeparator />
                                                <SelectGroup>
                                                  <SelectLabel>Phase 2: Execution</SelectLabel>
                                                  <SelectItem value="on-track">🟢 On Track</SelectItem>
                                                  <SelectItem value="at-risk">🟡 At Risk</SelectItem>
                                                  <SelectItem value="off-track">🔴 Off Track</SelectItem>
                                                  <SelectItem value="blocked">🟣 Blocked</SelectItem>
                                                </SelectGroup>
                                                <SelectSeparator />
                                                <SelectGroup>
                                                  <SelectLabel>Phase 3: Completion</SelectLabel>
                                                  <SelectItem value="achieved">✅ Achieved</SelectItem>
                                                  <SelectItem value="partially-achieved">🌗 Partially Achieved</SelectItem>
                                                  <SelectItem value="missed">❌ Missed</SelectItem>
                                                  <SelectItem value="abandoned">🚫 Abandoned</SelectItem>
                                                </SelectGroup>
                                              </SelectContent>
                                            </Select>
                                          </div>

                                          {/* Remark */}
                                          <div className="flex-1 w-full space-y-2">
                                            <div className="flex items-center gap-2 h-4">
                                              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Remark</label>
                                            </div>
                                            <Textarea
                                              value={goal.remark}
                                              onChange={(e) => {
                                                updateSprintGoal(goal.id, 'remark', e.target.value);
                                                e.target.style.height = 'auto';
                                                e.target.style.height = `${e.target.scrollHeight}px`;
                                              }}
                                              placeholder="Backend API mostly done..."
                                              className="min-h-[56px] overflow-hidden text-sm resize-none bg-white/80 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-700 focus:ring-0 focus:border-indigo-500 transition-all text-zinc-600 shadow-sm rounded-lg"
                                            />
                                          </div>

                                          {/* Delete */}
                                          <div className="pt-6">
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              onClick={() => confirmDelete(
                                                "Delete Sprint Goal?",
                                                "Are you sure you want to remove this goal? This cannot be undone.",
                                                () => deleteSprintGoal(goal.id)
                                              )}
                                              className="h-10 w-10 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition-colors mt-0.5"
                                            >
                                              <Trash2 className="h-4 w-4" />
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
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                        <Milestone className="h-6 w-6 text-primary" />
                        Milestone Planning
                      </h2>
                      <div className="flex items-center gap-1.5 mt-1">
                        <p className="text-zinc-500 dark:text-zinc-400">Define, structure, and track project milestones and their phases.</p>
                        <span className="text-zinc-300">|</span>
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="flex items-center gap-1.5 text-indigo-500 hover:text-indigo-600 transition-colors text-sm font-medium group cursor-pointer dark:text-indigo-400 dark:hover:text-indigo-300">
                              <Info className="h-4 w-4" />
                              Need help defining a milestone?
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto w-full">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2 text-xl">
                                <Milestone className="h-6 w-6 text-indigo-500" />
                                Milestone Guide & Status Legend
                              </DialogTitle>
                              <DialogDescription>
                                Everything you need to know about planning and tracking milestones effectively.
                              </DialogDescription>
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
                    <Button onClick={addMilestone} className="gap-2">
                      <Plus className="h-4 w-4" /> Add Milestone
                    </Button>
                  </div>

                  {milestones.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/20 flex flex-col items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        <Milestone className="h-8 w-8 text-zinc-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">No Milestones Defined</h3>
                        <p className="text-muted-foreground mt-1 max-w-sm mx-auto">Create a milestone to track major project checkpoints and phases.</p>
                      </div>
                      <Button variant="outline" onClick={addMilestone}>
                        Create First Milestone
                      </Button>
                    </div>
                  ) : (
                    <DragDropContext onDragEnd={onPhaseDragEnd}>
                      <div className="space-y-8">
                        {milestones.map((milestone) => (
                          <Card key={milestone.id} className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="pb-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="space-y-4 flex-1">
                                  {/* Milestone Header Row */}
                                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="md:col-span-2 space-y-1.5">
                                      <label className="text-xs font-semibold text-zinc-500 uppercase">Milestone Name</label>
                                      <Input
                                        value={milestone.name}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateMilestone(milestone.id, 'name', e.target.value)}
                                        className="font-semibold text-lg h-10"
                                        placeholder="e.g. OSDK 5.3.0 Release"
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className="text-xs font-semibold text-zinc-500 uppercase">Dates</label>
                                      <div className="flex gap-2">
                                        <Popover>
                                          <PopoverTrigger asChild>
                                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-10 px-3", !milestone.startDate && "text-muted-foreground")}>
                                              <CalendarIcon className="mr-2 h-4 w-4" />
                                              {milestone.startDate ? format(milestone.startDate, "MM/dd") : <span>Start</span>}
                                            </Button>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar mode="single" selected={milestone.startDate} onSelect={(date) => updateMilestone(milestone.id, 'startDate', date)} initialFocus />
                                          </PopoverContent>
                                        </Popover>
                                        <Popover>
                                          <PopoverTrigger asChild>
                                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-10 px-3", !milestone.endDate && "text-muted-foreground")}>
                                              <CalendarIcon className="mr-2 h-4 w-4" />
                                              {milestone.endDate ? format(milestone.endDate, "MM/dd") : <span>End</span>}
                                            </Button>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar mode="single" selected={milestone.endDate} onSelect={(date) => updateMilestone(milestone.id, 'endDate', date)} initialFocus />
                                          </PopoverContent>
                                        </Popover>
                                      </div>
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className="text-xs font-semibold text-zinc-500 uppercase">Status</label>
                                      <Select
                                        value={milestone.status}
                                        onValueChange={(val) => updateMilestone(milestone.id, 'status', val)}
                                      >
                                        <SelectTrigger className="h-10">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="planning">Planning</SelectItem>
                                          <SelectItem value="active">Active</SelectItem>
                                          <SelectItem value="completed">Completed</SelectItem>
                                          <SelectItem value="on-hold">On Hold</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>

                                  {/* Description (Collapsible) */}
                                  {milestone.isExpanded && (
                                    <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                                      <label className="text-xs font-semibold text-zinc-500 uppercase">Description</label>
                                      <Textarea
                                        value={milestone.description}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                                          updateMilestone(milestone.id, 'description', e.target.value);
                                          e.target.style.height = 'auto';
                                          e.target.style.height = `${e.target.scrollHeight}px`;
                                        }}
                                        placeholder="Briefly describe the goals of this milestone..."
                                        className="min-h-[60px] resize-none overflow-hidden"
                                      />
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => updateMilestone(milestone.id, 'isExpanded', !milestone.isExpanded)}
                                    className="text-zinc-400 hover:text-indigo-500"
                                  >
                                    <ChevronDown className={cn("h-5 w-5 transition-transform duration-200", milestone.isExpanded ? "rotate-180" : "")} />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-red-500" onClick={() => confirmDelete(
                                    "Delete Milestone?",
                                    `Are you sure you want to delete "${milestone.name || 'this milestone'}"? All phases within it will also be deleted.`,
                                    () => deleteMilestone(milestone.id)
                                  )}>
                                    <Trash2 className="h-5 w-5" />
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>

                            {milestone.isExpanded && (
                              <>
                                <Separator />

                                <CardContent className="bg-zinc-50/50 dark:bg-zinc-900/20 pt-6">
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-bold text-sm text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                                        <Activity className="h-4 w-4" /> Phases
                                      </h4>
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
                                                    "group relative flex flex-col md:flex-row gap-3 p-3 bg-white dark:bg-zinc-950 border rounded-lg shadow-sm items-start md:items-center",
                                                    snapshot.isDragging && "shadow-lg ring-2 ring-primary/20 bg-primary/5",
                                                    phase.status === 'completed' ? "border-emerald-200 bg-emerald-50/30" : "border-zinc-200 dark:border-zinc-800"
                                                  )}
                                                >
                                                  <div {...provided.dragHandleProps} className="mt-2 md:mt-0 text-zinc-300 hover:text-zinc-600 cursor-grab active:cursor-grabbing">
                                                    <GripVertical className="h-5 w-5" />
                                                  </div>

                                                  {/* Phase Name */}
                                                  <div className="flex-1 min-w-[200px]">
                                                    <Input
                                                      value={phase.name}
                                                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePhase(milestone.id, phase.id, 'name', e.target.value)}
                                                      className="h-9 border-transparent hover:border-zinc-200 focus:border-primary px-2 font-medium"
                                                      placeholder="Phase Name (e.g. Design)"
                                                    />
                                                  </div>

                                                  {/* PIC */}
                                                  <div className="w-full md:w-[180px]">
                                                    <Select value={phase.pic} onValueChange={(val) => updatePhase(milestone.id, phase.id, 'pic', val)}>
                                                      <SelectTrigger className="h-9 border-0 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 px-2">
                                                        <div className="flex items-center gap-2">
                                                          <Avatar className="h-5 w-5">
                                                            <AvatarFallback className="text-[9px]">{phase.pic ? phase.pic.substring(0, 2).toUpperCase() : '??'}</AvatarFallback>
                                                          </Avatar>
                                                          <span className="text-sm truncate">{phase.pic || 'Assign PIC'}</span>
                                                        </div>
                                                      </SelectTrigger>
                                                      <SelectContent>
                                                        {/* Mock Users + Platform Members */}
                                                        <SelectItem value="Pranam Sharma">Pranam Sharma</SelectItem>
                                                        <SelectItem value="Sarah Lee">Sarah Lee</SelectItem>
                                                        <SelectItem value="Mike Chen">Mike Chen</SelectItem>
                                                        <SelectSeparator />
                                                        <SelectItem value="Unassigned">Unassigned</SelectItem>
                                                      </SelectContent>
                                                    </Select>
                                                  </div>

                                                  {/* Dates */}
                                                  <div className="flex items-center gap-2 w-full md:w-auto">
                                                    <Popover>
                                                      <PopoverTrigger asChild>
                                                        <Button variant="ghost" className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground">
                                                          {phase.startDate ? format(phase.startDate, "MM/dd") : "Start"}
                                                        </Button>
                                                      </PopoverTrigger>
                                                      <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={phase.startDate} onSelect={(d) => updatePhase(milestone.id, phase.id, 'startDate', d)} initialFocus /></PopoverContent>
                                                    </Popover>
                                                    <span className="text-zinc-300">/</span>
                                                    <Popover>
                                                      <PopoverTrigger asChild>
                                                        <Button variant="ghost" className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground">
                                                          {phase.dueDate ? format(phase.dueDate, "MM/dd") : "Due"}
                                                        </Button>
                                                      </PopoverTrigger>
                                                      <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={phase.dueDate} onSelect={(d) => updatePhase(milestone.id, phase.id, 'dueDate', d)} initialFocus /></PopoverContent>
                                                    </Popover>
                                                  </div>

                                                  {/* Status */}
                                                  <div className="w-32">
                                                    <Select value={phase.status} onValueChange={(val) => updatePhase(milestone.id, phase.id, 'status', val)}>
                                                      <SelectTrigger className={cn("h-8 text-xs border-0 font-medium rounded-full justify-center px-0",
                                                        phase.status === 'in-progress' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" :
                                                          phase.status === 'completed' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" :
                                                            phase.status === 'delayed' ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" :
                                                              "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                                                      )}>
                                                        <SelectValue />
                                                      </SelectTrigger>
                                                      <SelectContent>
                                                        <SelectItem value="pending">Pending</SelectItem>
                                                        <SelectItem value="in-progress">In Progress</SelectItem>
                                                        <SelectItem value="completed">Completed</SelectItem>
                                                        <SelectItem value="delayed">Delayed</SelectItem>
                                                      </SelectContent>
                                                    </Select>
                                                  </div>

                                                  {/* Remarks */}
                                                  <div className="flex-1 w-full">
                                                    <Input
                                                      value={phase.remarks}
                                                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePhase(milestone.id, phase.id, 'remarks', e.target.value)}
                                                      placeholder="Remarks..."
                                                      className="h-9 text-sm border-transparent hover:border-zinc-200 focus:border-primary bg-transparent"
                                                    />
                                                  </div>

                                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => confirmDelete(
                                                    "Delete Phase?",
                                                    `Are you sure you want to delete "${phase.name || 'this phase'}"?`,
                                                    () => deletePhase(milestone.id, phase.id)
                                                  )}>
                                                    <Trash2 className="h-4 w-4" />
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
        </main>
      </div >
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfig.isOpen} onOpenChange={(open) => !open && setDeleteConfig(prev => ({ ...prev, isOpen: false }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{deleteConfig.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfig.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                deleteConfig.action();
                setDeleteConfig(prev => ({ ...prev, isOpen: false }));
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div >
  );
}
