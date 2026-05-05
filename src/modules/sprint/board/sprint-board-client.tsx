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
    Calendar as CalendarIcon,
    ChevronRight,
    PanelRightClose,
    PanelRightOpen,
    AlertCircle,
    Sparkles,
    Brain,
    Activity,
    Clock,
    Hourglass,
    MessageSquare,
    History,
    CheckCircle2,
    Bookmark,
    ChevronDown,
    Target,
    ShieldAlert,
    AlertTriangle,
    Zap,
    Info,
    TrendingUp,
    Lightbulb,
    Link,
    Link2,
    Copy,
    ArrowRightLeft,
    ThumbsUp,
    Send,
    ArrowRight,
    Check,
    MoreHorizontal,
    Bold,
    Italic,
    List,
    ListOrdered,
    ListTodo,
    Table,
    Rows,
    Columns,
    FileText,
    ExternalLink,
    UserPlus
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
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
    comments?: { id: string, text: string, user_name: string, created_at: string }[];
    activity_log?: { id: string, type: string, user_name: string, text: string, created_at: string }[];
    identified_risks?: { text: string, severity: 'low' | 'medium' | 'high' }[];
    acceptance_criteria?: any[];
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
        status: 'todo',
        subtasks: [],
        comments: [],
        activity_log: [],
        identified_risks: [],
        acceptance_criteria: []
    });
    const [isSaving, setIsSaving] = React.useState(false);
    const autoSaveTimerRef = React.useRef<NodeJS.Timeout | null>(null);

    const [visibleActivitiesCount, setVisibleActivitiesCount] = React.useState(5);
    const [isEditStoryDialogOpen, setIsEditStoryDialogOpen] = React.useState(false);
    const [isDescriptionFocused, setIsDescriptionFocused] = React.useState(false);
    const [isCommentFocused, setIsCommentFocused] = React.useState(false);
    const descriptionRef = React.useRef<HTMLDivElement>(null);
    const commentInputRef = React.useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = React.useState<'subtasks' | 'checklist' | 'comments' | 'activities'>('checklist');
    const [editingStory, setEditingStory] = React.useState<Story | null>(null);

    const handleFormat = (type: 'bold' | 'italic' | 'list' | 'ordered' | 'todo' | 'link' | 'copy' | 'table' | 'add-row' | 'add-col' | 'delete-row' | 'delete-col') => {
        if (type === 'copy') {
            const content = descriptionRef.current?.innerText || '';
            navigator.clipboard.writeText(content);
            toast({ title: "Copied to clipboard", description: "The description has been copied." });
            return;
        }

        const editor = descriptionRef.current;
        if (!editor) return;

        editor.focus();

        const getCell = () => {
            const selection = window.getSelection();
            if (!selection?.rangeCount) return null;
            let node = selection.getRangeAt(0).startContainer;
            while (node && node !== editor) {
                if (node.nodeName === 'TD' || node.nodeName === 'TH') return node as HTMLTableCellElement;
                node = node.parentNode as any;
            }
            return null;
        };

        switch (type) {
            case 'bold':
                document.execCommand('bold', false);
                break;
            case 'italic':
                document.execCommand('italic', false);
                break;
            case 'list':
                document.execCommand('insertUnorderedList', false);
                break;
            case 'ordered':
                document.execCommand('insertOrderedList', false);
                break;
            case 'todo':
                const todoHtml = '<ul style="list-style: none; padding-left: 0;"><li><input type="checkbox" style="margin-right: 8px;"> </li></ul>';
                document.execCommand('insertHTML', false, todoHtml);
                break;
            case 'link':
                const url = prompt('Enter the URL:');
                if (url) document.execCommand('createLink', false, url);
                break;
            case 'table':
                const tableHtml = `
                    <table style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid #3a302a1a; border-radius: 12px; overflow: hidden;">
                        <thead>
                            <tr style="background: #faf5ee;">
                                <th style="border: 1px solid #3a302a1a; padding: 12px; text-align: left; font-size: 13px;">Header 1</th>
                                <th style="border: 1px solid #3a302a1a; padding: 12px; text-align: left; font-size: 13px;">Header 2</th>
                                <th style="border: 1px solid #3a302a1a; padding: 12px; text-align: left; font-size: 13px;">Header 3</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="border: 1px solid #3a302a1a; padding: 12px; font-size: 13px;">Cell</td>
                                <td style="border: 1px solid #3a302a1a; padding: 12px; font-size: 13px;">Cell</td>
                                <td style="border: 1px solid #3a302a1a; padding: 12px; font-size: 13px;">Cell</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #3a302a1a; padding: 12px; font-size: 13px;">Cell</td>
                                <td style="border: 1px solid #3a302a1a; padding: 12px; font-size: 13px;">Cell</td>
                                <td style="border: 1px solid #3a302a1a; padding: 12px; font-size: 13px;">Cell</td>
                            </tr>
                        </tbody>
                    </table><p></p>
                `;
                document.execCommand('insertHTML', false, tableHtml);
                break;
            case 'add-row':
                const currentCell = getCell();
                if (currentCell) {
                    const row = currentCell.parentElement as HTMLTableRowElement;
                    const table = row.parentElement as HTMLTableSectionElement;
                    const newRow = table.insertRow(row.rowIndex);
                    for (let i = 0; i < row.cells.length; i++) {
                        const newCell = newRow.insertCell();
                        newCell.innerHTML = 'New Cell';
                        newCell.style.border = '1px solid #3a302a1a';
                        newCell.style.padding = '12px';
                        newCell.style.fontSize = '13px';
                    }
                }
                break;
            case 'add-col':
                const cellForCol = getCell();
                if (cellForCol) {
                    const table = (cellForCol.closest('table') as HTMLTableElement);
                    const colIndex = cellForCol.cellIndex;
                    Array.from(table.rows).forEach(row => {
                        const newCell = row.insertCell(colIndex + 1);
                        newCell.innerHTML = 'New';
                        newCell.style.border = '1px solid #3a302a1a';
                        newCell.style.padding = '12px';
                        newCell.style.fontSize = '13px';
                    });
                }
                break;
            case 'delete-row':
                const cellToDeleteRow = getCell();
                if (cellToDeleteRow) {
                    const row = cellToDeleteRow.parentElement as HTMLTableRowElement;
                    row.remove();
                }
                break;
            case 'delete-col':
                const cellToDeleteCol = getCell();
                if (cellToDeleteCol) {
                    const table = (cellToDeleteCol.closest('table') as HTMLTableElement);
                    const colIndex = cellToDeleteCol.cellIndex;
                    Array.from(table.rows).forEach(row => {
                        if (row.cells[colIndex]) row.cells[colIndex].remove();
                    });
                }
                break;
        }
        
        // Update state
        setNewStory(prev => ({ ...prev, description: editor.innerHTML }));
    };
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
    
    const addActivity = (text: string, type: 'status' | 'update' = 'update') => {
        const newActivity = {
            id: crypto.randomUUID(),
            text,
            type,
            user_name: user?.displayName || user?.email?.split('@')[0] || 'User',
            created_at: new Date().toISOString()
        };
        
        setNewStory(prev => ({
            ...prev,
            activity_log: [newActivity, ...(prev.activity_log || [])]
        }));
    };

    const handleToggleSubtask = async (subtaskId: string) => {
        if (!editingStory) return;
        
        const updatedSubtasks = (newStory.subtasks || []).map(st => 
            st.id === subtaskId ? { ...st, is_completed: !st.is_completed } : st
        );
        
        setNewStory(prev => ({ ...prev, subtasks: updatedSubtasks }));
        
        // Auto-save logic
        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = setTimeout(() => handleSaveEditStory(), 1000);
    };

    const handleAddComment = async () => {
        const text = commentInputRef.current?.innerText || '';
        if (!editingStory || !text.trim()) return;
        
        const newComment = {
            id: crypto.randomUUID(),
            text,
            user_name: user?.displayName || user?.email?.split('@')[0] || 'User',
            created_at: new Date().toISOString()
        };
        
        const updatedComments = [newComment, ...(newStory.comments || [])];
        setNewStory(prev => ({ ...prev, comments: updatedComments }));
        
        if (commentInputRef.current) commentInputRef.current.innerText = '';
        
        await handleSaveEditStory();
    };

    const handleUpdateDescription = (html: string) => {
        setNewStory(prev => ({ ...prev, description: html }));
        
        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = setTimeout(() => handleSaveEditStory(), 2000);
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
            status: 'todo',
            subtasks: [],
            comments: [],
            activity_log: []
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
            status: 'todo',
            subtasks: [],
            comments: [],
            activity_log: []
        });

        toast({
            title: 'Story saved',
            description: 'Your story has been saved to the database.'
        });
    };

    const handleEditStory = (story: Story) => {
        setEditingStory(story);
        setNewStory({
            id: story.id,
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
            activity_log: story.activity_log || [],
            identified_risks: (story as any).identified_risks || [],
            acceptance_criteria: (story as any).acceptance_criteria || []
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
            priority: newStory.priority as any,
            status: newStory.status as any,
            tags: newStory.tags,
            due_date: newStory.due_date,
            subtasks: newStory.subtasks,
            comments: newStory.comments,
            activity_log: newStory.activity_log,
            identified_risks: (newStory as any).identified_risks,
            acceptance_criteria: (newStory as any).acceptance_criteria
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
            title: newStory.title,
            description: newStory.description,
            storyPoints: newStory.storyPoints,
            completedStoryPoints: newStory.completedStoryPoints,
            assignee: newStory.assignee,
            priority: newStory.priority,
            status: newStory.status,
            tags: newStory.tags,
            due_date: newStory.due_date,
            subtasks: newStory.subtasks,
            comments: newStory.comments,
            activity_log: newStory.activity_log,
            identified_risks: (newStory as any).identified_risks,
            acceptance_criteria: (newStory as any).acceptance_criteria
        } as Story;

        setEditingStory(updatedStory);

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
            case 'high': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300';
            case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'low': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300';
            default: return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-700 dark:text-zinc-300';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'todo': return 'bg-zinc-100 text-zinc-700 border-zinc-300 dark:bg-zinc-700 dark:text-zinc-300';
            case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300';
            case 'in_review': return 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300';
            case 'done': return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300';
            case 'blocked': return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300';
            default: return 'bg-zinc-100 text-zinc-700 border-zinc-300 dark:bg-zinc-700 dark:text-zinc-300';
        }
    };

    const getStatusDotColor = (status: string) => {
        switch (status) {
            case 'todo': return 'bg-zinc-400';
            case 'in_progress': return 'bg-[#c2652a]';
            case 'in_review': return 'bg-purple-500';
            case 'done': return 'bg-green-500';
            case 'blocked': return 'bg-red-500';
            default: return 'bg-zinc-400';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'todo': return 'To Do';
            case 'in_progress': return 'In Progress';
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
                                        { value: 'points', label: 'By Points', icon: CalendarIcon },
                                        { value: 'assignee', label: 'By Assignee', icon: Users },
                                        { value: 'newest', label: 'By Newest', icon: History }
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
                                        const sortOptions: Array<'none' | 'priority' | 'points' | 'assignee' | 'newest'> = ['none', 'priority', 'points', 'assignee', 'newest'];
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
                                                                    <CalendarIcon className="h-3 w-3" />
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
            }}>                <SheetContent 
                    hideClose={true}
                    className="sm:max-w-[1100px] w-full p-0 overflow-y-auto font-manrope bg-[#faf5ee]/95 backdrop-blur-3xl border-l border-none shadow-2xl flex flex-col"
                >
                    <div className="sr-only">
                        <SheetHeader>
                            <SheetTitle>Decision Intelligence Center</SheetTitle>
                            <SheetDescription>Strategic intelligence engine and execution guide.</SheetDescription>
                        </SheetHeader>
                    </div>

                    {/* Top Control Bar */}
                    <div className="flex items-center justify-between p-8 pb-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-[#3a302a]/10 p-2 rounded-lg">
                                <Brain className="h-4 w-4 text-[#3a302a]" />
                            </div>
                            <span className="text-[12px] font-black uppercase tracking-[0.2em] text-[#3a302a]/40">
                                SAHARA-{newStory.id?.slice(-4).toUpperCase() || 'NEW'}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 bg-[#3a302a]/5 p-1 rounded-xl">
                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-[#3a302a]/40 hover:text-[#c2652a] hover:bg-white/50 transition-all">
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-[#3a302a]/40 hover:text-[#c2652a] hover:bg-white/50 transition-all">
                                    <Link2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-[#3a302a]/40 hover:text-[#c2652a] hover:bg-white/50 transition-all">
                                    <Copy className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-[#3a302a]/40 hover:text-[#c2652a] hover:bg-white/50 transition-all">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setIsEditStoryDialogOpen(false)}
                                className="h-11 w-11 bg-[#3a302a]/5 hover:bg-[#c2652a] text-[#3a302a]/40 hover:text-white rounded-full transition-all group"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 px-10 py-2 space-y-10 pb-12">
                        {/* 1. Header & Metric Chips */}
                        <div className="space-y-6">
                            <h1 
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => {
                                    const newTitle = e.currentTarget.innerText;
                                    if (newTitle.trim()) {
                                        setNewStory(prev => ({ ...prev, title: newTitle }));
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        e.currentTarget.blur();
                                    }
                                }}
                                className="text-[42px] font-eb-garamond font-bold text-[#3a302a] leading-tight tracking-tight focus:outline-none focus:bg-[#3a302a]/5 px-2 -ml-2 rounded-xl transition-all cursor-text"
                            >
                                {newStory.title || "Untitled Story"}
                            </h1>
                            
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 px-4 py-2 bg-red-50/50 rounded-full border border-red-100/50">
                                    <Clock className="h-3.5 w-3.5 text-red-500" />
                                    <span className="text-[10px] font-black uppercase tracking-wider text-red-700">ETA Risk: 48h Threshold</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-orange-50/50 rounded-full border border-orange-100/50">
                                    <Users className="h-3.5 w-3.5 text-orange-500" />
                                    <span className="text-[10px] font-black uppercase tracking-wider text-orange-700">3 Engineers Blocked</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50/50 rounded-full border border-blue-100/50">
                                    <Zap className="h-3.5 w-3.5 text-blue-500" />
                                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-700">High Velocity Opportunity</span>
                                </div>
                            </div>

                            {/* 2. Strategic Recommendation (Dark) */}
                            <div className="relative overflow-hidden bg-[#2a2420] rounded-[32px] p-8 text-white shadow-2xl">
                                <div className="relative z-10 flex items-center justify-between gap-12">
                                    <div className="space-y-3 flex-1">
                                        <div className="flex items-center gap-2 text-[#c2652a]">
                                            <Info className="h-4 w-4" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Strategic Recommendation</span>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[16px] leading-relaxed">
                                                <span className="font-bold">Immediate <span className="text-[#c2652a]">Technical Spike required</span> for Auth Gateway.</span>
                                                <span className="text-white/40 ml-2">Historical data shows 85% probability of resolution if tackled before Sprint Midpoint.</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        <Button className="bg-red-500 hover:bg-red-600 text-white border-none text-[10px] font-black px-6 py-2 rounded-full h-auto">URGENT ACTION</Button>
                                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Reason: Downstream Critical Path</span>
                                    </div>
                                </div>
                            </div>

                            {/* Status and Progress Bar */}
                            <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center gap-8 flex-1 max-w-2xl">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <div className="flex items-center gap-3 px-5 py-2.5 bg-white border border-[#3a302a]/10 rounded-2xl shadow-sm cursor-pointer hover:border-[#c2652a]/30 hover:shadow-md transition-all active:scale-95 group">
                                                <div className={cn("h-3 w-3 rounded-full", getStatusDotColor(newStory.status || 'todo'))} />
                                                <span className="text-[14px] font-bold text-[#3a302a]">{getStatusLabel(newStory.status || 'todo')}</span>
                                                <ChevronDown className="h-4 w-4 text-[#3a302a]/20 group-hover:text-[#c2652a] transition-all" />
                                            </div>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" className="w-[200px] p-2 bg-white border-[#3a302a]/5 rounded-2xl shadow-xl">
                                            {['todo', 'in_progress', 'in_review', 'done', 'blocked'].map((status) => (
                                                <DropdownMenuItem 
                                                    key={status}
                                                    onClick={() => {
                                                        const oldStatus = newStory.status || 'todo';
                                                        setNewStory(prev => ({ ...prev, status: status as any }));
                                                        addActivity(`Changed status from ${getStatusLabel(oldStatus)} to ${getStatusLabel(status)}`, 'status');
                                                        handleSaveEditStory();
                                                    }}
                                                    className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-[#c2652a]/5 focus:bg-[#c2652a]/5 outline-none transition-colors"
                                                >
                                                    <div className={cn("h-2.5 w-2.5 rounded-full", getStatusDotColor(status))} />
                                                    <span className="text-[13px] font-bold text-[#3a302a]">{getStatusLabel(status)}</span>
                                                    {newStory.status === status && <Check className="h-3.5 w-3.5 text-[#c2652a] ml-auto" />}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    
                                    <div className="flex-1 flex items-center gap-4">
                                        <div className="h-2 flex-1 bg-[#3a302a]/5 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-[#c2652a] transition-all duration-1000 ease-out" 
                                                style={{ width: `${newStory.storyPoints && newStory.storyPoints > 0 ? Math.round(((newStory.completedStoryPoints || 0) / newStory.storyPoints) * 100) : 0}%` }} 
                                            />
                                        </div>
                                        <span className="text-[11px] font-black text-[#3a302a]/30 uppercase tracking-widest whitespace-nowrap">
                                            {newStory.storyPoints && newStory.storyPoints > 0 ? Math.round(((newStory.completedStoryPoints || 0) / newStory.storyPoints) * 100) : 0}% Execution
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-12">
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="flex items-center gap-1">
                                            <span className="text-[10px] font-black text-[#3a302a]/30 uppercase tracking-widest">Story Progress</span>
                                            <Info className="h-3 w-3 text-[#3a302a]/20" />
                                        </div>
                                        <div className="flex items-center gap-2 bg-white/50 border border-[#3a302a]/5 rounded-xl px-3 py-1">
                                            <input 
                                                type="number"
                                                value={(newStory.completedStoryPoints === 0 || !newStory.completedStoryPoints) ? "" : newStory.completedStoryPoints}
                                                placeholder="0"
                                                onFocus={(e) => e.target.select()}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value) || 0;
                                                    setNewStory(prev => ({ ...prev, completedStoryPoints: val }));
                                                    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
                                                    autoSaveTimerRef.current = setTimeout(() => {
                                                        addActivity(`Log: Completed ${val} SP out of ${newStory.storyPoints} SP`);
                                                        handleSaveEditStory();
                                                    }, 1500);
                                                }}
                                                className="w-14 bg-transparent text-right text-[18px] font-bold text-green-600 placeholder:text-green-600/50 focus:outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                            <span className="text-[18px] font-bold text-[#3a302a]/20">/</span>
                                            <span className="text-[18px] font-bold text-[#3a302a]/40">{newStory.storyPoints || 0}</span>
                                            <span className="text-[10px] font-black text-[#3a302a]/20 ml-1 uppercase">SP</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-[10px] font-black text-[#3a302a]/30 uppercase tracking-widest">Total Value</span>
                                        <span className="text-[20px] font-bold text-[#3a302a]">{newStory.storyPoints || 0} SP</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Three Card Grid */}
                        <div className="grid grid-cols-3 gap-6">
                            {/* Intelligence Summary */}
                            <div className="bg-[#2a2420] rounded-[32px] p-8 text-white space-y-8 shadow-xl relative overflow-hidden">
                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-3">
                                        <Sparkles className="h-4 w-4 text-[#c2652a]" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Intelligence Summary</span>
                                    </div>
                                    <Badge className="bg-green-500/20 text-green-400 border-none text-[8px] font-black px-2 py-1">92% MATCH</Badge>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 relative z-10">
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Recurrence</span>
                                        <p className="text-[24px] font-bold">3x Sprints</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Success Prob.</span>
                                        <p className="text-[24px] font-bold text-green-400">85.4%</p>
                                    </div>
                                </div>

                                <div className="space-y-3 relative z-10">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-black text-[#c2652a] uppercase tracking-widest">Primary Recommendation</span>
                                        <Badge className="bg-red-500 text-white border-none text-[8px] font-black px-2 py-0.5">HIGH TRUST</Badge>
                                    </div>
                                    <p className="text-[14px] leading-relaxed text-white/80">
                                        Historical bottlenecks identified in Code Review. <span className="text-[#c2652a] font-bold underline cursor-pointer">Escalate for immediate review</span> to prevent the 3-day rollover risk.
                                    </p>
                                </div>
                                <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#c2652a]/5 rounded-full blur-[40px] -mr-16 -mb-16" />
                            </div>

                            {/* Impact Analysis */}
                            <div className="bg-white rounded-[32px] p-8 space-y-8 shadow-sm border border-[#3a302a]/5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle className="h-4 w-4 text-red-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#3a302a]/40">Impact Analysis</span>
                                    </div>
                                    <Badge className="bg-red-50 text-red-500 border-none text-[8px] font-black px-2 py-1">CRITICAL</Badge>
                                </div>

                                <div className="space-y-4">
                                    <span className="text-[9px] font-black text-[#3a302a]/30 uppercase tracking-widest">Immediate Impact</span>
                                    <div className="p-4 bg-red-50/30 border border-red-100 rounded-2xl flex items-center justify-between">
                                        <span className="text-[13px] font-bold text-red-900">3 Engineers Blocked</span>
                                        <span className="text-[9px] font-black text-red-600 uppercase">Active</span>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-2">
                                    <span className="text-[9px] font-black text-[#3a302a]/30 uppercase tracking-widest">Downstream Consequence</span>
                                    <ul className="space-y-3">
                                        <li className="flex items-center gap-3 text-[13px] font-bold text-[#3a302a]">
                                            <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                            2.5 Day Milestone Delay
                                        </li>
                                        <li className="flex items-center gap-3 text-[13px] font-bold text-[#3a302a]">
                                            <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                            Auth Gateway Vulnerability
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Systemic Context */}
                            <div className="bg-white rounded-[32px] p-8 space-y-6 shadow-sm border border-[#3a302a]/5">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#3a302a]/40 block">Systemic Context</span>
                                
                                <div className="space-y-3">
                                    {/* Assignee */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <div className="flex items-center justify-between p-3.5 bg-[#3a302a]/[0.02] border border-[#3a302a]/5 rounded-2xl cursor-pointer hover:bg-[#3a302a]/[0.05] transition-all active:scale-[0.98]">
                                                <div className="flex items-center gap-3">
                                                    <Users className="h-3.5 w-3.5 text-[#3a302a]/30" />
                                                    <span className="text-[12px] font-bold text-[#3a302a]">Assignee</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[11px] font-bold text-[#3a302a]/60">{newStory.assignee || 'Unassigned'}</span>
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarFallback className="bg-[#c2652a] text-white text-[9px] font-bold">
                                                            {newStory.assignee ? newStory.assignee.substring(0, 2).toUpperCase() : '??'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                </div>
                                            </div>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-[200px] p-2 bg-white border-[#3a302a]/5 rounded-2xl shadow-xl">
                                            {['Pranam', 'Alice', 'Bob', 'Charlie'].map((name) => (
                                                <DropdownMenuItem 
                                                    key={name}
                                                    onClick={() => {
                                                        setNewStory(prev => ({ ...prev, assignee: name }));
                                                        addActivity(`Assigned to ${name}`);
                                                        handleSaveEditStory();
                                                    }}
                                                    className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer hover:bg-[#c2652a]/5 focus:bg-[#c2652a]/5 outline-none transition-colors"
                                                >
                                                    <Avatar className="h-5 w-5">
                                                        <AvatarFallback className="bg-[#3a302a]/10 text-[#3a302a] text-[8px] font-bold">{name.substring(0,2).toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-[12px] font-bold text-[#3a302a]">{name}</span>
                                                    {newStory.assignee === name && <Check className="h-3 w-3 text-[#c2652a] ml-auto" />}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    {/* Story Points */}
                                    <div className="flex items-center justify-between p-3.5 bg-[#3a302a]/[0.02] border border-[#3a302a]/5 rounded-2xl group hover:border-[#c2652a]/30 transition-all">
                                        <div className="flex items-center gap-3">
                                            <Zap className="h-3.5 w-3.5 text-[#3a302a]/30 group-hover:text-[#c2652a] transition-all" />
                                            <span className="text-[12px] font-bold text-[#3a302a]">Story Points</span>
                                        </div>                                        <input 
                                            type="number"
                                            value={(newStory.storyPoints === 0 || !newStory.storyPoints) ? "" : newStory.storyPoints}
                                            placeholder="0"
                                            onFocus={(e) => e.target.select()}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value) || 0;
                                                setNewStory(prev => ({ ...prev, storyPoints: val }));
                                                if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
                                                autoSaveTimerRef.current = setTimeout(() => {
                                                    addActivity(`Updated story points to ${val} SP`);
                                                    handleSaveEditStory();
                                                }, 1500);
                                            }}
                                            className="w-16 bg-transparent text-right text-[11px] font-black text-[#c2652a] placeholder:text-[#c2652a]/50 focus:outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />

                                    </div>

                                    {/* Deadline Risk */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <div className="flex items-center justify-between p-3.5 bg-[#3a302a]/[0.02] border border-[#3a302a]/5 rounded-2xl group cursor-pointer hover:bg-[#3a302a]/[0.05] transition-all active:scale-[0.98]">
                                                <div className="flex items-center gap-3">
                                                    <CalendarIcon className="h-3.5 w-3.5 text-[#3a302a]/30" />
                                                    <span className="text-[12px] font-bold text-[#3a302a]">Deadline Risk</span>
                                                </div>
                                                <span className={cn(
                                                    "text-[11px] font-bold",
                                                    newStory.due_date && !isNaN(new Date(newStory.due_date).getTime()) ? "text-red-500" : "text-[#3a302a]/40"
                                                )}>
                                                    {newStory.due_date && !isNaN(new Date(newStory.due_date).getTime()) 
                                                        ? format(new Date(newStory.due_date), "MMM d, yyyy") 
                                                        : 'Set Deadline'}
                                                </span>
                                            </div>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-auto p-4 bg-white border-[#3a302a]/5 rounded-2xl shadow-2xl z-[100]" align="end">
                                            <div className="space-y-4">
                                                <Calendar
                                                    mode="single"
                                                    selected={newStory.due_date && !isNaN(new Date(newStory.due_date).getTime()) ? new Date(newStory.due_date) : undefined}
                                                    onSelect={(date) => {
                                                        if (!date) return;
                                                        const dateStr = date.toISOString();
                                                        const formattedDate = format(date, "MMM d, yyyy");
                                                        setNewStory(prev => ({ ...prev, due_date: dateStr }));
                                                        addActivity(`Set deadline risk to ${formattedDate}`);
                                                    }}
                                                    initialFocus
                                                    className="rounded-2xl border-none"
                                                />
                                                <DropdownMenuItem className="p-0 focus:bg-transparent hover:bg-transparent">
                                                    <Button 
                                                        className="w-full bg-[#c2652a] hover:bg-[#a15423] text-white rounded-xl py-6 gap-2 shadow-lg shadow-[#c2652a]/20 transition-all active:scale-[0.98]"
                                                        onClick={() => {
                                                            handleSaveEditStory();
                                                        }}
                                                    >
                                                        <Check className="h-4 w-4" />
                                                        <span className="font-bold text-[13px]">Confirm Selection</span>
                                                    </Button>
                                                </DropdownMenuItem>
                                            </div>
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    {/* Goal Mapping */}
                                    <div className="flex items-center justify-between p-3.5 bg-[#3a302a]/[0.02] border border-[#3a302a]/5 rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <Target className="h-3.5 w-3.5 text-[#3a302a]/30" />
                                            <span className="text-[12px] font-bold text-[#3a302a]">Goal Mapping</span>
                                        </div>
                                        <Badge className="bg-[#3a302a] text-white border-none text-[8px] font-black px-2 py-0.5 rounded-full uppercase cursor-pointer hover:bg-[#c2652a] transition-colors">
                                            {newStory.tags?.[0] || 'Sprint 7 Core'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Systemic Dependency Flow */}
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[20px] font-eb-garamond font-bold text-[#3a302a]">Systemic Dependency Flow</h4>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-blue-400" />
                                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Pressure flowing downstream</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between gap-0">
                                {/* Upstream */}
                                <div className="flex-1 bg-white border border-[#3a302a]/10 rounded-[24px] p-6 relative">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Blocked By</span>
                                        <Badge className="bg-blue-50 text-blue-600 border-none text-[8px] font-black">STABLE</Badge>
                                    </div>
                                    <p className="text-[15px] font-bold text-[#3a302a]">Database Migration</p>
                                    <p className="text-[10px] font-black text-[#3a302a]/20 uppercase mt-1">SAHARA-9281</p>
                                </div>

                                <div className="w-12 flex justify-center">
                                    <ArrowRight className="h-5 w-5 text-[#3a302a]/10" />
                                </div>

                                {/* Current (Bottleneck) */}
                                <div className="flex-[1.2] bg-[#c2652a] rounded-[28px] p-8 text-white shadow-2xl relative scale-105 z-10 border-4 border-[#faf5ee]">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Active Bottleneck</span>
                                        <Sparkles className="h-4 w-4 text-white/60" />
                                    </div>
                                    <p className="text-[20px] font-bold">This Strategic Objective</p>
                                    <div className="flex items-center gap-3 mt-4">
                                        <Badge className="bg-white/20 text-white border-none text-[8px] font-black uppercase">High Load</Badge>
                                        <span className="text-[10px] font-black text-white/60 uppercase">Impact Score: 9.2</span>
                                    </div>
                                </div>

                                <div className="w-12 flex justify-center">
                                    <ArrowRight className="h-5 w-5 text-[#3a302a]/10" />
                                </div>

                                {/* Downstream */}
                                <div className="flex-1 bg-white border border-[#3a302a]/10 rounded-[24px] p-6 relative">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[9px] font-black text-red-600 uppercase tracking-widest">Blocking</span>
                                        <Badge className="bg-red-50 text-red-600 border-none text-[8px] font-black">CRITICAL</Badge>
                                    </div>
                                    <p className="text-[15px] font-bold text-[#3a302a]">Frontend Integration</p>
                                    <p className="text-[10px] font-black text-[#3a302a]/20 uppercase mt-1">SAHARA-9285</p>
                                </div>
                            </div>
                        </div>

                        {/* Main Execution Workspace */}
                        <div className="grid grid-cols-[1fr,320px] gap-12">
                            <div className="space-y-12">
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[24px] font-eb-garamond font-bold text-[#3a302a]">Execution Strategy</h4>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 gap-8">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Target className="h-4 w-4 text-[#c2652a]" />
                                                    <span className="text-[11px] font-black uppercase tracking-widest text-[#3a302a]/40">Description</span>
                                                </div>
                                                
                                                {/* Toolbar moved inside the box container below */}
                                            </div>
                                            
                                            <div className={cn(
                                                "bg-white border transition-all duration-300 rounded-[32px] shadow-sm min-h-[220px] overflow-hidden flex flex-col",
                                                isDescriptionFocused ? "border-[#c2652a] shadow-lg ring-4 ring-[#c2652a]/5" : "border-[#3a302a]/10"
                                            )}>
                                                {/* Integrated Toolbar - Only visible on focus */}
                                                <AnimatePresence>
                                                    {isDescriptionFocused && (
                                                        <motion.div 
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden border-b border-[#3a302a]/5"
                                                        >
                                                            <div className="flex items-center gap-1 px-4 py-2 bg-[#faf5ee]/30">
                                                                <Button variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('bold')} className="h-8 w-8 rounded-lg hover:bg-[#3a302a]/5">
                                                                    <Bold className="h-4 w-4 text-[#3a302a]/60" />
                                                                </Button>
                                                                <Button variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('italic')} className="h-8 w-8 rounded-lg hover:bg-[#3a302a]/5">
                                                                    <Italic className="h-4 w-4 text-[#3a302a]/60" />
                                                                </Button>
                                                                <div className="w-[1px] h-4 bg-[#3a302a]/10 mx-1" />
                                                                <Button variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('list')} className="h-8 w-8 rounded-lg hover:bg-[#3a302a]/5">
                                                                    <List className="h-4 w-4 text-[#3a302a]/60" />
                                                                </Button>
                                                                <Button variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('ordered')} className="h-8 w-8 rounded-lg hover:bg-[#3a302a]/5">
                                                                    <ListOrdered className="h-4 w-4 text-[#3a302a]/60" />
                                                                </Button>
                                                                <Button variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('todo')} className="h-8 w-8 rounded-lg hover:bg-[#3a302a]/5">
                                                                    <ListTodo className="h-4 w-4 text-[#3a302a]/60" />
                                                                </Button>
                                                                <div className="w-[1px] h-4 bg-[#3a302a]/10 mx-1" />
                                                                <Button variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('table')} className="h-8 w-8 rounded-lg hover:bg-[#3a302a]/5" title="Insert Table">
                                                                    <Table className="h-4 w-4 text-[#3a302a]/60" />
                                                                </Button>
                                                                <Button variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('add-row')} className="h-8 w-8 rounded-lg hover:bg-[#3a302a]/5" title="Add Row">
                                                                    <Rows className="h-4 w-4 text-[#3a302a]/60" />
                                                                </Button>
                                                                <Button variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('add-col')} className="h-8 w-8 rounded-lg hover:bg-[#3a302a]/5" title="Add Column">
                                                                    <Columns className="h-4 w-4 text-[#3a302a]/60" />
                                                                </Button>
                                                                <div className="w-[1px] h-4 bg-[#3a302a]/10 mx-1" />
                                                                <Button variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('link')} className="h-8 w-8 rounded-lg hover:bg-[#3a302a]/5">
                                                                    <Link2 className="h-4 w-4 text-[#3a302a]/60" />
                                                                </Button>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                                
                                                <div
                                                    ref={descriptionRef as any}
                                                    contentEditable={true}
                                                    onBlur={(e) => {
                                                        handleUpdateDescription(e.currentTarget.innerHTML);
                                                        setIsDescriptionFocused(false);
                                                    }}
                                                    onFocus={() => setIsDescriptionFocused(true)}
                                                    className="w-full bg-transparent border-none p-8 focus-visible:outline-none min-h-[220px] h-full text-[15px] leading-relaxed text-[#3a302a]/70 font-medium cursor-text prose prose-sm max-w-none prose-p:my-0 prose-ul:my-2"
                                                    dangerouslySetInnerHTML={{ __html: newStory.description || "" }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="space-y-10">
                                    <div className="flex gap-10 border-b border-[#3a302a]/5 overflow-x-auto no-scrollbar">
                                        {[
                                            { id: 'comments', label: 'Comments', count: newStory.comments?.length || 0 },
                                            { id: 'checklist', label: 'Checklist', count: newStory.subtasks?.length || 0 },
                                            { id: 'subtasks', label: 'Subtasks', count: 0 },
                                            { id: 'activities', label: 'Activities', count: newStory.activity_log?.length || 0 },
                                        ].map(tab => (
                                            <button 
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id as any)}
                                                className={cn(
                                                    "pb-5 text-[15px] font-bold transition-all relative flex items-center gap-3 whitespace-nowrap",
                                                    activeTab === tab.id ? "text-[#3a302a]" : "text-[#3a302a]/30"
                                                )}
                                            >
                                                {tab.label}
                                                {tab.count && <span className="text-[10px] font-black bg-[#3a302a]/5 px-1.5 py-0.5 rounded-md">{tab.count}</span>}
                                                {activeTab === tab.id && <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#c2652a]" />}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="min-h-[300px]">
                                        <AnimatePresence mode="wait">
                                            {activeTab === 'comments' && (
                                                <motion.div key="comments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                                                    {/* Comment Input */}
                                                    <div className="flex items-center gap-4 py-2">
                                                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm shrink-0">
                                                            <AvatarFallback className="bg-[#3a302a]/5 text-[#3a302a]/40 text-xs font-bold">ME</AvatarFallback>
                                                        </Avatar>
                                                        <div className={cn(
                                                            "flex-1 flex items-center bg-white border rounded-full px-6 py-1.5 transition-all duration-300",
                                                            isCommentFocused ? "border-[#c2652a] shadow-md" : "border-[#3a302a]/10"
                                                        )}>
                                                            <div 
                                                                ref={commentInputRef}
                                                                contentEditable
                                                                onFocus={() => setIsCommentFocused(true)}
                                                                onBlur={() => setIsCommentFocused(false)}
                                                                className="flex-1 bg-transparent border-none focus:outline-none text-[14px] text-[#3a302a] leading-relaxed py-1 empty:before:content-[attr(data-placeholder)] empty:before:text-[#3a302a]/30 min-h-[24px] max-h-[120px] overflow-y-auto no-scrollbar"
                                                                data-placeholder="Add a comment..."
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                                        e.preventDefault();
                                                                        handleAddComment();
                                                                    }
                                                                }}
                                                            />
                                                            <button 
                                                                onClick={handleAddComment}
                                                                className="ml-2 text-[#3a302a]/20 hover:text-[#c2652a] transition-all p-1"
                                                            >
                                                                <Send className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Comment Feed */}
                                                    <div className="space-y-8 px-2">
                                                        {(newStory.comments || []).map((comment: any, i: number) => (
                                                            <div key={i} className="flex gap-4 group">
                                                                <Avatar className="h-10 w-10 border-2 border-white shadow-md">
                                                                    <AvatarFallback className={cn(
                                                                        "text-white text-xs font-bold",
                                                                        i === 0 ? "bg-[#c2652a]" : "bg-[#3a302a]"
                                                                    )}>{comment.user_name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                                                                </Avatar>
                                                                <div className="flex-1 space-y-2">
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="text-[14px] font-bold text-[#3a302a]">{comment.user_name}</span>
                                                                        <span className="text-[11px] font-medium text-[#3a302a]/20">{new Date(comment.created_at).toLocaleDateString()}</span>
                                                                        {comment.pinned && <Badge className="bg-[#c2652a]/10 text-[#c2652a] border-none text-[8px] font-black px-1.5 py-0.5 uppercase tracking-widest">Pinned</Badge>}
                                                                    </div>
                                                                    <p className="text-[14px] leading-relaxed text-[#3a302a]/70 font-medium">
                                                                        {comment.text}
                                                                    </p>
                                                                    <div className="flex items-center gap-6 pt-1 opacity-0 group-hover:opacity-100 transition-all">
                                                                        <button className="text-[11px] font-bold text-[#3a302a]/30 hover:text-[#c2652a]">Reply</button>
                                                                        <button className="flex items-center gap-1.5 text-[11px] font-bold text-[#3a302a]/30 hover:text-red-500">
                                                                            <ThumbsUp className="h-3 w-3" />
                                                                            {comment.likes > 0 && comment.likes}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}

                                            {activeTab === 'checklist' && (
                                                <motion.div key="checklist" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                                                    <div className="bg-white/50 border border-[#3a302a]/5 rounded-[32px] p-8 space-y-6">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <Sparkles className="h-4 w-4 text-purple-500" />
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-purple-700">Intelligent Checklist Generator</span>
                                                            </div>
                                                            <button className="text-[9px] font-black text-purple-600 uppercase tracking-widest hover:underline">Regenerate</button>
                                                        </div>
                                                        
                                                        <div className="space-y-3">
                                                            {(newStory.subtasks || []).map((item: any, i: number) => (
                                                                <div 
                                                                    key={i} 
                                                                    onClick={() => handleToggleSubtask(item.id)}
                                                                    className="flex items-center justify-between p-5 bg-white border border-[#3a302a]/5 rounded-2xl group hover:border-[#c2652a]/20 transition-all cursor-pointer"
                                                                >
                                                                    <div className="flex items-center gap-4">
                                                                        <div className={cn(
                                                                            "h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all",
                                                                            item.is_completed ? "bg-[#c2652a] border-[#c2652a]" : "border-[#3a302a]/10"
                                                                        )}>
                                                                            {item.is_completed && <Check className="h-3 w-3 text-white" strokeWidth={4} />}
                                                                        </div>
                                                                        <span className={cn(
                                                                            "text-[14px] font-bold transition-all",
                                                                            item.is_completed ? "text-[#3a302a]/40 line-through" : "text-[#3a302a]"
                                                                        )}>{item.title}</span>
                                                                    </div>
                                                                    <div className="h-8 w-8 rounded-full border-2 border-[#3a302a]/5 flex items-center justify-center group-hover:border-[#c2652a]/20 group-hover:bg-[#c2652a]/5 transition-all">
                                                                        <Plus className="h-4 w-4 text-[#3a302a]/20 group-hover:text-[#c2652a]" />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {activeTab === 'subtasks' && (
                                                <motion.div key="subtasks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                                                    <div className="flex items-center justify-between px-2">
                                                        <div className="flex items-center gap-3">
                                                            <Link2 className="h-4 w-4 text-[#3a302a]/40" />
                                                            <span className="text-[11px] font-black uppercase tracking-widest text-[#3a302a]/40">Linked Evidence & References</span>
                                                        </div>
                                                        <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest text-[#c2652a] hover:bg-[#c2652a]/5">
                                                            Attach Task
                                                        </Button>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-1 gap-4">
                                                        {[
                                                            { id: 'SAHARA-9281', title: 'Auth Gateway Security Audit', status: 'Done', color: 'green' },
                                                            { id: 'SAHARA-125', title: 'Firebase Admin SDK Implementation', status: 'In Progress', color: 'orange' }
                                                        ].map((task, i) => (
                                                            <div key={i} className="p-6 bg-white border border-[#3a302a]/5 rounded-[24px] flex items-center justify-between group hover:border-[#c2652a]/20 transition-all cursor-pointer">
                                                                <div className="flex items-center gap-5">
                                                                    <div className={cn(
                                                                        "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                                                                        task.color === 'green' ? "bg-green-50" : "bg-orange-50"
                                                                    )}>
                                                                        <FileText className={cn(
                                                                            "h-5 w-5",
                                                                            task.color === 'green' ? "text-green-600" : "text-orange-600"
                                                                        )} />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-[10px] font-black text-[#3a302a]/30 uppercase tracking-widest">{task.id}</span>
                                                                            <Badge className={cn(
                                                                                "border-none text-[8px] font-black px-1.5 py-0.5 uppercase",
                                                                                task.color === 'green' ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                                                                            )}>{task.status}</Badge>
                                                                        </div>
                                                                        <p className="text-[14px] font-bold text-[#3a302a]">{task.title}</p>
                                                                    </div>
                                                                </div>
                                                                <ExternalLink className="h-4 w-4 text-[#3a302a]/10 group-hover:text-[#c2652a] transition-all" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}

                                            {activeTab === 'activities' && (
                                                <motion.div key="activities" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8 px-4 pb-12">
                                                    {(newStory.activity_log || []).slice(0, visibleActivitiesCount).map((activity: any, i: number) => (
                                                        <div key={i} className="flex gap-6 relative">
                                                            {i !== (Math.min(visibleActivitiesCount, newStory.activity_log?.length || 0)) - 1 && <div className="absolute left-[15px] top-8 bottom-[-32px] w-[2px] bg-[#3a302a]/5" />}
                                                            <div className="h-8 w-8 rounded-full bg-white border border-[#3a302a]/5 flex items-center justify-center shrink-0 shadow-sm z-10">
                                                                {activity.type === 'status' ? <div className="h-2 w-2 rounded-full bg-[#c2652a]" /> : <Activity className="h-3 w-3 text-blue-500" />}
                                                            </div>
                                                            <div className="pt-1.5 space-y-1">
                                                                <p className="text-[14px] font-bold text-[#3a302a]">{activity.text || activity.message}</p>
                                                                <div className="flex items-center gap-2 text-[11px] font-medium text-[#3a302a]/30">
                                                                    <span>{activity.user_name || 'System'}</span>
                                                                    <span className="h-1 w-1 rounded-full bg-[#3a302a]/10" />
                                                                    <span>{activity.created_at ? new Date(activity.created_at).toLocaleDateString() : 'Just now'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    {(newStory.activity_log?.length || 0) > visibleActivitiesCount && (
                                                        <div className="flex justify-center pt-4">
                                                            <Button 
                                                                variant="ghost" 
                                                                onClick={() => setVisibleActivitiesCount(prev => prev + 5)}
                                                                className="group flex flex-col items-center gap-2 hover:bg-transparent"
                                                            >
                                                                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#c2652a]">
                                                                    <span>Show 5 More</span>
                                                                    <span className="text-[#3a302a]/20">({(newStory.activity_log?.length || 0) - visibleActivitiesCount} left)</span>
                                                                </div>
                                                                <ChevronDown className="h-4 w-4 text-[#c2652a] animate-bounce group-hover:scale-110 transition-all" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Action Center */}
                            <div className="space-y-12">
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-[#3a302a]/30 uppercase tracking-[0.2em]">Ranked Strategic Actions</h4>
                                    <div className="space-y-5">
                                        {/* Priority 1 */}
                                        <div className="p-8 bg-[#9333ea] rounded-[32px] text-white shadow-2xl space-y-6 relative overflow-hidden group">
                                            <div className="flex items-center justify-between relative z-10">
                                                <Badge className="bg-white/20 text-white border-none text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Priority 1</Badge>
                                                <TrendingUp className="h-4 w-4 text-white/40" />
                                            </div>
                                            <div className="space-y-2 relative z-10">
                                                <p className="text-[18px] font-bold">CONVERT TO SPIKE</p>
                                                <p className="text-[12px] text-white/60 italic leading-relaxed">
                                                    "Issue is highly recurrent. Recommend permanent fix."
                                                </p>
                                            </div>
                                            <div className="space-y-4 pt-4 border-t border-white/10 relative z-10">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-3 w-3 text-white/40" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Expected Outcome</span>
                                                </div>
                                                <p className="text-[11px] text-white/80">Reduces future sprint rollover probability by 45%.</p>
                                                <Button className="w-full bg-white text-[#9333ea] hover:bg-white/90 font-black text-[12px] h-11 rounded-2xl border-none">
                                                    Execute Strategy
                                                </Button>
                                            </div>
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[40px] -mr-16 -mt-16" />
                                        </div>

                                        {/* Priority 2 */}
                                        <div className="p-8 bg-[#f8f9fa] border border-[#3a302a]/5 rounded-[32px] space-y-6 group hover:border-[#c2652a]/20 transition-all">
                                            <div className="flex items-center justify-between">
                                                <Badge className="bg-[#3a302a]/5 text-[#3a302a]/30 border-none text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Priority 2</Badge>
                                                <Users className="h-4 w-4 text-[#3a302a]/10" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[15px] font-bold text-[#3a302a]">ARCHITECT REVIEW</p>
                                                <p className="text-[11px] text-[#3a302a]/40 italic uppercase tracking-tighter">
                                                    <span className="font-black">Expected Outcome:</span> unblocks 3 engineers.
                                                </p>
                                            </div>
                                            <Button variant="ghost" className="w-full bg-[#3a302a]/5 text-[#3a302a]/40 font-black text-[11px] h-11 rounded-2xl border-none hover:bg-[#3a302a]/10">
                                                Request Escalation
                                            </Button>
                                        </div>

                                        <div className="space-y-12 pt-8 border-t border-[#3a302a]/5">
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-3">
                                                    <AlertCircle className="h-4 w-4 text-orange-500" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#3a302a]/30">Identified Risks</span>
                                                </div>
                                                <ul className="space-y-4">
                                                    {((newStory as any).identified_risks || []).length > 0 ? (
                                                        (newStory as any).identified_risks.map((risk: any, i: number) => (
                                                            <li key={i} className="flex items-center gap-3 text-[13px] font-bold text-[#3a302a]">
                                                                <div className={cn(
                                                                    "h-2 w-2 rounded-full",
                                                                    risk.severity === 'high' ? "bg-red-500" : "bg-orange-500"
                                                                )} />
                                                                {risk.text}
                                                            </li>
                                                        ))
                                                    ) : (
                                                        <li className="text-[11px] font-medium text-[#3a302a]/20 italic">No risks identified</li>
                                                    )}
                                                </ul>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="flex items-center gap-3">
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#3a302a]/30">Acceptance Criteria</span>
                                                </div>
                                                <div className="space-y-4">
                                                    {((newStory as any).acceptance_criteria || []).length > 0 ? (
                                                        (newStory as any).acceptance_criteria.map((item: any, i: number) => (
                                                            <div key={i} className="flex items-center gap-3 bg-green-50/50 p-4 rounded-2xl border border-green-100/50">
                                                                <Check className="h-4 w-4 text-green-600" />
                                                                <span className="text-[13px] font-bold text-green-900">{item.text || item}</span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-[11px] font-medium text-[#3a302a]/20 italic px-2">No criteria defined</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
