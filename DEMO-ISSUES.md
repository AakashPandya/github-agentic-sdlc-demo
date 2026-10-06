# Copy-ready demo issues

Create these with your human GitHub account after pushing the workflows to main.
Expected labels are demonstration expectations, not deterministic guarantees: Codex
must assess the actual evidence. The triage agent never applies `ai-fix` by itself.

## Bug

**Title:** Completed tasks reappear after refreshing

```text
I marked two tasks complete and used Clear completed. The list was empty, but after
refreshing the page the tasks appeared again as active.

Environment: Chrome on Windows 11, normal browsing mode.

Steps to reproduce:
1. Open the To-Do app.
2. Add “Prepare slides” and “Review demo”.
3. Mark both tasks complete.
4. Select Clear completed.
5. Refresh the page.

Expected: Cleared tasks stay removed after refreshing.
Actual: Both tasks reappear and their checkboxes are unchecked.

I noticed this twice today. I do not have a console screenshot yet. Please help me
identify any browser storage settings or additional details needed to reproduce it.
```

Expected: `bug`, `priority-medium`. This is a sample report, not a confirmed main bug.
Codex may ask for more evidence after inspecting the implementation.

## Enhancement

**Title:** Add due dates to tasks

```text
I use the list to prepare customer demos and need to see when each task is due.

Please let me optionally choose a due date when creating or editing a task, display
it beside the task, and keep it after a refresh. Existing tasks without dates should
continue to work. Overdue tasks could have a clear text indicator as well as color.

This would help me plan weekly work. It is useful but does not block today's demo.
```

Expected: `enhancement`; priority is Codex's decision (likely low/medium).

## Incomplete report

**Title:** Todo does not work

```text
The todo feature is broken.
```

Expected: `needs-info`, plus a question about browser, reproduction steps, expected
behavior and actual behavior. Priority is tentative until impact is understood.

## Issue → fix → PR

**Title:** Prevent blank tasks from being created

```text
The application currently allows a task containing only spaces to be created.

Expected behavior:

Trim the task title before validation.

If the resulting title is empty, do not create the task.

Add unit tests covering:

- empty title
- whitespace-only title
- valid title

Do not change unrelated functionality.
```

Use this exact text only while the documented `demo/issue-fix` fixture is selected.
The issue describes that fixture, not main. Follow [DEMO.md](DEMO.md#demo-6--issue--fix--pr-2-minutes)
to set `DEMO_ISSUE_FIX_BASE=demo/issue-fix`, create this issue, then apply **ai-fix**
as a maintainer/write user. That label is a one-shot command and is removed automatically
by gh-aw. Codex should create a draft PR against `demo/issue-fix`. Remove the repository
variable after the demo. With no variable, the fixer targets main and should accurately
report that this particular bug is already fixed.
