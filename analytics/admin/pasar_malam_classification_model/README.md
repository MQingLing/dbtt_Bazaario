# Admin Classification Model Pipeline

## Overview

Three Random Forest classifiers for admin-level insight into vendor performance, customer spending behaviour, and event tier ranking.

## Models

### 1. Vendor Top-20% Classifier
- **Dataset**: 200 synthetic vendor records, 15 features
- **Features**: total_revenue, avg_rating, events_attended, repeat_rate, avg_order_value, product_variety, peak_hour_sales, weekend_ratio, complaint_rate, response_time, years_active, avg_stall_size, promo_usage, category_encoded, region_encoded
- **Algorithm**: Random Forest, 100 trees, Gini impurity, bootstrap sampling
- **Target**: Binary — top 20% revenue contributor (`1`) vs. rest (`0`)

### 2. Customer Top-20% Spender Classifier
- **Dataset**: 500 synthetic customer records, 16 features
- **Features**: total_spend, visit_frequency, avg_order_value, events_attended, favourite_category_encoded, referral_count, promo_usage_rate, days_since_last_visit, review_count, avg_review_rating, purchase_variety, peak_hour_preference, weekend_visitor, distance_km, age_group_encoded, payment_method_encoded
- **Algorithm**: Random Forest, 100 trees, Gini impurity, bootstrap sampling
- **Target**: Binary — top 20% spender (`1`) vs. rest (`0`)

### 3. Event Tier Classifier
- **Dataset**: 50 synthetic event records, 12 features
- **Composite score**: 35% revenue + 25% rating + 20% sentiment + 20% repeat vendor rate
- **Tiers**: A = top 30% (Retain & Expand), B = middle 40% (Retain & Improve), C = bottom 30% (Review or Drop)
- **Algorithm**: Multi-class Random Forest, 60 trees

## Output Files

| File | Location | Description |
|---|---|---|
| `vendor_dataset.csv` | `data/` | 200 vendor feature records |
| `customer_dataset.csv` | `data/` | 500 customer feature records |
| `event_dataset.csv` | `data/` | 50 event feature records |
| `vendor_predictions.csv` | `output/` | Vendor classification results |
| `customer_predictions.csv` | `output/` | Customer classification results |
| `event_classification_results.csv` | `output/` | Event tier results |
| `admin_model_report.json` | `report/` | Accuracy, precision, recall for vendor & customer models |
| `event_model_report.json` | `report/` | Accuracy and tier distribution for event model |

## How to Run

```bash
# From the project root
python -X utf8 analytics/admin/pasar_malam_classification_model/model/admin_classification_pipeline.py
python -X utf8 analytics/admin/pasar_malam_classification_model/model/event_performance_classification.py
```

Requires **Python 3.8+**, stdlib only (no pip installs needed).
