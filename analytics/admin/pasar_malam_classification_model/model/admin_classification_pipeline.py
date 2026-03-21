"""
admin_classification_pipeline.py
Bazaario — Admin Classification Pipeline

Generates 200 vendor records (15 features) and 500 customer records (16 features),
labels the top 20% as high-performers/spenders, trains Random Forest classifiers
from scratch (CART trees, bootstrap bagging, Gini impurity), evaluates them,
and saves all results to disk.

Stdlib only — no external dependencies required.
Run: python -X utf8 analytics/admin/pasar_malam_classification_model/model/admin_classification_pipeline.py
"""

import csv
import json
import math
import os
import random
from collections import Counter, defaultdict
from pathlib import Path

# ── Paths ─────────────────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).resolve().parent
DATA_DIR   = SCRIPT_DIR.parent / 'data'
OUTPUT_DIR = SCRIPT_DIR.parent / 'output'
REPORT_DIR = SCRIPT_DIR.parent / 'report'

for d in (DATA_DIR, OUTPUT_DIR, REPORT_DIR):
    d.mkdir(parents=True, exist_ok=True)

random.seed(42)

# ── Data generation helpers ───────────────────────────────────────────────────
CATEGORIES = ['Food', 'Drinks', 'Desserts', 'Products', 'Services']
REGIONS    = ['North', 'South', 'East', 'West', 'Central']
PAYMENT    = ['Cash', 'PayNow', 'GrabPay', 'CardTap']
AGE_GROUPS = ['18-25', '26-35', '36-45', '46-55', '56+']
STALL_SIZES = [9, 12, 15, 20]  # sqm


def _cat_encode(val: str, lst: list) -> int:
    return lst.index(val) if val in lst else 0


def generate_vendor_dataset(n: int = 200) -> list[dict]:
    records = []
    for i in range(n):
        category = random.choice(CATEGORIES)
        events_attended = random.randint(1, 20)
        avg_rating = round(random.uniform(3.0, 5.0), 2)
        total_revenue = round(random.uniform(1000, 80000), 2)
        records.append({
            'vendor_id':          f'V{i+1:03d}',
            'total_revenue':      total_revenue,
            'avg_rating':         avg_rating,
            'events_attended':    events_attended,
            'repeat_rate':        round(random.uniform(0.1, 0.95), 3),
            'avg_order_value':    round(random.uniform(5, 50), 2),
            'product_variety':    random.randint(2, 20),
            'peak_hour_sales':    round(random.uniform(0.2, 0.8), 3),
            'weekend_ratio':      round(random.uniform(0.3, 0.7), 3),
            'complaint_rate':     round(random.uniform(0.0, 0.15), 4),
            'response_time_min':  round(random.uniform(1, 60), 1),
            'years_active':       round(random.uniform(0.5, 10), 1),
            'avg_stall_size':     random.choice(STALL_SIZES),
            'promo_usage':        random.randint(0, 30),
            'category_encoded':   _cat_encode(category, CATEGORIES),
            'region_encoded':     _cat_encode(random.choice(REGIONS), REGIONS),
            'category':           category,
        })
    # Label top 20% by total_revenue as top_contributor
    threshold = sorted(r['total_revenue'] for r in records)[int(n * 0.80)]
    for r in records:
        r['top_contributor'] = 1 if r['total_revenue'] >= threshold else 0
    return records


def generate_customer_dataset(n: int = 500) -> list[dict]:
    records = []
    for i in range(n):
        age_group = random.choice(AGE_GROUPS)
        payment   = random.choice(PAYMENT)
        total_spend = round(random.uniform(10, 2000), 2)
        records.append({
            'customer_id':            f'C{i+1:04d}',
            'total_spend':            total_spend,
            'visit_frequency':        random.randint(1, 50),
            'avg_order_value':        round(random.uniform(5, 60), 2),
            'events_attended':        random.randint(1, 15),
            'favourite_cat_encoded':  _cat_encode(random.choice(CATEGORIES), CATEGORIES),
            'referral_count':         random.randint(0, 20),
            'promo_usage_rate':       round(random.uniform(0.0, 1.0), 3),
            'days_since_last_visit':  random.randint(1, 365),
            'review_count':           random.randint(0, 30),
            'avg_review_rating':      round(random.uniform(1.0, 5.0), 2),
            'purchase_variety':       random.randint(1, 10),
            'peak_hour_preference':   round(random.uniform(0, 1), 3),
            'weekend_visitor':        random.randint(0, 1),
            'distance_km':            round(random.uniform(0.5, 30), 2),
            'age_group_encoded':      _cat_encode(age_group, AGE_GROUPS),
            'payment_method_encoded': _cat_encode(payment, PAYMENT),
            'age_group':              age_group,
            'payment_method':         payment,
        })
    threshold = sorted(r['total_spend'] for r in records)[int(n * 0.80)]
    for r in records:
        r['top_spender'] = 1 if r['total_spend'] >= threshold else 0
    return records


# ── CART Decision Tree ────────────────────────────────────────────────────────
def _gini(labels: list) -> float:
    if not labels:
        return 0.0
    n = len(labels)
    counts = Counter(labels)
    return 1.0 - sum((c / n) ** 2 for c in counts.values())


def _best_split(X: list[list], y: list, feature_indices: list[int]):
    best_gini, best_feat, best_thresh = float('inf'), None, None
    n = len(y)
    for fi in feature_indices:
        values = sorted(set(row[fi] for row in X))
        for i in range(len(values) - 1):
            thresh = (values[i] + values[i + 1]) / 2
            left_y  = [y[j] for j in range(n) if X[j][fi] <= thresh]
            right_y = [y[j] for j in range(n) if X[j][fi] >  thresh]
            if not left_y or not right_y:
                continue
            g = (len(left_y) / n) * _gini(left_y) + (len(right_y) / n) * _gini(right_y)
            if g < best_gini:
                best_gini, best_feat, best_thresh = g, fi, thresh
    return best_feat, best_thresh


class _Node:
    def __init__(self):
        self.feature = None
        self.threshold = None
        self.left = None
        self.right = None
        self.value = None  # leaf prediction


def _build_tree(X: list[list], y: list, max_depth: int, min_samples: int,
                n_features: int, depth: int = 0) -> _Node:
    node = _Node()
    if depth >= max_depth or len(y) < min_samples or len(set(y)) == 1:
        node.value = Counter(y).most_common(1)[0][0]
        return node
    feature_indices = random.sample(range(len(X[0])), k=min(n_features, len(X[0])))
    feat, thresh = _best_split(X, y, feature_indices)
    if feat is None:
        node.value = Counter(y).most_common(1)[0][0]
        return node
    node.feature, node.threshold = feat, thresh
    left_mask  = [i for i in range(len(y)) if X[i][feat] <= thresh]
    right_mask = [i for i in range(len(y)) if X[i][feat] >  thresh]
    node.left  = _build_tree([X[i] for i in left_mask],  [y[i] for i in left_mask],
                              max_depth, min_samples, n_features, depth + 1)
    node.right = _build_tree([X[i] for i in right_mask], [y[i] for i in right_mask],
                              max_depth, min_samples, n_features, depth + 1)
    return node


def _predict_tree(node: _Node, x: list) -> int:
    if node.value is not None:
        return node.value
    if x[node.feature] <= node.threshold:
        return _predict_tree(node.left, x)
    return _predict_tree(node.right, x)


class RandomForest:
    def __init__(self, n_trees: int = 100, max_depth: int = 8,
                 min_samples: int = 5, n_features: int | None = None):
        self.n_trees = n_trees
        self.max_depth = max_depth
        self.min_samples = min_samples
        self.n_features = n_features
        self.trees: list[_Node] = []

    def fit(self, X: list[list], y: list) -> None:
        n_feat = self.n_features or max(1, int(math.sqrt(len(X[0]))))
        n = len(X)
        self.trees = []
        for _ in range(self.n_trees):
            indices = [random.randint(0, n - 1) for _ in range(n)]
            Xb = [X[i] for i in indices]
            yb = [y[i] for i in indices]
            self.trees.append(_build_tree(Xb, yb, self.max_depth, self.min_samples, n_feat))

    def predict(self, X: list[list]) -> list:
        results = []
        for x in X:
            votes = [_predict_tree(tree, x) for tree in self.trees]
            results.append(Counter(votes).most_common(1)[0][0])
        return results


# ── Evaluation ────────────────────────────────────────────────────────────────
def evaluate(y_true: list, y_pred: list) -> dict:
    n = len(y_true)
    tp = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 1)
    fp = sum(1 for t, p in zip(y_true, y_pred) if t == 0 and p == 1)
    fn = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 0)
    accuracy  = sum(1 for t, p in zip(y_true, y_pred) if t == p) / n
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall    = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1        = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0.0
    return {
        'accuracy':  round(accuracy, 4),
        'precision': round(precision, 4),
        'recall':    round(recall, 4),
        'f1':        round(f1, 4),
    }


# ── CSV helpers ───────────────────────────────────────────────────────────────
def write_csv(path: Path, rows: list[dict], fieldnames: list[str]) -> None:
    with open(path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


# ── Main ──────────────────────────────────────────────────────────────────────
VENDOR_FEATURE_COLS = [
    'total_revenue', 'avg_rating', 'events_attended', 'repeat_rate',
    'avg_order_value', 'product_variety', 'peak_hour_sales', 'weekend_ratio',
    'complaint_rate', 'response_time_min', 'years_active', 'avg_stall_size',
    'promo_usage', 'category_encoded', 'region_encoded',
]

CUSTOMER_FEATURE_COLS = [
    'total_spend', 'visit_frequency', 'avg_order_value', 'events_attended',
    'favourite_cat_encoded', 'referral_count', 'promo_usage_rate',
    'days_since_last_visit', 'review_count', 'avg_review_rating',
    'purchase_variety', 'peak_hour_preference', 'weekend_visitor',
    'distance_km', 'age_group_encoded', 'payment_method_encoded',
]


def main() -> None:
    # ── Vendor model ──────────────────────────────────────────────────────────
    print('Generating vendor dataset (200 records)...')
    vendor_data = generate_vendor_dataset(200)
    write_csv(
        DATA_DIR / 'vendor_dataset.csv',
        vendor_data,
        ['vendor_id'] + VENDOR_FEATURE_COLS + ['category', 'top_contributor']
    )

    XV = [[r[c] for c in VENDOR_FEATURE_COLS] for r in vendor_data]
    yV = [r['top_contributor'] for r in vendor_data]

    # 80/20 train-test split
    split = int(len(XV) * 0.8)
    XV_train, XV_test = XV[:split], XV[split:]
    yV_train, yV_test = yV[:split], yV[split:]

    print('Training vendor Random Forest (100 trees)...')
    rf_vendor = RandomForest(n_trees=100, max_depth=8)
    rf_vendor.fit(XV_train, yV_train)
    yV_pred = rf_vendor.predict(XV_test)
    vendor_metrics = evaluate(yV_test, yV_pred)
    print(f'  Vendor model accuracy: {vendor_metrics["accuracy"]:.1%}')

    # Full predictions for output
    yV_pred_all = rf_vendor.predict(XV)
    vendor_predictions = []
    for record, pred in zip(vendor_data, yV_pred_all):
        vendor_predictions.append({
            'vendor_id':        record['vendor_id'],
            'total_revenue':    record['total_revenue'],
            'avg_rating':       record['avg_rating'],
            'events_attended':  record['events_attended'],
            'category':         record['category'],
            'true_label':       record['top_contributor'],
            'predicted_label':  pred,
            'correct':          int(record['top_contributor'] == pred),
        })
    write_csv(
        OUTPUT_DIR / 'vendor_predictions.csv',
        vendor_predictions,
        ['vendor_id', 'total_revenue', 'avg_rating', 'events_attended',
         'category', 'true_label', 'predicted_label', 'correct']
    )

    # ── Customer model ────────────────────────────────────────────────────────
    print('Generating customer dataset (500 records)...')
    customer_data = generate_customer_dataset(500)
    write_csv(
        DATA_DIR / 'customer_dataset.csv',
        customer_data,
        ['customer_id'] + CUSTOMER_FEATURE_COLS + ['age_group', 'payment_method', 'top_spender']
    )

    XC = [[r[c] for c in CUSTOMER_FEATURE_COLS] for r in customer_data]
    yC = [r['top_spender'] for r in customer_data]

    split = int(len(XC) * 0.8)
    XC_train, XC_test = XC[:split], XC[split:]
    yC_train, yC_test = yC[:split], yC[split:]

    print('Training customer Random Forest (100 trees)...')
    rf_customer = RandomForest(n_trees=100, max_depth=8)
    rf_customer.fit(XC_train, yC_train)
    yC_pred = rf_customer.predict(XC_test)
    customer_metrics = evaluate(yC_test, yC_pred)
    print(f'  Customer model accuracy: {customer_metrics["accuracy"]:.1%}')

    yC_pred_all = rf_customer.predict(XC)
    customer_predictions = []
    for record, pred in zip(customer_data, yC_pred_all):
        customer_predictions.append({
            'customer_id':       record['customer_id'],
            'total_spend':       record['total_spend'],
            'visit_frequency':   record['visit_frequency'],
            'avg_order_value':   record['avg_order_value'],
            'age_group':         record['age_group'],
            'payment_method':    record['payment_method'],
            'true_label':        record['top_spender'],
            'predicted_label':   pred,
            'correct':           int(record['top_spender'] == pred),
        })
    write_csv(
        OUTPUT_DIR / 'customer_predictions.csv',
        customer_predictions,
        ['customer_id', 'total_spend', 'visit_frequency', 'avg_order_value',
         'age_group', 'payment_method', 'true_label', 'predicted_label', 'correct']
    )

    # ── Report ────────────────────────────────────────────────────────────────
    report = {
        'vendor_classifier': {
            'n_records':       200,
            'n_features':      len(VENDOR_FEATURE_COLS),
            'n_trees':         100,
            'train_test_split': '80/20',
            'top_20_threshold': 'total_revenue >= 80th percentile',
            **vendor_metrics,
        },
        'customer_classifier': {
            'n_records':       500,
            'n_features':      len(CUSTOMER_FEATURE_COLS),
            'n_trees':         100,
            'train_test_split': '80/20',
            'top_20_threshold': 'total_spend >= 80th percentile',
            **customer_metrics,
        },
    }
    with open(REPORT_DIR / 'admin_model_report.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2)

    # ── Summary ───────────────────────────────────────────────────────────────
    print()
    print('=' * 60)
    print('SUMMARY')
    print('=' * 60)
    print(f'Vendor model   — accuracy={vendor_metrics["accuracy"]:.1%}  '
          f'precision={vendor_metrics["precision"]:.1%}  '
          f'recall={vendor_metrics["recall"]:.1%}')
    print(f'Customer model — accuracy={customer_metrics["accuracy"]:.1%}  '
          f'precision={customer_metrics["precision"]:.1%}  '
          f'recall={customer_metrics["recall"]:.1%}')
    print(f'Outputs written to: {OUTPUT_DIR}')
    print(f'Report written to:  {REPORT_DIR / "admin_model_report.json"}')
    print('Pipeline complete.')


if __name__ == '__main__':
    main()
