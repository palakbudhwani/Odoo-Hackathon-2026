# TransitOps backend

## Run the backend

1. Install dependencies:
   npm install express cors
2. Start the server:
   node server/index.js
3. Health check:
   http://localhost:5000/api/health

## API overview

- POST /api/login
- GET /api/:collection
- POST /api/:collection
- PUT /api/:collection/:id
- DELETE /api/:collection/:id

Supported collections:
- users
- vehicles
- drivers
- trips
- maintenance
- fuelLogs
- expenses
- settings
