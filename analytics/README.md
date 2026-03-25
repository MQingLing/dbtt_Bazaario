# Bazaario — Analytics Pipelines

This folder contains all synthetic datasets, trained models, and machine learning pipelines for the **Bazaario Pasar Malam Marketplace** analytics system.

## Folder Structure

```
analytics/
├── admin/
│   ├── revenue_forecast/
│   │   ├── data/       revenue_data.csv (365 daily records)
│   │   ├── model/      revenue_forecast.ipynb
│   │   ├── output/     revenue_forecast_model.pkl
│   │   └── report/     evaluation_report.json
│   ├── demand_forecast/
│   │   ├── data/       demand_data.csv (540 hourly records)
│   │   ├── model/      demand_forecast.ipynb
│   │   ├── output/     demand_forecast_model.pkl
│   │   └── report/     evaluation_report.json
│   └── cashless_adoption/
│       ├── data/       cashless_data.csv (2000 transactions)
│       ├── model/      cashless_adoption.ipynb
│       ├── output/     cashless_model.pkl
│       └── report/     evaluation_report.json
│
└── vendor/
    ├── revenue_forecast/
    │   ├── data/       vendor_revenue_data.csv (450 daily records, 5 vendors)
    │   ├── model/      revenue_forecast.ipynb
    │   ├── output/     vendor_revenue_models.pkl
    │   └── report/     evaluation_report.json
    └── sentiment_analysis/
        ├── data/       reviews_data.csv (800 reviews, 4 weeks)
        ├── model/      sentiment_analysis.ipynb
        ├── output/     sentiment_model.pkl
        └── report/     evaluation_report.json
```

## Models

| Model | Type | Location | Metric |
|---|---|---|---|
| **Admin Revenue Forecast** | Multiple Linear Regression | `admin/revenue_forecast/` | R² = 0.824 |
| **Admin Demand Forecast** | Multiple Linear Regression | `admin/demand_forecast/` | R² = 0.977 |
| **Cashless Adoption** | Logistic Regression | `admin/cashless_adoption/` | Accuracy = 87.5% |
| **Vendor Revenue Forecast** | Multiple Linear Regression | `vendor/revenue_forecast/` | R² = 0.887 (overall) |
| **Vendor Sentiment Analysis** | Keyword-based NLP | `vendor/sentiment_analysis/` | Accuracy = 100% |

## Each Notebook

Every `.ipynb` contains 5 sequential sections:

1. **Setup** — resolves `data/`, `output/`, `report/` paths
2. **Generate Data** — creates synthetic training data → `data/*.csv`
3. **Train** — fits the model → `output/*.pkl`
4. **Evaluate** — computes metrics on test set → `report/evaluation_report.json`
5. **Test** — runs inference on sample inputs

Run cells top-to-bottom to fully regenerate all outputs.

## Quick Start

Open any notebook in VS Code or Jupyter and run all cells:

```
analytics/admin/revenue_forecast/model/revenue_forecast.ipynb
analytics/admin/demand_forecast/model/demand_forecast.ipynb
analytics/admin/cashless_adoption/model/cashless_adoption.ipynb
analytics/vendor/revenue_forecast/model/revenue_forecast.ipynb
analytics/vendor/sentiment_analysis/model/sentiment_analysis.ipynb
```

Requires **Python 3.8+**. No external libraries — all models use Python stdlib only (`csv`, `json`, `math`, `random`, `pickle`).

## Frontend Integration

Model outputs are consumed by the React frontend via `src/app/data/analyticsData.ts`. After re-running any notebook, update `analyticsData.ts` to reflect new metric values from `report/evaluation_report.json`.

| Notebook | Frontend Component |
|---|---|
| Admin Revenue Forecast | `AdminDashboard.tsx` — Revenue Forecast tab |
| Admin Demand Forecast | `AdminDashboard.tsx` — Demand Forecast tab |
| Cashless Adoption | `AdminDashboard.tsx` — Cashless Adoption by Category |
| Vendor Revenue Forecast | `VendorSalesAnalytics.tsx` — Forecast tab |
| Vendor Sentiment Analysis | `VendorSalesAnalytics.tsx` — Reviews & Sentiment tabs |
