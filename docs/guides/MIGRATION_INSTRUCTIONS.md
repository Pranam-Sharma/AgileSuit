# Database Migration: Add Sprint Date Fields

## Issue
Start and end dates were not being persisted in the database, causing them to disappear after page navigation.

## Solution
Added `start_date` and `end_date` columns to the `sprints` table.

## Migration File
The migration SQL is located at: `supabase/migrations/002_add_sprint_dates.sql`

## How to Apply the Migration

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/juaxjuaiyicqqncdglrx
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/002_add_sprint_dates.sql`
4. Click **Run** to execute the migration

### Option 2: Using Supabase CLI
If you have the Supabase CLI installed:
```bash
npx supabase db push
```

## Code Changes Made
The following files have been updated to handle the date fields:

1. **src/app/actions/sprints.ts**
   - Added `startDate` and `endDate` to `CreateSprintData` type
   - Updated `createSprintAction` to insert dates into database
   - Updated `getSprintsAction` to retrieve and map dates
   - Updated `getSprintAction` to retrieve and map dates

2. **src/app/sprint/[sprintId]/board/page.tsx**
   - Updated sprint mapping to include `startDate` and `endDate`

3. **src/components/dashboard/create-sprint-dialog.tsx** (already done)
   - Added date input fields to the form

4. **src/components/dashboard/sprint-card.tsx** (already done)
   - Added date display on sprint cards

## Testing
After applying the migration:
1. Create a new sprint with start and end dates
2. Navigate away from the dashboard
3. Return to the dashboard
4. Verify that the dates are still displayed on the sprint card
