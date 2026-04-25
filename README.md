# RAL-CMS

RAL-CMS is a robust Course Management System (CMS) and Customer Relationship Management (CRM) platform designed to handle the entire student lifecycle—from lead generation and marketing campaigns to academic counseling, admissions, and financial management.

## 🚀 Key Features

- **Lead Management:** Multi-channel lead capture, automated round-robin assignment, and qualification tracking.
- **Campaign Tracking:** Monitor marketing campaign performance and ROI.
- **Role-Based Dashboards:** Specialized views for Admins, Counselors, Telecallers, and Managers.
- **Finance & Accounts:** Manage invoices, payments, and expense approvals.
- **Industry Alliances:** Track institutional partnerships and corporate relations.
- **Kanban Pipeline:** Visual lead management system.

## 🛠️ Technology Stack

### Backend
- **Node.js & Express:** Scalable server-side logic.
- **MongoDB & Mongoose:** Flexible NoSQL database schema.
- **JWT & Bcrypt:** Secure authentication and authorization.

### Frontend
- **React & TypeScript:** Type-safe, component-driven UI.
- **Vite:** High-performance build tool.
- **Tailwind CSS & Shadcn/UI:** Modern, responsive design system.
- **TanStack Query:** Efficient server-state management.
- **Recharts:** Data visualization for analytics.

## 📥 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd RAL-CMS
   ```

2. **Backend Setup:**
   ```bash
   cd Backend
   npm install
   # Create a .env file with:
   # PORT=5000
   # MONGO_URI=your_mongodb_uri
   # JWT_SECRET=your_jwt_secret
   npm run seed # Optional: Seed the database with master data
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd Frontend
   npm install
   # Create a .env file with:
   # VITE_API_URL=http://localhost:5000
   npm run dev
   ```

## 📂 Project Structure

```text
.
├── Backend/          # Node.js Express server
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
├── Frontend/         # React Vite application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── lib/
│   │   └── App.tsx
└── AUDIT_REPORT.md   # Exhaustive system review and recommendations
```

## 🧪 Testing

- **Frontend:** Run `npm run test` or `npm run test:watch` using Vitest.
- **E2E:** Playwright configuration is available in the Frontend directory.

## 📄 License

This project is proprietary.
