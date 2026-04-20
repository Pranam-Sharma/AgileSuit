#!/bin/bash

# Script to apply Task #2 improvements to sprint-board-client.tsx
# This fixes TypeScript errors and adds missing features without changing UI

FILE="src/components/sprint-board/sprint-board-client.tsx"

echo "Applying Task #2 improvements..."

# Step 1: Replace defaultColumns with empty columns (remove dummy data)
sed -i.backup1 '/^const defaultColumns: Column\[\] = \[/,/^\];$/c\
const defaultColumns: Column[] = [\
    { id: '"'"'backlog'"'"', title: '"'"'Backlog'"'"', gradient: '"'"'slate'"'"', stories: [] },\
    { id: '"'"'todo'"'"', title: '"'"'To Do'"'"', gradient: '"'"'blue'"'"', stories: [] },\
    { id: '"'"'in-progress'"'"', title: '"'"'In Progress'"'"', gradient: '"'"'orange'"'"', stories: [] },\
    { id: '"'"'review'"'"', title: '"'"'In Review'"'"', gradient: '"'"'purple'"'"', stories: [] },\
    { id: '"'"'done'"'"', title: '"'"'Done'"'"', gradient: '"'"'green'"'"', stories: [] }\
];' "$FILE"

# Step 2: Update Story type to include critical priority, tags, and due_date
sed -i.backup2 "s/priority: 'low' | 'medium' | 'high';/priority: 'low' | 'medium' | 'high' | 'critical';/" "$FILE"
sed -i.backup3 "s/status?: 'not-started' | 'in-progress' | 'completed' | 'blocked';/status?: 'todo' | 'in_progress' | 'in_review' | 'done' | 'blocked';\n    tags?: string[];\n    due_date?: string;/" "$FILE"

# Step 3: Update status labels and colors in helper functions
sed -i.backup4 "s/case 'not-started': return 'bg-zinc-100/case 'todo': return 'bg-zinc-100/" "$FILE"
sed -i.backup5 "s/case 'in-progress': return 'bg-blue-100/case 'in_progress': return 'bg-blue-100/" "$FILE"
sed -i.backup6 "s/case 'completed': return 'bg-green-100/case 'done': return 'bg-green-100/" "$FILE"

sed -i.backup7 "s/case 'not-started': return 'Not Started';/case 'todo': return 'To Do';/" "$FILE"
sed -i.backup8 "s/case 'in-progress': return 'In Progress';/case 'in_progress': return 'In Progress';/" "$FILE"
sed -i.backup9 "s/case 'completed': return 'Completed';/case 'done': return 'Done';/" "$FILE"
sed -i.backup10 "s/default: return 'Not Started';/case 'in_review': return 'In Review';\n            default: return 'To Do';/" "$FILE"

# Step 4: Add critical priority color
sed -i.backup11 "s/case 'high': return 'bg-red-100/case 'critical': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900\/30 dark:text-purple-300';\n            case 'high': return 'bg-red-100/" "$FILE"

# Step 5: Update initial state status
sed -i.backup12 "s/status: 'not-started'/status: 'todo'/" "$FILE"

# Step 6: Update status dropdown options
sed -i.backup13 's/value={newStory.status || '"'"'not-started'"'"'}/value={newStory.status || '"'"'todo'"'"'}/' "$FILE"
sed -i.backup14 's/<option value="not-started">Not Started<\/option>/<option value="todo">To Do<\/option>/' "$FILE"
sed -i.backup15 's/<option value="in-progress">In Progress<\/option>/<option value="in_progress">In Progress<\/option>/' "$FILE"
sed -i.backup16 's/<option value="completed">Completed<\/option>/<option value="in_review">In Review<\/option>\n                                <option value="done">Done<\/option>/' "$FILE"

# Step 7: Add critical priority option
sed -i.backup17 's/<option value="high">High<\/option>/<option value="high">High<\/option>\n                                    <option value="critical">Critical<\/option>/' "$FILE"

# Step 8: Update status type cast
sed -i.backup18 "s/as 'not-started' | 'in-progress' | 'completed' | 'blocked'/as Story['status']/" "$FILE"

# Step 9: Update priority filter to include critical
sed -i.backup19 "s/setFilterPriority<'all' | 'high' | 'medium' | 'low'>/setFilterPriority<'all' | 'critical' | 'high' | 'medium' | 'low'>/" "$FILE"

# Step 10: Update priorityOrder to include critical
sed -i.backup20 "s/const priorityOrder = { high: 3, medium: 2, low: 1 };/const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };/" "$FILE"

# Step 11: Update status filter condition
sed -i.backup21 "s/s.status !== 'completed'/s.status !== 'done'/" "$FILE"

# Clean up backup files
rm -f "$FILE".backup*

echo "✅ Task #2 improvements applied successfully!"
echo ""
echo "Changes made:"
echo "  ✓ Removed dummy data from defaultColumns"
echo "  ✓ Updated Story type to support critical priority, tags, and due_date"
echo "  ✓ Fixed status values (todo, in_progress, in_review, done, blocked)"
echo "  ✓ Added critical priority option"
echo "  ✓ Updated helper functions for status/priority display"
echo ""
echo "Remaining manual steps (optional):"
echo "  1. Add edit story functionality"
echo "  2. Add tags and due date fields to the story dialog"
echo "  3. Display tags on story cards"
echo ""
echo "Run 'npm run build' to verify TypeScript errors are fixed."
