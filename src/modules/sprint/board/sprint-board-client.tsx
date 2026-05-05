'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
    ChevronLeft,
    LogOut,
    Plus,
    MoreVertical,
    Trash2,
    Edit2,
    X,
    GripVertical,
    Loader2,
    Settings,
    Palette,
    Filter,
    SortAsc,
    Eye,
    EyeOff,
    Archive,
    Download,
    Upload,
    RefreshCw,
    Users,
    Tag,
    Calendar,
    ChevronRight,
    PanelRightClose,
    PanelRightOpen,
    AlertCircle,
    Sparkles,
    MessageSquare,
    History,
    CheckCircle2,
    Bookmark,
    ChevronDown,
    Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { createClient } from '@/auth/supabase/client';
import { Logo } from '@/components/layout/logo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import type { Sprint } from '@/modules/dashboard/create-sprint-dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/utils/cn';
import type { Story as DBStory } from '@/types/story';
import { getStoriesBySprintId, createStory, updateStory, moveStory, deleteStory } from '@/backend/actions/stories.actions';
import { getColumnsBySprintId, initializeDefaultColumns, createColumn, updateColumn, deleteColumn } from '@/backend/actions/columns.actions';
import { getCapacitySwapRecommendationAction } from '@/backend/actions/ai.actions';

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
                <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-white/10">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={user?.photoURL ?? ''} alt={user?.displayName ?? ''} />
                        <AvatarFallback className="bg-white/20 text-white">{userInitial}</AvatarFallback>
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

type Story = {
    id: string;
    title: string;
    description: string;
    storyPoints?: number;
    completedStoryPoints?: number;
    assignee?: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status?: 'todo' | 'in_progress' | 'in_review' | 'done' | 'blocked';
    tags?: string[];
    due_date?: string;
    subtasks?: { id: string, title: string, is_completed: boolean, note?: string }[];
    comments?: { id: string, content: string, user_name: string, created_at: string }[];
    activity_log?: { id: string, type: string, user_name: string, content: string, created_at: string }[];
};

type Column = {
    id: string;
    title: string;
    gradient: string;
    stories: Story[];
};

type ColumnTheme = {
    gradient: string;
    bgColor: string;
    cardBg: string;
};

const columnThemes: Record<string, ColumnTheme> = {
    'slate': {
        gradient: 'from-slate-600 to-slate-700',
        bgColor: 'bg-gradient-to-b from-slate-50/80 to-white dark:from-slate-900/20 dark:to-slate-950/10',
        cardBg: 'bg-white dark:bg-zinc-800 shadow-sm border-l-4 border-l-slate-400'
    },
    'blue': {
        gradient: 'from-blue-500 to-blue-600',
        bgColor: 'bg-gradient-to-b from-blue-50/80 to-white dark:from-blue-900/20 dark:to-blue-950/10',
        cardBg: 'bg-white dark:bg-zinc-800 shadow-sm border-l-4 border-l-blue-400'
    },
    'orange': {
        gradient: 'from-orange-500 to-orange-600',
        bgColor: 'bg-gradient-to-b from-orange-50/80 to-white dark:from-orange-900/20 dark:to-orange-950/10',
        cardBg: 'bg-white dark:bg-zinc-800 shadow-sm border-l-4 border-l-orange-400'
    },
    'purple': {
        gradient: 'from-purple-500 to-purple-600',
        bgColor: 'bg-gradient-to-b from-purple-50/80 to-white dark:from-purple-900/20 dark:to-purple-950/10',
        cardBg: 'bg-white dark:bg-zinc-800 shadow-sm border-l-4 border-l-purple-400'
    },
    'green': {
        gradient: 'from-green-500 to-green-600',
        bgColor: 'bg-gradient-to-b from-green-50/80 to-white dark:from-green-900/20 dark:to-green-950/10',
        cardBg: 'bg-white dark:bg-zinc-800 shadow-sm border-l-4 border-l-green-400'
    },
    'pink': {
        gradient: 'from-pink-500 to-pink-600',
        bgColor: 'bg-gradient-to-b from-pink-50/80 to-white dark:from-pink-900/20 dark:to-pink-950/10',
        cardBg: 'bg-white dark:bg-zinc-800 shadow-sm border-l-4 border-l-pink-400'
    },
    'indigo': {
        gradient: 'from-indigo-500 to-indigo-600',
        bgColor: 'bg-gradient-to-b from-indigo-50/80 to-white dark:from-indigo-900/20 dark:to-indigo-950/10',
        cardBg: 'bg-white dark:bg-zinc-800 shadow-sm border-l-4 border-l-indigo-400'
    },
    'teal': {
        gradient: 'from-teal-500 to-teal-600',
        bgColor: 'bg-gradient-to-b from-teal-50/80 to-white dark:from-teal-900/20 dark:to-teal-950/10',
        cardBg: 'bg-white dark:bg-zinc-800 shadow-sm border-l-4 border-l-teal-400'
    },
    'rose': {
        gradient: 'from-rose-500 to-rose-600',
        bgColor: 'bg-gradient-to-b from-rose-50/80 to-white dark:from-rose-900/20 dark:to-rose-950/10',
        cardBg: 'bg-white dark:bg-zinc-800 shadow-sm border-l-4 border-l-rose-400'
    },
    'cyan': {
        gradient: 'from-cyan-500 to-cyan-600',
        bgColor: 'bg-gradient-to-b from-cyan-50/80 to-white dark:from-cyan-900/20 dark:to-cyan-950/10',
        cardBg: 'bg-white dark:bg-zinc-800 shadow-sm border-l-4 border-l-cyan-400'
    }
};

const defaultColumns: Column[] = [
    { id: 'backlog', title: 'Backlog', gradient: 'slate', stories: [] },
    { id: 'todo', title: 'To Do', gradient: 'blue', stories: [] },
    { id: 'in-progress', title: 'In Progress', gradient: 'orange', stories: [] },
    { id: 'review', title: 'In Review', gradient: 'purple', stories: [] },
    { id: 'done', title: 'Done', gradient: 'green', stories: [] }
];

export function SprintBoardClient({ sprint: initialSprint, sprintId, isEmbedded = false }: { sprint?: Sprint & { id: string }, sprintId: string, isEmbedded?: boolean }) {
    const router = useRouter();
    const supabase = createClient();
    const { toast } = useToast();
    const [user, setUser] = React.useState<any>(null);
    const [sprint, setSprint] = React.useState<(Sprint & { id: string }) | undefined>(initialSprint);
    const [isLoadingSprint, setIsLoadingSprint] = React.useState(!initialSprint);

    const [columns, setColumns] = React.useState<Column[]>(defaultColumns);
    const [isLoadingColumns, setIsLoadingColumns] = React.useState(true);
    const [isLoadingStories, setIsLoadingStories] = React.useState(true);
    const [editingColumnId, setEditingColumnId] = React.useState<string | null>(null);
    const [editingColumnTitle, setEditingColumnTitle] = React.useState('');
    const [isAddStoryDialogOpen, setIsAddStoryDialogOpen] = React.useState(false);
    const [selectedColumnId, setSelectedColumnId] = React.useState<string>('');
    const [newStory, setNewStory] = React.useState<Partial<Story>>({
        title: '',
        description: '',
        priority: 'medium',
        storyPoints: 0,
        completedStoryPoints: 0,
        status: 'todo'
    });
    const [isSaving, setIsSaving] = React.useState(false);
    const autoSaveTimerRef = React.useRef<NodeJS.Timeout | null>(null);

    const [isEditStoryDialogOpen, setIsEditStoryDialogOpen] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState<'subtasks' | 'comments' | 'activities'>('subtasks');
    const [editingStory, setEditingStory] = React.useState<Story | null>(null);
    const [draggedStory, setDraggedStory] = React.useState<{ storyId: string; sourceColumnId: string } | null>(null);
    const [dragOverColumnId, setDragOverColumnId] = React.useState<string | null>(null);
    const [dragOverStoryId, setDragOverStoryId] = React.useState<string | null>(null);
    const [dropPosition, setDropPosition] = React.useState<'before' | 'after' | null>(null);
    const [isSidebarExpanded, setIsSidebarExpanded] = React.useState(true);
    const [showCompletedStories, setShowCompletedStories] = React.useState(true);
    const [filterPriority, setFilterPriority] = React.useState<'all' | 'high' | 'medium' | 'low'>('all');
    const [tagInput, setTagInput] = React.useState('');
    const [showTagInput, setShowTagInput] = React.useState(false);

    // Auto-save logic for the Story Detail Drawer
    React.useEffect(() => {
        if (!isEditStoryDialogOpen || !editingStory) return;

        // Debounce save for 1.5 seconds to avoid excessive database writes
        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
        }

        autoSaveTimerRef.current = setTimeout(async () => {
            await handleSaveEditStory();
        }, 1500);

        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
        };
    }, [newStory.title, newStory.description, newStory.status, newStory.assignee, newStory.storyPoints, newStory.due_date, newStory.subtasks, newStory.comments, newStory.tags, isEditStoryDialogOpen]);

    const handleAddSubtask = (title: string) => {
        const newSubtask = {
            id: Math.random().toString(36).substr(2, 9),
            title,
            is_completed: false
        };
        const activity = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'added a subtask',
            user_name: user?.full_name || user?.email || 'User',
            content: title,
            created_at: new Date().toISOString()
        };
        setNewStory(prev => ({
            ...prev,
            subtasks: [...(prev.subtasks || []), newSubtask],
            activity_log: [activity, ...(prev.activity_log || [])]
        }));
    };

    const handleToggleSubtask = (id: string) => {
        setNewStory(prev => {
            const subtask = (prev.subtasks || []).find(s => s.id === id);
            const activity = {
                id: Math.random().toString(36).substr(2, 9),
                type: subtask?.is_completed ? 'uncompleted a subtask' : 'completed a subtask',
                user_name: user?.full_name || user?.email || 'User',
                content: subtask?.title || '',
                created_at: new Date().toISOString()
            };
            return {
                ...prev,
                subtasks: (prev.subtasks || []).map(s => 
                    s.id === id ? { ...s, is_completed: !s.is_completed } : s
                ),
                activity_log: [activity, ...(prev.activity_log || [])]
            };
        });
    };

    const handleAddComment = (text: string) => {
        if (!text.trim()) return;
        const newComment = {
            id: Math.random().toString(36).substr(2, 9),
            content: text,
            user_name: user?.full_name || user?.email || 'User',
            created_at: new Date().toISOString()
        };
        const activity = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'added a comment',
            user_name: user?.full_name || user?.email || 'User',
            content: text,
            created_at: new Date().toISOString()
        };
        setNewStory(prev => ({
            ...prev,
            comments: [...(prev.comments || []), newComment],
            activity_log: [activity, ...(prev.activity_log || [])]
        }));
    };
    const addActivity = (type: string, content: string = '') => {
        const newActivity = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            user_name: user?.full_name || user?.email || 'User',
            content,
            created_at: new Date().toISOString()
        };
        setNewStory(prev => ({
            ...prev,
            activity_log: [newActivity, ...(prev.activity_log || [])]
        }));
    };

    const [sortBy, setSortBy] = React.useState<'none' | 'priority' | 'points' | 'assignee' | 'newest'>('none');
    
    // --- Quiet AI State ---
    const [sprintPlanning, setSprintPlanning] = React.useState<any>(null);
    const [aiRecommendation, setAiRecommendation] = React.useState<{ storyId: string; reason: string } | null>(null);
    const [isQuietAiProcessing, setIsQuietAiProcessing] = React.useState(false);

    React.useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        checkUser();
    }, [supabase]);

    // Fetch columns from database
    React.useEffect(() => {
        async function fetchColumns() {
            if (!sprintId) return;

            setIsLoadingColumns(true);
            try {
                const { data: dbColumns, error } = await getColumnsBySprintId(sprintId);

                if (error) {
                    console.error('Error fetching columns:', error);

                    // If table doesn't exist yet, initialize with default columns
                    if (error.includes('Could not find the table')) {
                        console.log('Table not found, using default columns and initializing...');
                        const defaultCols: Column[] = [
                            { id: 'backlog', title: 'Backlog', gradient: 'slate', stories: [] },
                            { id: 'todo', title: 'To Do', gradient: 'blue', stories: [] },
                            { id: 'in-progress', title: 'In Progress', gradient: 'orange', stories: [] },
                            { id: 'review', title: 'In Review', gradient: 'purple', stories: [] },
                            { id: 'done', title: 'Done', gradient: 'green', stories: [] },
                        ];
                        setColumns(defaultCols);

                        // Try to initialize columns in database (will succeed once table is created)
                        try {
                            await initializeDefaultColumns(sprintId);
                        } catch (initError) {
                            console.log('Could not initialize columns in DB yet:', initError);
                        }
                    } else {
                        toast({
                            title: 'Error loading columns',
                            description: error,
                            variant: 'destructive'
                        });
                    }
                    return;
                }

                if (dbColumns && dbColumns.length > 0) {
                    // Map database columns to component format
                    const mappedColumns: Column[] = dbColumns.map((dbCol: any) => ({
                        id: dbCol.id,
                        title: dbCol.title,
                        gradient: dbCol.gradient,
                        stories: []
                    }));
                    setColumns(mappedColumns);
                } else {
                    // No columns found, initialize default ones
                    console.log('No columns found for sprint, initializing defaults...');
                    const { success } = await initializeDefaultColumns(sprintId);

                    if (success) {
                        // Fetch again after initialization
                        const { data: newColumns } = await getColumnsBySprintId(sprintId);
                        if (newColumns) {
                            const mappedColumns: Column[] = newColumns.map((dbCol: any) => ({
                                id: dbCol.id,
                                title: dbCol.title,
                                gradient: dbCol.gradient,
                                stories: []
                            }));
                            setColumns(mappedColumns);
                        }
                    } else {
                        // Fallback to default columns in memory
                        const defaultCols: Column[] = [
                            { id: 'backlog', title: 'Backlog', gradient: 'slate', stories: [] },
                            { id: 'todo', title: 'To Do', gradient: 'blue', stories: [] },
                            { id: 'in-progress', title: 'In Progress', gradient: 'orange', stories: [] },
                            { id: 'review', title: 'In Review', gradient: 'purple', stories: [] },
                            { id: 'done', title: 'Done', gradient: 'green', stories: [] },
                        ];
                        setColumns(defaultCols);
                    }
                }
            } catch (error) {
                console.error('Error in fetchColumns:', error);
                // Fallback to default columns
                const defaultCols: Column[] = [
                    { id: 'backlog', title: 'Backlog', gradient: 'slate', stories: [] },
                    { id: 'todo', title: 'To Do', gradient: 'blue', stories: [] },
                    { id: 'in-progress', title: 'In Progress', gradient: 'orange', stories: [] },
                    { id: 'review', title: 'In Review', gradient: 'purple', stories: [] },
                    { id: 'done', title: 'Done', gradient: 'green', stories: [] },
                ];
                setColumns(defaultCols);
            } finally {
                setIsLoadingColumns(false);
            }
        }

        fetchColumns();
    }, [sprintId, toast]);

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
                        status: fetchedSprint.status || 'planning',
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
                }

                // Also fetch planning data for capacity
                const { data: planningData } = await supabase
                    .from('sprint_planning')
                    .select('*')
                    .eq('sprint_id', sprintId)
                    .single();
                setSprintPlanning(planningData);

            } catch (error) {
                console.error("Failed to fetch sprint/planning", error);
            } finally {
                setIsLoadingSprint(false);
            }
        }

        if (!initialSprint) {
            fetchSprint();
        }
    }, [sprintId, sprint, initialSprint, supabase]);

    // Fetch stories from database
    const fetchStories = React.useCallback(async () => {
        if (!sprintId || isLoadingColumns) return;

        setIsLoadingStories(true);
        try {
            const { data: stories, error } = await getStoriesBySprintId(sprintId);

            if (error) {
                console.error('Error fetching stories:', error);
                toast({
                    title: 'Error loading stories',
                    description: error,
                    variant: 'destructive'
                });
                return;
            }

            if (stories) {
                // Group stories by column
                const storyMap = new Map<string, Story[]>();

                // Map database stories to component format and group by column
                stories.forEach(dbStory => {
                    const story: Story = {
                        id: dbStory.id,
                        title: dbStory.title,
                        description: dbStory.description || '',
                        storyPoints: dbStory.story_points || undefined,
                        completedStoryPoints: dbStory.completed_story_points || 0,
                        assignee: dbStory.assignee || undefined,
                        priority: dbStory.priority as 'low' | 'medium' | 'high' | 'critical',
                        status: dbStory.status as Story['status'],
                        tags: dbStory.tags || undefined,
                        due_date: dbStory.due_date || undefined,
                        subtasks: dbStory.subtasks || [],
                        comments: dbStory.comments || [],
                        activity_log: dbStory.activity_log || []
                    };

                    const columnStories = storyMap.get(dbStory.column_id) || [];
                    columnStories.push(story);
                    storyMap.set(dbStory.column_id, columnStories);
                });

                // Update columns with fetched stories
                setColumns(prevColumns =>
                    prevColumns.map(col => ({
                        ...col,
                        stories: storyMap.get(col.id) || []
                    }))
                );

                // Quiet AI: Check for capacity overload
                const sprintStories = stories.filter(s => s.column_id !== 'backlog' && s.column_id !== 'done');
                const totalPoints = sprintStories.reduce((sum, s) => sum + (s.story_points || 0), 0);
                
                const capacity = sprintPlanning?.platforms?.reduce((sum: number, p: any) => sum + (p.total_story_points || 0), 0) || 100;

                if (totalPoints > capacity && capacity > 0) {
                  setIsQuietAiProcessing(true);
                  getCapacitySwapRecommendationAction(sprintStories, totalPoints - capacity, capacity)
                    .then(res => {
                      if (res.success && res.recommendation) {
                        setAiRecommendation(res.recommendation);
                      }
                    })
                    .finally(() => setIsQuietAiProcessing(false));
                } else {
                  setAiRecommendation(null);
                }
            }
        } catch (error) {
            console.error('Error in fetchStories:', error);
            toast({
                title: 'Error loading stories',
                description: 'Failed to load stories. Please refresh the page.',
                variant: 'destructive'
            });
        } finally {
            setIsLoadingStories(false);
        }
    }, [sprintId, toast, isLoadingColumns, sprintPlanning]);

    React.useEffect(() => {
        fetchStories();
    }, [fetchStories]);

    React.useEffect(() => {
        const handleRefresh = () => {
            fetchStories();
        };
        window.addEventListener('refresh-board', handleRefresh);
        return () => window.removeEventListener('refresh-board', handleRefresh);
    }, [fetchStories]);

    const handleColumnTitleClick = (columnId: string, currentTitle: string) => {
        setEditingColumnId(columnId);
        setEditingColumnTitle(currentTitle);
    };

    const handleColumnTitleSave = async () => {
        if (editingColumnId && editingColumnTitle.trim()) {
            // Update in database
            const { error } = await updateColumn(editingColumnId, {
                title: editingColumnTitle
            });

            if (error) {
                toast({
                    title: 'Error updating column',
                    description: error,
                    variant: 'destructive'
                });
                return;
            }

            // Update local state
            setColumns(prev => prev.map(col =>
                col.id === editingColumnId ? { ...col, title: editingColumnTitle } : col
            ));

            toast({
                title: 'Column updated',
                description: 'Column title has been saved.'
            });
        }
        setEditingColumnId(null);
        setEditingColumnTitle('');
    };

    const handleAddColumn = async () => {
        if (!sprintId) {
            toast({
                title: 'Error',
                description: 'No sprint ID found.',
                variant: 'destructive'
            });
            return;
        }

        const themeKeys = ['pink', 'indigo', 'teal', 'rose', 'cyan'];
        const randomTheme = themeKeys[Math.floor(Math.random() * themeKeys.length)];
        const columnId = `column-${Date.now()}`;

        // Get next position
        const nextPosition = columns.length;

        // Create in database
        const { data: createdColumn, error } = await createColumn({
            id: columnId,
            sprint_id: sprintId,
            title: 'New Column',
            gradient: randomTheme,
            position: nextPosition
        });

        if (error || !createdColumn) {
            toast({
                title: 'Error creating column',
                description: error || 'Failed to create column.',
                variant: 'destructive'
            });
            return;
        }

        // Add to local state
        const newColumn: Column = {
            id: createdColumn.id,
            title: createdColumn.title,
            gradient: createdColumn.gradient,
            stories: []
        };
        setColumns(prev => [...prev, newColumn]);

        toast({
            title: 'Column created',
            description: 'New column has been added to the board.'
        });
    };

    const handleDeleteColumn = async (columnId: string) => {
        // Check if column has stories
        const column = columns.find(col => col.id === columnId);
        if (column && column.stories.length > 0) {
            toast({
                title: 'Cannot delete column',
                description: 'Please move or delete all stories first.',
                variant: 'destructive'
            });
            return;
        }

        // Delete from database
        const { success, error } = await deleteColumn(columnId);

        if (!success || error) {
            toast({
                title: 'Error deleting column',
                description: error || 'Failed to delete column.',
                variant: 'destructive'
            });
            return;
        }

        // Remove from local state
        setColumns(prev => prev.filter(col => col.id !== columnId));

        toast({
            title: 'Column deleted',
            description: 'The column has been removed from the board.'
        });
    };

    const handleOpenAddStory = (columnId: string) => {
        setEditingStory(null);
        setNewStory({
            title: '',
            description: '',
            priority: 'medium',
            storyPoints: 0,
            completedStoryPoints: 0,
            status: 'todo'
        });
        setSelectedColumnId(columnId);
        setIsAddStoryDialogOpen(true);
    };

    const handleAddStory = async (storyData: Partial<Story>) => {
        if (!storyData.title?.trim()) {
            toast({
                title: 'Error',
                description: 'Please enter a story title.',
                variant: 'destructive'
            });
            return;
        }

        if (!sprintId) {
            toast({
                title: 'Error',
                description: 'No sprint ID found.',
                variant: 'destructive'
            });
            return;
        }

        // Map status to database format
        const statusMap: Record<string, 'todo' | 'in_progress' | 'in_review' | 'done' | 'blocked'> = {
            'todo': 'todo',
            'in_progress': 'in_progress',
            'in_review': 'in_review',
            'done': 'done',
            'blocked': 'blocked'
        };

        const dbStatus = statusMap[newStory.status || 'not-started'] || 'todo';

        // Save to database
        const { data: createdStory, error } = await createStory({
            sprint_id: sprintId,
            title: newStory.title || '',
            description: newStory.description || '',
            story_points: newStory.storyPoints || undefined,
            completed_story_points: newStory.completedStoryPoints || 0,
            assignee: newStory.assignee || undefined,
            priority: (newStory.priority as 'low' | 'medium' | 'high' | 'critical') || 'medium',
            status: dbStatus,
            column_id: selectedColumnId,
            tags: newStory.tags || undefined,
            due_date: newStory.due_date || undefined,
        });

        if (error || !createdStory) {
            toast({
                title: 'Error saving story',
                description: error || 'Failed to save story to database.',
                variant: 'destructive'
            });
            return;
        }

        // Add to local state with real database ID
        const story: Story = {
            id: createdStory.id,
            title: createdStory.title,
            description: createdStory.description || '',
            storyPoints: createdStory.story_points || undefined,
            completedStoryPoints: createdStory.completed_story_points || 0,
            assignee: createdStory.assignee || undefined,
            priority: createdStory.priority as Story['priority'],
            status: createdStory.status as Story['status'],
            tags: createdStory.tags || undefined,
            due_date: createdStory.due_date || undefined,
            subtasks: [],
            comments: [],
            activity_log: []
        };

        setColumns(prev => prev.map(col =>
            col.id === selectedColumnId
                ? { ...col, stories: [...col.stories, story] }
                : col
        ));

        setIsAddStoryDialogOpen(false);
        setNewStory({
            title: '',
            description: '',
            priority: 'medium',
            storyPoints: 0,
            status: 'todo'
        });

        toast({
            title: 'Story saved',
            description: 'Your story has been saved to the database.'
        });
    };

    const handleEditStory = (story: Story) => {
        setEditingStory(story);
        setNewStory({
            title: story.title,
            description: story.description,
            storyPoints: story.storyPoints,
            completedStoryPoints: story.completedStoryPoints || 0,
            assignee: story.assignee,
            priority: story.priority,
            status: story.status,
            tags: story.tags,
            due_date: story.due_date,
            subtasks: story.subtasks || [],
            comments: story.comments || [],
            activity_log: story.activity_log || []
        });
        setIsEditStoryDialogOpen(true);
    };

    const handleSaveEditStory = async () => {
        if (!editingStory || !newStory.title?.trim()) {
            return; // Don't save if no title or not editing
        }

        setIsSaving(true);
        const { error } = await updateStory(editingStory.id, {
            title: newStory.title,
            description: newStory.description || undefined,
            story_points: newStory.storyPoints,
            completed_story_points: newStory.completedStoryPoints || 0,
            assignee: newStory.assignee,
            priority: newStory.priority as 'low' | 'medium' | 'high' | 'critical',
            status: newStory.status as Story['status'],
            tags: newStory.tags,
            due_date: newStory.due_date,
            subtasks: newStory.subtasks,
            comments: newStory.comments,
            activity_log: newStory.activity_log
        });
        setIsSaving(false);

        if (error) {
            toast({
                title: 'Sync Error',
                description: 'Failed to auto-save changes',
                variant: 'destructive'
            });
            setIsSaving(false);
            return;
        }

        // Map status to column ID
        const statusToColumnMap: Record<string, string> = {
            'todo': 'todo',
            'in_progress': 'in-progress',
            'in_review': 'review',
            'done': 'done',
            'blocked': 'blocked'
        };

        const newColumnId = statusToColumnMap[newStory.status || 'todo'] || 'todo';

        // Find current column of the story
        let currentColumnId = '';
        for (const col of columns) {
            if (col.stories.some(s => s.id === editingStory.id)) {
                currentColumnId = col.id;
                break;
            }
        }

        // Update local state with new values and potentially new column
        const updatedStory = {
            ...editingStory,
            title: newStory.title || editingStory.title,
            description: newStory.description || editingStory.description,
            storyPoints: newStory.storyPoints ?? editingStory.storyPoints,
            completedStoryPoints: newStory.completedStoryPoints ?? editingStory.completedStoryPoints,
            assignee: newStory.assignee ?? editingStory.assignee,
            priority: newStory.priority || editingStory.priority,
            status: newStory.status || editingStory.status,
            tags: newStory.tags ?? editingStory.tags,
            due_date: newStory.due_date ?? editingStory.due_date,
            subtasks: newStory.subtasks,
            comments: newStory.comments,
            activity_log: newStory.activity_log
        };

        // Check if target column exists
        const targetColumnExists = columns.some(col => col.id === newColumnId);

        // Check if column needs to change
        if (currentColumnId !== newColumnId && targetColumnExists) {
            // Move story to new column
            setColumns(prev => prev.map(column => {
                if (column.id === currentColumnId) {
                    // Remove from current column
                    return { ...column, stories: column.stories.filter(s => s.id !== editingStory.id) };
                }
                if (column.id === newColumnId) {
                    // Add to new column
                    return { ...column, stories: [...column.stories, updatedStory] };
                }
                return column;
            }));

            // Update column_id in database
            await updateStory(editingStory.id, { column_id: newColumnId });
        } else {
            // Just update the story in place (column doesn't exist or is the same)
            setColumns(prev => prev.map(column => ({
                ...column,
                stories: column.stories.map(s =>
                    s.id === editingStory.id ? updatedStory : s
                )
            })));
        }


    };

    const handleDeleteStory = async (columnId: string, storyId: string) => {
        // Optimistically remove from UI
        setColumns(prev => prev.map(col =>
            col.id === columnId
                ? { ...col, stories: col.stories.filter(s => s.id !== storyId) }
                : col
        ));

        // Delete from database
        const { success, error } = await deleteStory(storyId);

        if (error || !success) {
            // Revert on error - would need to fetch the story again
            toast({
                title: 'Error deleting story',
                description: error || 'Failed to delete story from database.',
                variant: 'destructive'
            });
            // Refresh the board to restore the story
            window.location.reload();
            return;
        }

        toast({
            title: 'Story deleted',
            description: 'The story has been removed from the database.'
        });
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300';
            case 'critical': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300';
            case 'high': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300';
            case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'low': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300';
            default: return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-700 dark:text-zinc-300';
        }
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'todo': return 'bg-zinc-100 text-zinc-700 border-zinc-300 dark:bg-zinc-700 dark:text-zinc-300';
            case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300';
            case 'in_review': return 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300';
            case 'in_review': return 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300';
            case 'done': return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300';
            case 'blocked': return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300';
            default: return 'bg-zinc-100 text-zinc-700 border-zinc-300 dark:bg-zinc-700 dark:text-zinc-300';
        }
    };

    const getStatusLabel = (status?: string) => {
        switch (status) {
            case 'todo': return 'To Do';
            case 'in_progress': return 'In Progress';
            case 'in_review': return 'In Review';
            case 'in_review': return 'In Review';
            case 'done': return 'Done';
            case 'blocked': return 'Blocked';
            default: return 'To Do';
        }
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, storyId: string, columnId: string) => {
        setDraggedStory({ storyId, sourceColumnId: columnId });
        e.dataTransfer.effectAllowed = 'move';

        // Create a custom drag image
        if (e.currentTarget instanceof HTMLElement) {
            const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
            dragImage.style.position = 'absolute';
            dragImage.style.top = '-1000px';
            dragImage.style.opacity = '0.8';
            dragImage.style.transform = 'rotate(3deg)';
            dragImage.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.3)';
            document.body.appendChild(dragImage);
            e.dataTransfer.setDragImage(dragImage, 0, 0);
            setTimeout(() => document.body.removeChild(dragImage), 0);

            // Add dragging state to the original element
            e.currentTarget.classList.add('opacity-40', 'scale-95');
        }
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.classList.remove('opacity-40', 'scale-95');
        }
        setDraggedStory(null);
        setDragOverColumnId(null);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDragEnter = (columnId: string) => {
        setDragOverColumnId(columnId);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        // Only clear if actually leaving the column (not entering a child)
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;

        if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
            setDragOverColumnId(null);
            setDragOverStoryId(null);
            setDropPosition(null);
        }
    };

    const handleStoryDragOver = (e: React.DragEvent<HTMLDivElement>, storyId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!draggedStory || draggedStory.storyId === storyId) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        const position = e.clientY < midpoint ? 'before' : 'after';

        setDragOverStoryId(storyId);
        setDropPosition(position);
    };

    const handleStoryDragLeave = () => {
        setDragOverStoryId(null);
        setDropPosition(null);
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>, targetColumnId: string, targetStoryId?: string) => {
        e.preventDefault();

        if (!draggedStory) return;

        const { storyId, sourceColumnId } = draggedStory;

        // Find the story being moved
        const sourceColumn = columns.find(col => col.id === sourceColumnId);
        const storyToMove = sourceColumn?.stories.find(s => s.id === storyId);

        if (!storyToMove) return;

        const targetColumn = columns.find(col => col.id === targetColumnId);
        if (!targetColumn) return;

        // Calculate the new position
        let newPosition = 0;

        if (targetStoryId && dropPosition) {
            // Dropping relative to another story
            const targetStoryIndex = targetColumn.stories.findIndex(s => s.id === targetStoryId);
            if (targetStoryIndex !== -1) {
                newPosition = dropPosition === 'before' ? targetStoryIndex : targetStoryIndex + 1;

                // Adjust if moving within same column and dragging down
                if (sourceColumnId === targetColumnId) {
                    const draggedIndex = targetColumn.stories.findIndex(s => s.id === storyId);
                    if (draggedIndex < targetStoryIndex && dropPosition === 'after') {
                        newPosition--;
                    } else if (draggedIndex > targetStoryIndex && dropPosition === 'before') {
                        // position is already correct
                    }
                }
            }
        } else {
            // Dropping at the end of the column
            newPosition = targetColumn.stories.length;
        }

        // Same column reordering
        if (sourceColumnId === targetColumnId) {
            const currentIndex = targetColumn.stories.findIndex(s => s.id === storyId);

            // Don't do anything if dropping in the same position
            if (currentIndex === newPosition || (currentIndex + 1 === newPosition)) {
                setDraggedStory(null);
                setDragOverColumnId(null);
                setDragOverStoryId(null);
                setDropPosition(null);
                return;
            }

            // Reorder within the same column
            const reorderedStories = [...targetColumn.stories];
            const [removed] = reorderedStories.splice(currentIndex, 1);
            reorderedStories.splice(newPosition > currentIndex ? newPosition - 1 : newPosition, 0, removed);

            setColumns(prev => prev.map(col =>
                col.id === targetColumnId
                    ? { ...col, stories: reorderedStories }
                    : col
            ));

            // Persist to database
            const { error } = await moveStory(storyId, {
                column_id: targetColumnId,
                position: newPosition,
                status: storyToMove.status
            });

            if (error) {
                // Revert on error
                setColumns(prev => prev.map(col =>
                    col.id === targetColumnId
                        ? { ...col, stories: targetColumn.stories }
                        : col
                ));
                toast({
                    title: 'Error reordering story',
                    description: error,
                    variant: 'destructive'
                });
            }

            setDraggedStory(null);
            setDragOverColumnId(null);
            setDragOverStoryId(null);
            setDropPosition(null);
            return;
        }

        // Cross-column move
        // Map column ID to status
        const statusMap: Record<string, 'todo' | 'in_progress' | 'in_review' | 'done' | 'blocked'> = {
            'backlog': 'todo',
            'todo': 'todo',
            'in-progress': 'in_progress',
            'review': 'in_review',
            'done': 'done',
            'blocked': 'blocked'
        };

        const newStatus = statusMap[targetColumnId] || 'todo';

        // Optimistic UI update - show change immediately with updated status
        const updatedStory = { ...storyToMove, status: newStatus };

        setColumns(prev => prev.map(col => {
            if (col.id === sourceColumnId) {
                return { ...col, stories: col.stories.filter(s => s.id !== storyId) };
            }
            if (col.id === targetColumnId) {
                // Remove the story if it already exists (to prevent duplicates), then add it at the new position
                const filteredStories = col.stories.filter(s => s.id !== storyId);
                const newStories = [...filteredStories];
                newStories.splice(newPosition, 0, updatedStory);
                return { ...col, stories: newStories };
            }
            return col;
        }));

        setDraggedStory(null);
        setDragOverColumnId(null);
        setDragOverStoryId(null);
        setDropPosition(null);

        // Persist to database
        const { error } = await moveStory(storyId, {
            column_id: targetColumnId,
            position: newPosition,
            status: newStatus
        });

        if (error) {
            // Revert optimistic update on error
            setColumns(prev => prev.map(col => {
                if (col.id === targetColumnId) {
                    return { ...col, stories: col.stories.filter(s => s.id !== storyId) };
                }
                if (col.id === sourceColumnId) {
                    return { ...col, stories: [...col.stories, storyToMove] };
                }
                return col;
            }));

            toast({
                title: 'Error moving story',
                description: error,
                variant: 'destructive'
            });
        } else {
            toast({
                title: 'Story moved',
                description: `Story moved to ${columns.find(col => col.id === targetColumnId)?.title}.`
            });
        }
    };

    const getDueDateColor = (dueDate?: string) => {
        if (!dueDate) return 'text-zinc-600 dark:text-zinc-400';
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);

        if (due.getTime() < today.getTime()) return 'text-red-500 font-bold'; // Overdue
        if (due.getTime() === today.getTime()) return 'text-amber-500 font-bold'; // Today
        return 'text-zinc-600 dark:text-zinc-400';
    };

    const filterAndSortStories = (stories: Story[]) => {
        // First, deduplicate stories by ID to prevent duplicate keys
        const uniqueStories = Array.from(
            new Map(stories.map(story => [story.id, story])).values()
        );

        let filtered = uniqueStories;

        // Filter by completed status
        if (!showCompletedStories) {
            filtered = filtered.filter(s => s.status !== 'done');
        }

        // Filter by priority
        if (filterPriority !== 'all') {
            filtered = filtered.filter(s => s.priority === filterPriority);
        }

        // Sort stories
        if (sortBy !== 'none') {
            filtered = [...filtered].sort((a, b) => {
                if (sortBy === 'priority') {
                    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                }
                if (sortBy === 'points') {
                    return (b.storyPoints || 0) - (a.storyPoints || 0);
                }
                if (sortBy === 'assignee') {
                    return (a.assignee || '').localeCompare(b.assignee || '');
                }
                return 0;
            });
        }

        return filtered;
    };

    const handleExportData = () => {
        const data = columns.map(col => ({
            column: col.title,
            stories: col.stories.map(s => ({
                title: s.title,
                description: s.description,
                points: s.storyPoints,
                assignee: s.assignee,
                priority: s.priority,
                status: s.status
            }))
        }));

        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sprint-${sprintId}-board.json`;
        a.click();
        URL.revokeObjectURL(url);

        toast({
            title: 'Data exported',
            description: 'Board data has been exported successfully.'
        });
    };

    const handleClearBoard = () => {
        if (confirm('Are you sure you want to clear all stories from the board?')) {
            setColumns(prev => prev.map(col => ({ ...col, stories: [] })));
            toast({
                title: 'Board cleared',
                description: 'All stories have been removed from the board.'
            });
        }
    };

    if (isLoadingSprint || isLoadingStories) {
        return (
            <LoadingScreen message={isLoadingSprint ? 'Loading Sprint...' : 'Loading Board...'} />
        );
    }

    if (!sprint) {
        return (
            <div className="flex justify-center items-center h-screen bg-zinc-50 dark:bg-zinc-950">
                <p className="text-lg text-zinc-500">Sprint not found</p>
            </div>
        );
    }

    return (
        <div className={cn("min-h-screen bg-[#f8f5f0] dark:bg-[#09090b] flex flex-col font-manrope", isEmbedded && "min-h-0 bg-transparent")}>
            {!isEmbedded && (
                <header className="h-16 border-b border-[#3a302a]/10 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
                    <div className="h-full px-4 lg:px-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.back()}
                                className="h-9 w-9 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                            >
                                <ChevronLeft className="h-5 w-5" />
                                <span className="sr-only">Back to Sprint</span>
                            </Button>
                            <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800" />
                            <Logo />
                            <div className="hidden md:flex flex-col">
                                <h1 className="text-lg font-eb-garamond font-bold text-[#3a302a] dark:text-white leading-none">
                                    {sprint?.sprintName || 'Sprint Board'}
                                </h1>
                                <p className="text-[10px] uppercase tracking-wider font-bold text-[#3a302a]/60 dark:text-zinc-400">Track Board</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {user && <UserNav user={user} />}
                        </div>
                    </div>
                </header>
            )}

            {/* Main Content with Sidebar */}
            {/* Quiet AI Capacity Prompt */}
            <AnimatePresence>
                {aiRecommendation && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] w-full max-w-lg px-4"
                    >
                        <div className="bg-zinc-900/90 dark:bg-zinc-100/90 backdrop-blur-2xl p-5 rounded-[2rem] border border-white/20 dark:border-zinc-800/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center animate-pulse">
                                    <Sparkles className="h-6 w-6 text-indigo-400 dark:text-indigo-600" />
                                </div>
                                <div>
                                    <div className="text-xs font-black uppercase tracking-widest text-indigo-400 dark:text-indigo-600 mb-1">Sprint Overloaded</div>
                                    <div className="text-sm font-bold text-white dark:text-zinc-900 leading-tight">
                                        Bump <span className="text-indigo-400">"{columns.flatMap(c => c.stories).find(s => s.id === aiRecommendation.storyId)?.title.slice(0, 20)}..."</span> to backlog?
                                    </div>
                                    <div className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 mt-1">{aiRecommendation.reason}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button 
                                    onClick={() => setAiRecommendation(null)}
                                    variant="ghost" 
                                    className="h-10 px-4 rounded-xl text-zinc-400 hover:text-white dark:hover:text-zinc-900"
                                >
                                    Ignore
                                </Button>
                                <Button 
                                    onClick={async () => {
                                        const story = columns.flatMap(c => c.stories).find(s => s.id === aiRecommendation.storyId);
                                        if (story) {
                                            await moveStory(story.id, { column_id: 'backlog', status: 'todo', position: 0 });
                                            setAiRecommendation(null);
                                            router.refresh();
                                        }
                                    }}
                                    className="h-10 px-6 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px]"
                                >
                                    Press Enter
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={cn("flex flex-1 overflow-hidden", isEmbedded && "flex-col")}>
                {/* Sidebar */}
                {!isEmbedded && (
                    <aside className={cn(
                        "border-r border-[#3a302a]/10 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-950/80 backdrop-blur-md transition-all duration-300 flex flex-col",
                        isSidebarExpanded ? "w-64" : "w-16"
                    )}>
                    {/* Sidebar Header */}
                    <div className="flex items-center justify-between p-4 border-b border-[#3a302a]/10 dark:border-zinc-800/50">
                        {isSidebarExpanded && (
                            <h2 className="text-sm font-eb-garamond font-bold text-[#3a302a] dark:text-white uppercase tracking-wider">Customization</h2>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                            className="h-8 w-8 ml-auto"
                        >
                            {isSidebarExpanded ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
                        </Button>
                    </div>

                    {/* Sidebar Content */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {/* Filter Section */}
                        <div className={cn("space-y-1", !isSidebarExpanded && "flex flex-col items-center")}>
                            <div className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg",
                                !isSidebarExpanded && "justify-center"
                            )}>
                                <Filter className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                                {isSidebarExpanded && <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase">Filter</span>}
                            </div>

                            {/* Show/Hide Completed */}
                            <Button
                                variant="ghost"
                                size={isSidebarExpanded ? "sm" : "icon"}
                                onClick={() => setShowCompletedStories(!showCompletedStories)}
                                className={cn(
                                    "w-full justify-start",
                                    !isSidebarExpanded && "justify-center",
                                    showCompletedStories && "bg-primary/10 text-primary hover:bg-primary/20"
                                )}
                                title={isSidebarExpanded ? "" : (showCompletedStories ? "Hide Completed" : "Show Completed")}
                            >
                                {showCompletedStories ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                {isSidebarExpanded && <span className="ml-2 text-sm">{showCompletedStories ? 'Hide' : 'Show'} Completed</span>}
                            </Button>

                            {/* Priority Filters */}
                            {isSidebarExpanded && (
                                <div className="pl-4 space-y-1">
                                    {['all', 'high', 'medium', 'low'].map((priority) => (
                                        <Button
                                            key={priority}
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setFilterPriority(priority as any)}
                                            className={cn(
                                                "w-full justify-start text-xs",
                                                filterPriority === priority && "bg-primary/10 text-primary"
                                            )}
                                        >
                                            <Tag className="h-3 w-3 mr-2" />
                                            {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-2" />

                        {/* Sort Section */}
                        <div className={cn("space-y-1", !isSidebarExpanded && "flex flex-col items-center")}>
                            <div className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg",
                                !isSidebarExpanded && "justify-center"
                            )}>
                                <SortAsc className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                                {isSidebarExpanded && <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase">Sort</span>}
                            </div>

                            {isSidebarExpanded ? (
                                <div className="pl-4 space-y-1">
                                    {[
                                        { value: 'none', label: 'None', icon: X },
                                        { value: 'priority', label: 'By Priority', icon: Tag },
                                        { value: 'points', label: 'By Points', icon: Calendar },
                                        { value: 'assignee', label: 'By Assignee', icon: Users }
                                    ].map((sort) => (
                                        <Button
                                            key={sort.value}
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSortBy(sort.value as any)}
                                            className={cn(
                                                "w-full justify-start text-xs",
                                                sortBy === sort.value && "bg-primary/10 text-primary"
                                            )}
                                        >
                                            <sort.icon className="h-3 w-3 mr-2" />
                                            {sort.label}
                                        </Button>
                                    ))}
                                </div>
                            ) : (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        const sortOptions: Array<'none' | 'priority' | 'points' | 'assignee'> = ['none', 'priority', 'points', 'assignee'];
                                        const currentIndex = sortOptions.indexOf(sortBy);
                                        const nextIndex = (currentIndex + 1) % sortOptions.length;
                                        setSortBy(sortOptions[nextIndex]);
                                    }}
                                    className={cn(sortBy !== 'none' && "bg-primary/10 text-primary")}
                                    title="Toggle Sort"
                                >
                                    <SortAsc className="h-4 w-4" />
                                </Button>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-2" />

                        {/* Actions Section */}
                        <div className={cn("space-y-1", !isSidebarExpanded && "flex flex-col items-center")}>
                            <div className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg",
                                !isSidebarExpanded && "justify-center"
                            )}>
                                <Settings className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                                {isSidebarExpanded && <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase">Actions</span>}
                            </div>

                            {/* Export Data */}
                            <Button
                                variant="ghost"
                                size={isSidebarExpanded ? "sm" : "icon"}
                                onClick={handleExportData}
                                className={cn(
                                    "w-full justify-start",
                                    !isSidebarExpanded && "justify-center"
                                )}
                                title={isSidebarExpanded ? "" : "Export Data"}
                            >
                                <Download className="h-4 w-4" />
                                {isSidebarExpanded && <span className="ml-2 text-sm">Export Data</span>}
                            </Button>

                            {/* Refresh Board */}
                            <Button
                                variant="ghost"
                                size={isSidebarExpanded ? "sm" : "icon"}
                                onClick={() => setColumns(defaultColumns)}
                                className={cn(
                                    "w-full justify-start",
                                    !isSidebarExpanded && "justify-center"
                                )}
                                title={isSidebarExpanded ? "" : "Refresh Board"}
                            >
                                <RefreshCw className="h-4 w-4" />
                                {isSidebarExpanded && <span className="ml-2 text-sm">Refresh Board</span>}
                            </Button>

                            {/* Archive/Clear */}
                            <Button
                                variant="ghost"
                                size={isSidebarExpanded ? "sm" : "icon"}
                                onClick={handleClearBoard}
                                className={cn(
                                    "w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20",
                                    !isSidebarExpanded && "justify-center"
                                )}
                                title={isSidebarExpanded ? "" : "Clear Board"}
                            >
                                <Archive className="h-4 w-4" />
                                {isSidebarExpanded && <span className="ml-2 text-sm">Clear Board</span>}
                            </Button>
                        </div>
                    </div>

                    {/* Sidebar Footer */}
                    {isSidebarExpanded && (
                        <div className="p-4 border-t border-zinc-200/50 dark:border-zinc-800/50">
                            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                                <Palette className="h-3 w-3" />
                                <span>Customize your board</span>
                            </div>
                        </div>
                    )}
                </aside>
            )}

                {/* Kanban Board */}
                <main className={cn("flex-1 overflow-x-auto p-4 lg:p-6", isEmbedded && "p-0")}>
                    {/* Warning Banner for Completed/Archived Sprints */}
                    {(sprint.status === 'completed' || sprint.status === 'archived') && (
                        <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-lg">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-amber-900 dark:text-amber-400">
                                        {sprint.status === 'completed' ? 'Sprint Completed' : 'Sprint Archived'}
                                    </h3>
                                    <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">
                                        {sprint.status === 'completed'
                                            ? 'This sprint has been completed. Story editing is disabled. You can still view the board.'
                                            : 'This sprint has been archived and is read-only. You can view stories but cannot make changes.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={cn("flex gap-3 min-h-[calc(100vh-7rem)]", isEmbedded && "min-h-0 h-full")}>
                        {columns.map((column) => {
                            const theme = columnThemes[column.gradient] || columnThemes['slate'];
                            const filteredStories = filterAndSortStories(column.stories);
                            return (
                                <div key={column.id} className="flex-shrink-0 w-72 flex flex-col">
                                    {/* Column Header */}
                                    <div className={cn(
                                        "relative rounded-t-xl p-3 bg-gradient-to-br shadow-md backdrop-blur-sm",
                                        theme.gradient
                                    )}>
                                        <div className="flex items-center justify-between mb-2">
                                            {editingColumnId === column.id ? (
                                                <Input
                                                    value={editingColumnTitle}
                                                    onChange={(e) => setEditingColumnTitle(e.target.value)}
                                                    onBlur={handleColumnTitleSave}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleColumnTitleSave();
                                                        if (e.key === 'Escape') {
                                                            setEditingColumnId(null);
                                                            setEditingColumnTitle('');
                                                        }
                                                    }}
                                                    autoFocus
                                                    className="h-8 bg-white/20 border-white/30 text-white placeholder:text-white/70 font-bold"
                                                />
                                            ) : (
                                                <button
                                                    onClick={() => handleColumnTitleClick(column.id, column.title)}
                                                    className="text-lg font-eb-garamond font-bold text-white hover:bg-white/10 px-2 py-1 rounded transition-colors flex items-center gap-2"
                                                >
                                                    {column.title}
                                                    <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                                                </button>
                                            )}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleColumnTitleClick(column.id, column.title)}>
                                                        <Edit2 className="mr-2 h-4 w-4" />
                                                        Edit Name
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteColumn(column.id)}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete Column
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                                                {filteredStories.length} {filteredStories.length === 1 ? 'story' : 'stories'}
                                                <span className="mx-1 opacity-50">·</span>
                                                {filteredStories.reduce((sum, s) => sum + (s.storyPoints || 0), 0)} SP
                                            </Badge>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleOpenAddStory(column.id)}
                                                className="h-7 text-white hover:bg-white/20"
                                            >
                                                <Plus className="h-4 w-4 mr-1" />
                                                Add
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Stories List */}
                                    <div
                                        className={cn(
                                            "flex-1 rounded-b-xl p-3 space-y-2 overflow-y-auto border-x border-b border-zinc-200/50 dark:border-zinc-700/50 backdrop-blur-sm transition-all duration-200",
                                            theme.bgColor,
                                            dragOverColumnId === column.id && "ring-2 ring-primary/50 ring-offset-2 bg-primary/5 border-primary/30"
                                        )}
                                        onDragOver={handleDragOver}
                                        onDragEnter={() => handleDragEnter(column.id)}
                                        onDragLeave={handleDragLeave}
                                        onDrop={(e) => handleDrop(e, column.id)}
                                    >
                                        {/* Drop Zone Indicator */}
                                        {dragOverColumnId === column.id && draggedStory && (
                                            <div className="mb-2 p-4 border-2 border-dashed border-primary/50 rounded-lg bg-primary/10 flex items-center justify-center animate-pulse">
                                                <span className="text-xs font-medium text-primary">Drop story here</span>
                                            </div>
                                        )}

                                        {filteredStories.length === 0 ? (
                                            <div className={cn(
                                                "flex flex-col items-center justify-center h-24 text-zinc-400 dark:text-zinc-600 text-xs",
                                                dragOverColumnId === column.id && "text-primary"
                                            )}>
                                                {dragOverColumnId === column.id ? (
                                                    <>
                                                        <GripVertical className="h-6 w-6 mb-1 animate-bounce" />
                                                        <span>Drop here</span>
                                                    </>
                                                ) : (
                                                    <span>{column.stories.length === 0 ? 'No stories yet' : 'No stories match filters'}</span>
                                                )}
                                            </div>
                                        ) : (
                                            filteredStories.map((story, index) => (
                                                <div key={`${column.id}-${story.id}`} className="relative">
                                                    {/* Drop indicator before story */}
                                                    {dragOverStoryId === story.id && dropPosition === 'before' && (
                                                        <div className="h-0.5 bg-primary rounded-full mb-2 animate-pulse shadow-lg shadow-primary/50" />
                                                    )}

                                                    <Card
                                                        draggable
                                                        onDragStart={(e) => handleDragStart(e, story.id, column.id)}
                                                        onDragEnd={handleDragEnd}
                                                        onDragOver={(e) => handleStoryDragOver(e, story.id)}
                                                        onDragLeave={handleStoryDragLeave}
                                                        onDrop={(e) => handleDrop(e, column.id, story.id)}
                                                        onClick={() => handleEditStory(story)}
                                                        style={{
                                                            animationDelay: `${index * 50}ms`
                                                        }}
                                                        className={cn(
                                                            "group relative hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-grab active:cursor-grabbing",
                                                            "hover:scale-[1.02] hover:border-primary/50 hover:ring-1 hover:ring-primary/20",
                                                            "animate-fadeInUp",
                                                            draggedStory?.storyId === story.id && "opacity-40 scale-95 rotate-2",
                                                            dragOverStoryId === story.id && "ring-2 ring-primary/50",
                                                            theme.cardBg
                                                        )}
                                                    >
                                                        {/* Drag Handle */}
                                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-zinc-300 dark:via-zinc-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-60 transition-opacity">
                                                            <GripVertical className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                                                        </div>

                                                        <CardContent className="p-3 pl-7 space-y-2">
                                                            {/* Top Section: Priority and Menu */}
                                                            <div className="flex items-start justify-between gap-2">
                                                                <Badge variant="outline" className={cn("text-xs font-medium", getPriorityColor(story.priority))}>
                                                                    {story.priority.charAt(0).toUpperCase() + story.priority.slice(1)}
                                                                </Badge>
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        >
                                                                            <MoreVertical className="h-3 w-3" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem onClick={() => handleEditStory(story)}>
                                                                            <Edit2 className="mr-2 h-4 w-4" />
                                                                            Edit
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem
                                                                            onClick={() => handleDeleteStory(column.id, story.id)}
                                                                            className="text-red-600"
                                                                        >
                                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                                            Delete
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </div>

                                                            {/* Title */}
                                                            <h4 className="font-semibold text-sm text-zinc-900 dark:text-white leading-snug">
                                                                {story.title}
                                                            </h4>

                                                            {/* Status and Tags Row */}
                                                            <div className="flex items-center flex-wrap gap-1">
                                                                {/* Status Badge */}
                                                                <Badge variant="outline" className={cn("text-xs font-medium", getStatusColor(story.status))}>
                                                                    {getStatusLabel(story.status)}
                                                                </Badge>

                                                                {/* Tags */}
                                                                {story.tags && story.tags.length > 0 && story.tags.map((tag, index) => (
                                                                    <Badge key={index} variant="secondary" className="text-xs">
                                                                        {tag}
                                                                    </Badge>
                                                                ))}
                                                            </div>

                                                            {/* Due Date */}
                                                            {story.due_date && (
                                                                <div className={cn("flex items-center gap-1 text-[10px]", getDueDateColor(story.due_date))}>
                                                                    <Calendar className="h-3 w-3" />
                                                                    <span>Due: {new Date(story.due_date).toLocaleDateString()}</span>
                                                                </div>
                                                            )}

                                                            {/* Progress Bar */}
                                                            {story.storyPoints !== undefined && story.storyPoints > 0 && (
                                                                <div className="space-y-0.5">
                                                                    <div className="flex items-center justify-between text-xs">
                                                                        <span className="text-zinc-600 dark:text-zinc-400 text-xs">Progress</span>
                                                                        <span className="font-medium text-zinc-900 dark:text-white text-xs">
                                                                            {Math.round(((story.completedStoryPoints || 0) / story.storyPoints) * 100)}%
                                                                        </span>
                                                                    </div>
                                                                    <div className="h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                                                        <div
                                                                            className="h-full bg-gradient-to-r from-teal-500 to-teal-600 transition-all duration-300"
                                                                            style={{
                                                                                width: `${Math.min(((story.completedStoryPoints || 0) / story.storyPoints) * 100, 100)}%`
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Bottom Section: Assignee and Story Points */}
                                                            <div className="flex items-center justify-between pt-1.5 border-t border-zinc-200 dark:border-zinc-700">
                                                                {/* Left: Assignee */}
                                                                <div className="flex items-center gap-1.5">
                                                                    {story.assignee ? (
                                                                        <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/50 pr-2 pl-0.5 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700/50">
                                                                            <Avatar className="h-5 w-5 ring-1 ring-white dark:ring-zinc-900">
                                                                                <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                                                                                    {story.assignee.charAt(0).toUpperCase()}
                                                                                </AvatarFallback>
                                                                            </Avatar>
                                                                            <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
                                                                                {story.assignee}
                                                                            </span>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="h-6 w-6 rounded-full border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-[10px] text-zinc-300">
                                                                            <Plus className="h-3 w-3" />
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Right: Story Points */}
                                                                <div className="flex items-center gap-2">
                                                                    {story.storyPoints !== undefined && story.storyPoints > 0 && (
                                                                        <Badge variant="secondary" className="text-xs bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0">
                                                                            {story.storyPoints} SP
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    {/* Drop indicator after story */}
                                                    {dragOverStoryId === story.id && dropPosition === 'after' && (
                                                        <div className="h-0.5 bg-primary rounded-full mt-2 animate-pulse shadow-lg shadow-primary/50" />
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Add Column Button */}
                        <div className="flex-shrink-0 w-72">
                            <Button
                                variant="outline"
                                onClick={handleAddColumn}
                                className="w-full h-24 border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-primary hover:bg-primary/5 transition-all rounded-xl"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Add Column
                            </Button>
                        </div>
                    </div>
                </main>
            </div>

            {/* Add Story Dialog */}
            <Dialog open={isAddStoryDialogOpen} onOpenChange={setIsAddStoryDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-eb-garamond text-xl">Add New Story</DialogTitle>
                        <DialogDescription>
                            Create a new story/ticket for your sprint board.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Title *</label>
                            <Input
                                placeholder="Enter story title"
                                value={newStory.title || ''}
                                onChange={(e) => setNewStory(prev => ({ ...prev, title: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                                placeholder="Enter story description"
                                value={newStory.description || ''}
                                onChange={(e) => setNewStory(prev => ({ ...prev, description: e.target.value }))}
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Story Points</label>
                                <Input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={newStory.storyPoints || ''}
                                    onChange={(e) => setNewStory(prev => ({ ...prev, storyPoints: parseInt(e.target.value) || 0 }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Completed Story Points</label>
                                <Input
                                    type="number"
                                    min="0"
                                    max={newStory.storyPoints || 0}
                                    placeholder="0"
                                    value={newStory.completedStoryPoints || ''}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value) || 0;
                                        const maxValue = newStory.storyPoints || 0;
                                        setNewStory(prev => ({ ...prev, completedStoryPoints: Math.min(value, maxValue) }));
                                    }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Priority</label>
                                <select
                                    className="w-full h-10 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
                                    value={newStory.priority || 'medium'}
                                    onChange={(e) => setNewStory(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <select
                                    className="w-full h-10 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
                                    value={newStory.status || 'todo'}
                                    onChange={(e) => setNewStory(prev => ({ ...prev, status: e.target.value as Story['status'] }))}
                                >
                                    <option value="todo">To Do</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="in_review">In Review</option>
                                    <option value="done">Done</option>
                                    <option value="blocked">Blocked</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Assignee</label>
                            <Input
                                placeholder="Enter assignee name"
                                value={newStory.assignee || ''}
                                onChange={(e) => setNewStory(prev => ({ ...prev, assignee: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tags (comma-separated)</label>
                            <Input
                                placeholder="bug, feature, urgent..."
                                value={newStory.tags?.join(', ') || ''}
                                onChange={(e) => setNewStory(prev => ({
                                    ...prev,
                                    tags: e.target.value.split(',').map((t: string) => t.trim()).filter((t: string) => t)
                                }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Due Date</label>
                            <Input
                                type="date"
                                value={newStory.due_date || ''}
                                onChange={(e) => setNewStory(prev => ({ ...prev, due_date: e.target.value }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddStoryDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={() => handleAddStory(newStory)}>
                            Add Story
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Story Detail Sheet (Drawer) - Sahara High-Fidelity Match */}
            <Sheet open={isEditStoryDialogOpen} onOpenChange={async (open) => {
                if (!open) {
                    // Trigger immediate final save if there's a pending auto-save
                    if (autoSaveTimerRef.current) {
                        clearTimeout(autoSaveTimerRef.current);
                        autoSaveTimerRef.current = null;
                        await handleSaveEditStory();
                    }
                    
                    setIsEditStoryDialogOpen(false);
                    setEditingStory(null);
                    setNewStory({
                        title: '',
                        description: '',
                        priority: 'medium',
                        storyPoints: 0,
                        status: 'todo',
                        subtasks: [],
                        comments: [],
                        activity_log: []
                    });
                } else {
                    setIsEditStoryDialogOpen(true);
                }
            }}>
                <SheetContent 
                    hideClose={true}
                    className="sm:max-w-xl w-full p-0 overflow-y-auto font-manrope bg-[#faf5ee]/95 backdrop-blur-xl border-l border-none shadow-2xl flex flex-col"
                >
                    <div className="sr-only">
                        <SheetHeader>
                            <SheetTitle>Story Details</SheetTitle>
                            <SheetDescription>View and edit the details of this user story.</SheetDescription>
                        </SheetHeader>
                    </div>
                    {/* Top Action Bar */}
                    <div className="flex items-center justify-between p-6 pb-2">
                        <div className="flex items-center gap-3">
                            <div className="bg-[#c2652a]/10 p-1.5 rounded-md">
                                <Bookmark className="h-3 w-3 text-[#c2652a]" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#3a302a]/40">
                                SAHARA-{newStory.id?.slice(-3) || '124'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            {isSaving && (
                                <div className="flex items-center gap-2 px-3 py-1 bg-[#c2652a]/5 rounded-full border border-[#c2652a]/10 animate-pulse">
                                    <div className="h-1.5 w-1.5 rounded-full bg-[#c2652a]" />
                                    <span className="text-[10px] font-bold text-[#c2652a] uppercase tracking-wider">Saving...</span>
                                </div>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-[#3a302a]/40 hover:text-[#3a302a] hover:bg-transparent">
                                <Upload className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-[#3a302a]/40 hover:text-[#3a302a] hover:bg-transparent">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setIsEditStoryDialogOpen(false)}
                                className="h-10 w-10 bg-[#3a302a]/5 hover:bg-[#c2652a]/10 text-[#3a302a] rounded-full ml-2 flex items-center justify-center transition-all group"
                            >
                                <X className="h-5 w-5 text-[#3a302a]/40 group-hover:text-[#c2652a] transition-colors" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 px-10 py-2 space-y-6">
                        {/* Title - Moved Up */}
                        <div className="pt-2">
                            <textarea
                                value={newStory.title || ''}
                                onChange={(e) => setNewStory(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full text-[32px] font-eb-garamond font-bold text-[#3a302a] leading-[1.15] tracking-tight bg-transparent border-none p-0 focus:ring-0 resize-none h-auto outline-none"
                                rows={2}
                                placeholder="High-Fidelity Story Detail Drawer"
                            />
                        </div>
                        <div className="space-y-4 pt-2">
                            {/* Status Row */}
                            <div className="grid grid-cols-[140px,1fr] items-center gap-4 group">
                                <div className="flex items-center gap-3 text-[#3a302a]/40 group-hover:text-[#3a302a]/60 transition-colors">
                                    <Target className="h-4 w-4" />
                                    <span className="text-[13px] font-medium tracking-tight">Status</span>
                                </div>
                                <div className="relative group/select cursor-pointer w-fit">
                                    <div className="flex items-center gap-2 px-1 hover:bg-[#3a302a]/[0.03] rounded-md transition-all">
                                        <div className={cn("h-2 w-2 rounded-full shrink-0", 
                                            newStory.status === 'done' ? 'bg-green-500' :
                                            newStory.status === 'in_progress' ? 'bg-[#c2652a]' :
                                            newStory.status === 'blocked' ? 'bg-red-500' : 'bg-[#c2652a]/30'
                                        )} />
                                        <span className="text-[14px] font-bold text-[#3a302a] flex items-center gap-1.5">
                                            {newStory.status === 'todo' ? 'To Do' :
                                             newStory.status === 'in_progress' ? 'In Progress' :
                                             newStory.status === 'in_review' ? 'In Review' :
                                             newStory.status === 'done' ? 'Done' : 'Blocked'}
                                            <ChevronDown className="h-3.5 w-3.5 text-[#3a302a]/30 group-hover/select:text-[#c2652a] transition-colors" />
                                        </span>
                                    </div>
                                    <select
                                        value={newStory.status || 'in_progress'}
                                        onChange={(e) => {
                                            const newStatus = e.target.value as any;
                                            const activity = {
                                                id: Math.random().toString(36).substr(2, 9),
                                                type: `changed status to ${newStatus.replace('_', ' ')}`,
                                                user_name: user?.full_name || user?.email || 'User',
                                                content: '',
                                                created_at: new Date().toISOString()
                                            };
                                            setNewStory(prev => ({ 
                                                ...prev, 
                                                status: newStatus,
                                                activity_log: [activity, ...(prev.activity_log || [])]
                                            }));
                                        }}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    >
                                        <option value="todo">To Do</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="in_review">In Review</option>
                                        <option value="done">Done</option>
                                        <option value="blocked">Blocked</option>
                                    </select>
                                </div>
                            </div>

                            {/* Due Date Row */}
                            <div className="grid grid-cols-[140px,1fr] items-center gap-4 group">
                                <div className="flex items-center gap-3 text-[#3a302a]/40 group-hover:text-[#3a302a]/60 transition-colors">
                                    <Calendar className="h-4 w-4" />
                                    <span className="text-[13px] font-medium tracking-tight">Due date</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="date"
                                        value={newStory.due_date || '2023-10-24'}
                                        onClick={(e) => (e.currentTarget as any).showPicker?.()}
                                        onChange={(e) => {
                                            const newDate = e.target.value;
                                            const activity = {
                                                id: Math.random().toString(36).substr(2, 9),
                                                type: `updated due date to ${newDate}`,
                                                user_name: user?.full_name || user?.email || 'User',
                                                content: '',
                                                created_at: new Date().toISOString()
                                            };
                                            setNewStory(prev => ({ 
                                                ...prev, 
                                                due_date: newDate,
                                                activity_log: [activity, ...(prev.activity_log || [])]
                                            }));
                                        }}
                                        className="text-[14px] font-bold bg-transparent border-none p-0 focus:ring-0 text-[#3a302a] hover:text-[#c2652a] transition-all cursor-pointer outline-none [color-scheme:light] [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden"
                                    />
                                </div>
                            </div>

                            {/* Assignee Row */}
                            <div className="grid grid-cols-[140px,1fr] items-center gap-4 group">
                                <div className="flex items-center gap-3 text-[#3a302a]/40 group-hover:text-[#3a302a]/60 transition-colors">
                                    <Users className="h-4 w-4" />
                                    <span className="text-[13px] font-medium tracking-tight">Assignee</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-6 w-6 shrink-0 ring-2 ring-[#c2652a]/5">
                                        <AvatarFallback className="text-[9px] bg-[#c2652a]/10 text-[#c2652a] font-black">
                                            {newStory.assignee?.charAt(0).toUpperCase() || 'A'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <input
                                        value={newStory.assignee || 'Alex Thompson'}
                                        onChange={(e) => setNewStory(prev => ({ ...prev, assignee: e.target.value }))}
                                        onBlur={(e) => {
                                            const val = e.target.value;
                                            if (val !== editingStory?.assignee) {
                                                const activity = {
                                                    id: Math.random().toString(36).substr(2, 9),
                                                    type: `assigned to ${val}`,
                                                    user_name: user?.full_name || user?.email || 'User',
                                                    content: '',
                                                    created_at: new Date().toISOString()
                                                };
                                                setNewStory(prev => ({
                                                    ...prev,
                                                    activity_log: [activity, ...(prev.activity_log || [])]
                                                }));
                                            }
                                        }}
                                        className="text-[14px] font-bold bg-transparent border-none p-0 focus:ring-0 text-[#3a302a] w-full hover:bg-[#3a302a]/[0.05] rounded px-1 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            {/* Priority Row */}
                            <div className="grid grid-cols-[140px,1fr] items-center gap-4 group">
                                <div className="flex items-center gap-3 text-[#3a302a]/40 group-hover:text-[#3a302a]/60 transition-colors">
                                    <AlertCircle className="h-4 w-4" />
                                    <span className="text-[13px] font-medium tracking-tight">Priority</span>
                                </div>
                                <div className="relative group/select cursor-pointer w-fit">
                                    <div className="flex items-center gap-2 px-1 hover:bg-[#3a302a]/[0.03] rounded-md transition-all">
                                        <div className={cn("h-2 w-2 rounded-full shrink-0", 
                                            newStory.priority === 'critical' ? 'bg-red-500' :
                                            newStory.priority === 'high' ? 'bg-orange-500' :
                                            newStory.priority === 'medium' ? 'bg-blue-500' : 'bg-slate-400'
                                        )} />
                                        <span className="text-[14px] font-bold text-[#3a302a] flex items-center gap-1.5">
                                            {newStory.priority?.charAt(0).toUpperCase() + newStory.priority?.slice(1) || 'Medium'}
                                            <ChevronDown className="h-3.5 w-3.5 text-[#3a302a]/30 group-hover/select:text-[#c2652a] transition-colors" />
                                        </span>
                                    </div>
                                    <select
                                        value={newStory.priority || 'medium'}
                                        onChange={(e) => {
                                            const newPriority = e.target.value as any;
                                            const activity = {
                                                id: Math.random().toString(36).substr(2, 9),
                                                type: `set priority to ${newPriority}`,
                                                user_name: user?.full_name || user?.email || 'User',
                                                content: '',
                                                created_at: new Date().toISOString()
                                            };
                                            setNewStory(prev => ({ 
                                                ...prev, 
                                                priority: newPriority,
                                                activity_log: [activity, ...(prev.activity_log || [])]
                                            }));
                                        }}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>
                            </div>

                            {/* Story Points Row */}
                            <div className="grid grid-cols-[140px,1fr] items-center gap-4 group">
                                <div className="flex items-center gap-3 text-[#3a302a]/40 group-hover:text-[#3a302a]/60 transition-colors">
                                    <Sparkles className="h-4 w-4" />
                                    <span className="text-[13px] font-medium tracking-tight">Story Points</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        value={newStory.storyPoints || 8}
                                        onChange={(e) => {
                                            const points = parseInt(e.target.value) || 0;
                                            const activity = {
                                                id: Math.random().toString(36).substr(2, 9),
                                                type: `updated story points to ${points}`,
                                                user_name: user?.full_name || user?.email || 'User',
                                                content: '',
                                                created_at: new Date().toISOString()
                                            };
                                            setNewStory(prev => ({ 
                                                ...prev, 
                                                storyPoints: points,
                                                activity_log: [activity, ...(prev.activity_log || [])]
                                            }));
                                        }}
                                        className="text-[14px] font-bold bg-transparent border-none p-0 focus:ring-0 text-[#3a302a] w-12 hover:bg-[#3a302a]/[0.05] rounded px-1 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            {/* Tags Row */}
                            <div className="grid grid-cols-[140px,1fr] items-center gap-4 group">
                                <div className="flex items-center gap-3 text-[#3a302a]/40 group-hover:text-[#3a302a]/60 transition-colors">
                                    <Tag className="h-4 w-4" />
                                    <span className="text-[13px] font-medium tracking-tight">Tags</span>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap min-h-[28px]">
                                    {(newStory.tags || []).map((tag, i) => (
                                        <span key={i} className="px-3 py-1 bg-[#c2652a]/5 text-[#c2652a] text-[11px] font-bold rounded-full border border-[#c2652a]/10 group/tag relative flex items-center gap-1.5 transition-all hover:bg-[#c2652a]/10">
                                            {tag}
                                            <button 
                                                onClick={() => {
                                                    setNewStory(prev => ({
                                                        ...prev,
                                                        tags: (prev.tags || []).filter((_, idx) => idx !== i)
                                                    }));
                                                }}
                                                className="h-3 w-3 hover:text-red-500 transition-colors"
                                            >
                                                <X className="h-2.5 w-2.5" />
                                            </button>
                                        </span>
                                    ))}
                                    
                                    {showTagInput ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                autoFocus
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && tagInput.trim()) {
                                                        setNewStory(prev => ({
                                                            ...prev,
                                                            tags: [...(prev.tags || []), tagInput.trim()]
                                                        }));
                                                        setTagInput('');
                                                        setShowTagInput(false);
                                                    }
                                                    if (e.key === 'Escape') {
                                                        setShowTagInput(false);
                                                        setTagInput('');
                                                    }
                                                }}
                                                onBlur={() => {
                                                    if (!tagInput.trim()) setShowTagInput(false);
                                                }}
                                                placeholder="Type & press Enter..."
                                                className="text-[11px] font-bold bg-[#c2652a]/5 border border-[#c2652a]/20 rounded-full px-3 py-1 outline-none text-[#c2652a] placeholder:text-[#c2652a]/30 w-32 transition-all focus:border-[#c2652a] focus:ring-1 focus:ring-[#c2652a]/20"
                                            />
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => setShowTagInput(true)}
                                            className="h-7 w-7 rounded-full border border-dashed border-[#3a302a]/20 flex items-center justify-center text-[#3a302a]/40 hover:border-[#c2652a] hover:text-[#c2652a] hover:bg-[#c2652a]/5 transition-all"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>


                        {/* Description Section */}
                        <div className="space-y-6 pt-4">
                            <h3 className="text-[20px] font-eb-garamond font-bold text-[#3a302a]">Description</h3>
                            <div className="text-[15px] leading-[1.6] text-[#3a302a]/70 font-medium">
                                <Textarea
                                    value={newStory.description || ''}
                                    onChange={(e) => setNewStory(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full bg-transparent border-none p-0 focus:ring-0 resize-none h-auto min-h-[200px] text-[15px] leading-[1.6] text-[#3a302a]/70 font-medium overflow-hidden"
                                    placeholder="Add a description..."
                                />
                            </div>
                        </div>
                    </div>

                        {/* Tabs Navigation */}
                        <div className="pt-8 space-y-6 px-10 pb-12">
                            <div className="flex gap-8 border-b border-[#3a302a]/5">
                                <button 
                                    onClick={() => setActiveTab('subtasks')}
                                    className={cn(
                                        "pb-4 text-sm font-bold transition-all relative",
                                        activeTab === 'subtasks' ? "text-[#3a302a]" : "text-[#3a302a]/30"
                                    )}
                                >
                                    Subtasks
                                    {activeTab === 'subtasks' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3a302a]" />}
                                </button>
                                <button 
                                    onClick={() => setActiveTab('comments')}
                                    className={cn(
                                        "pb-4 text-sm font-bold transition-all relative",
                                        activeTab === 'comments' ? "text-[#3a302a]" : "text-[#3a302a]/30"
                                    )}
                                >
                                    Comments
                                    {activeTab === 'comments' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3a302a]" />}
                                </button>
                                <button 
                                    onClick={() => setActiveTab('activities')}
                                    className={cn(
                                        "pb-4 text-sm font-bold transition-all relative",
                                        activeTab === 'activities' ? "text-[#3a302a]" : "text-[#3a302a]/30"
                                    )}
                                >
                                    Activities
                                    {activeTab === 'activities' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3a302a]" />}
                                </button>
                            </div>

                            <div className="min-h-[400px]">
                                <AnimatePresence mode="wait">
                                    {activeTab === 'subtasks' && (
                                        <motion.div 
                                            key="subtasks"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="space-y-6"
                                        >
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-[15px] font-bold text-[#3a302a]">Our Design Process</h4>
                                                <div className="flex items-center gap-2 text-[13px] font-bold text-[#3a302a]/40">
                                                    <div className="h-5 w-5 rounded-full border-2 border-[#c2652a] border-t-transparent animate-spin" style={{ animationDuration: '3s' }} />
                                                    <span>2/4</span>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                {(newStory.subtasks || []).length === 0 ? (
                                                    <div className="text-center py-8 text-[#3a302a]/20 font-bold text-sm">No subtasks yet. Create one below.</div>
                                                ) : (
                                                    newStory.subtasks?.map(subtask => (
                                                        <div key={subtask.id} className={cn(
                                                            "bg-white/40 border border-[#3a302a]/5 rounded-2xl p-4 transition-all group",
                                                            subtask.is_completed && "opacity-60"
                                                        )}>
                                                            <div className="flex items-center gap-3">
                                                                <button 
                                                                    onClick={() => handleToggleSubtask(subtask.id)}
                                                                    className={cn(
                                                                        "h-5 w-5 rounded-md flex items-center justify-center transition-all",
                                                                        subtask.is_completed ? "bg-[#c2652a]" : "border-2 border-[#3a302a]/10"
                                                                    )}
                                                                >
                                                                    {subtask.is_completed && <CheckCircle2 className="h-3 w-3 text-white" />}
                                                                </button>
                                                                <span className={cn(
                                                                    "text-sm font-bold text-[#3a302a]",
                                                                    subtask.is_completed && "line-through text-[#3a302a]/40"
                                                                )}>
                                                                    {subtask.title}
                                                                </span>
                                                            </div>
                                                            {subtask.note && (
                                                                <div className="ml-8 mt-2 bg-[#3a302a]/[0.02] p-3 rounded-xl border border-[#3a302a]/5 text-[12px] text-[#3a302a]/60 leading-relaxed">
                                                                    {subtask.note}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))
                                                )}

                                                <div className="bg-white/20 border-2 border-dashed border-[#3a302a]/10 rounded-2xl p-4 flex items-center gap-3 group hover:border-[#c2652a]/20 transition-all">
                                                    <Plus className="h-4 w-4 text-[#3a302a]/20" />
                                                    <input 
                                                        type="text" 
                                                        placeholder="Add a subtask..."
                                                        className="bg-transparent border-none focus:ring-0 text-sm font-bold text-[#3a302a] placeholder:text-[#3a302a]/20 w-full"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                handleAddSubtask((e.target as HTMLInputElement).value);
                                                                (e.target as HTMLInputElement).value = '';
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'comments' && (
                                        <motion.div 
                                            key="comments"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="space-y-8"
                                        >
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-[15px] font-bold text-[#3a302a]">Discussion</h4>
                                                <div className="flex items-center gap-2 text-[11px] font-bold text-[#3a302a]/40 uppercase tracking-wider">
                                                    <MessageSquare className="h-3 w-3" />
                                                    <span>{(newStory.comments || []).length} Comments</span>
                                                </div>
                                            </div>

                                            <div className="space-y-8">
                                                {(newStory.comments || []).length === 0 ? (
                                                    <div className="text-center py-12 text-[#3a302a]/20 font-bold text-sm bg-white/20 rounded-3xl border border-dashed border-[#3a302a]/5">
                                                        No comments yet. Start the conversation.
                                                    </div>
                                                ) : (
                                                    newStory.comments?.map(comment => (
                                                        <div key={comment.id} className="flex gap-4 group">
                                                            <Avatar className="h-10 w-10 shrink-0">
                                                                <AvatarFallback className="bg-[#3a302a]/5 text-[#3a302a] font-bold text-xs">
                                                                    {comment.user_name?.split(' ').map(n => n[0]).join('') || 'U'}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="space-y-1.5 flex-1">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-sm font-bold text-[#3a302a]">{comment.user_name}</span>
                                                                        <span className="text-[10px] text-[#3a302a]/30 font-medium">
                                                                            {comment.created_at ? new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                                                        </span>
                                                                    </div>
                                                                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <MoreVertical className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                                <div className="bg-white/40 border border-[#3a302a]/5 rounded-2xl p-4 shadow-sm text-sm text-[#3a302a]/70 leading-relaxed">
                                                                    {comment.content || comment.text}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}

                                                <div className="bg-[#3a302a]/[0.02] border border-[#3a302a]/5 rounded-2xl p-2 flex items-center gap-2">
                                                    <input 
                                                        id="new-comment-input"
                                                        type="text" 
                                                        placeholder="Write a comment..."
                                                        className="bg-transparent border-none focus:ring-0 text-sm font-bold text-[#3a302a] placeholder:text-[#3a302a]/20 w-full px-4"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                handleAddComment((e.target as HTMLInputElement).value);
                                                                (e.target as HTMLInputElement).value = '';
                                                            }
                                                        }}
                                                    />
                                                    <Button 
                                                        size="sm" 
                                                        className="bg-[#c2652a] hover:bg-[#a65624] text-white rounded-xl font-bold px-6"
                                                        onClick={() => {
                                                            const input = document.getElementById('new-comment-input') as HTMLInputElement;
                                                            handleAddComment(input.value);
                                                            input.value = '';
                                                        }}
                                                    >
                                                        Send
                                                    </Button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'activities' && (
                                        <motion.div 
                                            key="activities"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="space-y-8"
                                        >
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-[15px] font-bold text-[#3a302a]">Activities</h4>
                                                <button className="flex items-center gap-2 text-[11px] font-bold text-[#6366f1] hover:underline">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Mark as read
                                                </button>
                                            </div>

                                            <div className="space-y-8">
                                                {(newStory.activity_log || []).length === 0 ? (
                                                    <div className="text-center py-12 text-[#3a302a]/20 font-bold text-sm bg-white/20 rounded-3xl border border-dashed border-[#3a302a]/5">
                                                        No activity logged yet.
                                                    </div>
                                                ) : (
                                                    newStory.activity_log?.map(activity => (
                                                        <div key={activity.id} className="flex gap-4">
                                                            <Avatar className="h-10 w-10 shrink-0">
                                                                <AvatarFallback className="bg-[#3a302a]/5 text-[#3a302a] font-bold text-xs">
                                                                    {activity.user_name?.split(' ').map(n => n[0]).join('') || 'U'}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="space-y-3 flex-1">
                                                                <div className="space-y-1">
                                                                    <div className="text-[13px] text-[#3a302a]/50">
                                                                        <span className="font-bold text-[#3a302a]">{activity.user_name}</span> {activity.type}
                                                                    </div>
                                                                    <div className="text-[11px] text-[#3a302a]/30 font-medium">
                                                                        {new Date(activity.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                                    </div>
                                                                </div>
                                                                {activity.content && (
                                                                    <div className="bg-white/40 border border-[#3a302a]/5 rounded-2xl p-4 shadow-sm text-sm text-[#3a302a]/70 leading-relaxed">
                                                                        {activity.content}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                </SheetContent>
            </Sheet>
        </div>
    );
}
