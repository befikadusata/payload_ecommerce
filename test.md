Below is a **clear, pragmatic testing instruction set** tailored exactly to your project and constraints:

* Qwik (Vite, PWA)
* Payload CMS
* ZITADEL (external IdP)
* GraphQL
* Matrix chat
* Postgres
* pnpm
* **No docker-compose**
* Focus on **correct auth flow**, not mocking everything unrealistically

I’ll separate **what must be tested**, **what can be mocked**, and **what must be real**.

---

# 0. Testing philosophy (important)

Because ZITADEL and Matrix are **external systems**, the correct strategy is:

* **Unit tests** → logic only, no real network
* **Integration tests** → real Payload + Postgres, mocked ZITADEL/Matrix
* **E2E tests** → minimal, only for the critical user journey

Do **not** try to fully mock OAuth flows in unit tests — that always leads to false confidence.

---

# 1. Unit Tests (logic-level, fast)

### Tools

* Test runner: `vitest`
* Assertion: built-in
* Mocking: `vi.mock`
* Environment: Node

### Scope

Unit tests should **never**:

* Start Payload
* Talk to Postgres
* Talk to ZITADEL
* Talk to Matrix

### 1.1 Payload-side unit tests

#### A. PKCE utilities

**Goal:** Ensure PKCE generation is correct and deterministic in shape.

Test cases:

* [ ] `generateCodeVerifier()` returns a string
* [ ] `generateCodeChallenge(verifier)` returns URL-safe base64
* [ ] Same verifier always produces same challenge
* [ ] Challenge length > verifier length

Reason: If PKCE breaks, OAuth breaks silently.

---

#### B. ZITADEL user mapping logic

**Goal:** Ensure ZITADEL userinfo → Payload user mapping is correct.

Mock:

* ZITADEL `/userinfo` response

Test cases:

* [ ] Given a userinfo payload with `sub`, user lookup is done by `sub`
* [ ] New user is created if not found
* [ ] Existing user is updated (email/name)
* [ ] Roles are mapped correctly
* [ ] Password is never set

---

#### C. AuthStrategy behavior (minimal)

**Goal:** Ensure strategy does not block authentication.

Test cases:

* [ ] `authenticate()` returns user when user is provided
* [ ] `authenticate()` returns null when no user is provided
* [ ] Strategy does not attempt OAuth logic

This ensures future refactors don’t re-break the flow.

---

### 1.2 Frontend (Qwik) unit tests

#### A. Auth store logic

Mock:

* `/api/users/me` response

Test cases:

* [ ] When `/me` returns 200, `authStore.user` is set
* [ ] When `/me` returns 401, user is null
* [ ] Loading state behaves correctly
* [ ] Errors are handled gracefully

---

#### B. Product GraphQL query logic

Mock:

* GraphQL response

Test cases:

* [ ] Products render correctly
* [ ] Variants are displayed
* [ ] Unauthorized response is handled

---

#### C. Chat state logic (Matrix)

Mock:

* matrix-js-sdk client

Test cases:

* [ ] Chat initializes only when user is authenticated
* [ ] Chat does not initialize for anonymous users
* [ ] Message send function is gated by auth state

---

# 2. Integration Tests (real backend, mocked IdPs)

### Tools

* Test runner: `vitest`
* Test DB: real Postgres (separate test DB)
* Payload: real instance (programmatic)
* HTTP client: `supertest`

### What is REAL here

* Payload CMS
* Postgres
* GraphQL
* Session cookies

### What is MOCKED

* ZITADEL token endpoint
* ZITADEL userinfo endpoint
* Matrix server

---

## 2.1 Payload + Auth integration

#### Setup

* Start Payload programmatically in test mode
* Use a dedicated test database
* Seed Products + Variants

---

### A. OAuth callback → session creation

**Goal:** Prove the core invariant: *ZITADEL identity → Payload session*

Mock:

* Token exchange response
* Userinfo response

Test cases:

* [ ] Callback endpoint returns 302 redirect
* [ ] Response sets `payload-token` cookie
* [ ] Cookie is HttpOnly
* [ ] Cookie persists across requests

---

### B. `/api/users/me`

Test cases:

* [ ] Without cookie → 401
* [ ] With valid cookie → returns user
* [ ] Returned user matches ZITADEL `sub`

---

### C. GraphQL authorization

Test cases:

* [ ] Anonymous GraphQL query is rejected
* [ ] Authenticated user can query Products
* [ ] Variants are included in response
* [ ] Role-based access is enforced (if applicable)

---

## 2.2 Frontend ↔ Backend integration

Use `@playwright/test` **or** simple fetch-based tests.

Test cases:

* [ ] Frontend sends cookies correctly (`credentials: include`)
* [ ] Authenticated fetch to `/me` succeeds
* [ ] GraphQL query works from frontend code

---

# 3. E2E Tests (minimal, critical-path only)

⚠️ **Do not overdo E2E**. One or two flows max.

### Tools

* Playwright
* Real browser
* Test ZITADEL project (or mocked IdP behind feature flag)

---

## 3.1 Critical user journey (must-have)

**Flow:**

```
Visit app
→ Click Login
→ Redirect to ZITADEL
→ Authenticate
→ Redirect back
→ Products page loads
→ Chat is available
```

Test steps:

* [ ] User is redirected to ZITADEL
* [ ] Login succeeds
* [ ] User lands back on app
* [ ] Products render
* [ ] Variants visible
* [ ] Chat UI enabled

---

## 3.2 Logout flow

Test cases:

* [ ] Logout clears session
* [ ] `/api/users/me` returns 401
* [ ] Chat is disabled
* [ ] GraphQL access denied

---

# 4. PWA-specific tests (lightweight)

You don’t need heavy testing here.

Test cases:

* [ ] Service worker registers
* [ ] App loads offline shell
* [ ] Auth-required routes fail gracefully offline

---

# 5. What NOT to test (important)

Do NOT:

* Unit test ZITADEL itself
* Unit test OAuth redirects end-to-end
* Mock Payload internals
* Test Matrix protocol details
* Test browser cookie implementation

Those give false confidence.

---

# 6. Minimal CI test matrix (recommended)

| Test Type   | Required          |
| ----------- | ----------------- |
| Unit        | ✅ Always          |
| Integration | ✅ Always          |
| E2E         | ⚠️ One happy path |
| PWA         | ⚠️ Smoke only     |

---

# 7. Final success signal

You know the project is **test-correct** when:

* A mocked ZITADEL login produces a real Payload session
* `/api/users/me` is the single source of auth truth
* GraphQL access works only with cookies
* Chat initializes only when authenticated
* No test relies on frontend token handling

---
