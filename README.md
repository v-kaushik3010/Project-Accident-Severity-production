# 🚦 AI-Driven Road Accident Severity Predictor

An end-to-end Machine Learning & Full-Stack web application that predicts the severity of road accidents based on real-time environmental and traffic conditions.
Built using React (Vite) for the frontend, Node.js Express for API routing, and Flask (Python) for ML inference using an XGBoost model trained on US & UK Accident datasets.

This system provides:

🎯 Severity prediction: Minor / Moderate / Serious / Fatal

📊 Probability distribution visualization

🧠 Feature importance insights

🚧 Safety recommendations based on risk

🌍 Works with US Accidents (March 2023) & UK STATS19 Accident dataset

# ✨ Features

🎯ML pipeline with advanced preprocessing, SMOTE balancing, and feature engineering

🎯Real-time web UI with:

🎯Weather icons

🎯Probability bars

🎯Dynamic severity badge

🎯Safety tips + recommendations

🎯Node.js API proxy for secure model integration

🎯Flask prediction server exposing /predict REST endpoint

🎯Saved .joblib model for production deployment

# 🛠 Tech Stack

| Layer         | Technology                                       |
| ------------- | ------------------------------------------------ |
| Frontend UI   | React + Vite, Axios, CSS Animations              |
| API Gateway   | Node.js + Express + CORS                         |
| ML Backend    | Flask, Pandas, Scikit-Learn, XGBoost             |
| Model         | Joblib pipeline                                  |
| Dataset       | US Accidents (March 2023), UK STATS19 Dataset    |
| Visualization | Matplotlib, Confusion Matrix, F1 score, Accuracy |

# 📂 Folder Structure

<img width="890" height="678" alt="image" src="https://github.com/user-attachments/assets/bbefd28d-f179-4362-9fb1-c8630352fcec" />

# 🚀 Running the Project Locally
## 1️⃣ Start the ML Model Server

cd python

pip install -r requirements.txt

python model_server.py

Runs at → <a>http://localhost:8000</a>

## 2️⃣ Start the Node.js API Gateway

cd backend

npm install

npm start

Runs at → http://localhost:5000

## 3️⃣ Start the React Frontend

cd frontend

npm install

npm run dev

Runs at → http://localhost:5173

# 🧠 ML Model Training Summary

Compared **Logistic Regression**, **Random Forest**, and **XGBoost**

Used SMOTE to balance class imbalance

Feature engineering from:
Time of day, weekday, month
      
Rush hour indicator
      
Simplified weather category
      
Visibility, wind speed, temperature

Saved best model: XGBoost

# 🧭 Future Enhancements

#### Real-time weather data integration (OpenWeather API)

#### Location-based prediction using maps

#### Deployment with Vercel

#### Live dashboard with historic tracking





