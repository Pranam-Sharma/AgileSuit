'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Sprint } from './create-sprint-dialog';
import { Badge } from '../ui/badge';
import { MoreHorizontal, ChevronRight, Loader2, Calendar, Target, ArrowUpRight, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

type SprintCardProps = {
  sprint: Sprint & { id: string };
  onDelete: (sprintId: string) => void;
  variant?: 'grid' | 'list';
};

const getStatusTheme = (status?: string) => {
  const s = status?.toLowerCase() || 'planning';
  switch (s) {
    case 'not_started':
      return {
        label: 'NOT STARTED',
        badge: 'bg-slate-100 text-slate-500 border-slate-200/50',
        dot: 'bg-slate-400',
        glow: 'hover:shadow-[0_20px_40px_-10px_rgba(100,116,139,0.1)]',
        accent: 'text-slate-500',
        progress: 'bg-slate-200',
        bg: 'from-slate-50/30 via-white to-white',
        border: 'border-slate-100',
        innerGlow: ''
      };
    case 'planning':
      return {
        label: 'PLANNING',
        badge: 'bg-blue-600/10 text-blue-700 border-blue-200/50',
        dot: 'bg-blue-500',
        glow: 'hover:shadow-[0_20px_40px_-10px_rgba(59,130,246,0.15)]',
        accent: 'text-blue-600',
        progress: 'bg-blue-200',
        bg: 'from-blue-50/40 via-white to-white',
        border: 'border-blue-100/50',
        innerGlow: 'shadow-[inset_0_0_20px_rgba(59,130,246,0.03)]'
      };
    case 'preparing':
      return {
        label: 'PREPARING',
        badge: 'bg-indigo-600/10 text-indigo-700 border-indigo-200/50',
        dot: 'bg-indigo-500',
        glow: 'hover:shadow-[0_20px_40px_-10px_rgba(99,102,241,0.15)]',
        accent: 'text-indigo-600',
        progress: 'bg-indigo-200',
        bg: 'from-indigo-50/30 via-white to-white',
        border: 'border-indigo-100/50',
        innerGlow: 'shadow-[inset_0_0_20px_rgba(99,102,241,0.03)]'
      };
    case 'active':
      return {
        label: 'ACTIVE',
        badge: 'bg-emerald-600/10 text-emerald-700 border-emerald-200/50',
        dot: 'bg-emerald-500',
        glow: 'hover:shadow-[0_20px_40px_-10px_rgba(16,185,129,0.25)]',
        accent: 'text-emerald-600',
        progress: 'bg-gradient-to-r from-emerald-400 to-emerald-600',
        bg: 'from-emerald-50/40 via-white to-white',
        border: 'border-emerald-100/50',
        innerGlow: 'shadow-[inset_0_0_20px_rgba(16,185,129,0.03)]'
      };
    case 'retrospective':
      return {
        label: 'RETROSPECTIVE',
        badge: 'bg-purple-600/10 text-purple-700 border-purple-200/50',
        dot: 'bg-purple-500',
        glow: 'hover:shadow-[0_20px_40px_-10px_rgba(168,85,247,0.15)]',
        accent: 'text-purple-600',
        progress: 'bg-purple-400',
        bg: 'from-purple-50/30 via-white to-white',
        border: 'border-purple-100/50',
        innerGlow: 'shadow-[inset_0_0_20px_rgba(168,85,247,0.03)]'
      };
    case 'closed':
      return {
        label: 'CLOSED',
        badge: 'bg-slate-600/10 text-slate-700 border-slate-200/50',
        dot: 'bg-slate-500',
        glow: 'hover:shadow-[0_20px_40px_-10px_rgba(100,116,139,0.1)]',
        accent: 'text-slate-600',
        progress: 'bg-slate-900',
        bg: 'from-slate-50/40 via-white to-white',
        border: 'border-slate-100/50',
        innerGlow: 'shadow-[inset_0_0_20px_rgba(100,116,139,0.03)]'
      };
    case 'cancelled':
      return {
        label: 'CANCELLED',
        badge: 'bg-rose-600/10 text-rose-700 border-rose-200/50',
        dot: 'bg-rose-500',
        glow: 'hover:shadow-[0_20px_40px_-10px_rgba(244,63,94,0.1)]',
        accent: 'text-rose-600',
        progress: 'bg-rose-200',
        bg: 'from-rose-50/20 via-white to-white',
        border: 'border-rose-100/40',
        innerGlow: 'shadow-[inset_0_0_20px_rgba(244,63,94,0.02)]'
      };
    default:
      return {
        label: 'PLANNING',
        badge: 'bg-blue-600/10 text-blue-700 border-blue-200/50',
        dot: 'bg-blue-500',
        glow: 'hover:shadow-[0_20px_40px_-10px_rgba(59,130,246,0.15)]',
        accent: 'text-blue-600',
        progress: 'bg-blue-200',
        bg: 'from-blue-50/40 via-white to-white',
        border: 'border-blue-100/50',
        innerGlow: 'shadow-[inset_0_0_20px_rgba(59,130,246,0.03)]'
      };
  }
};

export function SprintCard({ sprint, onDelete, variant = 'grid' }: SprintCardProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);
  const router = useRouter();
  const theme = getStatusTheme(sprint.status);

  const formatDate = (date?: string) => {
    if (!date) return 'TBD';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const calculateProgress = () => {
    const planned = sprint.plannedPoints || 0;
    const completed = sprint.completedPoints || 0;
    return planned > 0 ? (completed / planned) * 100 : 0;
  };

  const handleCardClick = () => {
    router.push(`/sprint/${sprint.id}`);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const { deleteSprintAction } = await import('@/app/actions/sprints');
      await deleteSprintAction(sprint.id);
      toast({ title: 'Sprint Deleted', description: 'Sprint has been successfully removed.' });
      onDelete(sprint.id);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateStatus = async (newStatus: 'not_started' | 'planning' | 'preparing' | 'active' | 'retrospective' | 'closed' | 'cancelled') => {
    if (newStatus === sprint.status) return;
    setIsUpdatingStatus(true);
    try {
      const { updateSprintStatusAction } = await import('@/app/actions/sprints');
      await updateSprintStatusAction(sprint.id, newStatus);
      toast({ title: 'Status Updated', description: `Sprint is now ${newStatus}.` });
    } catch (error: any) {
      toast({ title: 'Update Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (variant === 'list') {
    return (
      <AlertDialog>
        <motion.div
          layout
          layoutId={`card-${sprint.id}`}
          onClick={handleCardClick}
          className={cn(
            "group relative flex items-center gap-6 p-4 bg-gradient-to-br border rounded-2xl cursor-pointer transition-all duration-500",
            "bg-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.02),0_8px_16px_-4px_rgba(0,0,0,0.02)]",
            "hover:-translate-y-1 hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.05),0_24px_48px_-12px_rgba(0,0,0,0.05)]",
            theme.bg,
            theme.border,
            theme.glow
          )}
          transition={{
            layout: { type: "spring", stiffness: 350, damping: 35 },
            opacity: { duration: 0.2 }
          }}
        >
          {/* Subtle Permanent Glow Bar */}
          <div className={cn("absolute inset-y-2 left-0 w-[3px] rounded-r-full opacity-60 transition-all group-hover:inset-y-0 group-hover:w-1 group-hover:opacity-100", theme.dot)} />

          {/* Inner Glass Border */}
          <div className="absolute inset-0 rounded-2xl border border-white/80 pointer-events-none" />

          <motion.div layout layoutId={`title-container-${sprint.id}`} className="w-48 shrink-0">
            <motion.h3 layout layoutId={`title-${sprint.id}`} className="text-sm font-bold text-slate-800 tracking-tight line-clamp-1">{sprint.sprintName}</motion.h3>
            <motion.p layout layoutId={`project-${sprint.id}`} className="text-[11px] font-medium text-slate-400">{sprint.projectName}</motion.p>
          </motion.div>

          <motion.div layout layoutId={`badge-container-${sprint.id}`} className="w-32 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Badge className={cn(
                  "px-2.5 py-0.5 rounded-full border border-transparent font-bold text-[9px] shadow-none cursor-pointer transition-all hover:border-current hover:pl-3 group/badge",
                  theme.badge,
                  isUpdatingStatus && "opacity-50 pointer-events-none"
                )}>
                  {isUpdatingStatus ? (
                    <Loader2 className="h-2 w-2 animate-spin mr-1" />
                  ) : (
                    <span className={cn("h-1 w-1 rounded-full mr-1.5 opacity-60 group-hover/badge:opacity-100", theme.dot)} />
                  )}
                  {theme.label}
                </Badge>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="rounded-xl border-slate-200/60 shadow-xl overflow-hidden min-w-[150px] p-1">
                <DropdownMenuItem onClick={() => handleUpdateStatus('not_started')} className="text-[10px] font-bold py-2 focus:bg-slate-50 cursor-pointer rounded-md">Not Started</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleUpdateStatus('planning')} className="text-[10px] font-bold py-2 focus:bg-blue-50 focus:text-blue-700 cursor-pointer rounded-md">Planning</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleUpdateStatus('preparing')} className="text-[10px] font-bold py-2 focus:bg-indigo-50 focus:text-indigo-700 cursor-pointer rounded-md">Preparing</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleUpdateStatus('active')} className="text-[10px] font-bold py-2 focus:bg-emerald-50 focus:text-emerald-700 cursor-pointer rounded-md">Active</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleUpdateStatus('retrospective')} className="text-[10px] font-bold py-2 focus:bg-purple-50 focus:text-purple-700 cursor-pointer rounded-md">Retrospective</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleUpdateStatus('closed')} className="text-[10px] font-bold py-2 focus:bg-slate-50 focus:text-slate-800 cursor-pointer rounded-md">Closed</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleUpdateStatus('cancelled')} className="text-[10px] font-bold py-2 focus:bg-rose-50 focus:text-rose-700 cursor-pointer rounded-md">Cancelled</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>

          <motion.div layout layoutId={`progress-container-${sprint.id}`} className="flex-1 max-w-xs px-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-slate-500">{sprint.plannedPoints || 0} SP</span>
              <span className="text-[10px] font-bold text-slate-400">{Math.round(calculateProgress())}%</span>
            </div>
            <motion.div layout layoutId={`progress-bar-${sprint.id}`} className="h-1.5 w-full bg-slate-100/60 rounded-full overflow-hidden border border-slate-50">
              <div
                className={cn("h-full rounded-full transition-all duration-1000 ease-out", theme.progress)}
                style={{ width: `${Math.max(4, calculateProgress())}%` }}
              />
            </motion.div>
          </motion.div>

          <div className="w-40 shrink-0 flex items-center gap-2 text-slate-400">
            <Calendar className="h-3.5 w-3.5" />
            <span className="text-[11px] font-bold">{formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}</span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-white/80 rounded-lg">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl border-slate-200/60 shadow-xl min-w-[140px]">
                <DropdownMenuItem onClick={handleCardClick} className="text-xs font-bold py-2 focus:bg-slate-50 cursor-pointer">View Details</DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialogTrigger asChild onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                  <DropdownMenuItem className="text-red-600 text-xs font-bold py-2 focus:bg-red-50 cursor-pointer">Delete</DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
          </div>
        </motion.div>

        <AlertDialogContent className="rounded-[40px] border-white/60 shadow-2xl backdrop-blur-3xl bg-white/90 p-10 max-w-lg">
          <AlertDialogHeader className="space-y-4">
            <div className="h-16 w-16 rounded-3xl bg-red-50 flex items-center justify-center text-red-500 shadow-sm border border-red-100">
              <LogOut className="h-8 w-8" />
            </div>
            <AlertDialogTitle className="text-3xl font-extrabold tracking-tight text-slate-900">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-lg font-medium text-slate-500 leading-relaxed">
              All sprint analytical data for <span className="text-slate-900 font-bold">"{sprint.sprintName}"</span> will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-4 mt-8">
            <AlertDialogCancel disabled={isDeleting} className="rounded-2xl border-slate-200 h-14 px-8 font-bold">Keep</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 text-white rounded-2xl h-14 px-10 font-bold">
              {isDeleting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <AlertDialog>
      <motion.div
        layout
        layoutId={`card-${sprint.id}`}
        transition={{
          layout: { type: "spring", stiffness: 350, damping: 35 },
          opacity: { duration: 0.2 }
        }}
        className="h-full"
      >
        <Card
          onClick={handleCardClick}
          className={cn(
            "group relative flex flex-col h-full min-h-[225px] bg-gradient-to-br border rounded-[32px] overflow-hidden cursor-pointer transition-all duration-700",
            "bg-white shadow-[0_4px_12px_-2px_rgba(0,0,0,0.03),0_12px_24px_-4px_rgba(0,0,0,0.02)]",
            "hover:-translate-y-3 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1),0_40px_80px_-20px_rgba(0,0,0,0.1)]",
            theme.bg,
            theme.border,
            theme.glow,
            theme.innerGlow
          )}
        >
          {/* Permanent Thematic Glow Gradient */}
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-[0.03] group-hover:opacity-10 transition-opacity duration-700 -z-10", theme.bg)} />

          {/* Top Status Bar Accent */}
          <div className={cn("absolute top-0 left-0 right-0 h-1 opacity-40 group-hover:opacity-100 transition-opacity", theme.dot)} />

          {/* Inner Glass Border / Shine */}
          <div className="absolute inset-0 rounded-[32px] border border-white/60 pointer-events-none z-10" />
          <div className="absolute top-0 left-0 right-0 h-[50%] bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

          <CardHeader className="p-5 pb-0 flex flex-row items-center justify-between space-y-0 relative z-20">
            <motion.div layout layoutId={`badge-container-${sprint.id}`}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Badge className={cn(
                    "px-3 py-1 rounded-full border border-transparent font-bold text-[10px] tracking-tight shadow-none cursor-pointer transition-all hover:border-current hover:pl-4 group/badge",
                    theme.badge,
                    isUpdatingStatus && "opacity-50 pointer-events-none"
                  )}>
                    {isUpdatingStatus ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1.5 text-current" />
                    ) : (
                      <span className={cn("h-1.5 w-1.5 rounded-full mr-1.5 opacity-60 group-hover/badge:opacity-100 transition-opacity", theme.dot)} />
                    )}
                    {theme.label}
                  </Badge>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="rounded-2xl border-slate-200/60 shadow-2xl overflow-hidden min-w-[180px] p-1.5">
                  <DropdownMenuItem onClick={() => handleUpdateStatus('not_started')} className="rounded-lg py-2 px-3 focus:bg-slate-50 text-xs font-bold cursor-pointer">Not Started</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleUpdateStatus('planning')} className="rounded-lg py-2 px-3 focus:bg-blue-50 focus:text-blue-700 text-xs font-bold cursor-pointer">Planning</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleUpdateStatus('preparing')} className="rounded-lg py-2 px-3 focus:bg-indigo-50 focus:text-indigo-700 text-xs font-bold cursor-pointer">Preparing</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleUpdateStatus('active')} className="rounded-lg py-2 px-3 focus:bg-emerald-50 focus:text-emerald-700 text-xs font-bold cursor-pointer">Active</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleUpdateStatus('retrospective')} className="rounded-lg py-2 px-3 focus:bg-purple-50 focus:text-purple-700 text-xs font-bold cursor-pointer">Retrospective</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleUpdateStatus('closed')} className="rounded-lg py-2 px-3 focus:bg-slate-50 focus:text-slate-800 text-xs font-bold cursor-pointer">Closed</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleUpdateStatus('cancelled')} className="rounded-lg py-2 px-3 focus:bg-rose-50 focus:text-rose-700 text-xs font-bold cursor-pointer">Cancelled</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 w-9 p-0 text-slate-400 hover:text-slate-900 hover:bg-white/80 rounded-xl" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-2xl border-slate-200/60 shadow-xl overflow-hidden min-w-[160px]">
                <DropdownMenuItem onClick={handleCardClick} className="py-3 px-4 focus:bg-slate-50 cursor-pointer">
                  View Analytics
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-100" />
                <AlertDialogTrigger asChild onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                  <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 py-3 px-4 cursor-pointer">
                    Delete Cycle
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>

          <CardContent className="p-5 pt-3 flex-grow flex flex-col justify-center">
            <motion.div layout layoutId={`title-container-${sprint.id}`} className="space-y-0.5 mb-4">
              <motion.h3 layout layoutId={`title-${sprint.id}`} className="text-lg font-extrabold text-slate-800 tracking-tight leading-tight group-hover:text-slate-900 transition-colors line-clamp-1">
                {sprint.sprintName}
              </motion.h3>
              <motion.p layout layoutId={`project-${sprint.id}`} className="text-[13px] font-semibold text-slate-400 tracking-tight line-clamp-1">
                {sprint.projectName}
              </motion.p>
            </motion.div>

            <div className="flex items-center gap-6 mt-auto">
              <div className="flex items-center gap-2 text-slate-300">
                <Calendar className="h-3.5 w-3.5" />
                <span className="text-[12px] font-bold text-slate-400/80">{formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="p-5 pt-0 block">
            <motion.div layout layoutId={`progress-container-${sprint.id}`} className="space-y-3">
              {/* Action Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Target className={cn("h-3.5 w-3.5", theme.accent)} />
                  <span className="text-[12px] font-extrabold text-slate-600">{sprint.plannedPoints || 0} SP</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300 font-bold text-[10px] group-hover:text-blue-600 transition-colors">
                  VIEW
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Progress Bar */}
              <motion.div layout layoutId={`progress-bar-${sprint.id}`} className="h-1.5 w-full bg-slate-100/60 rounded-full overflow-hidden border border-slate-50">
                <div
                  className={cn("h-full rounded-full transition-all duration-1000 ease-out", theme.progress)}
                  style={{ width: `${Math.max(4, calculateProgress())}%` }}
                />
              </motion.div>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>

      <AlertDialogContent className="rounded-[40px] border-white/60 shadow-2xl backdrop-blur-3xl bg-white/90 p-10 max-w-lg">
        <AlertDialogHeader className="space-y-4">
          <div className="h-16 w-16 rounded-3xl bg-red-50 flex items-center justify-center text-red-500 shadow-sm border border-red-100">
            <LogOut className="h-8 w-8" />
          </div>
          <AlertDialogTitle className="text-3xl font-extrabold tracking-tight text-slate-900">Confirm Deletion</AlertDialogTitle>
          <AlertDialogDescription className="text-lg font-medium text-slate-500 leading-relaxed">
            All sprint analytical data for <span className="text-slate-900 font-bold">"{sprint.sprintName}"</span> will be permanently removed. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-4 mt-8">
          <AlertDialogCancel disabled={isDeleting} className="rounded-2xl border-slate-200 h-14 px-8 font-bold text-slate-600 hover:bg-slate-50">Keep Sprint</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 text-white rounded-2xl h-14 px-10 font-bold shadow-xl shadow-red-200 transition-all active:scale-95">
            {isDeleting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirm & Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

SprintCard.Skeleton = function SprintCardSkeleton() {
  return (
    <div className="h-[225px] bg-white/40 rounded-[28px] border border-white/60 animate-pulse" />
  );
}
