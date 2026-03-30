import pickle
import pandas as pd

# find model

MODEL_FILE = "../output/revenue_model.pkl"

with open(MODEL_FILE, "rb") as f:
    model = pickle.load(f)

print(f"model loaded from {MODEL_FILE}\n")

# example scenarios

scenarios = [
    {
        "label": "Saturday, Food Vendor, Good Location, No Rain",
        "week_day": 6,                    # 1=Mon, 2=Tue, ..., 6=Sat, 7=Sun
        "is_rain": 0,                     # 0=No, 1=Yes
        "is_public_holiday": 0,           # 0=No, 1=Yes
        "is_food_vendor": 1,              # 0=Non-food, 1=Food
        "temperature": 29.0,              # Celsius
        "yesterday_customer_count": 800,  # Number of customers yesterday
        "yesterday_revenue": 5600.00,     # Revenue yesterday ($)
        "event_location_rating": 8,       # 1 (worst) to 10 (best)
    },
    {
        "label": "Monday, Non-Food Vendor, Rain, Low Rating",
        "week_day": 1,
        "is_rain": 1,
        "is_public_holiday": 0,
        "is_food_vendor": 0,
        "temperature": 32.0,
        "yesterday_customer_count": 120,
        "yesterday_revenue": 2400.00,
        "event_location_rating": 3,
    },
    {
        "label": "Friday, Food Vendor, Public Holiday, Great Location",
        "week_day": 5,
        "is_rain": 0,
        "is_public_holiday": 1,
        "is_food_vendor": 1,
        "temperature": 28.5,
        "yesterday_customer_count": 1000,
        "yesterday_revenue": 7000.00,
        "event_location_rating": 9,
    },
    {
        "label": "Wednesday, Non-Food Vendor, No Rain, Average Location",
        "week_day": 3,
        "is_rain": 0,
        "is_public_holiday": 0,
        "is_food_vendor": 0,
        "temperature": 30.0,
        "yesterday_customer_count": 180,
        "yesterday_revenue": 3600.00,
        "event_location_rating": 5,
    },
]

# features ; MTACHING ORDER VERY IMPORTANT

FEATURE_COLUMNS = [
    "week_day",
    "is_rain",
    "is_public_holiday",
    "is_food_vendor",
    "temperature",
    "yesterday_customer_count",
    "yesterday_revenue",
    "event_location_rating",
]

# calculate and output

print("Vendors Revenue Predictions")

for scenario in scenarios:
    label = scenario["label"]
    features = {k: scenario[k] for k in FEATURE_COLUMNS}

    input_df = pd.DataFrame([features])
    predicted_revenue = model.predict(input_df)[0]

    print(f"\n {label}")
    print(f"features: {features}")
    print(f"tomorrow's predicted revenue: ${predicted_revenue:,.2f}")