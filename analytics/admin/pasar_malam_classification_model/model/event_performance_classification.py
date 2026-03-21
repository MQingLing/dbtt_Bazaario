"""
event_performance_classification.py
Bazaario — Event Performance Classification Pipeline

Generates 50 synthetic pasar malam event records with 12 features,
assigns Tier A / B / C labels via composite score, trains a multi-class
Random Forest (60 trees) from scratch, and saves all results.

Composite score:
  35% revenue score  +  25% avg rating  +  20% sentiment  +  20% repeat vendor rate

Tiers:
  A (top 30%)    — Retain & Expand
  B (middle 40%) — Retain & Improve
  C (bottom 30%) — Review or Drop

Stdlib only — no external dependencies required.
Run: python -X utf8 analytics/admin/pasar_malam_classification_model/model/event_performance_classification.py
"""

import csv
import json
import math
import random
from collections import Counter
from pathlib import Path

# ── Paths ─────────────────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).resolve().parent
DATA_DIR   = SCRIPT_DIR.parent / 'data'
OUTPUT_DIR = SCRIPT_DIR.parent / 'output'
REPORT_DIR = SCRIPT_DIR.parent / 'report'

for d in (DATA_DIR, OUTPUT_DIR, REPORT_DIR):
    d.mkdir(parents=True, exist_ok=True)

random.seed(42)

# ── Event names ───────────────────────────────────────────────────────────────
EVENT_NAMES = [
    'Geylang Serai Ramadan Bazaar', 'Chinatown CNY Night Market',
    'Tampines Pasar Malam', 'Yishun Night Market', 'Jurong West Pasar Malam',
    'Bedok Interchange Night Market', 'Sengkang Pasar Malam',
    'Woodlands Town Fair', 'Ang Mo Kio Night Festival', 'Toa Payoh Pasar Malam',
    'Punggol Waterway Night Market', 'Bishan Pasar Malam',
    'Clementi Night Market', 'Queenstown Pasar Malam', 'Bukit Batok Night Fair',
    'Choa Chu Kang Pasar Malam', 'Hougang Night Market',
    'Pasir Ris Pasar Malam', 'Sembawang Pasar Malam', 'Buona Vista Night Fair',
    'Kallang Pasar Malam', 'Marine Parade Night Market',
    'Telok Blangah Pasar Malam', 'Redhill Night Fair', 'Tiong Bahru Pasar Malam',
    'Novena Night Market', 'Newton Pasar Malam', 'Orchard Night Bazaar',
    'Dhoby Ghaut Night Market', 'Bras Basah Night Fair',
    'Tanjong Pagar Pasar Malam', 'Lavender Night Market',
    'Geylang Bazaar (Mid-Autumn)', 'Bugis Street Night Festival',
    'Little India Deepavali Bazaar', 'Arab Street Hari Raya Fair',
    'Katong Pasar Malam', 'Siglap Night Market',
    'East Coast Pasar Malam', 'Changi Village Night Fair',
    'Loyang Pasar Malam', 'Tampines Central Night Market',
    'Simei Night Fair', 'Bedok North Pasar Malam',
    'Ubi Night Market', 'Kembangan Pasar Malam',
    'Paya Lebar Night Market', 'Eunos Night Fair',
    'Kovan Pasar Malam', 'Serangoon Gardens Night Market',
]

LOCATIONS = ['North', 'South', 'East', 'West', 'Central']


# ── Generate event dataset ────────────────────────────────────────────────────
def generate_event_dataset(n: int = 50) -> list[dict]:
    records = []
    for i in range(n):
        total_vendors   = random.randint(20, 150)
        total_revenue   = round(random.uniform(10000, 500000), 2)
        avg_rating      = round(random.uniform(3.0, 5.0), 2)
        sentiment_score = round(random.uniform(-0.5, 1.0), 4)
        repeat_vendor_rate = round(random.uniform(0.1, 0.9), 3)
        records.append({
            'event_id':            f'EVT{i+1:03d}',
            'event_name':          EVENT_NAMES[i % len(EVENT_NAMES)],
            'location':            random.choice(LOCATIONS),
            'total_revenue':       total_revenue,
            'avg_rating':          avg_rating,
            'total_vendors':       total_vendors,
            'repeat_vendor_rate':  repeat_vendor_rate,
            'sentiment_score':     sentiment_score,
            'total_visitors':      random.randint(500, 50000),
            'duration_days':       random.randint(1, 30),
            'food_vendor_ratio':   round(random.uniform(0.3, 0.8), 3),
            'marketing_spend':     round(random.uniform(500, 20000), 2),
            'incident_count':      random.randint(0, 10),
        })

    # Compute composite score
    max_rev = max(r['total_revenue'] for r in records)
    min_rev = min(r['total_revenue'] for r in records)

    for r in records:
        rev_norm  = (r['total_revenue'] - min_rev) / max(max_rev - min_rev, 1)
        rat_norm  = (r['avg_rating'] - 1.0) / 4.0
        sent_norm = (r['sentiment_score'] + 1.0) / 2.0
        rvr_norm  = r['repeat_vendor_rate']
        composite = (
            0.35 * rev_norm +
            0.25 * rat_norm +
            0.20 * sent_norm +
            0.20 * rvr_norm
        )
        r['composite_score'] = round(composite, 4)

    # Assign tiers based on percentile
    sorted_scores = sorted(r['composite_score'] for r in records)
    top_thresh    = sorted_scores[int(n * 0.70)]  # top 30% = A
    bot_thresh    = sorted_scores[int(n * 0.30)]  # bottom 30% = C

    for r in records:
        if r['composite_score'] >= top_thresh:
            r['tier'] = 'A'
            r['tier_label'] = 'Retain & Expand'
        elif r['composite_score'] < bot_thresh:
            r['tier'] = 'C'
            r['tier_label'] = 'Review or Drop'
        else:
            r['tier'] = 'B'
            r['tier_label'] = 'Retain & Improve'

    return records


# ── CART / Random Forest (multi-class) ───────────────────────────────────────
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
        for k in range(len(values) - 1):
            thresh = (values[k] + values[k + 1]) / 2
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
        self.value = None


def _build(X: list[list], y: list, max_depth: int, min_samples: int,
           n_features: int, depth: int = 0) -> _Node:
    node = _Node()
    if depth >= max_depth or len(y) < min_samples or len(set(y)) == 1:
        node.value = Counter(y).most_common(1)[0][0]
        return node
    feat_idx = random.sample(range(len(X[0])), k=min(n_features, len(X[0])))
    feat, thresh = _best_split(X, y, feat_idx)
    if feat is None:
        node.value = Counter(y).most_common(1)[0][0]
        return node
    node.feature, node.threshold = feat, thresh
    lm = [i for i in range(len(y)) if X[i][feat] <= thresh]
    rm = [i for i in range(len(y)) if X[i][feat] >  thresh]
    node.left  = _build([X[i] for i in lm], [y[i] for i in lm], max_depth, min_samples, n_features, depth + 1)
    node.right = _build([X[i] for i in rm], [y[i] for i in rm], max_depth, min_samples, n_features, depth + 1)
    return node


def _predict_one(node: _Node, x: list):
    if node.value is not None:
        return node.value
    return _predict_one(node.left if x[node.feature] <= node.threshold else node.right, x)


class RandomForestMulti:
    def __init__(self, n_trees: int = 60, max_depth: int = 6, min_samples: int = 2):
        self.n_trees = n_trees
        self.max_depth = max_depth
        self.min_samples = min_samples
        self.trees: list[_Node] = []

    def fit(self, X: list[list], y: list) -> None:
        n = len(X)
        n_feat = max(1, int(math.sqrt(len(X[0]))))
        self.trees = []
        for _ in range(self.n_trees):
            idx = [random.randint(0, n - 1) for _ in range(n)]
            Xb, yb = [X[i] for i in idx], [y[i] for i in idx]
            self.trees.append(_build(Xb, yb, self.max_depth, self.min_samples, n_feat))

    def predict(self, X: list[list]) -> list:
        return [Counter(_predict_one(t, x) for t in self.trees).most_common(1)[0][0] for x in X]


# ── Evaluation ────────────────────────────────────────────────────────────────
def accuracy(y_true: list, y_pred: list) -> float:
    return sum(t == p for t, p in zip(y_true, y_pred)) / len(y_true)


# ── CSV helper ────────────────────────────────────────────────────────────────
def write_csv(path: Path, rows: list[dict], fieldnames: list[str]) -> None:
    with open(path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


# ── Main ──────────────────────────────────────────────────────────────────────
FEATURE_COLS = [
    'total_revenue', 'avg_rating', 'total_vendors', 'repeat_vendor_rate',
    'sentiment_score', 'total_visitors', 'duration_days', 'food_vendor_ratio',
    'marketing_spend', 'incident_count', 'composite_score',
]


def main() -> None:
    print('Generating event dataset (50 records)...')
    events = generate_event_dataset(50)

    all_fields = (
        ['event_id', 'event_name', 'location'] +
        FEATURE_COLS +
        ['tier', 'tier_label']
    )
    write_csv(DATA_DIR / 'event_dataset.csv', events, all_fields)
    print(f'  Dataset saved to {DATA_DIR / "event_dataset.csv"}')

    X = [[r[c] for c in FEATURE_COLS] for r in events]
    y = [r['tier'] for r in events]

    # 80/20 split
    split = int(len(X) * 0.8)
    X_train, X_test = X[:split], X[split:]
    y_train, y_test = y[:split], y[split:]

    print('Training event classification Random Forest (60 trees)...')
    rf = RandomForestMulti(n_trees=60, max_depth=6)
    rf.fit(X_train, y_train)
    y_pred_test = rf.predict(X_test)
    acc = accuracy(y_test, y_pred_test)
    print(f'  Accuracy: {acc:.1%}')

    # Full predictions
    y_pred_all = rf.predict(X)
    results = []
    tier_map = {'A': 'Retain & Expand', 'B': 'Retain & Improve', 'C': 'Review or Drop'}
    for record, pred in zip(events, y_pred_all):
        results.append({
            'event_id':          record['event_id'],
            'event_name':        record['event_name'],
            'location':          record['location'],
            'total_revenue':     record['total_revenue'],
            'avg_rating':        record['avg_rating'],
            'composite_score':   record['composite_score'],
            'true_tier':         record['tier'],
            'predicted_tier':    pred,
            'predicted_action':  tier_map.get(pred, ''),
            'correct':           int(record['tier'] == pred),
        })
    write_csv(
        OUTPUT_DIR / 'event_classification_results.csv',
        results,
        ['event_id', 'event_name', 'location', 'total_revenue', 'avg_rating',
         'composite_score', 'true_tier', 'predicted_tier', 'predicted_action', 'correct']
    )

    tier_dist = Counter(r['tier'] for r in events)
    report = {
        'n_events':     50,
        'n_features':   len(FEATURE_COLS),
        'n_trees':      60,
        'max_depth':    6,
        'train_test_split': '80/20',
        'composite_weights': {
            'revenue': 0.35,
            'rating':  0.25,
            'sentiment': 0.20,
            'repeat_vendor_rate': 0.20,
        },
        'tier_distribution': {
            'A (Retain & Expand)':   tier_dist.get('A', 0),
            'B (Retain & Improve)':  tier_dist.get('B', 0),
            'C (Review or Drop)':    tier_dist.get('C', 0),
        },
        'accuracy': round(acc, 4),
    }
    with open(REPORT_DIR / 'event_model_report.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2)

    print()
    print('=' * 60)
    print('SUMMARY')
    print('=' * 60)
    print(f'Events classified : 50')
    print(f'Tier A (Retain & Expand)  : {tier_dist.get("A", 0)}')
    print(f'Tier B (Retain & Improve) : {tier_dist.get("B", 0)}')
    print(f'Tier C (Review or Drop)   : {tier_dist.get("C", 0)}')
    print(f'Model accuracy            : {acc:.1%}')
    print(f'Outputs written to: {OUTPUT_DIR}')
    print(f'Report written to:  {REPORT_DIR / "event_model_report.json"}')
    print('Pipeline complete.')


if __name__ == '__main__':
    main()
