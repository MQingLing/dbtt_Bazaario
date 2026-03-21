"""
vendor_sentiment_pipeline.py
Bazaario — Vendor Sentiment Analysis Pipeline

Generates synthetic order and review data for 20 vendors over 90 days,
trains a Naive Bayes sentiment classifier, computes VADER-style compound
scores, calculates composite business health scores, and ranks bestsellers.

Stdlib only — no external dependencies required.
Run: python -X utf8 analytics/vendor/products_sentiment_analysis/model/vendor_sentiment_pipeline.py
"""

import csv
import math
import os
import random
import json
from collections import defaultdict
from datetime import date, timedelta
from pathlib import Path

# ── Paths ─────────────────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).resolve().parent
DATA_DIR   = SCRIPT_DIR.parent / 'data'
OUTPUT_DIR = SCRIPT_DIR.parent / 'output'
REPORT_DIR = SCRIPT_DIR.parent / 'report'

for d in (DATA_DIR, OUTPUT_DIR, REPORT_DIR):
    d.mkdir(parents=True, exist_ok=True)

# ── Seed ──────────────────────────────────────────────────────────────────────
random.seed(42)

# ── Config ────────────────────────────────────────────────────────────────────
VENDORS = [
    {'id': f'V{i:02d}', 'name': name, 'category': cat}
    for i, (name, cat) in enumerate([
        ("Wong's Satay",        'Food'),
        ('Nasi Lemak Express',  'Food'),
        ('Bubble Tea Paradise', 'Drinks'),
        ('Artisan Crafts',      'Products'),
        ('Golden Snacks',       'Food'),
        ('Spice Junction',      'Food'),
        ('Henna Art Studio',    'Services'),
        ('Fresh Juice Bar',     'Drinks'),
        ('Tech Gadgets',        'Products'),
        ('Home Decor Hub',      'Products'),
        ('Dumpling Master',     'Food'),
        ('Ice Cream Joy',       'Desserts'),
        ('Fashion Finds',       'Products'),
        ('Grilled Perfection',  'Food'),
        ('Tea Corner',          'Drinks'),
        ('Plant Shop',          'Products'),
        ('Snack Haven',         'Food'),
        ('Sweet Treats',        'Desserts'),
        ('Accessories Hub',     'Products'),
        ('Coffee & More',       'Drinks'),
    ], start=1)
]

EVENTS = [
    {'id': 'E01', 'name': 'Geylang Serai Ramadan Bazaar'},
    {'id': 'E02', 'name': 'Chinatown CNY Night Market'},
    {'id': 'E03', 'name': 'Tampines Pasar Malam'},
    {'id': 'E04', 'name': 'Yishun Night Market'},
    {'id': 'E05', 'name': 'Jurong West Pasar Malam'},
]

PRODUCTS_BY_CATEGORY = {
    'Food':     ['Satay (10 sticks)', 'Mixed Platter', 'Fried Rice', 'Noodles', 'BBQ Skewer'],
    'Drinks':   ['Bubble Tea', 'Fresh Juice', 'Iced Coffee', 'Coconut Water', 'Lemonade'],
    'Desserts': ['Ice Cream', 'Waffles', 'Churros', 'Mochi', 'Tart'],
    'Products': ['Handmade Bag', 'Phone Case', 'Keychain', 'Fridge Magnet', 'Tote Bag'],
    'Services': ['Henna Design (S)', 'Henna Design (L)', 'Face Paint', 'Caricature', 'Massage'],
}

START_DATE = date(2026, 1, 1)
END_DATE   = date(2026, 3, 31)
DAYS       = (END_DATE - START_DATE).days + 1

# ── Positive / Negative word lexicon ─────────────────────────────────────────
POSITIVE_WORDS = {
    'amazing', 'excellent', 'great', 'fantastic', 'wonderful', 'delicious',
    'perfect', 'love', 'loved', 'best', 'good', 'nice', 'fresh', 'tasty',
    'authentic', 'recommend', 'friendly', 'quick', 'satisfied', 'happy',
    'outstanding', 'superb', 'enjoy', 'enjoyed', 'crispy', 'juicy', 'tender',
    'generous', 'value', 'affordable', 'clean', 'helpful', 'prompt',
}

NEGATIVE_WORDS = {
    'bad', 'terrible', 'awful', 'poor', 'disappointing', 'slow', 'cold',
    'overpriced', 'expensive', 'rude', 'dirty', 'stale', 'soggy', 'bland',
    'mediocre', 'avoid', 'worst', 'horrible', 'disgusting', 'undercooked',
    'wait', 'long', 'queue', 'small', 'tiny', 'thin', 'tasteless', 'salty',
    'greasy', 'tough', 'dry', 'unfriendly', 'ignored', 'forgot',
}

NEUTRAL_PHRASES = [
    'okay', 'average', 'normal', 'standard', 'expected', 'alright', 'fine',
    'decent', 'nothing special', 'just okay', 'not bad', 'passable',
]

REVIEW_TEMPLATES_POS = [
    'Absolutely {adj}! The {product} was {adj2} and worth every cent.',
    'Really {adj} experience. Will definitely come back for more {product}.',
    'The {product} here is {adj} — so {adj2} and {adj3}!',
    'Loved the {product}. {adj} quality and {adj2} service.',
    'Best {product} I have had at a pasar malam. Highly recommend!',
    'So {adj}! The {product} was {adj2} and the portion was generous.',
    'Great value for money. The {product} tasted {adj} and {adj2}.',
]

REVIEW_TEMPLATES_NEG = [
    'The {product} was {adj}. Very {adj2} and not worth the price.',
    'Disappointing visit. The {product} was {adj} and {adj2}.',
    'Expected better. The {product} tasted {adj} and the service was {adj2}.',
    'Would not recommend. The {product} was {adj}.',
    'The queue was long and the {product} was just {adj}.',
    'Overpriced and the {product} was {adj}. Will not return.',
]

REVIEW_TEMPLATES_NEU = [
    'The {product} was okay. Nothing special but not bad either.',
    'Average experience. The {product} was alright.',
    'Decent {product}. Expected more for the price.',
    'Fine for a pasar malam stall. The {product} was normal.',
    'Not bad, not great. The {product} was just okay.',
]

POS_ADJ  = ['amazing', 'fantastic', 'delicious', 'great', 'excellent', 'wonderful', 'tasty', 'juicy', 'crispy', 'tender']
POS_ADJ2 = ['fresh', 'authentic', 'flavourful', 'perfectly cooked', 'generous', 'affordable', 'quick']
POS_ADJ3 = ['satisfying', 'worth it', 'full of flavour', 'well-seasoned']
NEG_ADJ  = ['bad', 'disappointing', 'overpriced', 'bland', 'cold', 'stale', 'tough', 'soggy', 'dry', 'tasteless']
NEG_ADJ2 = ['slow', 'unfriendly', 'mediocre', 'not fresh', 'poorly cooked', 'greasy']


def _make_review_text(sentiment: str, product: str) -> str:
    if sentiment == 'positive':
        tmpl = random.choice(REVIEW_TEMPLATES_POS)
        return tmpl.format(
            adj=random.choice(POS_ADJ),
            adj2=random.choice(POS_ADJ2),
            adj3=random.choice(POS_ADJ3),
            product=product,
        )
    elif sentiment == 'negative':
        tmpl = random.choice(REVIEW_TEMPLATES_NEG)
        return tmpl.format(
            adj=random.choice(NEG_ADJ),
            adj2=random.choice(NEG_ADJ2),
            product=product,
        )
    else:
        tmpl = random.choice(REVIEW_TEMPLATES_NEU)
        return tmpl.format(product=product)


# ── Generate Orders ───────────────────────────────────────────────────────────
def generate_orders() -> list[dict]:
    orders = []
    order_id = 1
    for vendor in VENDORS:
        products = PRODUCTS_BY_CATEGORY.get(vendor['category'], ['Item'])
        base_daily = random.randint(8, 25)
        for day_offset in range(DAYS):
            current_date = START_DATE + timedelta(days=day_offset)
            is_weekend = current_date.weekday() >= 4  # Fri-Sun
            daily_orders = int(base_daily * (1.5 if is_weekend else 1.0))
            daily_orders += random.randint(-3, 5)
            daily_orders = max(1, daily_orders)
            event = random.choice(EVENTS)
            for _ in range(daily_orders):
                product = random.choice(products)
                price = round(random.uniform(2.0, 30.0), 2)
                qty = random.choices([1, 2, 3, 4, 5], weights=[50, 30, 10, 7, 3])[0]
                orders.append({
                    'order_id':    f'ORD{order_id:06d}',
                    'vendor_id':   vendor['id'],
                    'vendor_name': vendor['name'],
                    'event_id':    event['id'],
                    'event_name':  event['name'],
                    'product_name': product,
                    'quantity':    qty,
                    'price':       price,
                    'total':       round(price * qty, 2),
                    'date':        current_date.isoformat(),
                    'customer_id': f'C{random.randint(1, 5000):05d}',
                })
                order_id += 1
    return orders


# ── Generate Reviews ──────────────────────────────────────────────────────────
def generate_reviews(orders: list[dict]) -> list[dict]:
    reviews = []
    review_id = 1
    # ~25% of orders get a review
    sampled = random.sample(orders, k=int(len(orders) * 0.25))
    for order in sampled:
        # Sentiment distribution: ~65% positive, 20% neutral, 15% negative
        sentiment = random.choices(
            ['positive', 'neutral', 'negative'],
            weights=[65, 20, 15]
        )[0]
        if sentiment == 'positive':
            rating = random.choices([4, 5], weights=[30, 70])[0]
        elif sentiment == 'neutral':
            rating = random.choices([3, 4], weights=[70, 30])[0]
        else:
            rating = random.choices([1, 2, 3], weights=[30, 50, 20])[0]

        text = _make_review_text(sentiment, order['product_name'])
        reviews.append({
            'review_id':    f'REV{review_id:06d}',
            'vendor_id':    order['vendor_id'],
            'vendor_name':  order['vendor_name'],
            'order_id':     order['order_id'],
            'customer_id':  order['customer_id'],
            'product_name': order['product_name'],
            'rating':       rating,
            'review_text':  text,
            'sentiment_label': sentiment,
            'date':         order['date'],
        })
        review_id += 1
    return reviews


# ── Naive Bayes Classifier ────────────────────────────────────────────────────
class NaiveBayesSentiment:
    def __init__(self):
        self.class_log_prior: dict[str, float] = {}
        self.feature_log_prob: dict[str, dict[str, float]] = {}
        self.classes = ['positive', 'neutral', 'negative']

    def _tokenize(self, text: str) -> list[str]:
        return text.lower().replace(',', '').replace('.', '').replace('!', '').split()

    def fit(self, texts: list[str], labels: list[str]) -> None:
        counts: dict[str, dict[str, int]] = {c: defaultdict(int) for c in self.classes}
        class_counts: dict[str, int] = defaultdict(int)
        vocab: set[str] = set()
        for text, label in zip(texts, labels):
            tokens = self._tokenize(text)
            class_counts[label] += 1
            for tok in tokens:
                counts[label][tok] += 1
                vocab.add(tok)
        total = sum(class_counts.values())
        for c in self.classes:
            self.class_log_prior[c] = math.log(class_counts[c] / total)
        vocab_size = len(vocab)
        for c in self.classes:
            total_words = sum(counts[c].values())
            self.feature_log_prob[c] = {}
            for word in vocab:
                self.feature_log_prob[c][word] = math.log(
                    (counts[c][word] + 1) / (total_words + vocab_size)
                )
            self.feature_log_prob[c]['__unk__'] = math.log(1 / (total_words + vocab_size))

    def predict(self, text: str) -> str:
        tokens = self._tokenize(text)
        scores: dict[str, float] = {}
        for c in self.classes:
            score = self.class_log_prior[c]
            for tok in tokens:
                score += self.feature_log_prob[c].get(tok, self.feature_log_prob[c]['__unk__'])
            scores[c] = score
        return max(scores, key=scores.__getitem__)

    def predict_batch(self, texts: list[str]) -> list[str]:
        return [self.predict(t) for t in texts]


# ── VADER-style compound score ────────────────────────────────────────────────
def vader_compound(text: str) -> float:
    tokens = text.lower().split()
    score = 0.0
    for tok in tokens:
        clean = tok.strip('.,!?')
        if clean in POSITIVE_WORDS:
            score += 0.9
        elif clean in NEGATIVE_WORDS:
            score -= 0.8
    # Normalise to [-1, +1]
    alpha = 15
    normalised = score / math.sqrt(score ** 2 + alpha)
    return round(normalised, 4)


# ── Business Health Score ─────────────────────────────────────────────────────
def compute_health(vendor_id: str, orders: list[dict], reviews: list[dict]) -> dict:
    v_orders  = [o for o in orders  if o['vendor_id'] == vendor_id]
    v_reviews = [r for r in reviews if r['vendor_id'] == vendor_id]

    if not v_orders:
        return {}

    # Split orders into two halves for trend
    sorted_orders = sorted(v_orders, key=lambda x: x['date'])
    mid = len(sorted_orders) // 2
    first_half  = sorted_orders[:mid]
    second_half = sorted_orders[mid:]

    rev_first  = sum(float(o['total']) for o in first_half)
    rev_second = sum(float(o['total']) for o in second_half)
    revenue_trend = ((rev_second - rev_first) / max(rev_first, 1)) * 100

    ord_first  = len(first_half)
    ord_second = len(second_half)
    order_trend = ((ord_second - ord_first) / max(ord_first, 1)) * 100

    avg_rating   = (sum(int(r['rating']) for r in v_reviews) / len(v_reviews)) if v_reviews else 3.0
    avg_compound = (sum(vader_compound(r['review_text']) for r in v_reviews) / len(v_reviews)) if v_reviews else 0.0

    # Normalise each component to 0-100
    norm_revenue  = min(100, max(0, 50 + revenue_trend))
    norm_rating   = (avg_rating - 1) / 4 * 100
    norm_sentiment = (avg_compound + 1) / 2 * 100
    norm_order    = min(100, max(0, 50 + order_trend))

    health_score = (
        0.30 * norm_revenue +
        0.25 * norm_rating +
        0.25 * norm_sentiment +
        0.20 * norm_order
    )
    health_score = round(health_score, 2)

    if health_score >= 85:
        label = 'Excellent'
    elif health_score >= 70:
        label = 'Thriving'
    elif health_score >= 55:
        label = 'Stable'
    else:
        label = 'Needs Attention'

    vendor = next(v for v in VENDORS if v['id'] == vendor_id)
    return {
        'vendor_id':       vendor_id,
        'vendor_name':     vendor['name'],
        'category':        vendor['category'],
        'total_orders':    len(v_orders),
        'total_revenue':   round(sum(float(o['total']) for o in v_orders), 2),
        'total_reviews':   len(v_reviews),
        'avg_rating':      round(avg_rating, 3),
        'avg_compound':    round(avg_compound, 4),
        'revenue_trend':   round(revenue_trend, 2),
        'order_trend':     round(order_trend, 2),
        'health_score':    health_score,
        'health_label':    label,
    }


# ── Bestsellers ───────────────────────────────────────────────────────────────
def compute_bestsellers(vendor_id: str, orders: list[dict]) -> list[dict]:
    v_orders = [o for o in orders if o['vendor_id'] == vendor_id]
    product_stats: dict[str, dict] = defaultdict(lambda: {'units': 0, 'revenue': 0.0})
    for o in v_orders:
        product_stats[o['product_name']]['units'] += int(o['quantity'])
        product_stats[o['product_name']]['revenue'] += float(o['total'])
    vendor = next(v for v in VENDORS if v['id'] == vendor_id)
    ranked = sorted(product_stats.items(), key=lambda x: x[1]['units'], reverse=True)
    return [
        {
            'vendor_id':    vendor_id,
            'vendor_name':  vendor['name'],
            'rank':         rank + 1,
            'product_name': name,
            'units_sold':   stats['units'],
            'total_revenue': round(stats['revenue'], 2),
        }
        for rank, (name, stats) in enumerate(ranked)
    ]


# ── Write CSV helper ──────────────────────────────────────────────────────────
def write_csv(path: Path, rows: list[dict], fieldnames: list[str]) -> None:
    with open(path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


# ── Main ──────────────────────────────────────────────────────────────────────
def main() -> None:
    print('Generating synthetic order data...')
    orders = generate_orders()
    print(f'  {len(orders):,} orders generated')

    print('Generating synthetic review data...')
    reviews = generate_reviews(orders)
    print(f'  {len(reviews):,} reviews generated')

    # Save raw data
    write_csv(
        DATA_DIR / 'vendor_orders.csv',
        orders,
        ['order_id', 'vendor_id', 'vendor_name', 'event_id', 'event_name',
         'product_name', 'quantity', 'price', 'total', 'date', 'customer_id']
    )
    write_csv(
        DATA_DIR / 'vendor_reviews.csv',
        reviews,
        ['review_id', 'vendor_id', 'vendor_name', 'order_id', 'customer_id',
         'product_name', 'rating', 'review_text', 'sentiment_label', 'date']
    )
    print(f'  Raw data saved to {DATA_DIR}')

    # Train Naive Bayes
    print('Training Naive Bayes sentiment classifier...')
    nb = NaiveBayesSentiment()
    train_texts  = [r['review_text']    for r in reviews]
    train_labels = [r['sentiment_label'] for r in reviews]
    nb.fit(train_texts, train_labels)

    # Predict (using training set for demonstration — no separate test split)
    print('Running sentiment predictions...')
    predicted_labels = nb.predict_batch(train_texts)
    correct = sum(p == t for p, t in zip(predicted_labels, train_labels))
    accuracy = correct / len(train_labels)

    sentiment_results = []
    for review, pred in zip(reviews, predicted_labels):
        sentiment_results.append({
            'review_id':         review['review_id'],
            'vendor_id':         review['vendor_id'],
            'product_name':      review['product_name'],
            'rating':            review['rating'],
            'true_sentiment':    review['sentiment_label'],
            'predicted_sentiment': pred,
            'compound_score':    vader_compound(review['review_text']),
            'date':              review['date'],
        })

    write_csv(
        OUTPUT_DIR / 'vendor_sentiment_results.csv',
        sentiment_results,
        ['review_id', 'vendor_id', 'product_name', 'rating',
         'true_sentiment', 'predicted_sentiment', 'compound_score', 'date']
    )
    print(f'  Classifier accuracy: {accuracy:.1%}')

    # Business health
    print('Computing business health scores...')
    health_rows = []
    for vendor in VENDORS:
        h = compute_health(vendor['id'], orders, reviews)
        if h:
            health_rows.append(h)

    write_csv(
        REPORT_DIR / 'vendor_business_health.csv',
        health_rows,
        ['vendor_id', 'vendor_name', 'category', 'total_orders', 'total_revenue',
         'total_reviews', 'avg_rating', 'avg_compound', 'revenue_trend',
         'order_trend', 'health_score', 'health_label']
    )

    # Bestsellers
    print('Computing bestseller rankings...')
    bestseller_rows = []
    for vendor in VENDORS:
        bestseller_rows.extend(compute_bestsellers(vendor['id'], orders))

    write_csv(
        OUTPUT_DIR / 'vendor_bestsellers.csv',
        bestseller_rows,
        ['vendor_id', 'vendor_name', 'rank', 'product_name', 'units_sold', 'total_revenue']
    )

    # Summary
    print()
    print('=' * 60)
    print('SUMMARY')
    print('=' * 60)
    print(f'Total orders generated : {len(orders):>10,}')
    print(f'Total reviews generated: {len(reviews):>10,}')
    print(f'NB classifier accuracy : {accuracy:>10.1%}')
    print()
    print('Top 5 Healthiest Vendors:')
    for row in sorted(health_rows, key=lambda x: x['health_score'], reverse=True)[:5]:
        print(f"  {row['vendor_name']:<25} {row['health_label']:<15} score={row['health_score']}")
    print()
    print(f'Outputs written to:')
    print(f'  {DATA_DIR}')
    print(f'  {OUTPUT_DIR}')
    print(f'  {REPORT_DIR}')
    print('Pipeline complete.')


if __name__ == '__main__':
    main()
