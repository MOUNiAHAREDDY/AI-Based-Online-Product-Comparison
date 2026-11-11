# AI-Based Online Product Comparison Using Charts

A beginner-friendly Flask web application with product search, category filters, product selection, side-by-side comparison, interactive charts, and review sentiment analysis.

## Features
- Responsive HTML/CSS interface
- Product cards with prices, platforms, ratings, and features
- Search and category filtering
- Select products and compare specifications
- Chart.js price and rating charts
- TextBlob-based sentiment polarity endpoint
- Transparent demo best-value score
- Sample data stored in `products.json`

## Requirements
- Python 3.9+
- VS Code (recommended)

## Setup (Windows)
1. Extract the ZIP file.
2. Open the project folder in VS Code.
3. Open Terminal in VS Code.
4. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
5. Activate it:
   ```bash
   venv\Scripts\activate
   ```
6. Install packages:
   ```bash
   pip install -r requirements.txt
   ```
7. Start the application:
   ```bash
   python app.py
   ```
8. Open `http://127.0.0.1:5000` in your browser.

## Setup (macOS/Linux)
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```
Then open `http://127.0.0.1:5000`.

## API endpoints
- `GET /api/products?q=boat&category=Audio` — search/filter product data
- `POST /api/recommend` — JSON body: `{"ids":["p1","p2"]}`; returns scored products and winner

## Important project note
This is a functional academic prototype using sample product data. It does not scrape Amazon/Flipkart or claim live prices. For real marketplace prices, integrate official/authorized APIs and follow each site's terms. Sentiment analysis is performed with TextBlob polarity in the Flask API; the front-end sample recommendation uses a transparent lightweight demo score.
