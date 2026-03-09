import * as React from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, UserPlus } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRBAC } from '@/hooks/use-rbac';
import { assignMemberToTeamAction, requestTeamJoinAction } from '@/backend/actions/teams.actions';

interface AssignTeamMemberDialogProps {
    trigger: React.ReactNode;
    onSuccess?: () => void;
    teamId: string;
    teamName: string;
    departmentId: string;
    users: any[];
}

export function AssignTeamMemberDialog({
    trigger,
    onSuccess,
    teamId,
    teamName,
    departmentId,
    users
}: AssignTeamMemberDialogProps) {
    const [open, setOpen] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const { toast } = useToast();

    const { rbacContext } = useRBAC();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            userId: '',
            note: '',
        },
    });

    const isDirectAssign = rbacContext && rbacContext.roleLevel >= 3;

    // Filter users to only those in the same department
    const eligibleUsers = users.filter(u => u.department_id === departmentId);

    const onSubmit = async (data: any) => {
        const selectedUser = eligibleUsers.find(u => u.id === data.userId);
        if (!selectedUser) return;

        setIsSubmitting(true);
        try {
            if (isDirectAssign) {
                await assignMemberToTeamAction(teamId, selectedUser.id);
                toast({
                    title: 'Member Assigned',
                    description: `${selectedUser.display_name || selectedUser.email} assigned to ${teamName}.`,
                });
            } else {
                await requestTeamJoinAction(teamId, selectedUser.id, data.note);
                toast({
                    title: 'Request Submitted',
                    description: `Join request for ${selectedUser.display_name || selectedUser.email} sent to Department Head.`,
                });
            }

            setOpen(false);
            reset();
            onSuccess?.();
        } catch (error: any) {
            console.error('Assignment error:', error);
            toast({
                title: isDirectAssign ? 'Assignment Failed' : 'Request Failed',
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
                        <UserPlus className="h-5 w-5 text-indigo-600" />
                        Assign Member to {teamName}
                    </DialogTitle>
                    <DialogDescription>
                        Select a member from this department to join the team.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="userId">Select Member</Label>
                        <select
                            id="userId"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                            {...register('userId', { required: true })}
                        >
                            <option value="">-- Select a member --</option>
                            {eligibleUsers.map(u => (
                                <option key={u.id} value={u.id}>
                                    {u.display_name || (u.email ? u.email.split('@')[0] : `User ${u.id.substring(0, 8)}`)}
                                    {u.team_id === teamId ? ' (Already in Team)' : ''}
                                </option>
                            ))}
                        </select>
                        {errors.userId && <span className="text-xs text-rose-500">Please select a member</span>}
                    </div>

                    {!isDirectAssign && (
                        <div className="space-y-2">
                            <Label htmlFor="note">Request Note (Optional)</Label>
                            <textarea
                                id="note"
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Explain why this member should join the team..."
                                {...register('note')}
                            />
                        </div>
                    )}

                    <div className="pt-4 flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {isDirectAssign ? 'Assign to Team' : 'Submit Request'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
