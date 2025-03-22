# Account Deletion Feature

This document explains the implementation of the account deletion feature in the AirCompass app.

## Overview

The account deletion feature allows users to permanently delete their accounts and all associated data from the application.

## Implementation Details

### Client-side

1. **Auth Context**
   - Added a `deleteAccount` function to the AuthContext that:
     - Deletes user data from the `users` table
     - Attempts to delete the auth record using Supabase admin APIs
     - Falls back to using a custom RPC function if admin APIs are not available
     - Clears local session state

2. **UI Implementation**
   - Added a "Delete Account" button to the profile screen
   - Implemented a two-step confirmation process with clear warnings
   - Provides feedback on success/failure
   - Redirects to the sign-in screen after successful deletion

### Server-side

1. **Database Function**
   - Created a `delete_user()` PostgreSQL function in Supabase
   - Function runs with SECURITY DEFINER to ensure it has proper permissions
   - Deletes user data from all relevant tables
   - Sets appropriate permissions (only authenticated users can execute)

## Security Considerations

- Double confirmation prevents accidental deletions
- Database function uses the authenticated user's ID for security
- Server-side validation ensures only the owner can delete their own account
- All associated user data is removed to comply with privacy regulations

## Testing

To test the account deletion feature:
1. Create a test account
2. Add some user data (preferences, saved locations, etc.)
3. Go to the profile screen and tap "Delete Account"
4. Confirm through both confirmation dialogs
5. Verify you're redirected to the sign-in screen
6. Try to sign in with the deleted account credentials (should fail)
7. Check the database to ensure all user data has been removed

## Future Improvements

- Add analytics to track account deletions
- Implement a cooldown period or account recovery option
- Add an optional feedback form to understand reasons for account deletion 