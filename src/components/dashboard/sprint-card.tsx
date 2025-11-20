'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Sprint } from './create-sprint-dialog';
import { Badge } from '../ui/badge';
import { UserCircle2 } from 'lucide-react';

type SprintCardProps = {
  sprint: Sprint;
};

export function SprintCard({ sprint }: SprintCardProps) {
  return (
    <Card className="flex flex-col rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardDescription className='text-xs'>{sprint.projectName}</CardDescription>
        <CardTitle className="text-xl font-bold">{sprint.sprintName} ({sprint.sprintNumber})</CardTitle>
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
  );
}
