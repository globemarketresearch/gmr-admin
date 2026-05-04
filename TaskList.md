# ✅ Admin Panel – Comprehensive Task List

## Market Research Website

---

## Assumptions

- Frontend (client-facing website) is already built
- Backend core APIs are available
- Admin Panel is a separate internal application
- Stack: Next.js (Admin) + Go (Backend)

---

## 🧱 EPIC 0: Project Setup & Foundations

### 0.1 Repository & Environment

- [x] Create `admin-panel` Next.js repository
- [x] Setup environment variables (dev / staging / prod)
- [x] Configure backend API base URLs
- [x] Setup ESLint, Prettier, Husky
- [x] Configure Tailwind CSS + ShadCN UI
- [x] Setup protected routes layout

### 0.2 Design System

- [x] Admin layout (sidebar + header)
- [x] Reusable UI components
  - [x] Buttons
  - [x] Inputs
  - [x] Tables
  - [x] Modals
  - [x] Pagination
- [x] Theme support (light / dark)

---

## 🔐 EPIC 1: Authentication & RBAC

### Frontend

- [x] Login page UI
- [x] JWT token storage & refresh handling
- [x] Protected route guards
- [x] Role-based menu visibility
- [x] Session expiry handling

### Backend

- [x] Admin authentication APIs
- [x] Roles & permissions schema
- [x] RBAC middleware
- [x] Login/logout audit logs

---

## 📊 EPIC 2: Dashboard

### Frontend

- [x] KPI cards (reports, drafts, traffic, leads)
- [x] Recent activity feed
- [x] Quick actions (Create Report / Blog)
- [x] Loading skeletons

### Backend

- [x] Dashboard aggregation APIs
- [x] Activity logs API
- [x] Redis caching for metrics

---

## 📄 EPIC 3: Reports Management

### Frontend

- [x] Reports list (filters + pagination)
- [x] Create/Edit report form
- [x] HTML rich-text editor integration
- [x] Section-based content editor
- [x] Draft / Publish toggle
- [x] Preview mode
- [x] Version history view

### Backend

- [x] Report CRUD APIs
- [x] Slug generation logic
- [x] Draft vs published handling
- [x] Report versioning schema
- [x] Access control (free / paid)

---

## ✍️ EPIC 4: Blog Management

### Frontend

- [x] Blog list page
- [x] Blog editor with image embedding
- [x] Category & tag management
- [x] Author mapping UI
- [x] Draft → Review → Publish workflow

### Backend

- [x] Blog CRUD APIs
- [x] Category & tag APIs
- [x] Author entity APIs
- [x] Publish workflow enforcement

---

## 📈 EPIC 5: Charts & Data Visualization

### Frontend

- [x] Chart builder UI (Bar, Stacked Bar, Pie charts)
- [x] Manual data entry (interactive table editor)
- [x] CSV upload (with validation and error handling)
- [x] CSV export (for data backup)
- [x] Chart preview (real-time with ECharts)
- [x] Export to WEBP and PNG (multiple resolutions)
- [x] Logo upload and positioning
- [x] Color customization
- [x] Chart metadata (title, subtitle, axis labels, etc.)
- [x] Configuration import/export (JSON)

### Backend

- [x] Chart data schema
- [x] Chart image generation service
- [x] WEBP export endpoint
- [x] Chart linking to reports/blogs

---

## 🔍 EPIC 6: SEO Management

### Frontend

- [ ] SEO metadata editor (title, description, keywords)
- [ ] OpenGraph preview
- [ ] Canonical URL input
- [ ] Schema JSON editor
- [ ] SEO validation warnings

### Backend

- [ ] SEO metadata storage
- [ ] Validation rules enforcement
- [ ] Sitemap regeneration trigger
- [ ] Robots.txt update hook

---

## 🖼️ EPIC 7: Media Management

### Frontend

- [ ] Media library grid view
- [ ] Image upload modal
- [ ] Alt text enforcement
- [ ] Image reuse selector
- [ ] Thumbnail previews

### Backend

- [ ] Image upload API
- [ ] Cloudinary integration
- [ ] Auto compression & WEBP conversion
- [ ] Media metadata persistence

---

## 💰 EPIC 8: Pricing & Access Control

### Frontend

- [ ] Pricing editor per report
- [ ] Sales preview mode

### Backend

- [ ] Pricing schema
- [ ] Access enforcement logic
- [ ] Region-based pricing support (optional)

---

## 📥 EPIC 9: Lead & Inquiry Management

### Frontend

- [ ] Leads list page
- [ ] Lead detail view
- [ ] Status update actions
- [ ] CSV export

### Backend

- [ ] Lead capture APIs
- [ ] Lead status update APIs
- [ ] Export service

---

## 👤 EPIC 10: User Management

### Frontend

- [ ] Users list page
- [ ] Create/Edit user form
- [ ] Role assignment UI
- [ ] Disable user flow

### Backend

- [ ] User CRUD APIs
- [ ] Role mapping schema
- [ ] Last login tracking
- [ ] Audit logging

---

## ⚙️ EPIC 11: System & Configuration

### Frontend

- [ ] System settings UI
- [ ] Feature toggle switches
- [ ] Environment flags display

### Backend

- [ ] Configuration APIs
- [ ] Feature flag storage
- [ ] Admin-only access enforcement

---

## 🚀 EPIC 12: Performance & Quality

### Performance

- [ ] Pagination for large datasets
- [ ] Redis caching where applicable
- [ ] Debounced search inputs
- [ ] Lazy loading heavy components

### Quality

- [ ] Global form validation
- [ ] Error boundaries
- [ ] Toast notifications
- [ ] Centralized logging

---

## 🧪 EPIC 13: Testing & QA

### Frontend

- [ ] Component unit tests
- [ ] Form integration tests
- [ ] Role-based access tests

### Backend

- [ ] API unit tests
- [ ] Permission tests
- [ ] SEO validation tests

---

## 📦 EPIC 14: Deployment & Handover

### Deployment

- [ ] CI/CD pipeline for admin panel
- [ ] Environment secrets configuration
- [ ] Staging deployment
- [ ] Production rollout

### Documentation

- [ ] Admin user manual
- [ ] Role & permission matrix
- [ ] API contract documentation
- [ ] Handover checklist

---

## 🗓️ Recommended Execution Order

1. Authentication & RBAC
2. Reports & Blogs
3. SEO & Media
4. Dashboard
5. Charts & Pricing
6. Leads & Users
7. Performance, QA & Deployment

---

**Document Version:** 1.0  
**Project:** Custom Market Insights  
**Audience:** Internal Engineering & Client Stakeholders
