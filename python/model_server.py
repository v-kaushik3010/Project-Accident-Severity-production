from flask import Flask, request, jsonify
import joblib
import numpy as np
import pandas as pd
import os


app = Flask('model_server')
MODEL_PATH = os.environ.get('MODEL_PATH','best_accident_severity_model.joblib')
print('Loading model from', MODEL_PATH)
model = joblib.load(MODEL_PATH)


# Example feature order & preprocessing expectations must match what model expects
# For the provided example pipeline we recommended: ['hour','weekday','month','is_weekend','rush_hour','weather_simple', 'Visibility(mi)', ...]


@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
# Simple validation and transform to dataframe row
# The frontend sends minimal fields; we will construct the rest with defaults where necessary.
    df = pd.DataFrame([{
        'hour': data.get('hour',8),
        'weekday': data.get('weekday',1),
        'month': data.get('month',1),
        'is_weekend': int(data.get('is_weekend',0)),
        'rush_hour': int(data.get('rush_hour',0)),
        'weather_simple': data.get('weather','clear'),
        'Visibility(mi)': float(data.get('visibility',10.0)),
        'Temperature(F)': float(data.get('temperature', 70.0)),
        'Wind_Speed(mph)': float(data.get('wind_speed', 5.0))
    }])
    # Predict
    preds = model.predict(df)
    probs = None
    try:
        probs = model.predict_proba(df).tolist()
    except Exception:
        probs = None
    # Try to provide a tiny explanation: feature importances if a
    explanation = None
    try:
        if hasattr(model.named_steps['clf'], 'feature_importances_'):
            fi = model.named_steps['clf'].feature_importances_.tolist()
            explanation = { 'feature_importances': fi }
    except Exception:
        explanation = None
    return jsonify({'prediction': int(preds[0]), 'probabilities': probs and probs[0], 'explanation': explanation})
if __name__=='__main__':
    app.run(host='0.0.0.0', port=8000, debug=False)
