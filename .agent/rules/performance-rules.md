---
trigger: always_on
---

# Performance & Error Handling Rules


- **Client Components:** Avoid unnecessary 'use client' usage. Use only where interactivity is required.
- **Images:** Prefer `next/image` for images.
- **Error Handling:** Wrap all async operations in `try-catch` blocks. Provide meaningful feedback to the user (toast or state-based message) and log detailed errors with `console.error`.
