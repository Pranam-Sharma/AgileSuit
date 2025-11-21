
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Sprint } from './create-sprint-dialog';
import { Badge } from '../ui/badge';
import { UserCircle2, Trash2 } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { deleteSprint } from '@/lib/sprints';
import { useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';

type SprintCardProps = {
  sprint: Sprint & { id: string };
  onDelete: (sprintId: string) => void;
};

export function SprintCard({ sprint, onDelete }: SprintCardProps) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isDeleting, setIsDeleting] = React.useState(false);

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation(); // prevent card click event
        if (!window.confirm('Are you sure you want to delete this sprint?')) {
            return;
        }
        setIsDeleting(true);
        try {
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
            setIsDeleting(false);
        }
    };

  return (
    <div className="p-0.5 rounded-2xl bg-gradient-to-br from-pink-400 via-blue-400 to-green-400 shadow-blue-400/40 shadow-xl hover:shadow-blue-400/60 hover:shadow-2xl transition-all duration-300">
      <Card className="flex flex-col rounded-[calc(1rem-2px)] h-full">
        <CardHeader className="relative">
          <CardDescription className='text-xs'>{sprint.projectName}</CardDescription>
          <CardTitle className="text-xl font-bold pr-10">{sprint.sprintName} ({sprint.sprintNumber})</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 h-8 w-8 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            aria-label="Delete sprint"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
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
          <Button className="w-full rounded-full font-bold">View Details</Button>
        </CardFooter>
      </Card>
    </div>
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
