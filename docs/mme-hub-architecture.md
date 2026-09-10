# MME Hub — Product Architecture & Build Plan

*Steps 1–7 as requested, before any code is written.*

---

## Step 1 — Product Architecture

### System overview

MME Hub is a **thin organizational layer**, not a data-storage platform. It holds structured *metadata* (titles, dates, categories, course associations) and *links out* to Google Drive/Calendar/Forms/YouTube, which remain the source of truth.

```
┌─────────────────────────────────────────────┐
│                 Next.js App                  │
│  ┌───────────────┐   ┌────────────────────┐  │
│  │  Public Pages  │   │  Manage (BR/Admin) │  │
│  │  (read-only)   │   │  (CRUD, protected) │  │
│  └───────┬────────┘   └─────────┬──────────┘  │
│          │                      │             │
│          ▼                      ▼             │
│      Server Actions / Route Handlers          │
│                     │                          │
│                     ▼                          │
│              Prisma ORM Layer                  │
│                     │                          │
│                     ▼                          │
│               PostgreSQL                       │
└─────────────────────────────────────────────┘
          │ (links only, never files)
          ▼
  Google Drive / Calendar / Forms / YouTube
```

### Layers

- **Presentation** — Next.js App Router pages, server components for data fetching, client components only where interactivity is needed (search, forms, filters).
- **Auth** — role-based session (Student / BR / Admin), route-level protection via middleware on `/manage/*`.
- **Data** — Prisma + PostgreSQL. All "content" tables (Course, Announcement, Deadline, Resource, CalendarLink) reference URLs, never binary files.
- **Integration boundary** — a single `ExternalLink` concept used everywhere a Drive/Calendar/Form/YouTube URL is stored, so the pattern is consistent instead of ad-hoc per feature.

### Design principle enforced in the architecture

Every content type an information flow: **BR creates once → normalized in DB → automatically surfaced in every relevant view** (home, section page, course page, search) via query, not by re-entering data. This is why the schema below is relational rather than duplicative.

### Why "read-only" students still need personal state

Section 4 of the spec marks students strictly read-only for *content* — correct, they shouldn't be able to edit a deadline. But a student opening the app every day needs a reason to come back beyond "check for updates." The thing that makes a tool feel *theirs* is being able to act on it: tick something off, save it for later, see their own progress. None of that touches BR-owned content — it's a personal layer sitting on top, scoped per-user, invisible to everyone else. This keeps the "one BR maintains it" simplicity intact while giving students something to actually use, not just read.

**What this buys students, concretely:**
- A deadline stops being just information and becomes something they can close out — satisfying, and it declutters their own view without affecting the BR's record or other students.
- A "my week" view that filters the noise down to only what's theirs to act on.
- Saved resources so the 40 links they'll need before finals don't require re-searching.
- A visible sense of "I'm on top of this" (progress %, streak) — the difference between a dashboard and a to-do list.

---

## Step 2 — Sitemap

```
/                          Home (dashboard)
/login                     Auth
/courses                   Course directory
/courses/[code]            Course detail
/announcements             Announcement feed
/announcements/[id]        Single announcement
/deadlines                 Deadline list (filterable)
/calendar                  Calendar embed
/resources                 Resource directory (filterable/searchable)
/search                    Global search results
/manage                    BR/Admin dashboard (protected)
/manage/announcements      CRUD
/manage/deadlines          CRUD
/manage/resources          CRUD
/manage/courses            CRUD
/manage/calendar           CRUD
/manage/users              Admin-only: manage BR/student accounts
```

Bottom nav (mobile): **Home · Courses · Deadlines · Calendar · Resources**, with Announcements, Search, and Manage tucked into a top/menu area.

---

## Step 3 — Database Schema

```prisma
enum Role {
  STUDENT
  BR
  ADMIN
}

enum AnnouncementCategory {
  GENERAL
  ACADEMIC
  ASSIGNMENT
  QUIZ
  LAB
  EXAM
  PROJECT
  EVENT
  URGENT
}

enum ResourceCategory {
  NOTES
  TUTORIALS
  ASSIGNMENTS
  PREVIOUS_PAPERS
  LAB_RESOURCES
  BOOKS
  VIDEOS
  WEBSITES
  OTHER
}

model User {
  id            String   @id @default(cuid())
  name          String
  email         String   @unique
  role          Role     @default(STUDENT)
  createdAt     DateTime @default(now())

  announcements Announcement[] @relation("AnnouncementAuthor")
  deadlines     Deadline[]     @relation("DeadlineAuthor")
  resources     Resource[]     @relation("ResourceAuthor")
}

model Course {
  id              String   @id @default(cuid())
  code            String   @unique      // "MM201"
  name            String                // "Engineering Thermodynamics"
  professor       String?
  description     String?
  syllabusUrl     String?
  lectureUrl      String?
  tutorialUrl     String?
  assignmentUrl   String?
  labUrl          String?
  papersUrl       String?
  otherLinks      Json?                 // [{label, url}]
  createdAt       DateTime @default(now())

  announcements   Announcement[]
  deadlines       Deadline[]
  resources       Resource[]
}

model Announcement {
  id          String   @id @default(cuid())
  title       String
  description String
  category    AnnouncementCategory @default(GENERAL)
  priority    Int      @default(0)      // 0 normal, 1 high, 2 urgent
  pinned      Boolean  @default(false)
  link        String?
  course      Course?  @relation(fields: [courseId], references: [id])
  courseId    String?
  author      User     @relation("AnnouncementAuthor", fields: [authorId], references: [id])
  authorId    String
  createdAt   DateTime @default(now())
}

model Deadline {
  id          String   @id @default(cuid())
  title       String
  dueAt       DateTime
  link        String?
  description String?
  completed   Boolean  @default(false)
  course      Course?  @relation(fields: [courseId], references: [id])
  courseId    String?
  author      User     @relation("DeadlineAuthor", fields: [authorId], references: [id])
  authorId    String
  createdAt   DateTime @default(now())
}

model Resource {
  id          String   @id @default(cuid())
  title       String
  category    ResourceCategory @default(OTHER)
  url         String
  description String?
  course      Course?  @relation(fields: [courseId], references: [id])
  courseId    String?
  author      User     @relation("ResourceAuthor", fields: [authorId], references: [id])
  authorId    String
  createdAt   DateTime @default(now())
}

model CalendarLink {
  id         String   @id @default(cuid())
  name       String
  embedUrl   String?
  openUrl    String?
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
}

// ── Student personal layer ──────────────────────────────
// Per-user state, scoped to that student only. Never visible
// to other students, never changes BR-owned content, never
// affects the underlying Deadline/Resource/Announcement row.

model DeadlineStatus {
  id          String   @id @default(cuid())
  user        User     @relation(fields: [userId], references: [id])
  userId      String
  deadline    Deadline @relation(fields: [deadlineId], references: [id])
  deadlineId  String
  done        Boolean  @default(false)
  doneAt      DateTime?

  @@unique([userId, deadlineId])   // one status row per student per deadline
}

model SavedResource {
  id          String   @id @default(cuid())
  user        User     @relation(fields: [userId], references: [id])
  userId      String
  resource    Resource @relation(fields: [resourceId], references: [id])
  resourceId  String
  savedAt     DateTime @default(now())

  @@unique([userId, resourceId])
}

model SavedAnnouncement {
  id             String       @id @default(cuid())
  user           User         @relation(fields: [userId], references: [id])
  userId         String
  announcement   Announcement @relation(fields: [announcementId], references: [id])
  announcementId String
  savedAt        DateTime     @default(now())

  @@unique([userId, announcementId])
}
```

Add the corresponding back-relations (`deadlineStatuses`, `savedResources`, `savedAnnouncements`) on `User`, and (`statuses`, `saves`) on `Deadline`/`Resource`/`Announcement` respectively.

**Why separate tables instead of a `completed` field students can toggle:** the original `Deadline.completed` field is BR-owned (e.g. "this assignment window has closed"). A student's personal tick is a different fact — "*I've* done this" — and two students shouldn't be able to overwrite each other's status on a shared row. A join table keeps these cleanly separate and makes "how many students have completed X" trivially queryable later if a BR ever wants that visibility.

Notes:
- `courseId` is nullable everywhere — general announcements/resources aren't forced onto a course.
- No `File`/`Attachment` table — deliberately, per the source-of-truth principle.
- `otherLinks` uses JSON for the small "important links" list on a course, avoiding a needless join table for something that's rarely queried independently.

---

## Step 4 — User Flows

**BR posts a deadline (core flow):**
```
BR logs in → /manage/deadlines → "+ Add Deadline"
→ fills Title, Course (dropdown), Date/Time, Link, Description
→ Save
→ DB write (single row)
→ Revalidation triggers:
   - Home "Upcoming Deadlines" widget (next 2, soonest first)
   - /deadlines (full chronological list)
   - /courses/[code] "Deadlines" section
   - /search index
→ Student sees it next time they load any of those pages — no separate action by BR
```

**Student finds something ("Where is that information?"):**
```
Student opens app → Home shows pinned/urgent items first
→ if not found: taps Search → types "XRD"
→ sees grouped results (Courses / Resources / Deadlines / Announcements)
→ taps result → external link opens (Drive/YouTube/etc.) or detail page
```

**Student ticks off a deadline (new — personal layer):**
```
Student on /deadlines or Home → taps checkbox on "MM201 Tutorial 4"
→ optimistic UI update (instant tick, no page reload)
→ upserts DeadlineStatus{userId, deadlineId, done:true}
→ item moves out of "My Week" / into a collapsed "Done" section
→ Home progress widget recalculates ("4 of 6 done this week")
→ BR/other students' views are completely unaffected — this row is invisible to them
```

**Student saves a resource for later:**
```
Student on /resources → taps bookmark icon on "XRD Viva Questions"
→ upserts SavedResource
→ appears in new "Saved" tab/filter, accessible from profile menu
→ no BR involvement, no notification to anyone
```

**Admin promotes a student to BR:**
```
Admin → /manage/users → selects user → changes Role → Save
→ middleware now allows that user into /manage/* on next request
```

---

## Step 5 — Page-by-Page Wireframes (text)

**Home** — greeting → **"Your week" progress bar** (e.g. "4 of 6 deadlines done" — the first thing a returning student sees, purely personal, computed from DeadlineStatus) → pinned/urgent announcement card → "Upcoming Deadlines" (top 2–3, unticked only, each with an inline checkbox — color-coded urgency as before) → "Upcoming" (next day's schedule) → Quick Access grid (4 icons) → empty states where any section has nothing. An all-done state here ("You're all caught up 🎉") replaces the deadlines widget instead of showing an empty list.

**Courses (`/courses`)** — grid of cards: code, name, professor, small badge count of open deadlines. Tap → detail.

**Course detail (`/courses/[code]`)** — header (code, name, professor, description) → syllabus link → sectioned link blocks (Lectures/Tutorials/Assignments/Labs/Previous Papers, each opening Drive) → course-scoped Announcements list → course-scoped Deadlines list → Important Links.

**Announcements** — reverse-chronological feed, pinned items sticky at top, category filter chips, urgent items visually distinct (not just color — icon + label, for accessibility).

**Deadlines** — filter bar (All/Today/This Week/Course/**My Pending/My Done**) → chronological list, each row has a checkbox (personal tick) plus red/orange/neutral left-border by urgency → tap opens link. Ticked items collapse into a "Done" section at the bottom rather than disappearing, so students can un-tick a mistake.

**Calendar** — single embedded iframe (Google Calendar) + "Open in Google Calendar" button. No custom event model in MVP.

**Resources** — search box + category filter chips + **"Saved only" toggle** → card list (title, course badge, category badge, description snippet, bookmark icon) → tap opens URL in new tab.

**Search** — one input, debounced, results grouped by entity type exactly as in spec section 14.

**Manage (BR/Admin)** — simple table-per-entity view with an "+ Add X" button opening a modal/side-panel form; edit/delete inline. Admin sees an extra "Users" tab.

**Empty states** — implemented per spec section 29 for every list view.

---

## Step 6 — Component Architecture

```
/components
  /layout
    AppShell.tsx          — top bar + bottom nav (mobile) / sidebar (desktop)
    BottomNav.tsx
  /home
    PinnedAnnouncementCard.tsx
    UpcomingDeadlinesWidget.tsx
    QuickAccessGrid.tsx
  /courses
    CourseCard.tsx
    CourseLinkBlock.tsx   — reusable "section → Drive link" block
  /announcements
    AnnouncementCard.tsx
    CategoryFilterBar.tsx (shared with Resources)
  /deadlines
    DeadlineRow.tsx         — now includes personal checkbox, optimistic toggle
    UrgencyBadge.tsx       — derives color from dueAt, single source of truth for the red/orange/neutral rule
  /resources
    ResourceCard.tsx        — includes bookmark toggle
  /personal
    WeekProgressBar.tsx     — "X of Y done this week", drives Home
    SavedToggle.tsx          — shared bookmark button (Resources + Announcements)
  /calendar
    CalendarEmbed.tsx
  /search
    SearchBar.tsx
    SearchResultsGroup.tsx
  /manage
    EntityTable.tsx        — generic table+actions, configured per entity
    EntityForm.tsx          — generic form renderer driven by a field schema (reused for all 5 "Add X" forms)
    CourseSelect.tsx         — shared dropdown, powers "minimize data entry" rule
  /ui
    Badge.tsx, Card.tsx, EmptyState.tsx, Skeleton.tsx, Button.tsx
```

Reuse strategy: `EntityForm` + `EntityTable` are schema-driven (field list + type in, form/table out) so adding a 6th entity later doesn't mean a 6th bespoke form.

---

## Step 7 — MVP Implementation Plan

| Phase | Scope |
|---|---|
| 1. Foundation | Next.js + TS + Tailwind scaffold, Prisma schema + migrations, seed script with realistic MM201–MM205 data |
| 2. Read-only pages | Home, Courses, Course detail, Announcements, Deadlines, Calendar, Resources — all wired to real queries, with loading/empty states |
| 3. Search | Global search across the 4 entities |
| 4. Auth | Login, session, role middleware protecting `/manage/*` |
| 5. Manage CRUD | Generic EntityForm/EntityTable wired to server actions for all 5 entities + user role management |
| 6. Polish | Mobile responsiveness pass at the 5 breakpoints, accessibility pass, MME visual identity pass |
| 7. Verification | Walk every scenario in spec section 35 end-to-end |

---

## A practical note on building this here

The spec calls for Next.js + PostgreSQL, which needs a real server and database to actually run — this chat environment can't host that persistently. I have two realistic paths:

1. **Deliver it as a real Next.js/Prisma/PostgreSQL source-code project** (all files, ready to `npm install` and deploy on Vercel + a Postgres provider like Neon/Supabase) — matches the spec's tech stack exactly, but you won't be able to click around it *here*.
2. **Build a fully working, clickable prototype right now** as a single React artifact, using the same schema/roles/pages above, with the app's built-in persistent storage standing in for PostgreSQL — you can test every flow in this chat, including BR/Admin CRUD, and I can later hand you the "real" Next.js version generated from the same component/schema design.

Given the size of this build, I'd suggest starting with option 2 so you can validate the UX and flows immediately, then I generate the production Next.js codebase once you're happy with it. Want me to proceed that way, or go straight to the full Next.js source files?
