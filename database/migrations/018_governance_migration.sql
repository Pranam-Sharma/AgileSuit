-- Migration Script: Enterprise Governance & Compliance
-- Run this script in your Supabase SQL Editor.

-- 1. Update team_members for Soft-Delete and Capabilities
ALTER TABLE public.team_members 
ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS capabilities JSONB DEFAULT '{}'::jsonb;

-- 2. Create Team Requests Table for Approval Workflows
CREATE TABLE IF NOT EXISTS public.team_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    request_type TEXT NOT NULL CHECK (request_type IN ('JOIN', 'TRANSFER')),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    note TEXT,
    processed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Separate Partial Unique Index (Postgres doesn't support WHERE inside UNIQUE table constraint)
CREATE UNIQUE INDEX IF NOT EXISTS idx_team_requests_unique_pending 
ON public.team_requests (user_id, team_id) 
WHERE (status = 'PENDING');

-- 3. Enable RLS on team_requests
ALTER TABLE public.team_requests ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for team_requests
-- Users can see their own requests
CREATE POLICY "Users can view their own requests" ON public.team_requests
    FOR SELECT USING (user_id = auth.uid() OR requester_id = auth.uid());

-- Dept Heads and Admins can see requests in their org
CREATE POLICY "Managers can view requests in their org" ON public.team_requests
    FOR SELECT USING (org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

-- Only Dept Heads and Admins can create requests for others, or members for themselves
CREATE POLICY "Authorized users can create requests" ON public.team_requests
    FOR INSERT WITH CHECK (org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

-- Only Dept Heads and Admins can update (approve/reject)
CREATE POLICY "Managers can process requests" ON public.team_requests
    FOR UPDATE USING (org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

-- 5. Indexing for performance
CREATE INDEX IF NOT EXISTS idx_team_members_active ON public.team_members (team_id, user_id) WHERE (ended_at IS NULL);
CREATE INDEX IF NOT EXISTS idx_team_requests_pending ON public.team_requests (org_id, status) WHERE (status = 'PENDING');
