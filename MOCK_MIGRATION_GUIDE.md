# Mock Data Elimination Strategy

This guide outlines the steps to fully transition RAL-CMS from using local mock data to a fully dynamic, backend-driven state.

## Current State
Several pages (`TelecallingPage`, `RoleDashboard`, `RevenueAnalyticsPage`, `InstitutionalSalesPage`) still import a local `store` or specific constants from `@/lib/mock-data.ts`. This leads to:
1.  **Data Inconsistency:** Updates to the database aren't reflected if a page still reads from local storage/mock files.
2.  **Hybrid State:** Some data comes from APIs, some from mocks, making debugging difficult.

## Migration Strategy

### Step 1: Extend Backend APIs
Ensure every data point currently in `mock-data.ts` has a corresponding backend endpoint.
- **Missing Endpoints:**
    - `GET /api/courses` (To replace `mockCourses`)
    - `GET /api/benchmarks` (To replace `BENCHMARKS`)
    - `GET /api/verticals/college` (To replace `mockCollegeAccounts`, etc.)

### Step 2: Centralize API Calls with TanStack Query
Instead of using the local `store` object from `mock-data.ts`, use custom hooks that wrap `useQuery`.

```typescript
// Example: Frontend/src/hooks/use-courses.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data } = await axios.get('/api/courses');
      return data;
    },
  });
}
```

### Step 3: Replace Imports in Components
Refactor components to remove `import { store } from "@/lib/mock-data"` and replace it with the new hooks.

**Before:**
```typescript
import { store } from "@/lib/mock-data";
const leads = store.getLeads();
```

**After:**
```typescript
import { useLeads } from "@/hooks/use-leads";
const { data: leads, isLoading } = useLeads();
```

### Step 4: Clean Up
Once all pages are migrated:
1.  Delete `Frontend/src/lib/mock-data.ts`.
2.  Delete `Frontend/src/lib/vertical-data.ts`.
3.  Remove unused dependencies related to local storage mocking.

## Implementation Plan (Phase 1)
For immediate improvement, we will refactor `TelecallingPage.tsx` to stop using `store` and instead rely purely on the existing `/api/leads` and `/api/calllogs` endpoints.
