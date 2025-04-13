const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'mining_map_db',
  password: 'Bquinla2!', // replace with your actual password
  port: 5433,  // or 5432, depending on your installation
});


// ✅ GET Listings Endpoint

app.get('/api/listings', async (req, res) => {
  try {
    // Destructure the query parameters
    let { lat, lng, radius, powerSource, coolingType } = req.query;

    // Trim the string inputs to remove any extra whitespace or newline characters
    if (typeof powerSource === 'string') {
      powerSource = powerSource.trim();
    }
    if (typeof coolingType === 'string') {
      coolingType = coolingType.trim();
    }

    let query = `
      SELECT id, title, description, electricity_rate, power_source, cooling_type,
             ST_AsText(location::geometry) as location 
      FROM listings
    `;

    let conditions = [];
    let params = [];

    // Parse and validate lat, lng, and radius values
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    const parsedRadius = parseFloat(radius);

    if (!isNaN(parsedLat) && !isNaN(parsedLng) && !isNaN(parsedRadius)) {
      // Push lng, lat, radius in that order.
      params.push(parsedLng, parsedLat, parsedRadius);
      conditions.push(`ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint($${params.length-2}, $${params.length-1}), 4326)::geography, $${params.length})`);
    }

    // Add additional filters, if provided
    if (powerSource && powerSource.toLowerCase() !== 'all') {
      params.push(powerSource);
      conditions.push(`power_source = $${params.length}`);
    }

    if (coolingType && coolingType.toLowerCase() !== 'all') {
      params.push(coolingType);
      conditions.push(`cooling_type = $${params.length}`);
    }

    // Append WHERE conditions if any exist
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Log the final query for debugging
    console.log('Final Query:', query, 'Params:', params);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching listings', err.message, err.stack);
    res.status(500).json({ error: err.message });
  }
});




// ✅ POST Listings Endpoint
app.post('/api/listings', async (req, res) => {
  try {
    const {
      title,
      description,
      electricityRate,
      latitude,
      longitude,
      powerSource,
      coolingType
    } = req.body;

    // Create a PostGIS point from the provided longitude and latitude
    const locationPoint = `SRID=4326;POINT(${longitude} ${latitude})`;

    const query = `
      INSERT INTO listings 
      (title, description, electricity_rate, location, power_source, cooling_type)
      VALUES ($1, $2, $3, ST_GeogFromText($4), $5, $6)
      RETURNING id, title, description, electricity_rate, power_source, cooling_type, ST_AsText(location) as location;
    `;
    const params = [title, description, electricityRate, locationPoint, powerSource, coolingType];
    
    const result = await pool.query(query, params);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error adding listing:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
