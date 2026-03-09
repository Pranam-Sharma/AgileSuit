# Sprint Date Synchronization

## Overview
Sprint start and end dates are now synchronized between two database tables:
1. **`sprints`** table - Stores basic sprint information including dates
2. **`sprint_planning`** table - Stores detailed planning data including dates

## Synchronization Flow

### 1. Creating a Sprint (Dashboard)
**Location**: `src/components/dashboard/create-sprint-dialog.tsx`

When a user creates a sprint with start/end dates:
1. Dates are saved to the `sprints` table via `createSprintAction`
2. If dates are provided, they are also synced to `sprint_planning` table
3. Sprint card on dashboard shows the dates from `sprints` table

**Files Modified**:
- `src/app/actions/sprints.ts` - `createSprintAction` now syncs dates to `sprint_planning`

### 2. Updating Dates in Planning Page
**Location**: `src/components/sprint-planning/sprint-planning-client.tsx`

When a user updates dates in the General Info section:
1. Dates are saved to `sprint_planning` table via `saveSprintPlanningAction`
2. These dates are automatically synced back to `sprints` table
3. Dashboard sprint cards are revalidated and show updated dates

**Files Modified**:
- `src/app/actions/sprint-planning.ts` - `saveSprintPlanningAction` now updates `sprints` table

### 3. Loading Dates in Planning Page
**Location**: `src/components/sprint-planning/sprint-planning-client.tsx`

When the planning page loads:
1. First, it tries to fetch dates from `sprint_planning` table
2. If no planning record exists, it falls back to `sprints` table dates
3. This ensures dates created on the sprint card are visible in planning page

**Files Modified**:
- `src/app/actions/sprint-planning.ts` - `getSprintPlanningAction` now falls back to `sprints` table

### 4. Displaying Dates on Sprint Card
**Location**: `src/components/dashboard/sprint-card.tsx`

Sprint cards always display dates from the `sprints` table, which are kept in sync with planning page dates.

## Database Schema

### sprints table
```sql
ALTER TABLE sprints
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE;
```

### sprint_planning table
Already has `start_date` and `end_date` columns.

## Key Actions

### `createSprintAction`
- **File**: `src/app/actions/sprints.ts`
- **Purpose**: Creates a new sprint and syncs dates to `sprint_planning`
- **Parameters**: `CreateSprintData` (includes `startDate`, `endDate`)
- **Sync Direction**: `sprints` → `sprint_planning`

### `saveSprintPlanningAction`
- **File**: `src/app/actions/sprint-planning.ts`
- **Purpose**: Saves planning data and syncs dates to `sprints`
- **Parameters**: `SprintPlanningData` (includes `start_date`, `end_date`)
- **Sync Direction**: `sprint_planning` → `sprints`

### `getSprintPlanningAction`
- **File**: `src/app/actions/sprint-planning.ts`
- **Purpose**: Loads planning data, falls back to sprint dates if no planning exists
- **Fallback**: Loads from `sprints` table if `sprint_planning` doesn't exist
- **Sync Direction**: N/A (read-only)

### `updateSprintDatesAction` (NEW)
- **File**: `src/app/actions/sprints.ts`
- **Purpose**: Updates only the dates in `sprints` table
- **Parameters**: `sprintId`, `startDate`, `endDate`
- **Sync Direction**: Direct update to `sprints` table

## Testing

After applying the migration (`002_add_sprint_dates.sql`), test the following scenarios:

### Test 1: Create Sprint with Dates
1. Go to Dashboard
2. Click "Create Sprint"
3. Fill in sprint details and set start/end dates
4. Submit
5. ✅ Dates should appear on the sprint card
6. Navigate to Planning page for that sprint
7. ✅ Dates should appear in General Info section

### Test 2: Update Dates in Planning
1. Go to Planning page for a sprint
2. Update start/end dates in General Info section
3. Click "Save All"
4. ✅ Toast notification confirms save
5. Navigate back to Dashboard
6. ✅ Sprint card shows updated dates

### Test 3: Create Sprint Without Dates
1. Create a sprint without setting dates
2. Go to Planning page
3. Set dates in General Info section
4. Save
5. ✅ Dates persist when navigating back to Dashboard

### Test 4: Legacy Sprints (created before date sync)
1. For sprints created before this feature
2. Opening Planning page should work (no dates initially)
3. Setting dates in Planning page should sync to sprint card
4. ✅ Both locations stay in sync

## Migration Instructions

See `MIGRATION_INSTRUCTIONS.md` for how to apply the database migration.

## Technical Notes

- **Bidirectional Sync**: Changes in either location update both tables
- **Fallback Logic**: Planning page can load dates from `sprints` if no planning record exists
- **Revalidation**: Both dashboard and planning pages are revalidated after updates
- **Upsert Logic**: Creating a sprint with dates uses upsert to avoid conflicts
- **Admin Client**: All syncs use admin client to bypass RLS policies

## Future Enhancements

Potential improvements:
1. Add a visual indicator when dates are synced
2. Show last sync timestamp
3. Add conflict resolution if both tables have different dates
4. Add a "sync now" button for manual sync
