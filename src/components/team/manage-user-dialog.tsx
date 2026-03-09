import * as React from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, UserCog } from 'lucide-react';
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
import { updateUserRoleAction, removeUserFromOrgAction, assignMemberToTeamAction, removeMemberFromTeamAction, updateMemberCapabilitiesAction } from '@/app/actions/teams';
import { RoleLevel } from '@/lib/rbac';
import { X, BadgeInfo, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ManageUserDialogProps {
    trigger: React.ReactNode;
    onSuccess?: () => void;
    userProfile: any;
    departments: any[];
    teams: any[];
    currentUserLevel: number;
}

export function ManageUserDialog({ trigger, onSuccess, userProfile, departments, teams, currentUserLevel }: ManageUserDialogProps) {
    const [open, setOpen] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isRemoving, setIsRemoving] = React.useState(false);
    const [selectedTeamToAdd, setSelectedTeamToAdd] = React.useState('');
    const { toast } = useToast();

    const { register, handleSubmit, watch, reset } = useForm({
        defaultValues: {
            roleLevel: userProfile.role_level?.toString() || '1',
            departmentId: userProfile.department_id || '',
        },
    });

    const selectedDeptId = watch('departmentId');
    const availableTeams = teams.filter(t => t.department_id === (selectedDeptId || userProfile.department_id));

    React.useEffect(() => {
        if (open) {
            reset({
                roleLevel: userProfile.role_level?.toString() || '1',
                departmentId: userProfile.department_id || '',
            });
            setSelectedTeamToAdd('');
        }
    }, [open, userProfile, reset]);

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            await updateUserRoleAction(
                userProfile.id,
                parseInt(data.roleLevel, 10),
                data.departmentId || null
            );
            toast({ title: 'User Updated', description: 'Permissions and department updated successfully.' });
            setOpen(false);
            onSuccess?.();
        } catch (error: any) {
            console.error('Update error:', error);
            toast({
                title: 'Update Failed',
                description: error instanceof Error ? error.message : String(error),
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddTeam = async () => {
        if (!selectedTeamToAdd) return;
        try {
            await assignMemberToTeamAction(selectedTeamToAdd, userProfile.id);
            toast({ title: 'Team Added', description: 'Member assigned to the team.' });
            setSelectedTeamToAdd('');
            onSuccess?.();
        } catch (error: any) {
            toast({
                title: 'Assignment Failed',
                description: error instanceof Error ? error.message : String(error),
                variant: 'destructive',
            });
        }
    };

    const handleRemoveTeam = async (teamId: string) => {
        try {
            await removeMemberFromTeamAction(teamId, userProfile.id);
            toast({ title: 'Team Removed', description: 'Member removed from the team.' });
            onSuccess?.();
        } catch (error: any) {
            toast({
                title: 'Removal Failed',
                description: error instanceof Error ? error.message : String(error),
                variant: 'destructive',
            });
        }
    };
    const handleUpdateCapabilities = async (teamId: string, capabilities: any) => {
        try {
            await updateMemberCapabilitiesAction(teamId, userProfile.id, capabilities);
            toast({ title: 'Capabilities Updated', description: 'User permissions for this team updated.' });
            onSuccess?.();
        } catch (error: any) {
            toast({
                title: 'Update Failed',
                description: error instanceof Error ? error.message : String(error),
                variant: 'destructive',
            });
        }
    };

    const toggleCapability = (ms: any, key: string) => {
        const newCaps = { ...(ms.capabilities || {}), [key]: !ms.capabilities?.[key] };
        handleUpdateCapabilities(ms.team_id, newCaps);
    };

    const onRemove = async () => {
        if (!confirm('Are you sure you want to remove this user from the organization?')) return;
        setIsRemoving(true);
        try {
            await removeUserFromOrgAction(userProfile.id);
            toast({ title: 'User Removed', description: 'User has been terminated.' });
            setOpen(false);
            onSuccess?.();
        } catch (error: any) {
            toast({
                title: 'Removal Failed',
                description: error instanceof Error ? error.message : String(error),
                variant: 'destructive',
            });
        } finally {
            setIsRemoving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserCog className="h-5 w-5 text-slate-700" />
                        Manage User: {userProfile.display_name || userProfile.email}
                    </DialogTitle>
                    <DialogDescription>
                        Adjust role hierarchies and team assignments.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Role & Dept Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="roleLevel">Authority Level</Label>
                            <select
                                id="roleLevel"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                                {...register('roleLevel')}
                                disabled={currentUserLevel < 4 && parseInt(userProfile.role_level) >= 3}
                            >
                                <option value="1">Level 1 - Member</option>
                                <option value="2">Level 2 - Team Lead</option>
                                <option value="3" disabled={currentUserLevel < 4}>Level 3 - Department Head</option>
                                {currentUserLevel === 4 && <option value="4">Level 4 - Super Admin</option>}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="departmentId">Department Assignment</Label>
                            <select
                                id="departmentId"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                                {...register('departmentId')}
                            >
                                <option value="">-- No Department --</option>
                                {departments.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Update Role/Dept
                            </Button>
                        </div>
                    </form>

                    <div className="border-t pt-4">
                        <Label className="flex items-center gap-2 mb-2">
                            <Users className="h-4 w-4" />
                            Team Memberships
                        </Label>
                        <div className="space-y-3 mb-4">
                            {userProfile.memberships?.length > 0 ? (
                                userProfile.memberships.map((ms: any) => (
                                    <div key={ms.team_id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="pl-3 pr-1 py-1 flex items-center gap-1">
                                                    {ms.team?.name || 'Unknown Team'}
                                                    <button
                                                        onClick={() => handleRemoveTeam(ms.team_id)}
                                                        className="p-0.5 hover:bg-slate-200 rounded-full transition-colors ml-1"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            </div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Capabilities</div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                                            <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={!!ms.capabilities?.can_edit_tasks}
                                                    onChange={() => toggleCapability(ms, 'can_edit_tasks')}
                                                    className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                Edit Tasks
                                            </label>
                                            <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={!!ms.capabilities?.can_manage_sprints}
                                                    onChange={() => toggleCapability(ms, 'can_manage_sprints')}
                                                    className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                Manage Sprints
                                            </label>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <span className="text-xs text-slate-500 italic">No team assignments</span>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <select
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                                value={selectedTeamToAdd}
                                onChange={(e) => setSelectedTeamToAdd(e.target.value)}
                            >
                                <option value="">-- Add to Team --</option>
                                {availableTeams
                                    .filter(t => !userProfile.memberships?.some((ms: any) => ms.team_id === t.id))
                                    .map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                            </select>
                            <Button type="button" size="sm" onClick={handleAddTeam} disabled={!selectedTeamToAdd}>Add</Button>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-between gap-2 border-t mt-6">
                        <Button
                            type="button"
                            variant="destructive"
                            className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                            onClick={onRemove}
                            disabled={isRemoving || currentUserLevel < 4}
                        >
                            {isRemoving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Terminate User
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Close</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
