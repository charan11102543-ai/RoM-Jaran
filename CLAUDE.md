# Claude.md — Project Context

## Project Overview
This repository is a real working system for building an **Agent Command Center** for AI automation workflows.

The goal of this project is to manage multiple AI agents from a single control plane with:
- task orchestration
- agent registry
- space/project management
- task status tracking
- logs and execution history
- local/cloud handoff
- live updates
- review and failure handling

This is not a demo-only project. The system must be usable in real operations.

---

## Product Vision
The product should behave like an operations dashboard for AI agents:
- one place to see all agents
- one place to assign and monitor work
- one place to review outputs and failures
- one place to move tasks across statuses
- one place to preserve context per space/project

The interface should feel like a command center, not a generic admin panel.

---

## Core Domain Concepts

### 1. Agent
An agent is an executable worker with a role, status, runtime type, and lifecycle.

Common fields:
- id
- name
- role
- status
- runtime: local / cloud
- active / inactive
- health state
- last run time
- notes

### 2. Task
A task is a unit of work assigned to an agent inside a space/project.

Common fields:
- id
- title
- description
- priority
- status
- assigned agent
- assigned space/project
- timestamps
- execution log
- handoff metadata

### 3. Space / Project
A space is a context container for related tasks, agents, and session history.

A space should preserve:
- context
- files or references
- task history
- decisions
- execution logs
- review notes

### 4. Status Lifecycle
Use a clear status flow:
- queued
- running
- review
- done
- failed
- blocked

Status transitions should be logged automatically.

### 5. Log / Event
Every important state transition, handoff, error, or review action should create an event log.

---

## System Requirements
The system should support:
- agent registry
- task creation and assignment
- task movement across statuses
- space/project grouping
- KPI summary in the header
- alert strip for active issues
- auto logging on status changes
- cloud handoff when tasks enter running state
- local/cloud agent mode
- live updates if supported by the stack
- graceful fallback if real-time updates are unavailable

---

## Current Product Areas
The existing system already includes or is intended to include:
- Command Center dashboard
- Kanban board
- Agent registry
- KPI pills in the header
- alert strip
- create task modal
- space management page
- cloud agent handoff
- websocket/live updates
- automatic logging on transitions

When extending the system, preserve these product areas instead of replacing them with unrelated patterns.

---

## Important Engineering Rules

### Source of Truth
Always prefer:
1. existing code in this repository
2. schema / database structure
3. API routes / services
4. documentation in the repo
5. only then add new code

Do not invent architecture that conflicts with the repo.

### Preserve Conventions
- Follow the repository’s existing naming conventions.
- Reuse existing utilities, components, and services where possible.
- Do not duplicate logic that already exists.
- Avoid large refactors unless they solve a clear problem.

### Implementation Discipline
- Build the smallest stable useful version first.
- Prefer working features over speculative abstractions.
- Add types, validation, and error handling.
- Keep changes incremental and traceable.
- Do not break existing login, database, or task flows.

### When the stack is unclear
Inspect the repo before assuming:
- framework
- state management
- database
- auth
- deployment
- real-time mechanism
- queue system
- agent runtime architecture

---

## Preferred Development Workflow
When asked to build or modify something, follow this sequence:

1. Inspect the repo structure
2. Find source-of-truth files
3. Map dependencies
4. Identify missing pieces
5. Implement the smallest complete change
6. Test the flow end to end
7. Report what changed and what remains

---

## Feature Priorities

### Priority 1 — Operational Control
The system must reliably:
- create tasks
- assign tasks
- update task status
- track logs
- show agent availability
- show errors and blocked work

### Priority 2 — Visibility
The system must clearly show:
- task distribution
- agent activity
- queue state
- review state
- failure state
- progress across spaces

### Priority 3 — Automation
The system should gradually automate:
- status transitions
- handoffs
- notifications
- log creation
- agent routing

### Priority 4 — Polish
Only after the core works:
- drag and drop improvements
- better animations
- UX refinements
- more compact views
- better filtering and search

---

## UI/UX Rules
The UI should be:
- clear
- dense but readable
- operational
- fast to scan
- built for monitoring and action

Good UI patterns for this project:
- KPI cards or pills
- alert banner / strip
- kanban columns
- registry table or cards
- task details drawer / modal
- activity log panel
- filters by space / agent / status / priority

Avoid:
- decorative UI with no operational value
- hidden state that makes debugging hard
- overly abstract dashboards
- features that look complete but do nothing

---

## Data & State Rules
Any system state that matters operationally must be persisted:
- agent registration
- task state
- task history
- space context
- log records
- handoff actions
- review actions

Do not rely on ephemeral UI state for important business logic.

---

## Automation / Handoff Rules
If a task reaches RUNNING:
- create an execution log
- record handoff metadata
- call the configured local/cloud endpoint if available
- keep the system resilient if the endpoint fails

If a task fails:
- record the failure reason
- show it in the UI
- preserve history
- allow retry or review

If a task enters REVIEW:
- make it visible in alerts and KPI counts
- capture reviewer notes if available

---

## Testing Expectations
Whenever a feature is changed, verify:
- the UI still loads
- data is consistent
- status transitions work
- logs are created
- assigned agent and space are preserved
- auth still works
- no regressions in existing flows

For major changes, test the full path:
create space → create task → assign agent → move status → log event → review/handoff → complete or fail

---

## Communication Style
When responding in code or docs:
- be direct
- be explicit about assumptions
- do not claim something works unless it was implemented or verified
- mention any incomplete part clearly
- prefer concise technical wording

---

## What to Do When Unsure
If a design choice is ambiguous:
- inspect the repo
- identify the current convention
- choose the least disruptive option
- document the reason briefly

If required information is missing:
- state what is missing
- avoid guessing
- continue with the parts that can be implemented safely

---

## Final Goal
Turn this repository into a production-usable **Agent Command Center** that can:
- coordinate multiple AI agents
- manage tasks and spaces
- track execution state
- support local and cloud work
- provide reliable operational visibility
- scale into a real AI automation system
