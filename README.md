<div align="center">
  <img src="src/assets/app_logo.png" alt="Bazaario Logo" width="480" />

# 🛍️ Bazaario

  *Singapore's Digital Pasar Malam Marketplace*

  A digital platform connecting customers, vendors, and event organisers for Singapore's vibrant night market scene — enabling pre-orders, stall discovery, loyalty rewards, and seamless event management.

  ![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=white)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white)
  ![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat&logo=vite&logoColor=white)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
  ![Python](https://img.shields.io/badge/Python-3.x-3776AB?style=flat&logo=python&logoColor=white)
  ![License](https://img.shields.io/badge/License-MIT-green?style=flat)
  ![Educational](https://img.shields.io/badge/Purpose-Educational-orange?style=flat)

</div>

---

## About

Bazaario is a prototype marketplace platform built for Singapore's pasar malam (night market) ecosystem. It simulates three distinct portals — **Customer**, **Vendor**, and **Admin** — each with full role-based functionality, powered entirely by `localStorage` as a mock backend with no server required.

Built as an educational project to demonstrate full-stack UI design, role-based access control, and machine learning integration in a realistic product setting.

---

## Getting Started

**Live Demo:** [https://mqingling.github.io/dbtt_Bazaario/](https://mqingling.github.io/dbtt_Bazaario/)

```bash
npm install       # Install dependencies
npm run dev       # Start development server (http://localhost:5173)
npm run build     # Production build → docs/
```

---

## Demo Accounts

| Role     | Email                 | Password     |
| -------- | --------------------- | ------------ |
| Customer | customer@bazaario.com | Customer@123 |
| Vendor   | vendor@bazaario.com   | Vendor@123   |
| Admin    | admin@bazaario.com    | Admin@123    |

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
- Track event application status
- Document submission and verification flow
- New vendor registration (auto-login after sign-up)

### Admin

- Platform-wide dashboard with event and vendor overview
- Create and manage events with stall layout configuration
- Compliance tracking (SCDF, SFA, EMA permits) per event
- Vendor account management and verification (approve, suspend, monitor)
- Review and approve/reject vendor event applications
- Add new administrator accounts with auto-generated default passwords
- Generated passwords shown once — new admins must change on first login

---

## Tech Stack

| Layer         | Technology                                   |
| ------------- | -------------------------------------------- |
| Framework     | React 18 + TypeScript                        |
| Build Tool    | Vite 6                                       |
| Styling       | Tailwind CSS v4                              |
| Routing       | React Router v7                              |
| UI Primitives | Radix UI (wrapped in `components/shared/`) |
| Icons         | Lucide React                                 |
| Data          | `localStorage` (mock database, no backend) |
| Analytics     | Python 3 + scikit-learn + Jupyter Notebooks  |

---

## Authentication

Authentication is handled client-side using `localStorage` as a mock database (`src/app/services/authStore.ts`).

- **`StoredUser`** holds credentials and is never put into React state
- **`User`** (React state) has no password field
- **Force password change** — any account with `isDefaultPassword: true` sees `ChangePasswordPage` before `BrowserRouter`, making it impossible to navigate away
- **Guided tour** — shown once per role after login, state persisted in `localStorage` (`bazaario_tour_seen_{role}`)

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

## Analytics (ML Models)

Five ML models are implemented as self-contained Jupyter notebooks. Each notebook generates synthetic data, trains a model, evaluates it, and saves the trained model and evaluation report.

```
analytics/
├── admin/
│   ├── revenue_forecast/model/revenue_forecast.ipynb    # Multiple Linear Regression  (R² = 0.824)
│   ├── demand_forecast/model/demand_forecast.ipynb      # Multiple Linear Regression  (R² = 0.977)
│   └── cashless_adoption/model/cashless_adoption.ipynb  # Logistic Regression         (Acc = 87.5%)
└── vendor/
    ├── revenue_forecast/model/revenue_forecast.ipynb    # Per-vendor Gradient Boosting  (R² = 0.887)
    └── sentiment_analysis/model/sentiment_analysis.ipynb # Keyword NLP                (Acc = 100%)
```

Each notebook outputs:

- **`output/`** — trained model file (`.pkl`)
- **`report/`** — evaluation results and metrics

Run any notebook top-to-bottom in Jupyter or VS Code to reproduce the full pipeline.

---

## Deployment

The project deploys to GitHub Pages via the `docs/` folder (`outDir: 'docs'` in `vite.config.ts`).

```bash
npm run build     # Outputs to docs/
git add docs/
git commit -m "Rebuild docs"
git push
```
