<!--
Sync Impact Report:
- Version change: initial → 1.0.0
- New document: Initial constitution creation
- Principles defined:
  1. Type Safety & Schema Validation
  2. Component Testing Standards
  3. User Experience Consistency
  4. Performance Requirements
- Templates status:
  ✅ plan-template.md - Compatible with constitution principles
  ✅ spec-template.md - Compatible with constitution principles
  ✅ tasks-template.md - Compatible with constitution principles
- No pending follow-ups
-->

# 우동금 (Udonggeum) Frontend Constitution

## Core Principles

### I. Type Safety & Schema Validation

**All data flowing through the application MUST be type-safe and validated.**

- Zod schemas MUST be defined before TypeScript types
- API responses MUST be validated with Zod at the service layer before reaching components
- Form inputs MUST be validated using Zod schemas with Korean error messages
- TypeScript `any` type is PROHIBITED - use `unknown` with type guards instead
- All external data (API responses, user inputs, localStorage) MUST be validated

**Rationale**: Runtime type safety prevents production bugs from type mismatches,
invalid API responses, and malformed data. Schema-first development ensures validation
logic and types stay synchronized.

### II. Component Testing Standards

**Testing is required for critical business logic and user journeys.**

- Unit tests MUST be written for: complex utility functions, custom hooks with logic,
  schema validation functions, state management stores
- Integration tests MUST be written for: complete user flows, API integration points,
  critical business processes
- Test files MUST follow naming convention: `ComponentName.test.tsx` or `functionName.test.ts`
- Tests MUST follow AAA pattern: Arrange → Act → Assert
- Mock Service Worker (MSW) MUST be used for API mocking in tests
- Tests are NOT required for: simple presentational components, trivial utility functions,
  third-party library wrappers

**Rationale**: Focus testing effort on code that contains business logic or could break
user workflows. Avoid testing React internals or implementation details.

### III. User Experience Consistency

**The user interface MUST be predictable, accessible, and consistently styled.**

- All UI components MUST use TailwindCSS for styling (no inline styles except dynamic values)
- DaisyUI components MUST be used for common UI patterns (buttons, modals, forms, cards)
- Color palette and spacing MUST follow Tailwind's design tokens
- All interactive elements MUST be keyboard accessible
- All images MUST have meaningful `alt` attributes
- Form labels MUST be explicitly associated with inputs using `<label>` elements
- Loading states MUST be shown for async operations taking >300ms
- Error messages MUST be user-friendly in Korean with clear guidance

**Rationale**: Consistent design systems reduce cognitive load, improve accessibility,
and speed up development. DaisyUI provides battle-tested component patterns.

### IV. Performance Requirements

**The application MUST load quickly and respond smoothly to user interactions.**

- Initial page load MUST complete in <3 seconds on 3G connection
- Time to Interactive (TTI) MUST be <5 seconds on 3G connection
- React component re-renders MUST be minimized using proper memoization and selectors
- Images MUST be optimized and lazy-loaded when below the fold
- TanStack Query cache MUST be configured with appropriate `staleTime` and `gcTime`
- Zustand selectors MUST be used to subscribe only to needed state slices
- Bundle size MUST be monitored and kept under 500KB (gzipped)
- Code splitting MUST be used for routes and heavy features

**Rationale**: Korean mobile users expect fast, responsive applications. Performance
directly impacts user satisfaction, conversion rates, and SEO rankings.

### V. State Management Separation

**Server state and client state MUST be managed with appropriate tools.**

- TanStack Query MUST be used for ALL server state (API data, cache, async operations)
- Zustand MUST be used ONLY for client state (UI state, auth tokens, user preferences)
- Component state (`useState`) MUST be used for local, non-shared state
- Props drilling beyond 2 levels MUST be avoided - use composition or context instead
- Derived state MUST be computed, not stored
- State updates causing network requests MUST go through TanStack Query mutations

**Rationale**: Each state management tool has specific strengths. TanStack Query
handles server synchronization, caching, and revalidation automatically. Zustand
provides minimal global state without Redux boilerplate.

## Architecture Standards

### Service Layer Pattern

**All API communication MUST go through a dedicated service layer.**

- Services MUST be pure functions/classes with no React dependencies
- Services MUST validate responses with Zod before returning data
- Services MUST throw typed errors (ApiError, ValidationError, NetworkError)
- Services MUST NOT handle UI concerns (loading states, error display)
- Axios interceptors MUST handle cross-cutting concerns (auth headers, error logging)

### Query Keys Factory Pattern

**TanStack Query keys MUST be centrally managed to prevent cache invalidation bugs.**

- Each resource MUST have a query keys factory (e.g., `productsKeys`, `cartKeys`)
- Query keys MUST be hierarchical for selective invalidation
- Query keys MUST be typed with `as const` for type safety

### Code Organization

**Code MUST be organized by feature and concern, not by file type.**

```
src/
├── api/           # Axios client and interceptors
├── schemas/       # Zod schemas (single source of truth)
├── services/      # API call logic (uses schemas)
├── stores/        # Zustand stores (client state only)
├── hooks/         # Custom hooks including TanStack Query hooks
├── components/    # Reusable UI components
├── pages/         # Route-level page components
├── constants/     # App-wide constants
└── utils/         # Pure utility functions
```

## Development Workflow

### Code Style

- ESLint rules MUST be followed - no suppressions without justification
- Prettier formatting MUST be applied before commit
- Maximum line length: 100 characters
- Function/component length: <100 lines (split if longer)
- Boolean variables MUST use `is*`, `has*`, or `should*` prefixes
- Functions MUST use verb prefixes: `fetch*`, `handle*`, `validate*`

### Git Workflow

- Commit messages MUST follow the project's commit convention (see COMMIT_CONVENTION.md)
- Feature branches MUST be named: `feat/short-description` or `fix/short-description`
- Code MUST be committed in logical, atomic units
- Work in progress MUST NOT be committed to main branch
- PRs MUST have meaningful descriptions referencing related issues

### Documentation

- Public APIs MUST have JSDoc comments explaining purpose and parameters
- Complex business logic MUST have inline comments explaining "why", not "what"
- Architecture decisions MUST be documented in ARCHITECTURE.md
- Breaking changes MUST be documented in commit messages and PR descriptions

## Quality Gates

Before code can be merged:

1. **Type Safety**: `tsc -b` MUST pass with no errors
2. **Linting**: `npm run lint` MUST pass with no errors
3. **Build**: `npm run build` MUST complete successfully
4. **Tests** (if applicable): All tests MUST pass
5. **Manual Testing**: Critical user flows MUST be manually tested

## Governance

### Amendment Process

1. Propose change via PR to `.specify/memory/constitution.md`
2. Discuss impact on existing code and templates
3. Update affected templates in `.specify/templates/`
4. Increment version following semantic versioning
5. Document rationale in commit message

### Versioning Policy

- **MAJOR**: Breaking governance changes (removing principles, incompatible rules)
- **MINOR**: New principles added or substantial expansions
- **PATCH**: Clarifications, typo fixes, non-semantic changes

### Compliance

- All PRs MUST be reviewed for constitutional compliance
- Constitution violations MUST be justified in PR description
- Templates MUST stay synchronized with constitution principles
- Regular audits SHOULD be conducted to verify adherence

**Version**: 1.0.0 | **Ratified**: 2025-10-28 | **Last Amended**: 2025-10-28
