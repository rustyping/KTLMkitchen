# KTLM Kitchen POS System

A modern Point of Sale (POS) system designed for kitchen restaurants. This system allows you to manage orders, track inventory, and process payments efficiently.

## Features

✅ **Order Management** - Create, view, and manage customer orders  
✅ **Menu Management** - Organize items by categories  
✅ **Real-time Updates** - Live order tracking  
✅ **Payment Processing** - Multiple payment methods support  
✅ **Order History** - Complete order tracking and reporting  
✅ **Responsive Design** - Works on desktop and tablet devices  

## Project Structure

```
KTLM Kitchen/
├── backend/              # Node.js Express API server
│   ├── server.js         # Main server file
│   └── package.json      # Backend dependencies
├── frontend/             # React web application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── App.js        # Main app component
│   │   └── index.js      # Entry point
│   ├── public/           # Static files
│   └── package.json      # Frontend dependencies
├── database/             # SQLite database files
└── package.json          # Root package configuration
```

## Tech Stack

- **Backend**: Node.js, Express.js, SQLite3
- **Frontend**: React 18, Axios
- **Database**: SQLite
- **Styling**: Custom CSS

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Step 1: Install Root Dependencies
```bash
npm install
```

### Step 2: Install Backend Dependencies
```bash
npm run backend:install
```

### Step 3: Install Frontend Dependencies
```bash
npm run frontend:install
```

## Running the Application

### Option 1: Run Backend and Frontend Together
```bash
npm run dev
```
This will start both the backend API and React development server.

### Option 2: Run Backend Only
```bash
npm run backend:dev
```
Backend API will run on `http://localhost:5000`

### Option 3: Run Frontend Only
```bash
cd frontend
npm start
```
Frontend will run on `http://localhost:3000`

## API Endpoints

### Menu Items
- `GET /api/menu` - Get all menu items
- `GET /api/menu/:category` - Get items by category

### Orders
- `POST /api/orders` - Create a new order
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get specific order details
- `PUT /api/orders/:id/status` - Update order status

### Payments
- `POST /api/payments` - Process payment

### Health
- `GET /api/health` - Check API status

## Database Schema

### Tables

**menu_items**
- id (INTEGER, PRIMARY KEY)
- name (TEXT)
- description (TEXT)
- price (REAL)
- category (TEXT)
- available (BOOLEAN)
- created_at (DATETIME)

**orders**
- id (INTEGER, PRIMARY KEY)
- order_number (TEXT, UNIQUE)
- status (TEXT)
- total_amount (REAL)
- created_at (DATETIME)
- updated_at (DATETIME)

**order_items**
- id (INTEGER, PRIMARY KEY)
- order_id (INTEGER, FOREIGN KEY)
- menu_item_id (INTEGER, FOREIGN KEY)
- quantity (INTEGER)
- unit_price (REAL)
- subtotal (REAL)
- notes (TEXT)

**payments**
- id (INTEGER, PRIMARY KEY)
- order_id (INTEGER, FOREIGN KEY)
- amount (REAL)
- payment_method (TEXT)
- status (TEXT)
- created_at (DATETIME)

## Initial Data

To add test menu items to the database, you can create a data initialization script. The backend will automatically create tables on first run.

## Features Coming Soon

🔜 Kitchen Display System (KDS)  
🔜 Inventory Management  
🔜 Staff Management & Roles  
🔜 Advanced Analytics & Reports  
🔜 Mobile App  
🔜 Customer Loyalty Program  

## Configuration

### Backend Port
Default: `5000`
Change in `backend/server.js`:
```javascript
const PORT = process.env.PORT || 5000;
```

### Frontend Proxy
The frontend is configured to connect to `http://localhost:5000` by default.
Change in `frontend/src/App.js`:
```javascript
const API_URL = 'http://localhost:5000/api';
```

## Troubleshooting

### Backend won't start
- Check if port 5000 is already in use
- Ensure Node.js is installed correctly
- Check database directory exists at `database/`

### Frontend connection issues
- Ensure backend is running on port 5000
- Check CORS is enabled in backend
- Check browser console for error messages

### Database issues
- Delete `database/ktlm_kitchen.db` to reset the database
- Backend will create new tables automatically

## Development Tips

1. **Adding Menu Items**: Start the backend and use the API endpoint:
```bash
curl -X POST http://localhost:5000/api/menu \
  -H "Content-Type: application/json" \
  -d '{"name":"Burger","price":12.99,"category":"Food"}'
```

2. **Database Inspection**: Use SQLite browser to inspect data:
```bash
sqlite3 database/ktlm_kitchen.db
```

3. **API Testing**: Use Postman or similar tools to test endpoints

## Contributing

Feel free to fork this project and submit pull requests for any improvements.

## License

ISC

## Support

For issues or questions, please open an issue in the repository.

---

**Happy ordering! 🍽️**
