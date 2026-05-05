// Story types for sprint board

export type StoryPriority = 'low' | 'medium' | 'high' | 'critical';
export type StoryStatus = 'todo' | 'in_progress' | 'in_review' | 'done' | 'blocked';

export interface Story {
  id: string;
  sprint_id: string;
  title: string;
  description: string | null;
  story_points: number | null;
  completed_story_points: number | null;
  assignee: string | null;
  priority: StoryPriority;
  status: StoryStatus;
  column_id: string;
  position: number;
  tags: string[] | null;
  due_date: string | null;
  acceptance_criteria: string | null;
  subtasks: {
    id: string;
    title: string;
    is_completed: boolean;
    note?: string;
    blocker?: string;
    assignee?: string;
  }[] | null;
  comments: any[] | null;
  activity_log: any[] | null;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
}

export interface CreateStoryInput {
  sprint_id: string;
  title: string;
  description?: string;
  story_points?: number;
  completed_story_points?: number;
  assignee?: string;
  priority?: StoryPriority;
  status?: StoryStatus;
  column_id: string;
  position?: number;
  tags?: string[];
  due_date?: string;
  acceptance_criteria?: string;
}

export interface UpdateStoryInput {
  title?: string;
  description?: string;
  story_points?: number;
  completed_story_points?: number;
  assignee?: string;
  priority?: StoryPriority;
  status?: StoryStatus;
  column_id?: string;
  position?: number;
  tags?: string[];
  due_date?: string;
  acceptance_criteria?: string;
  subtasks?: any[];
  comments?: any[];
  activity_log?: any[];
}

export interface MoveStoryInput {
  column_id: string;
  position: number;
  status?: StoryStatus;
}
