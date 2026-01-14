## Plan: Build Hours Tracking with Self-Managed Sessions & Tasks

Build a self-service hour tracking system for the `/build` pages where users can start/stop their own sessions (with location/time validation), manage tasks with approval workflows, and view their build hours on a calendar. Admins can manage tasks and approve/reject them.

### Steps

1. **Create database tables via Supabase migrations**: Add `BuildLocations` (valid GPS locations), `BuildGroups`, `BuildGroupMembers`, `BuildTasks` (with `status` enum: to_do, in_review, rejected, complete), and `BuildSessions` (self-managed with `started_at`/`ended_at`, location validation). Extend RLS policies to allow members to manage own sessions/tasks and admins to manage all.

2. **Create build page structure** in [`src/app/build/`](a:\Optix\otoolkit\src\app\build\): Add `page.tsx` (dashboard), `loading.tsx`, and components folder with `ActiveSessionCard.tsx`, `TaskList.tsx`, `BuildCalendar.tsx`, `StartSessionDialog.tsx`, and `TaskCard.tsx`.

3. **Implement self-service session logic**: Create `src/lib/db/build.ts` with functions for `startBuildSession()` (validates location/time), `stopBuildSession()`, `getBuildSessions()`, and `getUserBuildMinutes()`. Add geolocation hook `useUserLocation.ts` to check proximity to `BuildLocations`.

4. **Build the dashboard UI**: Display current build hours, active session card (with stop button), task list (swipeable on mobile, week-view on desktop using existing `DateTimePicker`/`calendar`), and "Start Logging" button that validates location/time before enabling.

5. **Implement task management workflow**: Create `TaskCard` component showing task status badge (using [`getStatusBadgeColors`](a:\Optix\otoolkit\src\lib\utils.ts)), "Submit for Review" action for members, and "Approve/Reject" actions for admins. Tasks can be assigned to groups via `BuildGroupMembers`.

6. **Add admin management page** at `src/app/build/manage/page.tsx`: Allow admins to create/edit tasks, manage groups, review submitted tasks, and view all user sessions with override capabilities.

### Further Considerations

1. **Location validation granularity**: Should users be blocked entirely if not at valid location, or just warned? Recommend: warn + flag sessions as "remote" vs "on-site".

2. **Time validation rules**: What defines "valid time"? Recommend: configurable per-location (e.g., 3pm-9pm weekdays) stored in `BuildLocations.valid_hours` as JSONB.

3. **Task assignment model**: Should tasks be assigned to individuals, groups, or both? Recommend: groups with optional individual assignment, where completing a group task credits all members.
