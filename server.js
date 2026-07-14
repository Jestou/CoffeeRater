import express from 'express';
import Database from 'better-sqlite3';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new Database('coffee_rater.sqlite');

// Create tables if they do not exist
db.exec(`
  CREATE TABLE IF NOT EXISTS shops (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ratings (
    id TEXT PRIMARY KEY,
    shop_id TEXT NOT NULL,
    coffee_rating INTEGER NOT NULL,
    price_rating INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES shops (id) ON DELETE CASCADE
  );
`);

// Latitude and longitude for 123 Albert Street, Brisbane
const ALBERT_ST_LAT = -27.47093;
const ALBERT_ST_LNG = 153.02648;

// Prepopulate the database with actual Brisbane coffee shops if empty
const rowCount = db.prepare('SELECT COUNT(*) as count FROM shops').get();
if (rowCount.count === 0) {
  const prepopulatedShops = [
    {
      id: 'pre-1',
      name: 'Merlo Coffee Cafe - George St',
      lat: -27.47155,
      lng: 153.02450,
      initialRatings: [
        { coffee: 5, price: 3 },
        { coffee: 4, price: 3 }
      ]
    },
    {
      id: 'pre-2',
      name: 'John Mills Himself',
      lat: -27.47141,
      lng: 153.02521,
      initialRatings: [
        { coffee: 5, price: 4 }
      ]
    },
    {
      id: 'pre-3',
      name: 'The Coffee Club Café - Brisbane Square',
      lat: -27.47053,
      lng: 153.02381,
      initialRatings: [
        { coffee: 3, price: 3 },
        { coffee: 3, price: 4 }
      ]
    },
    {
      id: 'pre-4',
      name: 'Strauss',
      lat: -27.47012,
      lng: 153.02790,
      initialRatings: [
        { coffee: 5, price: 2 }
      ]
    }
  ];

  const insertShop = db.prepare('INSERT INTO shops (id, name, lat, lng) VALUES (?, ?, ?, ?)');
  const insertRating = db.prepare('INSERT INTO ratings (id, shop_id, coffee_rating, price_rating) VALUES (?, ?, ?, ?)');

  for (const shop of prepopulatedShops) {
    insertShop.run(shop.id, shop.name, shop.lat, shop.lng);
    let rIdx = 1;
    for (const r of shop.initialRatings) {
      insertRating.run(`${shop.id}-r${rIdx++}`, shop.id, r.coffee, r.price);
    }
  }
}

// Haversine formula to compute distance in meters
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
}

// Helper to compute stats and composite score for a list of ratings & distance
function getShopDetails(shop, ratings) {
  const distance = calculateHaversineDistance(ALBERT_ST_LAT, ALBERT_ST_LNG, shop.lat, shop.lng);

  // Brisk walking pace: 80 meters per minute (approx 4.8 km/h)
  const walkingTime = Math.ceil(distance / 80);

  let avgCoffee = 0;
  let avgPrice = 0;

  if (ratings && ratings.length > 0) {
    const sumCoffee = ratings.reduce((sum, r) => sum + r.coffee_rating, 0);
    const sumPrice = ratings.reduce((sum, r) => sum + r.price_rating, 0);
    avgCoffee = parseFloat((sumCoffee / ratings.length).toFixed(1));
    avgPrice = parseFloat((sumPrice / ratings.length).toFixed(1));
  }

  // Composite score calculation out of 10
  // C_score = avgCoffee * 2 (scales 1-5 to 2-10). Default to 6 if no ratings.
  const cScore = avgCoffee > 0 ? avgCoffee * 2 : 6.0;

  // P_score = (6 - avgPrice) * 2 (scales 1-5 to 10-2, where 1 is best/cheapest). Default to 6 if no ratings.
  const pScore = avgPrice > 0 ? (6 - avgPrice) * 2 : 6.0;

  // D_score = distance component. <= 100m is 10. >= 1300m is 2. Linear in-between.
  let dScore = 10;
  if (distance > 100) {
    dScore = 10 - (distance - 100) / 150;
    if (dScore < 2) dScore = 2;
  }
  dScore = parseFloat(dScore.toFixed(1));

  // Weights: Coffee (50%), Price (25%), Distance (25%)
  const rawComposite = 0.5 * cScore + 0.25 * pScore + 0.25 * dScore;
  const compositeScore = parseFloat(rawComposite.toFixed(1));

  return {
    ...shop,
    distance: Math.round(distance),
    walkingTime,
    avgCoffee,
    avgPrice,
    compositeScore,
    ratingsCount: ratings ? ratings.length : 0
  };
}

// API Endpoints
app.get('/api/shops', (req, res) => {
  try {
    const shops = db.prepare('SELECT * FROM shops').all();
    const allRatings = db.prepare('SELECT * FROM ratings').all();

    const enrichedShops = shops.map(shop => {
      const shopRatings = allRatings.filter(r => r.shop_id === shop.id);
      return getShopDetails(shop, shopRatings);
    });

    res.json(enrichedShops);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve shops' });
  }
});

app.post('/api/shops', (req, res) => {
  const { name, lat, lng } = req.body;
  if (!name || lat === undefined || lng === undefined) {
    return res.status(400).json({ error: 'Missing name, lat, or lng' });
  }

  try {
    const id = 'shop-' + Date.now();
    const insert = db.prepare('INSERT INTO shops (id, name, lat, lng) VALUES (?, ?, ?, ?)');
    insert.run(id, name, parseFloat(lat), parseFloat(lng));

    const shop = db.prepare('SELECT * FROM shops WHERE id = ?').get(id);
    res.status(201).json(getShopDetails(shop, []));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add coffee shop' });
  }
});

app.post('/api/shops/:id/ratings', (req, res) => {
  const { id: shopId } = req.params;
  const { coffee_rating, price_rating } = req.body;

  if (coffee_rating === undefined || price_rating === undefined) {
    return res.status(400).json({ error: 'Missing coffee_rating or price_rating' });
  }

  const coffeeVal = parseInt(coffee_rating);
  const priceVal = parseInt(price_rating);

  if (coffeeVal < 1 || coffeeVal > 5 || priceVal < 1 || priceVal > 5) {
    return res.status(400).json({ error: 'Ratings must be between 1 and 5' });
  }

  try {
    const ratingId = 'rating-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const insert = db.prepare('INSERT INTO ratings (id, shop_id, coffee_rating, price_rating) VALUES (?, ?, ?, ?)');
    insert.run(ratingId, shopId, coffeeVal, priceVal);

    // Return the updated shop details
    const shop = db.prepare('SELECT * FROM shops WHERE id = ?').get(shopId);
    const shopRatings = db.prepare('SELECT * FROM ratings WHERE shop_id = ?').all(shopId);

    res.status(201).json(getShopDetails(shop, shopRatings));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add rating' });
  }
});

// Serve frontend built files in production
app.use(express.static(path.join(__dirname, 'dist')));
// Use a generic middleware to serve index.html for unknown routes (instead of wildcard path-to-regexp string)
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '127.0.0.1', () => {
  console.log(`Server running at http://127.0.0.1:${port}`);
});
