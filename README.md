
---
# 🎬 ABEAARS 

![Python](https://img.shields.io/badge/Python-3.10-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-green?logo=fastapi)
![Machine Learning](https://img.shields.io/badge/ML-Scikit--Learn-orange)
![Deep Learning](https://img.shields.io/badge/Deep%20Learning-BERT-red)
![Frontend](https://img.shields.io/badge/Frontend-HTML%2FCSS%2FJS-purple)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

> 🚀 An intelligent full-stack AI system for movie recommendation, sentiment analysis, and popularity prediction.

---

## 📌 Overview

WatchWise is an AI-powered platform designed to solve the problem of content overload in modern entertainment systems. It combines machine learning, deep learning, and full-stack development to deliver intelligent insights and personalized user experiences.

---

## 🧠 Key Features

### 🔍 AI Recommendation System
- Content-based filtering using TF-IDF + Cosine Similarity  
- Provides relevant movie suggestions instantly  

### 💬 Sentiment Analysis (NLP)
- Powered by BERT (HuggingFace Transformers)  
- Understands context and user emotions  

### 📈 Popularity Prediction
- Built using Random Forest Regression  
- Predicts success based on movie attributes  

### 🌐 Interactive Web Interface
- Developed using HTML, CSS, JavaScript  
- Dynamic UI with real-time API communication  

---

## 🏗 System Architecture

```

User (Browser)
↓
Frontend (HTML/CSS/JS)
↓
FastAPI Backend (Python)
↓
ML Models (TF-IDF, BERT, Random Forest)
↓
Response → UI Rendering

```

---

## 📁 Project Structure

```

ABEAARS/
│
├── backend/        # FastAPI backend and APIs
├── frontend/       # UI files (HTML, CSS, JS)
├── ml/             # Model training scripts
├── data/           # Raw datasets
├── models/         # Saved ML models (.pkl)
├── start.py        # Run full system
└── requirements.txt

````

---

## ⚙️ Setup Instructions

### 1️⃣ Create Environment

```bash
conda create --name ABEAARS python=3.10
conda activate ABEAARS
````

### 2️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 🤖 Train ML Models

```bash
python ml/train_models.py
```

This step:

* Merges datasets
* Generates TF-IDF features
* Trains ML models
* Saves models for prediction

---

## ▶️ Run the Project

```bash
python start.py
```

Access the application:

* 🌐 Frontend: [http://127.0.0.1:8081](http://127.0.0.1:8081)
* ⚙️ Backend: [http://127.0.0.1:8000](http://127.0.0.1:8000)
* 📄 API Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 🔌 API Endpoints

| Endpoint     | Method | Description               |
| ------------ | ------ | ------------------------- |
| `/recommend` | GET    | Get movie recommendations |
| `/sentiment` | POST   | Analyze sentiment         |
| `/predict`   | POST   | Predict popularity        |
| `/health`    | GET    | Check server status       |

---

## 🤖 Machine Learning Pipeline

### Recommendation System

* TF-IDF vectorization
* Cosine similarity

### Sentiment Analysis

* Pre-trained BERT model
* Context-aware NLP

### Popularity Prediction

* Random Forest model
* Feature-based regression

---

## 📊 Dataset

* Netflix Dataset (Kaggle)
* Amazon Prime Dataset (Kaggle)

✔ 18,000+ movies
✔ Multi-language support
✔ Rich metadata

---

## 🛠 Tech Stack

| Layer    | Technology                        |
| -------- | --------------------------------- |
| Frontend | HTML, CSS, JavaScript             |
| Backend  | FastAPI, Uvicorn                  |
| ML       | Scikit-learn, Pandas, NumPy       |
| DL       | HuggingFace Transformers, PyTorch |

---

## 🔮 Future Scope

* User authentication and personalization
* Hybrid recommendation system
* Real-time data integration
* Cloud deployment (AWS, Render)

---

## 🙌 Acknowledgment

This project demonstrates the application of AI in solving real-world challenges in entertainment analytics and recommendation systems.

---

## ⭐ Final Note

ABEAARS is a complete AI-powered platform that enhances content discovery, improves user experience, and enables data-driven decision-making.


---

## 💬 Feedback

If you find this project useful, consider giving it a ⭐ and sharing your feedback!

```
