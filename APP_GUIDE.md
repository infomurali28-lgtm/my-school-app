# The School ERP — Mobile App & Deployment Guide

This repository contains both:
1. **The School ERP Web Application** (React 18 + Vite + Tailwind CSS + Supabase PostgreSQL).
2. **Android Mobile App Project** (`android/`) ready for building an installable `.apk` for parents, teachers, and school staff.
3. **Progressive Web App (PWA)** enhancements for 1-click home screen install on Android & iOS devices.

Live Web App: [https://the-school-erp.vercel.app/](https://the-school-erp.vercel.app/)

---

## 📱 1. Instant Mobile App Installation (PWA — Recommended for Parents & Staff)

You and your school members can install the app immediately on phones **without downloading APK files or waiting for Google Play Store approval**:

### On Android (Chrome / Edge / Samsung Internet):
1. Open **[https://the-school-erp.vercel.app/](https://the-school-erp.vercel.app/)** on your Android phone's Google Chrome.
2. A top banner will appear: **"Install The School Mobile App"**.
3. Tap **"Install App"** (or tap the 3 dots menu `⋮` in Chrome -> tap **"Install app"** or **"Add to Home Screen"**).
4. The School icon will appear on your phone home screen and app drawer. It opens like a native app with full screen, fast loading, and offline caching!

### On iPhone / iPad (iOS Safari):
1. Open **[https://the-school-erp.vercel.app/](https://the-school-erp.vercel.app/)** in **Safari**.
2. Tap the **Share** button (the square with an arrow pointing up at the bottom).
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **"Add"** in the top-right corner.

---

## 🤖 2. Native Android APK (.apk)

The complete native Android project is located in the [`android/`](android/) directory.

### Key Native Android Features:
- **Dedicated WebView** configured for `https://the-school-erp.vercel.app/`.
- **Automatic File Downloads**: Fee receipts, student ID cards, student lists, payslips, and `.xlsx` Excel spreadsheets are saved directly to the Android "Downloads" folder with system notifications.
- **Photo Upload & Camera Support**: Allows parents/staff to take camera photos or select files for student profiles and document submissions.
- **Hardware Back Button**: Pressing the back button navigates through pages inside the ERP instead of immediately closing the app. Double-tap to exit.
- **Pull-To-Refresh**: Swipe down from top to refresh live school data.
- **Offline Screen**: Displays a friendly "No Internet" screen with a retry button when campus Wi-Fi or mobile data disconnects.

---

### How to Build the `.apk` File:

#### Method 1: Build in the Cloud using GitHub Actions (Zero Local Setup)
1. Push this folder to a GitHub repository (public or private).
2. The included GitHub Actions workflow ([`.github/workflows/build-apk.yml`](.github/workflows/build-apk.yml)) will automatically trigger.
3. Once finished (takes ~2 minutes), go to the **Actions** tab on GitHub -> click the latest run -> download **`The-School-ERP-Debug-APK`**.
4. Transfer the `app-debug.apk` to any Android phone and tap to install!

#### Method 2: Open in Android Studio
1. Install [Android Studio](https://developer.android.com/studio).
2. Open Android Studio -> Click **Open** -> Select the `android` folder in this directory:
   `c:\Users\mural\Downloads\my school\android`
3. Wait for Gradle sync to complete.
4. Click **Build** menu -> **Build Bundle(s) / APK(s)** -> **Build APK(s)**.
5. Android Studio will generate the APK at:
   `android/app/build/outputs/apk/debug/app-debug.apk`

#### Method 3: Command Line (If Java 17 + Android SDK installed)
Double click `build-apk.bat` in this folder or run:
```powershell
cd android
.\gradlew.bat assembleDebug
```

---

## 💻 3. Running the ERP Web Application Locally

To run the web app on your local machine:
- Double-click **`START.bat`**
OR run in terminal:
```powershell
npm.cmd run build
python -m http.server 5173 --bind 127.0.0.1 --directory dist
```
Then open: [http://127.0.0.1:5173/](http://127.0.0.1:5173/)

---

## 🗄️ Database & Backend Details
- **Backend**: Supabase PostgreSQL
- **Supabase URL**: `https://tipobwermptihgdhqiie.supabase.co`
- **Default Super Admin Login**:
  - **Email**: `admin@theschool.edu`
  - **Password**: `admin`
