# AI IDE Prompt: Eliminating Mock Data from RAL-CMS

Copy and paste the following prompt into your AI-powered IDE (e.g., Cursor, Antigravity) to automate the removal of mock data and transition to the backend API.

---

## The Prompt

"Refactor the frontend to completely remove dependencies on `@/lib/mock-data.ts` and `@/lib/vertical-data.ts`. Every piece of data should now come from the backend API.

### Context:
1.  **Backend Base URL:** Use `import.meta.env.VITE_API_URL || "http://localhost:5000"`.
2.  **Auth:** Ensure all `axios` or `fetch` calls include the Authorization header: `Authorization: Bearer ${localStorage.getItem("crm_token")}`.
3.  **Data Consistency:** When fetching from the API, ensure you map `_id` to `id` for frontend compatibility where necessary (e.g., `res.data.map(item => ({ ...item, id: item._id }))`).

### Tasks:
1.  **Refactor `Frontend/src/pages/RoleDashboard.tsx`:**
    *   In `TelecallingManagerDashboard` and `OwnerDashboard`, replace all `store.get...()` calls with `useEffect` data fetching logic similar to the `TelecallerDashboard` component in the same file.
    *   Fetch missing data from their respective endpoints: `/api/campaigns`, `/api/leads`, `/api/admissions`, `/api/calllogs`, `/api/followups`, and `/api/users`.
2.  **Refactor `Frontend/src/pages/RevenueAnalyticsPage.tsx`:**
    *   Remove `import { COURSE_FEE_TIERS, getFeeBand } from "@/lib/mock-data"`.
    *   Migrate these constants to a new utility file or the backend.
3.  **Refactor `Frontend/src/pages/InstitutionalSalesPage.tsx`:**
    *   Replace all `store.get...()` and `store.save...()` calls with backend API integrations.
    *   You will likely need to create new backend routes/controllers for `CollegeAccounts` and `SchoolAccounts` if they don't exist, or mock the API calls to these paths for now.
4.  **Cleanup:**
    *   Remove any remaining imports of `store` from `@/lib/mock-data`.
    *   Once no files import from `mock-data.ts` or `vertical-data.ts`, delete those two files entirely.

Maintain all existing TypeScript interfaces and ensure the UI logic remains unchanged."
