from flask import Flask, render_template, request, jsonify
from datetime import datetime
from textblob import TextBlob
import json, os

app = Flask(__name__)
DATA_FILE = os.path.join(os.path.dirname(__file__), "products.json")

def load_products():
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def sentiment(review):
    # Lightweight NLP sentiment scoring using TextBlob polarity.
    polarity = TextBlob(review).sentiment.polarity
    if polarity > 0.15:
        label = "Positive"
    elif polarity < -0.15:
        label = "Negative"
    else:
        label = "Neutral"
    return {"label": label, "score": round(polarity, 3)}

def enrich(product):
    reviews = product.get("reviews", [])
    sentiments = [sentiment(r) for r in reviews]
    positive = sum(1 for s in sentiments if s["label"] == "Positive")
    negative = sum(1 for s in sentiments if s["label"] == "Negative")
    product["sentiment"] = {
        "positive": positive,
        "negative": negative,
        "neutral": len(sentiments) - positive - negative,
        "overall": "Positive" if positive > negative else ("Negative" if negative > positive else "Mixed")
    }
    return product

@app.route("/")
def index():
    products = [enrich(p) for p in load_products()]
    categories = sorted({p["category"] for p in products})
    return render_template("index.html", products=products, categories=categories)

@app.route("/api/products")
def api_products():
    products = [enrich(p) for p in load_products()]
    category = request.args.get("category", "").strip()
    search = request.args.get("q", "").strip().lower()
    if category and category != "All":
        products = [p for p in products if p["category"] == category]
    if search:
        products = [p for p in products if search in (p["name"] + " " + p["brand"] + " " + p["category"]).lower()]
    return jsonify(products)

@app.route("/api/recommend", methods=["POST"])
def recommend():
    payload = request.get_json(silent=True) or {}
    ids = set(payload.get("ids", []))
    products = [enrich(p) for p in load_products() if p["id"] in ids]
    if not products:
        return jsonify({"error": "Select at least one product."}), 400
    # Transparent demo score: normalized rating + sentiment + price value.
    min_price = min(p["price"] for p in products)
    max_price = max(p["price"] for p in products)
    for p in products:
        price_score = 1 if max_price == min_price else (max_price - p["price"]) / (max_price - min_price)
        sentiment_score = (p["sentiment"]["positive"] + 1) / (len(p.get("reviews", [])) + 2)
        p["recommendation_score"] = round((p["rating"] / 5 * 0.55 + sentiment_score * 0.25 + price_score * 0.20) * 100, 1)
    best = max(products, key=lambda p: p["recommendation_score"])
    return jsonify({"best": best, "products": products,
                    "note": "Demo score weights: rating 55%, review sentiment 25%, price value 20%."})

if __name__ == "__main__":
    app.run(debug=True)
