# Cowat Specs

These specs describe the expected  for each major user flow.
They are written to be directly translatable into Playwright tests.

---

## Login
**File**: `e2e/login.spec.ts`

- **Login as admin** : Verify that an administrator can log in and access the application.
- **Login as user** : Verify that a standard user can log in and access the application.
- **Login as owner (TODO)** : Verifies that an owner can log in with the specific permissions associated with their role.
- **Login with redirect** : Verifies that the user is redirected to the requested page after logging in when accessing a protected route.

---

## Dashboard

**File**: `e2e/dashboard.spec.ts`
**Auth**: `USER_FILE`

- **View the 7-day commute calendar** : Check that the 7-day trip calendar displays correctly with at least one map visible.
- **Expand and collapse a commute card** : Verify that a route map can be opened to view its contents and then closed properly.

---

## Booking

**File**: `e2e/booking.spec.ts`
**Auth**: `USER_FILE`

- **Book a ride on a commute stop (REMOVE (replaced by the following 3 tests))** : Check whether a user can book a ride from an available stop.
- **Book a round trip on a commute stop (TODO)** : Check whether a user can book a round-trip on a given route.
- **Book an one way trip on a commute stop (TODO)** : Verifies that a user can book only the outbound leg of a trip.
- **Book a return trip on a commute stop (TODO)** : Verify that a user can only book the return of a trip.
- **Cancel an existing booking** : Verify that a user can cancel an existing reservation and access the booking option again.
- **Book, cancel, then book a different stop without conflict** : Verify that a user can book, cancel, and then book another leg of the trip without any errors or conflicts.

---

## Commute

**File**: `e2e/commute.spec.ts`
**Auth**: `USER_FILE`

- **Create a one-way commute from scratch** : Verify that a user can create a one-way commute.
- **Create a round-trip commute from scratch** : Verify that a user can create a round-trip commute.
- **Create a commute from a saved template (REMOVE (replaced by the following 2 tests))** : Verify that a user can create a commute based on a template.
- **Create a round commute from template (TODO)** : Verify that a user can create a round-trip with a template.
- **Create a one-way commute from template (TODO)** : Verify that a user can create a one-way trip with a template.
- **Edit commute (TODO)** : Verifies that a user can edit the details of an existing trip.
- **Cancel commute (TODO)** : Verify that a user can cancel an existing trip.

---

## Request

**File**: `e2e/requests.spec.ts`
**Auth**: `USER_FILE`

- **Accept a booking request** : Verifies that a driver can accept a booking request from a passenger.
- **Refuse a booking request** : Verifies that a driver can refuse a booking request.
- **Cancel a commute (driver) (I think this test need to be in commute.spec)** : Verifies that a driver can cancel one of their commutes.
- **Auto-accept automatically accepts (TODO)** : Verifies that bookings are automatically accepted when auto-accept is enabled.
- **Auto-accepted and then canceled requires manual validation (TODO)** : Verifies that a commute that was auto-accepted and later canceled behaves correctly (manual check may be needed).

---

## Location

**File**: `e2e/locations.spec.ts`
**Auth**: `USER_FILE`

- **Create a new location**: Verifies that a user can create a new location.
- **Edit an existing location**: Verifies that a user can edit an existing location’s details and see the updated information.
- **Delete a location**: Verifies that a user can delete a location and see confirmation that it no longer appears in the list.

---

## Commute template

**File**: `e2e/commute-templates.spec.ts`
**Auth**: `USER_FILE`

- **Create a new commute template**: Verifies that a user can create a new commute template.
- **Edit a commute template**: Verifies that a user can edit an existing commute template.
- **Delete a commute template**: Verifies that a user can delete an existing commute template and see confirmation.

---

## Account

**File**: `e2e/account.spec.ts`
**Auth**: `USER_FILE`

- **Update personal information**: Verifies that a user can update their personal details.
- **Enable auto-accept**: Verifies that a user can enable auto-accept for invitations and settings persist after reload.
- **Disable auto-accept**: Verifies that a user can disable auto-accept and settings persist after reload.
- **Update display preferences (TODO (I don't know if this is helpful))**: Verifies that a user can change display preferences.
- **Log out (TODO)**: Verifies that a user can log out of their account successfully.

---

## User

**File**: `e2e/users.spec.ts`
**Auth**: `ADMIN_FILE`

- **View the user list**: Verifies that an admin can see all users.
- **Search for a user**: Verifies that an admin can search for a user and see the filtered results.
- **Create a user**: Verifies that an admin can create a new user.
- **Edit a user**: Verifies that an admin can edit an existing user’s information.
- **Delete a user**: Verifies that an admin can delete a user.
- **Revoke user session (TODO)**: Verifies that an admin can revoke a user’s active session to force logout.

---

## Organization

**File**: `e2e/organizations.spec.ts`
**Auth**: `ADMIN_FILE`

- **View organization details**: Verifies that an admin can view the organization’s name, members, and pending invitations.
- **Update organization settings (I don't know if it's worth having)**: Verifies that an admin can update organization settings and see confirmation.
- **Create organization (TODO)**: Verifies that an admin can create a new organization.
- **Remove organization (TODO)**: Verifies that an admin can delete an existing organization.

---

## Invitation

**File**: `e2e/invitations.spec.ts`
**Auth**: `ADMIN_FILE` 

- **Accept an organization invitation**: Verifies that an invited user can accept an organization invitation and access the app or onboarding.
- **Refuse an organization invitation (TODO)**: Check whether it is possible to cancel an invitation
- **Expiration organization invitation (TODO)**: Verifies that invitations expire correctly and cannot be accepted after expiration.
