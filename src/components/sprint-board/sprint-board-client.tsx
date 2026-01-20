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
    PanelRightOpen
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/logo';
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
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import type { Sprint } from '@/components/dashboard/create-sprint-dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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
    assignee?: string;
    priority: 'low' | 'medium' | 'high';
    status?: 'not-started' | 'in-progress' | 'completed' | 'blocked';
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
    {
        id: 'backlog',
        title: 'Backlog',
        gradient: 'slate',
        stories: [
            {
                id: 'story-1',
                title: 'User Authentication System',
                description: 'Implement JWT-based authentication with refresh tokens and secure password storage',
                storyPoints: 8,
                assignee: 'Sarah Chen',
                priority: 'high',
                status: 'not-started'
            },
            {
                id: 'story-2',
                title: 'Database Migration Script',
                description: 'Create migration scripts for updating user schema to support new fields',
                storyPoints: 5,
                assignee: 'Mike Johnson',
                priority: 'medium',
                status: 'not-started'
            },
            {
                id: 'story-3',
                title: 'API Documentation',
                description: 'Write comprehensive API documentation using Swagger/OpenAPI specification',
                storyPoints: 3,
                assignee: 'Emma Wilson',
                priority: 'low',
                status: 'not-started'
            },
            {
                id: 'story-4',
                title: 'Email Notification Service',
                description: 'Set up email service integration for user notifications and alerts',
                storyPoints: 5,
                assignee: 'David Lee',
                priority: 'medium',
                status: 'not-started'
            },
            {
                id: 'story-5',
                title: 'Payment Gateway Integration',
                description: 'Integrate Stripe payment gateway for subscription management',
                storyPoints: 13,
                assignee: 'Alex Turner',
                priority: 'high',
                status: 'not-started'
            }
        ]
    },
    {
        id: 'todo',
        title: 'To Do',
        gradient: 'blue',
        stories: [
            {
                id: 'story-6',
                title: 'User Profile Page',
                description: 'Design and implement user profile page with edit capabilities',
                storyPoints: 8,
                assignee: 'Rachel Green',
                priority: 'high',
                status: 'not-started'
            },
            {
                id: 'story-7',
                title: 'Search Functionality',
                description: 'Add full-text search with filters and sorting options',
                storyPoints: 8,
                assignee: 'Tom Harris',
                priority: 'medium',
                status: 'not-started'
            },
            {
                id: 'story-8',
                title: 'Dashboard Analytics',
                description: 'Create analytics dashboard with charts and key metrics',
                storyPoints: 13,
                assignee: 'Lisa Park',
                priority: 'high',
                status: 'not-started'
            },
            {
                id: 'story-9',
                title: 'Mobile Responsive Design',
                description: 'Optimize all pages for mobile and tablet devices',
                storyPoints: 5,
                assignee: 'John Smith',
                priority: 'medium',
                status: 'not-started'
            },
            {
                id: 'story-10',
                title: 'Unit Tests Setup',
                description: 'Set up Jest and React Testing Library for component testing',
                storyPoints: 3,
                assignee: 'Maria Garcia',
                priority: 'medium',
                status: 'not-started'
            },
            {
                id: 'story-11',
                title: 'File Upload Feature',
                description: 'Implement file upload with drag-and-drop and progress tracking',
                storyPoints: 5,
                assignee: 'Kevin Brown',
                priority: 'low',
                status: 'not-started'
            }
        ]
    },
    {
        id: 'in-progress',
        title: 'In Progress',
        gradient: 'orange',
        stories: [
            {
                id: 'story-12',
                title: 'REST API Endpoints',
                description: 'Develop RESTful API endpoints for CRUD operations',
                storyPoints: 8,
                assignee: 'Chris Anderson',
                priority: 'high',
                status: 'in-progress'
            },
            {
                id: 'story-13',
                title: 'Real-time Chat Feature',
                description: 'Implement WebSocket-based real-time chat with message history',
                storyPoints: 13,
                assignee: 'Nina Patel',
                priority: 'high',
                status: 'in-progress'
            },
            {
                id: 'story-14',
                title: 'Performance Optimization',
                description: 'Optimize bundle size and implement code splitting',
                storyPoints: 5,
                assignee: 'Ryan Mitchell',
                priority: 'medium',
                status: 'in-progress'
            },
            {
                id: 'story-15',
                title: 'Error Handling System',
                description: 'Implement global error handling and logging system',
                storyPoints: 5,
                assignee: 'Sophie Taylor',
                priority: 'medium',
                status: 'in-progress'
            },
            {
                id: 'story-16',
                title: 'Accessibility Improvements',
                description: 'Ensure WCAG 2.1 AA compliance across all components',
                storyPoints: 8,
                assignee: 'James Wilson',
                priority: 'high',
                status: 'in-progress'
            }
        ]
    },
    {
        id: 'review',
        title: 'Review',
        gradient: 'purple',
        stories: [
            {
                id: 'story-17',
                title: 'Admin Dashboard',
                description: 'Create admin panel for user and content management',
                storyPoints: 13,
                assignee: 'Oliver Davis',
                priority: 'high',
                status: 'completed'
            },
            {
                id: 'story-18',
                title: 'Notification System',
                description: 'Build in-app notification system with real-time updates',
                storyPoints: 8,
                assignee: 'Emma Roberts',
                priority: 'medium',
                status: 'completed'
            },
            {
                id: 'story-19',
                title: 'Data Export Feature',
                description: 'Add ability to export data in CSV and PDF formats',
                storyPoints: 5,
                assignee: 'Lucas Martinez',
                priority: 'low',
                status: 'completed'
            },
            {
                id: 'story-20',
                title: 'Integration Tests',
                description: 'Write integration tests for critical user flows',
                storyPoints: 8,
                assignee: 'Ava Thompson',
                priority: 'high',
                status: 'completed'
            },
            {
                id: 'story-21',
                title: 'Security Audit',
                description: 'Conduct security audit and fix identified vulnerabilities',
                storyPoints: 5,
                assignee: 'Ethan Clark',
                priority: 'high',
                status: 'blocked'
            },
            {
                id: 'story-22',
                title: 'Theme Customization',
                description: 'Allow users to customize color themes and preferences',
                storyPoints: 5,
                assignee: 'Mia Anderson',
                priority: 'low',
                status: 'completed'
            }
        ]
    },
    {
        id: 'done',
        title: 'Done',
        gradient: 'green',
        stories: [
            {
                id: 'story-23',
                title: 'Project Setup',
                description: 'Initialize project with Next.js, TypeScript, and Tailwind CSS',
                storyPoints: 3,
                assignee: 'Daniel Kim',
                priority: 'high',
                status: 'completed'
            },
            {
                id: 'story-24',
                title: 'CI/CD Pipeline',
                description: 'Set up GitHub Actions for automated testing and deployment',
                storyPoints: 5,
                assignee: 'Isabella Moore',
                priority: 'high',
                status: 'completed'
            },
            {
                id: 'story-25',
                title: 'Design System',
                description: 'Create component library and design system documentation',
                storyPoints: 8,
                assignee: 'William White',
                priority: 'medium',
                status: 'completed'
            },
            {
                id: 'story-26',
                title: 'Landing Page',
                description: 'Design and develop marketing landing page',
                storyPoints: 8,
                assignee: 'Charlotte Lee',
                priority: 'high',
                status: 'completed'
            },
            {
                id: 'story-27',
                title: 'Environment Configuration',
                description: 'Set up development, staging, and production environments',
                storyPoints: 3,
                assignee: 'Benjamin Scott',
                priority: 'high',
                status: 'completed'
            },
            {
                id: 'story-28',
                title: 'Code Review Guidelines',
                description: 'Document code review process and best practices',
                storyPoints: 2,
                assignee: 'Amelia Young',
                priority: 'low',
                status: 'completed'
            }
        ]
    }
];

export function SprintBoardClient({ sprint: initialSprint, sprintId }: { sprint?: Sprint & { id: string }, sprintId: string }) {
    const router = useRouter();
    const supabase = createClient();
    const { toast } = useToast();
    const [user, setUser] = React.useState<any>(null);
    const [sprint, setSprint] = React.useState<(Sprint & { id: string }) | undefined>(initialSprint);
    const [isLoadingSprint, setIsLoadingSprint] = React.useState(!initialSprint);
    const [columns, setColumns] = React.useState<Column[]>(defaultColumns);
    const [editingColumnId, setEditingColumnId] = React.useState<string | null>(null);
    const [editingColumnTitle, setEditingColumnTitle] = React.useState('');
    const [isAddStoryDialogOpen, setIsAddStoryDialogOpen] = React.useState(false);
    const [selectedColumnId, setSelectedColumnId] = React.useState<string>('');
    const [newStory, setNewStory] = React.useState<Partial<Story>>({
        title: '',
        description: '',
        priority: 'medium',
        storyPoints: 0,
        status: 'not-started'
    });
    const [draggedStory, setDraggedStory] = React.useState<{ storyId: string; sourceColumnId: string } | null>(null);
    const [dragOverColumnId, setDragOverColumnId] = React.useState<string | null>(null);
    const [isSidebarExpanded, setIsSidebarExpanded] = React.useState(true);
    const [showCompletedStories, setShowCompletedStories] = React.useState(true);
    const [filterPriority, setFilterPriority] = React.useState<'all' | 'high' | 'medium' | 'low'>('all');
    const [sortBy, setSortBy] = React.useState<'none' | 'priority' | 'points' | 'assignee'>('none');

    React.useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        checkUser();
    }, [supabase]);

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
                }
            } catch (error) {
                console.error("Failed to fetch sprint", error);
            } finally {
                setIsLoadingSprint(false);
            }
        }

        if (!initialSprint) {
            fetchSprint();
        }
    }, [sprintId, sprint, initialSprint, supabase]);

    const handleColumnTitleClick = (columnId: string, currentTitle: string) => {
        setEditingColumnId(columnId);
        setEditingColumnTitle(currentTitle);
    };

    const handleColumnTitleSave = () => {
        if (editingColumnId && editingColumnTitle.trim()) {
            setColumns(prev => prev.map(col =>
                col.id === editingColumnId ? { ...col, title: editingColumnTitle } : col
            ));
        }
        setEditingColumnId(null);
        setEditingColumnTitle('');
    };

    const handleAddColumn = () => {
        const themeKeys = ['pink', 'indigo', 'teal', 'rose', 'cyan'];
        const randomTheme = themeKeys[Math.floor(Math.random() * themeKeys.length)];

        const newColumn: Column = {
            id: `column-${Date.now()}`,
            title: 'New Column',
            gradient: randomTheme,
            stories: []
        };
        setColumns(prev => [...prev, newColumn]);
    };

    const handleDeleteColumn = (columnId: string) => {
        setColumns(prev => prev.filter(col => col.id !== columnId));
        toast({
            title: 'Column deleted',
            description: 'The column has been removed from the board.'
        });
    };

    const handleOpenAddStory = (columnId: string) => {
        setSelectedColumnId(columnId);
        setIsAddStoryDialogOpen(true);
    };

    const handleAddStory = () => {
        if (!newStory.title?.trim()) {
            toast({
                title: 'Error',
                description: 'Please enter a story title.',
                variant: 'destructive'
            });
            return;
        }

        const story: Story = {
            id: `story-${Date.now()}`,
            title: newStory.title,
            description: newStory.description || '',
            storyPoints: newStory.storyPoints || 0,
            assignee: newStory.assignee,
            priority: newStory.priority || 'medium',
            status: newStory.status || 'not-started'
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
            status: 'not-started'
        });

        toast({
            title: 'Story added',
            description: 'Your story has been added to the board.'
        });
    };

    const handleDeleteStory = (columnId: string, storyId: string) => {
        setColumns(prev => prev.map(col =>
            col.id === columnId
                ? { ...col, stories: col.stories.filter(s => s.id !== storyId) }
                : col
        ));

        toast({
            title: 'Story deleted',
            description: 'The story has been removed.'
        });
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300';
            case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'low': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300';
            default: return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-700 dark:text-zinc-300';
        }
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'not-started': return 'bg-zinc-100 text-zinc-700 border-zinc-300 dark:bg-zinc-700 dark:text-zinc-300';
            case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300';
            case 'completed': return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300';
            case 'blocked': return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300';
            default: return 'bg-zinc-100 text-zinc-700 border-zinc-300 dark:bg-zinc-700 dark:text-zinc-300';
        }
    };

    const getStatusLabel = (status?: string) => {
        switch (status) {
            case 'not-started': return 'Not Started';
            case 'in-progress': return 'In Progress';
            case 'completed': return 'Completed';
            case 'blocked': return 'Blocked';
            default: return 'Not Started';
        }
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, storyId: string, columnId: string) => {
        setDraggedStory({ storyId, sourceColumnId: columnId });
        e.dataTransfer.effectAllowed = 'move';
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = '0.4';
        }
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = '1';
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

    const handleDragLeave = () => {
        setDragOverColumnId(null);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetColumnId: string) => {
        e.preventDefault();

        if (!draggedStory) return;

        const { storyId, sourceColumnId } = draggedStory;

        if (sourceColumnId === targetColumnId) {
            setDraggedStory(null);
            setDragOverColumnId(null);
            return;
        }

        // Find the story being moved
        const sourceColumn = columns.find(col => col.id === sourceColumnId);
        const storyToMove = sourceColumn?.stories.find(s => s.id === storyId);

        if (!storyToMove) return;

        // Remove story from source column and add to target column
        setColumns(prev => prev.map(col => {
            if (col.id === sourceColumnId) {
                return { ...col, stories: col.stories.filter(s => s.id !== storyId) };
            }
            if (col.id === targetColumnId) {
                return { ...col, stories: [...col.stories, storyToMove] };
            }
            return col;
        }));

        setDraggedStory(null);
        setDragOverColumnId(null);

        toast({
            title: 'Story moved',
            description: `Story moved to ${columns.find(col => col.id === targetColumnId)?.title}.`
        });
    };

    const filterAndSortStories = (stories: Story[]) => {
        let filtered = stories;

        // Filter by completed status
        if (!showCompletedStories) {
            filtered = filtered.filter(s => s.status !== 'completed');
        }

        // Filter by priority
        if (filterPriority !== 'all') {
            filtered = filtered.filter(s => s.priority === filterPriority);
        }

        // Sort stories
        if (sortBy !== 'none') {
            filtered = [...filtered].sort((a, b) => {
                if (sortBy === 'priority') {
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
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

    if (isLoadingSprint) {
        return (
            <div className="flex justify-center items-center h-screen bg-zinc-50 dark:bg-zinc-950">
                <Loader2 className="animate-spin h-10 w-10 text-primary" />
            </div>
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
        <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-zinc-950 dark:via-purple-950/20 dark:to-zinc-950 font-sans">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-zinc-950/60">
                <div className="flex h-16 items-center justify-between px-6 lg:px-12">
                    <div className="flex items-center gap-6">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all hover:scale-105"
                            onClick={() => router.push(`/sprint/${sprintId}`)}
                        >
                            <ChevronLeft className="h-5 w-5" />
                            <span className="sr-only">Back to Sprint</span>
                        </Button>
                        <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800" />
                        <Logo />
                        <div className="hidden md:flex flex-col">
                            <h1 className="text-lg font-bold text-zinc-900 dark:text-white">
                                {sprint.sprintName}
                            </h1>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400">Track Board</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {user && <UserNav user={user} />}
                    </div>
                </div>
            </header>

            {/* Main Content with Sidebar */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className={cn(
                    "border-r border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl transition-all duration-300 flex flex-col",
                    isSidebarExpanded ? "w-64" : "w-16"
                )}>
                    {/* Sidebar Header */}
                    <div className="flex items-center justify-between p-4 border-b border-zinc-200/50 dark:border-zinc-800/50">
                        {isSidebarExpanded && (
                            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Customization</h2>
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

                {/* Kanban Board */}
                <main className="flex-1 overflow-x-auto p-6 lg:p-8">
                    <div className="flex gap-4 min-h-[calc(100vh-8rem)]">
                        {columns.map((column) => {
                            const theme = columnThemes[column.gradient] || columnThemes['slate'];
                            const filteredStories = filterAndSortStories(column.stories);
                            return (
                            <div key={column.id} className="flex-shrink-0 w-80 flex flex-col">
                            {/* Column Header */}
                            <div className={cn(
                                "relative rounded-t-xl p-4 bg-gradient-to-br shadow-md backdrop-blur-sm",
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
                                            className="text-lg font-bold text-white hover:bg-white/10 px-2 py-1 rounded transition-colors flex items-center gap-2"
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
                                    "flex-1 rounded-b-xl p-4 space-y-3 overflow-y-auto border-x border-b border-zinc-200/50 dark:border-zinc-700/50 backdrop-blur-sm transition-all",
                                    theme.bgColor,
                                    dragOverColumnId === column.id && "ring-2 ring-primary ring-offset-2"
                                )}
                                onDragOver={handleDragOver}
                                onDragEnter={() => handleDragEnter(column.id)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, column.id)}
                            >
                                {filteredStories.length === 0 ? (
                                    <div className="flex items-center justify-center h-32 text-zinc-400 dark:text-zinc-600 text-sm">
                                        {column.stories.length === 0 ? 'No stories yet' : 'No stories match filters'}
                                    </div>
                                ) : (
                                    filteredStories.map((story) => (
                                        <Card
                                            key={story.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, story.id, column.id)}
                                            onDragEnd={handleDragEnd}
                                            className={cn(
                                                "group relative hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-grab active:cursor-grabbing",
                                                theme.cardBg
                                            )}
                                        >
                                            <CardHeader className="p-4 pb-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-sm text-zinc-900 dark:text-white mb-1">
                                                            {story.title}
                                                        </h4>
                                                        {story.description && (
                                                            <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                                                                {story.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <MoreVertical className="h-3 w-3" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
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
                                            </CardHeader>
                                            <CardContent className="p-4 pt-0 space-y-3">
                                                <div className="flex items-center flex-wrap gap-2">
                                                    <Badge variant="outline" className={cn("text-xs font-semibold", getStatusColor(story.status))}>
                                                        {getStatusLabel(story.status)}
                                                    </Badge>
                                                    <Badge variant="outline" className={cn("text-xs", getPriorityColor(story.priority))}>
                                                        Priority: {story.priority}
                                                    </Badge>
                                                    {story.storyPoints !== undefined && story.storyPoints > 0 && (
                                                        <Badge variant="secondary" className="text-xs bg-zinc-200 dark:bg-zinc-700">
                                                            {story.storyPoints} SP
                                                        </Badge>
                                                    )}
                                                </div>
                                                {story.assignee && (
                                                    <div className="mt-3 flex items-center gap-2">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                                                {story.assignee.charAt(0).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-xs text-zinc-600 dark:text-zinc-400">
                                                            {story.assignee}
                                                        </span>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </div>
                        );
                    })}

                    {/* Add Column Button */}
                    <div className="flex-shrink-0 w-80">
                        <Button
                            variant="outline"
                            onClick={handleAddColumn}
                            className="w-full h-32 border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-primary hover:bg-primary/5 transition-all rounded-2xl"
                        >
                            <Plus className="h-6 w-6 mr-2" />
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
                        <DialogTitle>Add New Story</DialogTitle>
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
                                <label className="text-sm font-medium">Priority</label>
                                <select
                                    className="w-full h-10 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
                                    value={newStory.priority || 'medium'}
                                    onChange={(e) => setNewStory(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <select
                                className="w-full h-10 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
                                value={newStory.status || 'not-started'}
                                onChange={(e) => setNewStory(prev => ({ ...prev, status: e.target.value as 'not-started' | 'in-progress' | 'completed' | 'blocked' }))}
                            >
                                <option value="not-started">Not Started</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="blocked">Blocked</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Assignee</label>
                            <Input
                                placeholder="Enter assignee name"
                                value={newStory.assignee || ''}
                                onChange={(e) => setNewStory(prev => ({ ...prev, assignee: e.target.value }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddStoryDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddStory}>
                            Add Story
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
