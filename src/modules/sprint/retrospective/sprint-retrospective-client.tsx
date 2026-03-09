'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, MoreHorizontal, ThumbsUp, Trash2, X, Smile, Frown, StopCircle, PlayCircle, Heart, Shield, Timer, Clock, Settings, Volume2, VolumeX, Pause, Play } from 'lucide-react';
import confetti from 'canvas-confetti';
import { createClient } from '@/auth/supabase/client';
import { Logo } from '@/components/layout/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Label } from '@/components/ui/label';
import { UserNav } from '@/modules/dashboard/user-nav';
import {
    getRetrospectiveDataAction,
    createRetrospectiveColumnAction,
    deleteRetrospectiveColumnAction,
    updateRetrospectiveColumnAction,
    createRetrospectiveItemAction,
    deleteRetrospectiveItemAction,
    toggleVoteAction,
    addRetrospectiveCommentAction,
    getRetrospectiveCommentsAction,
    deleteRetrospectiveCommentAction,
    updateRetrospectiveItemPositionAction,
    updateRetrospectiveItemContentAction
} from '@/backend/actions/retrospective.actions';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
    SheetClose,
} from '@/components/ui/sheet';
import { MessageSquare, Send } from 'lucide-react';
// Types
type Column = {
    id: string;
    title: string;
    color: string;
    position: number;
};

type UserProfile = {
    id: string;
    email: string;
    display_name?: string;
};

type Item = {
    id: string;
    column_id: string;
    content: string;
    created_by: string;
    created_at: string;
    is_anonymous?: boolean;
    profiles?: UserProfile;
    comments_count?: number;
    position?: number;
};

type Vote = {
    id: string;
    item_id: string;
    user_id: string;
    profiles?: UserProfile;
};

const COLOR_MAP: Record<string, string> = {
    red: 'bg-red-100 border-red-200 dark:bg-red-950/30 dark:border-red-900',
    green: 'bg-green-100 border-green-200 dark:bg-green-950/30 dark:border-green-900',
    blue: 'bg-blue-100 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900',
    purple: 'bg-purple-100 border-purple-200 dark:bg-purple-950/30 dark:border-purple-900',
    orange: 'bg-orange-100 border-orange-200 dark:bg-orange-950/30 dark:border-orange-900',
    pink: 'bg-pink-100 border-pink-200 dark:bg-pink-950/30 dark:border-pink-900',
    gray: 'bg-zinc-100 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800',
};

const HEADER_COLOR_MAP: Record<string, string> = {
    red: 'bg-red-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    pink: 'bg-pink-500',
    gray: 'bg-zinc-500',
};

type Comment = {
    id: string;
    content: string;
    created_at: string;
    created_by: string;
    user_name: string;
    user_avatar?: string;
};

// Helper to generate consistent colors from strings
const getAvatarColor = (name: string) => {
    const colors = [
        'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-100 dark:border-red-900',
        'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-100 dark:border-green-900',
        'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900',
        'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-900',
        'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 border-orange-100 dark:border-orange-900',
        'bg-pink-50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300 border-pink-100 dark:border-pink-900',
        'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-300 border-yellow-100 dark:border-yellow-900',
        'bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 border-teal-100 dark:border-teal-900',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

export function SprintRetrospectiveClient({ sprintId }: { sprintId: string }) {
    const router = useRouter();
    const supabase = createClient();
    const { toast } = useToast();
    const [user, setUser] = React.useState<any>(null);
    const [columns, setColumns] = React.useState<Column[]>([]);
    const [items, setItems] = React.useState<Item[]>([]);
    const [votes, setVotes] = React.useState<Vote[]>([]);
    const [onlineUsers, setOnlineUsers] = React.useState<any[]>([]);

    // UI States
    const [activeAddColumnId, setActiveAddColumnId] = React.useState<string | null>(null);
    const [newItemContent, setNewItemContent] = React.useState('');
    const [isAnonymous, setIsAnonymous] = React.useState(false);

    // Comments State
    const [selectedItemForComments, setSelectedItemForComments] = React.useState<Item | null>(null);
    const [comments, setComments] = React.useState<Comment[]>([]);
    const [newComment, setNewComment] = React.useState('');
    const [isLoadingComments, setIsLoadingComments] = React.useState(false);

    const [isAddingColumn, setIsAddingColumn] = React.useState(false);
    const [newColumnTitle, setNewColumnTitle] = React.useState('');

    const [isLoading, setIsLoading] = React.useState(true);

    // Native DND State
    const [draggedItem, setDraggedItem] = React.useState<{ itemId: string; sourceColumnId: string } | null>(null);
    const [dragOverColumnId, setDragOverColumnId] = React.useState<string | null>(null);
    const [dragOverItemId, setDragOverItemId] = React.useState<string | null>(null);
    const [dropPosition, setDropPosition] = React.useState<'before' | 'after' | null>(null);

    // Inline Edit State
    const [editingItemId, setEditingItemId] = React.useState<string | null>(null);
    const [editingContent, setEditingContent] = React.useState('');

    // Timer State
    const [timerDuration, setTimerDuration] = React.useState(5 * 60); // 5 minutes default
    const [timerRemaining, setTimerRemaining] = React.useState(5 * 60);
    const [isTimerRunning, setIsTimerRunning] = React.useState(false);
    const [showTimerSettings, setShowTimerSettings] = React.useState(false);
    const [isSoundEnabled, setIsSoundEnabled] = React.useState(true);
    const timerIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

    // Find column for an item
    const findColumn = (uniqueId: string) => {
        if (!uniqueId) return null;
        if (columns.some(c => c.id === uniqueId)) {
            return uniqueId;
        }
        const item = items.find(i => i.id === uniqueId);
        return item ? item.column_id : null;
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, itemId: string, columnId: string) => {
        setDraggedItem({ itemId, sourceColumnId: columnId });
        e.dataTransfer.effectAllowed = 'move';

        // Add visual style to dragged element
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.classList.add('opacity-40', 'scale-95');
        }
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.classList.remove('opacity-40', 'scale-95');
        }
        setDraggedItem(null);
        setDragOverColumnId(null);
        setDragOverItemId(null);
        setDropPosition(null);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleColumnDragEnter = (columnId: string) => {
        setDragOverColumnId(columnId);
    };

    const handleColumnDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;

        if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
            setDragOverColumnId(null);
            setDragOverItemId(null);
            setDropPosition(null);
        }
    };

    const handleItemDragOver = (e: React.DragEvent<HTMLDivElement>, itemId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!draggedItem || draggedItem.itemId === itemId) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        const position = e.clientY < midpoint ? 'before' : 'after';

        setDragOverItemId(itemId);
        setDropPosition(position);
    };

    const handleItemDragLeave = () => {
        setDragOverItemId(null);
        setDropPosition(null);
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>, targetColumnId: string, targetItemId?: string) => {
        e.preventDefault();

        if (!draggedItem) return;

        const { itemId, sourceColumnId } = draggedItem;

        // Find the item being moved
        const itemToMove = items.find(i => i.id === itemId);
        if (!itemToMove) return;

        // Get target column items sorted by position
        const targetColumnItems = items
            .filter(i => i.column_id === targetColumnId && i.id !== itemId)
            .sort((a, b) => (a.position || 0) - (b.position || 0));

        // Calculate new position
        let newPosition = targetColumnItems.length; // Default: end of column

        if (targetItemId && dropPosition) {
            const targetIndex = targetColumnItems.findIndex(i => i.id === targetItemId);
            if (targetIndex !== -1) {
                newPosition = dropPosition === 'before' ? targetIndex : targetIndex + 1;
            }
        }

        // Same column reordering
        if (sourceColumnId === targetColumnId) {
            // Get all items in this column including the dragged one
            const currentItems = items
                .filter(i => i.column_id === sourceColumnId)
                .sort((a, b) => (a.position || 0) - (b.position || 0));

            const currentIndex = currentItems.findIndex(i => i.id === itemId);

            // Calculate target position based on targetItemId
            let targetPosition = currentItems.length - 1; // Default: end

            if (targetItemId && dropPosition) {
                const targetIndex = currentItems.findIndex(i => i.id === targetItemId);
                if (targetIndex !== -1) {
                    if (dropPosition === 'before') {
                        targetPosition = targetIndex;
                    } else {
                        targetPosition = targetIndex + 1;
                    }
                }
            }

            // Don't do anything if dropping on self
            if (currentIndex === targetPosition) {
                setDraggedItem(null);
                setDragOverColumnId(null);
                setDragOverItemId(null);
                setDropPosition(null);
                return;
            }

            // Reorder: remove from old position, insert at new position
            const reorderedItems = [...currentItems];
            const [removed] = reorderedItems.splice(currentIndex, 1);

            // Adjust target position after removal (array shrinks by 1 when removing)
            const insertAt = targetPosition > currentIndex ? targetPosition - 1 : targetPosition;
            reorderedItems.splice(insertAt, 0, removed);

            // Update all items with new positions
            const updatedItems = items.map(item => {
                const newIndex = reorderedItems.findIndex(r => r.id === item.id);
                if (newIndex !== -1) {
                    return { ...item, position: newIndex };
                }
                return item;
            });

            setItems(updatedItems);
            setDraggedItem(null);
            setDragOverColumnId(null);
            setDragOverItemId(null);
            setDropPosition(null);

            // Persist to database
            const finalPosition = reorderedItems.findIndex(r => r.id === itemId);
            updateRetrospectiveItemPositionAction(itemId, targetColumnId, finalPosition)
                .catch(error => {
                    console.error('Reorder failed', error);
                    toast({ title: 'Error reordering item', variant: 'destructive' });
                    getRetrospectiveDataAction(sprintId).then(({ items: originalItems }) => {
                        if (originalItems) setItems(originalItems);
                    });
                });

            return;
        }

        // Cross-column move
        const updatedItem = { ...itemToMove, column_id: targetColumnId, position: newPosition };

        setItems(prev => {
            // Remove from source column
            const withoutMoved = prev.filter(i => i.id !== itemId);
            // Add to target column at new position
            const result = [...withoutMoved, updatedItem];
            return result;
        });

        setDraggedItem(null);
        setDragOverColumnId(null);
        setDragOverItemId(null);
        setDropPosition(null);

        // Persist to database
        updateRetrospectiveItemPositionAction(itemId, targetColumnId, newPosition)
            .catch(error => {
                console.error('Move failed', error);
                toast({ title: 'Error moving item', variant: 'destructive' });
                getRetrospectiveDataAction(sprintId).then(({ items: originalItems }) => {
                    if (originalItems) setItems(originalItems);
                });
            });
    };


    // Inline Edit Handlers
    const handleStartEdit = (item: Item) => {
        setEditingItemId(item.id);
        setEditingContent(item.content);
    };

    const handleSaveEdit = async () => {
        if (!editingItemId || !editingContent.trim()) {
            setEditingItemId(null);
            setEditingContent('');
            return;
        }

        // Optimistic update
        setItems(prev => prev.map(i =>
            i.id === editingItemId ? { ...i, content: editingContent.trim() } : i
        ));

        const itemIdToUpdate = editingItemId;
        const contentToSave = editingContent.trim();

        setEditingItemId(null);
        setEditingContent('');

        try {
            await updateRetrospectiveItemContentAction(itemIdToUpdate, contentToSave);
        } catch (error) {
            console.error('Save edit failed', error);
            toast({ title: 'Error saving changes', variant: 'destructive' });
            // Refetch on error
            const { items: freshItems } = await getRetrospectiveDataAction(sprintId);
            if (freshItems) setItems(freshItems);
        }
    };

    const handleCancelEdit = () => {
        setEditingItemId(null);
        setEditingContent('');
    };

    // Timer Functions
    const triggerCelebration = () => {
        // Fire confetti
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) {
                return clearInterval(interval);
            }
            const particleCount = 50 * (timeLeft / duration);
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#ff69b4']
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#ff69b4']
            });
        }, 250);

        // Play celebration sound immediately using Web Audio API
        if (isSoundEnabled) {
            try {
                const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                // Play a celebratory arpeggio instantly
                const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
                notes.forEach((freq, i) => {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.frequency.value = freq;
                    osc.type = 'triangle'; // Brighter, more celebratory sound
                    gain.gain.setValueAtTime(0.4, audioCtx.currentTime + i * 0.1);
                    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.1 + 0.4);
                    osc.start(audioCtx.currentTime + i * 0.1);
                    osc.stop(audioCtx.currentTime + i * 0.1 + 0.4);
                });
            } catch (e) {
                console.log('Audio not supported');
            }
        }
    };

    const startTimer = () => {
        if (timerRemaining <= 0) {
            setTimerRemaining(timerDuration);
        }
        setIsTimerRunning(true);
    };

    const pauseTimer = () => {
        setIsTimerRunning(false);
    };

    const resetTimer = () => {
        setIsTimerRunning(false);
        setTimerRemaining(timerDuration);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Timer countdown effect
    React.useEffect(() => {
        if (isTimerRunning && timerRemaining > 0) {
            timerIntervalRef.current = setInterval(() => {
                setTimerRemaining(prev => {
                    if (prev <= 1) {
                        setIsTimerRunning(false);
                        triggerCelebration();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, [isTimerRunning]);


    React.useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            try {
                const data = await getRetrospectiveDataAction(sprintId);
                setColumns(data.columns);
                setItems(data.items);
                setVotes(data.votes);
            } catch (error) {
                console.error('Failed to load retro data:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load retrospective data.',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, [sprintId, supabase, toast]);



    // Realtime Subscriptions
    React.useEffect(() => {
        if (!user) return;

        // Presence Channel
        const presenceChannel = supabase.channel(`presence:${sprintId}`)
            .on('presence', { event: 'sync' }, () => {
                const state = presenceChannel.presenceState();
                const users = Object.values(state).flat();
                setOnlineUsers(users);
            })
            .on('presence', { event: 'join' }, ({ key, newPresences }) => {
                newPresences.forEach((p: any) => {
                    if (p.user_id !== user.id) {
                        toast({
                            title: 'Teammate Joined',
                            description: `${p.display_name || p.email} joined the board.`,
                        });
                    }
                });
            })
            .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
                leftPresences.forEach((p: any) => {
                    if (p.user_id !== user.id) {
                        toast({
                            title: 'Teammate Left',
                            description: `${p.display_name || p.email} left the board.`,
                        });
                    }
                });
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await presenceChannel.track({
                        user_id: user.id,
                        email: user.email,
                        display_name: user.user_metadata?.full_name || user.email?.split('@')[0]
                    });
                }
            });

        // Database Changes Channel
        const dbChannel = supabase.channel(`retro:${sprintId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'retrospective_columns', filter: `sprint_id=eq.${sprintId}` }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setColumns(prev => [...prev, payload.new as Column].sort((a, b) => a.position - b.position));
                } else if (payload.eventType === 'DELETE') {
                    setColumns(prev => prev.filter(c => c.id !== payload.old.id));
                } else if (payload.eventType === 'UPDATE') {
                    setColumns(prev => prev.map(c => c.id === payload.new.id ? payload.new as Column : c).sort((a, b) => a.position - b.position));
                }
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'retrospective_items' }, (payload) => { // Filter by column_id is hard since we need to know all column IDs. Just fetching items is lighter.
                // We rely on sprint_id not being on items, so we might get items from other sprints if we don't filter carefully.
                // But the items table doesn't have sprint_id. It has column_id.
                // We can't easily filter by sprint_id here without a join.
                // For now, client-side filter: check if the item's column_id belongs to one of our columns.
                handleItemChange(payload);
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'retrospective_item_votes' }, (payload) => {
                handleVoteChange(payload);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(presenceChannel);
            supabase.removeChannel(dbChannel);
        };
    }, [sprintId, user, supabase, toast]); // Removed columns dependency to avoid re-subscribing. filtering inside callback.

    // Helper to handle item changes safely
    const handleItemChange = (payload: any) => {
        if (payload.eventType === 'INSERT') {
            const newItem = payload.new as Item;
            // Try to find user profile from onlineUsers
            const creator = onlineUsers.find(u => u.user_id === newItem.created_by);
            if (creator) {
                newItem.profiles = {
                    id: creator.user_id,
                    email: creator.email,
                    display_name: creator.display_name,
                };
            }
            setItems(prev => [...prev, newItem]);
        } else if (payload.eventType === 'DELETE') {
            setItems(prev => prev.filter(i => i.id !== payload.old.id));
        } else if (payload.eventType === 'UPDATE') {
            setItems(prev => prev.map(i => i.id === payload.new.id ? { ...i, ...payload.new } : i));
        }
    };

    const handleVoteChange = (payload: any) => {
        if (payload.eventType === 'INSERT') {
            const newVote = payload.new as Vote;
            const voter = onlineUsers.find(u => u.user_id === newVote.user_id);
            if (voter) {
                newVote.profiles = {
                    id: voter.user_id,
                    email: voter.email,
                    display_name: voter.display_name,
                };
            }
            setVotes(prev => [...prev, newVote]);
        } else if (payload.eventType === 'DELETE') {
            setVotes(prev => prev.filter(v => v.id !== payload.old.id));
        }
    };


    // Actions
    const handleAddColumn = async () => {
        if (!newColumnTitle.trim()) return;
        try {
            await createRetrospectiveColumnAction(sprintId, newColumnTitle, 'blue'); // Default to blue for custom
            setIsAddingColumn(false);
            setNewColumnTitle('');
            toast({ title: 'Column added' });
        } catch (error) {
            toast({ title: 'Error adding column', variant: 'destructive' });
        }
    };

    const handleDeleteColumn = async (columnId: string) => {
        if (!confirm('Are you sure? This will delete all items in this column.')) return;
        try {
            await deleteRetrospectiveColumnAction(columnId);
            toast({ title: 'Column deleted' });
        } catch (error) {
            toast({ title: 'Error deleting column', variant: 'destructive' });
        }
    };

    const handleAddItem = async (columnId: string) => {
        if (!newItemContent.trim()) return;

        try {
            await createRetrospectiveItemAction(columnId, newItemContent, isAnonymous);
            setNewItemContent('');
            setIsAnonymous(false);
            setActiveAddColumnId(null);
        } catch (error) {
            toast({ title: 'Error adding item', variant: 'destructive' });
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        try {
            await deleteRetrospectiveItemAction(itemId);
        } catch (error) {
            toast({ title: 'Error deleting item', variant: 'destructive' });
        }
    };

    const handleVote = async (itemId: string) => {
        try {
            await toggleVoteAction(itemId);
            // Optimistic update
            const hasVoted = votes.some(v => v.item_id === itemId && v.user_id === user?.id);
            if (hasVoted) {
                setVotes(prev => prev.filter(v => !(v.item_id === itemId && v.user_id === user?.id)));
            } else if (user) {
                setVotes(prev => [...prev, { id: 'optimistic-' + Date.now(), item_id: itemId, user_id: user.id }]);
            }
        } catch (error) {
            console.error('Vote failed', error);
            toast({
                title: "Error",
                description: "Failed to update vote",
                variant: "destructive",
            });
        }
    };

    // Comments Handlers
    const handleOpenComments = async (item: Item) => {
        setSelectedItemForComments(item);
        setIsLoadingComments(true);
        try {
            const fetchedComments = await getRetrospectiveCommentsAction(item.id);
            setComments(fetchedComments);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load comments",
                variant: "destructive"
            });
        } finally {
            setIsLoadingComments(false);
        }
    };

    const handleAddComment = async () => {
        if (!selectedItemForComments || !newComment.trim()) return;

        const content = newComment;
        setNewComment(''); // Clear input immediately

        // Optimistic update for count
        setItems(prev => prev.map(i => i.id === selectedItemForComments.id ? { ...i, comments_count: (i.comments_count || 0) + 1 } : i));

        // Optimistic update for Selected Item
        setSelectedItemForComments(prev => prev ? { ...prev, comments_count: (prev.comments_count || 0) + 1 } : null);

        try {
            await addRetrospectiveCommentAction(selectedItemForComments.id, content);
            // Realtime will handle the update
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add comment",
                variant: "destructive"
            });
            setNewComment(content); // Restore input on failure
            // Revert optimistic count
            setItems(prev => prev.map(i => i.id === selectedItemForComments.id ? { ...i, comments_count: (i.comments_count || 1) - 1 } : i));
            setSelectedItemForComments(prev => prev ? { ...prev, comments_count: (prev.comments_count || 1) - 1 } : null);
        }
    };

    // Realtime subscription for comments
    React.useEffect(() => {
        if (!selectedItemForComments) return;

        const channel = supabase
            .channel(`comments:${selectedItemForComments.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'retrospective_comments',
                    filter: `item_id=eq.${selectedItemForComments.id}`
                },
                async (payload) => {
                    // Refresh comments to get user details properly
                    const fetchedComments = await getRetrospectiveCommentsAction(selectedItemForComments.id);
                    setComments(fetchedComments);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedItemForComments, supabase]);

    // Loading State
    // Loading State
    if (isLoading) {
        return <LoadingScreen message="Loading Retrospective..." />;
    }

    // Initializing State (if loading finished but columns not yet set - rare edge case or realtime lag)
    if (columns.length === 0) {
        return (
            <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-lg shadow-primary/20"></div>
                    <p className="text-sm font-medium text-zinc-500 animate-pulse tracking-wide">Initializing Board...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 text-zinc-900 dark:text-zinc-100 font-sans">
            {/* Header */}
            <header className="flex-none h-16 border-b border-white/20 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md flex items-center justify-between px-6 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent">
                            Sprint {sprintId} Retrospective
                        </h1>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 font-medium">
                            <span className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span>
                                {onlineUsers.length} online
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* Timer Button with Popup */}
                    <div className="relative">
                        <Button
                            variant="ghost"
                            onClick={() => setShowTimerSettings(!showTimerSettings)}
                            className={`h-9 px-3 rounded-full flex items-center gap-2 ${isTimerRunning ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/20 hover:from-violet-500/30 hover:to-purple-500/30' : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
                        >
                            <Timer className={`h-4 w-4 ${isTimerRunning ? 'text-violet-600 dark:text-violet-400 animate-pulse' : 'text-zinc-500'}`} />
                            <span className={`text-sm font-bold tabular-nums ${timerRemaining === 0 ? 'text-green-500' : isTimerRunning ? 'text-violet-600 dark:text-violet-400' : 'text-zinc-600 dark:text-zinc-300'}`}>
                                {formatTime(timerRemaining)}
                            </span>
                            {isTimerRunning && (
                                <div className="w-12 h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-1000"
                                        style={{ width: `${(timerRemaining / timerDuration) * 100}%` }}
                                    />
                                </div>
                            )}
                        </Button>

                        {/* Timer Popup */}
                        {showTimerSettings && (
                            <div className="absolute right-0 top-11 z-50 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-4 w-72">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">⏱️ Writing Timer</h4>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowTimerSettings(false)}
                                        className="h-6 w-6 p-0 rounded-full"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </Button>
                                </div>

                                {/* Timer Display */}
                                <div className="text-center mb-4">
                                    <span className={`text-4xl font-bold tabular-nums ${timerRemaining === 0 ? 'text-green-500 animate-pulse' : isTimerRunning ? 'text-violet-600 dark:text-violet-400' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                        {formatTime(timerRemaining)}
                                    </span>
                                    <div className="text-xs text-zinc-400 mt-1">
                                        {timerRemaining === 0 ? '🎉 Time\'s Up!' : isTimerRunning ? 'Writing in progress...' : 'Ready to start'}
                                    </div>
                                    {/* Progress Bar */}
                                    <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden mt-3">
                                        <div
                                            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-1000"
                                            style={{ width: `${(timerRemaining / timerDuration) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Controls */}
                                <div className="flex items-center justify-center gap-2 mb-4">
                                    {isTimerRunning ? (
                                        <Button
                                            size="sm"
                                            onClick={pauseTimer}
                                            className="h-10 px-6 rounded-full bg-amber-500 hover:bg-amber-600 text-white"
                                        >
                                            <Pause className="h-4 w-4 mr-2" /> Pause
                                        </Button>
                                    ) : (
                                        <Button
                                            size="sm"
                                            onClick={startTimer}
                                            className="h-10 px-6 rounded-full bg-green-500 hover:bg-green-600 text-white"
                                        >
                                            <Play className="h-4 w-4 mr-2" /> Start
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={resetTimer}
                                        className="h-10 px-4 rounded-full"
                                    >
                                        <StopCircle className="h-4 w-4 mr-1" /> Reset
                                    </Button>
                                </div>

                                {/* Duration Options */}
                                <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3">
                                    <Label className="text-xs text-zinc-500 mb-2 block">Duration</Label>
                                    <div className="flex gap-1">
                                        {[1, 3, 5, 10, 15].map((mins) => (
                                            <Button
                                                key={mins}
                                                size="sm"
                                                variant={timerDuration === mins * 60 ? 'default' : 'outline'}
                                                className="flex-1 text-xs h-8"
                                                onClick={() => {
                                                    setTimerDuration(mins * 60);
                                                    setTimerRemaining(mins * 60);
                                                }}
                                            >
                                                {mins}m
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Sound Toggle */}
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                                    <div className="flex items-center gap-2">
                                        {isSoundEnabled ? <Volume2 className="h-4 w-4 text-blue-500" /> : <VolumeX className="h-4 w-4 text-zinc-400" />}
                                        <span className="text-xs text-zinc-500">Sound on completion</span>
                                    </div>
                                    <Switch
                                        checked={isSoundEnabled}
                                        onCheckedChange={setIsSoundEnabled}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex -space-x-3 mr-2">
                        {onlineUsers.slice(0, 5).map((u, i) => (
                            <Avatar key={i} className="h-9 w-9 border-2 border-white dark:border-zinc-900 ring-1 ring-zinc-200 dark:ring-zinc-800 transition-transform hover:scale-110 hover:z-10 bg-white dark:bg-zinc-800">
                                <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                                    {u.display_name?.charAt(0) || u.email?.charAt(0) || '?'}
                                </AvatarFallback>
                            </Avatar>
                        ))}
                        {onlineUsers.length > 5 && (
                            <div className="h-9 w-9 rounded-full bg-zinc-100 dark:bg-zinc-800 border-2 border-white dark:border-zinc-900 ring-1 ring-zinc-200 dark:ring-zinc-800 flex items-center justify-center text-xs font-bold z-10">
                                +{onlineUsers.length - 5}
                            </div>
                        )}
                    </div>
                    {user && <UserNav user={user} />}
                </div>
            </header>

            {/* Board */}
            <main className="flex-1 overflow-x-auto overflow-y-hidden p-6">
                <div className="flex h-full gap-6">
                    {columns.map(column => (
                        <div
                            key={column.id}
                            className={`flex-shrink-0 w-80 flex flex-col h-full max-h-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl rounded-xl border border-white/20 dark:border-zinc-800/50 shadow-sm hover:shadow-md transition-shadow duration-300 ${dragOverColumnId === column.id ? 'ring-2 ring-primary/50 bg-primary/5' : ''}`}
                            onDragOver={handleDragOver}
                            onDragEnter={() => handleColumnDragEnter(column.id)}
                            onDragLeave={handleColumnDragLeave}
                            onDrop={(e) => handleDrop(e, column.id)}
                        >
                            {/* Column Header */}
                            <div className={`p-4 rounded-t-xl flex justify-between items-center shadow-sm ${HEADER_COLOR_MAP[column.color] || 'bg-zinc-500'} bg-opacity-90 backdrop-blur-sm`}>
                                <span className="font-bold text-white tracking-wide text-sm uppercase">{column.title}</span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-white/70 hover:text-white hover:bg-white/20 rounded-full">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40">
                                        <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30 cursor-pointer" onClick={() => handleDeleteColumn(column.id)}>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Items List */}
                            <div className={`flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800 ${COLOR_MAP[column.color] || 'bg-zinc-50/50'}`}>
                                {items.filter(i => i.column_id === column.id).sort((a, b) => (a.position || 0) - (b.position || 0)).map(item => {
                                    const itemVotes = votes.filter(v => v.item_id === item.id);
                                    const hasVoted = itemVotes.some(v => v.user_id === user?.id);
                                    const isDragged = draggedItem?.itemId === item.id;

                                    return (
                                        <div
                                            key={item.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, item.id, column.id)}
                                            onDragEnd={handleDragEnd}
                                            onDragOver={(e) => handleItemDragOver(e, item.id)}
                                            onDragLeave={handleItemDragLeave}
                                            onDrop={(e) => handleDrop(e, column.id, item.id)}
                                            className={`group relative`}
                                        >
                                            {/* Drop indicator before */}
                                            {dragOverItemId === item.id && dropPosition === 'before' && (
                                                <div className="h-0.5 bg-primary rounded-full mb-2 animate-pulse shadow-lg shadow-primary/50" />
                                            )}

                                            <div
                                                onDoubleClick={() => editingItemId !== item.id && handleStartEdit(item)}
                                                className={`bg-white dark:bg-zinc-950 p-4 rounded-lg shadow-sm border border-zinc-200/60 dark:border-zinc-800/60 hover:shadow-lg transition-all duration-200 ${isDragged ? 'opacity-40 scale-95 rotate-2' : ''} ${dragOverItemId === item.id ? 'ring-2 ring-primary/50' : ''} ${editingItemId === item.id ? 'ring-2 ring-primary' : 'cursor-grab active:cursor-grabbing'}`}
                                            >
                                                <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${HEADER_COLOR_MAP[column.color]?.replace('bg-', 'bg-') || 'bg-zinc-500'} opacity-60`}></div>

                                                {editingItemId === item.id ? (
                                                    <div className="pl-2 mb-3">
                                                        <textarea
                                                            autoFocus
                                                            value={editingContent}
                                                            onChange={(e) => {
                                                                setEditingContent(e.target.value);
                                                                // Auto-resize
                                                                e.target.style.height = 'auto';
                                                                e.target.style.height = e.target.scrollHeight + 'px';
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                                    e.preventDefault();
                                                                    handleSaveEdit();
                                                                }
                                                                if (e.key === 'Escape') {
                                                                    handleCancelEdit();
                                                                }
                                                            }}
                                                            onBlur={handleSaveEdit}
                                                            ref={(el) => {
                                                                if (el) {
                                                                    el.style.height = 'auto';
                                                                    el.style.height = el.scrollHeight + 'px';
                                                                }
                                                            }}
                                                            className="w-full text-sm font-medium text-zinc-700 dark:text-zinc-200 bg-transparent border-none outline-none resize-none whitespace-pre-wrap leading-relaxed tracking-wide font-[IP]"
                                                            placeholder="Enter your feedback..."
                                                        />
                                                        <div className="flex gap-2 mt-2">
                                                            <span className="text-[10px] text-zinc-400">Press Enter to save, Esc to cancel</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-3 whitespace-pre-wrap pl-2 leading-relaxed tracking-wide font-[IP]">{item.content}</p>
                                                )}

                                                <div className="flex items-center justify-between pl-2">
                                                    <div className="flex items-center gap-2">
                                                        {item.is_anonymous ? (
                                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                                                <Shield className="h-3 w-3 text-zinc-500" />
                                                                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Anon</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <Avatar className="h-5 w-5 ring-1 ring-zinc-100 dark:ring-zinc-800">
                                                                    <AvatarFallback className="text-[9px] font-bold bg-gradient-to-br from-primary/10 to-primary/5 text-primary">
                                                                        {item.profiles?.email?.charAt(0).toUpperCase() || '?'}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <span className="text-xs font-medium text-zinc-500 truncate max-w-[80px]">
                                                                    {item.profiles?.display_name?.split(' ')[0] || 'User'}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className={`h-7 px-2 gap-1.5 text-xs rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors ${hasVoted ? 'text-primary bg-primary/5 font-semibold' : 'text-zinc-400'}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleVote(item.id);
                                                            }}
                                                            onPointerDown={(e) => e.stopPropagation()}
                                                        >
                                                            <ThumbsUp className={`h-3.5 w-3.5 ${hasVoted ? 'fill-current' : ''}`} />
                                                            <span>{itemVotes.length > 0 ? itemVotes.length : 'Like'}</span>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className={`h-7 px-2 gap-1.5 text-xs rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors ${item.comments_count && item.comments_count > 0 ? 'text-blue-500 bg-blue-500/5 font-semibold' : 'text-zinc-400'}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleOpenComments(item);
                                                            }}
                                                            onPointerDown={(e) => e.stopPropagation()}
                                                        >
                                                            <MessageSquare className={`h-3.5 w-3.5 ${item.comments_count && item.comments_count > 0 ? 'fill-current' : ''}`} />
                                                            <span>{item.comments_count && item.comments_count > 0 ? item.comments_count : ''}</span>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Drop indicator after */}
                                            {dragOverItemId === item.id && dropPosition === 'after' && (
                                                <div className="h-0.5 bg-primary rounded-full mt-2 animate-pulse shadow-lg shadow-primary/50" />
                                            )}
                                        </div>
                                    );
                                })}
                                {/* Empty Column Drop Zone */}
                                {items.filter(i => i.column_id === column.id).length === 0 && (
                                    <div className={`h-32 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg flex items-center justify-center ${dragOverColumnId === column.id ? 'bg-primary/5 border-primary/50' : 'bg-transparent'}`}>
                                        <span className="text-xs text-zinc-400">Drop here</span>
                                    </div>
                                )}
                            </div>

                            {/* Add Item Footer */}
                            <div className="p-3 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-t border-white/20 dark:border-zinc-800/50 rounded-b-xl">
                                {activeAddColumnId === column.id ? (
                                    <div className="space-y-3 bg-white dark:bg-zinc-950 rounded-lg p-3 shadow-lg border border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-bottom-2 fade-in duration-200">
                                        <Textarea
                                            placeholder="Write your thoughts..."
                                            className="min-h-[80px] text-sm resize-none border-zinc-200 dark:border-zinc-800 focus:border-primary/50 focus:ring-primary/20 bg-transparent font-medium placeholder:text-zinc-400"
                                            value={newItemContent}
                                            onChange={(e) => setNewItemContent(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleAddItem(column.id);
                                                }
                                            }}
                                            autoFocus
                                        />
                                        <div className="flex items-center justify-between pt-2">
                                            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsAnonymous(!isAnonymous)}>
                                                <Switch
                                                    id={`anonymous-${column.id}`}
                                                    checked={isAnonymous}
                                                    onCheckedChange={setIsAnonymous}
                                                    className="scale-75 data-[state=checked]:bg-zinc-600"
                                                />
                                                <Label htmlFor={`anonymous-${column.id}`} className="text-xs font-medium text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors cursor-pointer select-none">
                                                    Anonymous
                                                </Label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setActiveAddColumnId(null);
                                                        setNewItemContent('');
                                                        setIsAnonymous(false);
                                                    }}
                                                    className="text-xs h-7 text-zinc-500 hover:text-zinc-900"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleAddItem(column.id)}
                                                    className={`${HEADER_COLOR_MAP[column.color] || 'bg-primary'} h-7 text-xs px-3 shadow-sm hover:opacity-90 transition-opacity`}
                                                >
                                                    Add Card
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start text-zinc-500 hover:text-zinc-900 hover:bg-white/50 dark:hover:bg-zinc-800/50 hover:shadow-sm h-10 px-3 rounded-lg border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all duration-200 group"
                                        onClick={() => {
                                            setActiveAddColumnId(column.id);
                                            setNewItemContent('');
                                            setIsAnonymous(false);
                                        }}
                                    >
                                        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-zinc-100 dark:bg-zinc-800 group-hover:bg-white dark:group-hover:bg-zinc-700 mr-2 transition-colors">
                                            <Plus className="h-3.5 w-3.5" />
                                        </div>
                                        <span className="font-medium text-sm">Add a card</span>
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* New Column Button */}
                    {!isAddingColumn ? (
                        <div className="flex-shrink-0 w-80">
                            <Button
                                variant="outline"
                                className="w-full h-[50px] border-dashed border-2 border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 bg-transparent rounded-xl"
                                onClick={() => setIsAddingColumn(true)}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Column
                            </Button>
                        </div>
                    ) : (
                        <div className="flex-shrink-0 w-80 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl animate-in fade-in zoom-in-95 duration-200 h-fit">
                            <h3 className="font-semibold mb-3 text-sm">New Column</h3>
                            <div className="space-y-3">
                                <Input
                                    placeholder="Column Title (e.g. Kudos)"
                                    value={newColumnTitle}
                                    onChange={(e) => setNewColumnTitle(e.target.value)}
                                    className="bg-zinc-50 dark:bg-zinc-950"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleAddColumn();
                                    }}
                                />
                                <div className="flex gap-2 justify-end">
                                    <Button size="sm" variant="ghost" onClick={() => setIsAddingColumn(false)}>Cancel</Button>
                                    <Button size="sm" onClick={handleAddColumn}>Create</Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Sheet open={!!selectedItemForComments} onOpenChange={(open) => !open && setSelectedItemForComments(null)}>
                <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-0">
                    <SheetHeader className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30">
                        <SheetTitle className="text-xl font-bold flex items-center gap-2 mb-4">
                            <MessageSquare className="h-5 w-5 text-primary" />
                            Comments
                        </SheetTitle>
                        {selectedItemForComments && (
                            <div className="relative bg-white dark:bg-zinc-950 p-4 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
                                <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${HEADER_COLOR_MAP[columns.find(c => c.id === selectedItemForComments.column_id)?.color || 'gray'] || 'bg-zinc-500'} opacity-60`}></div>
                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3 whitespace-pre-wrap pl-3 leading-relaxed tracking-wide">{selectedItemForComments.content}</p>

                                <div className="flex items-center gap-2 pl-3">
                                    {selectedItemForComments.is_anonymous ? (
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                            <Shield className="h-3 w-3 text-zinc-500" />
                                            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Anon</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-5 w-5 ring-1 ring-zinc-100 dark:ring-zinc-800">
                                                <AvatarFallback className="text-[9px] font-bold bg-primary/10 text-primary">
                                                    {selectedItemForComments.profiles?.email?.charAt(0).toUpperCase() || '?'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-xs font-medium text-zinc-500">
                                                {selectedItemForComments.profiles?.display_name || 'User'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {isLoadingComments ? (
                            <div className="flex flex-col items-center justify-center h-40 space-y-3">
                                <LoadingScreen message="" /> {/* Or a smaller local spinner if preferred */}
                                <p className="text-sm text-zinc-400 animate-pulse">Loading discussion...</p>
                            </div>
                        ) : comments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-zinc-400 space-y-4 opacity-60">
                                <div className="h-16 w-16 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                                    <MessageSquare className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
                                </div>
                                <p className="text-sm font-medium">No comments yet. Start the discussion!</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {comments.map((comment) => {
                                    const colorClass = getAvatarColor(comment.created_by || 'unknown');
                                    return (
                                        <div key={comment.id} className="flex gap-4 group animate-in slide-in-from-bottom-2 duration-300">
                                            <Avatar className="h-8 w-8 mt-1 border border-zinc-200 dark:border-zinc-800">
                                                <AvatarImage src={comment.user_avatar} />
                                                <AvatarFallback className="text-[10px] font-bold bg-primary/5 text-primary">
                                                    {comment.user_name.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 space-y-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{comment.user_name}</span>
                                                    <span className="text-xs text-zinc-400">{new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <div className={`p-3 rounded-xl rounded-tl-none text-sm leading-relaxed shadow-sm border ${colorClass}`}>
                                                    {comment.content}
                                                </div>
                                                {user?.id === comment.created_by && (
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                await deleteRetrospectiveCommentAction(comment.id);
                                                                // Optimistic update
                                                                setComments(prev => prev.filter(c => c.id !== comment.id));

                                                                // Optimistic count update
                                                                if (selectedItemForComments) {
                                                                    setItems(prev => prev.map(i => i.id === selectedItemForComments.id ? { ...i, comments_count: Math.max((i.comments_count || 0) - 1, 0) } : i));
                                                                    setSelectedItemForComments(prev => prev ? { ...prev, comments_count: Math.max((prev.comments_count || 0) - 1, 0) } : null);
                                                                }
                                                            } catch (e) {
                                                                toast({ title: 'Error', description: 'Failed to delete comment', variant: 'destructive' });
                                                            }
                                                        }}
                                                        className="text-[10px] text-red-400 hover:text-red-500 hover:underline opacity-0 group-hover:opacity-100 transition-opacity pt-1"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <SheetFooter className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-sm">
                        <div className="flex w-full items-center gap-2 relative">
                            <Input
                                placeholder="Type a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleAddComment();
                                    }
                                }}
                                className="flex-1 pr-12 h-11 border-zinc-200 dark:border-zinc-800 focus:border-primary focus:ring-primary/20 bg-white dark:bg-zinc-950 shadow-sm rounded-xl"
                            />
                            <Button
                                size="icon"
                                className="absolute right-1.5 top-1.5 h-8 w-8 rounded-lg"
                                onClick={handleAddComment}
                                disabled={!newComment.trim()}
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

        </div>
    );
}
