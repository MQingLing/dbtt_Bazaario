# Bazaario — Analytics Pipelines

This folder contains all synthetic datasets and machine learning pipelines for the **Bazaario Pasar Malam Marketplace** analytics system.

## Folder Structure

```
analytics/
├── vendor/
│   └── products_sentiment_analysis/
│       ├── data/       Raw synthetic datasets (orders, reviews)
│       ├── model/      Python pipeline script
│       ├── output/     Model predictions and product rankings
│       ├── report/     Business health scores per vendor
│       └── README.md
│
├── admin/
│   └── pasar_malam_classification_model/
│       ├── data/       Vendor, customer, and event datasets
│       ├── model/      Classification pipeline scripts
│       ├── output/     Prediction results
│       ├── report/     JSON model performance reports
│       └── README.md
│
└── README.md           ← You are here
```

## Pipelines

| Pipeline | Location | Purpose |
|---|---|---|
| **Vendor Sentiment Analysis** | `vendor/products_sentiment_analysis/` | Business health score + best-selling items per vendor |
| **Admin Classification Models** | `admin/pasar_malam_classification_model/` | Top 20% vendor contributors, top 20% customer spenders, event tier classification |

## Quick Start

```bash
# Run from project root
python -X utf8 analytics/vendor/products_sentiment_analysis/model/vendor_sentiment_pipeline.py
python -X utf8 analytics/admin/pasar_malam_classification_model/model/admin_classification_pipeline.py
python -X utf8 analytics/admin/pasar_malam_classification_model/model/event_performance_classification.py
```

Requires **Python 3.8+**. No external libraries — all models use Python stdlib only.
