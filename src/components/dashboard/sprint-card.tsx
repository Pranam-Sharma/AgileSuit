
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Sprint } from './create-sprint-dialog';
import { Badge } from '../ui/badge';
import { UserCircle2, Trash2, ChevronDown, Rocket, History, ListTodo } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
// import { deleteSprint } from '@/lib/sprints-client'; // REMOVED
// import { useFirestore } from '@/firebase/provider'; // REMOVED
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

type SprintCardProps = {
  sprint: Sprint & { id: string };
  onDelete: (sprintId: string) => void;
};

export function SprintCard({ sprint, onDelete }: SprintCardProps) {
  // const firestore = useFirestore(); // REMOVED
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      // Import the server action dynamically to ensure it works in Client Component if needed 
      // (though usually imports at top level are fine for actions)
      const { deleteSprintAction } = await import('@/app/actions/sprints');

      await deleteSprintAction(sprint.id);

      toast({
        title: 'Sprint Deleted',
        description: `Sprint "${sprint.sprintName}" has been deleted.`,
      });
      onDelete(sprint.id);
    } catch (error: any) {
      toast({
        title: 'Error Deleting Sprint',
        description: error.message || 'An unknown error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <Card className="group relative flex flex-col h-full border-border/50 bg-card hover:bg-accent/5 hover:border-accent hover:shadow-lg transition-all duration-300 overflow-hidden">
        {/* Status Bar Indicator */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-fuchsia-500 opacity-80" />

        <CardHeader className="p-5 pb-2">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <CardDescription className="text-xs font-medium uppercase tracking-wider text-muted-foreground/80">
                {sprint.projectName}
              </CardDescription>
              <CardTitle className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                {sprint.sprintName}
                <span className="ml-2 text-muted-foreground font-normal text-lg">#{sprint.sprintNumber}</span>
              </CardTitle>
            </div>

            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 -mr-2 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
                disabled={isDeleting}
                aria-label="Delete sprint"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
          </div>
        </CardHeader>

        <CardContent className="flex-grow p-5 pt-2 space-y-5">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="px-2.5 py-0.5 text-xs font-medium border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400 shadow-sm">
              {sprint.department}
            </Badge>
            <Badge variant="outline" className="px-2.5 py-0.5 text-xs font-medium border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700 dark:border-fuchsia-800 dark:bg-fuchsia-950/30 dark:text-fuchsia-400 shadow-sm">
              {sprint.team}
            </Badge>
          </div>

          <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/50">
            <div className="p-1.5 bg-background rounded-full shadow-sm">
              <UserCircle2 className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground/70">Facilitator</span>
              <span className="font-medium text-foreground">{sprint.facilitatorName || 'Unassigned'}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-5 pt-0 mt-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full justify-between group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300" variant="secondary">
                <span className="font-semibold">Manage Sprint</span>
                <ChevronDown className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuItem asChild>
                <Link href={`/sprint/${sprint.id}/planning`} className="cursor-pointer">
                  <ListTodo className="mr-2 h-4 w-4 text-blue-500" />
                  <span>Planning</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/sprint/${sprint.id}`} className="cursor-pointer">
                  <Rocket className="mr-2 h-4 w-4 text-fuchsia-500" />
                  <span>Track Board</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/sprint/${sprint.id}/retrospective`} className="cursor-pointer">
                  <History className="mr-2 h-4 w-4 text-orange-500" />
                  <span>Retrospective</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardFooter>
      </Card>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this sprint?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete <strong>{sprint.sprintName}</strong> and all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Sprint
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

SprintCard.Skeleton = function SprintCardSkeleton() {
  return (
    <Card className="flex flex-col h-full border-border/50 overflow-hidden">
      <div className="w-full h-1 bg-muted" />
      <CardHeader className='p-5 pb-2'>
        <Skeleton className="h-3 w-1/3 mb-2" />
        <Skeleton className="h-6 w-2/3" />
      </CardHeader>
      <CardContent className="flex-grow space-y-5 p-5 pt-2">
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>
        <div className="flex items-center gap-3 p-2.5 rounded-lg border border-border/50">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-1 flex-1">
            <Skeleton className="h-2 w-12" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </CardContent>
      <CardFooter className='p-5 pt-0 mt-auto'>
        <Skeleton className="h-10 w-full rounded-md" />
      </CardFooter>
    </Card>
  )
}
