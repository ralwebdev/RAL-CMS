# RAL-CMS

A comprehensive CRM system for managing leads, campaigns, and admissions.

## Project Audit (April 2024)

An exhaustive review of the RAL-CMS repository has been performed. Key findings include:

- **Functional Audit:** Mapped primary flows from Lead generation to Admission.
- **Implementation Quality:** JWT security is solid; identified redundant mock data in the frontend.
- **Dependency Check:** Modern stack (Vite/React/Node), but needs better backend validation (e.g., Zod).
- **Feature Gaps:** Suggested AI Lead Scoring and WhatsApp automation.
- **Scalability:** Modular structure is good; recommended adding a Service Layer for further growth.

**Read the full report here: [AUDIT_REPORT.md](./AUDIT_REPORT.md)**

## Repository Structure

- `Backend/`: Express server, Mongoose models, and API routes.
- `Frontend/`: React application using Vite, Tailwind CSS, and Shadcn UI.

## Getting Started

Refer to the README files in the respective directories for detailed setup instructions:
- [Backend README](./Backend/package.json)
- [Frontend README](./Frontend/README.md)
