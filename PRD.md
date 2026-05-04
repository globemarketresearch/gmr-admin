# 📘 Product Requirements Document (PRD)

## Admin Panel – Market Research Website

---

## 1. Overview

### 1.1 Product Name

Market Research Admin Panel

### 1.2 Purpose

The Admin Panel enables internal teams and clients to **create, manage, publish, and analyze market research content** (reports, blogs, charts, images, pricing, and SEO metadata) efficiently, securely, and at scale.

### 1.3 Target Users

| Role          | Description                   |
| ------------- | ----------------------------- |
| Super Admin   | Full system access            |
| Content Admin | Manage reports & blogs        |
| Analyst       | Upload data, insights, charts |
| SEO Manager   | SEO & schema management       |
| Sales/Admin   | Pricing & lead access         |
| Viewer        | Read-only access              |

---

## 2. Goals & Success Metrics

### Business Goals

- Reduce report publishing time by 60%
- Enable non-technical content management
- Improve SEO rankings via structured metadata
- Support 1000+ reports at scale

### Success Metrics

- Publish time < 10 minutes
- PageSpeed score ≥ 90
- Zero SEO validation errors
- API response < 200ms

---

## 3. Functional Requirements

---

## 3.1 Authentication & Authorization

### Features

- Email/Password login
- Optional SSO (future)
- Role-Based Access Control (RBAC)
- Permission-based module access

### Permission Matrix (Sample)

| Module  | Admin | Analyst | SEO  | Viewer |
| ------- | ----- | ------- | ---- | ------ |
| Reports | CRUD  | Edit    | View | View   |
| Blogs   | CRUD  | Edit    | SEO  | View   |
| Users   | CRUD  | ❌      | ❌   | ❌     |

---

## 3.2 Dashboard

### Features

- KPI cards:
  - Total Reports
  - Draft vs Published
  - Monthly Traffic
  - Leads Generated
- Recent activity feed
- Quick actions:
  - Create Report
  - Create Blog

---

## 3.3 Reports Management

### Features

- Create / Edit / Delete reports
- Rich-text editor (HTML-based)
- Section-based content:
  - Market Overview
  - Segmentation
  - Competitive Landscape
  - Forecast
- Draft / Publish flow
- Auto-generated slug
- Version history

### Report Fields

| Field        | Type              |
| ------------ | ----------------- |
| Title        | Text              |
| Slug         | Auto              |
| Summary      | Short Text        |
| Content      | HTML              |
| Category     | Dropdown          |
| Geography    | Multi-select      |
| Price        | Number            |
| Status       | Draft / Published |
| Publish Date | Date              |

---

## 3.4 Blog Management

### Features

- Blog editor with inline images
- CDN-based image URLs
- Categories & tags
- Author mapping
- Draft → Review → Publish workflow

### Storage Strategy

- HTML stored in database
- Images stored on CDN (URL references)
- SEO-friendly `<img>` tags with alt text

---

## 3.5 Charts & Data Visualization

### Features

- Chart builder (Phase 1: Bar charts)
- Manual data entry or CSV upload
- Export chart as WEBP image
- Auto-generate static chart image for frontend

### Chart Fields

| Field      | Type  |
| ---------- | ----- |
| Chart Type | Bar   |
| Labels     | Array |
| Values     | Array |
| Unit       | Text  |
| Source     | Text  |

---

## 3.6 SEO Management

### Features

- Page-level SEO fields:
  - Meta Title
  - Meta Description
  - Keywords
  - Canonical URL
- OpenGraph & Twitter metadata
- JSON-LD schema editor
- Auto sitemap & robots.txt update trigger

### SEO Validation Rules

- Meta title required
- Meta description ≥ 120 chars
- H1 required
- Prevent publish if validation fails

---

## 3.7 Media Management

### Features

- Image upload (charts, banners, thumbnails)
- Auto compression
- WEBP conversion
- Image reuse library
- Mandatory alt text

---

## 3.8 Pricing & Access Control

### Features

- Price per report
- Access types:
  - Free
  - Paid
  - Subscription-only
- Region-based pricing (optional)
- Preview mode for sales team

---

## 3.9 Lead & Inquiry Management

### Features

- View report-based inquiries
- Lead status tracking:
  - New
  - Contacted
  - Closed
- Export leads (CSV)

---

## 3.10 User Management

### Features

- Create / Edit / Disable users
- Role assignment
- Last login tracking
- Audit logs

---

## 4. Non-Functional Requirements

---

## 4.1 Performance

- Admin UI load < 1s
- API response < 200ms
- Pagination & lazy loading

---

## 4.2 Security

- JWT-based authentication
- Password hashing
- CSRF protection
- Rate limiting
- Audit logs for critical actions

---

## 4.3 SEO & Compliance

- Clean URLs
- Structured content
- Mobile-friendly previews
- GDPR-ready data handling

---

## 4.4 Scalability

- Support 10k+ reports
- Multi-tenant ready
- Horizontal backend scaling

---

## 5. Recommended Tech Stack

| Layer     | Technology                       |
| --------- | -------------------------------- |
| Frontend  | Next.js                          |
| UI        | Tailwind + ShadCN                |
| Backend   | Go (Fiber)                       |
| Database  | PostgreSQL                       |
| Cache     | Redis                            |
| Image CDN | Cloudinary                       |
| Auth      | JWT / OAuth                      |
| Hosting   | Vercel (FE), Railway/Fly.io (BE) |

---

## 6. Key User Flow (Report Creation)

1. Admin login
2. Dashboard → Create Report
3. Add content & charts
4. Add SEO metadata
5. Preview
6. Publish
7. Sitemap auto-update

---

₹

## 7. Out of Scope (Phase 1)

- AI-generated reports
- Public comments
- Multi-language publishing
- Advanced analytics

---

## 8. Phase-wise Delivery Plan

### Phase 1 – MVP (2–3 Weeks)

- Auth & RBAC
- Reports & Blogs
- SEO module
- Media manager

### Phase 2

- Chart builder
- Pricing & Leads
- Performance optimizations

### Phase 3

- AI-assisted insights
- Multi-language support
- Advanced analytics

---

## 9. Risks & Mitigation

| Risk                    | Mitigation              |
| ----------------------- | ----------------------- |
| SEO issues              | Mandatory validations   |
| Performance bottlenecks | Caching & pagination    |
| Content errors          | Draft & review workflow |

---

**Document Version:** 1.0  
**Prepared For:** Client Review  
**Project:** Custom Market Insights
