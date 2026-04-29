'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { SprintBoardClient } from '@/modules/sprint/board/sprint-board-client';
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
  Network,
  LayoutGrid,
  List,
  Globe,
  Pen,
  Kanban,
  Bell,
  Settings,
  ArrowRight,
  Check,
  Edit3,
  X
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { createClient } from '@/auth/supabase/client';
import { Logo } from '@/components/layout/logo';
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
import type { Sprint } from '@/modules/dashboard/create-sprint-dialog';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DateRange } from 'react-day-picker';
import { addDays, format, isWeekend } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/utils/cn';
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
} from '@/backend/actions/sprint-planning.actions';


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

export type RegionalCluster = {
  id: string;
  name: string;
  countryCode: string;
  holidays: Holiday[];
  isExpanded?: boolean;
};

type Platform = {
  id: string;
  name: string;
  members: string[]; // List of developer IDs
  totalStoryPoints: number;
  allocations: Allocation[];
  targetImprovement: number;
  targetVelocity: number;
  regionalClusterId?: string;
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
  { id: 'general', label: 'Core Sprint Parameters', icon: LayoutDashboard, description: 'Define core schedule, active duration, and baseline capacity metrics.' },
  { id: 'team', label: 'Engineering Resources', icon: Users, description: 'Manage team availability, roles, and resource distribution.' },
  { id: 'priority', label: 'Project Priority', icon: FileText, description: 'Prioritize key initiatives for the cycle.' },
  { id: 'board', label: 'Sprint Board', icon: Kanban, description: 'Quick access to active sprint board for real-time adjustments and spike handling.' },

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
      <Card className="border-[#d8d0c8]/40 shadow-sm overflow-hidden">
        <CardHeader className="pb-4 border-b border-[#d8d0c8]/30 bg-[#f2ece4]/50">
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
        <div className="h-1.5 w-full bg-[#f2ece4] bg-[#ece6dc] rounded-full overflow-hidden">
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
                ? "text-zinc-600"
                : "text-zinc-500 hover:bg-[#f2ece4] hover:bg-[#ece6dc]"
            )}
          >
            <div className={cn(
              "h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
              checklist[item.id]
                ? "border-green-500 bg-green-500 text-white border-transparent"
                : "border-[#d8d0c8] border-[#d8d0c8] group-hover:border-[#9a9088]"
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
  const [orgMembers, setOrgMembers] = React.useState<any[]>([]);

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

  // Regional Clusters State
  const [regionalClusters, setRegionalClusters] = React.useState<RegionalCluster[]>([]);

  const addRegionalCluster = () => {
    const newCluster: RegionalCluster = {
      id: Date.now().toString(),
      name: '',
      countryCode: '',
      holidays: []
    };
    setRegionalClusters(prev => [...prev, newCluster]);
  };

  const updateRegionalCluster = (id: string, field: keyof RegionalCluster, value: any) => {
    setRegionalClusters(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const deleteRegionalCluster = (id: string) => {
    setRegionalClusters(prev => prev.filter(c => c.id !== id));
  };

  // Project Priorities State
  const [projects, setProjects] = React.useState<Array<{
    id: string;
    name: string;
    priority: 'critical' | 'high' | 'medium' | 'low' | 'negligible';
    remarks: string;
    allocationPercent?: number;
  }>>([]);

  const addProject = () => {
    const newProject = {
      id: Date.now().toString(),
      name: '',
      priority: 'medium' as const,
      remarks: '',
      allocationPercent: 0
    };
    setProjects(prev => [...prev, newProject]);
  };

  const [expandedProjectId, setExpandedProjectId] = React.useState<string | null>(null);
  const [editingProjectId, setEditingProjectId] = React.useState<string | null>(null);
  const [projectBackup, setProjectBackup] = React.useState<any[] | null>(null);
  const [platformBackup, setPlatformBackup] = React.useState<Platform[] | null>(null);

  const handleStartEditing = (projectId: string) => {
    setProjectBackup(JSON.parse(JSON.stringify(projects)));
    setPlatformBackup(JSON.parse(JSON.stringify(platforms)));
    setEditingProjectId(projectId);
  };

  const handleCancelEditing = () => {
    if (!editingProjectId) return;

    const currentProject = projects.find(p => p.id === editingProjectId);
    const backupProject = projectBackup?.find(p => p.id === editingProjectId);

    // Check for project changes
    const projectChanged = JSON.stringify(currentProject) !== JSON.stringify(backupProject);

    // Check for platform allocation changes
    const currentAllocations = platforms.map(p => ({
      id: p.id,
      alloc: p.allocations?.find(a => a.projectId === editingProjectId)
    }));
    const backupAllocations = platformBackup?.map(p => ({
      id: p.id,
      alloc: p.allocations?.find(a => a.projectId === editingProjectId)
    }));
    const allocationsChanged = JSON.stringify(currentAllocations) !== JSON.stringify(backupAllocations);

    if (projectChanged || allocationsChanged) {
      confirmDelete(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        () => {
          if (projectBackup) setProjects(projectBackup);
          if (platformBackup) setPlatforms(platformBackup);
          setEditingProjectId(null);
          setProjectBackup(null);
          setPlatformBackup(null);
        }
      );
    } else {
      setEditingProjectId(null);
      setProjectBackup(null);
      setPlatformBackup(null);
    }
  };

  const toggleProjectExpand = (id: string) => {
    setExpandedProjectId(prev => prev === id ? null : id);
  };

  // Force Composition State
  const [forceRoles, setForceRoles] = React.useState<any[]>([
    { id: 'po', label: 'Product Owners', icon: Crown, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', desc: '' },
    { id: 'sm', label: 'Scrum Masters', icon: ShieldCheck, color: 'text-[#c2652a]', bg: 'bg-[#fbe8d8]', border: 'border-[#f0a878]/40', desc: '' }
  ]);
  const [editingRoleId, setEditingRoleId] = React.useState<string | null>(null);

  const addForceRole = () => {
    const newRole = {
      id: Date.now().toString(),
      label: '',
      icon: Users,
      color: 'text-[#605850]',
      bg: 'bg-[#f6f0e8]',
      border: 'border-slate-100',
      desc: ''
    };
    setForceRoles(prev => [...prev, newRole]);
    setEditingRoleId(newRole.id);
  };

  const updateForceRole = (id: string, newLabel: string) => {
    setForceRoles(prev => prev.map(r => r.id === id ? { ...r, label: newLabel } : r));
  };

  const deleteForceRole = (id: string) => {
    setForceRoles(prev => prev.filter(r => r.id !== id));
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
      isExpanded: false,
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

  const updateProject = (id: string, field: 'name' | 'priority' | 'remarks' | 'allocationPercent', value: string | number) => {
    setProjects(prev => prev.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const updatePlatformAllocationForProject = (platformId: string, projectId: string, percent: number) => {
    setPlatforms(prev => prev.map(pt => {
      if (pt.id !== platformId) return pt;
      const existingAllocIndex = pt.allocations?.findIndex(a => a.projectId === projectId) ?? -1;
      const validAllocations = pt.allocations || [];

      let newAllocations;
      if (existingAllocIndex >= 0) {
        newAllocations = [...validAllocations];
        newAllocations[existingAllocIndex] = { ...newAllocations[existingAllocIndex], allocatedPercent: percent };
      } else {
        newAllocations = [...validAllocations, { projectId, allocatedPercent: percent }];
      }
      return { ...pt, allocations: newAllocations };
    }));
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

  const resourceContainerRef = React.useRef<HTMLDivElement>(null);
  const { contextSafe: resourceContextSafe } = useGSAP({ scope: resourceContainerRef });

  const [resourceViewMode, setResourceViewMode] = React.useState<'grid' | 'list'>('grid');
  const [isResourceTransitioning, setIsResourceTransitioning] = React.useState(false);

  const handleResourceViewModeChange = resourceContextSafe((newMode: 'grid' | 'list') => {
    if (newMode === resourceViewMode || isResourceTransitioning) return;
    setIsResourceTransitioning(true);

    gsap.to('.resource-gsap-item', {
      opacity: 0,
      y: -10,
      scale: 0.98,
      duration: 0.2,
      stagger: { amount: 0.1 },
      ease: "power2.in",
      onComplete: () => {
        setResourceViewMode(newMode);
        setIsResourceTransitioning(false);
      }
    });
  });

  useGSAP(() => {
    if (isLoading || isPlanningDataLoading || isResourceTransitioning || platforms.length === 0) return;

    gsap.fromTo('.resource-gsap-item',
      { opacity: 0, y: 15, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: { amount: 0.15 }, ease: "back.out(1.2)", clearProps: "all" }
    );
  }, [resourceViewMode, platforms.length, isPlanningDataLoading, isResourceTransitioning]);

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

  // Load org members
  React.useEffect(() => {
    if (!user) return;
    const fetchOrgMembers = async () => {
      try {
        const { getOrganizationMembersAction } = await import('@/backend/actions/teams.actions');
        const members = await getOrganizationMembersAction();
        setOrgMembers(members || []);
      } catch (err) {
        console.error('Failed to load org members', err);
      }
    };
    fetchOrgMembers();
  }, [user]);

  React.useEffect(() => {
    if (isUserLoading) return;
    if (!user) return;

    const fetchSprint = async () => {
      setIsLoading(true);
      try {
        const { getSprintAction } = await import('@/backend/actions/sprints.actions');
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

          // Restore regional clusters
          if (planningData.regional_clusters && planningData.regional_clusters.length > 0) {
            setRegionalClusters(planningData.regional_clusters.map((c: any) => ({
              id: c.id,
              name: c.name,
              countryCode: c.country_code,
              holidays: c.holidays || []
            })));
          }

          // Restore projects
          if (planningData.projects && planningData.projects.length > 0) {
            setProjects(planningData.projects.map((p: any) => ({
              id: p.id,
              name: p.name,
              priority: typeof p.priority === 'number' ? (['critical', 'high', 'medium', 'low', 'negligible'][p.priority] || 'medium') : (p.priority || 'medium'),
              remarks: p.remarks || '',
              allocationPercent: p.allocation || p.allocationPercent || 0,
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
              regionalClusterId: p.regional_cluster_id ?? '',
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
        regional_clusters: regionalClusters.map(c => ({
          id: c.id,
          name: c.name,
          country_code: c.countryCode,
          holidays: c.holidays,
        })),
        team_members: orgMembers,
        projects: projects.map(p => {
          const pIndex = ['critical', 'high', 'medium', 'low', 'negligible'].indexOf(p.priority || 'medium');
          return {
            id: p.id,
            name: p.name,
            code: '',
            priority: pIndex >= 0 ? pIndex : 2,
            allocation: p.allocationPercent || 0,
            color: '',
            icon: '',
          };
        }),
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
          regional_cluster_id: p.regionalClusterId,
          holidays: p.holidays || [],
          developer_leaves: (p.developerLeaves || []).map(d => ({
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
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 bg-white">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-50" />
      </div>
    );
  }

  if (!sprint) return null;

  return (
    <div className="h-screen w-full bg-[#faf5ee] font-sans selection:bg-[#fbe8d8] text-[#3a302a] overflow-hidden">
      {/* Google Fonts - Sahara Theme */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&family=Manrope:wght@200..800&display=swap" rel="stylesheet" />

      {/* Background elements - Sahara Theme */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-[#fbe8d8]/40 to-[#f0a878]/20 blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-[#fce0e0]/30 to-[#fbe8d8]/20 blur-[160px]" />
        <div className="absolute top-[20%] right-[10%] w-[35%] h-[35%] rounded-full bg-[#f0a878]/15 blur-[120px]" />
        <div className="absolute bottom-[20%] left-[10%] w-[45%] h-[45%] rounded-full bg-[#fbe8d8]/20 blur-[140px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="relative z-10 flex flex-col h-full transition-all duration-500">
        {/* Navigation Bar - Sahara Style */}
        <header className="shrink-0 sticky top-0 z-50 w-full border-b border-stone-200/60 bg-[#faf5ee]/90 backdrop-blur-md shadow-sm" style={{ fontFamily: "'Manrope', sans-serif" }}>
          <div className="max-w-[1600px] mx-auto flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-8">
              <div className="text-2xl italic text-orange-900 cursor-pointer active:opacity-70" style={{ fontFamily: "'EB Garamond', serif" }} onClick={() => router.push('/')}>AgileSuit</div>
              <nav className="hidden md:flex items-center gap-6">
                <span className="text-stone-500 hover:text-orange-700 transition-colors cursor-pointer active:opacity-70 text-sm">Dashboard</span>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  className="pl-10 pr-4 py-2 bg-[#f6f0e8] border border-[#d8d0c8] rounded-full text-sm focus:ring-1 focus:ring-[#c2652a] focus:border-[#c2652a] outline-none transition-all w-64"
                  style={{ fontFamily: "'Manrope', sans-serif" }}
                />
              </div>
              <div className="flex items-center gap-3">
                <button className="text-stone-500 hover:text-[#c2652a] transition-colors cursor-pointer active:opacity-70">
                  <Bell className="h-5 w-5" />
                </button>
                <button className="text-stone-500 hover:text-[#c2652a] transition-colors cursor-pointer active:opacity-70">
                  <Settings className="h-5 w-5" />
                </button>
                {user && <UserNav user={user} />}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar relative mx-auto w-full max-w-[1600px] h-full" ref={containerRef}>

          {/* Floating Command Dock - Premium OS-Level Navigation */}
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-700">
            <div className="flex items-center gap-2 p-2 bg-[#3a302a]/95 backdrop-blur-2xl border border-white/10 rounded-[24px] shadow-[0_20px_40px_-15px_rgba(58,48,42,0.3),_0_0_0_1px_rgba(255,255,255,0.05)_inset]">

              <div className="flex items-center gap-1">
                {PLANNING_SECTIONS.filter(s => ['board', 'general', 'team', 'priority', 'metrics', 'goals', 'milestones', 'demo'].includes(s.id)).map(section => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        "relative flex flex-col items-center justify-center w-[60px] h-[60px] rounded-[18px] transition-all duration-300 group",
                        isActive
                          ? "bg-white/10 shadow-[0_4px_10px_rgba(0,0,0,0.05)_inset]"
                          : "hover:bg-white/5 active:scale-95"
                      )}
                    >
                      <Icon className={cn(
                        "h-6 w-6 transition-transform duration-500",
                        isActive ? "text-[#f0a878] scale-110 drop-shadow-sm" : "text-[#fbe8d8]/70 group-hover:-translate-y-1 group-hover:text-[#fbe8d8]"
                      )} />
                      {isActive && (
                        <div className="absolute -bottom-1 h-1 w-1 rounded-full bg-[#c2652a]" />
                      )}

                      {/* Tooltip on Hover */}
                      {!isActive && (
                        <div className="absolute -top-10 scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none px-3 py-1.5 bg-[#3a302a] text-[#fbe8d8] text-[10px] font-black tracking-widest uppercase rounded-lg shadow-xl outline outline-1 outline-white/10">
                          {section.label}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="w-px h-10 bg-white/10 mx-1" />

              <div className="flex items-center gap-1.5 px-2">
                <Button
                  variant="outline"
                  className="rounded-[16px] h-[48px] w-[48px] p-0 border-white/10 bg-transparent hover:bg-white/10 shadow-none transition-all text-[#fbe8d8]/70 hover:text-[#fbe8d8]"
                >
                  <Activity className="h-5 w-5" />
                </Button>
                <Button
                  onClick={handleSaveAll}
                  disabled={isSaving}
                  className="rounded-[16px] h-[48px] px-6 bg-[#c2652a] hover:bg-[#e08850] text-white shadow-[0_8px_16px_rgba(194,101,42,0.3)] transition-all flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest active:scale-95"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Deploy
                </Button>
              </div>

            </div>
          </div>

          {/* Main Detail Workspace */}
          <main className="w-full h-full lg:pt-12 lg:px-20 pb-40 p-6 flex justify-center">
            <div className="w-full max-w-[1200px]">
              {/* Premium Header Section */}
              {activeSection !== 'team' && activeSection !== 'priority' && (
                <div className="mb-8 space-y-4 gsap-stagger-item border-b border-[#d8d0c8]/40 pb-6">
                  <div className="space-y-2">
                    <h1 className="text-[3.5rem] leading-[1.1] text-[#3a302a] tracking-tight italic" style={{ fontFamily: "'EB Garamond', serif" }}>
                      {activeSection === 'general' ? 'Core Sprint Parameters' :
                        activeSection === 'priority' ? 'Project Priority' :
                          PLANNING_SECTIONS.find(s => s.id === activeSection)?.label}
                    </h1>
                    <p className="text-[14px] text-[#605850] max-w-3xl leading-relaxed" style={{ fontFamily: "'Manrope', sans-serif" }}>
                      {PLANNING_SECTIONS.find(s => s.id === activeSection)?.description} Orchestrate your team's collective brilliance in this tactical planning phase.
                    </p>
                  </div>
                </div>
              )}

              <div className="w-full">
                <div className="space-y-10">
                  <div className="gsap-stagger-item">


                    {activeSection !== 'team' && activeSection !== 'priority' && <Separator />}                    {/* Content Switcher */}
                    <div className="min-h-[400px]">
                      {isPlanningDataLoading ? (
                        <SectionLoadingSkeleton />
                      ) : (
                        <>
                          {activeSection === 'general' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                              {/* BENTO GRID: Core Parameters */}
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                {/* Tile 1: Start Date — Sahara Card */}
                                <div className="col-span-1 bg-white p-8 rounded-xl shadow-[0_2px_16px_rgba(58,48,42,0.04)] border border-[#d8d0c8]/40 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_4px_20px_rgba(58,48,42,0.08)]">
                                  <div>
                                    <span className="text-[10px] tracking-[0.2em] font-bold uppercase text-[#c2652a]/70" style={{ fontFamily: "'Manrope', sans-serif" }}>Sprint Start</span>
                                    <h3 className="text-2xl mt-1 mb-6 text-[#3a302a]" style={{ fontFamily: "'EB Garamond', serif" }}>INCEPTION</h3>
                                  </div>
                                  <div className="flex items-end justify-between">
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <button className="text-left group/date cursor-pointer">
                                          <p className="text-3xl text-[#3a302a]" style={{ fontFamily: "'EB Garamond', serif" }}>
                                            {date?.from ? format(date.from, "dd MMM yyyy") : <span className="text-[#9a9088]">Select Date</span>}
                                          </p>
                                          <p className="text-xs text-[#78706a] mt-1" style={{ fontFamily: "'Manrope', sans-serif" }}>
                                            {date?.from ? format(date.from, "EEEE") : ''} {date?.from ? '• 09:00 AM' : ''}
                                          </p>
                                        </button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0 rounded-xl border border-[#d8d0c8]/40 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                                        <Calendar
                                          mode="single"
                                          selected={date?.from}
                                          onSelect={(selected: Date | undefined) => setDate(prev => ({ ...prev, from: selected, to: prev?.to }))}
                                          initialFocus
                                          className="p-4"
                                        />
                                      </PopoverContent>
                                    </Popover>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <button className="p-2 bg-[#f2ece4] text-[#c2652a] rounded-lg hover:bg-[#c2652a]/10 transition-colors">
                                          <CalendarIcon className="h-5 w-5" />
                                        </button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0 rounded-xl border border-[#d8d0c8]/40 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
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
                                </div>

                                {/* Tile 2: End Date — Sahara Card */}
                                <div className="col-span-1 bg-white p-8 rounded-xl shadow-[0_2px_16px_rgba(58,48,42,0.04)] border border-[#d8d0c8]/40 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_4px_20px_rgba(58,48,42,0.08)]">
                                  <div>
                                    <span className="text-[10px] tracking-[0.2em] font-bold uppercase text-[#8c3c3c]/70" style={{ fontFamily: "'Manrope', sans-serif" }}>Sprint Deadline</span>
                                    <h3 className="text-2xl mt-1 mb-6 text-[#3a302a]" style={{ fontFamily: "'EB Garamond', serif" }}>CONCLUSION</h3>
                                  </div>
                                  <div className="flex items-end justify-between">
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <button className="text-left group/date cursor-pointer">
                                          <p className="text-3xl text-[#3a302a]" style={{ fontFamily: "'EB Garamond', serif" }}>
                                            {date?.to ? format(date.to, "dd MMM yyyy") : <span className="text-[#9a9088]">Select Date</span>}
                                          </p>
                                          <p className="text-xs text-[#78706a] mt-1" style={{ fontFamily: "'Manrope', sans-serif" }}>
                                            {date?.to ? format(date.to, "EEEE") : ''} {date?.to ? '• 06:00 PM' : ''}
                                          </p>
                                        </button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0 rounded-xl border border-[#d8d0c8]/40 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                                        <Calendar
                                          mode="single"
                                          selected={date?.to}
                                          onSelect={(selected: Date | undefined) => setDate(prev => ({ ...prev, to: selected, from: prev?.from }))}
                                          initialFocus
                                          className="p-4"
                                        />
                                      </PopoverContent>
                                    </Popover>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <button className="p-2 bg-[#f2ece4] text-[#8c3c3c] rounded-lg hover:bg-[#8c3c3c]/10 transition-colors">
                                          <CalendarIcon className="h-5 w-5" />
                                        </button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0 rounded-xl border border-[#d8d0c8]/40 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
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


                                {/* Regional Impact Dashboard — Sahara Design */}
                                <div className="col-span-1 lg:col-span-2 space-y-6">
                                  <div className="flex justify-between items-end border-b border-[#d8d0c8]/40 pb-4">
                                    <div>
                                      <h2 className="text-2xl leading-tight text-[#3a302a]" style={{ fontFamily: "'EB Garamond', serif" }}>Regional Impact Dashboard</h2>
                                      <p className="text-sm text-[#605850] mt-1" style={{ fontFamily: "'Manrope', sans-serif" }}>Global availability management across delivery hubs.</p>
                                    </div>
                                    <button
                                      onClick={addRegionalCluster}
                                      className="flex items-center gap-2 bg-[#f2ece4] text-[#c2652a] px-5 py-2 rounded-lg font-medium text-xs shadow-sm hover:bg-[#c2652a]/10 transition-all active:scale-95"
                                      style={{ fontFamily: "'Manrope', sans-serif" }}
                                    >
                                      <Plus className="h-4 w-4" />
                                      <span className="uppercase tracking-widest font-bold text-[10px]">Register Region</span>
                                    </button>
                                  </div>

                                  {regionalClusters.length === 0 ? (
                                    <div className="text-center py-20 border-2 border-dashed border-[#d8d0c8]/40 rounded-xl bg-[#f6f0e8]/30">
                                      <div className="h-16 w-16 rounded-full bg-[#ece6dc] flex items-center justify-center mx-auto mb-4">
                                        <Globe className="h-8 w-8 text-[#9a9088]" />
                                      </div>
                                      <h3 className="text-xl text-[#3a302a] mb-2" style={{ fontFamily: "'EB Garamond', serif" }}>Global Coverage Active</h3>
                                      <p className="text-sm text-[#9a9088] max-w-xs mx-auto" style={{ fontFamily: "'Manrope', sans-serif" }}>Global capacity is assumed at 100% across all operational zones.</p>
                                    </div>
                                  ) : (
                                    <div className="space-y-4">
                                      {regionalClusters.map((cluster, cIdx) => {
                                        const totalDaysOff = cluster.holidays.reduce((sum, h) => sum + (h.days || 0), 0);
                                        const sprintDays = calculateSprintDays() || 10;

                                        const impactLevel = totalDaysOff === 0 ? 'NO IMPACT' : totalDaysOff < 3 ? 'LOW IMPACT' : totalDaysOff < 6 ? 'MEDIUM' : 'HIGH IMPACT';
                                        const impactTextColor = totalDaysOff === 0 ? 'text-[#78706a]' : totalDaysOff < 3 ? 'text-[#c2652a]' : totalDaysOff < 6 ? 'text-amber-600' : 'text-[#8c3c3c]';

                                        return (
                                          <div key={cluster.id} className="group bg-[#f6f0e8] rounded-xl border border-[#d8d0c8]/60 overflow-hidden transition-all duration-300">
                                            {/* Card Header */}
                                            <div
                                              onClick={() => setRegionalClusters(prev => prev.map(c => c.id === cluster.id ? { ...c, isExpanded: !c.isExpanded } : c))}
                                              className="p-6 flex items-center justify-between cursor-pointer hover:bg-white/30 transition-colors"
                                            >
                                              <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-[#e08850] flex items-center justify-center text-white shrink-0">
                                                  <Globe className="h-5 w-5" />
                                                </div>
                                                <div onClick={(e) => e.stopPropagation()}>
                                                  <Input
                                                    value={cluster.countryCode}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateRegionalCluster(cluster.id, 'countryCode', e.target.value)}
                                                    placeholder="e.g. India"
                                                    className="h-8 px-0 bg-transparent border-none shadow-none text-xl md:text-xl text-[#3a302a] placeholder:text-[#d8d0c8] font-medium focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none focus-visible:border-none"
                                                    style={{ fontFamily: "'EB Garamond', serif" }}
                                                  />
                                                  <p className="text-xs uppercase tracking-widest text-[#78706a]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                                                    {cluster.name || 'Delivery Hub'}
                                                  </p>
                                                </div>
                                              </div>
                                              <div className="flex items-center gap-12">
                                                <div className="text-right">
                                                  <p className="text-[10px] font-bold text-[#9a9088] uppercase tracking-tighter">Impact Level</p>
                                                  <span className={cn("text-sm font-semibold", impactTextColor)}>{impactLevel}</span>
                                                </div>
                                                <div className="text-right">
                                                  <p className="text-[10px] font-bold text-[#9a9088] uppercase tracking-tighter">Capacity Loss</p>
                                                  <span className="text-sm font-semibold text-[#3a302a]">{totalDaysOff} DAYS</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      deleteRegionalCluster(cluster.id);
                                                    }}
                                                    className="h-8 w-8 rounded-lg text-[#d8d0c8] hover:text-[#8c3c3c] hover:bg-[#8c3c3c]/10 transition-all opacity-0 group-hover:opacity-100"
                                                  >
                                                    <Trash2 className="h-4 w-4" />
                                                  </Button>
                                                  <ChevronDown className={cn("h-5 w-5 text-[#78706a] transition-transform duration-300", cluster.isExpanded && "rotate-180")} />
                                                </div>
                                              </div>
                                            </div>

                                            {/* Expanded Content */}
                                            {cluster.isExpanded && (
                                              <div className="px-8 pb-8 pt-2 animate-in slide-in-from-top-2 duration-300">
                                                <div className="border-t border-[#d8d0c8]/30 pt-6">
                                                  <h5 className="text-sm font-bold uppercase tracking-wider text-[#78706a] mb-4" style={{ fontFamily: "'Manrope', sans-serif" }}>Availability Adjustments</h5>

                                                  {/* Table Header */}
                                                  <div className="flex items-center px-2 pb-2 text-[10px] font-bold text-[#9a9088] uppercase tracking-widest">
                                                    <span className="flex-1">Holiday / Event Name</span>
                                                    <span className="w-32 text-right">Days Off</span>
                                                    <span className="w-10" />
                                                  </div>

                                                  {/* Table Rows */}
                                                  <div className="space-y-2">
                                                    {cluster.holidays.map((h, hIdx) => (
                                                      <div key={hIdx} className="group/holiday bg-white rounded-xl p-5 flex items-center transition-all duration-200 hover:shadow-sm border border-transparent focus-within:border-[#c2652a]/40 focus-within:shadow-[0_4px_24px_rgba(194,101,42,0.12),0_0_0_3px_rgba(194,101,42,0.06)] focus-within:bg-white">
                                                        <div className="flex-1">
                                                          <Input
                                                            value={h.country}
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                              const newHolidays = [...cluster.holidays];
                                                              newHolidays[hIdx].country = e.target.value;
                                                              updateRegionalCluster(cluster.id, 'holidays', newHolidays);
                                                            }}
                                                            placeholder="e.g. Diwali Festival"
                                                            className="h-10 px-0 bg-transparent border-none shadow-none text-xl md:text-xl text-[#3a302a] placeholder:text-[#d8d0c8] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none focus-visible:border-none"
                                                            style={{ fontFamily: "'EB Garamond', serif" }}
                                                          />
                                                        </div>
                                                        <div className="w-36 flex items-center justify-end gap-2">
                                                          <div className="inline-flex items-center bg-[#f2ece4] px-4 py-2 rounded-lg border border-[#d8d0c8]/40 transition-all duration-200 focus-within:bg-[#c2652a]/10 focus-within:border-[#c2652a]/40 focus-within:shadow-[0_2px_8px_rgba(194,101,42,0.1)] cursor-text">
                                                            <Input
                                                              type="number"
                                                              value={h.days || ''}
                                                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                                const newHolidays = [...cluster.holidays];
                                                                newHolidays[hIdx].days = Number(e.target.value);
                                                                updateRegionalCluster(cluster.id, 'holidays', newHolidays);
                                                              }}
                                                              placeholder="0"
                                                              className="w-10 h-8 px-0 bg-transparent border-none shadow-none text-center text-base font-bold text-[#c2652a] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none focus-visible:border-none"
                                                            />
                                                            <span className="text-[11px] text-[#78706a] ml-1.5 uppercase font-bold">Days</span>
                                                          </div>
                                                        </div>
                                                        <div className="w-10 flex justify-end">
                                                          <button
                                                            onClick={() => {
                                                              const newHolidays = cluster.holidays.filter((_, i) => i !== hIdx);
                                                              updateRegionalCluster(cluster.id, 'holidays', newHolidays);
                                                            }}
                                                            className="h-8 w-8 rounded-lg flex items-center justify-center text-[#d8d0c8] hover:text-[#8c3c3c] hover:bg-[#8c3c3c]/10 transition-all opacity-0 group-hover/holiday:opacity-100"
                                                          >
                                                            <Trash2 className="h-4 w-4" />
                                                          </button>
                                                        </div>
                                                      </div>
                                                    ))}
                                                  </div>

                                                  {/* Add Custom Exclusion */}
                                                  <button
                                                    onClick={() => {
                                                      updateRegionalCluster(cluster.id, 'holidays', [...cluster.holidays, { id: Date.now().toString(), country: '', days: 0 }]);
                                                    }}
                                                    className="flex items-center gap-2 text-xs font-bold text-[#c2652a]/60 hover:text-[#c2652a] transition-colors uppercase tracking-widest px-2 pt-4"
                                                    style={{ fontFamily: "'Manrope', sans-serif" }}
                                                  >
                                                    <Plus className="h-4 w-4" />
                                                    Add Custom Exclusion
                                                  </button>

                                                  {/* Summary Stats */}
                                                  <div className="grid grid-cols-2 gap-4 mt-6">
                                                    <div className="bg-white/40 p-4 rounded-lg border border-dashed border-[#d8d0c8] flex flex-col items-center justify-center text-center">
                                                      <p className="text-[10px] font-bold text-[#78706a] uppercase tracking-tighter">Total Days Lost</p>
                                                      <p className="text-2xl text-[#c2652a]" style={{ fontFamily: "'EB Garamond', serif" }}>{String(totalDaysOff).padStart(2, '0')}</p>
                                                    </div>
                                                    <div className="bg-white/40 p-4 rounded-lg border border-dashed border-[#d8d0c8] flex flex-col items-center justify-center text-center">
                                                      <p className="text-[10px] font-bold text-[#78706a] uppercase tracking-tighter">Regional Net Capacity</p>
                                                      <p className="text-2xl text-[#3a302a]" style={{ fontFamily: "'EB Garamond', serif" }}>{sprintDays - totalDaysOff} Days</p>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {activeSection === 'team' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="space-y-2">
                                  <h3 className="text-[3.5rem] leading-[1.1] text-[#3a302a] tracking-tight italic" style={{ fontFamily: "'EB Garamond', serif" }}>Engineering Resources</h3>
                                  <p className="text-[14px] text-[#605850] max-w-3xl leading-relaxed" style={{ fontFamily: "'Manrope', sans-serif" }}>
                                    Strategic orchestration of team availability and resource distribution across core<br />
                                    platform domains. Managing velocity and global talent alignment.
                                  </p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button onClick={addForceRole} className="flex items-center gap-2 bg-[#f2ece4] text-[#c2652a] px-5 py-2.5 rounded-lg font-medium text-xs shadow-sm hover:bg-[#c2652a]/10 transition-all active:scale-95" style={{ fontFamily: "'Manrope', sans-serif" }}>
                                    <Plus className="h-4 w-4" /> <span className="uppercase tracking-widest font-bold text-[10px]">Assign Pivot Role</span>
                                  </button>
                                </div>
                              </div>

                              {/* BENTO GRID: Core Roles */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                {forceRoles.map((role) => (
                                  <div key={role.id} className="bg-white p-8 rounded-xl shadow-[0_2px_16px_rgba(58,48,42,0.04)] border border-[#d8d0c8]/40 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_4px_20px_rgba(58,48,42,0.08)] group/role hover:-translate-y-1">
                                    <div className="flex flex-col gap-6">
                                      <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-5">
                                          <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner transition-transform duration-300 group-hover/role:scale-110", role.bg)}>
                                            <role.icon className={cn("h-6 w-6", role.color)} />
                                          </div>
                                          <div>
                                            {editingRoleId === role.id ? (
                                              <Input
                                                value={role.label}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateForceRole(role.id, e.target.value)}
                                                onBlur={() => setEditingRoleId(null)}
                                                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && setEditingRoleId(null)}
                                                autoFocus
                                                placeholder="Role Designation"
                                                className="h-10 -ml-2 px-2 w-60 bg-transparent border-none shadow-none text-2xl text-[#3a302a] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none focus-visible:border-none relative z-[100]"
                                                style={{ fontFamily: "'EB Garamond', serif" }}
                                              />
                                            ) : (
                                              <h4 onClick={() => setEditingRoleId(role.id)} className="text-2xl text-[#3a302a] hover:text-[#c2652a] transition-colors cursor-pointer block" style={{ fontFamily: "'EB Garamond', serif" }}>
                                                {role.label || 'Unnamed Role'}
                                              </h4>
                                            )}
                                            <div className="text-[10px] tracking-[0.2em] font-bold uppercase text-[#c2652a]/70 mt-1" style={{ fontFamily: "'Manrope', sans-serif" }}>Force Responsibility</div>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                          <button onClick={() => confirmDelete('Delete Role?', `Are you sure you want to remove "${role.label || 'this'}"?`, () => deleteForceRole(role.id))} className="h-8 w-8 rounded-lg flex items-center justify-center text-[#d8d0c8] hover:text-[#8c3c3c] hover:bg-[#8c3c3c]/10 transition-all opacity-0 group-hover/role:opacity-100">
                                            <Trash2 className="h-4 w-4" />
                                          </button>
                                        </div>
                                      </div>

                                      <div className="w-full">
                                        <Select onValueChange={(val: string) => {
                                          setForceRoles(prev => prev.map(r => r.id === role.id ? { ...r, assignedMember: val } : r));
                                        }} value={role.assignedMember || ""}>
                                          <SelectTrigger className="h-14 w-full bg-[#f2ece4] rounded-lg border border-[#d8d0c8]/40 focus:ring-0 group-hover/role:border-[#c2652a]/40 transition-all font-medium text-[#3a302a] text-sm shadow-sm" style={{ fontFamily: "'Manrope', sans-serif" }}>
                                            <SelectValue placeholder="Assign Commander..." />
                                          </SelectTrigger>
                                          <SelectContent className="rounded-xl border shadow-xl p-2 bg-white border-[#d8d0c8]/40 z-50">
                                            <div className="text-[10px] font-black text-[#9a9088] uppercase tracking-widest px-4 py-3">Available Directory</div>
                                            {orgMembers.length > 0 ? orgMembers.map((member: any) => (
                                              <SelectItem key={member.id} value={member.id} textValue={member.display_name || member.email} className="rounded-[1.25rem] py-3 px-4 cursor-pointer hover:bg-[#f6f0e8] transition-colors">
                                                <div className="flex items-center gap-3">
                                                  <Avatar className="h-10 w-10 border border-[#d8d0c8] dark:border-slate-800 shrink-0">
                                                    <AvatarFallback className="bg-[#fbe8d8] text-[#8a4518] text-xs font-bold">
                                                      {(member.display_name || member.email || 'U').substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                  </Avatar>
                                                  <div className="flex flex-col items-start overflow-hidden">
                                                    <div className="flex items-center gap-2">
                                                      <span className="font-bold text-[#3a302a] truncate">{member.display_name || member.email}</span>
                                                      {member.department?.name && (
                                                        <Badge variant="outline" className="text-[9px] uppercase font-black tracking-wider px-2 py-0 border-[#f0a878]/40 text-[#c2652a] h-[18px]">
                                                          {member.department.name}
                                                        </Badge>
                                                      )}
                                                    </div>
                                                    <span className="text-[10px] font-medium text-[#605850] dark:text-[#605850] truncate mt-0.5">{member.email}</span>
                                                  </div>
                                                </div>
                                              </SelectItem>
                                            )) : (
                                              <div className="p-4 text-sm font-medium text-[#605850] text-center">Directory empty</div>
                                            )}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="space-y-6 pt-10">
                                <div className="flex justify-between items-center border-b border-[#d8d0c8]/40 pb-4">
                                  <h4 className="text-3xl text-[#3a302a] tracking-tight" style={{ fontFamily: "'EB Garamond', serif" }}>Platform Matrix</h4>
                                  <div className="flex items-center gap-3">
                                    <div className="flex gap-2 items-center">
                                      <Input
                                        placeholder="New platform name..."
                                        value={newPlatformName}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPlatformName(e.target.value)}
                                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && addPlatform()}
                                        className="h-10 w-48 bg-white border border-[#d8d0c8]/40 rounded-lg text-sm shadow-sm focus-visible:ring-0 focus-visible:border-[#c2652a]/40 placeholder:text-[#d8d0c8] transition-all"
                                        style={{ fontFamily: "'Manrope', sans-serif" }}
                                      />
                                      <button
                                        onClick={addPlatform}
                                        disabled={!newPlatformName.trim()}
                                        className="flex items-center gap-2 bg-[#f2ece4] text-[#c2652a] px-4 py-2 rounded-lg font-medium text-xs shadow-sm hover:bg-[#c2652a]/10 transition-all active:scale-95 h-10 border-none disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ fontFamily: "'Manrope', sans-serif" }}
                                      >
                                        <Plus className="h-4 w-4" /> <span className="uppercase tracking-widest font-bold text-[10px]">Add</span>
                                      </button>
                                    </div>
                                    {platforms.length > 0 && (
                                      <div className="text-xs font-bold text-[#9a9088] uppercase tracking-widest ml-2" style={{ fontFamily: "'Manrope', sans-serif" }}>{platforms.length} Active</div>
                                    )}
                                  </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                  {platforms.map((platform) => (
                                    <div key={platform.id} className={cn(
                                      "bg-white rounded-xl overflow-hidden group/acc transition-all duration-300 border border-[#d8d0c8]/40",
                                      platform.isExpanded
                                        ? "shadow-[0_4px_24px_rgba(194,101,42,0.12),0_0_0_3px_rgba(194,101,42,0.06)] border-[#c2652a]/40"
                                        : "shadow-[0_2px_8px_rgba(58,48,42,0.02)] hover:shadow-[0_4px_16px_rgba(58,48,42,0.04)]"
                                    )}>

                                      {/* ACCORDION ROW HEADER */}
                                      <div
                                        onClick={() => setPlatforms(prev => prev.map(p => p.id === platform.id ? { ...p, isExpanded: !p.isExpanded } : p))}
                                        className={cn(
                                          "flex items-center justify-between p-5 cursor-pointer transition-colors select-none relative overflow-hidden",
                                          platform.isExpanded ? "bg-[#f2ece4]/50" : "hover:bg-[#f2ece4]/30"
                                        )}
                                      >
                                        <div className="flex items-center gap-4 w-1/4 relative z-10">
                                          <div className={cn(
                                            "h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border group-hover/acc:scale-105 transition-all duration-300",
                                            platform.isExpanded
                                              ? "bg-white border-[#d8d0c8]/40 text-[#c2652a] shadow-sm"
                                              : "bg-[#f2ece4] border-transparent text-[#605850]"
                                          )}>
                                            <LayoutDashboard className="h-6 w-6" />
                                          </div>
                                          <div className="flex flex-col">
                                            <h4 className="text-xl md:text-2xl text-[#3a302a]" style={{ fontFamily: "'EB Garamond', serif" }}>{platform.name}</h4>
                                            <span className="text-[10px] uppercase tracking-widest text-[#78706a] mt-0.5" style={{ fontFamily: "'Manrope', sans-serif" }}>Domain</span>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-6 w-1/2 justify-center px-4 relative z-10">
                                          <div className="flex items-center gap-2">
                                            <span className="text-[10px] tracking-[0.1em] font-bold uppercase text-[#9a9088]" style={{ fontFamily: "'Manrope', sans-serif" }}>Total SP</span>
                                            <Input
                                              type="number"
                                              className="h-8 w-14 bg-[#f2ece4] hover:bg-[#e8e1d7] border border-transparent focus-visible:bg-white focus-visible:border-[#c2652a]/40 rounded-lg text-lg shadow-none focus-visible:ring-0 px-1 text-center text-[#3a302a] transition-all"
                                              style={{ fontFamily: "'EB Garamond', serif" }}
                                              value={platform.totalStoryPoints || ''}
                                              onClick={(e) => e.stopPropagation()}
                                              onChange={(e) => setPlatforms(prev => prev.map(p => p.id === platform.id ? { ...p, totalStoryPoints: Number(e.target.value) } : p))}
                                              placeholder="0"
                                            />
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="text-[10px] tracking-[0.1em] font-bold uppercase text-[#9a9088]" style={{ fontFamily: "'Manrope', sans-serif" }}>Alpha %</span>
                                            <Input
                                              type="number"
                                              className="h-8 w-14 bg-[#f2ece4] hover:bg-[#e8e1d7] border border-transparent focus-visible:bg-white focus-visible:border-[#c2652a]/40 rounded-lg text-lg shadow-none focus-visible:ring-0 px-1 text-center text-[#c2652a] transition-all"
                                              style={{ fontFamily: "'EB Garamond', serif" }}
                                              value={platform.targetImprovement || ''}
                                              onClick={(e) => e.stopPropagation()}
                                              onChange={(e) => setPlatforms(prev => prev.map(p => p.id === platform.id ? { ...p, targetImprovement: Number(e.target.value) } : p))}
                                              placeholder="0"
                                            />
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="text-[10px] tracking-[0.1em] font-bold uppercase text-[#9a9088]" style={{ fontFamily: "'Manrope', sans-serif" }}>SP/Day</span>
                                            <Input
                                              type="number"
                                              className="h-8 w-14 bg-[#f2ece4] hover:bg-[#e8e1d7] border border-transparent focus-visible:bg-white focus-visible:border-[#c2652a]/40 rounded-lg text-lg shadow-none focus-visible:ring-0 px-1 text-center text-[#c2652a] transition-all"
                                              style={{ fontFamily: "'EB Garamond', serif" }}
                                              value={platform.targetVelocity || ''}
                                              onClick={(e) => e.stopPropagation()}
                                              onChange={(e) => setPlatforms(prev => prev.map(p => p.id === platform.id ? { ...p, targetVelocity: Number(e.target.value) } : p))}
                                              placeholder="0"
                                            />
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-3 w-1/4 justify-end relative z-10">
                                          <div className="flex items-center justify-center h-8 px-3 rounded-lg bg-[#f2ece4] border border-[#d8d0c8]/40 shadow-sm transition-colors">
                                            <span className="text-[10px] font-bold uppercase tracking-widest leading-none mt-px text-[#c2652a]" style={{ fontFamily: "'Manrope', sans-serif" }}>{platform.members.length} Devs</span>
                                          </div>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              confirmDelete('Delete Platform?', `Are you sure you want to remove "${platform.name}"?`, () => deletePlatform(platform.id))
                                            }}
                                            className="h-8 w-8 rounded-lg flex items-center justify-center text-[#d8d0c8] hover:text-[#8c3c3c] hover:bg-[#8c3c3c]/10 transition-all opacity-0 group-hover/acc:opacity-100"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </button>
                                          <div className={cn("transition-transform duration-300", platform.isExpanded ? "rotate-180 text-[#3a302a]" : "text-[#d8d0c8] group-hover/acc:text-[#9a9088]")}>
                                            <ChevronDown className="h-5 w-5" />
                                          </div>
                                        </div>
                                      </div>

                                      {/* ACCORDION BODY (EXPANDED) */}
                                      {platform.isExpanded && (
                                        <div className="border-t border-[#d8d0c8]/40 bg-[#f6f0e8]/50  p-6 animate-in slide-in-from-top-2 fade-in duration-300 flex flex-col gap-6">

                                          {/* Inject Button */}
                                          <div className="w-full relative group/member">
                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                <button className="w-full text-left h-12 pl-12 pr-6 bg-white/80  border-[2px] border-dashed border-[#d8d0c8]/60 dark:border-slate-800 rounded-xl text-xs font-black text-[#9a9088] hover:text-[#c2652a] hover:border-[#f0a878]  dark:hover:text-white focus:outline-none focus:ring-0 transition-all uppercase tracking-widest shadow-sm block relative overflow-hidden">
                                                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a9088] group-hover/member:text-[#c2652a] transition-colors">
                                                    <Plus className="h-4 w-4" />
                                                  </div>
                                                  Inject Resource Node
                                                </button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent align="start" className="w-[300px] rounded-[1.5rem] border-0 shadow-2xl p-2 z-50 bg-white/95 backdrop-blur-2xl border-white/20  border">
                                                <div className="text-[10px] font-black text-[#9a9088] uppercase tracking-widest px-4 py-3">Available Org Members</div>
                                                <div className="max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                                                  {orgMembers.length > 0 ? orgMembers.map((member: any) => (
                                                    <DropdownMenuItem
                                                      key={member.id}
                                                      className="rounded-[1.25rem] py-3 px-3 cursor-pointer hover:bg-[#f6f0e8] transition-colors flex items-center gap-4"
                                                      onClick={() => {
                                                        const val = member.id;
                                                        if (val && !platform.members.includes(val)) {
                                                          setPlatforms(prev => prev.map(p => p.id === platform.id ? { ...p, members: [...p.members, val] } : p));
                                                        }
                                                      }}
                                                    >
                                                      <Avatar className="h-10 w-10 border border-[#d8d0c8] dark:border-slate-800 shrink-0 shadow-sm">
                                                        <AvatarFallback className="bg-[#fbe8d8] text-[#8a4518] font-bold">
                                                          {(member.display_name || member.email || 'U').substring(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                      </Avatar>
                                                      <div className="flex flex-col overflow-hidden">
                                                        <span className="font-bold text-[#3a302a] truncate text-sm">{member.display_name || member.email}</span>
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                          <span className="text-[10px] font-medium text-[#605850] truncate">{member.email}</span>
                                                          {member.department?.name && (
                                                            <>
                                                              <span className="text-[8px] text-[#d8d0c8] dark:text-[#3a302a]">•</span>
                                                              <span className="text-[9px] text-[#c2652a]/80 font-black uppercase tracking-widest">{member.department.name}</span>
                                                            </>
                                                          )}
                                                        </div>
                                                      </div>
                                                    </DropdownMenuItem>
                                                  )) : (
                                                    <div className="p-4 text-sm font-medium text-[#605850] text-center">No unassigned members</div>
                                                  )}
                                                </div>
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                          </div>

                                          {/* Deployment List */}
                                          {platform.members.length > 0 && (
                                            <div className="space-y-2">
                                              {/* Header */}
                                              <div className="grid grid-cols-[1fr_90px_80px_80px_32px] gap-2 px-3 pb-2 border-b border-[#d8d0c8]/40">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-[#9a9088]" style={{ fontFamily: "'Manrope', sans-serif" }}>Node Identity</label>
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-[#9a9088] text-center" style={{ fontFamily: "'Manrope', sans-serif" }}>Geo</label>
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-[#9a9088] text-center" style={{ fontFamily: "'Manrope', sans-serif" }}>Alloc %</label>
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-[#9a9088] text-center" style={{ fontFamily: "'Manrope', sans-serif" }}>Out (D)</label>
                                                <div />
                                              </div>

                                              <div className="space-y-2">
                                                {platform.members.map((member, idx) => {
                                                  const memberObj = orgMembers.find((m: any) => m.id === member || m.display_name === member || m.email === member);
                                                  const displayName = memberObj ? (memberObj.display_name || memberObj.email) : member;
                                                  const initials = displayName
                                                    .trim()
                                                    .split(/\s+/)
                                                    .map((n: string) => n[0])
                                                    .filter((_: string, i: number, arr: string[]) => i === 0 || i === arr.length - 1)
                                                    .join('')
                                                    .substring(0, 2)
                                                    .toUpperCase();

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
                                                    <div key={idx} className="group/row p-2 rounded-xl bg-white border border-[#d8d0c8]/40 shadow-sm focus-within:shadow-[0_4px_24px_rgba(194,101,42,0.12),0_0_0_3px_rgba(194,101,42,0.06)] focus-within:border-[#c2652a]/40 transition-all grid grid-cols-[1fr_90px_80px_80px_32px] gap-2 items-center">
                                                      <div className="flex items-center gap-3 min-w-0 pr-1">
                                                        <Avatar className="h-8 w-8 rounded-lg border border-[#d8d0c8]/40 shrink-0">
                                                          {memberObj?.id && <AvatarImage src={`https://avatar.vercel.sh/${memberObj.id}?text=${initials}`} />}
                                                          <AvatarFallback className="bg-[#f2ece4] text-[#c2652a] font-bold text-[10px]" style={{ fontFamily: "'Manrope', sans-serif" }}>{initials}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col min-w-0">
                                                          <span className="text-sm font-medium text-[#3a302a] leading-none truncate mb-0.5" style={{ fontFamily: "'Manrope', sans-serif" }}>{displayName}</span>
                                                          <span className="text-[10px] text-[#9a9088] uppercase tracking-widest truncate leading-none" style={{ fontFamily: "'Manrope', sans-serif" }}>{memberObj?.department?.name || 'Engineer'}</span>
                                                        </div>
                                                      </div>

                                                      <div className="w-[90px]">
                                                        <Select value={details.country} onValueChange={(val: string) => updateDetails('country', val)}>
                                                          <SelectTrigger className="h-9 bg-[#f2ece4] rounded-lg border-none focus:ring-0 text-xs font-medium text-[#3a302a] px-3 shadow-none group-focus-within/row:bg-white transition-all" style={{ fontFamily: "'Manrope', sans-serif" }}>
                                                            {details.country ? (regionalClusters.find(rc => rc.id === details.country)?.countryCode || details.country) : "REG"}
                                                          </SelectTrigger>
                                                          <SelectContent className="rounded-xl border border-[#d8d0c8]/40 shadow-xl bg-white p-1">
                                                            {regionalClusters.map(rc => {
                                                              const holidaySummary = rc.holidays.length > 0 ? `${rc.holidays.length}H` : 'None';
                                                              return (
                                                                <SelectItem key={rc.id} value={rc.id} className="rounded-lg text-xs py-1.5 pl-8 pr-3 cursor-pointer hover:bg-[#f2ece4] focus:bg-[#f2ece4] transition-colors">
                                                                  <div className="flex items-center justify-between gap-4 w-[120px]">
                                                                    <span className="font-medium text-[#3a302a]" style={{ fontFamily: "'Manrope', sans-serif" }}>{rc.countryCode || 'Node'}</span>
                                                                    <span className="text-[10px] text-[#9a9088] font-bold">{holidaySummary}</span>
                                                                  </div>
                                                                </SelectItem>
                                                              );
                                                            })}
                                                            <SelectItem value="Other" className="rounded-lg text-xs font-medium text-[#9a9088] py-1.5 pl-8 pr-3 cursor-pointer hover:bg-[#f2ece4] focus:bg-[#f2ece4] transition-colors" style={{ fontFamily: "'Manrope', sans-serif" }}>OTHER</SelectItem>
                                                          </SelectContent>
                                                        </Select>
                                                      </div>

                                                      <div className="relative w-full">
                                                        <Input
                                                          type="number"
                                                          className="h-9 bg-[#f2ece4] border-none rounded-lg text-base shadow-none focus-visible:ring-0 px-2 pr-5 text-center text-[#3a302a] group-focus-within/row:bg-white transition-all"
                                                          style={{ fontFamily: "'EB Garamond', serif" }}
                                                          value={Math.round(details.capacity * 100) || ''}
                                                          placeholder="100"
                                                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDetails('capacity', Number(e.target.value) / 100)}
                                                        />
                                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#9a9088] font-bold pointer-events-none">%</span>
                                                      </div>

                                                      <div className="relative w-full">
                                                        <Input
                                                          type="number"
                                                          className="h-9 bg-[#f2ece4] border-none rounded-lg text-base shadow-none focus-visible:ring-0 px-2 pr-5 text-center text-[#8c3c3c] group-focus-within/row:bg-white transition-all"
                                                          style={{ fontFamily: "'EB Garamond', serif" }}
                                                          value={details.plannedLeave || ''}
                                                          placeholder="0"
                                                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDetails('plannedLeave', Number(e.target.value))}
                                                        />
                                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#9a9088] font-bold pointer-events-none">D</span>
                                                      </div>

                                                      <button
                                                        onClick={() => confirmDelete('Disengage Node', `Are you sure you want to disengage ${displayName} from ${platform.name}?`, () => setPlatforms(prev => prev.map(p => p.id === platform.id ? { ...p, members: p.members.filter((_, i) => i !== idx) } : p)))}
                                                        className="h-8 w-8 rounded-lg flex items-center justify-center text-[#d8d0c8] hover:text-[#8c3c3c] hover:bg-[#8c3c3c]/10 transition-all opacity-0 group-hover/row:opacity-100 ml-auto"
                                                      >
                                                        <Trash2 className="h-4 w-4" />
                                                      </button>
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {activeSection === 'priority' && (
                            <div className="animate-in fade-in slide-in-from-bottom-5 duration-700 pb-32">
                              {/* Hero Section */}
                              <div className="pb-12 pt-0 px-6">
                                <h1 className="text-[3.5rem] leading-[1.1] text-[#3a302a] tracking-tight mb-4 italic" style={{ fontFamily: "'EB Garamond', serif" }}>
                                  Project Priority
                                </h1>
                                <p className="text-lg text-[#605850] max-w-2xl font-light">
                                  Orchestrating strategic momentum through curated resource allocation and disciplined focus.
                                </p>
                              </div>

                              {/* Strategic Project Priorities */}
                              <section className="mb-16 px-6">
                                <div className="flex items-end justify-between mb-8">
                                  <div>
                                    <h2 className="text-3xl text-[#3a302a] tracking-tight" style={{ fontFamily: "'EB Garamond', serif" }}>Strategic Project Priorities</h2>
                                    <div className="h-1 w-12 bg-[#c2652a] mt-2"></div>
                                  </div>
                                  <span className="text-sm font-medium text-[#c2652a] tracking-widest uppercase">Overview</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                                  {[
                                    { label: 'P0 - CRITICAL', title: 'Critical', desc: 'Critical projects requiring immediate attention and focus.', value: projects.filter(p => p.priority === 'critical').length, colorClass: 'text-white', bgClass: 'bg-white/20', icon: ShieldAlert, mainBg: 'bg-[#8c3c3c]', border: 'border-[#8c3c3c]', textMain: 'text-white', textSub: 'text-white/80', borderTop: 'border-white/20' },
                                    { label: 'P1 - HIGH', title: 'High', desc: 'High priority projects that drive growth and value.', value: projects.filter(p => p.priority === 'high').length, colorClass: 'text-white', bgClass: 'bg-white/20', icon: Zap, mainBg: 'bg-[#c2652a]', border: 'border-[#c2652a]', textMain: 'text-white', textSub: 'text-white/80', borderTop: 'border-white/20' },
                                    { label: 'P2 - MEDIUM', title: 'Medium', desc: 'Standard priority projects and planned enhancements.', value: projects.filter(p => p.priority === 'medium').length, colorClass: 'text-white', bgClass: 'bg-white/20', icon: Target, mainBg: 'bg-[#605850]', border: 'border-[#605850]', textMain: 'text-white', textSub: 'text-white/80', borderTop: 'border-white/20' },
                                    { label: 'P3 - LOW', title: 'Low', desc: 'Low priority projects, technical debt, and maintenance.', value: projects.filter(p => p.priority === 'low').length, colorClass: 'text-white', bgClass: 'bg-white/20', icon: Activity, mainBg: 'bg-[#78706a]', border: 'border-[#78706a]', textMain: 'text-white', textSub: 'text-white/80', borderTop: 'border-white/20' }
                                  ].map((stat, i) => (
                                    <div key={i} className={cn("p-8 rounded-xl shadow-[0_2px_16px_rgba(58,48,42,0.04)] border relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300", stat.mainBg, stat.border)}>
                                      <div className={cn("absolute top-0 right-0 p-4 opacity-10", stat.textMain)}>
                                        <stat.icon className="h-16 w-16" />
                                      </div>
                                      <div className="flex flex-col h-full justify-between relative z-10">
                                        <div>
                                          <span className={cn("inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-6", stat.bgClass, stat.colorClass)}>
                                            {stat.label}
                                          </span>
                                          <h3 className={cn("text-2xl mb-2", stat.textMain)} style={{ fontFamily: "'EB Garamond', serif" }}>{stat.title}</h3>
                                          <p className={cn("text-sm leading-relaxed min-h-[60px]", stat.textSub)}>{stat.desc}</p>
                                        </div>
                                        <div className={cn("mt-8 flex items-center justify-between border-t pt-4", stat.borderTop)}>
                                          <span className={cn("text-sm font-semibold", stat.textMain)}>
                                            {stat.value} Active Projects
                                          </span>
                                          <ArrowRight className={cn("h-5 w-5 group-hover:translate-x-1 transition-transform", stat.textMain)} />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </section>

                              {/* Initiative Registry */}
                              <section className="px-6 mb-24">
                                <div className="flex items-end justify-between mb-8">
                                  <div>
                                    <h2 className="text-3xl text-[#3a302a] tracking-tight" style={{ fontFamily: "'EB Garamond', serif" }}>Initiative Registry</h2>
                                    <div className="h-1 w-12 bg-[#c2652a] mt-2"></div>
                                  </div>
                                  <button
                                    onClick={addProject}
                                    className="bg-[#c2652a] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#c2652a]/90 transition-colors shadow-lg shadow-[#c2652a]/20 flex items-center gap-2"
                                  >
                                    <Plus className="h-4 w-4" />
                                    Add New Initiative
                                  </button>
                                </div>

                                <div className="flex flex-col gap-6">
                                  {projects.map((project, idx) => {
                                    const isEditing = editingProjectId === project.id;
                                    const netPts = platforms.reduce((sum, p) => {
                                      const alloc = p.allocations?.find(a => a.projectId === project.id)?.allocatedPercent || 0;
                                      return sum + Math.round((p.totalStoryPoints * alloc) / 100);
                                    }, 0);

                                    return (
                                      <div key={project.id} className={cn(
                                        "bg-white rounded-2xl shadow-[0_2px_16px_rgba(58,48,42,0.04)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all duration-300 relative group/card",
                                        isEditing ? "border-2 border-[#c2652a]" : "border border-orange-200/60 hover:border-orange-300"
                                      )}>
                                        {/* Left Side: Detail */}
                                        <div className="lg:col-span-5 p-8 border-b lg:border-b-0 lg:border-r border-orange-100 relative group/left">
                                          {/* Action Buttons */}
                                          <div className="absolute top-4 right-4 z-20 flex items-center gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                            {/* Edit Button */}
                                            <button
                                              onClick={() => {
                                                if (isEditing) {
                                                  setEditingProjectId(null);
                                                  setProjectBackup(null);
                                                  setPlatformBackup(null);
                                                } else {
                                                  handleStartEditing(project.id);
                                                }
                                              }}
                                              className={cn(
                                                "p-2 rounded-full transition-all shadow-sm",
                                                isEditing
                                                  ? "bg-[#c2652a] text-white hover:bg-orange-800"
                                                  : "bg-[#f6f0e8] text-stone-500 hover:text-[#c2652a] hover:bg-white"
                                              )}
                                              title={isEditing ? "Save Changes" : "Edit Project"}
                                            >
                                              {isEditing ? <Check className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                                            </button>

                                            {/* Cancel Button */}
                                            {isEditing && (
                                              <button
                                                onClick={handleCancelEditing}
                                                className="p-2 text-stone-500 hover:text-stone-700 bg-[#f6f0e8] hover:bg-stone-200 rounded-full transition-colors shadow-sm"
                                                title="Cancel & Discard Changes"
                                              >
                                                <X className="h-4 w-4" />
                                              </button>
                                            )}

                                            {/* Delete Button */}
                                            <button
                                              onClick={() => confirmDelete('Delete Initiative', `Remove ${project.name || 'this initiative'}?`, () => { deleteProject(project.id); setEditingProjectId(null); })}
                                              className="p-2 text-stone-400 hover:text-[#c0392b] bg-[#f6f0e8] hover:bg-[#fce4e0] rounded-full transition-colors shadow-sm"
                                              title="Delete Project"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </button>
                                          </div>

                                          <div className="flex items-center gap-4 mb-6 pr-32">
                                            <div className="w-12 h-12 bg-[#e08850] rounded-xl flex items-center justify-center text-white shrink-0">
                                              <Target className="h-6 w-6" />
                                            </div>
                                            <div className="flex-1 w-full">
                                              {isEditing ? (
                                                <input
                                                  value={project.name}
                                                  onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                                                  className="w-full bg-orange-50/50 border border-orange-200 rounded-lg p-3 text-2xl text-[#3a302a] placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#c2652a] focus:border-[#c2652a] transition-all font-serif italic"
                                                  placeholder="Project Name"
                                                  style={{ fontFamily: "'EB Garamond', serif" }}
                                                />
                                              ) : (
                                                <h3 className="text-3xl text-orange-900 truncate" style={{ fontFamily: "'EB Garamond', serif" }}>
                                                  {project.name || 'Unnamed Project'}
                                                </h3>
                                              )}
                                              <p className="text-xs text-[#605850] font-bold tracking-widest uppercase mt-1">Foundation Layer</p>
                                            </div>
                                          </div>

                                          <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                              <span className="text-sm font-medium text-stone-500">Status</span>
                                              <span className="px-3 py-1 bg-orange-100 text-orange-800 text-[10px] font-bold rounded-full uppercase">In Progress</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                              <span className="text-sm font-medium text-stone-500">Timeline</span>
                                              <span className="text-sm text-[#3a302a]">Q3 - Q4 2024</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                              <span className="text-sm font-medium text-stone-500">Priority</span>
                                              {isEditing ? (
                                                <Select value={project.priority || 'medium'} onValueChange={(val) => updateProject(project.id, 'priority', val)}>
                                                  <SelectTrigger className="h-7 border-orange-200 text-xs w-32 font-bold uppercase tracking-wider">
                                                    <SelectValue />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    <SelectItem value="critical" className="text-[#8c3c3c] font-bold">Critical</SelectItem>
                                                    <SelectItem value="high" className="text-[#c2652a] font-bold">High</SelectItem>
                                                    <SelectItem value="medium" className="text-[#605850] font-bold">Medium</SelectItem>
                                                    <SelectItem value="low" className="text-[#78706a] font-bold">Low</SelectItem>
                                                  </SelectContent>
                                                </Select>
                                              ) : (
                                                <span className={cn(
                                                  "text-sm font-semibold capitalize",
                                                  project.priority === 'critical' ? 'text-[#8c3c3c]' :
                                                    project.priority === 'high' ? 'text-[#c2652a]' :
                                                      'text-[#605850]'
                                                )}>
                                                  {project.priority || 'Medium'}
                                                </span>
                                              )}
                                            </div>
                                          </div>

                                          <div className="mt-8 pt-6 border-t border-orange-100">
                                            <label className="block text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-2">Strategic Context</label>
                                            {isEditing ? (
                                              <textarea
                                                className="w-full bg-orange-50/50 border border-orange-200 rounded-lg p-3 text-sm text-[#3a302a] placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#c2652a] focus:border-[#c2652a] transition-all resize-none font-body"
                                                rows={3}
                                                value={project.remarks}
                                                onChange={(e) => updateProject(project.id, 'remarks', e.target.value)}
                                                placeholder="Describe how this initiative aligns with our long-term roadmap..."
                                              />
                                            ) : (
                                              <div className="w-full bg-[#f6f0e8] border border-orange-100 rounded-lg p-3 text-sm text-[#3a302a] min-h-[80px]">
                                                {project.remarks || <span className="text-stone-400 italic">No context provided. Click edit to add context.</span>}
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        {/* Right Side: Weights & Breakdown */}
                                        <div className="lg:col-span-7 p-8 bg-white relative">
                                          <div className="flex items-center justify-between mb-8">
                                            <h4 className="text-xs font-bold tracking-widest uppercase text-stone-400">Platform Breakdown & Weights</h4>
                                            <div className="text-right">
                                              <span className="text-sm font-bold text-[#c2652a] mr-1">{netPts}</span>
                                              <span className="text-[10px] uppercase tracking-widest text-stone-400">Net Points</span>
                                            </div>
                                          </div>

                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                            {platforms.map(platform => {
                                              const alloc = platform.allocations?.find(a => a.projectId === project.id);
                                              const percent = alloc ? alloc.allocatedPercent : 0;
                                              const getPlatformIcon = (name: string) => {
                                                const lower = name.toLowerCase();
                                                if (lower.includes('android') || lower.includes('ios') || lower.includes('mobile')) return Globe;
                                                if (lower.includes('backend') || lower.includes('server') || lower.includes('api')) return Network;
                                                if (lower.includes('qa') || lower.includes('test')) return Bug;
                                                if (lower.includes('web') || lower.includes('frontend')) return LayoutGrid;
                                                return Code;
                                              };
                                              const PlatformIcon = getPlatformIcon(platform.name);

                                              return (
                                                <div key={platform.id} className="space-y-3 group/platform relative">
                                                  <div className="flex justify-between items-end">
                                                    <div className="flex items-center gap-2">
                                                      <PlatformIcon className="text-orange-700 h-5 w-5" />
                                                      <span className="text-sm font-bold text-[#3a302a]">{platform.name}</span>
                                                    </div>
                                                    {isEditing ? (
                                                      <div className="relative w-24">
                                                        <input
                                                          type="number"
                                                          value={percent || ''}
                                                          onChange={(e) => {
                                                            let val = parseInt(e.target.value);
                                                            if (isNaN(val)) val = 0;
                                                            if (val > 100) val = 100;
                                                            if (val < 0) val = 0;
                                                            updatePlatformAllocationForProject(platform.id, project.id, val);
                                                          }}
                                                          className="w-full h-9 text-right pr-8 text-sm font-bold text-[#3a302a] bg-orange-50/50 border border-orange-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#c2652a] focus:border-[#c2652a] transition-all"
                                                        />
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c2652a] font-bold text-sm">%</span>
                                                      </div>
                                                    ) : (
                                                      <span className="text-xl text-[#c2652a]" style={{ fontFamily: "'EB Garamond', serif" }}>{percent}%</span>
                                                    )}
                                                  </div>
                                                  <div className="w-full h-1.5 bg-[#f6f0e8] rounded-full overflow-hidden">
                                                    <div
                                                      className={cn("h-full rounded-full transition-all duration-500", percent > 0 ? "bg-[#c2652a]" : "bg-transparent")}
                                                      style={{ width: `${Math.max(percent, 0)}%` }}
                                                    ></div>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>

                                          <div className="mt-12 p-6 rounded-xl bg-orange-50 border border-orange-100">
                                            <div className="flex items-start gap-4">
                                              <div className="p-2 bg-white rounded-lg border border-orange-200">
                                                <Info className="h-5 w-5 text-[#c2652a]" />
                                              </div>
                                              <p className="text-xs text-[#605850] leading-relaxed">
                                                <strong className="text-orange-900 block mb-1">Resource Advisory:</strong>
                                                Weights are calculated based on engineering story points and infrastructure complexity. Platform sync is required bi-weekly.
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}

                                  {projects.length === 0 && (
                                    <div className="p-20 text-center space-y-6 group rounded-2xl border border-dashed border-orange-200 bg-[#f6f0e8]/50">
                                      <div className="h-20 w-20 rounded-[2rem] bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500 border border-orange-100 mx-auto">
                                        <Target className="h-10 w-10 text-orange-200 group-hover:text-[#c2652a] transition-colors" />
                                      </div>
                                      <div>
                                        <p className="font-serif text-[#3a302a] text-2xl mb-2" style={{ fontFamily: "'EB Garamond', serif" }}>No active initiatives</p>
                                        <p className="text-sm text-[#605850] mb-6">Start by defining your primary mission targets.</p>
                                        <button
                                          onClick={addProject}
                                          className="bg-[#c2652a] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#c2652a]/90 transition-colors shadow-lg shadow-[#c2652a]/20 inline-flex items-center gap-2"
                                        >
                                          <Plus className="h-4 w-4" />
                                          Define Initiative
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </section>
                            </div>
                          )}




                          {activeSection === 'goals' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                              <Card className="border-none shadow-xl bg-white/50 bg-[#f2ece4]/50 backdrop-blur-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                                <CardHeader className="border-b border-[#d8d0c8]/30/50 pb-6 bg-white/50 bg-[#f2ece4]/50">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="h-12 w-12 rounded-2xl bg-[#fbe8d8] flex items-center justify-center border border-[#f0a878]/40 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                        <Target className="h-6 w-6 text-[#c2652a]" />
                                      </div>
                                      <div>
                                        <CardTitle className="text-xl font-black text-[#3a302a] tracking-tight">Strategic Performance Goals</CardTitle>
                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <div className="flex items-center gap-1.5 mt-1 cursor-pointer group/info">
                                              <p className="text-sm text-[#605850] font-medium group-hover/info:text-[#c2652a] transition-colors">
                                                Define outcome-driven objectives to provide tactical direction.
                                              </p>
                                              <Info className="h-4 w-4 text-[#9a9088] group-hover/info:text-[#c2652a] transition-colors" />
                                            </div>
                                          </DialogTrigger>
                                          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl border-0 shadow-2xl bg-white/95 backdrop-blur-xl">
                                            <DialogHeader className="space-y-4">
                                              <div className="h-14 w-14 rounded-2xl bg-[#fbe8d8] flex items-center justify-center border border-[#f0a878]/40 mb-2">
                                                <Target className="h-7 w-7 text-[#c2652a]" />
                                              </div>
                                              <div>
                                                <DialogTitle className="text-2xl font-black text-[#3a302a] tracking-tight">Strategic Goal Framework</DialogTitle>
                                                <DialogDescription className="text-[#605850] font-medium text-base">
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
                                                  <p className="text-sm text-zinc-700 mb-2">
                                                    A common mistake is treating the Sprint Goal as a summary of all tickets.
                                                  </p>
                                                  <ul className="text-sm space-y-1 list-disc list-inside text-zinc-600">
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
                                                  <div className="bg-[#f2ece4] p-3 rounded-lg border border-[#d8d0c8]/40 text-sm font-medium text-center text-[#c2652a] mb-2">
                                                    "Our goal is to [Action/Change] so that [User/Business Value] is achieved."
                                                  </div>

                                                  <div className="border border-[#d8d0c8]/40 rounded-lg overflow-hidden">
                                                    <table className="w-full text-sm text-left">
                                                      <thead className="bg-zinc-50 dark:bg-zinc-900 text-zinc-500 uppercase text-xs">
                                                        <tr>
                                                          <th className="px-4 py-2 font-medium">Type</th>
                                                          <th className="px-4 py-2 font-medium text-red-500">❌ Weak Goal</th>
                                                          <th className="px-4 py-2 font-medium text-emerald-500">✅ Strong Goal</th>
                                                        </tr>
                                                      </thead>
                                                      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                                        <tr className="bg-white bg-white">
                                                          <td className="px-4 py-3 font-medium">Feature</td>
                                                          <td className="px-4 py-3 text-zinc-500">"Finish the new Search tickets."</td>
                                                          <td className="px-4 py-3 text-zinc-900">"Improve search relevance so customers find products faster."</td>
                                                        </tr>
                                                        <tr className="bg-white bg-white">
                                                          <td className="px-4 py-3 font-medium">Risk</td>
                                                          <td className="px-4 py-3 text-zinc-500">"Do the research spike."</td>
                                                          <td className="px-4 py-3 text-zinc-900">"Validate the new architecture to ensure it handles 10k users."</td>
                                                        </tr>
                                                        <tr className="bg-white bg-white">
                                                          <td className="px-4 py-3 font-medium">Fix</td>
                                                          <td className="px-4 py-3 text-zinc-500">"Close 10 bugs."</td>
                                                          <td className="px-4 py-3 text-zinc-900">"Stabilize the checkout flow to reduce cart abandonment."</td>
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
                                                      <div key={item} className="p-2 bg-zinc-50 dark:bg-zinc-900 border border-[#d8d0c8]/40 rounded-md text-sm font-bold text-zinc-700">
                                                        {item}
                                                      </div>
                                                    ))}
                                                  </div>
                                                  <p className="text-sm text-zinc-500 italic text-center">
                                                    "If we finish the tickets but miss this goal, did we fail? (Answer should be Yes)."
                                                  </p>
                                                </div>

                                                {/* 5. During Sprint */}
                                                <div className="bg-[#fbe8d8] border border-[#f0a878]/40 rounded-xl p-4">
                                                  <h4 className="font-bold text-[#3a302a] mb-2">5. During the Sprint</h4>
                                                  <div className="space-y-2 text-sm text-zinc-700">
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
                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#fbe8d8] text-[#c2652a] font-bold text-xs">1</div>
                                                    Phase 1: Planning & Definition
                                                  </h4>
                                                  <p className="text-sm text-muted-foreground italic">Use these statuses before the Sprint officially starts.</p>

                                                  <div className="grid gap-3">
                                                    <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-[#d8d0c8]/40">
                                                      <div className="flex items-center gap-2 mb-1">
                                                        <Circle className="h-3 w-3 text-zinc-400" />
                                                        <span className="font-bold text-zinc-700">Draft</span>
                                                      </div>
                                                      <p className="text-sm text-zinc-600">
                                                        <span className="font-semibold text-zinc-900">Meaning:</span> The goal is currently being written or brainstormed by the Product Owner.<br />
                                                        <span className="font-semibold text-zinc-900">Action:</span> Refine the wording to ensure it is SMART.
                                                      </p>
                                                    </div>

                                                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50">
                                                      <div className="flex items-center gap-2 mb-1">
                                                        <div className="h-3 w-3 rounded-full bg-blue-500" />
                                                        <span className="font-bold text-blue-900 dark:text-blue-100">Proposed</span>
                                                      </div>
                                                      <p className="text-sm text-zinc-600">
                                                        <span className="font-semibold text-zinc-900">Meaning:</span> Presented to the team for feasibility checking during Sprint Planning.<br />
                                                        <span className="font-semibold text-zinc-900">Action:</span> Developers and QA must review the goal for capacity fit.
                                                      </p>
                                                    </div>
                                                  </div>
                                                </div>

                                                {/* Phase 2 */}
                                                <div className="space-y-4">
                                                  <h4 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#fbe8d8] text-[#c2652a] font-bold text-xs">2</div>
                                                    Phase 2: Execution (Health Check)
                                                  </h4>
                                                  <p className="text-sm text-muted-foreground italic">Use these statuses to update stakeholders during Daily Standups.</p>

                                                  <div className="grid gap-3">
                                                    <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50">
                                                      <div className="flex items-center gap-2 mb-1">
                                                        <div className="h-3 w-3 rounded-full bg-emerald-500" />
                                                        <span className="font-bold text-emerald-900 dark:text-emerald-100">On Track</span>
                                                      </div>
                                                      <p className="text-sm text-zinc-600">
                                                        <span className="font-semibold text-zinc-900">Meaning:</span> "Business as usual." The team is confident the goal will be met.<br />
                                                        <span className="font-semibold text-zinc-900">Action:</span> Continue current execution strategy. No major blockers exist.
                                                      </p>
                                                    </div>

                                                    <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800/50">
                                                      <div className="flex items-center gap-2 mb-1">
                                                        <div className="h-3 w-3 rounded-full bg-yellow-500" />
                                                        <span className="font-bold text-yellow-900 dark:text-yellow-100">At Risk</span>
                                                      </div>
                                                      <p className="text-sm text-zinc-600">
                                                        <span className="font-semibold text-zinc-900">Meaning:</span> "Warning." Impediments or scope creep have been identified.<br />
                                                        <span className="font-semibold text-zinc-900">Action:</span> Discuss immediately. May need to swarm or deprioritize work.
                                                      </p>
                                                    </div>

                                                    <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50">
                                                      <div className="flex items-center gap-2 mb-1">
                                                        <div className="h-3 w-3 rounded-full bg-red-500" />
                                                        <span className="font-bold text-red-900 dark:text-red-100">Off Track</span>
                                                      </div>
                                                      <p className="text-sm text-zinc-600">
                                                        <span className="font-semibold text-zinc-900">Meaning:</span> "Critical Alert." Highly unlikely the goal will be met.<br />
                                                        <span className="font-semibold text-zinc-900">Action:</span> Immediate escalation to Product Owner. Decide to pivot or descope.
                                                      </p>
                                                    </div>

                                                    <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/50">
                                                      <div className="flex items-center gap-2 mb-1">
                                                        <div className="h-3 w-3 rounded-full bg-purple-500" />
                                                        <span className="font-bold text-purple-900 dark:text-purple-100">Blocked</span>
                                                      </div>
                                                      <p className="text-sm text-zinc-600">
                                                        <span className="font-semibold text-zinc-900">Meaning:</span> Progress is completely halted due to an external dependency.<br />
                                                        <span className="font-semibold text-zinc-900">Action:</span> Scrum Master must intervene. Team cannot proceed until resolved.
                                                      </p>
                                                    </div>
                                                  </div>
                                                </div>

                                                {/* Phase 3 */}
                                                <div className="space-y-4">
                                                  <h4 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#fbe8d8] text-[#c2652a] font-bold text-xs">3</div>
                                                    Phase 3: Completion (Retrospective)
                                                  </h4>
                                                  <p className="text-sm text-muted-foreground italic">Select these when closing the Sprint.</p>

                                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div className="p-3 rounded-lg border border-[#d8d0c8]/40 bg-white dark:bg-zinc-900">
                                                      <div className="flex items-center gap-2 mb-2">
                                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                        <span className="font-semibold">Achieved</span>
                                                      </div>
                                                      <p className="text-xs text-muted-foreground">Delivered and met "Definition of Done."</p>
                                                    </div>
                                                    <div className="p-3 rounded-lg border border-[#d8d0c8]/40 bg-white dark:bg-zinc-900">
                                                      <div className="flex items-center gap-2 mb-2">
                                                        <div className="h-4 w-4 rounded-full border-2 border-orange-500 border-t-transparent -rotate-45" />
                                                        <span className="font-semibold">Partially Achieved</span>
                                                      </div>
                                                      <p className="text-xs text-muted-foreground">Value delivered, but missed some criteria.</p>
                                                    </div>
                                                    <div className="p-3 rounded-lg border border-[#d8d0c8]/40 bg-white dark:bg-zinc-900">
                                                      <div className="flex items-center gap-2 mb-2">
                                                        <LogOut className="h-4 w-4 text-red-500 rotate-180" />
                                                        <span className="font-semibold">Missed</span>
                                                      </div>
                                                      <p className="text-xs text-muted-foreground">Primary objective not completed.</p>
                                                    </div>
                                                    <div className="p-3 rounded-lg border border-[#d8d0c8]/40 bg-white dark:bg-zinc-900">
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
                                                  <p className="text-sm text-zinc-600 leading-relaxed">
                                                    The Sprint Goal is the single, overarching objective for the Sprint. It acts as the "North Star," providing the <strong>Why</strong> behind the work. It allows the team to focus on value and collaboration, rather than just clearing a list of tickets.
                                                  </p>
                                                </div>

                                                <div className="bg-zinc-50 bg-[#f2ece4]/50 border border-[#d8d0c8]/40 rounded-xl p-5">
                                                  <div className="flex items-center gap-2 mb-3">
                                                    <Zap className="h-5 w-5 text-amber-500 fill-amber-500" />
                                                    <h4 className="font-bold text-zinc-900">Pro Tip: How to write a good Goal</h4>
                                                  </div>
                                                  <p className="text-sm text-zinc-600 mb-4">
                                                    Don't just list tasks. Use this simple formula:
                                                  </p>

                                                  <div className="bg-white bg-white p-4 rounded-lg border border-[#d8d0c8]/40 font-mono text-sm text-[#c2652a] mb-4 shadow-sm">
                                                    "We will [Action] the [Feature] to achieve [Outcome/Value]."
                                                  </div>

                                                  <div className="text-sm">
                                                    <span className="font-semibold text-zinc-900">Example:</span>
                                                    <span className="text-zinc-600 italic"> "Implement Face ID Login to reduce user sign-in time by 50%."</span>
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
                                      className="bg-[#3a302a] hover:bg-[#c2652a] text-white shadow-xl shadow-[#d8d0c8]/50  transition-all duration-300 rounded-2xl px-6 h-12 font-bold group"
                                    >
                                      <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                                      Create Goal
                                    </Button>
                                  </div>
                                </CardHeader>
                                <CardContent className="pt-10 pb-10 px-8">
                                  {sprintGoals.length === 0 ? (
                                    <div className="text-center py-24 border-2 border-dashed border-[#d8d0c8] dark:border-slate-800 rounded-[2.5rem] bg-[#f6f0e8]/50 dark:bg-[#3a302a]/20 flex flex-col items-center gap-6 group">
                                      <div className="h-20 w-20 rounded-3xl bg-white dark:bg-[#3a302a] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500 border border-slate-100 dark:border-slate-800">
                                        <Target className="h-10 w-10 text-[#d8d0c8] group-hover:text-[#c2652a] transition-colors" />
                                      </div>
                                      <div className="space-y-2">
                                        <h3 className="text-2xl font-black text-[#3a302a] tracking-tight">No Objectives Defined</h3>
                                        <p className="text-[#605850] font-medium max-w-sm mx-auto">Establish high-impact outcome statements to align the engineering force.</p>
                                      </div>
                                      <Button
                                        onClick={addSprintGoal}
                                        className="bg-[#c2652a] hover:bg-[#c2652a] text-white rounded-2xl font-bold px-8 shadow-lg shadow-[#f0a878]/30 "
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
                                                      snapshot.isDragging ? "shadow-2xl ring-4 ring-[#c2652a]/10 rotate-1 z-50 scale-[1.02] bg-white" : "bg-white/40 dark:bg-slate-950/40 backdrop-blur-sm shadow-sm hover:shadow-xl hover:bg-white dark:hover:bg-[#3a302a] ring-1 ring-slate-200/50 dark:ring-slate-800/50",
                                                      goal.status === 'achieved' && "ring-emerald-500/20 bg-emerald-50/30",
                                                    )}
                                                  >
                                                    <div
                                                      {...provided.dragHandleProps}
                                                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-12 flex items-center justify-center cursor-grab active:cursor-grabbing text-[#d8d0c8] hover:text-[#c2652a] transition-all rounded-xl opacity-0 group-hover:opacity-100"
                                                    >
                                                      <GripVertical className="h-5 w-5" />
                                                    </div>

                                                    <div className="pl-6 flex flex-col xl:flex-row gap-6 items-start w-full">
                                                      {/* Description */}
                                                      <div className="flex-1 w-full space-y-3">
                                                        <div className="flex items-center gap-2">
                                                          <div className="h-6 w-6 rounded-lg bg-[#fbe8d8] flex items-center justify-center">
                                                            <Target className="h-3.5 w-3.5 text-[#c2652a]" />
                                                          </div>
                                                          <label className="text-[10px] font-black text-[#9a9088] uppercase tracking-[0.2em]">Goal Definition</label>
                                                        </div>
                                                        <div className="relative group/field mt-2">
                                                          <Textarea
                                                            value={goal.description}
                                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                                                              updateSprintGoal(goal.id, 'description', e.target.value);
                                                              e.target.style.height = 'auto';
                                                              e.target.style.height = `${e.target.scrollHeight}px`;
                                                            }}
                                                            placeholder="Define a primary goal for this sprint cycle..."
                                                            className="min-h-[80px] overflow-hidden text-lg font-bold tracking-tight resize-none bg-white dark:bg-[#3a302a] border-2 border-slate-100 dark:border-slate-800 focus-visible:ring-4 focus-visible:ring-[#c2652a]/10 focus-visible:border-[#c2652a] p-4 rounded-[1.5rem] text-[#3a302a] placeholder:text-[#d8d0c8] transition-all shadow-sm"
                                                          />
                                                        </div>
                                                      </div>

                                                      {/* Status & Remark Middle Layer */}
                                                      <div className="flex flex-col md:flex-row gap-6 w-full xl:w-auto">
                                                        {/* Status */}
                                                        <div className="w-full md:w-56 space-y-3">
                                                          <div className="flex items-center gap-2">
                                                            <div className="h-6 w-6 rounded-lg bg-[#fbe8d8] flex items-center justify-center">
                                                              <Activity className="h-3.5 w-3.5 text-[#c2652a]" />
                                                            </div>
                                                            <label className="text-[10px] font-black text-[#9a9088] uppercase tracking-[0.2em]">Execution Pulse</label>
                                                          </div>
                                                          <Select
                                                            value={goal.status}
                                                            onValueChange={(val: any) => updateSprintGoal(goal.id, 'status', val)}
                                                          >
                                                            <SelectTrigger className={cn(
                                                              "h-14 border-0 shadow-lg transition-all duration-300 rounded-2xl font-bold px-4",
                                                              goal.status === 'draft' ? "bg-[#f2ece4] text-[#605850] shadow-[#d8d0c8]/50/50" :
                                                                goal.status === 'proposed' ? "bg-blue-50 text-blue-700 shadow-blue-100" :
                                                                  goal.status === 'on-track' ? "bg-emerald-50 text-emerald-700 shadow-emerald-100" :
                                                                    goal.status === 'at-risk' ? "bg-amber-50 text-amber-700 shadow-amber-100" :
                                                                      goal.status === 'off-track' ? "bg-rose-50 text-rose-700 shadow-rose-100" :
                                                                        goal.status === 'blocked' ? "bg-purple-50 text-purple-700 shadow-purple-100" :
                                                                          goal.status === 'achieved' ? "bg-emerald-600 text-white shadow-emerald-200 ring-2 ring-emerald-400/20" :
                                                                            goal.status === 'partially-achieved' ? "bg-orange-50 text-orange-700 shadow-orange-100" :
                                                                              goal.status === 'missed' ? "bg-rose-600 text-white shadow-rose-200" :
                                                                                "bg-slate-200 text-[#9a9088] line-through"
                                                            )}>
                                                              <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent className="rounded-2xl border-0 shadow-2xl">
                                                              <SelectGroup>
                                                                <SelectLabel className="text-[10px] font-black uppercase text-[#9a9088] p-4 tracking-widest">Initiation</SelectLabel>
                                                                <SelectItem value="draft" className="rounded-xl">⚪ Draft Stage</SelectItem>
                                                                <SelectItem value="proposed" className="rounded-xl">🔵 Proposed Objective</SelectItem>
                                                              </SelectGroup>
                                                              <SelectSeparator />
                                                              <SelectGroup>
                                                                <SelectLabel className="text-[10px] font-black uppercase text-[#9a9088] p-4 tracking-widest">In-Flight Pulse</SelectLabel>
                                                                <SelectItem value="on-track" className="rounded-xl">🟢 Nominal Performance</SelectItem>
                                                                <SelectItem value="at-risk" className="rounded-xl">🟡 Performance Degradation</SelectItem>
                                                                <SelectItem value="off-track" className="rounded-xl">🔴 Critical Deviation</SelectItem>
                                                                <SelectItem value="blocked" className="rounded-xl">🟣 Pipeline Blocked</SelectItem>
                                                              </SelectGroup>
                                                              <SelectSeparator />
                                                              <SelectGroup>
                                                                <SelectLabel className="text-[10px] font-black uppercase text-[#9a9088] p-4 tracking-widest">Final Resolution</SelectLabel>
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
                                                            <div className="h-6 w-6 rounded-lg bg-[#fbe8d8] flex items-center justify-center">
                                                              <FileText className="h-3.5 w-3.5 text-[#c2652a]" />
                                                            </div>
                                                            <label className="text-[10px] font-black text-[#9a9088] uppercase tracking-[0.2em]">Strategic Context</label>
                                                          </div>
                                                          <div className="relative group/remark mt-2">
                                                            <Textarea
                                                              value={goal.remark}
                                                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                                                                updateSprintGoal(goal.id, 'remark', e.target.value);
                                                                e.target.style.height = 'auto';
                                                                e.target.style.height = `${e.target.scrollHeight}px`;
                                                              }}
                                                              placeholder="Add supporting notes or detailed success criteria..."
                                                              className="min-h-[64px] overflow-hidden text-sm font-medium resize-none bg-white dark:bg-[#3a302a] border-2 border-slate-100 dark:border-slate-800 focus-visible:ring-4 focus-visible:ring-[#c2652a]/10 focus-visible:border-[#c2652a] rounded-2xl p-4 transition-all shadow-sm placeholder:text-[#d8d0c8]"
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
                                                          className="h-12 w-12 bg-white hover:bg-rose-50 text-[#d8d0c8] hover:text-[#8c3c3c] rounded-2xl shadow-sm hover:shadow-lg transition-all border border-slate-100"
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
                                <div className="h-14 w-14 rounded-2xl bg-[#fbe8d8] flex items-center justify-center border border-[#f0a878]/40 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                  <Milestone className="h-7 w-7 text-[#c2652a]" />
                                </div>
                                <div>
                                  <h2 className="text-3xl font-black text-[#3a302a] tracking-tight italic">Key Execution Milestones</h2>
                                  <div className="flex items-center gap-2 mt-1">
                                    <p className="text-[#605850] font-medium">Identify and sequence critical checkpoints to track delivery progress.</p>
                                    <div className="h-1 w-1 rounded-full bg-[#c2652a] mx-1" />
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <button className="flex items-center gap-1.5 text-[#c2652a] hover:text-[#8a4518] transition-colors text-sm font-bold group/help cursor-pointer">
                                          <Info className="h-4 w-4" />
                                          Orchestration Protocol
                                        </button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto rounded-3xl border-0 shadow-2xl bg-white/95 backdrop-blur-xl">
                                        <DialogHeader className="space-y-4">
                                          <div className="h-14 w-14 rounded-2xl bg-[#fbe8d8] flex items-center justify-center border border-[#f0a878]/40 mb-2">
                                            <Milestone className="h-7 w-7 text-[#c2652a]" />
                                          </div>
                                          <div>
                                            <DialogTitle className="text-2xl font-black text-[#3a302a] tracking-tight">Milestone Execution Framework</DialogTitle>
                                            <DialogDescription className="text-[#605850] font-medium text-base">
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
                                              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 border border-[#d8d0c8]/30">
                                                <h3 className="font-semibold text-zinc-900 flex items-center gap-2 mb-2">
                                                  <Info className="h-4 w-4 text-[#c2652a]" />
                                                  What is a Milestone?
                                                </h3>
                                                <p className="text-sm text-zinc-600 leading-relaxed">
                                                  A Milestone marks a <strong>significant achievement or event</strong> in your project. Unlike Sprints, which are time-based (e.g., "Two Weeks"), Milestones are <strong>outcome-based</strong>. They typically span multiple Sprints and group together specific Phases (like Research, Execution, Review) to track progress toward a major goal, such as a Product Launch, a Marketing Campaign, or a Compliance Audit.
                                                </p>
                                              </div>

                                              {/* Phase 1 */}
                                              <div className="space-y-3">
                                                <h4 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
                                                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f2ece4] text-zinc-600 font-bold text-xs bg-[#ece6dc]">1</span>
                                                  Phase 1: Planning
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                  <div className="p-3 bg-zinc-50 rounded-lg border border-[#d8d0c8] dark:bg-zinc-900 border-[#d8d0c8]">
                                                    <div className="flex items-center gap-2 font-bold text-zinc-600 mb-1">
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
                                                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#fbe8d8] text-[#c2652a] font-bold text-xs bg-[#fbe8d8]">2</span>
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
                                                  <div className="p-3 bg-[#f2ece4] rounded-lg border border-[#d8d0c8] bg-[#ece6dc] border-[#d8d0c8]">
                                                    <div className="flex items-center gap-2 font-bold text-zinc-700 mb-1">
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
                                              <p className="text-sm text-zinc-600">Avoid Milestones that are too small (micro-management) or too big (vague dreams).</p>
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
                                              <h4 className="font-bold flex items-center gap-2 text-[#c2652a]">
                                                <Milestone className="h-4 w-4" /> 2. The Hierarchy of Value
                                              </h4>
                                              <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg border border-dashed border-[#d8d0c8]/40 text-sm space-y-2">
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
                                                <h4 className="font-bold flex items-center gap-2 text-zinc-900">
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
                                              <p className="text-sm text-zinc-600 mb-2">Answer: "If we cancel this, what business value do we lose?"</p>
                                              <div className="grid grid-cols-1 gap-2 text-sm">
                                                <div className="group flex items-start gap-2 p-2 rounded hover:bg-zinc-50 dark:hover:bg-zinc-900">
                                                  <span className="text-red-500 font-bold">Weak:</span>
                                                  <span className="text-zinc-500">"Upgrade office software."</span>
                                                </div>
                                                <div className="group flex items-start gap-2 p-2 rounded bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800">
                                                  <span className="text-emerald-600 font-bold">Strong:</span>
                                                  <span className="text-zinc-700">"System Upgrade: Update internal software to fix security gaps and reduce crash rates by 20%."</span>
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
                                  className="bg-[#3a302a] hover:bg-[#c2652a] text-white rounded-2xl font-bold px-6 h-12 shadow-xl shadow-[#d8d0c8]/50  group transition-all duration-300"
                                >
                                  <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                                  Add Milestone
                                </Button>
                              </div>

                              {milestones.length === 0 ? (
                                <div className="text-center py-24 border-2 border-dashed border-[#d8d0c8] dark:border-slate-800 rounded-[2.5rem] bg-[#f6f0e8]/50 dark:bg-[#3a302a]/20 flex flex-col items-center gap-6 group">
                                  <div className="h-20 w-20 rounded-3xl bg-white dark:bg-[#3a302a] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500 border border-slate-100 dark:border-slate-800">
                                    <Milestone className="h-10 w-10 text-[#d8d0c8] group-hover:text-[#c2652a] transition-colors" />
                                  </div>
                                  <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-[#3a302a] tracking-tight">No Strategic Gates</h3>
                                    <p className="text-[#605850] font-medium max-w-sm mx-auto">Establish multi-phase checkpoints to orchestrate complex mission delivery.</p>
                                  </div>
                                  <Button
                                    onClick={addMilestone}
                                    className="bg-[#c2652a] hover:bg-[#c2652a] text-white rounded-2xl font-bold px-8 shadow-lg shadow-[#f0a878]/30 "
                                  >
                                    Create First Milestone
                                  </Button>
                                </div>
                              ) : (
                                <DragDropContext onDragEnd={onPhaseDragEnd}>
                                  <div className="space-y-8">
                                    {milestones.map((milestone) => (
                                      <Card key={milestone.id} className="border-0 rounded-[2.5rem] bg-white/40 dark:bg-slate-950/40 backdrop-blur-md shadow-sm border border-[#d8d0c8]/40 dark:border-slate-800/50 overflow-hidden transition-all duration-300 hover:shadow-xl">
                                        <CardHeader className="pb-8 pt-8 px-8 border-b border-slate-100 dark:border-slate-800/50 bg-white/60 dark:bg-[#3a302a]/60">
                                          <div className="flex items-start justify-between gap-6">
                                            <div className="space-y-6 flex-1">
                                              {/* Milestone Header Row */}
                                              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                                                <div className="xl:col-span-2 space-y-3">
                                                  <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-lg bg-[#fbe8d8] flex items-center justify-center">
                                                      <Target className="h-3.5 w-3.5 text-[#c2652a]" />
                                                    </div>
                                                    <label className="text-[10px] font-black text-[#9a9088] uppercase tracking-[0.2em]">Strategic Objective</label>
                                                  </div>
                                                  <Input
                                                    value={milestone.name}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateMilestone(milestone.id, 'name', e.target.value)}
                                                    className="text-xl font-black tracking-tight h-14 bg-white dark:bg-[#3a302a] border-2 border-slate-100 dark:border-slate-800 focus-visible:ring-4 focus-visible:ring-[#c2652a]/10 focus-visible:border-[#c2652a] rounded-2xl px-6 text-[#3a302a] placeholder:text-[#d8d0c8] transition-all shadow-sm"
                                                    placeholder="OSDK 5.3.0 Release Authorization"
                                                  />
                                                </div>
                                                <div className="space-y-3">
                                                  <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-lg bg-[#fbe8d8] flex items-center justify-center">
                                                      <CalendarIcon className="h-3.5 w-3.5 text-[#c2652a]" />
                                                    </div>
                                                    <label className="text-[10px] font-black text-[#9a9088] uppercase tracking-[0.2em]">Temporal Window</label>
                                                  </div>
                                                  <div className="flex gap-2">
                                                    <Popover>
                                                      <PopoverTrigger asChild>
                                                        <Button variant="outline" className={cn("w-full justify-start text-left font-bold h-14 border-0 shadow-lg rounded-2xl bg-white dark:bg-[#3a302a] px-4 transition-all hover:bg-[#f6f0e8]", !milestone.startDate && "text-[#9a9088]")}>
                                                          {milestone.startDate ? format(milestone.startDate, "MM/dd") : <span>Launch</span>}
                                                        </Button>
                                                      </PopoverTrigger>
                                                      <PopoverContent className="w-auto p-0 border-0 shadow-2xl rounded-3xl overflow-hidden" align="start">
                                                        <Calendar mode="single" selected={milestone.startDate} onSelect={(date: Date | undefined) => updateMilestone(milestone.id, 'startDate', date)} initialFocus />
                                                      </PopoverContent>
                                                    </Popover>
                                                    <Popover>
                                                      <PopoverTrigger asChild>
                                                        <Button variant="outline" className={cn("w-full justify-start text-left font-bold h-14 border-0 shadow-lg rounded-2xl bg-white dark:bg-[#3a302a] px-4 transition-all hover:bg-[#f6f0e8]", !milestone.endDate && "text-[#9a9088]")}>
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
                                                    <div className="h-6 w-6 rounded-lg bg-[#fbe8d8] flex items-center justify-center">
                                                      <Activity className="h-3.5 w-3.5 text-[#c2652a]" />
                                                    </div>
                                                    <label className="text-[10px] font-black text-[#9a9088] uppercase tracking-[0.2em]">Gate Status</label>
                                                  </div>
                                                  <Select
                                                    value={milestone.status}
                                                    onValueChange={(val: 'planning' | 'active' | 'completed' | 'on-hold') => updateMilestone(milestone.id, 'status', val)}
                                                  >
                                                    <SelectTrigger className={cn(
                                                      "h-14 border-0 shadow-lg transition-all duration-300 rounded-2xl font-bold px-4",
                                                      milestone.status === 'planning' ? "bg-[#f2ece4] text-[#605850]" :
                                                        milestone.status === 'active' ? "bg-[#c2652a] text-white shadow-[#f0a878]/20" :
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
                                                    <div className="h-6 w-6 rounded-lg bg-[#fbe8d8] flex items-center justify-center">
                                                      <FileText className="h-3.5 w-3.5 text-[#c2652a]" />
                                                    </div>
                                                    <label className="text-[10px] font-black text-[#9a9088] uppercase tracking-[0.2em]">Deployment Intelligence</label>
                                                  </div>
                                                  <Textarea
                                                    value={milestone.description}
                                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                                                      updateMilestone(milestone.id, 'description', e.target.value);
                                                      e.target.style.height = 'auto';
                                                      e.target.style.height = `${e.target.scrollHeight}px`;
                                                    }}
                                                    placeholder="Define the critical success factors for this milestone..."
                                                    className="min-h-[100px] text-sm font-medium resize-none overflow-hidden bg-white dark:bg-[#3a302a] border-2 border-slate-100 dark:border-slate-800 focus-visible:ring-4 focus-visible:ring-[#c2652a]/10 focus-visible:border-[#c2652a] rounded-[1.5rem] p-4 transition-all shadow-sm placeholder:text-[#d8d0c8]"
                                                  />
                                                </div>
                                              )}
                                            </div>
                                            <div className="flex flex-col gap-2 pt-8">
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => updateMilestone(milestone.id, 'isExpanded', !milestone.isExpanded)}
                                                className="h-12 w-12 rounded-2xl bg-white dark:bg-[#3a302a] shadow-sm hover:shadow-lg transition-all text-[#9a9088] hover:text-[#c2652a]"
                                              >
                                                <ChevronDown className={cn("h-6 w-6 transition-transform duration-500", milestone.isExpanded ? "rotate-180" : "")} />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-12 w-12 rounded-2xl bg-white dark:bg-[#3a302a] shadow-sm hover:shadow-lg transition-all text-[#9a9088] hover:text-[#8c3c3c]"
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

                                            <CardContent className="bg-[#f6f0e8]/30 dark:bg-[#3a302a]/10 pt-10 pb-10 px-8">
                                              <div className="space-y-6">
                                                <div className="flex items-center justify-between px-4">
                                                  <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-white dark:bg-[#3a302a] shadow-sm flex items-center justify-center border border-slate-100 dark:border-slate-800">
                                                      <Activity className="h-5 w-5 text-[#c2652a]" />
                                                    </div>
                                                    <h4 className="text-lg font-black text-[#3a302a] tracking-tight">Mission Phases</h4>
                                                  </div>
                                                  <Button
                                                    onClick={() => addPhase(milestone.id)}
                                                    size="sm"
                                                    className="bg-[#fbe8d8] hover:bg-[#fbe8d8] text-[#8a4518] font-bold rounded-xl px-4 border border-[#f0a878]/40 bg-[#fbe8d8] border-[#f0a878]/40"
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
                                                                snapshot.isDragging ? "shadow-2xl ring-4 ring-[#c2652a]/10 rotate-1 z-50 scale-[1.02] bg-white" : "bg-white/40 dark:bg-slate-950/40 backdrop-blur-sm border border-slate-100 dark:border-slate-800/50 hover:shadow-xl hover:bg-white dark:hover:bg-[#3a302a]",
                                                                phase.status === 'completed' && "border-emerald-200/50 bg-emerald-50/20"
                                                              )}
                                                            >
                                                              <div {...provided.dragHandleProps} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[#d8d0c8] hover:text-[#c2652a] cursor-grab active:cursor-grabbing">
                                                                <GripVertical className="h-5 w-5" />
                                                              </div>

                                                              {/* Phase Name */}
                                                              <div className="flex-1 min-w-[200px] pl-6">
                                                                <Input
                                                                  value={phase.name}
                                                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePhase(milestone.id, phase.id, 'name', e.target.value)}
                                                                  className="h-12 text-base font-bold tracking-tight bg-white dark:bg-[#3a302a] border-2 border-slate-100 dark:border-slate-800 focus-visible:ring-4 focus-visible:ring-[#c2652a]/10 focus-visible:border-[#c2652a] rounded-2xl px-4 text-[#3a302a] placeholder:text-[#d8d0c8] transition-all shadow-sm"
                                                                  placeholder="Phase Authorization (e.g. UX Design)"
                                                                />
                                                              </div>

                                                              {/* PIC */}
                                                              <div className="w-full xl:w-56">
                                                                <Select value={phase.pic} onValueChange={(val: any) => updatePhase(milestone.id, phase.id, 'pic', val)}>
                                                                  <SelectTrigger className="h-12 border-0 bg-white/50 dark:bg-[#3a302a]/50 shadow-sm hover:shadow-md rounded-2xl px-4 transition-all">
                                                                    <div className="flex items-center gap-3">
                                                                      <Avatar className="h-6 w-6 ring-2 ring-[#fbe8d8]">
                                                                        <AvatarFallback className="bg-[#fbe8d8] text-[#c2652a] text-[10px] font-black">{phase.pic ? phase.pic.substring(0, 2).toUpperCase() : '??'}</AvatarFallback>
                                                                      </Avatar>
                                                                      <span className="text-sm font-bold text-[#3a302a] truncate">{phase.pic || 'Assign Intelligence'}</span>
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
                                                                    <Button variant="outline" className="h-12 border-0 bg-white/50 dark:bg-[#3a302a]/50 shadow-sm hover:shadow-md rounded-2xl px-4 text-sm font-bold text-[#605850] hover:text-[#c2652a] transition-all">
                                                                      {phase.startDate ? format(phase.startDate, "MM/dd") : "Launch"}
                                                                    </Button>
                                                                  </PopoverTrigger>
                                                                  <PopoverContent className="w-auto p-0 border-0 shadow-2xl rounded-3xl" align="start"><Calendar mode="single" selected={phase.startDate} onSelect={(d: any) => updatePhase(milestone.id, phase.id, 'startDate', d)} initialFocus /></PopoverContent>
                                                                </Popover>
                                                                <span className="text-slate-200 font-black">/</span>
                                                                <Popover>
                                                                  <PopoverTrigger asChild>
                                                                    <Button variant="outline" className="h-12 border-0 bg-white/50 dark:bg-[#3a302a]/50 shadow-sm hover:shadow-md rounded-2xl px-4 text-sm font-bold text-[#605850] hover:text-[#c2652a] transition-all">
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
                                                                          "bg-[#f2ece4] text-[#9a9088]"
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
                                                                  placeholder="Add deployment context or notes..."
                                                                  className="h-12 text-sm font-medium bg-white dark:bg-[#3a302a] border-2 border-slate-100 dark:border-slate-800 focus-visible:ring-4 focus-visible:ring-[#c2652a]/10 focus-visible:border-[#c2652a]/30 rounded-2xl px-6 transition-all shadow-sm placeholder:text-[#d8d0c8]"
                                                                />
                                                              </div>

                                                              <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-12 w-12 rounded-2xl bg-white dark:bg-[#3a302a] text-[#d8d0c8] hover:text-[#8c3c3c] shadow-sm hover:shadow-lg transition-all opacity-0 group-hover:opacity-100"
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
                              <Card className="border-none shadow-xl bg-white/50 bg-[#f2ece4]/50 backdrop-blur-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                                <CardHeader className="border-b border-[#d8d0c8]/30/50 pb-6 bg-white/50 bg-[#f2ece4]/50">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 flex items-center justify-center border border-violet-500/20 shadow-sm">
                                        <Presentation className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                                      </div>
                                      <div>
                                        <CardTitle className="text-lg font-bold text-zinc-900">Sprint Demo</CardTitle>
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
                                    <Card key={item.id} className="border border-[#d8d0c8]/40 shadow-sm overflow-hidden">
                                      <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
                                      <CardHeader className="pb-4 bg-zinc-50/50 dark:bg-zinc-900/30">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400 font-bold text-sm">
                                              {index + 1}
                                            </div>
                                            <CardTitle className="text-base font-semibold text-zinc-900">
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
                                      <CardContent className="p-0">
                                        <Tabs defaultValue="core" className="w-full">
                                          <TabsList className="grid w-full grid-cols-3 bg-zinc-50 bg-[#f2ece4]/50 p-1 rounded-none border-b border-[#d8d0c8]/30 h-12">
                                            <TabsTrigger value="core" className="rounded-md font-bold text-xs h-full data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950 data-[state=active]:shadow-sm data-[state=active]:text-violet-600">Core Info</TabsTrigger>
                                            <TabsTrigger value="schedule" className="rounded-md font-bold text-xs h-full data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950 data-[state=active]:shadow-sm data-[state=active]:text-violet-600">Schedule</TabsTrigger>
                                            <TabsTrigger value="notes" className="rounded-md font-bold text-xs h-full data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950 data-[state=active]:shadow-sm data-[state=active]:text-violet-600">Context & Notes</TabsTrigger>
                                          </TabsList>

                                          <div className="p-6">
                                            <TabsContent value="core" className="mt-0 space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
                                              <div className="grid gap-6 md:grid-cols-2">
                                                <div className="space-y-3">
                                                  <label className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                                    <Presentation className="h-3.5 w-3.5" />
                                                    Demo Topic
                                                  </label>
                                                  <Input
                                                    placeholder="Define the core mission or feature..."
                                                    value={item.topic}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDemoItem(item.id, 'topic', e.target.value)}
                                                    className="h-12 bg-zinc-50 bg-[#f2ece4]/50 border-0 focus-visible:ring-2 focus-visible:ring-violet-500/20 rounded-xl font-medium"
                                                  />
                                                </div>
                                                <div className="space-y-3">
                                                  <label className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                                    <Users className="h-3.5 w-3.5" />
                                                    Presenter / PIC
                                                  </label>
                                                  <Input
                                                    placeholder="Assigned mission owner..."
                                                    value={item.presenter}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDemoItem(item.id, 'presenter', e.target.value)}
                                                    className="h-12 bg-zinc-50 bg-[#f2ece4]/50 border-0 focus-visible:ring-2 focus-visible:ring-violet-500/20 rounded-xl font-medium"
                                                  />
                                                </div>
                                              </div>

                                              <div className="grid gap-6 md:grid-cols-2">
                                                <div className="space-y-3">
                                                  <label className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                                    <Activity className="h-3.5 w-3.5" />
                                                    Execution Status
                                                  </label>
                                                  <Select
                                                    value={item.status}
                                                    onValueChange={(value: string) => updateDemoItem(item.id, 'status', value)}
                                                  >
                                                    <SelectTrigger className="h-12 bg-zinc-50 bg-[#f2ece4]/50 border-0 focus:ring-2 focus:ring-violet-500/20 rounded-xl font-bold">
                                                      <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl border-[#d8d0c8]/40 shadow-2xl">
                                                      <SelectItem value="scheduled" className="focus:bg-blue-50 dark:focus:bg-blue-900/20 rounded-lg">
                                                        <div className="flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400">
                                                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                                                          Scheduled
                                                        </div>
                                                      </SelectItem>
                                                      <SelectItem value="in_progress" className="focus:bg-amber-50 dark:focus:bg-amber-900/20 rounded-lg">
                                                        <div className="flex items-center gap-2 font-bold text-[#c2652a]">
                                                          <div className="h-2 w-2 rounded-full bg-amber-500" />
                                                          In Progress
                                                        </div>
                                                      </SelectItem>
                                                      <SelectItem value="completed" className="focus:bg-emerald-50 dark:focus:bg-emerald-900/20 rounded-lg">
                                                        <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
                                                          <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                                          Completed
                                                        </div>
                                                      </SelectItem>
                                                      <SelectItem value="cancelled" className="focus:bg-red-50 dark:focus:bg-red-900/20 rounded-lg">
                                                        <div className="flex items-center gap-2 font-bold text-red-600 dark:text-red-400">
                                                          <div className="h-2 w-2 rounded-full bg-red-500" />
                                                          Cancelled
                                                        </div>
                                                      </SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                                </div>
                                                <div className="space-y-3">
                                                  <label className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                                    <Zap className="h-3.5 w-3.5" />
                                                    Duration
                                                  </label>
                                                  <Select
                                                    value={item.duration}
                                                    onValueChange={(value: string) => updateDemoItem(item.id, 'duration', value)}
                                                  >
                                                    <SelectTrigger className="h-12 bg-zinc-50 bg-[#f2ece4]/50 border-0 focus:ring-2 focus:ring-violet-500/20 rounded-xl font-bold">
                                                      <SelectValue placeholder="Select duration" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl border-[#d8d0c8]/40 shadow-2xl">
                                                      <SelectItem value="15" className="rounded-lg font-bold">15 minutes</SelectItem>
                                                      <SelectItem value="30" className="rounded-lg font-bold">30 minutes</SelectItem>
                                                      <SelectItem value="45" className="rounded-lg font-bold">45 minutes</SelectItem>
                                                      <SelectItem value="60" className="rounded-lg font-bold">60 minutes</SelectItem>
                                                      <SelectItem value="90" className="rounded-lg font-bold">90 minutes</SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                                </div>
                                              </div>
                                            </TabsContent>

                                            <TabsContent value="schedule" className="mt-0 space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
                                              <div className="grid gap-6 md:grid-cols-2">
                                                <div className="space-y-3">
                                                  <label className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                                    <CalendarIcon className="h-3.5 w-3.5" />
                                                    Date Release
                                                  </label>
                                                  <Popover>
                                                    <PopoverTrigger asChild>
                                                      <Button
                                                        variant="outline"
                                                        className={cn(
                                                          "w-full h-12 justify-start text-left font-bold bg-zinc-50 bg-[#f2ece4]/50 border-0 rounded-xl focus:ring-2 focus:ring-violet-500/20 transition-all",
                                                          !item.dueDate && "text-muted-foreground"
                                                        )}
                                                      >
                                                        <CalendarIcon className="mr-3 h-4 w-4 text-violet-500" />
                                                        {item.dueDate ? format(item.dueDate, "PPP") : "Select Launch Date"}
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
                                                <div className="space-y-3">
                                                  <label className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                                    <Activity className="h-3.5 w-3.5" />
                                                    Time Slot
                                                  </label>
                                                  <Input
                                                    type="time"
                                                    value={item.dueTime}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDemoItem(item.id, 'dueTime', e.target.value)}
                                                    className="h-12 bg-zinc-50 bg-[#f2ece4]/50 border-0 focus-visible:ring-2 focus-visible:ring-violet-500/20 rounded-xl font-black"
                                                  />
                                                </div>
                                              </div>
                                            </TabsContent>

                                            <TabsContent value="notes" className="mt-0 space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
                                              <div className="space-y-3">
                                                <label className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                                  <Users className="h-3.5 w-3.5" />
                                                  Strategic Audience / Attendees
                                                </label>
                                                <Input
                                                  placeholder="e.g., Tactical Leadership, Stakeholders..."
                                                  value={item.attendees}
                                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDemoItem(item.id, 'attendees', e.target.value)}
                                                  className="h-12 bg-zinc-50 bg-[#f2ece4]/50 border-0 focus-visible:ring-2 focus-visible:ring-violet-500/20 rounded-xl font-medium"
                                                />
                                              </div>
                                              <div className="space-y-3">
                                                <label className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                                  <FileText className="h-3.5 w-3.5" />
                                                  Notes & Mission Parameters
                                                </label>
                                                <Textarea
                                                  placeholder="Strategic overview of the demonstration sequence..."
                                                  value={item.description}
                                                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateDemoItem(item.id, 'description', e.target.value)}
                                                  className="min-h-[120px] bg-zinc-50 bg-[#f2ece4]/50 border-0 focus-visible:ring-2 focus-visible:ring-violet-500/20 rounded-2xl font-medium resize-none p-4"
                                                />
                                              </div>
                                            </TabsContent>
                                          </div>
                                        </Tabs>
                                      </CardContent>
                                    </Card>
                                  ))}

                                  {/* Empty State */}
                                  {demoItems.length === 0 && (
                                    <div className="flex flex-col items-center justify-center p-12 text-center rounded-lg border-2 border-dashed border-[#d8d0c8]/40 bg-zinc-50/50 dark:bg-zinc-900/20">
                                      <Presentation className="h-12 w-12 text-zinc-300 mb-4" />
                                      <h3 className="text-lg font-semibold text-zinc-900">No demos scheduled</h3>
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
                                            <div className="absolute inset-0 bg-white/30 rounded-2xl blur group-hover:blur-md transition-all" />
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
                                            <div className="absolute inset-0 bg-white/30 rounded-2xl blur group-hover:blur-md transition-all" />
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
                                            <div className="absolute inset-0 bg-white/30 rounded-2xl blur group-hover:blur-md transition-all" />
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
                                            <div className="absolute inset-0 bg-white/30 rounded-2xl blur group-hover:blur-md transition-all" />
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
                                <Card className="border-[#d8d0c8]/40 bg-white dark:bg-zinc-900 shadow-lg hover:shadow-xl transition-shadow">
                                  <CardHeader className="border-b border-[#d8d0c8]/30 pb-4">
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
                                        <div className="text-sm font-medium text-zinc-900">
                                          {date?.from ? format(date.from, 'MMMM dd, yyyy') : 'Not set'}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">End Date</div>
                                        <div className="text-sm font-medium text-zinc-900">
                                          {date?.to ? format(date.to, 'MMMM dd, yyyy') : 'Not set'}
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                {/* Project Priorities Review */}
                                {projects.length > 0 && (
                                  <Card className="border-[#d8d0c8]/40 bg-white dark:bg-zinc-900">
                                    <CardHeader className="border-b border-[#d8d0c8]/30 pb-4">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                            <FileText className="h-4 w-4 text-[#c2652a]" />
                                          </div>
                                          <CardTitle className="text-base font-semibold">Project Priorities</CardTitle>
                                        </div>
                                        <Badge variant="secondary">{projects.length} projects</Badge>
                                      </div>
                                    </CardHeader>
                                    <CardContent className="pt-4">
                                      <div className="space-y-2">
                                        {projects.map((project, index) => (
                                          <div key={project.id} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 bg-[#f2ece4]/50 border border-[#d8d0c8]/40">
                                            <div className="h-8 w-8 rounded-lg bg-[#f2ece4] bg-[#ece6dc] flex items-center justify-center text-xs font-bold text-zinc-600">
                                              {index + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <div className="text-sm font-medium text-zinc-900 truncate">
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
                                  <Card className="border-[#d8d0c8]/40 bg-white dark:bg-zinc-900">
                                    <CardHeader className="border-b border-[#d8d0c8]/30 pb-4">
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
                                          <div key={platform.id} className="p-4 rounded-lg bg-zinc-50 bg-[#f2ece4]/50 border border-[#d8d0c8]/40">
                                            <div className="flex items-center justify-between mb-3">
                                              <div className="font-medium text-zinc-900">{platform.name || 'Untitled Platform'}</div>
                                              <Badge variant="outline">{platform.members.length} members</Badge>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                              <div>
                                                <div className="text-muted-foreground">Story Points</div>
                                                <div className="font-semibold text-zinc-900 mt-1">{platform.totalStoryPoints}</div>
                                              </div>
                                              <div>
                                                <div className="text-muted-foreground">Target Velocity</div>
                                                <div className="font-semibold text-zinc-900 mt-1">{platform.targetVelocity}</div>
                                              </div>
                                              <div>
                                                <div className="text-muted-foreground">Improvement</div>
                                                <div className="font-semibold text-zinc-900 mt-1">{platform.targetImprovement}%</div>
                                              </div>
                                              <div>
                                                <div className="text-muted-foreground">Holidays</div>
                                                <div className="font-semibold text-zinc-900 mt-1">
                                                  {platform.members.reduce((total, member) => {
                                                    const details = platform.developerLeaves.find(d => d.name === member);
                                                    const cluster = regionalClusters.find(rc => rc.id === details?.country || (rc.name || rc.id) === details?.country || rc.countryCode === details?.country);
                                                    return total + (cluster ? cluster.holidays.reduce((s, h) => s + h.days, 0) : 0);
                                                  }, 0)} days
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
                                  <Card className="border-[#d8d0c8]/40 bg-white dark:bg-zinc-900">
                                    <CardHeader className="border-b border-[#d8d0c8]/30 pb-4">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <div className="h-8 w-8 rounded-lg bg-[#fbe8d8] bg-[#fbe8d8]/30 flex items-center justify-center">
                                            <Target className="h-4 w-4 text-[#c2652a]" />
                                          </div>
                                          <CardTitle className="text-base font-semibold">Sprint Goals</CardTitle>
                                        </div>
                                        <Badge variant="secondary">{sprintGoals.length} goals</Badge>
                                      </div>
                                    </CardHeader>
                                    <CardContent className="pt-4">
                                      <div className="space-y-2">
                                        {sprintGoals.map((goal, index) => (
                                          <div key={goal.id} className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 bg-[#f2ece4]/50 border border-[#d8d0c8]/40">
                                            <div className="h-7 w-7 rounded-full bg-[#fbe8d8] bg-[#fbe8d8]/30 flex items-center justify-center text-xs font-bold text-[#c2652a] shrink-0 mt-0.5">
                                              {index + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <div className="text-sm font-medium text-zinc-900">{goal.description || 'Untitled Goal'}</div>
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
                                  <Card className="border-[#d8d0c8]/40 bg-white dark:bg-zinc-900">
                                    <CardHeader className="border-b border-[#d8d0c8]/30 pb-4">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                            <Milestone className="h-4 w-4 text-[#c2652a]" />
                                          </div>
                                          <CardTitle className="text-base font-semibold">Milestones</CardTitle>
                                        </div>
                                        <Badge variant="secondary">{milestones.length} milestones</Badge>
                                      </div>
                                    </CardHeader>
                                    <CardContent className="pt-4">
                                      <div className="space-y-3">
                                        {milestones.map((milestone) => (
                                          <div key={milestone.id} className="p-4 rounded-lg bg-zinc-50 bg-[#f2ece4]/50 border border-[#d8d0c8]/40">
                                            <div className="flex items-start justify-between mb-3">
                                              <div className="flex-1">
                                                <div className="font-medium text-zinc-900 mb-1">{milestone.name}</div>
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
                                  <Card className="border-[#d8d0c8]/40 bg-white dark:bg-zinc-900">
                                    <CardHeader className="border-b border-[#d8d0c8]/30 pb-4">
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
                                          <div key={demo.id} className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 bg-[#f2ece4]/50 border border-[#d8d0c8]/40">
                                            <div className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                                              <Presentation className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <div className="font-medium text-zinc-900 mb-1">{demo.topic}</div>
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
                                        <h3 className="text-lg font-bold text-zinc-900 mb-2">Ready to Save?</h3>
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
                            <div className="flex flex-col items-center justify-center p-12 text-center rounded-lg border-2 border-dashed border-[#d8d0c8]/40 bg-zinc-50/50 dark:bg-zinc-900/20">
                              <div className="h-12 w-12 rounded-full bg-[#f2ece4] flex items-center justify-center mb-4">
                                <ShieldCheck className="h-6 w-6 text-zinc-400" />
                              </div>
                              <h3 className="text-lg font-semibold text-zinc-900">
                                Security Audit Content
                              </h3>
                              <p className="text-muted-foreground max-w-sm mt-2">
                                This section is for security audit planning tasks. Form fields will be implemented here.
                              </p>
                            </div>
                          )}

                          {activeSection === 'board' && (
                            <div className="animate-in fade-in slide-in-from-bottom-5 duration-700 h-[calc(100vh-250px)]">
                              <SprintBoardClient sprintId={sprintId} sprint={sprint} isEmbedded={true} />
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
            <AlertDialogTitle className="text-2xl font-black text-[#3a302a]">{deleteConfig.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-[#605850] font-medium">
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
