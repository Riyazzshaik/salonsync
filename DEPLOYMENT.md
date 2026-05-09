# SalonSync Deployment Guide

Follow these steps to prepare and deploy SalonSync to production.

## 1. Firebase Console Preparation (CLEANUP)
Before the final deployment, it is highly recommended to reset your Firebase environment for a clean production start.

### Manual Cleanup Steps:
1. **Firebase Authentication**:
   - Go to **Authentication** > **Users**.
   - Delete all temporary/test accounts created during development.
   - Keep your primary **Admin** account.

2. **Firestore Database**:
   - Go to **Firestore Database** > **Data**.
   - **Delete** documents in the following collections that were used for testing:
     - `bookings`
     - `queues`
     - `adminLogs`
     - `salons` (Wait! Only delete salons if you want to clear the marketplace list. Keep verified production-ready salons).
   - Ensure the `users` collection is synchronized with the remaining Auth users.

3. **Firebase Storage**:
   - Go to **Storage**.
   - Delete unused test images or old salon banners.

## 2. Environment Configuration
Ensure your `.env` file in the root directory is populated with production keys:
```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_ORS_API_KEY=...
```

## 3. Build & Deployment Commands
Run the following commands in your terminal:

```bash
# 1. Install dependencies (if not done)
npm install

# 2. Build the production bundle
npm run build

# 3. Login to Firebase CLI
firebase login

# 4. Initialize Firebase (if not done)
# firebase init

# 5. Deploy everything (Rules, Indexes, and Hosting)
firebase deploy
```

## 4. Post-Deployment Verification
Once deployed, verify:
- [ ] **Auth**: Signup/Login/Logout works correctly.
- [ ] **Role Protection**: Admins can see `/admin`, Owners can see `/owner/dashboard`.
- [ ] **Maps**: Directions and routing load correctly.
- [ ] **SPA Refresh**: Refreshing the browser on a nested route (e.g. `/salon/2`) does not return a 404.

## 5. Required Production Data (Seeding)
Immediately after deployment, create:
1. One **Admin** account (can be done via Signup and manually changing `role: "admin"` in Firestore).
2. One **Verified Salon** (Register as Owner, then Approve as Admin).

Congratulations! Your SalonSync Marketplace is live!
