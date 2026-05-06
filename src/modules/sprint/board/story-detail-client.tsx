'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/auth/supabase/client';
import { format } from 'date-fns';
import { cn } from '@/utils/cn';
import { useToast } from '@/hooks/use-toast';
import { updateStory } from '@/backend/actions/stories.actions';
import { getOrganizationMembersAction } from '@/backend/actions/teams.actions';
import { 
    ArrowLeft, Brain, Target, ShieldAlert, Activity, Edit2, Link2, Copy, 
    MoreHorizontal, X, Clock, Users, Zap, Info, ChevronDown, Check, 
    Sparkles, AlertTriangle, CalendarIcon, ArrowRight, Bold, Italic, 
    List, ListOrdered, ListTodo, Table, Rows, Columns, ThumbsUp, Send,
    Plus, FileText, ExternalLink, TrendingUp, AlertCircle, CheckCircle2,
    Trash2, Share2, Edit, Smile, MessageSquare, ChevronUp, Heart,
    Reply, Crop
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
const TAB_ID = typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString();

export function StoryDetailClient({ story, sprintId, sprintInfo }: { story: any, sprintId: string, sprintInfo: any }) {
    const router = useRouter();
    const { toast } = useToast();
    const [orgMembers, setOrgMembers] = React.useState<any[]>([]);
    const [user, setUser] = React.useState<any>(null);
    const [newStory, setNewStory] = React.useState<any>(story);
    const latestStoryRef = React.useRef(newStory);
    React.useEffect(() => {
        latestStoryRef.current = newStory;
    }, [newStory]);
    const [isDescriptionFocused, setIsDescriptionFocused] = React.useState(false);
    const [isCommentFocused, setIsCommentFocused] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState('checklist');
    const [visibleActivitiesCount, setVisibleActivitiesCount] = React.useState(5);
    const descriptionRef = React.useRef<HTMLDivElement>(null);
    const commentInputRef = React.useRef<HTMLDivElement>(null);
    const autoSaveTimerRef = React.useRef<NodeJS.Timeout | null>(null);
    const [editingCommentId, setEditingCommentId] = React.useState<string | null>(null);
    const [editingCommentText, setEditingCommentText] = React.useState('');
    const [replyingToId, setReplyingToId] = React.useState<string | null>(null);
    const [replyText, setReplyText] = React.useState('');
    const [expandedCommentIds, setExpandedCommentIds] = React.useState<Set<string>>(new Set());
    const [selectedImage, setSelectedImage] = React.useState<HTMLImageElement | null>(null);
    const [imageToolbarPos, setImageToolbarPos] = React.useState<{ top: number, left: number } | null>(null);
    const [isResizing, setIsResizing] = React.useState(false);

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
                        img.setAttribute('style', 'max-width: 100% !important; height: auto !important; border-radius: 12px !important; display: block !important;');
                        img.className = 'my-4 cursor-pointer shadow-sm border border-[#3a302a]/5';
                        // Add tracking ID immediately
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

    React.useEffect(() => {
        const checkUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        checkUser();

        const fetchMembers = async () => {
            try {
                const members = await getOrganizationMembersAction();
                setOrgMembers(members || []);
            } catch (error) {
                console.error("Failed to fetch org members:", error);
            }
        };
        fetchMembers();
    }, []);

    React.useEffect(() => {
        const channel = new BroadcastChannel('sahara-board-sync');
        channel.onmessage = (event) => {
            if (event.data.type === 'STORY_UPDATED' && event.data.storyId === newStory.id && event.data.sourceTabId !== TAB_ID) {
                if (event.data.payload) {
                    setNewStory((prev: any) => ({ ...prev, ...event.data.payload }));
                }
                // Refresh server component data to ensure consistency
                router.refresh();
            }
        };
        return () => channel.close();
    }, [newStory.id, router]);

    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (selectedImage && 
                descriptionRef.current && 
                !descriptionRef.current.contains(target) && 
                !target.closest('.image-toolbar')) {
                setSelectedImage(null);
                setImageToolbarPos(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [selectedImage]);

    const getStatusDotColor = (status: string) => {
        switch (status) {
            case 'todo': return 'bg-blue-500';
            case 'in_progress': return 'bg-orange-500';
            case 'in_review': return 'bg-purple-500';
            case 'done': return 'bg-green-500';
            case 'blocked': return 'bg-red-500';
            default: return 'bg-blue-500';
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

    const handleSaveEditStory = async (storyToSave?: any) => {
        const story = storyToSave || latestStoryRef.current;
        if (!story.title?.trim()) return;

        const { error } = await updateStory(story.id, {
            title: story.title,
            description: story.description || undefined,
            story_points: story.storyPoints || 0,
            completed_story_points: Math.min(story.completedStoryPoints || 0, story.storyPoints || 0),
            assignee: story.assignee,
            priority: story.priority as any,
            status: story.status as any,
            tags: story.tags,
            due_date: story.due_date,
            subtasks: story.subtasks,
            comments: story.comments,
            activity_log: story.activity_log,
            identified_risks: story.identified_risks,
            acceptance_criteria: story.acceptance_criteria
        });

        if (error) {
            toast({ title: 'Sync Error', description: 'Failed to auto-save changes', variant: 'destructive' });
        } else {
            const channel = new BroadcastChannel('sahara-board-sync');
            channel.postMessage({ type: 'STORY_UPDATED', storyId: story.id, payload: story, sourceTabId: TAB_ID });
            channel.close();
        }
    };

    const addActivity = (text: string, type: 'status' | 'update' = 'update') => {
        const userName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
        const newActivity = {
            id: crypto.randomUUID(), text, type, user_name: userName, created_at: new Date().toISOString()
        };
        setNewStory((prev: any) => ({ ...prev, activity_log: [newActivity, ...(prev.activity_log || [])] }));
    };

    const handleAddComment = async () => {
        const text = commentInputRef.current?.innerText || '';
        if (!text.trim()) return;
        
        const userName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
        const newComment = {
            id: crypto.randomUUID(), text, user_name: userName, created_at: new Date().toISOString(), likes: 0
        };
        
        const updatedStory = { ...newStory, comments: [newComment, ...(newStory.comments || [])] };
        setNewStory(updatedStory);
        if (commentInputRef.current) commentInputRef.current.innerText = '';
        
        await handleSaveEditStory(updatedStory);
    };

    const handleDeleteComment = async (commentId: string) => {
        const updatedStory = {
            ...newStory,
            comments: newStory.comments.filter((c: any) => c.id !== commentId)
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
            comments: newStory.comments.map((c: any) => 
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
            comments: newStory.comments.map((c: any) => 
                c.id === commentId ? { ...c, replies: [...(c.replies || []), newReply] } : c
            )
        };
        setNewStory(updatedStory);
        setReplyingToId(null);
        setReplyText('');
        // Expand replies when adding a new one
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
            comments: newStory.comments.map((c: any) => 
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

    const handleFormat = (type: string) => {
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
        handleUpdateDescription(editor.innerHTML);
    };

    const handleImageDoubleClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'IMG') {
            e.preventDefault();
            e.stopPropagation();
            const img = target as HTMLImageElement;
            const currentWidth = img.style.width;
            let nextWidth = '200';
            let nextWidthStyle = '200px';
            
            if (currentWidth === '200px') {
                nextWidth = '400';
                nextWidthStyle = '400px';
            } else if (currentWidth === '400px') {
                nextWidth = '600';
                nextWidthStyle = '600px';
            } else if (currentWidth === '600px') {
                nextWidth = '100%';
                nextWidthStyle = '100%';
            }
            
            img.setAttribute('style', `width: ${nextWidthStyle} !important; height: auto !important; max-width: none !important; display: block !important; border: 4px solid #c2652a !important; outline: 4px solid #c2652a !important; filter: brightness(1.1) !important;`);
            img.setAttribute('width', nextWidth);
            
            if (descriptionRef.current) {
                handleUpdateDescription(descriptionRef.current.innerHTML);
            }
            
            toast({ title: `Quick-Resize: ${nextWidthStyle}` });
        }
    };

    const handleImageClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'IMG') {
            const img = target as HTMLImageElement;
            
            let imgId = img.getAttribute('data-img-id');
            if (!imgId) {
                imgId = `img-${Math.random().toString(36).substr(2, 9)}`;
                img.setAttribute('data-img-id', imgId);
            }
            
            setSelectedImage(img);
            img.style.setProperty('outline', '4px solid #c2652a', 'important');
            
            const editorElement = descriptionRef.current;
            if (editorElement) {
                const editorRect = editorElement.getBoundingClientRect();
                const imgRect = img.getBoundingClientRect();
                
                setImageToolbarPos({
                    top: imgRect.top - editorRect.top,
                    left: imgRect.left - editorRect.left
                });
            }
        } else {
            if (!(target.closest('.image-toolbar'))) {
                setSelectedImage(null);
                setImageToolbarPos(null);
            }
        }
    };

    // Keep selected image reference and toolbar in sync after re-renders
    React.useLayoutEffect(() => {
        if (selectedImage) {
            const imgId = selectedImage.getAttribute('data-img-id');
            if (imgId) {
                const newImg = descriptionRef.current?.querySelector(`img[data-img-id="${imgId}"]`) as HTMLImageElement;
                if (newImg && newImg !== selectedImage) {
                    setSelectedImage(newImg);
                    
                    const editorElement = descriptionRef.current;
                    if (editorElement) {
                        const editorRect = editorElement.getBoundingClientRect();
                        const imgRect = newImg.getBoundingClientRect();
                        setImageToolbarPos({
                            top: imgRect.top - editorRect.top,
                            left: imgRect.left - editorRect.left
                        });
                    }
                }
            }
        }
    }, [newStory.description]);

    const handleResizeImage = (size: 'small' | 'medium' | 'large' | 'full') => {
        const imgId = selectedImage?.getAttribute('data-img-id');
        const img = imgId ? (descriptionRef.current?.querySelector(`img[data-img-id="${imgId}"]`) as HTMLImageElement) : selectedImage;
        
        if (!img) {
            toast({ title: "Please click the image again", variant: "destructive" });
            return;
        }
        
        let widthValue = '400';
        if (size === 'small') widthValue = '200';
        if (size === 'large') widthValue = '600';
        if (size === 'full') widthValue = '100%';

        const isPercent = widthValue.includes('%');
        const widthStyle = isPercent ? widthValue : `${widthValue}px`;

        // Setting 'style' attribute directly ensures it's captured in innerHTML for state sync
        img.setAttribute('style', `width: ${widthStyle} !important; height: auto !important; max-width: none !important; display: block !important; border: 4px solid #c2652a !important; outline: 4px solid #c2652a !important; filter: brightness(1.1) !important;`);
        img.setAttribute('width', widthValue);
        
        // Immediate state sync
        if (descriptionRef.current) {
            handleUpdateDescription(descriptionRef.current.innerHTML);
        }

        // Update toolbar position
        const editorElement = descriptionRef.current;
        if (editorElement) {
            const editorRect = editorElement.getBoundingClientRect();
            const imgRect = img.getBoundingClientRect();
            setImageToolbarPos({
                top: imgRect.top - editorRect.top,
                left: imgRect.left - editorRect.left
            });
        }
        
        toast({ title: `Resized to ${size}`, duration: 1000 });
    };

    const handleCropImage = () => {
        const imgId = selectedImage?.getAttribute('data-img-id');
        const img = imgId ? (descriptionRef.current?.querySelector(`img[data-img-id="${imgId}"]`) as HTMLImageElement) : selectedImage;
        
        if (!img) return;
        
        const currentFit = img.style.objectFit;
        let cropStyle = '';
        
        if (!currentFit || currentFit === 'fill') {
            cropStyle = 'object-fit: cover !important; aspect-ratio: 1/1 !important; border-radius: 50% !important; width: 200px !important;';
            img.setAttribute('width', '200');
        } else if (img.style.borderRadius === '50%') {
            cropStyle = 'object-fit: cover !important; aspect-ratio: 16/9 !important; border-radius: 12px !important; width: 100% !important;';
            img.setAttribute('width', '100%');
        } else {
            cropStyle = 'object-fit: fill !important; aspect-ratio: auto !important; border-radius: 0 !important; width: 100% !important;';
            img.setAttribute('width', '100%');
        }
        
        img.setAttribute('style', `${cropStyle} height: auto !important; max-width: none !important; display: block !important; border: 4px solid #c2652a !important; outline: 4px solid #c2652a !important; filter: brightness(1.1) !important;`);
        
        if (descriptionRef.current) {
            handleUpdateDescription(descriptionRef.current.innerHTML);
        }

        const editorElement = descriptionRef.current;
        if (editorElement) {
            const editorRect = editorElement.getBoundingClientRect();
            const imgRect = img.getBoundingClientRect();
            setImageToolbarPos({
                top: imgRect.top - editorRect.top,
                left: imgRect.left - editorRect.left
            });
        }
        
        toast({ title: "Style Toggled", duration: 1000 });
    };

    const handleStartResize = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);

        const startX = e.clientX;
        const startWidth = selectedImage?.offsetWidth || 0;

        const onMouseMove = (moveEvent: MouseEvent) => {
            if (selectedImage) {
                const deltaX = moveEvent.clientX - startX;
                const newWidth = Math.max(50, startWidth + deltaX);
                selectedImage.style.width = `${newWidth}px`;
                selectedImage.style.height = 'auto';
                
                // Update toolbar position
                const editorRect = descriptionRef.current?.getBoundingClientRect();
                const imgRect = selectedImage.getBoundingClientRect();
                if (editorRect) {
                    setImageToolbarPos({
                        top: imgRect.top - editorRect.top,
                        left: imgRect.left - editorRect.left
                    });
                }
            }
        };

        const onMouseUp = () => {
            setIsResizing(false);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            handleUpdateDescription(descriptionRef.current?.innerHTML || '');
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    
    const handleToggleSubtask = (id: string) => {
        setNewStory((prev: any) => ({
            ...prev,
            subtasks: prev.subtasks?.map((t: any) => 
                t.id === id ? { ...t, is_completed: !t.is_completed } : t
            ) || []
        }));
        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = setTimeout(() => handleSaveEditStory(), 1000);
    };

    const handleUpdateDescription = (html: string) => {
        setNewStory((prev: any) => ({ ...prev, description: html }));
        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = setTimeout(() => handleSaveEditStory(), 2000);
    };

    return (
        <div className="flex h-screen bg-[#faf5ee] flex-col overflow-hidden font-manrope">
            <div className="flex-1 overflow-auto">
                <div className="max-w-7xl mx-auto w-full bg-[#faf5ee] min-h-full flex flex-col px-4 sm:px-6 lg:px-8">
                    {/* Inject original UI components */}
                    

                    {/* Top Control Bar */}
                    <div className="flex items-center justify-between py-6 sticky top-0 bg-[#faf5ee]/95 backdrop-blur-md z-20 border-b border-[#3a302a]/5">
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
                                onClick={() => window.close()}
                                className="h-11 w-11 bg-[#3a302a]/5 hover:bg-[#c2652a] text-[#3a302a]/40 hover:text-white rounded-full transition-all group"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 py-8 space-y-10 pb-16">
                        {/* 1. Header & Metric Chips */}
                        <div className="space-y-6">
                            <h1 
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => {
                                    const newTitle = e.currentTarget.innerText;
                                    if (newTitle.trim()) {
                                        setNewStory((prev: any) => ({ ...prev, title: newTitle }));
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
                            
                            <div className="flex items-center flex-wrap gap-4">
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
                                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-12">
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
                            <div className="flex flex-col md:flex-row md:items-center justify-between pt-2 gap-6">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8 flex-1 max-w-2xl">
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
                                                        setNewStory((prev: any) => ({ ...prev, status: status as any }));
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
                                                    setNewStory((prev: any) => ({ ...prev, completedStoryPoints: val }));
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
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                                            <DropdownMenuItem 
                                                onClick={() => {
                                                    setNewStory((prev: any) => ({ ...prev, assignee: undefined }));
                                                    addActivity(`Unassigned story`);
                                                    handleSaveEditStory();
                                                }}
                                                className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer hover:bg-[#c2652a]/5 focus:bg-[#c2652a]/5 outline-none transition-colors"
                                            >
                                                <span className="text-[12px] font-bold text-[#3a302a]">Unassigned</span>
                                            </DropdownMenuItem>
                                            {orgMembers.map((member) => (
                                                <DropdownMenuItem 
                                                    key={member.id}
                                                    onClick={() => {
                                                        setNewStory((prev: any) => ({ ...prev, assignee: member.display_name }));
                                                        addActivity(`Assigned to ${member.display_name}`);
                                                        handleSaveEditStory();
                                                    }}
                                                    className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer hover:bg-[#c2652a]/5 focus:bg-[#c2652a]/5 outline-none transition-colors"
                                                >
                                                    <Avatar className="h-5 w-5">
                                                        <AvatarFallback className="bg-[#3a302a]/10 text-[#3a302a] text-[8px] font-bold">{member.display_name.substring(0,2).toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-[12px] font-bold text-[#3a302a]">{member.display_name}</span>
                                                    {newStory.assignee === member.display_name && <Check className="h-3 w-3 text-[#c2652a] ml-auto" />}
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
                                                setNewStory((prev: any) => ({ ...prev, storyPoints: val }));
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
                                                        setNewStory((prev: any) => ({ ...prev, due_date: dateStr }));
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
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-12">
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
                                                "bg-white border transition-all duration-300 rounded-[32px] shadow-sm min-h-[220px] flex flex-col relative",
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
                                                                <Button variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('delete-row')} className="h-8 w-8 rounded-lg hover:bg-red-50 group/del" title="Delete Row">
                                                                    <Rows className="h-4 w-4 text-red-400 group-hover/del:text-red-600" />
                                                                </Button>
                                                                <Button variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('delete-col')} className="h-8 w-8 rounded-lg hover:bg-red-50 group/del" title="Delete Column">
                                                                    <Columns className="h-4 w-4 text-red-400 group-hover/del:text-red-600" />
                                                                </Button>
                                                                <Button variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('delete-table')} className="h-8 w-8 rounded-lg hover:bg-red-50 group/del" title="Delete Entire Table">
                                                                    <Trash2 className="h-4 w-4 text-red-500" />
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
                                                    onMouseDown={handleImageClick}
                                                    onDoubleClick={handleImageDoubleClick}
                                                    onPaste={handlePaste}
                                                    onBlur={(e) => {
                                                        handleUpdateDescription(e.currentTarget.innerHTML);
                                                        setIsDescriptionFocused(false);
                                                    }}
                                                    onFocus={() => setIsDescriptionFocused(true)}
                                                    className="w-full bg-transparent border-none p-8 focus-visible:outline-none min-h-[220px] h-full text-[15px] leading-relaxed text-[#3a302a]/70 font-medium cursor-text sahara-editor max-w-none"
                                                    dangerouslySetInnerHTML={{ __html: newStory.description || "" }}
                                                />

                                                <AnimatePresence>
                                                    {selectedImage && imageToolbarPos && (
                                                        <>
                                                            {/* Resize Handle */}
                                                            <motion.div
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                style={{
                                                                    position: 'absolute',
                                                                    top: imageToolbarPos.top + selectedImage.offsetHeight - 10,
                                                                    left: imageToolbarPos.left + selectedImage.offsetWidth - 10,
                                                                    width: '20px',
                                                                    height: '20px',
                                                                    cursor: 'nwse-resize',
                                                                    zIndex: 60,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center'
                                                                }}
                                                                onMouseDown={handleStartResize}
                                                            >
                                                                <div className="w-3 h-3 bg-[#c2652a] rounded-full border-2 border-white shadow-md" />
                                                            </motion.div>

                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.9 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0.9 }}
                                                                style={{
                                                                    position: 'absolute',
                                                                    top: imageToolbarPos.top + 10,
                                                                    left: imageToolbarPos.left + 10,
                                                                    zIndex: 9999
                                                                }}
                                                                className="flex items-center gap-1 bg-white shadow-2xl border border-[#3a302a]/10 rounded-xl p-1.5 image-toolbar"
                                                            >
                                                            <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleResizeImage('small'); }} className="text-[10px] font-bold px-3 h-7 rounded-lg hover:bg-[#3a302a]/5 text-[#3a302a]/80">S</button>
                                                            <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleResizeImage('medium'); }} className="text-[10px] font-bold px-3 h-7 rounded-lg hover:bg-[#3a302a]/5 text-[#3a302a]/80">M</button>
                                                            <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleResizeImage('large'); }} className="text-[10px] font-bold px-3 h-7 rounded-lg hover:bg-[#3a302a]/5 text-[#3a302a]/80">L</button>
                                                            <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleResizeImage('full'); }} className="text-[10px] font-bold px-3 h-7 rounded-lg hover:bg-[#3a302a]/5 text-[#3a302a]/80">Full</button>
                                                            <div className="w-[1px] h-4 bg-[#3a302a]/10 mx-1" />
                                                            <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleCropImage(); }} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-[#3a302a]/5 group">
                                                                <Crop className="h-3.5 w-3.5 text-[#3a302a]/60 group-hover:text-[#c2652a]" />
                                                            </button>
                                                            <button 
                                                                onMouseDown={(e) => { 
                                                                    e.preventDefault(); 
                                                                    e.stopPropagation();
                                                                    selectedImage?.remove(); 
                                                                    setSelectedImage(null); 
                                                                    setImageToolbarPos(null);
                                                                    handleUpdateDescription(descriptionRef.current?.innerHTML || '');
                                                                }} 
                                                                className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-red-50 group"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5 text-red-400 group-hover:text-red-600" />
                                                            </button>
                                                        </motion.div>
                                                    </>
                                                )}
                                            </AnimatePresence>
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
                                        ].map((tab: any) => (
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
                                                                    {editingCommentId === comment.id ? (
                                                                        <div className="space-y-3 mt-2">
                                                                            <textarea 
                                                                                value={editingCommentText}
                                                                                onChange={(e) => setEditingCommentText(e.target.value)}
                                                                                className="w-full bg-white border border-[#c2652a]/30 rounded-xl p-3 text-[14px] text-[#3a302a] focus:outline-none focus:ring-2 focus:ring-[#c2652a]/20 transition-all min-h-[80px]"
                                                                            />
                                                                            <div className="flex gap-2">
                                                                                <Button 
                                                                                    size="sm"
                                                                                    onClick={() => handleSaveCommentEdit(comment.id)}
                                                                                    className="h-8 bg-[#c2652a] hover:bg-[#a15423] text-white text-[11px] font-bold rounded-lg"
                                                                                >
                                                                                    Save Changes
                                                                                </Button>
                                                                                <Button 
                                                                                    size="sm"
                                                                                    variant="ghost"
                                                                                    onClick={() => setEditingCommentId(null)}
                                                                                    className="h-8 text-[11px] font-bold text-[#3a302a]/40 hover:text-[#3a302a] rounded-lg"
                                                                                >
                                                                                    Cancel
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <>
                                                                            <p className="text-[14px] leading-relaxed text-[#3a302a]/70 font-medium">
                                                                                {comment.text}
                                                                                {comment.edited_at && <span className="text-[9px] text-[#3a302a]/30 ml-2 italic">(edited)</span>}
                                                                            </p>
                                                                            <div className="flex items-center gap-6 pt-1 opacity-0 group-hover:opacity-100 transition-all">
                                                                                <button 
                                                                                    onClick={() => setReplyingToId(comment.id)}
                                                                                    className="text-[11px] font-bold text-[#3a302a]/30 hover:text-[#c2652a] flex items-center gap-1"
                                                                                >
                                                                                    <Reply className="h-3 w-3" /> Reply
                                                                                </button>
                                                                                <Popover>
                                                                                    <PopoverTrigger asChild>
                                                                                        <button className="flex items-center gap-1.5 text-[11px] font-bold text-[#3a302a]/30 hover:text-[#c2652a]">
                                                                                            <Smile className="h-3 w-3" />
                                                                                            {comment.reactions?.length > 0 && (
                                                                                                <div className="flex gap-1 ml-1">
                                                                                                    {comment.reactions.map((r: any, idx: number) => (
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
                                                                                                onClick={() => handleToggleReaction(comment.id, emoji)}
                                                                                                className="h-8 w-8 hover:bg-[#3a302a]/5 rounded-full flex items-center justify-center text-lg transition-all"
                                                                                            >
                                                                                                {emoji}
                                                                                            </button>
                                                                                        ))}
                                                                                    </PopoverContent>
                                                                                </Popover>
                                                                                <DropdownMenu>
                                                                                    <DropdownMenuTrigger asChild>
                                                                                        <button className="text-[11px] font-bold text-[#3a302a]/30 hover:text-[#3a302a]">
                                                                                            <MoreHorizontal className="h-3 w-3" />
                                                                                        </button>
                                                                                    </DropdownMenuTrigger>
                                                                                    <DropdownMenuContent align="end" className="w-32 bg-white rounded-xl border-[#3a302a]/5 shadow-xl p-1">
                                                                                        <DropdownMenuItem onClick={() => handleStartEditComment(comment)} className="flex items-center gap-2 text-[12px] font-bold text-[#3a302a]/70 rounded-lg cursor-pointer">
                                                                                            <Edit className="h-3 w-3" /> Edit
                                                                                        </DropdownMenuItem>
                                                                                        <DropdownMenuItem onClick={() => handleShareComment(comment.id)} className="flex items-center gap-2 text-[12px] font-bold text-[#3a302a]/70 rounded-lg cursor-pointer">
                                                                                            <Share2 className="h-3 w-3" /> Share
                                                                                        </DropdownMenuItem>
                                                                                        <DropdownMenuItem onClick={() => handleDeleteComment(comment.id)} className="flex items-center gap-2 text-[12px] font-bold text-red-500 rounded-lg cursor-pointer hover:bg-red-50 focus:bg-red-50">
                                                                                            <Trash2 className="h-3 w-3" /> Delete
                                                                                        </DropdownMenuItem>
                                                                                    </DropdownMenuContent>
                                                                                </DropdownMenu>
                                                                            </div>

                                                                            {/* Reply Box */}
                                                                            {replyingToId === comment.id && (
                                                                                <div className="mt-3 pl-4 border-l-2 border-[#c2652a]/20 space-y-2">
                                                                                    <textarea 
                                                                                        autoFocus
                                                                                        placeholder={`Reply to ${comment.user_name}...`}
                                                                                        value={replyText}
                                                                                        onChange={(e) => setReplyText(e.target.value)}
                                                                                        className="w-full bg-white border border-[#3a302a]/10 rounded-xl p-3 text-[13px] text-[#3a302a] focus:outline-none focus:ring-2 focus:ring-[#c2652a]/20 transition-all min-h-[60px]"
                                                                                    />
                                                                                    <div className="flex gap-2">
                                                                                        <Button size="sm" onClick={() => handleAddReply(comment.id)} className="h-7 bg-[#c2652a] text-[10px]">Send Reply</Button>
                                                                                        <Button size="sm" variant="ghost" onClick={() => setReplyingToId(null)} className="h-7 text-[10px]">Cancel</Button>
                                                                                    </div>
                                                                                </div>
                                                                            )}

                                                                            {/* Nested Replies */}
                                                                            {comment.replies?.length > 0 && (
                                                                                <div className="mt-4 space-y-4">
                                                                                    <button 
                                                                                        onClick={() => toggleReplies(comment.id)}
                                                                                        className="text-[11px] font-black text-[#c2652a] uppercase tracking-widest flex items-center gap-2 hover:underline"
                                                                                    >
                                                                                        {expandedCommentIds.has(comment.id) ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                                                                        {comment.replies.length} {comment.replies.length === 1 ? 'Reply' : 'Replies'}
                                                                                    </button>
                                                                                    
                                                                                    <AnimatePresence>
                                                                                        {expandedCommentIds.has(comment.id) && (
                                                                                            <motion.div 
                                                                                                initial={{ opacity: 0, height: 0 }}
                                                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                                                exit={{ opacity: 0, height: 0 }}
                                                                                                className="pl-6 border-l-2 border-[#3a302a]/5 space-y-4 overflow-hidden"
                                                                                            >
                                                                                                {comment.replies.map((reply: any, idx: number) => (
                                                                                                    <div key={reply.id || idx} className="flex gap-3">
                                                                                                        <Avatar className="h-6 w-6">
                                                                                                            <AvatarFallback className="bg-[#3a302a] text-white text-[8px] font-bold">
                                                                                                                {reply.user_name?.charAt(0).toUpperCase()}
                                                                                                            </AvatarFallback>
                                                                                                        </Avatar>
                                                                                                        <div className="flex-1 space-y-1">
                                                                                                            <div className="flex items-center gap-2">
                                                                                                                <span className="text-[12px] font-bold text-[#3a302a]">{reply.user_name}</span>
                                                                                                                <span className="text-[10px] text-[#3a302a]/30">{new Date(reply.created_at).toLocaleDateString()}</span>
                                                                                                            </div>
                                                                                                            <p className="text-[13px] text-[#3a302a]/70 font-medium">{reply.text}</p>
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
                                                                onClick={() => setVisibleActivitiesCount((prev: any) => prev + 5)}
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
                </div>
            </div>
        </div>
    );
}
