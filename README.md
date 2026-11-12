# 🚗 Family Car Sharing — Mobile PWA

A modern, mobile-first Progressive Web App (PWA) built for families to effortlessly coordinate, reserve, and manage a shared vehicle across Android and iOS.

---

## ✨ Features

- 📅 **Hybrid Calendar**:
  - Compact horizontal week/month date strip on top with visual availability dots.
  - Detailed day schedule timeline showing confirmed drivers, destinations, and time ranges.
- ⏱️ **Flexible Booking Granularity**:
  - Day-level reservations (**Full Day**, **Morning**, **Afternoon**, **Evening**) or **Custom Hours**.
- 🚦 **First-Come, First-Served + Waiting List**:
  - The first member to reserve a slot gets it confirmed.
  - If another family member needs the car at an overlapping time, they can join the **Waiting List** with 1 tap.
  - The confirmed driver receives an instant in-app alert that someone is waiting.
  - When a reservation is canceled or modified, waiting family members are notified and can claim the freed slot with 1 tap.
- ⛽ **Vehicle Status & Handover**:
  - Live status card: **"Available"** or **"In Use by [Name]"**.
  - Remaining Fuel / Battery percentage bar.
  - Parking location & key handover notes (e.g. *"Driveway in front of garage"*, *"Key hook by front door"*).
  - Quick **"Update Status / Returned Car"** dialog.
- 🛰️ **GPS Tracker Ready**:
  - Data schema includes vehicle `gps: { latitude, longitude, address, updatedAt }` for seamless hardware GPS tracker integration in the future.
- 👨‍👩‍👧‍👦 **Family Onboarding & Sharing**:
  - Shareable Family Join Code and WhatsApp invite link.
  - Member management and color-coded avatar badges.
- 📱 **Installable PWA**:
  - Works on any mobile browser and can be installed directly to the home screen on iOS (Safari Share → *Add to Home Screen*) and Android Chrome (*Install App*).
- 🔄 **Real-Time Cross-Tab & Cross-Device Sync**:
  - Works immediately out-of-the-box with multi-tab real-time sync in demo mode, and connects to Google Firebase Cloud Firestore for multi-phone cloud sync.

---

## 🚀 Getting Started

### 1. Run Locally
```bash
npm install
npm run dev -- --host
```
Open [http://localhost:5173/](http://localhost:5173/) on your desktop or mobile browser.

### 2. Testing Multi-User Experience
- Use the **User Switcher** in the top right to switch between family members (**Mom**, **Dad**, **Alex**, **Emma**).
- Open the app in two browser windows or tabs side-by-side to test real-time booking, waiting list alerts, and status updates!

### 3. Connect to Firebase (Production)
When you are ready to deploy to production:
1. Create a project in [Firebase Console](https://console.firebase.google.com/).
2. Enable **Firestore Database** and **Authentication** (Email or Google).
3. Copy `.env.example` to `.env` and fill in your Firebase project keys:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=your-family.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-family-car
   VITE_FIREBASE_STORAGE_BUCKET=your-family-car.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
   VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef
   ```
4. Deploy for free using Firebase Hosting:
   ```bash
   npm run build
   npx firebase-tools deploy
   ```
