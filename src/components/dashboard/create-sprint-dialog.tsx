
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
  DialogTrigger,
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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
// import { useUser } from '@/hooks/use-user'; // Removed
// import { createSprint } from '@/lib/sprints-client'; // Removed
// import { useFirestore } from '@/firebase/provider'; // Removed

const sprintSchema = z.object({
  sprintNumber: z.string().min(1, 'Sprint number is required.'),
  sprintName: z.string().min(1, 'Sprint name is required.'),
  projectName: z.string().min(1, 'Project name is required.'),
  department: z.string().min(1, 'Department is required.'),
  team: z.string().min(1, 'Team is required.'),
  isFacilitator: z.boolean().default(false),
  facilitatorName: z.string().optional(),
  plannedPoints: z.coerce.number().optional(),
  completedPoints: z.coerce.number().optional(),
  userId: z.string().optional(),
}).refine(
  (data) => {
    if (data.isFacilitator) return true;
    return !!data.facilitatorName;
  },
  {
    message: 'Facilitator name is required if you are not the facilitator.',
    path: ['facilitatorName'],
  }
);

export type Sprint = z.infer<typeof sprintSchema>;

type CreateSprintDialogProps = {
  onCreateSprint: (sprint: Sprint & { id: string }) => void;
  triggerVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  trigger?: React.ReactNode;
};

export function CreateSprintDialog({ onCreateSprint, triggerVariant = "default", trigger }: CreateSprintDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  // const { user } = useUser(); // Removed
  // const firestore = useFirestore(); // Removed

  const form = useForm<Sprint>({
    resolver: zodResolver(sprintSchema),
    defaultValues: {
      sprintNumber: '',
      sprintName: '',
      projectName: '',
      department: '',
      team: '',
      isFacilitator: false,
      facilitatorName: '',
      plannedPoints: 0,
      completedPoints: 0,
    },
  });

  const isFacilitator = form.watch('isFacilitator');

  async function onSubmit(values: Sprint) {
    setIsLoading(true);

    let finalValues = { ...values };
    if (values.isFacilitator) {
      // For now, we'll just use "Me" or let the server handle it if we fetched user name
      // ideally we pass the user name from the parent or fetch it
      finalValues.facilitatorName = 'Me';
    }

    try {
      const { createSprintAction } = await import('@/app/actions/sprints');
      const { sprint } = await createSprintAction(finalValues);

      onCreateSprint({ ...values, id: sprint.id }); // Optimistic update / UI update

      toast({
        title: 'Sprint Created!',
        description: `Sprint "${values.sprintName}" has been successfully created.`,
      });
      setOpen(false);
      form.reset();
    } catch (error: any) {
      toast({
        title: 'Error Creating Sprint',
        description: error.message || 'An unknown error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button variant={triggerVariant}>
            <PlusCircle className="mr-2 h-4 w-4" />
            <span>Create Sprint</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl bg-background/95 backdrop-blur-sm shadow-2xl shadow-blue-500/10 border-0">
        <DialogHeader>
          <DialogTitle>Create New Sprint</DialogTitle>
          <DialogDescription>
            Fill in the details below to start a new sprint.
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
                      <Input placeholder="e.g., Q1 Planning" {...field} />
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
                    <Input placeholder="e.g., Project Phoenix" {...field} />
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

            {/* Removed Story Points fields as per user request */}

            <FormField
              control={form.control}
              name="isFacilitator"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Are you the facilitator/scrum master?
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div
              className={cn(
                'transition-all duration-300 ease-in-out',
                isFacilitator
                  ? 'opacity-0 h-0 overflow-hidden'
                  : 'opacity-100 h-auto'
              )}
            >
              {!isFacilitator && (
                <FormField
                  control={form.control}
                  name="facilitatorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facilitator/Scrum Master Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter facilitator's name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  'Create'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
