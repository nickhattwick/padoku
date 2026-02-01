# Paddock – Product Requirements Document (PRD)

**Product Name:** Paddock  
**Tagline:** Run your laps. Beat your pace.  
**Owner:** Nicholas Hattwick  
**Version:** v1.0

---

## 1. Overview

Paddock is a high-performance personal productivity system that combines:
- a Jira-style Kanban board
- a calendar
- time tracking
- nested projects (project == ticket == epic)
- a racing-inspired performance loop

Paddock treats life as an infinite race:
- Each day is a race (lap)
- Each week is a Grand Prix (GP)
- Each year is a season

The goal is not just to complete tasks, but to continuously improve pace, consistency, and execution without burning out.

---

## 2. Problem Statement

Existing tools fail in one or more of the following ways:

- Task apps: flat lists, weak hierarchy
- Project tools: heavy, team-first, poor personal modeling
- Calendars: no task awareness, no actual time tracking
- Time trackers: disconnected from goals and structure

People managing degrees, careers, fitness, family, and side projects need a unified system where:
- projects can contain projects
- time is logged automatically
- planning and execution live together
- progress is visible across cycles

---

## 3. Goals and Non-Goals

### 3.1 Goals
- Single unified model for tasks, projects, and goals
- Arbitrary nesting
- Planning (due dates) + actual execution (time logs) in one place
- Performance visibility across daily, weekly, yearly cycles
- Fast, low-friction UX
- Motivating, non-draining experience

### 3.2 Non-Goals (v1)
- Team collaboration
- Permissions and roles
- Mobile app
- Deep automation rules
- AI coaching

---

## 4. Core Concepts

### 4.1 Work Item (Unified Object)

There is no distinction between:
- task
- ticket
- project
- epic
- class
- assignment
- goal

Everything is a Work Item.

A Work Item can:
- have children
- be nested infinitely
- appear on a board
- be time-tracked
- have a due date
- be blocked
- be recurring (template)
- be a finite goal

---

### 4.2 Racing Time Model

| Real World | Paddock Term | Meaning |
|-----------|--------------|--------|
| Day | Race | One execution cycle |
| Week | Grand Prix (GP) | Weekly planning + review |
| Quarter | Season Segment | Long push |
| Year | Season | Identity-level arc |

The system must always be aware of:
- current Race
- current GP
- current Season

---

## 5. User Stories

### 5.1 Execution
- As a user, I want to create tasks and drag them across statuses.
- As a user, I want to start a timer on a task and have time logged automatically.
- As a user, I want my actual work time to appear on my calendar.

### 5.2 Structure
- As a user, I want a project to contain other projects.
- As a user, I want to click into any project and see its children as a board.
- As a user, I want to reorganize my hierarchy easily.

### 5.3 Planning
- As a user, I want due dates to appear on my calendar.
- As a user, I want to see what I planned vs what I actually did.

### 5.4 Reflection
- As a user, I want to see how much time I spent on track vs in the pits.
- As a user, I want to see my best day, best week, and streaks.

---

## 6. Functional Requirements

### 6.1 Paddock (Board)

Primary interface. Jira-style Kanban board.

Columns:
- In the Garage (Not Started)
- On Track (In Progress)
- In the Pits (Blocked)
- Checkered (Done)

Requirements:
- Drag and drop between columns
- Persist status changes
- Each card shows:
  - title
  - due date badge (if present)
  - timer status indicator
- Clicking a card opens a right-side details drawer

---

### 6.2 Details Drawer

Fields:
- Title
- Description
- Status
- Parent
- Children list
- Due date
- Blocked reason
- Time logs
- Start/Stop timer button

Requirements:
- Slides in from right
- Does not navigate away
- Same component used for board and calendar

---

### 6.3 Nesting and Navigation

Behavior:
- Each Work Item has parent_id
- Board context = children of current Work Item
- Root context = items with no parent

UI:
- Breadcrumb navigation
- Sidebar "Projects" view:
  - default depth = 1
  - toggle to show full tree

Actions:
- Reparent Work Items
- Navigate into any Work Item

---

### 6.4 Calendar (Track View)

Alternate mode of main surface.

Must show:
- Due dates (deadline markers)
- Time logs (blocks)

Behavior:
- Clicking entry opens details drawer
- Toggle between Paddock and Track

---

### 6.5 Time Tracking (Engine)

Behavior:
- One active timer at a time
- Start timer on Work Item
- Stop timer creates time log
- Timer state persists across refresh
- Time logs have start, end, duration, notes

Time logs must appear on calendar automatically.

---

### 6.6 Blocked Time (Pit Time)

When status = Blocked:
- user can enter:
  - reason
  - blocked by (another Work Item)
  - start/end time

Blocked time must be stored to compute pit time metrics.

---

### 6.7 Goals vs Recurring

#### Goals (Finite)
A Work Item may be a goal:
- has an end condition
- once completed, it is done forever

Examples:
- Masters degree
- Certification

#### Recurring (Infinite)
Recurring items are templates.

Template:
- "Workout"
- "Clean kitchen"

Template generates instances:
- "Workout – Jan 6"
- "Workout – Jan 7"

Instances:
- appear on board
- appear on calendar
- can be time-tracked
- can be completed

Template never completes.

---

## 7. Data Model (Conceptual)

### 7.1 WorkItem
- id
- title
- description
- status
- parent_id
- due_at
- is_goal
- goal_end_condition
- is_recurring_template
- recurrence_rule
- created_at
- updated_at

### 7.2 TimeLog
- id
- work_item_id
- start_time
- end_time
- duration
- notes

### 7.3 BlockRecord
- id
- work_item_id
- reason
- blocked_by_work_item_id
- start_time
- end_time

---

## 8. Non-Functional Requirements

- Fast interactions (<100ms perceived latency)
- Keyboard friendly
- Minimal clicks
- No modal overload
- Scales to 1,000+ Work Items without lag
- Simple schema, no over-abstraction

---

## 9. UX Principles

- Low friction: starting work should be easier than procrastinating
- Context preserved: never lose your place
- Depth without clutter: nesting should feel natural
- Performance-first: always show progress and movement
- Theme is supportive, not gimmicky

---

## 10. Phased Delivery Plan

### Phase 1 – Core Engine
- Work Item CRUD
- Paddock board
- Drag/drop
- Details drawer
- Nesting
- Breadcrumbs

### Phase 2 – Time and Calendar
- Timer
- Time logs
- Calendar view
- Due dates

### Phase 3 – Recurring and Goals
- Templates
- Instances
- Goal completion

### Phase 4 – Racing Layer
- Race/GP/Season labels
- Debrief panel
- Performance metrics

---

## 11. Success Metrics

- Daily active use
- Time tracked per day
- Percent of items completed
- Streak length
- Subjective feeling of control and momentum

---

## 12. Future Vision

Paddock becomes:
- your execution engine
- your personal race engineer
- your performance telemetry system

Eventually:
- AI coaching
- burnout detection
- adaptive planning

Always:
You in the driver’s seat.

---

## 13. Naming

| Concept | Name |
|--------|------|
| App | Paddock |
| Board | Paddock |
| Calendar | Track |
| Timer | Engine |
| Blocked | In the Pits |
| Done | Checkered |
| Day | Race |
| Week | Grand Prix |
| Year | Season |

---