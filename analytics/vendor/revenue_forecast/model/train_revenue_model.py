import pandas as pd
import numpy as np
import pickle
import json
import os
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# parameters

INPUT_FILE = "../data/pasar_malam_training_data.csv"
MODEL_OUTPUT_FILE = "../output/revenue_model.pkl"
REPORT_FILE = "../report/evaluation_report.json"
TEST_SIZE = 0.20
RANDOM_SEED = 42 # answear to life
MODEL_TYPE = "gradient_boosting"
# gradient boosting params
GB_N_ESTIMATORS = 200
GB_MAX_DEPTH = 4
GB_LEARNING_RATE = 0.1


#features

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

TARGET_COLUMN = "today_revenue"

# find csv with the training data

df = pd.read_csv(INPUT_FILE)
print(f"loaded {len(df)} rows from {INPUT_FILE}\n")

X = df[FEATURE_COLUMNS]
y = df[TARGET_COLUMN]

# train and test split

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=TEST_SIZE, random_state=RANDOM_SEED
)

print(f"training samples: {len(X_train)}")
print(f"testing samples:  {len(X_test)}\n")

# training

if MODEL_TYPE == "linear":
    model = LinearRegression()
    print("training: linear regression")
elif MODEL_TYPE == "gradient_boosting":
    model = GradientBoostingRegressor(
        n_estimators=GB_N_ESTIMATORS,
        max_depth=GB_MAX_DEPTH,
        learning_rate=GB_LEARNING_RATE,
        random_state=RANDOM_SEED,
    )
    print("training: gradient boosting regressor")
else:
    raise ValueError(f"Unknown model type: {MODEL_TYPE}")

model.fit(X_train, y_train)

y_pred = model.predict(X_test)

mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2 = r2_score(y_test, y_pred)

print(f"\n - Model")
print(f"MAE  (Mean Absolute Error): ${mae:.2f}")
print(f"RMSE (Root Mean Sq Error):  ${rmse:.2f}")
print(f"R²   (Coefficient of Det.): {r2:.4f}")

# Feature importances (if available)
if hasattr(model, "feature_importances_"):
    print(f"\n - Feature Importances")
    for name, imp in sorted(
        zip(FEATURE_COLUMNS, model.feature_importances_), key=lambda x: -x[1]
    ):
        print(f"  {name:30s} {imp:.4f}")
elif hasattr(model, "coef_"):
    print(f"\n - Feature Coefficients")
    for name, coef in zip(FEATURE_COLUMNS, model.coef_):
        print(f"  {name:30s} {coef:.4f}")

# save model as pkl file

os.makedirs(os.path.dirname(MODEL_OUTPUT_FILE), exist_ok=True)
with open(MODEL_OUTPUT_FILE, "wb") as f:
    pickle.dump(model, f)

print(f"\nmodel saved to {MODEL_OUTPUT_FILE}")

# save evaluation report

feature_importances = {}
if hasattr(model, "feature_importances_"):
    feature_importances = dict(zip(FEATURE_COLUMNS, [round(float(v), 4) for v in model.feature_importances_]))
elif hasattr(model, "coef_"):
    feature_importances = dict(zip(FEATURE_COLUMNS, [round(float(v), 4) for v in model.coef_]))

report = {
    "model": MODEL_TYPE,
    "training_samples": len(X_train),
    "testing_samples": len(X_test),
    "metrics": {
        "mae": round(float(mae), 2),
        "rmse": round(float(rmse), 2),
        "r2": round(float(r2), 4),
    },
    "feature_importances": feature_importances,
}

os.makedirs(os.path.dirname(REPORT_FILE), exist_ok=True)
with open(REPORT_FILE, "w") as f:
    json.dump(report, f, indent=2)

print(f"report saved to {REPORT_FILE}")