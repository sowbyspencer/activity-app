# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Version History

### v1.0.10 (July 5, 2025)

- Added loading overlays (spinners) for all major actions: Create, Edit, Delete, Signup, and Profile Update, with user-friendly status messages (e.g., "Creating Activity...", "Updating Activity...", etc.).
- Improved input focus management and keyboard navigation for all forms (Signup, Activity, Profile), including ref forwarding and scrollable layouts.
- Disabled Submit/Sign Up buttons until all required fields (and images) are filled, with clear inactive styling.
- Enhanced Signup and Profile screens with required image upload, preview, and validation.
- Added refresh functionality for declined activities in Settings, with confirmation alerts and improved stack refresh logic.
- Updated documentation and work plan to reflect new user testing workflow, EAS Build/OTA steps, and detailed QA process.
- General UI/UX polish, bugfixes, and documentation updates in preparation for user testing and demo.

### v1.0.8 (June 30, 2025)

- Improved activity editing to update only changed fields, including robust image update, deletion, and addition logic (backend and frontend).
- Implemented full activity deletion, with backend and server filesystem cleanup, and added swipe-to-delete with confirmation and animation in My Activities (only one delete button visible at a time).
- Enhanced ActivityForm and AvailabilitySelector UI, including validation and error handling.
- Fixed Create Activity page header and ensured consistent image URL handling and user ID integration throughout activity features.

### v1.0.7 (June 19, 2025)

- Implemented "unlike/leave activity" feature:
  - Users can now long-press a group on the Groups page to leave/unlike an activity.
  - Leaving an activity removes the user from the group chat and any direct chats (if no other shared activities).
  - All related swipe records and messages from the user in group/direct chats are deleted on leave.
  - The group list refreshes automatically after leaving an activity.
- Updated UI to provide confirmation before leaving an activity group.

### v1.0.6 (June 11, 2025)

- The swipe API now returns a detailed JSON response including the swipe record, group membership update, and all direct chats created or found. This allows the frontend to provide more informative feedback to users after a swipe.
- When a user swipes up (joins an activity), direct chats are now automatically created between the new member and all other members of that activity, and both users are added to chat_member. This ensures all group members can chat directly as soon as they join an activity group.

### v1.0.5 (June 11, 2025)

- Integrated swipe actions with backend: swiping up/down records a like/dislike via the API.
- Swiped activity cards are now removed from the stack immediately.
- When all activities are swiped, a refresh option appears to repopulate declined activities.
- Group and activity group screens now show real group membership, not just swipe history.
- Improved UI feedback and error handling for swipe and group actions.

### v1.0.4 (June 4, 2025)

- Fixed duplicate activity fetches and server requests on repeated login/logout cycles by:
  - Adding a unique key based on userId to the tab navigator, forcing a remount on login/logout.
  - Ensuring only one instance of the ActivitySwiper and its effects run at a time.
- Added detailed debug logging to track effect runs, cleanups, and fetch calls for activity data.
- Cleaned up navigation and context usage to prevent memory leaks and race conditions.
- Updated documentation and work plan to reflect these changes.

### v1.0.3 (May 28, 2025)

- Completed the profile creation/edit UI, including all form fields, validation, and profile image upload/preview.
- Improved error handling and user feedback for profile updates.
- Finished backend profile update endpoints and tested integration.
- Fixed navigation bugs affecting tab switching and returning from nested screens.
- Created a custom reusable UI component and refactored related code for better consistency and layout responsiveness.
- Updated project documentation and work plan to reflect completed tasks.

### v1.0.2 (May 21, 2025)

- Refactored authentication to use a global AuthContext, making user_id available throughout the app after login.
- Enhanced login flow to correctly extract and persist user_id, resolving AsyncStorage warnings.
- Updated profile page to use user_id from AuthContext instead of navigation params.
- Improved navigation and header logic for chat and group chat screens; chat headers now display the correct activity or user name, even when there are no messages.
- Passed correct parameters (activityName for group chats, chatPartner for direct chats) when navigating to chat screens, ensuring accurate and user-friendly headers.
- Added custom headers for profile and my activities screens.
- General code cleanup and improved maintainability.

### v1.0.1

- Added a "Version History" section to the README to track changes.

### v1.0.0

- Initial project setup using `create-expo-app`.
- Implemented basic navigation and routing using Expo Router.
- Added support for fetching activities and displaying them in a swipeable interface.
- Integrated API services for activities, groups, and chats.
- Created reusable UI components such as `CustomInput`, `CustomButton`, and `ProfileImage`.
- Added support for user authentication and profile management.
- Implemented group and chat functionality with real-time message fetching.
- Included database schema and sample data for backend setup.
