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
    Share2,
    Edit,
    Smile,
    ChevronUp,
    Heart,
    Reply
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
import { getOrganizationMembersAction, getTeamsAction } from '@/backend/actions/teams.actions';
import { getPlatformsAction, Platform } from '@/backend/actions/platforms.actions';
import { ExecutionSidebar } from './execution-sidebar';

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
    story_code?: string;
    team_id?: string;
    platform_id?: string;
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
const TAB_ID = typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString();

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
    const [orgMembers, setOrgMembers] = React.useState<any[]>([]);
    const [teams, setTeams] = React.useState<any[]>([]);
    const [platforms, setPlatforms] = React.useState<Platform[]>([]);
    
    const [newStory, setNewStory] = React.useState<Partial<Story>>({
        title: '',
        description: '',
        priority: 'medium',
        storyPoints: 0,
        completedStoryPoints: 0,
        status: 'todo',
        team_id: '',
        platform_id: '',
        subtasks: [],
        comments: [],
        activity_log: [],
        identified_risks: [],
        acceptance_criteria: []
    });
    const latestStoryRef = React.useRef(newStory);
    React.useEffect(() => {
        latestStoryRef.current = newStory;
    }, [newStory]);
    const [isSaving, setIsSaving] = React.useState(false);
    const autoSaveTimerRef = React.useRef<NodeJS.Timeout | null>(null);
    const isSyncingRef = React.useRef(false);
    const [editingCommentId, setEditingCommentId] = React.useState<string | null>(null);
    const [editingCommentText, setEditingCommentText] = React.useState('');
    const [replyingToId, setReplyingToId] = React.useState<string | null>(null);
    const [replyText, setReplyText] = React.useState('');
    const [expandedCommentIds, setExpandedCommentIds] = React.useState<Set<string>>(new Set());

    const [visibleActivitiesCount, setVisibleActivitiesCount] = React.useState(5);
    const [isEditStoryDialogOpen, setIsEditStoryDialogOpen] = React.useState(false);
    const [isDescriptionFocused, setIsDescriptionFocused] = React.useState(false);
    const [isCommentFocused, setIsCommentFocused] = React.useState(false);
    const descriptionRef = React.useRef<HTMLDivElement>(null);
    const commentInputRef = React.useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = React.useState<'subtasks' | 'checklist' | 'comments' | 'activities'>('checklist');
    const [editingStory, setEditingStory] = React.useState<Story | null>(null);

    const handleFormat = (type: 'bold' | 'italic' | 'list' | 'ordered' | 'todo' | 'link' | 'copy' | 'table' | 'add-row' | 'add-col' | 'delete-row' | 'delete-col' | 'delete-table') => {
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
                    const tableSection = row.parentElement as HTMLTableSectionElement;
                    const newRow = tableSection.insertRow(row.sectionRowIndex + 1);
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
                    const table = row.closest('table');
                    row.remove();
                    if (table && table.rows.length === 0) {
                        table.remove();
                    }
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
                    // If no more cells in the first row, remove the table
                    if (table.rows[0]?.cells.length === 0) {
                        table.remove();
                    }
                }
                break;
            case 'delete-table':
                const cellToDelTable = getCell();
                if (cellToDelTable) {
                    const table = cellToDelTable.closest('table');
                    table?.remove();
                }
                break;
        }
        
        // Update state
        setNewStory(prev => ({ ...prev, description: editor.innerHTML }));
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                e.preventDefault();
                const file = items[i].getAsFile();
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const base64 = event.target?.result;
                        const img = document.createElement('img');
                        img.src = base64 as string;
                        img.setAttribute('style', 'max-width: 100% !important; height: auto !important; border-radius: 8px !important; display: block !important;');
                        img.className = 'my-2 cursor-pointer';
                        // Add tracking ID immediately so it's editable right away
                        img.setAttribute('data-img-id', `img-${Math.random().toString(36).substr(2, 9)}`);
                        
                        const selection = window.getSelection();
                        if (selection && selection.rangeCount > 0) {
                            const range = selection.getRangeAt(0);
                            range.deleteContents();
                            range.insertNode(img);
                            range.setStartAfter(img);
                            range.setEndAfter(img);
                            selection.removeAllRanges();
                            selection.addRange(range);
                        } else {
                            descriptionRef.current?.appendChild(img);
                        }
                        
                        handleUpdateDescription(descriptionRef.current?.innerHTML || '');
                    };
                    reader.readAsDataURL(file);
                }
                break;
            }
        }
    };


    const [draggedStory, setDraggedStory] = React.useState<{ storyId: string; sourceColumnId: string } | null>(null);
    const [dragOverColumnId, setDragOverColumnId] = React.useState<string | null>(null);
    const [dragOverStoryId, setDragOverStoryId] = React.useState<string | null>(null);
    const [dropPosition, setDropPosition] = React.useState<'before' | 'after' | null>(null);
    const [isSidebarExpanded, setIsSidebarExpanded] = React.useState(true);
    const [showCompletedStories, setShowCompletedStories] = React.useState(true);
    const [filterPriority, setFilterPriority] = React.useState<string[]>([]);
    const [filterPlatforms, setFilterPlatforms] = React.useState<string[]>([]);
    const [filterAssignee, setFilterAssignee] = React.useState<string>('');
    const [activeQuickView, setActiveQuickView] = React.useState<string>('all');
    const [tagInput, setTagInput] = React.useState('');
    const [showTagInput, setShowTagInput] = React.useState(false);

    // Auto-save logic for the Story Detail Drawer
    React.useEffect(() => {
        if (!isEditStoryDialogOpen || !editingStory) return;
        if (isSyncingRef.current) return;

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

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [members, teamsData, platformsData] = await Promise.all([
                    getOrganizationMembersAction(),
                    getTeamsAction(),
                    getPlatformsAction()
                ]);
                setOrgMembers(members || []);
                setTeams(teamsData || []);
                setPlatforms(platformsData || []);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            }
        };
        fetchData();
    }, []);

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
    const fetchStories = React.useCallback(async (silent = false) => {
        if (!sprintId || isLoadingColumns) return;

        if (!silent) setIsLoadingStories(true);
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
                        story_code: dbStory.story_code,
                        team_id: dbStory.team_id,
                        platform_id: dbStory.platform_id,
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
        
        const channel = new BroadcastChannel('sahara-board-sync');
        
        // Debounce the fetchStories to prevent multiple rapid refreshes
        let fetchTimer: any = null;
        
        channel.onmessage = (event) => {
            if (event.data.type === 'STORY_UPDATED' && event.data.sourceTabId !== TAB_ID) {
                // Clear any pending fetch
                if (fetchTimer) clearTimeout(fetchTimer);
                
                // If editing the story in the drawer, sync it instantly
                if (event.data.payload) {
                    isSyncingRef.current = true;
                    setNewStory((prev) => prev.id === event.data.storyId ? { ...prev, ...event.data.payload } : prev);
                    setEditingStory((prev) => prev?.id === event.data.storyId ? { ...prev, ...event.data.payload } : prev);
                    setTimeout(() => { isSyncingRef.current = false; }, 100);
                }

                // Wait a bit before fetching to let multiple rapid updates batch together
                fetchTimer = setTimeout(() => {
                    fetchStories(true); // Fetch silently in background
                }, 1000);
            }
        };

        return () => {
            window.removeEventListener('refresh-board', handleRefresh);
            channel.close();
        };
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
        const userName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
        const newActivity = {
            id: crypto.randomUUID(),
            text,
            type,
            user_name: userName,
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
        
        const userName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
        const newComment = {
            id: crypto.randomUUID(),
            text,
            user_name: userName,
            created_at: new Date().toISOString()
        };
        
        const updatedStory = { ...newStory, comments: [newComment, ...(newStory.comments || [])] };
        setNewStory(updatedStory);
        
        if (commentInputRef.current) commentInputRef.current.innerText = '';
        
        await handleSaveEditStory(updatedStory);
    };

    const handleDeleteComment = async (commentId: string) => {
        const updatedStory = {
            ...newStory,
            comments: (newStory.comments || []).filter((c: any) => c.id !== commentId)
        };
        setNewStory(updatedStory);
        await handleSaveEditStory(updatedStory);
        toast({ title: "Comment deleted" });
    };

    const handleStartEditComment = (comment: any) => {
        setEditingCommentId(comment.id);
        setEditingCommentText(comment.text);
    };

    const handleSaveCommentEdit = async (commentId: string) => {
        if (!editingCommentText.trim()) return;
        const updatedStory = {
            ...newStory,
            comments: (newStory.comments || []).map((c: any) => 
                c.id === commentId ? { ...c, text: editingCommentText, edited_at: new Date().toISOString() } : c
            )
        };
        setNewStory(updatedStory);
        setEditingCommentId(null);
        await handleSaveEditStory(updatedStory);
        toast({ title: "Comment updated" });
    };

    const handleShareComment = (commentId: string) => {
        const url = `${window.location.origin}${window.location.pathname}#comment-${commentId}`;
        navigator.clipboard.writeText(url);
        toast({ title: "Link copied", description: "Direct link to comment copied to clipboard" });
    };

    const handleAddReply = async (commentId: string) => {
        if (!replyText.trim()) return;
        const userName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
        const newReply = {
            id: crypto.randomUUID(),
            text: replyText,
            user_name: userName,
            created_at: new Date().toISOString(),
            parent_id: commentId
        };

        const updatedStory = {
            ...newStory,
            comments: (newStory.comments || []).map((c: any) => 
                c.id === commentId ? { ...c, replies: [...(c.replies || []), newReply] } : c
            )
        };
        setNewStory(updatedStory);
        setReplyingToId(null);
        setReplyText('');
        setExpandedCommentIds(prev => new Set(Array.from(prev).concat(commentId)));
        await handleSaveEditStory(updatedStory);
    };

    const handleToggleReaction = async (commentId: string, emoji: string) => {
        const userName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
        
        const updateReactions = (reactions: any[] = []) => {
            const existing = reactions.find(r => r.emoji === emoji);
            if (existing) {
                const alreadyReacted = existing.users.includes(userName);
                if (alreadyReacted) {
                    const newUsers = existing.users.filter((u: string) => u !== userName);
                    if (newUsers.length === 0) return reactions.filter(r => r.emoji !== emoji);
                    return reactions.map(r => r.emoji === emoji ? { ...r, count: newUsers.length, users: newUsers } : r);
                } else {
                    return reactions.map(r => r.emoji === emoji ? { ...r, count: r.count + 1, users: [...r.users, userName] } : r);
                }
            }
            return [...reactions, { emoji, count: 1, users: [userName] }];
        };

        const updatedStory = {
            ...newStory,
            comments: (newStory.comments || []).map((c: any) => 
                c.id === commentId ? { ...c, reactions: updateReactions(c.reactions) } : c
            )
        };
        setNewStory(updatedStory);
        await handleSaveEditStory(updatedStory);
    };

    const toggleReplies = (commentId: string) => {
        const newExpanded = new Set(expandedCommentIds);
        if (newExpanded.has(commentId)) newExpanded.delete(commentId);
        else newExpanded.add(commentId);
        setExpandedCommentIds(newExpanded);
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

        if (!newStory.team_id) {
            toast({
                title: 'Required Field',
                description: 'Please select a team.',
                variant: 'destructive'
            });
            return;
        }

        if (!newStory.platform_id) {
            toast({
                title: 'Required Field',
                description: 'Please select a platform.',
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
            team_id: newStory.team_id || undefined,
            platform_id: newStory.platform_id || undefined
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
            story_code: createdStory.story_code || undefined,
            team_id: createdStory.team_id || undefined,
            platform_id: createdStory.platform_id || undefined,
            title: createdStory.title,
            description: createdStory.description || '',
            storyPoints: createdStory.story_points || undefined,
            completedStoryPoints: createdStory.completed_story_points || 0,
            assignee: createdStory.assignee || undefined,
            priority: createdStory.priority as any,
            status: createdStory.status as any,
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
            team_id: '',
            platform_id: '',
            subtasks: [],
            comments: [],
            activity_log: []
        });

        toast({
            title: 'Story saved',
            description: `Story ${story.story_code || ''} has been saved.`
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

    const handleSaveEditStory = async (storyToSave?: any) => {
        const story = storyToSave || latestStoryRef.current;
        if (!editingStory || !story.title?.trim()) {
            return; // Don't save if no title or not editing
        }

        setIsSaving(true);
        const { error } = await updateStory(editingStory.id, {
            title: story.title,
            description: story.description || undefined,
            story_points: story.storyPoints,
            completed_story_points: story.completedStoryPoints || 0,
            assignee: story.assignee,
            priority: story.priority as any,
            status: story.status as any,
            tags: story.tags,
            due_date: story.due_date,
            subtasks: story.subtasks,
            comments: story.comments,
            activity_log: story.activity_log,
            identified_risks: (story as any).identified_risks,
            acceptance_criteria: (story as any).acceptance_criteria
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

        const channel = new BroadcastChannel('sahara-board-sync');
        channel.postMessage({ type: 'STORY_UPDATED', storyId: editingStory.id, payload: story, sourceTabId: TAB_ID });
        channel.close();

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

        // Filter by platforms
        if (filterPlatforms.length > 0) {
            filtered = filtered.filter(s => s.platform_id && filterPlatforms.includes(s.platform_id));
        }

        // Filter by priority (array)
        if (filterPriority.length > 0) {
            filtered = filtered.filter(s => filterPriority.includes(s.priority));
        }

        // Filter by assignee
        if (filterAssignee) {
            if (filterAssignee === 'unassigned') {
                filtered = filtered.filter(s => !s.assignee);
            } else {
                filtered = filtered.filter(s => s.assignee === filterAssignee);
            }
        }

        // Quick Views
        if (activeQuickView !== 'all') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

            if (activeQuickView === 'my-work') {
                filtered = filtered.filter(s => s.assignee === user?.displayName || s.assignee === user?.email);
            } else if (activeQuickView === 'due-soon') {
                filtered = filtered.filter(s => {
                    if (!s.due_date) return false;
                    const d = new Date(s.due_date);
                    return d >= today && d <= nextWeek;
                });
            } else if (activeQuickView === 'unassigned') {
                filtered = filtered.filter(s => !s.assignee);
            } else if (activeQuickView === 'high-priority') {
                filtered = filtered.filter(s => s.priority === 'high' || s.priority === 'critical');
            } else if (activeQuickView === 'recently-updated') {
                filtered = filtered.filter(s => {
                    if (!s.activity_log || s.activity_log.length === 0) return false;
                    const lastUpdated = new Date(s.activity_log[0].created_at);
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    return lastUpdated >= yesterday;
                });
            } else if (activeQuickView === 'tech-debt') {
                filtered = filtered.filter(s => s.tags?.some(t => t.toLowerCase().includes('debt')));
            } else if (activeQuickView === 'carry-forward') {
                filtered = filtered.filter(s => s.tags?.some(t => t.toLowerCase().includes('carry')));
            } else if (activeQuickView === 'unestimated') {
                filtered = filtered.filter(s => !s.storyPoints);
            } else if (activeQuickView === 'overdue') {
                filtered = filtered.filter(s => {
                    if (!s.due_date) return false;
                    const d = new Date(s.due_date);
                    d.setHours(0, 0, 0, 0);
                    return d < today;
                });
            } else if (activeQuickView === 'blocked') {
                filtered = filtered.filter(s => s.status === 'blocked');
            } else if (activeQuickView === 'dependency-heavy') {
                filtered = filtered.filter(s => s.tags?.some(t => t.toLowerCase().includes('depend')));
            }
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
                if (sortBy === 'newest') {
                    // ID is usually sequential/uuid, assuming larger/newer if uuid v7, or just keep order.
                    // If no created_at, fallback to title or something for newest.
                    // We will just do a simple string comparison on ID for now.
                    return (b.id || '').localeCompare(a.id || '');
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
            <style>{`
                .comment-input-placeholder:empty:before {
                    content: attr(data-placeholder);
                    color: #3a302a40;
                    font-weight: 500;
                    cursor: text;
                }
            `}</style>
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
                    <ExecutionSidebar
                        columns={columns}
                        teams={teams}
                        platforms={platforms}
                        orgMembers={orgMembers}
                        user={user}
                        isSidebarExpanded={isSidebarExpanded}
                        setIsSidebarExpanded={setIsSidebarExpanded}
                        showCompletedStories={showCompletedStories}
                        setShowCompletedStories={setShowCompletedStories}
                        filterPriority={filterPriority}
                        setFilterPriority={setFilterPriority}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                        filterPlatforms={filterPlatforms}
                        setFilterPlatforms={setFilterPlatforms}
                        filterAssignee={filterAssignee}
                        setFilterAssignee={setFilterAssignee}
                        activeQuickView={activeQuickView}
                        setActiveQuickView={setActiveQuickView}
                        onExportData={handleExportData}
                        onRefreshBoard={() => {
                            router.refresh();
                            fetchStories();
                        }}
                    />
                )}

                {/* Kanban Board */}
                <main className={cn("flex-1 overflow-x-auto p-4 lg:p-6", isEmbedded && "p-0")}>
                    
                    {/* Active Filter Chips */}
                    {(filterPlatforms.length > 0 || filterPriority.length > 0 || filterAssignee !== '' || activeQuickView !== 'all') && (
                        <div className="flex flex-wrap items-center gap-1.5 mb-5 pb-3 border-b border-[#3a302a]/[0.03]">
                            <div className="flex items-center gap-1.5 mr-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#c2652a] animate-pulse" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#3a302a]/60">Active Filters</span>
                            </div>
                            
                            {activeQuickView !== 'all' && (
                                <Badge variant="outline" className="bg-white/60 backdrop-blur-sm border-[#c2652a]/20 text-[#c2652a] flex items-center gap-1 py-0.5 px-2 rounded-full text-[10px] shadow-sm">
                                    <span className="opacity-60 font-normal mr-0.5">View:</span>
                                    {activeQuickView.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                    <button onClick={() => setActiveQuickView('all')} className="ml-1 hover:bg-[#c2652a]/10 rounded-full p-0.5 transition-colors">
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}

                            {filterPlatforms.map(platformId => {
                                const platformName = platforms.find(p => p.id === platformId)?.name || 'Platform';
                                return (
                                    <Badge key={platformId} variant="outline" className="bg-white/60 backdrop-blur-sm border-[#3a302a]/10 text-[#3a302a]/80 flex items-center gap-1 py-0.5 px-2 rounded-full text-[10px] shadow-sm">
                                        <span className="opacity-60 font-normal mr-0.5">Platform:</span>
                                        {platformName}
                                        <button onClick={() => setFilterPlatforms(filterPlatforms.filter(p => p !== platformId))} className="ml-1 hover:bg-[#3a302a]/5 rounded-full p-0.5 transition-colors">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                );
                            })}

                            {filterPriority.map(p => {
                                const colors: Record<string, string> = { critical: 'bg-red-500', high: 'bg-orange-500', medium: 'bg-amber-500', low: 'bg-emerald-500' };
                                return (
                                    <Badge key={p} variant="outline" className="bg-white/60 backdrop-blur-sm border-[#3a302a]/10 text-[#3a302a]/80 flex items-center gap-1 py-0.5 px-2 rounded-full text-[10px] shadow-sm">
                                        <div className={cn("h-1.5 w-1.5 rounded-full mr-0.5", colors[p] || 'bg-gray-500')} />
                                        <span className="opacity-60 font-normal mr-0.5">Priority:</span>
                                        {p.charAt(0).toUpperCase() + p.slice(1)}
                                        <button onClick={() => setFilterPriority(filterPriority.filter(x => x !== p))} className="ml-1 hover:bg-[#3a302a]/5 rounded-full p-0.5 transition-colors">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                );
                            })}

                            {filterAssignee !== '' && (
                                <Badge variant="outline" className="bg-white/60 backdrop-blur-sm border-[#3a302a]/10 text-[#3a302a]/80 flex items-center gap-1 py-0.5 px-2 rounded-full text-[10px] shadow-sm">
                                    <span className="opacity-60 font-normal mr-0.5">Assignee:</span>
                                    {filterAssignee === 'unassigned' ? 'Unassigned' : filterAssignee}
                                    <button onClick={() => setFilterAssignee('')} className="ml-1 hover:bg-[#3a302a]/5 rounded-full p-0.5 transition-colors">
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}

                            <div className="flex-1" />

                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 px-2.5 text-[10px] text-[#3a302a]/50 hover:text-[#3a302a] hover:bg-[#3a302a]/5 rounded-full"
                                onClick={() => {
                                    setFilterPlatforms([]);
                                    setFilterPriority([]);
                                    setFilterAssignee('');
                                    setActiveQuickView('all');
                                }}
                            >
                                Reset All Filters
                            </Button>
                        </div>
                    )}

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
                                                                <div className="flex items-center gap-2">
                                                                    {story.story_code && (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                navigator.clipboard.writeText(story.story_code || '');
                                                                                toast({ title: 'Copied to clipboard', description: story.story_code });
                                                                            }}
                                                                            className="text-[10px] font-black text-[#c2652a] hover:underline flex items-center gap-1 bg-[#c2652a]/5 px-1.5 py-0.5 rounded"
                                                                        >
                                                                            {story.story_code}
                                                                            <Copy className="h-2.5 w-2.5" />
                                                                        </button>
                                                                    )}
                                                                    <Badge variant="outline" className={cn("text-[10px] font-medium h-5", getPriorityColor(story.priority))}>
                                                                        {story.priority.charAt(0).toUpperCase() + story.priority.slice(1)}
                                                                    </Badge>
                                                                </div>
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
                                                                <Badge variant="outline" className={cn("text-xs font-medium", getStatusColor(story.status || 'todo'))}>
                                                                    {getStatusLabel(story.status || 'todo')}
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
                                <label className="text-sm font-medium">Team *</label>
                                <select
                                    className="w-full h-10 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
                                    value={newStory.team_id || ''}
                                    onChange={(e) => setNewStory(prev => ({ ...prev, team_id: e.target.value }))}
                                    required
                                >
                                    <option value="">Select Team</option>
                                    {teams.map(team => (
                                        <option key={team.id} value={team.id}>{team.name} ({team.prefix})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Platform *</label>
                                <select
                                    className="w-full h-10 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
                                    value={newStory.platform_id || ''}
                                    onChange={(e) => setNewStory(prev => ({ ...prev, platform_id: e.target.value }))}
                                    required
                                >
                                    <option value="">Select Platform</option>
                                    {platforms.map(platform => (
                                        <option key={platform.id} value={platform.id}>{platform.name} ({platform.code})</option>
                                    ))}
                                </select>
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
                    className="sm:max-w-[600px] w-full p-0 overflow-y-auto font-manrope bg-[#faf5ee]/95 backdrop-blur-3xl border-l border-none shadow-2xl flex flex-col"
                >
                    <SheetTitle className="sr-only">Story Details</SheetTitle>
                    {/* Top Control Bar */}
                    <div className="flex items-center justify-between p-6 pb-4 border-b border-[#3a302a]/5 sticky top-0 bg-[#faf5ee] z-10">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(editingStory?.story_code || '');
                                    toast({ title: 'Copied to clipboard', description: editingStory?.story_code });
                                }}
                                className="text-[12px] font-black uppercase tracking-[0.2em] text-[#c2652a] hover:underline flex items-center gap-2"
                            >
                                {editingStory?.story_code || 'NEW STORY'}
                                <Copy className="h-3 w-3" />
                            </button>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => window.open(`/sprint/${sprintId}/board/story/${newStory.id}`, '_blank')}
                                className="h-9 rounded-lg border-[#c2652a] text-[#c2652a] hover:bg-[#c2652a] hover:text-white transition-all font-bold text-xs"
                            >
                                <ExternalLink className="h-3.5 w-3.5 mr-2" />
                                Open Full Details
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setIsEditStoryDialogOpen(false)}
                                className="h-9 w-9 bg-[#3a302a]/5 hover:bg-[#c2652a] text-[#3a302a]/40 hover:text-white rounded-full transition-all group"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 px-8 py-6 space-y-8 pb-12">
                        {/* Title */}
                        <div className="space-y-1">
                            <h1 
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => {
                                    const newTitle = e.currentTarget.innerText;
                                    if (newTitle.trim()) {
                                        setNewStory(prev => ({ ...prev, title: newTitle }));
                                        handleSaveEditStory();
                                    }
                                }}
                                className="text-[28px] font-eb-garamond font-bold text-[#3a302a] leading-tight tracking-tight focus:outline-none focus:bg-[#3a302a]/5 px-2 -ml-2 rounded-xl transition-all cursor-text"
                            >
                                {newStory.title || "Untitled Story"}
                            </h1>
                        </div>

                        {/* Basic Attributes Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Status */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-[#3a302a]/40 uppercase tracking-widest">Status</label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#3a302a]/10 rounded-lg cursor-pointer hover:border-[#c2652a]/30 transition-all">
                                            <div className={cn("h-2 w-2 rounded-full", getStatusDotColor(newStory.status || 'todo'))} />
                                            <span className="text-xs font-bold text-[#3a302a] flex-1">{getStatusLabel(newStory.status || 'todo')}</span>
                                            <ChevronDown className="h-3 w-3 text-[#3a302a]/30" />
                                        </div>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-[200px]">
                                        {['todo', 'in_progress', 'in_review', 'done', 'blocked'].map((status) => (
                                            <DropdownMenuItem 
                                                key={status}
                                                onClick={() => {
                                                    setNewStory(prev => ({ ...prev, status: status as any }));
                                                    handleSaveEditStory();
                                                }}
                                                className="flex items-center gap-2"
                                            >
                                                <div className={cn("h-2 w-2 rounded-full", getStatusDotColor(status))} />
                                                <span className="text-xs font-bold">{getStatusLabel(status)}</span>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Priority */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-[#3a302a]/40 uppercase tracking-widest">Priority</label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#3a302a]/10 rounded-lg cursor-pointer hover:border-[#c2652a]/30 transition-all">
                                            <span className="text-xs font-bold text-[#3a302a] flex-1 capitalize">{newStory.priority || 'Medium'}</span>
                                            <ChevronDown className="h-3 w-3 text-[#3a302a]/30" />
                                        </div>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-[200px]">
                                        {['low', 'medium', 'high', 'urgent'].map((p) => (
                                            <DropdownMenuItem 
                                                key={p}
                                                onClick={() => {
                                                    setNewStory(prev => ({ ...prev, priority: p as any }));
                                                    handleSaveEditStory();
                                                }}
                                                className="text-xs font-bold capitalize"
                                            >
                                                {p}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Assignee */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-[#3a302a]/40 uppercase tracking-widest">Assignee</label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#3a302a]/10 rounded-lg cursor-pointer hover:border-[#c2652a]/30 transition-all">
                                            <Avatar className="h-4 w-4">
                                                <AvatarFallback className="bg-[#c2652a] text-white text-[8px] font-bold">
                                                    {newStory.assignee ? newStory.assignee.substring(0, 2).toUpperCase() : '??'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-xs font-bold text-[#3a302a] flex-1">{newStory.assignee || 'Unassigned'}</span>
                                            <ChevronDown className="h-3 w-3 text-[#3a302a]/30" />
                                        </div>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-[200px]">
                                        <DropdownMenuItem 
                                            onClick={() => {
                                                setNewStory(prev => ({ ...prev, assignee: undefined }));
                                                handleSaveEditStory();
                                            }}
                                            className="text-xs font-bold"
                                        >
                                            Unassigned
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        {orgMembers.map((member) => (
                                            <DropdownMenuItem 
                                                key={member.id}
                                                onClick={() => {
                                                    setNewStory(prev => ({ ...prev, assignee: member.display_name }));
                                                    handleSaveEditStory();
                                                }}
                                                className="text-xs font-bold"
                                            >
                                                {member.display_name}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Due Date */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-[#3a302a]/40 uppercase tracking-widest">Due Date</label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#3a302a]/10 rounded-lg cursor-pointer hover:border-[#c2652a]/30 transition-all">
                                            <CalendarIcon className="h-3 w-3 text-[#3a302a]/40" />
                                            <span className="text-xs font-bold text-[#3a302a] flex-1">
                                                {newStory.due_date ? format(new Date(newStory.due_date), "MMM d, yyyy") : 'Set Date'}
                                            </span>
                                            <ChevronDown className="h-3 w-3 text-[#3a302a]/30" />
                                        </div>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="p-0">
                                        <Calendar
                                            mode="single"
                                            selected={newStory.due_date ? new Date(newStory.due_date) : undefined}
                                            onSelect={(date) => {
                                                if (date) {
                                                    setNewStory(prev => ({ ...prev, due_date: date.toISOString() }));
                                                    handleSaveEditStory();
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* Story Points & Progress */}
                        <div className="bg-white border border-[#3a302a]/10 rounded-xl p-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-[#3a302a]/40 uppercase tracking-widest">Completed Points</label>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="number"
                                                value={newStory.completedStoryPoints || ''}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value) || 0;
                                                    setNewStory(prev => ({ ...prev, completedStoryPoints: val }));
                                                    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
                                                    autoSaveTimerRef.current = setTimeout(() => handleSaveEditStory(), 1000);
                                                }}
                                                className="w-12 border border-[#3a302a]/10 rounded text-center text-sm font-bold p-1"
                                                placeholder="0"
                                            />
                                            <span className="text-sm font-bold text-[#3a302a]/40">/</span>
                                            <input 
                                                type="number"
                                                value={newStory.storyPoints || ''}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value) || 0;
                                                    setNewStory(prev => ({ ...prev, storyPoints: val }));
                                                    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
                                                    autoSaveTimerRef.current = setTimeout(() => handleSaveEditStory(), 1000);
                                                }}
                                                className="w-12 border border-[#3a302a]/10 rounded text-center text-sm font-bold p-1"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 px-4 space-y-2">
                                        <div className="flex justify-between items-center text-[10px] font-black text-[#3a302a]/40 uppercase tracking-widest">
                                            <span>Progress</span>
                                            <span>{(newStory.storyPoints && newStory.storyPoints > 0) ? Math.round(((newStory.completedStoryPoints || 0) / newStory.storyPoints) * 100) : 0}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-[#3a302a]/5 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-[#c2652a] transition-all" 
                                                style={{ width: `${(newStory.storyPoints && newStory.storyPoints > 0) ? Math.round(((newStory.completedStoryPoints || 0) / newStory.storyPoints) * 100) : 0}%` }} 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#3a302a]/40 uppercase tracking-widest">Description</label>
                            <div className="bg-white border border-[#3a302a]/10 rounded-xl overflow-hidden group">
                                <AnimatePresence>
                                    {isDescriptionFocused && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-b border-[#3a302a]/5 bg-[#3a302a]/[0.02] overflow-hidden"
                                        >
                                            <div className="flex items-center gap-0.5 p-1">
                                                <Button variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('bold')} className="h-7 w-7 rounded hover:bg-[#3a302a]/5">
                                                    <Bold className="h-3.5 w-3.5 text-[#3a302a]/60" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('italic')} className="h-7 w-7 rounded hover:bg-[#3a302a]/5">
                                                    <Italic className="h-3.5 w-3.5 text-[#3a302a]/60" />
                                                </Button>
                                                <div className="w-[1px] h-3 bg-[#3a302a]/10 mx-1" />
                                                <Button variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('list')} className="h-7 w-7 rounded hover:bg-[#3a302a]/5">
                                                    <List className="h-3.5 w-3.5 text-[#3a302a]/60" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('ordered')} className="h-7 w-7 rounded hover:bg-[#3a302a]/5">
                                                    <ListOrdered className="h-3.5 w-3.5 text-[#3a302a]/60" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('todo')} className="h-7 w-7 rounded hover:bg-[#3a302a]/5">
                                                    <ListTodo className="h-3.5 w-3.5 text-[#3a302a]/60" />
                                                </Button>
                                                <div className="w-[1px] h-3 bg-[#3a302a]/10 mx-1" />
                                                <Button variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('table')} className="h-7 w-7 rounded hover:bg-[#3a302a]/5" title="Insert Table">
                                                    <Table className="h-3.5 w-3.5 text-[#3a302a]/60" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('add-row')} className="h-7 w-7 rounded hover:bg-[#3a302a]/5" title="Add Row">
                                                    <Rows className="h-3.5 w-3.5 text-[#3a302a]/60" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('add-col')} className="h-7 w-7 rounded hover:bg-[#3a302a]/5" title="Add Column">
                                                    <Columns className="h-3.5 w-3.5 text-[#3a302a]/60" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('delete-row')} className="h-7 w-7 rounded hover:bg-red-50 group/del" title="Delete Row">
                                                    <Rows className="h-3.5 w-3.5 text-red-400 group-hover/del:text-red-600" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('delete-col')} className="h-7 w-7 rounded hover:bg-red-50 group/del" title="Delete Column">
                                                    <Columns className="h-3.5 w-3.5 text-red-400 group-hover/del:text-red-600" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('delete-table')} className="h-7 w-7 rounded hover:bg-red-50 group/del" title="Delete Entire Table">
                                                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                                </Button>
                                                <div className="w-[1px] h-3 bg-[#3a302a]/10 mx-1" />
                                                <Button variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('link')} className="h-7 w-7 rounded hover:bg-[#3a302a]/5">
                                                    <Link2 className="h-3.5 w-3.5 text-[#3a302a]/60" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('copy')} className="h-7 w-7 rounded hover:bg-[#3a302a]/5 ml-auto">
                                                    <Copy className="h-3.5 w-3.5 text-[#3a302a]/60" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            <div className="relative">
                                <div
                                    ref={descriptionRef as any}
                                    contentEditable
                                    onPaste={handlePaste}
                                    onFocus={() => setIsDescriptionFocused(true)}
                                    onBlur={(e) => {
                                        const val = e.currentTarget.innerHTML;
                                        setNewStory(prev => ({ ...prev, description: val }));
                                        setIsDescriptionFocused(false);
                                        handleSaveEditStory();
                                    }}
                                    dangerouslySetInnerHTML={{ __html: newStory.description || '' }}
                                    className="p-4 min-h-[150px] text-sm focus:outline-none sahara-editor"
                                />
                            </div>
                        </div>
                    </div>

                        {/* Comments */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-[#3a302a]/40 uppercase tracking-widest">Comments</label>
                            <div className="flex gap-2">
                                <div 
                                    ref={commentInputRef}
                                    contentEditable
                                    className="flex-1 bg-white border border-[#3a302a]/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#c2652a] comment-input-placeholder"
                                    data-placeholder="Share your thoughts or update the team..."
                                />
                                <Button 
                                    onClick={handleAddComment}
                                    className="bg-[#c2652a] hover:bg-[#a15423] text-white"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                            
                            <div className="space-y-3 mt-4">
                                {(newStory.comments || []).map((c: any, i: number) => (
                                    <div key={i} className="flex gap-3">
                                        <Avatar className="h-6 w-6">
                                            <AvatarFallback className="bg-[#3a302a] text-white text-[8px] font-bold">
                                                {c.user_name?.charAt(0).toUpperCase() || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="bg-white border border-[#3a302a]/5 rounded-xl rounded-tl-none p-3 flex-1 text-sm">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-xs">{c.user_name}</span>
                                                    <span className="text-[10px] text-[#3a302a]/40">{new Date(c.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="text-[#3a302a]/20 hover:text-[#3a302a] transition-all">
                                                            <MoreVertical className="h-3 w-3" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-32 bg-white rounded-xl border-[#3a302a]/5 shadow-xl p-1">
                                                        <DropdownMenuItem onClick={() => handleStartEditComment(c)} className="flex items-center gap-2 text-[12px] font-bold text-[#3a302a]/70 rounded-lg cursor-pointer">
                                                            <Edit className="h-3 w-3" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleShareComment(c.id)} className="flex items-center gap-2 text-[12px] font-bold text-[#3a302a]/70 rounded-lg cursor-pointer">
                                                            <Share2 className="h-3 w-3" /> Share
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDeleteComment(c.id)} className="flex items-center gap-2 text-[12px] font-bold text-red-500 rounded-lg cursor-pointer hover:bg-red-50 focus:bg-red-50">
                                                            <Trash2 className="h-3 w-3" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            {editingCommentId === c.id ? (
                                                <div className="space-y-2 mt-1">
                                                    <textarea 
                                                        value={editingCommentText}
                                                        onChange={(e) => setEditingCommentText(e.target.value)}
                                                        className="w-full bg-white border border-[#c2652a]/30 rounded-lg p-2 text-sm focus:outline-none min-h-[60px]"
                                                    />
                                                    <div className="flex gap-2">
                                                        <Button size="sm" onClick={() => handleSaveCommentEdit(c.id)} className="h-7 text-[10px] bg-[#c2652a]">Save</Button>
                                                        <Button size="sm" variant="ghost" onClick={() => setEditingCommentId(null)} className="h-7 text-[10px]">Cancel</Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <p className="text-[#3a302a]/70">
                                                        {c.text}
                                                        {c.edited_at && <span className="text-[8px] text-[#3a302a]/30 ml-1 italic">(edited)</span>}
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <button 
                                                            onClick={() => setReplyingToId(c.id)}
                                                            className="text-[10px] font-bold text-[#3a302a]/30 hover:text-[#c2652a] flex items-center gap-1"
                                                        >
                                                            <Reply className="h-3 w-3" /> Reply
                                                        </button>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <button className="flex items-center gap-1 text-[10px] font-bold text-[#3a302a]/30 hover:text-[#c2652a]">
                                                                    <Smile className="h-3 w-3" />
                                                                    {c.reactions?.length > 0 && (
                                                                        <div className="flex gap-1 ml-1">
                                                                            {c.reactions.map((r: any, idx: number) => (
                                                                                <span key={idx} className="bg-[#3a302a]/5 px-1 rounded">{r.emoji} {r.count}</span>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </button>
                                                            </PopoverTrigger>
                                                            <PopoverContent side="top" align="start" className="w-fit p-1 bg-white rounded-full shadow-xl border-[#3a302a]/5 flex gap-1">
                                                                {['👍', '❤️', '🔥', '🚀', '😄', '💯'].map(emoji => (
                                                                    <button 
                                                                        key={emoji}
                                                                        onClick={() => handleToggleReaction(c.id, emoji)}
                                                                        className="h-7 w-7 hover:bg-[#3a302a]/5 rounded-full flex items-center justify-center text-base transition-all"
                                                                    >
                                                                        {emoji}
                                                                    </button>
                                                                ))}
                                                            </PopoverContent>
                                                        </Popover>
                                                    </div>

                                                    {/* Reply Box */}
                                                    {replyingToId === c.id && (
                                                        <div className="mt-2 pl-3 border-l-2 border-[#c2652a]/20 space-y-2">
                                                            <textarea 
                                                                autoFocus
                                                                placeholder="Write a reply..."
                                                                value={replyText}
                                                                onChange={(e) => setReplyText(e.target.value)}
                                                                className="w-full bg-white border border-[#3a302a]/10 rounded-lg p-2 text-[12px] focus:outline-none min-h-[50px]"
                                                            />
                                                            <div className="flex gap-2">
                                                                <button onClick={() => handleAddReply(c.id)} className="px-2 py-1 bg-[#c2652a] text-white text-[10px] rounded">Reply</button>
                                                                <button onClick={() => setReplyingToId(null)} className="px-2 py-1 text-[#3a302a]/40 text-[10px]">Cancel</button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Nested Replies */}
                                                    {c.replies?.length > 0 && (
                                                        <div className="mt-2 space-y-2">
                                                            <button 
                                                                onClick={() => toggleReplies(c.id)}
                                                                className="text-[9px] font-black text-[#c2652a] uppercase tracking-widest flex items-center gap-1 hover:underline"
                                                            >
                                                                {expandedCommentIds.has(c.id) ? <ChevronUp className="h-2 w-2" /> : <ChevronDown className="h-2 w-2" />}
                                                                {c.replies.length} {c.replies.length === 1 ? 'Reply' : 'Replies'}
                                                            </button>
                                                            
                                                            <AnimatePresence>
                                                                {expandedCommentIds.has(c.id) && (
                                                                    <motion.div 
                                                                        initial={{ opacity: 0, height: 0 }}
                                                                        animate={{ opacity: 1, height: 'auto' }}
                                                                        exit={{ opacity: 0, height: 0 }}
                                                                        className="pl-4 border-l border-[#3a302a]/5 space-y-2 overflow-hidden"
                                                                    >
                                                                        {c.replies.map((reply: any, idx: number) => (
                                                                            <div key={reply.id || idx} className="flex gap-2 py-1">
                                                                                <Avatar className="h-4 w-4">
                                                                                    <AvatarFallback className="bg-[#3a302a] text-white text-[6px] font-bold">
                                                                                        {reply.user_name?.charAt(0).toUpperCase()}
                                                                                    </AvatarFallback>
                                                                                </Avatar>
                                                                                <div className="flex-1">
                                                                                    <div className="flex items-center gap-1.5">
                                                                                        <span className="text-[10px] font-bold text-[#3a302a]">{reply.user_name}</span>
                                                                                        <span className="text-[8px] text-[#3a302a]/30">{new Date(reply.created_at).toLocaleDateString()}</span>
                                                                                    </div>
                                                                                    <p className="text-[11px] text-[#3a302a]/70">{reply.text}</p>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
