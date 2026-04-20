import * as React from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Users } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createTeamAction } from '@/backend/actions/teams.actions';

interface CreateTeamDialogProps {
    trigger: React.ReactNode;
    onSuccess?: () => void;
    departmentId: string;
    departmentName: string;
    users: any[];
}

export function CreateTeamDialog({ trigger, onSuccess, departmentId, departmentName, users }: CreateTeamDialogProps) {
    const [open, setOpen] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const { toast } = useToast();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            name: '',
            leadId: '',
        },
    });

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            await createTeamAction(departmentId, data.name, data.leadId || undefined);
            toast({
                title: 'Team Created',
                description: `${data.name} was added to ${departmentName}.`,
            });
            setOpen(false);
            reset();
            onSuccess?.();
        } catch (error: any) {
            console.error('Create team error:', error);
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : String(error),
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-indigo-600" />
                        Add Team to {departmentName}
                    </DialogTitle>
                    <DialogDescription>
                        Create a new operational team under this department.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Team Name</Label>
                        <Input id="name" placeholder="e.g. Frontend Core" {...register('name', { required: true })} />
                        {errors.name && <span className="text-xs text-rose-500">Name is required</span>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="leadId">Assign Team Lead (Optional)</Label>
                        <select
                            id="leadId"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                            {...register('leadId')}
                        >
                            <option value="">-- Unassigned --</option>
                            {users
                                .filter(u => u.department_id === departmentId && u.role_level === 2)
                                .map(u => (
                                    <option key={u.id} value={u.id}>
                                        {u.display_name || (u.email ? u.email.split('@')[0] : `User ${u.id.substring(0, 8)}`)}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Create Team
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
