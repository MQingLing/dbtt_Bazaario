# Vendor Sentiment Analysis Pipeline

## Overview

This pipeline analyses vendor business health by combining order volume trends with customer review sentiment. It produces a composite business health score and a ranked bestseller list for each vendor.

## Input Data (Synthetic, auto-generated)

| File | Rows | Description |
|---|---|---|
| `data/vendor_orders.csv` | ~84,884 | Orders across 20 vendors, 5 events, 90 days |
| `data/vendor_reviews.csv` | ~21,214 | Customer reviews with rating and review text |

Both datasets are generated deterministically using `random.seed(42)`.

## Model

- **Sentiment classifier**: Naive Bayes with a small handcrafted positive/negative lexicon, predicts `positive`, `neutral`, or `negative` per review.
- **VADER-style compound score**: Lexicon-based scoring, normalised to range [-1, +1].
- **Business health composite**:
  - 30% — Revenue trend (current vs. prior period)
  - 25% — Average customer rating (1–5 normalised)
  - 25% — Sentiment score (compound, normalised)
  - 20% — Order volume trend

Health score range: 0–100. Labels: `Excellent` (≥85), `Thriving` (≥70), `Stable` (≥55), `Needs Attention` (<55).

## Output Files

| File | Location | Description |
|---|---|---|
| `vendor_orders.csv` | `data/` | Raw generated order data |
| `vendor_reviews.csv` | `data/` | Raw generated review data |
| `vendor_sentiment_results.csv` | `output/` | Per-review sentiment predictions |
| `vendor_bestsellers.csv` | `output/` | Top products ranked by units sold per vendor |
| `vendor_business_health.csv` | `report/` | Composite health score per vendor |

## How to Run

```bash
# From the project root
python -X utf8 analytics/vendor/products_sentiment_analysis/model/vendor_sentiment_pipeline.py
```

Requires **Python 3.8+**, stdlib only (no pip installs needed).
