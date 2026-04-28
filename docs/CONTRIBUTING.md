# OpaqueAuth Commit Guidelines

OpaqueAuth strictly follows the [Conventional Commits](https://www.conventionalcommits.org/) specification. A clean Git history isn't just aesthetic; it makes debugging easier and automated versioning possible.

If your commit message does not follow this format, it will be rejected.

## The Format
Every commit must use the following structure:

```text
<type>(<scope>): <subject>

<body (optional, but highly recommended)>

<footer (optional, used for closing issues)>
```

## Allowed Types
* `feat`: A new feature or logic module.
* `fix`: A bug fix.
* `docs`: Changes to documentation (like this file) or code comments.
* `refactor`: Code changes that neither fix a bug nor add a feature (e.g., modularizing a file).
* `test`: Adding missing tests or correcting existing ones.
* `ci`: Changes to our CI configuration files and scripts (e.g., GitHub Actions).
* `chore`: Minor repository maintenance, dependency updates, or `.gitignore` changes.

## Allowed Scopes
The scope tells us which part of the monorepo you touched:
* `core`: The Rust `guessrank-core` crate.
* `api`: The ConnectRPC backend microservice.
* `client`: The TypeScript NPM wrapper.
* `infra`: Monorepo config, CI/CD, workspaces.

## Issue Tracking
If your commit addresses a GitHub issue, you must include it in the footer.
* If it partially completes an issue: `Progresses #2`
* If it finishes an issue: `Closes #2`

## Example of a Perfect Commit
```text
refactor(core): modularize crate and implement robust padding sanitization

- Extract `strip_padding` logic into dedicated `sanitizer.rs` module.
- Clean `lib.rs` to act strictly as the public API / Wasm binding router.
- Implement `trim_matches` logic to isolate semantic roots.

Closes #2
```
