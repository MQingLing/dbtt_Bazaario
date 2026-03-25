# Bazaario — Singapore Pasar Malam Marketplace

A digital platform connecting customers, vendors, and event organisers for Singapore's night market scene. Customers can browse events, pre-order from vendor stalls, and earn loyalty stamps. Vendors manage orders, menus, and event applications. Admins oversee the platform, manage events, and review vendor applications.

---

## Getting Started

```bash
npm install       # Install dependencies
npm run dev       # Start development server (http://localhost:5173)
npm run build     # Production build
```

---

## Demo Accounts

| Role     | Email                    | Password      |
|----------|--------------------------|---------------|
| Customer | customer@bazaario.com    | Customer@123  |
| Vendor   | vendor@bazaario.com      | Vendor@123    |
| Admin    | admin@bazaario.com       | Admin@123     |

> The default admin account is flagged `isDefaultPassword: true` and will be prompted to change their password on first login. This gate cannot be bypassed.

All accounts are seeded into `localStorage` on first load via `src/app/services/authStore.ts`. New accounts created via sign-up or the Admin panel are persisted in `localStorage` for the session.

---

## Features by Role

### Customer
- Browse upcoming and ongoing pasar malam events
- Interactive stall layout map per event
- Visit vendor digital storefronts and menus
- Add items to cart and pre-order with pickup time selection
- Digital wallet and QR code payment
- Loyalty stamp collection and rewards redemption
- New customer registration

### Vendor
- Dashboard with today's sales, orders, revenue, and customer stats
- Order management with status tracking (Pending → Preparing → Ready)
- Product/menu management with sold-out toggling
- Sales analytics with revenue trends and top products
- Browse and apply for upcoming pasar malam events
- Track application status
- New vendor registration (auto-login after sign-up)

### Admin
- Platform-wide dashboard with event and vendor overview
- Create and manage events with stall layout configuration
- Vendor account management (approve, suspend, monitor)
- Review and approve/reject vendor event applications
- Add new administrator accounts with auto-generated default passwords
- Generated passwords shown once — new admins must change on first login

---

## Auth System

Authentication is handled client-side using `localStorage` as a mock database (`src/app/services/authStore.ts`).

- **`StoredUser`** holds credentials and is never put into React state
- **`User`** (React state) has no password field
- **Force password change** — any account with `isDefaultPassword: true` sees `ChangePasswordPage` before `BrowserRouter`, making it impossible to navigate away
- **Guided tour** — shown once per role after login, state persisted in `localStorage` (`bazaario_tour_seen_{role}`)

---

## Tech Stack

| Layer       | Technology                                      |
|-------------|-------------------------------------------------|
| Framework   | React 18 + TypeScript                           |
| Build tool  | Vite 6                                          |
| Styling     | Tailwind CSS v4                                 |
| Routing     | React Router v7                                 |
| UI primitives | Radix UI (wrapped in `components/shared/`)    |
| Icons       | Lucide React                                    |
| Data        | `localStorage` (mock database, no backend)      |

---

## Project Structure

```
src/app/
├── App.tsx                        # Root — auth state, routing, tour/password gates
├── services/
│   └── authStore.ts               # Mock database (localStorage), seed data, auth helpers
├── data/
│   └── mockData.ts                # Static mock data for events, orders, products
├── components/
│   ├── LoginPage.tsx              # Split-panel login with demo account autofill
│   ├── ChangePasswordPage.tsx     # Inescapable first-login password change gate
│   ├── GuidedTour.tsx             # Role-specific onboarding overlay (5 steps per role)
│   ├── shared/                    # Radix UI primitives (button, input, card, dialog…)
│   ├── customer/                  # Customer pages and nav
│   ├── vendor/                    # Vendor pages, nav, and sign-up
│   └── admin/                     # Admin pages and nav
```

---

## Analytics

Five ML models are implemented as self-contained Jupyter notebooks. Each notebook generates synthetic data, trains a model, evaluates it, and saves the trained model and evaluation report.

```
analytics/
├── admin/
│   ├── revenue_forecast/model/revenue_forecast.ipynb    # Multiple Linear Regression  (R² = 0.824)
│   ├── demand_forecast/model/demand_forecast.ipynb      # Polynomial Regression       (R² = 0.977)
│   └── cashless_adoption/model/cashless_adoption.ipynb  # Logistic Regression         (Acc = 87.5%)
└── vendor/
    ├── revenue_forecast/model/revenue_forecast.ipynb    # Per-vendor Linear Regression (R² = 0.887)
    └── sentiment_analysis/model/sentiment_analysis.ipynb # Keyword NLP                (Acc = 100%)
```

Each notebook outputs:
- **`output/`** — trained model file (`.pkl`)
- **`report/`** — evaluation results and metrics

Run any notebook top-to-bottom in Jupyter or VS Code to reproduce the full pipeline.
