'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Edit2 } from 'lucide-react';
import type { Sprint } from './create-sprint-dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const editSprintSchema = z.object({
  sprintNumber: z.string().min(1, 'Sprint number is required.'),
  sprintName: z.string().min(1, 'Sprint name is required.'),
  projectName: z.string().min(1, 'Project name is required.'),
  department: z.string().min(1, 'Department is required.'),
  team: z.string().min(1, 'Team is required.'),
  facilitatorName: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) < new Date(data.endDate);
    }
    return true;
  },
  {
    message: 'End date must be after start date.',
    path: ['endDate'],
  }
);

type EditSprintData = z.infer<typeof editSprintSchema>;

type EditSprintDialogProps = {
  sprint: Sprint & { id: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (sprint: Sprint & { id: string }) => void;
};

export function EditSprintDialog({ sprint, open, onOpenChange, onUpdate }: EditSprintDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const getSprintDuration = (start?: string, end?: string) => {
    if (!start || !end) return null;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const form = useForm<EditSprintData>({
    resolver: zodResolver(editSprintSchema),
    defaultValues: {
      sprintNumber: sprint.sprintNumber || '',
      sprintName: sprint.sprintName || '',
      projectName: sprint.projectName || '',
      department: sprint.department || '',
      team: sprint.team || '',
      facilitatorName: sprint.facilitatorName || '',
      startDate: sprint.startDate || '',
      endDate: sprint.endDate || '',
    },
  });

  const startDate = form.watch('startDate');
  const endDate = form.watch('endDate');
  const sprintDuration = getSprintDuration(startDate, endDate);
  const isUnusualDuration = sprintDuration !== null && (sprintDuration < 7 || sprintDuration > 28);

  // Reset form when sprint changes
  React.useEffect(() => {
    form.reset({
      sprintNumber: sprint.sprintNumber || '',
      sprintName: sprint.sprintName || '',
      projectName: sprint.projectName || '',
      department: sprint.department || '',
      team: sprint.team || '',
      facilitatorName: sprint.facilitatorName || '',
      startDate: sprint.startDate || '',
      endDate: sprint.endDate || '',
    });
  }, [sprint, form]);

  async function onSubmit(values: EditSprintData) {
    setIsLoading(true);

    try {
      const { updateSprintAction } = await import('@/app/actions/sprints');
      await updateSprintAction(sprint.id, values);

      onUpdate({ ...sprint, ...values });

      toast({
        title: 'Sprint Updated!',
        description: `Sprint "${values.sprintName}" has been successfully updated.`,
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error Updating Sprint',
        description: error.message || 'An unknown error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-background/95 backdrop-blur-sm shadow-2xl shadow-blue-500/10 border-0">
        <DialogHeader>
          <DialogTitle>Edit Sprint</DialogTitle>
          <DialogDescription>
            Update the sprint details below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sprintNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sprint Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 24.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sprintName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sprint Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Q1 Sprint 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="projectName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., AgileSuit" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Engineering" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="team"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Frontend" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="facilitatorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Facilitator Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? format(new Date(field.value), 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? format(new Date(field.value), 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Duration Warning */}
            {sprintDuration !== null && (
              <div className={cn(
                "p-3 rounded-lg text-sm",
                isUnusualDuration
                  ? "bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                  : "bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
              )}>
                <p className="font-medium">
                  Sprint Duration: {sprintDuration} day{sprintDuration !== 1 ? 's' : ''}
                  {sprintDuration >= 7 && ` (${Math.floor(sprintDuration / 7)} week${Math.floor(sprintDuration / 7) !== 1 ? 's' : ''})`}
                </p>
                {isUnusualDuration && (
                  <p className="text-xs mt-1">
                    {sprintDuration < 7
                      ? 'This sprint is shorter than typical 1-2 week sprints.'
                      : 'This sprint is longer than typical 2-4 week sprints.'}
                  </p>
                )}
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
