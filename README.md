# 💰 Family Expense Management System

A powerful, real-time **multi-user expense & income tracking system** designed for families or small groups to manage shared finances efficiently.

Built with **React + Firebase**, this system provides full visibility of financial activities including income, expenses, wallet balance, notifications, and receipts.

---

## 🚀 Overview

This application allows multiple users (family members) to:

* Track shared income sources
* Manage daily expenses
* Maintain a shared wallet
* Monitor full transaction history
* Receive real-time notifications
* Generate receipts for records

---

## ✨ Core Features

### 💸 Income Management

* Add income with reason/description
* Track multiple income sources
* Real-time updates across all users

---

### 🧾 Expense Management

* Add expenses with category and reason
* Track who spent the money
* Categorized expense tracking

---

### 🏦 Wallet System

* Add / Withdraw balance
* Mandatory reason popup for every transaction
* Live balance updates
* Full transaction logging

---

### 📊 Transaction History

* Detailed transaction table
* Shows:

  * Amount
  * Type (Income / Expense)
  * User
  * Date & Time
* Pagination (clean UI)
* Filters:

  * Date-wise
  * Category-wise

---

### 🔔 Notification System

* Central notification bell
* Tracks all activities:

  * Income added
  * Expense added
  * Advance requests
* Shows:

  * Who performed action
  * What action was done
  * Timestamp
* Features:

  * Mark as read/unread
  * Pagination (15 per page)

---

### 💳 Advance Request System

* Users can request advance money
* Mandatory reason field
* Visible to all users
* Tracked in notifications

---

### 🧾 Receipt System

* Auto-generated receipt numbers
* PDF receipt generation
* Stored in Firebase Storage

---

### 📈 Analytics & Insights

* Monthly financial summary
* Yearly tracking overview
* Financial timeline
* Heatmap visualization (full-year activity)

---

### 👥 Multi-User System

* Shared environment for all users
* Tracks:

  * Who added income
  * Who spent money
* Transparent financial activity

---

### 🎨 UI/UX Design

* Modern card-based UI
* Responsive dashboard layout
* Clean tables & pagination
* Smooth user experience

---

## 🏗️ Project Structure

```bash
src/
│
├── components/
│   ├── cards/              # Summary cards, UI blocks
│   ├── forms/              # Income & Expense forms
│   ├── common/             # NotificationBell, shared components
│   ├── layout/             # Sidebar, Topbar, Layout
│
├── pages/
│   ├── Dashboard.jsx       # Main dashboard
│   ├── Budget.jsx          # Income management
│   ├── Expenses.jsx        # Expense tracking
│   ├── Advances.jsx        # Advance requests
│   ├── Analytics.jsx       # Reports & insights
│   ├── Categories.jsx      # Expense categories
│
├── firebase/
│   ├── config.js           # Firebase config (env-based)
│   ├── auth.js             # Authentication logic
│   ├── firestore.js        # DB functions
│
├── context/
│   ├── AuthContext.jsx     # Auth state management
│
├── utils/
│   ├── generateReceiptNumber.js
│   ├── helpers.js
│
├── assets/                 # Images & icons
├── App.jsx
├── main.jsx
└── index.css
```

---

## 🛠 Tech Stack

* ⚛️ React + Vite
* 🔥 Firebase (Auth, Firestore, Storage)
* 🎨 Material UI (MUI)
* 📦 JavaScript (ES6)

---

## ⚙️ Setup Instructions

---

### 2️⃣ Install Dependencies

```bash
npm install
```

---

### 3️⃣ Setup Environment Variables

Create a `.env` file:

```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

---

### 4️⃣ Run the Project

```bash
npm run dev
```

---

## 🔐 Security

* Firebase config secured using `.env`
* `.env` excluded via `.gitignore`
* Firestore rules required for proper access control

---

## 📌 Key Highlights

* Real-time updates using Firebase
* Clean & scalable structure
* Multi-user collaboration system
* Financial transparency for shared environments

---

## 🚀 Future Enhancements

* Role-based access (Admin / Member)
* Export reports (PDF / Excel)
* Advanced analytics dashboard
* Dark mode
* Mobile optimization

---

## 🤝 Contributing

Contributions are welcome! Feel free to fork and improve.


---

## 👨‍💻 Author

Developed by **Arsalan*


## 🧩 System Architecture Matrix

| Layer       | Module | Files                                     | Responsibility             |
| ----------- | ------ | ----------------------------------------- | -------------------------- |
| 🎨 UI Layer | Layout | `Layout.jsx`, `Sidebar.jsx`, `Topbar.jsx` | App structure & navigation |
| 🎨 UI Layer | Cards  | `SummaryCard.jsx`                         | Dashboard summaries        |
| 🎨 UI Layer | Forms  | `ExpenseForm.jsx`, `IncomeForm.jsx`       | User input handling        |
| 🎨 UI Layer | Common | `NotificationBell.jsx`                    | Global notifications UI    |

---

| 📄 Pages Layer | Feature          | Files               | Responsibility         |
| -------------- | ---------------- | ------------------- | ---------------------- |
| Dashboard      | Overview         | `Dashboard.jsx`     | Main financial view    |
| Expenses       | Expense Tracking | `Expenses.jsx`      | Manage expenses        |
| Budget         | Income           | `Budget.jsx`        | Manage income          |
| Analytics      | Reports          | `Analytics.jsx`     | Financial insights     |
| Insights       | Deep Analysis    | `Insights.jsx`      | Advanced analytics     |
| Notifications  | Alerts           | `Notifications.jsx` | Activity tracking      |
| Receipts       | Documents        | `Receipts.jsx`      | Receipt management     |
| Advances       | Requests         | `Advances.jsx`      | Advance system         |
| Categories     | Classification   | `Categories.jsx`    | Expense categories     |
| Timeline       | History          | `Timeline.jsx`      | Financial timeline     |
| Wallets        | Balance          | `Wallets.jsx`       | Wallet system          |
| Reports        | Export           | `Reports.jsx`       | Reports generation     |
| Recurring      | Automation       | `Recurring.jsx`     | Recurring transactions |
| Login          | Auth             | `Login.jsx`         | User authentication    |

---

| 🔐 Backend Layer | Service   | Files            | Responsibility      |
| ---------------- | --------- | ---------------- | ------------------- |
| Firebase Core    | Config    | `config.js`      | Initialize Firebase |
| Authentication   | Auth      | `auth.js`        | Login / Signup      |
| Database         | Firestore | `firestore.js`   | CRUD operations     |
| Storage          | Files     | Firebase Storage | Receipts storage    |

---

| 🧠 Logic Layer | Module    | Files                      | Responsibility    |
| -------------- | --------- | -------------------------- | ----------------- |
| Notifications  | Service   | `notificationService.js`   | Activity tracking |
| Receipts       | Generator | `receiptGenerator.js`      | Receipt creation  |
| PDF Engine     | Styling   | `generateStyledPDF.js`     | PDF formatting    |
| Utils          | Helpers   | `generateReceiptNumber.js` | Unique IDs        |
| Templates      | UI        | `ReceiptTemplate.jsx`      | Receipt UI        |

---

| 🔄 State Layer | Module       | Files             | Responsibility          |
| -------------- | ------------ | ----------------- | ----------------------- |
| Auth Context   | Global State | `AuthContext.jsx` | User session management |

---

| 🧭 Routing Layer | Module     | Files           | Responsibility |
| ---------------- | ---------- | --------------- | -------------- |
| App Routing      | Navigation | `AppRoutes.jsx` | Route control  |

---

| ⚙️ Core System | Module  | Files                              | Responsibility |
| -------------- | ------- | ---------------------------------- | -------------- |
| Entry Point    | Main    | `main.jsx`                         | App bootstrap  |
| Root App       | App     | `App.jsx`                          | Main component |
| Styling        | Theme   | `theme.js`, `App.css`, `index.css` | UI styling     |
| Config         | Build   | `vite.config.js`                   | Build setup    |
| Environment    | Secrets | `.env`                             | Secure config  |

---

## 🔄 Data Flow Matrix

| Action               | Component   | Service             | Database           | Result            |
| -------------------- | ----------- | ------------------- | ------------------ | ----------------- |
| Add Income           | IncomeForm  | Firestore           | `transactions`     | Balance updated   |
| Add Expense          | ExpenseForm | Firestore           | `transactions`     | Deduct balance    |
| Request Advance      | Advances    | Firestore           | `advance_requests` | Notification sent |
| Generate Receipt     | Receipts    | Storage             | Firebase Storage   | PDF stored        |
| Trigger Notification | Any Action  | notificationService | `notifications`    | Bell update       |
| Login                | Login.jsx   | Auth                | Firebase Auth      | Session created   |

---

## 🧠 System Flow (Simplified)

```
User Action → React UI → Firebase Service → Firestore/Storage/Auth → UI Update
```

---

## 🏗️ Folder Structure (Visual)

```
src/
├── components/
├── pages/
├── firebase/
├── context/
├── utils/
├── routes/
├── assets/
├── App.jsx
├── main.jsx
```


## COMPLETE UML DIAGRAM (MASTER)
```plantuml
@startuml
title Family Expense Management System - Complete UML

' =======================
' 👤 ACTOR
' =======================
actor User

' =======================
' 🎨 FRONTEND (React)
' =======================
package "Frontend (React + Vite)" {

  package "Pages" {
    [Dashboard]
    [Expenses]
    [Budget]
    [Analytics]
    [Insights]
    [Notifications]
    [Receipts]
    [Advances]
    [Timeline]
    [Wallets]
    [Reports]
    [Recurring]
    [Login]
  }

  package "Components" {
    [SummaryCard]
    [NotificationBell]
    [ExpenseForm]
    [IncomeForm]
    [Layout]
    [Sidebar]
    [Topbar]
  }

  package "State" {
    [AuthContext]
  }

  package "Routing" {
    [AppRoutes]
  }
}

' =======================
' 🔐 BACKEND (Firebase)
' =======================
package "Firebase Backend" {

  [Auth]
  [Firestore]
  [Storage]

}

' =======================
' 🧠 DATA MODELS
' =======================
package "Data Models" {

  class UserModel {
    id
    name
    email
  }

  class Transaction {
    id
    amount
    type
    category
    reason
    createdAt
  }

  class Wallet {
    balance
  }

  class Notification {
    id
    title
    message
    readStatus
    createdAt
  }

  class AdvanceRequest {
    id
    amount
    reason
    status
  }

  class Receipt {
    id
    receiptNumber
    fileUrl
  }

}

' =======================
' 🔄 RELATIONSHIPS
' =======================

User --> Login
User --> Dashboard
User --> Expenses
User --> Budget
User --> Wallets
User --> Notifications
User --> Advances

Dashboard --> SummaryCard
Expenses --> ExpenseForm
Budget --> IncomeForm
Notifications --> NotificationBell

ExpenseForm --> Firestore : save expense
IncomeForm --> Firestore : save income
Advances --> Firestore : request advance
Receipts --> Storage : upload PDF

AuthContext --> Auth
AllPages --> Firestore
AllPages --> Auth

Firestore --> Transaction
Firestore --> Notification
Firestore --> AdvanceRequest
Firestore --> Wallet

Storage --> Receipt

UserModel --> Transaction : creates
UserModel --> Notification : receives
UserModel --> AdvanceRequest : requests
UserModel --> Wallet : owns

Transaction --> Receipt : generates

' =======================
' 🔄 SYSTEM FLOW
' =======================

User --> ExpenseForm : enters data
ExpenseForm --> Firestore : addDoc()
Firestore --> Wallet : update balance
Firestore --> Notification : create alert
Notification --> NotificationBell : UI update

@enduml
```

