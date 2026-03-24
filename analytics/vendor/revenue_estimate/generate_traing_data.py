import numpy as np
import pandas as pd
import random

# parameters

NUM_SAMPLES = 5000
OUTPUT_FILE = "pasar_malam_training_data.csv"
RANDOM_SEED = 42

# baselines
NON_FOOD_AVG_DAILY_REVENUE = 4000      # Non-food vendor average daily revenue
FOOD_REVENUE_MULTIPLIER = 1.5          # Food vendors make 50% more than non-food

# per customer money spent
FOOD_SPEND_PER_CUSTOMER = 7            # Food: more customers, less per head
NON_FOOD_SPEND_PER_CUSTOMER = 20       # Non-food: fewer customers, more per head

# day of the week (Mon=1 to Sun=7)
DAY_MULTIPLIERS = {
    1: 0.70,   # Monday
    2: 0.75,   # Tuesday
    3: 0.80,   # Wednesday
    4: 0.85,   # Thursday
    5: 1.20,   # Friday (higher traffic)
    6: 1.40,   # Saturday (weekend peak)
    7: 1.30,   # Sunday (weekend)
}

# rein
RAIN_REVENUE_PENALTY = 0.75            # rain reduces revenue to 75%

# public holiday
HOLIDAY_REVENUE_BOOST = 1.30           # public holidays boost revenue by 30%

# temperature
TEMP_MIN = 25                          # min temperature (°C)
TEMP_MAX = 35                          # max temperature (°C)
TEMP_OPTIMAL = 29                      # optimal temperature for foot traffic
TEMP_PENALTY_PER_DEGREE = 0.02         # revenue drop per degree away from optimal

# location quality rating
LOCATION_RATING_MIN = 1
LOCATION_RATING_MAX = 10
LOCATION_RATING_BASELINE = 5           # neutral rating
LOCATION_BOOST_PER_POINT = 0.05        # 5% boost per rating point above baseline

# noise
REVENUE_NOISE_STD = 0.10               # 10% standard deviation noise TODO check if this makes sense

# arteficial data generation

np.random.seed(RANDOM_SEED)
random.seed(RANDOM_SEED)

records = []

for _ in range(NUM_SAMPLES):
    # features
    week_day = random.randint(1, 7)
    is_rain = random.choices([0, 1], weights=[0.65, 0.35])[0]  # ~35% chance of rain (SG weather)
    is_public_holiday = random.choices([0, 1], weights=[0.92, 0.08])[0]
    is_food_vendor = random.choices([0, 1], weights=[0.40, 0.60])[0]  # 60% food vendors
    temperature = round(np.random.uniform(TEMP_MIN, TEMP_MAX), 1)
    event_location_rating = random.randint(LOCATION_RATING_MIN, LOCATION_RATING_MAX)

    # base revenue
    if is_food_vendor:
        base_revenue = NON_FOOD_AVG_DAILY_REVENUE * FOOD_REVENUE_MULTIPLIER
    else:
        base_revenue = NON_FOOD_AVG_DAILY_REVENUE

    # week day
    revenue = base_revenue * DAY_MULTIPLIERS[week_day]

    # rain
    if is_rain:
        revenue *= RAIN_REVENUE_PENALTY

    # public holiday
    if is_public_holiday:
        revenue *= HOLIDAY_REVENUE_BOOST

    # temperature
    temp_deviation = abs(temperature - TEMP_OPTIMAL)
    temp_factor = 1.0 - (temp_deviation * TEMP_PENALTY_PER_DEGREE)
    revenue *= temp_factor

    # location quality rating
    rating_diff = event_location_rating - LOCATION_RATING_BASELINE
    location_factor = 1.0 + (rating_diff * LOCATION_BOOST_PER_POINT)
    revenue *= location_factor

    # noise
    noise = np.random.normal(1.0, REVENUE_NOISE_STD)
    revenue *= noise
    revenue = max(revenue, 0)
    revenue = round(revenue, 2)

    # day ago revenue and customers
    yesterday_revenue = round(revenue * np.random.uniform(0.80, 1.20), 2)

    if is_food_vendor:
        yesterday_customers = round(yesterday_revenue / FOOD_SPEND_PER_CUSTOMER)
    else:
        yesterday_customers = round(yesterday_revenue / NON_FOOD_SPEND_PER_CUSTOMER)

    # prep records
    records.append({
        "week_day": week_day,
        "is_rain": is_rain,
        "is_public_holiday": is_public_holiday,
        "is_food_vendor": is_food_vendor,
        "temperature": temperature,
        "yesterday_customer_count": yesterday_customers,
        "yesterday_revenue": yesterday_revenue,
        "event_location_rating": event_location_rating,
        "today_revenue": revenue,
    })

# make pkl file with regression model

df = pd.DataFrame(records)
df.to_csv(OUTPUT_FILE, index=False)

# output

print(f" - generated {NUM_SAMPLES} samples -> {OUTPUT_FILE}")
print(f"\nsample stats:")
print(f"mean revenue (all):      ${df['today_revenue'].mean():.2f}")
print(f"mean revenue (food):     ${df[df['is_food_vendor']==1]['today_revenue'].mean():.2f}")
print(f"mean revenue (non-food): ${df[df['is_food_vendor']==0]['today_revenue'].mean():.2f}")
print(f"\nFirst 5 rows:")
print(df.head().to_string(index=False))