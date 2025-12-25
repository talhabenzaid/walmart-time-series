from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import pandas as pd
import joblib
from tensorflow import keras

# source venv/bin/activate
# uvicorn CreatAPI:app --reload

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = keras.models.load_model("../module/walmart_lstm_model.h5", compile=False)
scaler_X = joblib.load("../module/scaler_X.pkl")
scaler_y = joblib.load("../module/scaler_y.pkl")
df = pd.read_csv("../Data/NewTrain.csv")

@app.get("/stores")
def get_stores():
    return {"stores": sorted(df['Store'].unique().tolist())}

@app.get("/depts")
def get_depts():
    return {"depts": sorted(df['Dept'].unique().tolist())}

@app.get("/sales/{store}/{dept}")
def get_sales(store: int, dept: int):
    try:
        filtered = df[(df['Store'] == store) & (df['Dept'] == dept)].copy()

        filtered = filtered.sort_values('Date')
        feature_cols = ['Store', 'Dept', 'Type', 'Size', 'Temperature', 'Fuel_Price', 'CPI', 'Unemployment',
                        'MarkDown1', 'MarkDown2', 'MarkDown3', 'MarkDown4', 'MarkDown5',
                        'IsHoliday', 'year', 'month', 'week', 'day_of_year',
                        'lag_1', 'lag_2', 'lag_3', 'lag_4', 'roll_4', 'roll_8']
        
        predictions = []
        for i in range(4, min(len(filtered), 50)):
            X = filtered[feature_cols].iloc[i-4:i].values
            X_scaled = scaler_X.transform(X)
            X_seq = X_scaled.reshape(1, 4, X_scaled.shape[1])
            pred = model.predict(X_seq, verbose=0)
            pred = scaler_y.inverse_transform(pred)[0][0]
            predictions.append(float(pred))
        
        split_idx = int(len(predictions) * 0.8)
        
        actual_for_chart = [float(x) for x in filtered['Weekly_Sales'].iloc[4:4+split_idx].tolist()]
        actual_for_chart += [None] * (len(predictions) - split_idx)
        
        actual_full = [float(x) for x in filtered['Weekly_Sales'].iloc[4:4+len(predictions)].tolist()]
        
        return {
            "dates": filtered['Date'].iloc[4:4+len(predictions)].tolist(),
            "actual": actual_for_chart,
            "actual_full": actual_full,
            "predicted": predictions
        }
    except Exception as e:
        print(f"Error: {e}")
        return {"dates": [], "actual": [], "predicted": []}
