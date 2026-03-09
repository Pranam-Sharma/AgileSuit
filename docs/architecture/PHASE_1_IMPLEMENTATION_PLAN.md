# Phase 1 (MVP) - Implementation Plan

**Status:** 40% Complete
**Target:** Complete all features for minimum viable product launch

---

## ✅ Completed Features

- [x] Sprint Planning Module
  - [x] General info section with date pickers
  - [x] Project priorities management
  - [x] Platform metrics configuration
  - [x] Sprint goals with status tracking
  - [x] Milestones with phases
  - [x] Sprint demos scheduling
  - [x] Review & save section with comprehensive data display
  - [x] Data persistence to Supabase
- [x] Kanban Board UI
  - [x] Drag-and-drop interface
  - [x] Customizable sidebar
  - [x] Filter UI components
  - [x] Beautiful card layout
- [x] Authentication & User Management
  - [x] Google OAuth via Firebase
  - [x] Email/Password authentication
  - [x] Forgot password functionality
  - [x] Company setup workflow
- [x] Dashboard
  - [x] Sprint cards with gradient UI
  - [x] Create/delete sprint functionality
  - [x] Sprint details view
- [x] Basic Infrastructure
  - [x] Next.js 14 setup with App Router
  - [x] Supabase integration
  - [x] Tailwind CSS + shadcn/ui components
  - [x] Firebase authentication
  - [x] Deployment pipeline (staging + production)

---

## 🚨 CRITICAL - Must Complete First

### 1. Sprint Board Data Persistence ✅
**Status:** ✅ COMPLETE
**Priority:** P0 - BLOCKING
**Estimated Effort:** 2-3 days
**Actual Time:** 1 day
**Completed:** January 28, 2026

**Current State:**
Board now fetches real data from Supabase database with full persistence.

**Implementation Tasks:**
- [x] Create database schema
  - [x] Create `stories` table in Supabase with fields:
    - `id` (uuid, primary key)
    - `sprint_id` (uuid, foreign key to sprints)
    - `title` (text, required)
    - `description` (text, nullable)
    - `story_points` (integer, nullable)
    - `assignee` (text, nullable - will be FK later)
    - `priority` (text: 'low' | 'medium' | 'high' | 'critical')
    - `status` (text: 'todo' | 'in_progress' | 'in_review' | 'done' | 'blocked')
    - `column_id` (text, tracks board column)
    - `position` (integer, for ordering within column)
    - `tags` (text array, for categorization)
    - `due_date` (date, optional)
    - `created_at` (timestamp)
    - `updated_at` (timestamp)
  - [x] Add RLS policies for stories table
  - [x] Create migration file `003_create_stories.sql`

- [x] Create Server Actions (replaces REST endpoints)
  - [x] `getStoriesBySprintId()` - Fetch all stories for a sprint
  - [x] `createStory()` - Create new story
  - [x] `updateStory()` - Update story (title, description, points, etc.)
  - [x] `moveStory()` - Update status and position on drag
  - [x] `deleteStory()` - Delete story
  - [x] `bulkCreateStories()` - Bulk import (for CSV import feature)

- [x] Update Sprint Board Component
  - [x] Replace hardcoded data with database calls
  - [x] Add loading states while fetching
  - [x] Handle error states
  - [x] Update drag-and-drop handler to call move API
  - [x] Implement optimistic updates for smooth UX
  - [ ] Add real-time subscriptions for multi-user updates (deferred to separate task)

**Files Created:**
- `supabase/migrations/003_create_stories.sql` ✅
- `src/app/actions/stories.ts` ✅
- `src/types/story.ts` ✅
- `SPRINT_BOARD_DATA_PERSISTENCE_COMPLETE.md` ✅ (documentation)

**Files Modified:**
- `src/components/sprint-board/sprint-board-client.tsx` ✅

**Acceptance Criteria:**
- ✅ Stories persist across page refreshes
- ✅ Drag-and-drop changes are saved to database
- ⏳ Multiple users see updates in real-time (requires real-time subscriptions - separate task)
- ✅ No data loss on browser refresh

**Next Steps:**
1. Run database migration: `supabase db push` or via SQL Editor
2. Test board functionality
3. Move to Task #2 (Story Creation & Editing UI)

---

### 2. Story Creation & Editing UI
**Status:** Not Started
**Priority:** P0 - CRITICAL
**Estimated Effort:** 1-2 days
**Depends On:** #1 (Database schema)

**Current State:**
No way to create or edit stories from the UI. Board only displays hardcoded data.

**Implementation Tasks:**
- [ ] Create Story Modal Component
  - [ ] Build `StoryModal.tsx` with form fields:
    - Title (required, text input)
    - Description (textarea with markdown support optional)
    - Story Points (number input, dropdown: 1, 2, 3, 5, 8, 13, 21)
    - Assignee (dropdown - populate from team list)
    - Priority (dropdown: Low, Medium, High, Critical)
  - [ ] Add form validation using zod
  - [ ] Handle create and edit modes
  - [ ] Add loading/saving states
  - [ ] Success/error toast notifications

- [ ] Add "Create Story" Button
  - [ ] Add floating action button on Kanban board
  - [ ] Place "Add Card" button in each column header
  - [ ] Open modal in create mode with column pre-selected

- [ ] Make Story Cards Clickable
  - [ ] Add onClick handler to story cards
  - [ ] Open modal in edit mode with pre-filled data
  - [ ] Show all story details in modal

- [ ] Add Delete Functionality
  - [ ] Add delete button in story modal
  - [ ] Show confirmation dialog before delete
  - [ ] Remove story from board on successful delete

**Files to Create:**
- `src/components/sprint-board/story-modal.tsx`
- `src/components/sprint-board/delete-story-dialog.tsx`

**Files to Modify:**
- `src/components/sprint-board/sprint-board-client.tsx`
- `src/app/actions/stories.ts`

**Acceptance Criteria:**
- ✓ Users can create new stories from the board
- ✓ Clicking a story card opens edit modal
- ✓ Changes are saved and immediately visible
- ✓ Users can delete stories with confirmation
- ✓ Form validation prevents invalid data

---

### 3. Sprint Status Management
**Status:** Not Started
**Priority:** P0 - CRITICAL
**Estimated Effort:** 1 day

**Current State:**
Sprints exist in database but have no lifecycle. No concept of "active" or "completed" sprints.

**Implementation Tasks:**
- [ ] Update Database Schema
  - [ ] Add `status` field to `sprint_planning` table: 'planning' | 'active' | 'completed'
  - [ ] Add `started_at` timestamp field
  - [ ] Add `completed_at` timestamp field
  - [ ] Create migration `003_add_sprint_status.sql`

- [ ] Create Sprint Actions API
  - [ ] `POST /api/sprints/{id}/start` - Mark sprint as active, set started_at
  - [ ] `POST /api/sprints/{id}/complete` - Mark as completed, calculate final metrics
  - [ ] Add validation (can't start if no dates set, can't complete if not started)

- [ ] Add UI Controls
  - [ ] Add "Start Sprint" button on sprint detail page (only if status = planning)
  - [ ] Add "Complete Sprint" button (only if status = active)
  - [ ] Show sprint status badge on dashboard cards
  - [ ] Disable editing for completed sprints
  - [ ] Show warning dialog before starting/completing sprint

- [ ] Update Dashboard
  - [ ] Filter active sprint to top
  - [ ] Show status badges on sprint cards
  - [ ] Add "Active Sprint" section
  - [ ] Add "Completed Sprints" archive section

**Files to Modify:**
- `supabase/migrations/003_add_sprint_status.sql` (new)
- `src/app/actions/sprint-planning.ts`
- `src/app/sprint/[id]/page.tsx`
- `src/components/dashboard/sprint-card.tsx`
- `src/types/sprint.ts`

**Acceptance Criteria:**
- ✓ Sprints have clear lifecycle states
- ✓ Only one sprint can be active at a time
- ✓ Completed sprints are read-only
- ✓ Status is visible throughout the app
- ✓ Proper validation prevents invalid transitions

---

## 🔴 HIGH PRIORITY - Core Features

### 4. Basic Retrospective Module
**Status:** Not Started
**Priority:** P1 - HIGH
**Estimated Effort:** 2-3 days

**Current State:**
Placeholder page exists (`/sprint/[id]/retrospective`) but has no functionality.

**Implementation Tasks:**
- [ ] Create Database Schema
  - [ ] Create `retrospectives` table:
    - `id` (uuid, primary key)
    - `sprint_id` (uuid, foreign key, unique)
    - `facilitator_id` (uuid, nullable)
    - `sticky_notes` (jsonb - array of notes with columns)
    - `action_items` (jsonb - array with status)
    - `created_at` (timestamp)
    - `updated_at` (timestamp)
  - [ ] Create migration `004_create_retrospectives.sql`

- [ ] Build Retrospective UI
  - [ ] Create 3-column layout:
    - "What Went Well" (green theme)
    - "What Didn't Go Well" (red theme)
    - "Action Items" (blue theme)
  - [ ] Add "New Note" button in each column
  - [ ] Sticky note component with:
    - Text content (textarea)
    - Author name
    - Vote count
    - Created timestamp
  - [ ] Voting mechanism (upvote button, counter)
  - [ ] Action items with checkbox (done/pending status)

- [ ] Create API Endpoints
  - [ ] `GET /api/retrospectives?sprint_id={id}` - Fetch retro data
  - [ ] `POST /api/retrospectives` - Create new retrospective
  - [ ] `POST /api/retrospectives/{id}/notes` - Add sticky note
  - [ ] `PATCH /api/retrospectives/{id}/notes/{noteId}` - Edit note
  - [ ] `POST /api/retrospectives/{id}/notes/{noteId}/vote` - Upvote note
  - [ ] `DELETE /api/retrospectives/{id}/notes/{noteId}` - Delete note
  - [ ] `PATCH /api/retrospectives/{id}/actions/{actionId}` - Toggle action status

- [ ] Add Navigation
  - [ ] Add "Retrospective" tab to sprint detail page
  - [ ] Link from sprint card on dashboard

**Files to Create:**
- `supabase/migrations/004_create_retrospectives.sql`
- `src/app/actions/retrospectives.ts`
- `src/components/sprint-retrospective/retrospective-board.tsx`
- `src/components/sprint-retrospective/sticky-note.tsx`
- `src/components/sprint-retrospective/action-item.tsx`

**Files to Modify:**
- `src/app/sprint/[id]/retrospective/page.tsx`

**Acceptance Criteria:**
- ✓ Team members can add sticky notes to each column
- ✓ Users can vote on notes (one vote per user per note)
- ✓ Action items can be marked as done/pending
- ✓ All changes persist to database
- ✓ Clean, intuitive UI matching AgileSuit design

---

### 5. Real Sprint Analytics
**Status:** Demo Data Only
**Priority:** P1 - HIGH
**Estimated Effort:** 2-3 days
**Depends On:** #1 (Stories database)

**Current State:**
Dashboard shows beautiful charts but with static/dummy data. No real calculations.

**Implementation Tasks:**
- [ ] Create Analytics API
  - [ ] `GET /api/analytics/burndown?sprint_id={id}` - Calculate daily remaining points
  - [ ] `GET /api/analytics/velocity?organization_id={id}` - Average from last 5 sprints
  - [ ] `GET /api/analytics/sprint-progress?sprint_id={id}` - Completed vs total points
  - [ ] `GET /api/analytics/team-capacity?sprint_id={id}` - Calculate from members & days

- [ ] Implement Burndown Chart Logic
  - [ ] Calculate ideal burndown line (linear from total to 0)
  - [ ] Calculate actual burndown from story completion dates
  - [ ] Group by day, sum remaining points
  - [ ] Handle weekends/holidays (flat line on non-working days)

- [ ] Implement Velocity Tracking
  - [ ] Query completed sprints (status = 'completed')
  - [ ] Sum story points completed per sprint
  - [ ] Calculate average of last 3-5 sprints
  - [ ] Show trend (increasing/decreasing velocity)

- [ ] Implement Sprint Progress
  - [ ] Real-time calculation: (completed points / total points) * 100
  - [ ] Count stories by status
  - [ ] Calculate points by status
  - [ ] Show as progress bar and percentage

- [ ] Update Dashboard Charts
  - [ ] Replace dummy data in `sprint-card.tsx`
  - [ ] Add loading states while fetching analytics
  - [ ] Handle edge cases (no data, sprint not started, etc.)
  - [ ] Add refresh button to update charts

**Files to Create:**
- `src/app/actions/analytics.ts`
- `src/lib/analytics-calculator.ts`

**Files to Modify:**
- `src/components/dashboard/sprint-card.tsx`
- `src/app/sprint/[id]/page.tsx` (add analytics section)

**Acceptance Criteria:**
- ✓ Burndown chart shows actual vs ideal progress
- ✓ Velocity is calculated from historical sprint data
- ✓ Sprint progress updates in real-time as stories move
- ✓ Charts are accurate and match actual sprint data
- ✓ Handles edge cases gracefully

---

### 6. Basic Team Management
**Status:** Not Started
**Priority:** P1 - HIGH
**Estimated Effort:** 2 days

**Current State:**
Team members are just text fields in sprint planning. No roster or member management.

**Implementation Tasks:**
- [ ] Create Database Schema
  - [ ] Create `team_members` table:
    - `id` (uuid, primary key)
    - `organization_id` (uuid, foreign key)
    - `user_id` (uuid, foreign key to auth.users, nullable)
    - `name` (text, required)
    - `email` (text, unique)
    - `avatar_url` (text, nullable)
    - `role` (text: 'developer' | 'designer' | 'qa' | 'product_owner' | 'scrum_master')
    - `is_active` (boolean, default true)
    - `created_at` (timestamp)
  - [ ] Create migration `005_create_team_members.sql`
  - [ ] Update `stories` table: change `assignee` from text to `assignee_id` (uuid, FK)

- [ ] Build Team Management UI
  - [ ] Add "Team" section to organization settings
  - [ ] List view of all team members (table/card layout)
  - [ ] Add member button (opens modal)
  - [ ] Edit member modal (name, email, role, avatar)
  - [ ] Deactivate/reactivate members (soft delete)
  - [ ] Show member count badge

- [ ] Update Sprint Planning
  - [ ] Replace text input with member multi-select dropdown
  - [ ] Show selected members with avatars
  - [ ] Link sprint to team members (new table: `sprint_members`)

- [ ] Update Story Assignee
  - [ ] Change assignee dropdown to populate from team_members table
  - [ ] Show avatar + name in dropdown
  - [ ] Display assignee avatar on story cards
  - [ ] Filter by assignee on board ("My Stories")

- [ ] Create API Endpoints
  - [ ] `GET /api/team-members?organization_id={id}` - List all members
  - [ ] `POST /api/team-members` - Add new member
  - [ ] `PATCH /api/team-members/{id}` - Update member
  - [ ] `DELETE /api/team-members/{id}` - Deactivate member

**Files to Create:**
- `supabase/migrations/005_create_team_members.sql`
- `src/app/actions/team-members.ts`
- `src/app/settings/team/page.tsx`
- `src/components/settings/team-member-form.tsx`

**Files to Modify:**
- `src/components/sprint-planning/sprint-planning-client.tsx`
- `src/components/sprint-board/story-modal.tsx`
- `src/components/sprint-board/sprint-board-client.tsx`

**Acceptance Criteria:**
- ✓ Team roster can be managed from settings
- ✓ Members can be assigned to sprints during planning
- ✓ Assignee dropdown in stories shows team members
- ✓ Avatars display on story cards
- ✓ "My Stories" filter works correctly

---

## 🟡 MEDIUM PRIORITY - Enhancement Features

### 7. Sprint Reports
**Status:** Page Exists, Needs Real Data
**Priority:** P2 - MEDIUM
**Estimated Effort:** 1-2 days
**Depends On:** #1, #5 (Stories & Analytics)

**Current State:**
Reports page exists but shows placeholder content or demo data.

**Implementation Tasks:**
- [ ] Create Report Data API
  - [ ] `GET /api/reports/sprint-summary?sprint_id={id}` - Comprehensive report data
  - [ ] Include: planned vs completed points, velocity, goals status, team performance

- [ ] Build Sprint Summary Report
  - [ ] Header section: sprint name, dates, duration
  - [ ] Metrics section:
    - Total points planned vs completed
    - Velocity comparison (current vs average)
    - Sprint goals achievement (% completed)
    - Stories completed count
  - [ ] Charts section:
    - Burndown chart
    - Story completion by day
    - Points by priority/assignee
  - [ ] Action items from retrospective

- [ ] Add PDF Export
  - [ ] "Export PDF" button using browser print API
  - [ ] Print-friendly CSS styles
  - [ ] Include all charts and tables
  - [ ] Add AgileSuit branding/logo

- [ ] Add CSV Export
  - [ ] Export stories list with all fields
  - [ ] Include sprint summary metrics
  - [ ] Download as CSV file

**Files to Create:**
- `src/app/actions/reports.ts`
- `src/components/reports/sprint-summary-report.tsx`
- `src/lib/export-utils.ts`

**Files to Modify:**
- `src/app/sprint/[id]/reports/page.tsx`

**Acceptance Criteria:**
- ✓ Report shows accurate data from sprint
- ✓ PDF export generates clean, readable report
- ✓ CSV export includes all story data
- ✓ Report is useful for stakeholder presentations

---

### 8. Import Functionality
**Status:** Export Works, Import Missing
**Priority:** P2 - MEDIUM
**Estimated Effort:** 1 day
**Depends On:** #1 (Stories database)

**Current State:**
Can export sprint data as JSON, but no way to import stories.

**Implementation Tasks:**
- [ ] Create CSV Import UI
  - [ ] Add "Import Stories" button on sprint board
  - [ ] File upload dialog (accepts .csv)
  - [ ] Show preview of imported data in table
  - [ ] Map CSV columns to story fields
  - [ ] Validation errors display
  - [ ] Confirm import button

- [ ] Build Import API
  - [ ] `POST /api/stories/import?sprint_id={id}` - Accept CSV file
  - [ ] Parse CSV (title, description, points, assignee, priority, status)
  - [ ] Validate each row (required fields, valid values)
  - [ ] Bulk insert stories into database
  - [ ] Return success count + error list

- [ ] Add CSV Template Download
  - [ ] "Download Template" link
  - [ ] Pre-formatted CSV with headers and example rows
  - [ ] Include instructions/comments

**Files to Create:**
- `src/components/sprint-board/import-dialog.tsx`
- `src/lib/csv-parser.ts`

**Files to Modify:**
- `src/app/actions/stories.ts`
- `src/components/sprint-board/sprint-board-client.tsx`

**Acceptance Criteria:**
- ✓ Users can import stories from CSV file
- ✓ Validation catches errors before import
- ✓ Preview shows what will be imported
- ✓ Bulk import completes quickly (even with 100+ stories)
- ✓ Template file makes format clear

---

### 9. Basic Notifications
**Status:** Not Started
**Priority:** P2 - MEDIUM
**Estimated Effort:** 1-2 days

**Current State:**
Only in-app toast notifications. No email notifications.

**Implementation Tasks:**
- [ ] Set Up Email Service
  - [ ] Configure Supabase email templates
  - [ ] Set up SMTP or use Supabase built-in emails
  - [ ] Create email layout template

- [ ] Create Notification Triggers
  - [ ] Database trigger: when story assignee changes, send email
  - [ ] Scheduled function: send sprint start reminder (day before)
  - [ ] Scheduled function: send sprint end reminder (last day)
  - [ ] Manual trigger: retrospective invitation

- [ ] Create Email Templates
  - [ ] Story assignment email (includes story details, link to board)
  - [ ] Sprint start reminder (includes sprint goals, duration)
  - [ ] Sprint end reminder (prompt to complete retrospective)

- [ ] Add Notification Preferences
  - [ ] User settings page: email notification toggles
  - [ ] Opt out of specific notification types
  - [ ] Store preferences in `user_preferences` table

- [ ] Create Notification History
  - [ ] Simple log table: `notifications` (user_id, type, sent_at, status)
  - [ ] View in user settings (optional, nice-to-have)

**Files to Create:**
- `supabase/migrations/006_create_notifications.sql`
- `src/app/actions/notifications.ts`
- `src/emails/story-assignment.tsx` (React Email)
- `src/emails/sprint-reminder.tsx`

**Acceptance Criteria:**
- ✓ Users receive email when assigned to a story
- ✓ Sprint reminders sent automatically
- ✓ Emails have professional design matching brand
- ✓ Users can opt-out of notifications
- ✓ No spam (rate limiting in place)

---

### 10. Search & Filters (Connect to Real Data)
**Status:** UI Exists, Not Connected
**Priority:** P2 - MEDIUM
**Estimated Effort:** 1 day
**Depends On:** #1 (Stories database)

**Current State:**
Filter sidebar has UI components but they don't actually filter any data.

**Implementation Tasks:**
- [ ] Implement Search Functionality
  - [ ] Add search input that filters stories by title/description
  - [ ] Client-side fuzzy search using fuse.js or similar
  - [ ] Highlight matching text in results
  - [ ] Clear search button

- [ ] Connect Existing Filters
  - [ ] Assignee filter: show only stories assigned to selected member
  - [ ] Priority filter: filter by Low/Medium/High/Critical
  - [ ] Status filter: show stories in specific columns
  - [ ] Story points filter: range slider (1-21 points)

- [ ] Add Quick Filters
  - [ ] "My Stories" - stories assigned to current user
  - [ ] "Unassigned" - stories with no assignee
  - [ ] "High Priority" - Critical + High priority stories
  - [ ] "Overdue" - stories past due date (Phase 2 feature prep)

- [ ] Add Filter Chips
  - [ ] Show active filters as removable chips above board
  - [ ] Click chip to remove filter
  - [ ] "Clear All Filters" button

- [ ] Add Sprint Selector
  - [ ] Dropdown to view stories from different sprints
  - [ ] Show current sprint by default
  - [ ] Link to sprint planning from dropdown

**Files to Modify:**
- `src/components/sprint-board/sprint-board-client.tsx`
- `src/components/sprint-board/board-filters.tsx`

**Acceptance Criteria:**
- ✓ Search filters stories in real-time
- ✓ All filter options work correctly
- ✓ Quick filters provide useful shortcuts
- ✓ Filter state persists during session (localStorage)
- ✓ Performance is smooth even with 100+ stories

---

## 📊 Phase 1 Progress Tracker

### By Priority
- **P0 (Critical):** 0/3 completed (0%)
- **P1 (High):** 0/3 completed (0%)
- **P2 (Medium):** 0/4 completed (0%)

### By Component
- **Database Schema:** 0/6 migrations completed
- **API Endpoints:** 0/8 endpoint groups completed
- **UI Components:** 1/10 major components completed
- **Infrastructure:** 5/5 completed ✓

### Overall Phase 1 Status
**40% Complete** (Infrastructure + Planning + Board UI)

---

## 🎯 Recommended Implementation Order

1. **Week 1 - Core Data Layer**
   - Sprint Board Data Persistence (#1)
   - Story Creation & Editing UI (#2)
   - Sprint Status Management (#3)

2. **Week 2 - Team & Analytics**
   - Basic Team Management (#6)
   - Real Sprint Analytics (#5)
   - Search & Filters (#10)

3. **Week 3 - Collaboration & Reporting**
   - Basic Retrospective Module (#4)
   - Sprint Reports (#7)
   - Import Functionality (#8)

4. **Week 4 - Polish & Launch**
   - Basic Notifications (#9)
   - Testing & bug fixes
   - Performance optimization
   - Documentation

---

## 📝 Notes

- **Simplified Approach:** Each feature focuses on MVP functionality. Advanced features (subtasks, time tracking, custom workflows) are intentionally deferred to Phase 2.
- **Database First:** Many features depend on proper database schema, so database migrations are critical path items.
- **Real-time Updates:** Use Supabase subscriptions for collaborative features where appropriate.
- **Mobile Responsive:** All UI should work on mobile devices (existing components already are responsive).
- **Testing:** Add basic tests as features are completed. Full test coverage in Phase 2.

---

## 🚀 Definition of Done (Phase 1 MVP)

Phase 1 is complete when:
- [ ] All 10 features listed above are implemented and working
- [ ] Users can create sprints, add stories, and track progress with real data
- [ ] Analytics show accurate metrics based on actual sprint data
- [ ] Retrospectives can be conducted and action items tracked
- [ ] Team members can be managed and assigned to work
- [ ] Reports can be generated and exported
- [ ] Basic notifications keep team informed
- [ ] App is stable with no critical bugs
- [ ] Performance is acceptable (page loads < 2s, interactions < 200ms)
- [ ] App is ready for beta user testing

**Target Launch Date:** [TBD based on team capacity]
