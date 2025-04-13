# Mining Map Project

A full-stack application that lets users view and add mining listings on an interactive map. The project uses a Node.js backend with PostgreSQL (and PostGIS for geospatial data) for persistent storage, and a React frontend (with MapLibre for mapping) to display and manage listings.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Database Setup](#database-setup)
- [Endpoints](#endpoints)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Display Listings on a Map:**  
  View mining listings on an interactive map using geospatial data.

- **Add New Listings:**  
  Submit new listings via a user-friendly form with address autocomplete and geocoding. New listings are stored persistently in a PostgreSQL database.

- **Geospatial Filtering:**  
  Use spatial queries (with PostGIS) to filter listings by location (e.g., within a given radius of a specific coordinate).

- **Dynamic Map Updates:**  
  The frontend automatically fetches and displays listings from the backend API.

## Tech Stack

- **Frontend:**  
  - React  
  - MapLibre GL for maps  
  - Lodash (for debounce functions)
  
- **Backend:**  
  - Node.js with Express  
  - PostgreSQL with PostGIS extension for spatial queries
  - pg (node-postgres) for database connectivity

- **Other Tools:**  
  - GitHub for version control  
  - pgAdmin / psql for database management

## Installation

### Prerequisites

- **Node.js:** [Download and install](https://nodejs.org/)
- **PostgreSQL with PostGIS:**  
  Install PostgreSQL (we used version 17 in this project) and enable PostGIS.  
- **Git:** [Download and install](https://git-scm.com/)

## 🛠 Install Dependencies

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd ../frontend
npm install
```

## ⚙️ Configuration

### Database Configuration

Update your backend configuration (e.g., in `server.js`) with your PostgreSQL credentials:

```js
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'mining_map_db',
  password: 'YourPassword',
  port: 5433, // or 5432 if using the default port
});
```

### Environment Variables (Optional)

If you prefer using environment variables, create a `.env` file in the `backend` directory with the following:

```ini
DB_USER=postgres
DB_HOST=localhost
DB_DATABASE=mining_map_db
DB_PASSWORD=YourPassword
DB_PORT=5433
PORT=5000
```

Then update your backend code to load them using [dotenv](https://www.npmjs.com/package/dotenv):

```js
require('dotenv').config();
```

## 🧱 Database Setup

### Connect to PostgreSQL

```bash
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -p 5433 -U postgres -d postgres
```

### Create the Database

```sql
CREATE DATABASE mining_map_db;
\q
```

### Set Up PostGIS and Listings Table

Connect to the new database:

```bash
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -p 5433 -U postgres -d mining_map_db
```

Then run:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS listings (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  electricity_rate NUMERIC,
  power_source TEXT,
  cooling_type TEXT,
  location geography(POINT,4326)
);
```

## 🚀 Usage

### Running the Backend

```bash
cd backend
node server.js
```

The server should start on port 5000 (or the port you configured).

### Running the Frontend

```bash
cd frontend
npm start
```

Your application should open in your browser at [http://localhost:3000](http://localhost:3000). Use the form to add new mining listings. Listings will be stored in PostgreSQL and fetched via the GET endpoint upon reload.

## 📡 Endpoints

### `GET /api/listings`

Fetches listings from the database. Accepts URL query parameters:

- `lat`: Latitude of the center point
- `lng`: Longitude of the center point
- `radius`: Filter radius (in meters)
- `powerSource`: Filter by power source (or `all`)
- `coolingType`: Filter by cooling type (or `all`)

### `POST /api/listings`

Adds a new listing. Expects a JSON body like:

```json
{
  "title": "Example Listing",
  "description": "Description goes here",
  "electricityRate": 0.05,
  "latitude": 43.71418,
  "longitude": -79.370489,
  "powerSource": "Hydro",
  "coolingType": "Immersion"
}
```

The endpoint returns the inserted record along with the location formatted as a text string (e.g., `"POINT(-79.370489 43.71418)"`).

## 🤝 Contributing

Contributions are welcome! Please fork this repository and open a pull request with your improvements. Be sure to update tests and documentation as needed.

## 📄 License

This project is licensed under the MIT License.
