'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Sprint } from './create-sprint-dialog';
import { Badge } from '../ui/badge';
import { UserCircle2, Trash2, ChevronDown, Rocket, History, ListTodo } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { useToast } from '@/hooks/use-toast';
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
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type SprintCardProps = {
  sprint: Sprint & { id: string };
  onDelete: (sprintId: string) => void;
};

export function SprintCard({ sprint, onDelete }: SprintCardProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/sprint/${sprint.id}`);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const { deleteSprintAction } = await import('@/app/actions/sprints');
      await deleteSprintAction(sprint.id);

      toast({
        title: 'Sprint Deleted',
        description: `Sprint "${sprint.sprintName}" has been deleted.`,
      });
      onDelete(sprint.id);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An unknown error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <Card
        onClick={handleCardClick}
        className="group relative flex flex-col h-full bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:shadow-[0_8px_30px_rgb(h_primary_rgb/0.12)] transition-all duration-500 overflow-hidden hover:-translate-y-1 cursor-pointer"
      >
        {/* Gradient Glow Effect on Hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Status Line */}
        <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-80 group-hover:opacity-100 transition-opacity" />

        <CardHeader className="relative p-3 pb-1 pl-5">
          <div className="flex justify-between items-start">
            <div className="space-y-0.5 z-10">
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                {sprint.projectName}
              </CardDescription>
              <CardTitle className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-primary transition-colors flex items-baseline gap-2">
                {sprint.sprintName}
                <span className="text-zinc-400 font-medium text-xs">#{sprint.sprintNumber}</span>
              </CardTitle>
            </div>

            <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="relative z-10 h-6 w-6 -mr-1 text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                disabled={isDeleting}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
          </div>
        </CardHeader>

        <CardContent className="relative flex-grow p-3 pl-5 pt-2 space-y-3 z-10">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="px-2 py-0.5 text-[10px] font-semibold bg-zinc-100/80 text-zinc-600 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700 hover:bg-white hover:border-primary/20 transition-colors">
              {sprint.department}
            </Badge>
            <Badge variant="secondary" className="px-2 py-0.5 text-[10px] font-semibold bg-zinc-100/80 text-zinc-600 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700 hover:bg-white hover:border-primary/20 transition-colors">
              {sprint.team}
            </Badge>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex -space-x-2 overflow-hidden">
              <div className="inline-block h-5 w-5 rounded-full ring-2 ring-white dark:ring-zinc-900 bg-zinc-100 flex items-center justify-center">
                <UserCircle2 className="h-3.5 w-3.5 text-zinc-400" />
              </div>
            </div>
            <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">{sprint.facilitatorName || 'Unassigned'}</span>
          </div>
        </CardContent>

        <CardFooter className="relative p-3 pl-5 pt-0 mt-auto z-10">
          <div className="w-full flex justify-between items-center h-8">
            <span className="text-[11px] font-medium text-zinc-400">View Sprint Dashboard</span>
            <ChevronDown className="-rotate-90 h-3 w-3 text-zinc-400" />
          </div>
        </CardFooter>
      </Card>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Sprint</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure? This will permanently delete <strong>{sprint.sprintName}</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 text-white">
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

SprintCard.Skeleton = function SprintCardSkeleton() {
  return (
    <Card className="flex flex-col h-full border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      <div className="w-1 h-full absolute left-0 bg-zinc-100 dark:bg-zinc-800" />
      <CardHeader className='p-3 pl-5 pb-1'>
        <Skeleton className="h-2.5 w-16 mb-1.5" />
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent className="flex-grow space-y-3 p-3 pl-5 pt-1">
        <div className="flex flex-wrap gap-1.5">
          <Skeleton className="h-4 w-12 rounded-md" />
          <Skeleton className="h-4 w-12 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-3.5 w-3.5 rounded-full" />
          <Skeleton className="h-2.5 w-20" />
        </div>
      </CardContent>
      <CardFooter className='p-3 pl-5 pt-0 mt-auto'>
        <Skeleton className="h-8 w-full rounded-md" />
      </CardFooter>
    </Card>
  )
}
