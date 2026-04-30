# SpyRooms Documentation & Style Guide

To maintain a highly readable and maintainable codebase, SpyRooms follows a "Clean Code" approach to documentation. We believe that tests and well-named variables are the primary source of documentation.

When writing code for this monorepo, please adhere to the following rules:

## 1. Public API Documentation (`/** ... */`)
Every exported module, type, class, and function must have a TSDoc comment (`/** ... */`), but it must be **strictly concise** (1-3 sentences).
* Do not write essays.
* State exactly what the function consumes, what it returns, and its primary side effect.

## 2. Inline Comments (`//`) Explain "Why", Not "What"
Assume the reader knows how to read TypeScript. Do not use inline comments to explain *what* the code is doing.
* **BAD:** `// Loop through the array and remove non-alphabetic characters.`
* **GOOD:** `// Edge case: Prevent purely random strings (e.g., "9!8@") from being destructively reduced.`

## 3. Tests as Executable Documentation
Instead of writing a massive block comment explaining how a function handles edge cases, write a well-named unit test that demonstrates it. If a developer wants to know how a function behaves in a specific scenario, there should be a test that proves it.

## 4. Actionable TODOs
If you must leave a `TODO`, it must contain context. Explain *why* the current implementation is temporary and *what* is required to fix it properly.
