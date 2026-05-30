# GMR Admin Panel — Standard Operating Procedure

**Version:** 1.0  
**Last Updated:** 2026-05-16  
**Audience:** Admins, Editors, Viewers

---

## Table of Contents

1. [Access & Roles](#1-access--roles)
2. [Logging In](#2-logging-in)
3. [Dashboard Overview](#3-dashboard-overview)
4. [Reports Management](#4-reports-management)
5. [Statistics (Blog Posts)](#5-statistics-blog-posts)
6. [Press Releases](#6-press-releases)
7. [Orders](#7-orders)
8. [Leads](#8-leads)
9. [Research Team (Authors)](#9-research-team-authors)
10. [Categories](#10-categories)
11. [SEO Management](#11-seo-management)
12. [User Management](#12-user-management)  *(Admin only)*
13. [Activity Logs](#13-activity-logs)  *(Admin only)*
14. [Common Workflows](#14-common-workflows)
15. [Troubleshooting](#15-troubleshooting)

---

## 1. Access & Roles

### Role Permissions

| Feature | Viewer | Editor | Admin |
|---|:---:|:---:|:---:|
| Dashboard | ✓ | ✓ | ✓ |
| Reports (read) | — | ✓ | ✓ |
| Reports (create/edit) | — | ✓ | ✓ |
| Statistics | — | ✓ | ✓ |
| Press Releases | — | ✓ | ✓ |
| Orders | — | ✓ | ✓ |
| Leads | — | ✓ | ✓ |
| Authors | — | ✓ | ✓ |
| Categories (read) | ✓ | ✓ | ✓ |
| Categories (create/edit) | — | ✓ | ✓ |
| SEO | — | ✓ | ✓ |
| User Management | — | — | ✓ |
| Activity Logs | — | — | ✓ |

---

## 2. Logging In

1. Navigate to the admin panel URL.
2. Enter your **email** and **password**.
3. Solve the **math captcha** (e.g., "What is 4 + 3?").
4. Click **Log In**.

**Session behavior:**
- Sessions expire after 1 hour of inactivity.
- Tokens auto-refresh 5 minutes before expiry — no action needed.
- On expiry you are automatically redirected to `/login`.

---

## 3. Dashboard Overview

The dashboard (`/dashboard`) is the first screen after login.

### KPI Cards

| Card | What It Shows |
|---|---|
| Total Reports | All reports with published/draft split |
| Draft Reports | Count of unpublished reports |
| Statistics Posts | Blog posts with published/draft split |
| Press Releases | Press releases with published/draft split |
| Active Users | Live user count *(admin only)* |
| Content This Month | Aggregate of all content created this month |
| Total Leads | Form submissions with pending/today counts |

### Other Elements

- **Recent Activity Feed** — auto-refreshes every 30 seconds; shows who did what and when.
- **Quick Actions** — role-filtered shortcuts to common tasks (e.g., New Report, New Statistics Post).
- **Refresh button** — manually reload all stats without a full page reload.

---

## 4. Reports Management

### 4.1 Viewing Reports

Navigate to **Reports** in the sidebar.

- **Search** by title or description using the search bar.
- **Filter** by status (Draft / Published), date range, or author.
- **Sort** by date, title, or author.
- Use pagination controls at the bottom to move between pages.

### 4.2 Creating a Report

1. Click **New Report** (or use the Quick Action on the dashboard).
2. Fill in the required fields across each tab/section:

   | Section | Key Fields |
   |---|---|
   | **Basic Info** | Title, slug (auto-generated), excerpt, cover image |
   | **Market Details** | HTML rich-text content about the market |
   | **Table of Contents** | Structured chapters and sections (JSON format) |
   | **Key Players** | Company names and market share data |
   | **SEO** | Meta title, description, keywords, canonical URL, OG image |
   | **Market Metrics** | Current revenue, forecast revenue, CAGR |
   | **Pricing** | Base price; available formats (PDF, Excel, Word, PPT) |
   | **FAQs** | Question + answer pairs |
   | **Authors** | Assign one or more research team members |
   | **Category** | Select the market category |

3. Use the **Images Manager** tab to upload and organize report images.
4. Use **Find & Replace** if you need to update recurring text across the content.
5. Set **Status**:
   - `Draft` — saved but not public.
   - `Published` — live on the website.
   - Use **Scheduled Publish** to set a future go-live date/time.
6. Click **Save**.

> **Tip:** Slugs are auto-generated from the title. Edit the slug manually only if you need a custom URL.

### 4.3 Editing a Report

1. Click on a report title in the list to open it.
2. Make your changes.
3. Click **Save**.

### 4.4 Publishing / Unpublishing

- On the report edit page, change **Status** to `Published` and save.
- To unpublish, set status back to `Draft` and save.

### 4.5 Deleting a Report (Soft Delete)

- Click the **Delete** (trash icon) action on a report in the list.
- The report moves to **Trash** — it is not permanently removed.

### 4.6 Restoring or Permanently Deleting

1. Go to **Reports → Trash** (`/reports/trash`).
2. Find the report.
   - **Restore** — click Restore to move it back to the main list.
   - **Permanently Delete** — click Delete to remove it forever (irreversible).

### 4.7 Preview

Click the **Preview** icon or link on a report to open a preview of how it will appear on the website.

---

## 5. Statistics (Blog Posts)

Statistics posts are standalone articles or data-driven blog posts.

### 5.1 Creating a Statistics Post

1. Go to **Statistics → New**.
2. Fill in:

   | Field | Notes |
   |---|---|
   | Title | Post headline |
   | Slug | Auto-generated; edit if needed |
   | Excerpt | Short summary shown in listings |
   | Content | Rich-text HTML editor |
   | Author | Assign a research team member |
   | Category | Single category selection |
   | Tags | Comma-separated keywords |
   | Location | Geographic context (optional) |
   | Reading Time | Auto-calculated from word count |
   | Status | Draft / Review / Published |
   | Scheduled Publish | Date/time picker for future publishing |

3. Click **Save**.

### 5.2 Review Workflow

| Status | Meaning |
|---|---|
| `Draft` | Being written; not visible publicly |
| `Review` | Submitted for editorial review |
| `Published` | Live on the website |

- Editors submit posts by changing status to `Review`.
- Admins or senior editors approve and change to `Published`.

### 5.3 Trash & Restore

Same process as Reports — soft-delete moves to Trash; restore or permanently delete from there.

---

## 6. Press Releases

Press releases follow the same workflow as Statistics posts.

### Additional Field

- **Report URL** — link to a related market report on the website.

### Review Workflow

Identical to Statistics:  `Draft → Review → Published`

When a press release is reviewed, the system records **who reviewed it** and **when**.

### Trash & Restore

Same as Reports and Statistics.

---

## 7. Orders

Orders represent customer purchases of market research reports.

### 7.1 Viewing Orders

Navigate to **Orders** in the sidebar.

- **Search** by customer name, email, company, or report title.
- **Filter** by:
  - Order status: `Pending`, `Processing`, `Fulfilled`, `Cancelled`
  - Date range
  - Price range
  - Payment status
- **Sort** by date, amount, or status.

### 7.2 Order Details

Click any order row to open its detail page. You can view:

- Customer info (name, email, company)
- Report purchased
- Order date, amount, payment method
- Delivery status
- Admin notes

### 7.3 Updating an Order

1. Open the order detail page.
2. Change the **Status** dropdown (e.g., from `Pending` to `Processing`).
3. Add **Admin Notes** if needed.
4. Save changes.

### Order Status Flow

```
Pending → Processing → Fulfilled
                  ↘ Cancelled
```

---

## 8. Leads

Leads are form submissions from the public website (demo requests, contact inquiries, sample requests).

### 8.1 Viewing Leads

Navigate to **Leads** in the sidebar.

- **Search** by name, email, company, subject, or report title.
- **Filter** by:
  - Email type: Gmail vs. business domain
  - Status: `Pending`, `Processed`, `Archived`
  - Date range

### 8.2 Lead Statuses

| Status | Meaning |
|---|---|
| `Pending` | Not yet actioned |
| `Processed` | Follow-up complete |
| `Archived` | Closed/no further action |

### 8.3 Processing a Lead

1. Click the lead to view full details (name, email, phone, message, related report).
2. Update the **Status** dropdown.
3. Add internal notes if needed.
4. Save.

### 8.4 Bulk Delete

1. Select multiple leads using the checkboxes.
2. Click **Delete Selected**.
3. Confirm the action.

### 8.5 Export

Click **Export** to download the current filtered list as a CSV file.

---

## 9. Research Team (Authors)

Authors are the research team members attributed to reports and posts.

### 9.1 Creating an Author

1. Go to **Research Team → New Author**.
2. Fill in:
   - **Name** and **Role/Title** (e.g., "Senior Analyst")
   - **Biography** — short professional bio
   - **Avatar** — upload a profile photo
   - **LinkedIn URL** — optional professional link
3. Click **Save**.

### 9.2 Editing or Deleting

- Click an author's name in the list to edit.
- Click the delete icon to remove. If the author is attributed to existing reports, handle reassignment before deleting.

---

## 10. Categories

Categories group reports, statistics, and press releases into market verticals.

### 10.1 Viewing Categories

All roles (including Viewers) can browse categories at `/categories`.

### 10.2 Creating a Category *(Editor/Admin)*

1. Click **New Category**.
2. Fill in:
   - **Name** and **Slug** (auto-generated)
   - **Description**
   - **Cover Image** — upload and crop a representative image
   - **Status** — Active or Inactive
3. Click **Save**.

### 10.3 Editing or Deleting

- Click a category to edit its details.
- Before deleting, reassign any content using this category to avoid orphaned records.

---

## 11. SEO Management

Navigate to **SEO** in the sidebar.

### 11.1 Overview Stats

View coverage metrics:
- Total indexed pages
- % of pages with meta descriptions
- % of pages with OG images
- Count of pages with structured data

### 11.2 Sitemap

- **View** the current sitemap structure.
- **Regenerate** the sitemap after major content changes.
- **Submit to Search Engines** to prompt re-crawling.

### 11.3 Robots.txt

1. Go to **SEO** and find the Robots.txt editor.
2. Edit the rules directly.
3. **Preview** changes before saving.
4. **Save** — takes effect immediately.

### 11.4 Redirects (`/seo/redirects`)

- **Create a redirect:** Enter source path → destination URL → select type (301 permanent or 302 temporary).
- **Test a redirect** using the test button to verify it resolves correctly.
- **Bulk import/export** redirects via CSV for large migrations.
- **Delete** individual redirect rules as needed.

---

## 12. User Management *(Admin Only)*

Navigate to **Users** in the sidebar.

### 12.1 Creating a User

1. Click **New User**.
2. Fill in:
   - **Name**, **Email**, **Password**
   - **Role**: `admin`, `editor`, or `viewer`
3. Click **Save**. The user can now log in.

### 12.2 Editing a User

1. Click a user's name in the list.
2. Update name, email, role, or password as needed.
3. Toggle **Active Status** to enable or disable login access without deleting the account.
4. Save.

### 12.3 Deleting a User

Click the delete icon on a user row and confirm. The account is soft-deleted and can be recovered if needed.

---

## 13. Activity Logs *(Admin Only)*

Navigate to **Activity Logs** in the sidebar.

Activity logs provide a complete audit trail of all actions taken in the admin panel.

### Filtering Logs

| Filter | What It Shows |
|---|---|
| All | Every logged event |
| Auth | Login, logout, token refresh events |
| Users | User create, update, delete events |
| Reports | Report CRUD operations |
| Content | Blog posts, press releases, categories, authors |

- **Search** by user email or action type.
- **Filter** by date range.
- **Sort** by date ascending or descending.

### Reading a Log Entry

Each log entry shows:
- **Action** performed (e.g., `report.published`)
- **User** who performed it
- **Resource** affected (e.g., report title)
- **Timestamp**
- **Changes** — before and after values

Click any entry to open the full detail view with the complete change history.

---

## 14. Common Workflows

### Publish a New Market Report

1. Create the report at `/reports/new`.
2. Fill all sections: Basic Info, Market Details, ToC, Key Players, SEO, Metrics, Pricing, FAQs.
3. Upload cover image and report images.
4. Assign authors and category.
5. Set status to `Draft` → Save.
6. Preview the report to verify formatting.
7. When ready, set status to `Published` → Save.

### Process an Incoming Lead

1. Navigate to **Leads**.
2. Find the new `Pending` lead using search or the Pending filter.
3. Open the lead to read the full inquiry.
4. Follow up externally (email/phone — outside the panel).
5. Return and update the status to `Processed` with a note.
6. Save.

### Add a New Team Member

1. Go to **Research Team → New Author**.
2. Enter name, title, bio, photo, LinkedIn.
3. Save.
4. When creating or editing a report, assign this author in the Authors field.

### Create a Redirect After a Slug Change

1. Go to **SEO → Redirects**.
2. Click **New Redirect**.
3. Set **Source** to the old path (e.g., `/reports/old-slug`).
4. Set **Destination** to the new path (e.g., `/reports/new-slug`).
5. Select type: `301 Permanent`.
6. Save and test using the Test button.

---

## 15. Troubleshooting

| Symptom | Likely Cause | Resolution |
|---|---|---|
| Redirected to login unexpectedly | Session expired (1-hour timeout) | Log in again |
| Can't see a menu item | Insufficient role permissions | Contact an admin to adjust your role |
| Save fails with an error | Required field missing or API issue | Check all required fields; check your network connection |
| Report not appearing on website | Status is still `Draft` | Open the report and set status to `Published` |
| Deleted content appears missing | Content was soft-deleted | Go to the Trash section to restore it |
| Images not uploading | File too large or wrong format | Use JPEG/PNG under the maximum file size limit |
| Slug already exists error | Another record uses the same slug | Edit the slug to make it unique |

---

*For technical issues or access requests, contact the system administrator.*
