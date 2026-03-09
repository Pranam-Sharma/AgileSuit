import * as React from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Building2 } from 'lucide-react';
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
import { createDepartmentAction } from '@/backend/actions/teams.actions';

interface CreateDepartmentDialogProps {
    trigger: React.ReactNode;
    onSuccess?: () => void;
    users: any[];
}

export function CreateDepartmentDialog({ trigger, onSuccess, users }: CreateDepartmentDialogProps) {
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
            budget: 0,
            leadId: '',
        },
    });

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            await createDepartmentAction(data.name, Number(data.budget), data.leadId || undefined);
            toast({
                title: 'Department Created',
                description: `${data.name} has been successfully initialized.`,
            });
            setOpen(false);
            reset();
            onSuccess?.();
        } catch (error: any) {
            console.error('Create department error:', error);
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
                        <Building2 className="h-5 w-5 text-rose-600" />
                        New Department
                    </DialogTitle>
                    <DialogDescription>
                        Initialize a new high-level department in the organizational hierarchy.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Department Name</Label>
                        <Input id="name" placeholder="e.g. Engineering" {...register('name', { required: true })} />
                        {errors.name && <span className="text-xs text-rose-500">Name is required</span>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="budget">Operating Budget</Label>
                        <Input id="budget" type="number" placeholder="0" {...register('budget', { min: 0 })} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="leadId">Assign Department Head (Optional)</Label>
                        <select
                            id="leadId"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                            {...register('leadId')}
                        >
                            <option value="">-- Unassigned --</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>
                                    {u.display_name || u.email}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Create Department
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
