import { createAdminClient } from '@/auth/supabase/admin';

export type AuditActionType =
    | 'DEPARTMENT_CREATED'
    | 'DEPARTMENT_DELETED'
    | 'DEPARTMENT_UPDATED'
    | 'TEAM_CREATED'
    | 'TEAM_DELETED'
    | 'TEAM_UPDATED'
    | 'ROLE_PROMOTION'
    | 'ROLE_DEMOTION'
    | 'MEMBER_REASSIGNED'
    | 'MEMBER_TERMINATED'
    | 'TEAM_MEMBER_ASSIGNED'
    | 'TEAM_MEMBER_REMOVED'
    | 'TEAM_JOIN_REQUESTED'
    | 'TEAM_JOIN_APPROVED'
    | 'TEAM_JOIN_REJECTED'
    | 'CAPABILITIES_UPDATED';

export interface AuditLogPayload {
    org_id: string;
    actor_id: string;
    action_type: AuditActionType;
    target_id?: string;
    old_value?: any;
    new_value?: any;
}

/**
 * Global Audit Logger
 * Uses the Supabase Admin client to bypass RLS and securely write audit logs.
 */
export async function logAuditEvent(payload: AuditLogPayload) {
    const supabaseAdmin = createAdminClient();

    const { error } = await supabaseAdmin
        .from('audit_logs')
        .insert({
            org_id: payload.org_id,
            actor_id: payload.actor_id,
            action_type: payload.action_type,
            target_id: payload.target_id,
            old_value: payload.old_value,
            new_value: payload.new_value,
        });

    if (error) {
        console.error('Failed to write audit log [CRITICAL]:', error);
        // We typically do not throw here to prevent tearing down the actual action success,
        // but in strict compliance environments, you might want to.
    }
}
