# Quick Start Guide - Sprint Board Data Persistence

## 🚀 Get Started in 3 Steps

### Step 1: Run the Database Migration

Choose one of these methods:

#### Method A: Supabase CLI (Fastest) ⭐

```bash
supabase db push
```

#### Method B: Supabase Dashboard

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy contents from `supabase/migrations/003_create_stories.sql`
5. Click **Run**

### Step 2: Start Your Dev Server

```bash
npm run dev
```

### Step 3: Test the Board

1. Navigate to: `http://localhost:3000/sprint/{your-sprint-id}/board`
2. The board should now be empty (no hardcoded stories)
3. ✅ Success! Data persistence is working

---

## 🧪 How to Test

### Test 1: Verify Empty Board
- **Expected**: Board loads with no dummy data
- **If you see dummy data**: Migration didn't run or code wasn't updated

### Test 2: Page Refresh
- Create a story (you'll need Task #2 for UI, or manually insert via SQL)
- Refresh the page
- **Expected**: Story still appears

### Test 3: Drag and Drop
- Drag a story to another column
- Refresh the page
- **Expected**: Story stays in the new column

---

## 📝 Create Test Story (Manual Method)

While we don't have the story creation UI yet, you can manually add a test story via SQL:

```sql
INSERT INTO stories (sprint_id, title, description, column_id, priority, status, position)
VALUES (
  'YOUR_SPRINT_ID',  -- Replace with actual sprint ID
  'Test Story',
  'This is a test story to verify data persistence',
  'todo',            -- Column: backlog, todo, in-progress, review, or done
  'medium',          -- Priority: low, medium, high, critical
  'todo',            -- Status: todo, in_progress, in_review, done, blocked
  0                  -- Position in column
);
```

Run this in Supabase SQL Editor to create a test story.

---

## ❓ Troubleshooting

### Problem: Board shows "Loading stories..." forever

**Solution:**
```bash
# Check if migration ran successfully
supabase db pull  # Should show 003_create_stories.sql

# Check browser console for errors
# Open DevTools → Console tab
```

### Problem: "Cannot find module '@/app/actions/stories'"

**Solution:**
```bash
# Restart your dev server
# Press Ctrl+C, then run:
npm run dev
```

### Problem: Drag-and-drop doesn't save

**Solution:**
- Check browser console for errors
- Verify you're authenticated (logged in)
- Check that RLS policies were created in migration

### Problem: "Permission denied" error

**Solution:**
- RLS policies might not have been applied
- Re-run the migration SQL
- Check that your user's `org_id` matches the sprint's `org_id`

---

## 🔍 Verify Migration Success

Run these SQL queries in Supabase to verify:

```sql
-- 1. Check if table exists
SELECT * FROM stories LIMIT 1;

-- 2. Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'stories';

-- 3. Check indexes
SELECT * FROM pg_indexes WHERE tablename = 'stories';
```

All queries should return results without errors.

---

## 📚 What's Next?

Now that data persistence works, you can move on to:

1. **Task #2**: Story Creation & Editing UI
   - Add modal to create new stories
   - Make cards clickable to edit
   - Add delete functionality

2. **Task #3**: Sprint Status Management
   - Add sprint lifecycle (Planning → Active → Completed)

3. **Task #8**: Real-Time Subscriptions
   - See other users' changes live

---

## 📖 Full Documentation

For complete details, see:
- [SPRINT_BOARD_DATA_PERSISTENCE_COMPLETE.md](./SPRINT_BOARD_DATA_PERSISTENCE_COMPLETE.md)
- [PHASE_1_IMPLEMENTATION_PLAN.md](./PHASE_1_IMPLEMENTATION_PLAN.md)

---

**Need Help?** Check the browser console and server logs for error messages.
