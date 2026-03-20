# NEU HUB: Campus Visitor Management System

A highly responsive, real-time visitor management and analytics platform designed specifically for New Era University (NEU). This system streamlines the institutional check-in process while providing administrators with powerful data-driven insights.

## 🚀 Features

### For Visitors
- **Institutional Authentication**: Secure login restricted to `@neu.edu.ph` email domains.
- **Dynamic Check-in Flow**:
  - **Target Office Selection**: Choose between the **Library** or **Dean's Office** using an intuitive icon-based interface.
  - **Smart Purpose Selection**: The "Purpose of Visit" field automatically adjusts its options based on the selected office (e.g., Research for Library, Document Submission for Dean's Office).
  - **Classification**: Simple toggle between **Student** or **Staff** roles.
  - **Department Integration**: Full list of NEU Colleges and Departments for precise affiliation tracking.
- **Success Feedback**: Immediate confirmation with a "Welcome to NEU Library!" message upon successful check-in.

### For Administrators
- **Real-time Analytics Dashboard**:
  - **Live Sync**: Visitor logs update instantly as check-ins occur via Firebase Firestore.
  - **Interactive Filtering**: Filter data by **Time Range** (Day, Week, Month), **Department**, **Visit Reason**, and **Classification**.
  - **Status Tracking**: Monitor visitors as **Active** (On-Site), **Departed**, or **Flagged**.
- **User Management**:
  - **Institutional Directory**: Search and manage all registered community members.
  - **Access Control**: Ability to block or unblock users from campus access.
- **AI-Powered Reporting**:
  - **Dean's Summary**: Generate executive reports using Genkit (Gemini AI) that analyze peak hours and common visit rationales.
- **Specialized Access**: Multi-role support for specific accounts (e.g., `jcesperanza@neu.edu.ph`) to choose between Visitor or Admin entry.

## 🛠️ Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS & ShadCN UI (Modern Glassmorphism Theme)
- **Backend/Database**: Firebase Firestore (Real-time SDK)
- **Authentication**: Firebase Auth
- **AI Engine**: Genkit with Google Gemini
- **Charts**: Recharts for institutional analytics

## 📂 Project Structure
- `src/app/admin`: Real-time dashboard and management interfaces.
- `src/app/visitor`: Multi-step check-in process.
- `src/ai`: Genkit flows for automated administrative reporting.
- `src/lib/store`: Centralized data management and mock synchronization.
