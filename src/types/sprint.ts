// Sprint types for sprint management

export type SprintStatus = 'planning' | 'active' | 'completed' | 'archived';

export interface Sprint {
  id: string;
  org_slug: string;
  sprint_number: string;
  name: string;
  project_name: string;
  department: string;
  team: string;
  facilitator_name: string | null;
  start_date: string | null;
  end_date: string | null;
  status: SprintStatus;
  planned_points?: number | null;
  completed_points?: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSprintInput {
  sprint_number: string;
  name: string;
  project_name: string;
  department: string;
  team: string;
  facilitator_name?: string;
  start_date?: string;
  end_date?: string;
  status?: SprintStatus;
  planned_points?: number;
  completed_points?: number;
}

export interface UpdateSprintInput {
  name?: string;
  sprint_number?: string;
  project_name?: string;
  department?: string;
  team?: string;
  facilitator_name?: string;
  start_date?: string;
  end_date?: string;
  status?: SprintStatus;
  planned_points?: number;
  completed_points?: number;
}
