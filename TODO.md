# Todo: Fix Online Experts on Dashboard

## Steps:
- [ ] Fix the filter in dashboard.js to check for `is_online` (snake_case) instead of `online`/`isOnline`
- [ ] Verify the fix works by checking the code logic

## Issue:
- Backend returns experts with `is_online: true` (snake_case)
- Dashboard.js was checking for `online`, `isOnline`, `status` (camelCase)
- Fix: Add `e?.is_online === true` to the filter
