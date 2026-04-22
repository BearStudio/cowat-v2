# Happy Path Specs — Cowat

These specs describe the expected happy path behavior for each major user flow.
They are written to be directly translatable into Playwright tests.

## Conventions

- **User role**: `USER_FILE` storage state (`user@user.com`)
- **Admin role**: `ADMIN_FILE` storage state (`admin@admin.com`)
- **Navigation**: `page.to('/path')` resolves to the base URL
- **Login helper**: `page.login({ email })` submits email → auto-fills the mocked OTP
- **Data attributes**: The app uses `data-slot` and `data-testid` attributes for targeting
- **Toasts**: Success/error messages appear as toast notifications
- **Drawers**: Inline panels that open within the page (role="dialog")
- **Soft-delete**: Deletions produce a confirmation dialog before proceeding
- **OTP**: In the test environment, the OTP code is always the mocked value (`AUTH_EMAIL_OTP_MOCKED`)
- **Org slug**: Tests should navigate to `/app` (which redirects to the active org dashboard)

---

## 1. Authentication

### 1.1 Login as a regular user

**File**: `e2e/login.spec.ts` (already covered)

**Steps:**
1. Navigate to `/login`
2. Fill the email input with `user@user.com`
3. Click the "Sign up or Login with Email" button
4. Expect redirect to `/login/verify?email=user%40user.com`
5. The OTP input (6 digits) is auto-filled by the mock → form auto-submits
6. Expect redirect to `/app` (which further redirects to `/app/<orgSlug>/`)
7. Expect `[data-testid="layout-app"]` to be visible

### 1.2 Login as an admin user

**File**: `e2e/login.spec.ts` (already covered)

**Steps:**
1. Navigate to `/login`
2. Fill the email input with `admin@admin.com`
3. Click the "Sign up or Login with Email" button
4. Expect redirect to `/login/verify?email=admin%40admin.com`
5. OTP auto-fills and auto-submits
6. Expect redirect to `/manager` (which redirects to `/manager/<orgSlug>/`)
7. Expect `[data-testid="layout-manager"]` to be visible

### 1.3 Login with an access-protected redirect

**File**: `e2e/login.spec.ts` (already covered)

**Steps:**
1. Navigate to `/app` while unauthenticated
2. Expect redirect to `/login?redirect=/app`
3. Login with `admin@admin.com`
4. Expect redirect back to `/app` (the original requested URL)
5. Expect `[data-testid="layout-app"]` to be visible

---

## 2. Dashboard — Commute Discovery

**File**: `e2e/dashboard.spec.ts`
**Auth**: `USER_FILE`

### 2.1 View the 7-day commute calendar

**Steps:**
1. Navigate to `/app`
2. Expect redirect to `/app/<orgSlug>/`
3. Expect the page heading or navigation to be visible (e.g. `[data-testid="layout-app"]`)
4. Expect at least one `[data-slot="card-commute"]` element to be visible on the page
5. Each commute card should display:
   - Driver name (text content visible)
   - At least one stop row showing a location name and time
   - A seat count or "X seats" text
6. The page groups commutes by day — expect at least one day section heading (e.g. a date label) to be visible

### 2.2 Expand and collapse a commute card

**Steps:**
1. Navigate to `/app`
2. Locate the first `[data-slot="card-commute"]`
3. Click `[data-slot="card-commute-trigger"]` inside the card
4. Expect `[data-slot="card-commute-content"]` inside the card to be visible
5. Expect at least one stop with its time and location to be visible inside the content
6. Click `[data-slot="card-commute-trigger"]` again
7. Expect `[data-slot="card-commute-content"]` to be hidden or not visible

---

## 3. Booking Flow

**File**: `e2e/booking.spec.ts` (partially covered — extend with explicit happy paths)
**Auth**: `USER_FILE`

### 3.1 Book a ride on a commute stop

**Steps:**
1. Navigate to `/app`
2. Locate a commute card that has at least one "Book" button visible (i.e. the user has no booking yet)
   - If the card is collapsed, click `[data-slot="card-commute-trigger"]` first
3. Click the first `getByRole('button', { name: 'Book' })` inside `[data-slot="card-commute-content"]`
4. Expect a drawer (role="dialog") to open
5. Expect the heading "Book a ride" to be visible inside the drawer
6. The drawer shows stop details: location name, time, date
7. A trip type selector is visible (e.g. ONEWAY / ROUND / RETURN radio buttons or tabs)
   - The first available option is pre-selected
8. An optional comment textarea is present (can be left empty)
9. Click the "Book" button inside the drawer
10. Expect the drawer to close
11. Expect a toast with text "Booking request sent" to appear
12. Expect the stop row inside the commute card to now show a "Cancel" button (replacing "Book")
13. Expect no error toast (e.g. "Failed to send booking request") to be visible

### 3.2 Cancel an existing booking

**Steps:**
1. Navigate to `/app`
2. Locate a commute card where the user already has a booking (the stop shows a "Cancel" button)
   - If needed, perform scenario 3.1 first to create a booking
3. If the card is collapsed, click `[data-slot="card-commute-trigger"]`
4. Click the "Cancel" button inside `[data-slot="card-commute-content"]`
5. Expect a confirmation dialog to appear with a "Delete" button
6. Click the "Delete" button
7. Expect a toast with text "Booking cancelled" to appear
8. Expect the stop row to now show a "Book" button (booking removed)
9. Expect no error toast (e.g. "Failed to cancel booking") to be visible

### 3.3 Book, cancel, then re-book a different stop

**File**: `e2e/booking.spec.ts` (already covered)

---

## 4. Create Commute

**File**: `e2e/commute.spec.ts`
**Auth**: `USER_FILE`

### 4.1 Create a one-way commute from scratch

**Steps:**
1. Navigate to `/app`
2. Click the "New Commute" button (or navigate to `/app/<orgSlug>/commutes/new`)
3. Expect redirect to `/app/<orgSlug>/commutes/new`
4. **Step 1 — Template picker**:
   - Expect a "Start from scratch" option to be visible
   - Click "Start from scratch" (or "Skip" / "Create without template")
5. **Step 2 — Commute details**:
   - Expect a date picker, seats field, type selector, and optional comment field
   - Select a date (e.g. tomorrow's date via the date picker)
   - Set seats to `2`
   - Select commute type "ONEWAY"
   - Click "Next" or "Continue"
6. **Step 3 — Outward stops**:
   - Expect a form to add stops
   - Add the first stop:
     - Select a location from the dropdown (first available option)
     - Enter an outward time (e.g. `08:00`)
   - Add a second stop:
     - Click "Add stop"
     - Select a different location
     - Enter a later time (e.g. `08:30`)
   - Click "Next"
7. **Step 5 — Recap** (no inward stops for ONEWAY):
   - Expect a summary showing date, type "ONEWAY", 2 seats, and 2 stops
   - Click "Create Commute" (or "Submit")
8. Expect redirect to the dashboard or "My Commutes" page
9. Expect a success toast (e.g. "Commute created") to appear
10. Expect the new commute to appear in the list

### 4.2 Create a round-trip commute from scratch

**Steps:**
1. Navigate to `/app/<orgSlug>/commutes/new`
2. Select "Start from scratch"
3. **Step 2 — Commute details**:
   - Select a date
   - Set seats to `3`
   - Select commute type "ROUND"
   - Click "Next"
4. **Step 3 — Outward stops**:
   - Add 2 stops with locations and outward times
   - Click "Next"
5. **Step 4 — Inward stops** (only visible for ROUND):
   - Expect the inward stops form to appear
   - Enter inward times for each stop (pre-populated with locations from outward stops)
   - Click "Next"
6. **Step 5 — Recap**:
   - Expect summary showing type "ROUND", 3 seats, 2 outward stops with times, 2 inward times
   - Click "Create Commute"
7. Expect success toast and redirect to dashboard or commutes list

### 4.3 Create a commute from a saved template

**Pre-condition**: At least one commute template exists (see scenario 7.1).

**Steps:**
1. Navigate to `/app/<orgSlug>/commutes/new`
2. **Step 1 — Template picker**:
   - Expect a list of saved templates to be visible
   - Click on the first template card or "Use this template" button
3. **Step 2 — Commute details**:
   - Expect fields to be pre-populated from the template (seats, type)
   - Change the date to a future date
   - Click "Next"
4. **Step 3 — Outward stops**:
   - Expect stops to be pre-populated from the template
   - Adjust times if needed
   - Click "Next"
5. **Step 5 — Recap**:
   - Confirm summary matches selected template + updated date
   - Click "Create Commute"
6. Expect success toast

---

## 5. Driver — Request Management

**File**: `e2e/requests.spec.ts`
**Auth**: `USER_FILE` (user who has created commutes and has incoming requests)

> **Note**: These tests require seed data where another member has requested a booking on a commute driven by the logged-in user. Alternatively, set up with `ADMIN_FILE` if the admin user owns commutes with pending requests.

### 5.1 Accept a booking request

**Steps:**
1. Navigate to `/app/<orgSlug>/requests`
2. Expect at least one pending booking request card to be visible
3. Each request card shows:
   - Passenger name and avatar
   - Stop location and time
   - Trip type
   - Optional comment
   - "Accept" and "Refuse" action buttons
4. Click the "Accept" button on the first request card
5. Expect a success toast (e.g. "Booking accepted") to appear
6. Expect the request card to update its status to "Accepted" or disappear from the pending list

### 5.2 Refuse a booking request

**Steps:**
1. Navigate to `/app/<orgSlug>/requests`
2. Expect at least one pending booking request card to be visible
3. Click the "Refuse" button on a request card
4. Expect a success toast (e.g. "Booking refused") to appear
5. Expect the request card to update its status to "Refused" or disappear from the pending list

### 5.3 Cancel a commute (driver)

**Steps:**
1. Navigate to `/app/<orgSlug>/commutes`
2. Expect a list of commutes driven by the current user
3. Locate a commute card with a "Cancel commute" button or similar action
4. Click the "Cancel commute" button
5. Expect a confirmation dialog to appear with a warning and a "Delete" button
6. Click the "Delete" button
7. Expect a success toast (e.g. "Commute cancelled") to appear
8. Expect the commute to be removed from the list

---

## 6. Location Management

**File**: `e2e/locations.spec.ts`
**Auth**: `USER_FILE`

### 6.1 Create a new location

**Steps:**
1. Navigate to `/app/<orgSlug>/account/locations`
2. Expect the page heading "My Locations" (or similar) to be visible
3. Click the "New Location" or "Add Location" button
4. Expect a drawer (role="dialog") to open with a location form
5. The form has:
   - "Name" field (required)
   - "Address" field (required)
   - "Latitude" field (optional)
   - "Longitude" field (optional)
6. Fill "Name" with a unique value (e.g. `Home - Test`)
7. Fill "Address" with a value (e.g. `1 Rue de la Paix, Paris`)
8. Click "Create" (or "Save") inside the drawer
9. Expect the drawer to close
10. Expect a success toast (e.g. "Location created") to appear
11. Expect the new location to appear in the list with the name "Home - Test"

### 6.2 Edit an existing location

**Pre-condition**: At least one location exists (create via 6.1 or seed data).

**Steps:**
1. Navigate to `/app/<orgSlug>/account/locations`
2. Locate a location row with an "Edit" button
3. Click the "Edit" button
4. Expect a drawer (role="dialog") to open with the location form pre-filled
5. Clear the "Name" field and type a new name (e.g. `Home - Updated`)
6. Click "Save" inside the drawer
7. Expect the drawer to close
8. Expect a success toast (e.g. "Location updated") to appear
9. Expect the location row to now display "Home - Updated"

### 6.3 Delete a location

**Pre-condition**: At least one location exists.

**Steps:**
1. Navigate to `/app/<orgSlug>/account/locations`
2. Locate a location row with a "Delete" button
3. Click the "Delete" button
4. Expect a confirmation dialog to appear with warning text and a "Delete" button
5. Click the "Delete" button in the dialog
6. Expect a success toast (e.g. "Location deleted") to appear
7. Expect the deleted location to no longer appear in the list

---

## 7. Commute Template Management

**File**: `e2e/commute-templates.spec.ts`
**Auth**: `USER_FILE`

### 7.1 Create a new commute template

**Steps:**
1. Navigate to `/app/<orgSlug>/account/commute-templates`
2. Expect the page heading "Commute Templates" (or similar) to be visible
3. Click "New Template" (or navigate to `/app/<orgSlug>/account/commute-templates/new`)
4. **Template details form**:
   - Fill "Name" with a unique value (e.g. `Home to Office`)
   - Set seats to `2`
   - Select type "ROUND"
   - Leave comment empty
5. **Outward stops**:
   - Add at least 2 stops with locations and outward times
6. **Inward stops** (shown for ROUND):
   - Enter inward times for each stop
7. Click "Create" (or "Save")
8. Expect redirect to the templates list
9. Expect a success toast (e.g. "Template created") to appear
10. Expect the new template "Home to Office" to appear in the list

### 7.2 Edit a commute template

**Pre-condition**: At least one template exists.

**Steps:**
1. Navigate to `/app/<orgSlug>/account/commute-templates`
2. Click on a template or an "Edit" button for a template
3. Expect redirect to `/app/<orgSlug>/account/commute-templates/<id>/update`
4. Update the "Name" field to a new value (e.g. `Home to Office - Updated`)
5. Update seats to `4`
6. Click "Save"
7. Expect redirect back to the templates list
8. Expect a success toast (e.g. "Template updated") to appear
9. Expect the updated name and seat count to be visible in the list

### 7.3 Delete a commute template

**Pre-condition**: At least one template exists.

**Steps:**
1. Navigate to `/app/<orgSlug>/account/commute-templates`
2. Locate a template row with a "Delete" button
3. Click the "Delete" button
4. Expect a confirmation dialog to appear with a "Delete" button
5. Click the "Delete" button in the dialog
6. Expect a success toast (e.g. "Template deleted") to appear
7. Expect the deleted template to no longer appear in the list

---

## 8. Account Settings

**File**: `e2e/account.spec.ts`
**Auth**: `USER_FILE`

### 8.1 Update personal information

**Steps:**
1. Navigate to `/app/<orgSlug>/account`
2. Expect the "Account" page to be visible
3. Locate the personal info section (shows Name, Email, Phone)
4. Click "Edit" (or the edit button on the user card)
5. Expect a form or inline edit with:
   - "Name" field (pre-filled with current name)
   - "Phone" field (pre-filled or empty)
6. Update "Name" to a new value (e.g. `Updated User`)
7. Click "Save"
8. Expect a success toast (e.g. "Account updated") to appear
9. Expect the new name to be visible on the page

### 8.2 Enable auto-accept for bookings

**Steps:**
1. Navigate to `/app/<orgSlug>/account`
2. Locate the "Member Preferences" section
3. Expect an "Auto-accept" toggle switch to be visible
4. If the toggle is currently OFF, click it to enable
5. Expect a success toast (e.g. "Preferences updated") to appear
6. Expect the toggle to now be in the ON state (checked/enabled)
7. Reload the page
8. Expect the toggle to still be in the ON state (persisted)

### 8.3 Disable auto-accept for bookings

**Pre-condition**: Auto-accept is currently enabled.

**Steps:**
1. Navigate to `/app/<orgSlug>/account`
2. Locate the "Auto-accept" toggle in the Member Preferences section
3. Click the toggle to disable it
4. Expect a success toast (e.g. "Preferences updated") to appear
5. Expect the toggle to now be in the OFF state

---

## 9. Manager — User Management

**File**: `e2e/users.spec.ts` (partially covered — extend as needed)
**Auth**: `ADMIN_FILE`

### 9.1 View the user list

**Steps:**
1. Navigate to `/manager`
2. Expect redirect to `/manager/<orgSlug>/`
3. Expect `[data-testid="layout-manager"]` to be visible
4. Navigate to the users section (click "Users" in nav or go to `/manager/<orgSlug>/users`)
5. Expect a table or list of users to be visible
6. Expect each row to show: user name, email, role
7. Expect a "New User" button to be visible
8. Expect a search input (placeholder "Search...") to be visible

### 9.2 Search for a user

**Steps:**
1. Navigate to `/manager/<orgSlug>/users`
2. Click the search input (placeholder "Search...")
3. Type `admin`
4. Expect the list to filter and show only users whose name or email contains "admin"
5. Expect `admin@admin.com` to be visible in the filtered results
6. Clear the search input
7. Expect the full user list to be restored

### 9.3 Create a new user

**File**: `e2e/users.spec.ts` (already covered)

**Steps:**
1. Navigate to `/manager/<orgSlug>/users`
2. Click "New User"
3. Expect redirect to `/manager/<orgSlug>/users/new`
4. Fill "Name" with `New User`
5. Fill "Email" with a unique email (e.g. `new-user-<randomId>@user.com`)
6. Click "Create"
7. Expect redirect to `/manager/<orgSlug>/users`
8. Search for the new email in the search box
9. Expect the new user to appear in the list

### 9.4 Edit an existing user

**File**: `e2e/users.spec.ts` (already covered)

**Steps:**
1. Navigate to `/manager/<orgSlug>/users`
2. Click on `admin@admin.com` in the list
3. Expect redirect to the user detail page
4. Click the "Edit user" link/button
5. Expect redirect to `/manager/<orgSlug>/users/<id>/update`
6. Update "Name" to a new value (e.g. `Admin <randomId>`)
7. Click "Save"
8. Expect redirect back to the users list or user detail
9. Expect the new name to be visible

### 9.5 Delete a user

**File**: `e2e/users.spec.ts` (already covered)

**Steps:**
1. Navigate to `/manager/<orgSlug>/users`
2. Click on a deletable user row (not the admin account)
3. Click the "Delete" button
4. Expect a danger zone confirmation dialog: "You are about to permanently delete this user."
5. Click the "Delete" button in the dialog
6. Expect a toast "User deleted" to appear
7. Expect the user to no longer appear in the list

---

## 10. Manager — Organization Management

**File**: `e2e/organizations.spec.ts`
**Auth**: `ADMIN_FILE`

### 10.1 View organization details

**Steps:**
1. Navigate to `/manager`
2. Expect the organization dashboard at `/manager/<orgSlug>/`
3. Expect the organization name to be visible on the page
4. Expect a "Members" section listing organization members
5. Expect each member row to show: user name, email, role
6. Expect a "Pending Invitations" section (even if empty)

### 10.2 Update organization settings

**Steps:**
1. Navigate to `/manager/<orgSlug>/account`
2. Expect an organization settings form with:
   - "Name" field (pre-filled)
   - Optional logo upload
3. Update "Name" to a new value (e.g. `Updated Org Name`)
4. Click "Save"
5. Expect a success toast (e.g. "Organization updated") to appear
6. Expect the new name to be reflected in the page heading or nav

---

## 11. Invitation Flow

**File**: `e2e/invitations.spec.ts`
**Auth**: `ADMIN_FILE` for sending, fresh session for accepting

### 11.1 Accept an organization invitation

**Pre-condition**: An invitation link/ID exists (created via manager or seed data).

**Steps:**
1. Navigate to `/invitations/<invitationId>`
2. Expect an invitation acceptance page to be visible
3. Expect text showing the organization name and inviter's name
4. Click "Accept" (or "Join Organization")
5. If unauthenticated: expect redirect to `/login` → login → redirect back to invitation
6. Expect redirect to `/app/<orgSlug>/` upon acceptance
7. Expect the new organization to be available in the org switcher

---

## Appendix: Test Infrastructure Notes

### Storage states
- `USER_FILE` = `e2e/.auth/user.json` — pre-authenticated as `user@user.com`
- `ADMIN_FILE` = `e2e/.auth/admin.json` — pre-authenticated as `admin@admin.com`

### Custom helpers
- `page.to('/path')` — navigate to a path relative to base URL
- `page.login({ email })` — submit email form + auto-fill mocked OTP

### Data attributes to target
| Selector | Description |
|---|---|
| `[data-slot="card-commute"]` | Commute card container |
| `[data-slot="card-commute-trigger"]` | Expand/collapse button on commute card |
| `[data-slot="card-commute-content"]` | Expanded content of commute card |
| `[data-testid="layout-app"]` | Main app layout wrapper |
| `[data-testid="layout-manager"]` | Manager layout wrapper |
| `role="dialog"` | Drawers and modals (booking, location edit, etc.) |

### Toast assertions
| Toast text | Trigger |
|---|---|
| `"Booking request sent"` | Successful booking submission |
| `"Booking cancelled"` | Successful booking cancellation |
| `"Booking accepted"` | Driver accepts a request |
| `"Booking refused"` | Driver refuses a request |
| `"Commute cancelled"` | Driver cancels a commute |
| `"Commute created"` | New commute successfully created |
| `"Location created"` | New location saved |
| `"Location updated"` | Location edit saved |
| `"Location deleted"` | Location removed |
| `"Template created"` | New template saved |
| `"Template updated"` | Template edit saved |
| `"Template deleted"` | Template removed |
| `"Account updated"` | Personal info saved |
| `"Preferences updated"` | Member preferences saved |
| `"User deleted"` | Admin deleted a user |
| `"Organization updated"` | Org settings saved |

### Confirmation dialogs (danger zone pattern)
All destructive actions follow this pattern:
1. Click action button (e.g. "Delete", "Cancel commute")
2. Expect confirmation dialog with warning text
3. Click "Delete" button inside dialog to confirm
4. Expect success toast
