# Project Log — Travel Buddy (Group 08)

## Contributor: Afnan Mazumder (24141229)
## Branch: Branch-2

---

## Assigned Features (SRS Section 2.2)
| # | Feature | SRS Sections |
|---|---------|-------------|
| 6 | Budget planning per trip | FR-23 to FR-26 |
| 7 | Expense tracking by category | FR-27 to FR-31 |
| 8 | Accommodation details management | FR-32 to FR-35 |
| 9 | Transportation planning | FR-36 to FR-39 |
| 18 | Currency converter for budget planning | FR-74 to FR-77 |

---

## Phase 3 — Feature Implementation Log

### Date: April 13, 2026
**Initial implementation of all 5 features**

#### Backend (server/)
- Created data models for all features:
  - `server/src/models/budget.ts` — Budget & Expense interfaces
  - `server/src/models/money.ts` — Money interface & factory
  - `server/src/models/accommodation.ts` — Accommodation interface
  - `server/src/models/transport.ts` — Transport & TransportSegment interfaces
- Created service layer:
  - `server/src/services/budgetService.ts` — BudgetService with setBudget() and summarize() with cross-currency support
  - `server/src/services/expenseService.ts` — ExpenseService with add() and summarizeByCategory()
  - `server/src/services/accommodationService.ts` — AccommodationService with addOrUpdate(), get(), listByTrip()
  - `server/src/services/transportService.ts` — TransportService with addOrUpdate(), get(), listByTrip()
- Created currency conversion module:
  - `server/src/currency/provider.ts` — RatesProvider interface, StaticRatesProvider, convert()
- Created Express.js API routes in `server/src/index.ts`:
  - POST/GET `/api/transports`, `/api/accommodations`, `/api/expenses`, `/api/budgets`
  - GET `/api/trips/:tripId/transports`, `/api/trips/:tripId/accommodations`
  - GET `/api/trips/:tripId/expenses/summary`
- Created unit tests (5 tests, all passing):
  - `server/tests/budget.test.ts` — Budget summarization with cross-currency conversion
  - `server/tests/expense.test.ts` — Expense add & category summary
  - `server/tests/accommodation.test.ts` — Accommodation CRUD & listing
  - `server/tests/transport.test.ts` — Transport CRUD & listing
  - `server/tests/currency.test.ts` — Currency conversion with static rates

#### Frontend (src/)
- Created shared types & localStorage store:
  - `src/store.ts` — Trip, BudgetCategory, LocalExpense, LocalAccommodation, LocalTransport types + localStorage helpers
- Created React pages:
  - `src/pages/Budget.tsx` — Budget overview with category breakdown, progress bars, edit modal
  - `src/pages/Expenses.tsx` — Expense list with add/delete, category summary pills
  - `src/pages/Accommodation.tsx` — Accommodation cards with add/delete, nights calculation
  - `src/pages/Transport.tsx` — Transport cards with type icons, add/delete
- Integrated routes in `src/App.tsx`:
  - `/trips/:id/budget`, `/trips/:id/accommodation`, `/trips/:id/transport`, `/trips/:id/expenses`
- Added sidebar navigation in `src/components/TripSidebar.tsx`

---

### Date: April 19, 2026
**Phase 3 completion — SRS gap remediation**

Performed full SRS gap analysis and implemented all missing functional requirements.

#### Feature 6 — Budget Planning Per Trip
**Files modified:** `src/pages/Budget.tsx`
- **FR-23**: Added currency selector dropdown (USD, EUR, GBP, JPY, BDT, CAD, AUD, INR, SGD, CHF) in budget edit modal. Budget currency is persisted per trip in localStorage.
- **FR-26**: Added "Reset Budget" button to clear all category allocations to zero. Uses `RotateCcw` icon.
- Currency symbol now dynamically displayed throughout the page based on selected currency.

#### Feature 7 — Expense Tracking By Category
**Files modified:** `src/pages/Expenses.tsx`, `server/tests/expense.test.ts`
- **FR-29**: Expenses are now sorted chronologically by date (newest first) after every add/edit operation.
- **FR-30**: Added Edit expense functionality — pencil icon appears on hover, opens the same modal pre-filled with existing values. Modal title and button text change to "Edit Expense" / "Save".
- **FR-31**: Category summary pills now display percentage of total spend (e.g., "🍽️ food $40.00 (66.7%)").
- Added `Pencil` icon import from lucide-react.
- **Tests added**: Trip expense isolation test, multiple categories per trip test (FR-28). Total: 3 tests.

#### Feature 8 — Accommodation Details Management
**Files modified:** `server/src/models/accommodation.ts`, `src/store.ts`, `src/pages/Accommodation.tsx`, `server/tests/accommodation.test.ts`
- **FR-33**: Added `confirmationNumber` field to backend model and frontend store. Form includes "Confirmation Number" input. Display shows confirmation with `Hash` icon.
- **FR-35**: Added Edit accommodation functionality — pencil icon appears on hover, opens modal pre-filled with existing values.
- Backend model expanded with optional `address`, `cost`, `currency`, `confirmationNumber` fields.
- Added `Pencil` and `Hash` icon imports from lucide-react.
- **Tests added**: Confirmation number storage test (FR-33), multi-accommodation per trip test (FR-34). Total: 3 tests.

#### Feature 9 — Transportation Planning
**Files modified:** `server/src/models/transport.ts`, `src/store.ts`, `src/pages/Transport.tsx`, `server/tests/transport.test.ts`
- **FR-37**: Added `bookingReference` field to backend model and frontend store. Form includes "Booking Reference" input. Display shows reference with `Tag` icon.
- **FR-38**: Added multi-segment (multi-leg) journey support in UI. "Add another segment" button creates a new segment form with auto-filled `from` field matching previous segment's `to`. Segments can be individually removed. Multi-leg transports display a badge with leg count and expandable segment details.
- **FR-39**: Transport list is now sorted chronologically by first segment's departure time.
- Added Edit transport functionality — pencil icon appears on hover, opens modal pre-filled with all segments.
- Added `Pencil`, `Tag`, `PlusCircle`, `X` icon imports from lucide-react.
- **Tests added**: Booking reference storage test (FR-37), multi-leg journey test (FR-38). Total: 3 tests.

#### Feature 18 — Currency Converter For Budget Planning
**Files created:** `src/pages/CurrencyConverter.tsx`
**Files modified:** `src/App.tsx`, `src/components/TripSidebar.tsx`, `server/tests/currency.test.ts`
- **FR-74**: Supports 50+ international currencies including USD, EUR, GBP, JPY, BDT, CAD, AUD, INR, SGD, CHF, CNY, MXN, BRL, ZAR, KRW, THB, MYR, PHP, IDR, VND, SEK, NOK, DKK, PLN, CZK, HUF, RUB, TRY, AED, SAR, QAR, KWD, BHD, OMR, EGP, NGN, KES, GHS, PKR, LKR, NPR, MMK, NZD, HKD, TWD, ILS, COP, ARS, CLP, PEN, UAH, RON, BGN. Base & target currency selectable via dropdowns.
- **FR-75**: Instant conversion display. Exchange rate shown (e.g., "1 USD = 0.92 EUR"). Swap button to reverse conversion direction.
- **FR-76**: Quick reference table showing 1 unit of base currency converted to 12 popular currencies at a glance.
- **FR-77**: Rates cached in localStorage with timestamp. Stale rate warning displayed (with `WifiOff` icon) when cached rates are older than 24 hours. "Refresh" button to update cached rates.
- Route added: `/trips/:id/currency`
- Sidebar navigation link added with `ArrowRightLeft` icon.
- **Tests added**: Inverse rate conversion (FR-75), same-currency passthrough, unknown currency pair error handling, multiple currency pairs test (FR-74). Total: 5 tests.

---

## Test Summary

| Test File | Tests Before | Tests After | Status |
|-----------|-------------|------------|--------|
| budget.test.ts | 1 | 1 | ✅ Pass |
| expense.test.ts | 1 | 3 | ✅ Pass |
| accommodation.test.ts | 1 | 3 | ✅ Pass |
| transport.test.ts | 1 | 3 | ✅ Pass |
| currency.test.ts | 1 | 5 | ✅ Pass |
| **Total** | **5** | **15** | **✅ All Pass** |

---

## Deferred to Phase 4 (Database Integration)
- FR-33: Document/image attachment for accommodation booking confirmations
- FR-37: E-ticket file attachment for transport bookings
- FR-77: Real-time exchange rate API integration (currently using static rates with caching)
- MongoDB schemas for all models
- API endpoints connected to database instead of in-memory storage

---

## Tech Stack Used
- **Frontend**: React 18 + TypeScript + Vite + React Router + TailwindCSS + Lucide Icons
- **Backend**: Express.js + TypeScript + ts-node-dev
- **Testing**: Vitest
- **State**: localStorage (frontend), in-memory Maps (backend)
- **Currency**: Static exchange rates with localStorage caching
