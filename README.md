# EAlcotime

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.0.0.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
-------------------------------------------------------------------------------------------------------

## Step 4: Firebase Console Setup

1. Go to https://console.firebase.google.com/
2. Click "Add Project"
3. Enter project name: "alcohol-store"
4. Disable Google Analytics (or enable if you want)
5. Click "Create Project"

### Enable Firebase Services:

**Authentication:**
1. Click "Authentication" → "Get Started"
2. Enable "Email/Password"
3. Enable "Google" (optional but recommended)

**Firestore Database:**
1. Click "Firestore Database" → "Create Database"
2. Choose "Start in test mode" (we'll secure it later)
3. Select your region

**Storage:**
1. Click "Storage" → "Get Started"
2. Start in test mode
3. Your default location will be selected

**Get Firebase Config:**
1. Go to Project Settings (gear icon)
2. Scroll to "Your apps"
3. Click the web icon (</>)
4. Register app: "alcohol-store-web"
5. Copy the firebaseConfig object

## Step 5: Configure Firebase in Angular

Create `src/environments/environment.ts`:
```typescript
e// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDNU3qcKmJ79WMxrTPThsxFOVjxFwn2HSQ",
  authDomain: "alcohol-store-alcotime.firebaseapp.com",
  projectId: "alcohol-store-alcotime",
  storageBucket: "alcohol-store-alcotime.firebasestorage.app",
  messagingSenderId: "161211103297",
  appId: "1:161211103297:web:6b1b50b2bd52949b51aec0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
```

Create `src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  firebaseConfig: {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  }
};
```

## Step 6: Update angular.json

Add Bootstrap to `angular.json` in the "styles" and "scripts" arrays:
```json
"styles": [
  "src/styles.scss",
  "node_modules/bootstrap/dist/css/bootstrap.min.css",
  "node_modules/bootstrap-icons/font/bootstrap-icons.css"
],
"scripts": [
  "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"
]
```

## Step 7: Initialize Firebase in App

Update `src/app/app.config.ts`:
```typescript
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { routes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage())
  ]
};
```

## Step 8: Project Structure

Create this folder structure:
```
src/
├── app/
│   ├── components/
│   │   ├── navbar/
│   │   ├── footer/
│   │   ├── product-card/
│   │   └── cart-item/
│   ├── pages/
│   │   ├── home/
│   │   ├── products/
│   │   ├── product-detail/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── login/
│   │   ├── register/
│   │   └── admin/
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── product.service.ts
│   │   ├── cart.service.ts
│   │   └── order.service.ts
│   ├── models/
│   │   ├── user.model.ts
│   │   ├── product.model.ts
│   │   ├── cart.model.ts
│   │   └── order.model.ts
│   └── guards/
│       ├── auth.guard.ts
│       └── admin.guard.ts
```

## Step 9: Run the Application

```bash
ng serve
```

Open browser to http://localhost:4200

## Next Steps

Once you complete this setup, we'll create:
1. **Authentication System** (Login/Register with age verification)
2. **Product Models and Services**
3. **Home Page with Product Listings**
4. **Shopping Cart**
5. **Checkout Process**
6. **Admin Dashboard**
