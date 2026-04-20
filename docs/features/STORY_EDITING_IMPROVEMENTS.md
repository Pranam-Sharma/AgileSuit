# Story Editing UI Improvements - Implementation Guide

## Summary of Changes Needed

The sprint-board-client.tsx file has ~1500 lines with extensive hardcoded dummy data using old status values. Rather than editing every line, here's a comprehensive solution:

## Quick Fixes Required:

### 1. Remove Dummy Data (Lines 173-465)
Replace the entire `defaultColumns` constant with empty columns:

```typescript
const defaultColumns: Column[] = [
    { id: 'backlog', title: 'Backlog', gradient: 'slate', stories: [] },
    { id: 'todo', title: 'To Do', gradient: 'blue', stories: [] },
    { id: 'in-progress', title: 'In Progress', gradient: 'orange', stories: [] },
    { id: 'review', title: 'In Review', gradient: 'purple', stories: [] },
    { id: 'done', title: 'Done', gradient: 'green', stories: [] }
];
```

### 2. Update Status Dropdown in Dialog (Around line 1456-1465)

Replace:
```typescript
<select
    className="w-full h-10 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
    value={newStory.status || 'not-started'}
    onChange={(e) => setNewStory(prev => ({ ...prev, status: e.target.value as 'not-started' | 'in-progress' | 'completed' | 'blocked' }))}
>
    <option value="not-started">Not Started</option>
    <option value="in-progress">In Progress</option>
    <option value="completed">Completed</option>
    <option value="blocked">Blocked</option>
</select>
```

With:
```typescript
<select
    className="w-full h-10 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
    value={newStory.status || 'todo'}
    onChange={(e) => setNewStory(prev => ({ ...prev, status: e.target.value as Story['status'] }))}
>
    <option value="todo">To Do</option>
    <option value="in_progress">In Progress</option>
    <option value="in_review">In Review</option>
    <option value="done">Done</option>
    <option value="blocked">Blocked</option>
</select>
```

### 3. Add Critical Priority Option (Around line 1442-1451)

Add critical option:
```typescript
<select
    className="w-full h-10 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
    value={newStory.priority || 'medium'}
    onChange={(e) => setNewStory(prev => ({ ...prev, priority: e.target.value as Story['priority'] }))}
>
    <option value="low">Low</option>
    <option value="medium">Medium</option>
    <option value="high">High</option>
    <option value="critical">Critical</option>
</select>
```

### 4. Fix Priority Sorting (Around line 919)

Update the priorityOrder object:
```typescript
const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
```

### 5. Fix Status Filter (Around line 906)

Change `status === 'completed'` to `status === 'done'`

### 6. Update Initial State (Around line 483)

Change:
```typescript
status: 'not-started'
```

To:
```typescript
status: 'todo'
```

## New Features to Add:

### A. Add Edit Story Dialog State

Add after line 476:
```typescript
const [isEditStoryDialogOpen, setIsEditStoryDialogOpen] = React.useState(false);
const [editingStory, setEditingStory] = React.useState<Story | null>(null);
```

### B. Add Edit Story Handler

Add after handleAddStory function:
```typescript
const handleEditStory = (story: Story) => {
    setEditingStory(story);
    setNewStory({
        title: story.title,
        description: story.description,
        storyPoints: story.storyPoints,
        assignee: story.assignee,
        priority: story.priority,
        status: story.status,
        tags: story.tags,
        due_date: story.due_date
    });
    setIsEditStoryDialogOpen(true);
};

const handleSaveEditStory = async () => {
    if (!editingStory || !newStory.title?.trim()) {
        toast({
            title: 'Error',
            description: 'Story title is required',
            variant: 'destructive'
        });
        return;
    }

    const { data, error } = await updateStory(editingStory.id, {
        title: newStory.title,
        description: newStory.description,
        story_points: newStory.storyPoints,
        assignee: newStory.assignee,
        priority: newStory.priority as 'low' | 'medium' | 'high' | 'critical',
        status: newStory.status as Story['status'],
        tags: newStory.tags,
        due_date: newStory.due_date
    });

    if (error) {
        toast({
            title: 'Error',
            description: error,
            variant: 'destructive'
        });
        return;
    }

    // Update local state
    setColumns(prev => prev.map(column => ({
        ...column,
        stories: column.stories.map(s =>
            s.id === editingStory.id ? { ...s, ...data } : s
        )
    })));

    setIsEditStoryDialogOpen(false);
    setEditingStory(null);
    setNewStory({ title: '', description: '', storyPoints: 0, assignee: '', priority: 'medium', status: 'todo' });

    toast({
        title: 'Story updated',
        description: 'The story has been successfully updated.'
    });
};
```

### C. Add Edit Button to Card Dropdown Menu (Around line 1342)

Add before the Delete option:
```typescript
<DropdownMenuItem onClick={() => handleEditStory(story)}>
    <Edit2 className="mr-2 h-4 w-4" />
    Edit
</DropdownMenuItem>
<DropdownMenuSeparator />
```

### D. Add Tags Field to Dialog (After line 1473)

```typescript
<div className="space-y-2">
    <label className="text-sm font-medium">Tags (comma-separated)</label>
    <Input
        placeholder="bug, feature, urgent..."
        value={newStory.tags?.join(', ') || ''}
        onChange={(e) => setNewStory(prev => ({
            ...prev,
            tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)
        }))}
    />
</div>
```

### E. Add Due Date Field to Dialog (After tags field)

```typescript
<div className="space-y-2">
    <label className="text-sm font-medium">Due Date</label>
    <Input
        type="date"
        value={newStory.due_date || ''}
        onChange={(e) => setNewStory(prev => ({ ...prev, due_date: e.target.value }))}
    />
</div>
```

### F. Add Tags Display to Story Card (After line 1368)

```typescript
{story.tags && story.tags.length > 0 && (
    <div className="flex flex-wrap gap-1 mt-2">
        {story.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
                {tag}
            </Badge>
        ))}
    </div>
)}
```

### G. Add Edit Story Dialog (After the Add Story Dialog, around line 1485)

```typescript
{/* Edit Story Dialog */}
<Dialog open={isEditStoryDialogOpen} onOpenChange={setIsEditStoryDialogOpen}>
    <DialogContent className="sm:max-w-md">
        <DialogHeader>
            <DialogTitle>Edit Story</DialogTitle>
            <DialogDescription>
                Update the story details below.
            </DialogDescription>
        </DialogHeader>
        {/* Use the same form fields as Add Story Dialog */}
        {/* ... copy all fields from Add Story Dialog ... */}
        <DialogFooter>
            <Button variant="outline" onClick={() => {
                setIsEditStoryDialogOpen(false);
                setEditingStory(null);
                setNewStory({ title: '', description: '', storyPoints: 0, assignee: '', priority: 'medium', status: 'todo' });
            }}>
                Cancel
            </Button>
            <Button onClick={handleSaveEditStory}>
                Save Changes
            </Button>
        </DialogFooter>
    </DialogContent>
</Dialog>
```

## Testing Checklist:

- [ ] Stories load from database
- [ ] Create new story with all fields (including tags, due date, critical priority)
- [ ] Edit existing story
- [ ] Delete story
- [ ] Drag and drop works
- [ ] Filters work with new status values
- [ ] Sorting works with critical priority

## Alternative Approach:

If editing the large file is too complex, consider creating a separate StoryCard component and StoryDialog component to break down the complexity.
