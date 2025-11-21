
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Sprint } from './create-sprint-dialog';
import { Badge } from '../ui/badge';
import { UserCircle2, Trash2, ChevronDown, Rocket, History, ListTodo } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { deleteSprint } from '@/lib/sprints';
import { useFirestore } from '@/firebase/provider';
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
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isDeleting, setIsDeleting] = React.useState(false);

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        try {
            if (!firestore) throw new Error("Firestore is not initialized");
            await deleteSprint(firestore, sprint.id);
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
      <div className="p-0.5 rounded-2xl bg-gradient-to-br from-pink-400 via-blue-400 to-green-400 shadow-blue-400/40 shadow-xl hover:shadow-blue-400/60 hover:shadow-2xl transition-all duration-300">
        <Card className="flex flex-col rounded-[calc(1rem-2px)] h-full">
          <CardHeader className="relative">
            <CardDescription className='text-xs'>{sprint.projectName}</CardDescription>
            <CardTitle className="text-xl font-bold pr-10">{sprint.sprintName} ({sprint.sprintNumber})</CardTitle>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 h-8 w-8 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    disabled={isDeleting}
                    aria-label="Delete sprint"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
          </CardHeader>
          <CardContent className="flex-grow space-y-4">
            <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{sprint.department}</Badge>
                <Badge variant="secondary">{sprint.team}</Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <UserCircle2 className="h-4 w-4" />
                <span>Facilitator: {sprint.facilitatorName}</span>
            </div>
          </CardContent>
          <CardFooter>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button className="w-full rounded-full font-bold">
                        <span>View Details</span>
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-56' align="end">
                    <DropdownMenuItem asChild>
                        <Link href={`/sprint/${sprint.id}/planning`}>
                            <ListTodo className="mr-2 h-4 w-4" />
                            <span>Planning</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                         <Link href={`/sprint/${sprint.id}/retrospective`}>
                            <History className="mr-2 h-4 w-4" />
                            <span>Retrospective</span>
                        </Link>
                    </DropdownMenuItem>
                     <DropdownMenuItem asChild>
                         <Link href={`/sprint/${sprint.id}`}>
                            <Rocket className="mr-2 h-4 w-4" />
                            <span>Track</span>
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
          </CardFooter>
        </Card>
      </div>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this sprint
            and remove its data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting}>
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

SprintCard.Skeleton = function SprintCardSkeleton() {
    return (
        <div className="p-0.5 rounded-2xl bg-gray-200">
            <Card className="flex flex-col rounded-[calc(1rem-2px)] h-full">
                <CardHeader>
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-6 w-2/3 mt-1" />
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                    <div className="flex flex-wrap gap-2">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-20" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-full rounded-full" />
                </CardFooter>
            </Card>
        </div>
    )
}
