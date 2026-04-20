#!/usr/bin/env python3
"""
Script to create a clean version of sprint-board-client.tsx
with all Task #2 improvements applied
"""

import re

# Read the original file
with open('src/components/sprint-board/sprint-board-client.tsx', 'r') as f:
    content = f.read()

print("Step 1: Updating Story type definition...")
# Fix Story type
content = re.sub(
    r"type Story = \{[^}]+\};",
    """type Story = {
    id: string;
    title: string;
    description: string;
    storyPoints?: number;
    assignee?: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status?: 'todo' | 'in_progress' | 'in_review' | 'done' | 'blocked';
    tags?: string[];
    due_date?: string;
};""",
    content
)

print("Step 2: Replacing defaultColumns with empty arrays...")
# Replace entire defaultColumns array
content = re.sub(
    r'const defaultColumns: Column\[\] = \[[^\]]+\];',
    """const defaultColumns: Column[] = [
    { id: 'backlog', title: 'Backlog', gradient: 'slate', stories: [] },
    { id: 'todo', title: 'To Do', gradient: 'blue', stories: [] },
    { id: 'in-progress', title: 'In Progress', gradient: 'orange', stories: [] },
    { id: 'review', title: 'In Review', gradient: 'purple', stories: [] },
    { id: 'done', title: 'Done', gradient: 'green', stories: [] }
];""",
    content,
    flags=re.DOTALL
)

print("Step 3: Updating helper functions...")
# Update getPriorityColor to include critical
content = re.sub(
    r"(const getPriorityColor = \(priority: string\) => \{[\s\S]+?switch \(priority\) \{)",
    r"\1\n            case 'critical': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300';",
    content
)

# Update getStatusColor
content = content.replace("case 'not-started':", "case 'todo':")
content = content.replace("case 'in-progress':", "case 'in_progress':")
content = content.replace("case 'completed':", "case 'done':")

# Add in_review case
content = re.sub(
    r"(case 'in_progress': return 'bg-blue-100[^']+';)",
    r"\1\n            case 'in_review': return 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300';",
    content
)

# Update getStatusLabel
content = content.replace("case 'not-started': return 'Not Started';", "case 'todo': return 'To Do';")
content = content.replace("case 'in-progress': return 'In Progress';", "case 'in_progress': return 'In Progress';")
content = content.replace("case 'completed': return 'Completed';", "case 'done': return 'Done';")
content = re.sub(
    r"(case 'in_progress': return 'In Progress';)",
    r"\1\n            case 'in_review': return 'In Review';",
    content
)
content = content.replace("default: return 'Not Started';", "default: return 'To Do';")

print("Step 4: Updating initial state...")
# Fix initial state
content = content.replace("status: 'not-started'", "status: 'todo'")

print("Step 5: Updating status dropdown...")
# Fix status dropdown
content = content.replace('value={newStory.status || \'not-started\'}', 'value={newStory.status || \'todo\'}')
content = content.replace('<option value="not-started">Not Started</option>', '<option value="todo">To Do</option>')
content = content.replace('<option value="in-progress">In Progress</option>', '<option value="in_progress">In Progress</option>')
content = content.replace('<option value="completed">Completed</option>', '<option value="in_review">In Review</option>\n                                <option value="done">Done</option>')

# Fix status type cast
content = content.replace("as 'not-started' | 'in-progress' | 'completed' | 'blocked'", "as Story['status']")

print("Step 6: Adding critical priority option...")
# Add critical to priority dropdown
content = re.sub(
    r'(<option value="high">High</option>)',
    r'\1\n                                    <option value="critical">Critical</option>',
    content
)

print("Step 7: Updating priority filter type...")
# Update filterPriority type
content = content.replace(
    "setFilterPriority<'all' | 'high' | 'medium' | 'low'>",
    "setFilterPriority<'all' | 'critical' | 'high' | 'medium' | 'low'>"
)

print("Step 8: Updating priority sorting...")
# Fix priorityOrder
content = content.replace(
    "const priorityOrder = { high: 3, medium: 2, low: 1 };",
    "const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };"
)

print("Step 9: Fixing status filter...")
# Fix completed filter
content = content.replace("s.status !== 'completed'", "s.status !== 'done'")

print("Step 10: Updating status mappings in data fetching...")
# Fix status mappings in useEffect
content = re.sub(
    r"status: dbStory\.status === 'done' \? 'completed' :[\s\S]+?'not-started'",
    """status: dbStory.status as Story['status']""",
    content
)

# Fix status mapping in handleAddStory
content = re.sub(
    r"const statusMap: Record<string, [^>]+> = \{[\s\S]+?\};",
    """const statusMap: Record<string, 'todo' | 'in_progress' | 'in_review' | 'done' | 'blocked'> = {
            'todo': 'todo',
            'in_progress': 'in_progress',
            'in_review': 'in_review',
            'done': 'done',
            'blocked': 'blocked'
        };""",
    content,
    count=1
)

print("\n✅ Clean file generated successfully!")
print("\nWriting to: src/components/sprint-board/sprint-board-client.tsx.new")

# Write the cleaned content
with open('src/components/sprint-board/sprint-board-client.tsx.new', 'w') as f:
    f.write(content)

print("\n📋 To apply the changes:")
print("   mv src/components/sprint-board/sprint-board-client.tsx.new src/components/sprint-board/sprint-board-client.tsx")
print("\n🧪 Then test with: npm run build")
