export interface RetrospectiveItem {
    id: string;
    sprintId: string;
    content: string;
    type: 'went_well' | 'needs_improvement' | 'action_items';
    votes: number;
    authorId: string;
}
