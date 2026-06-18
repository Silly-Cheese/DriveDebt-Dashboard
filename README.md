# DriveDebt Dashboard

DriveDebt Dashboard is a private, owner-only finance command center built for fluctuating income, paycheck-based budgeting, savings goals, and car payoff acceleration.

## Core Features

- Firebase Google login
- Owner-only access guard
- Firestore auto-bootstrap for missing starter collections
- Paycheck tracking for variable income
- Bills and upcoming obligation tracking
- Safe-to-spend calculator
- Car payoff center with extra payment projections
- Savings goal vault
- Transaction ledger
- Financial reports

## Tech Stack

- React
- Vite
- Firebase Authentication
- Cloud Firestore
- Firebase Hosting

## Setup

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Deploy to Firebase Hosting:

```bash
firebase login
firebase use drivedebt-dashboard
firebase deploy
```

## Firebase Requirements

In Firebase Console:

1. Enable Authentication.
2. Enable Google sign-in provider.
3. Enable Cloud Firestore.
4. Deploy `firestore.rules`.
5. Add your local and deployed domains to Authentication authorized domains.

## Firestore Structure

The app stores data under:

```text
users/{uid}
  profile/main
  settings/main
  accounts/{accountId}
  paychecks/{paycheckId}
  transactions/{transactionId}
  bills/{billId}
  budgetRules/{ruleId}
  goals/{goalId}
  carLoan/main
  carPayments/{paymentId}
  paycheckPlans/{planId}
  reports/{reportId}
```

Firestore does not create empty collections by itself. The app creates starter documents the first time the owner logs in.

## Security

Rules restrict read/write access to the owner email and matching user UID only.

```js
request.auth.token.email == 'christophershelley257@gmail.com'
```

## Current Status

This is a working foundation. Next development steps should include editing/deleting records, account balance automation, advanced charts, recurring bill generation, and a paycheck allocation wizard.
