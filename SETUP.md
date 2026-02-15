# SETUP INSTRUCTIONS

## Before Running the Application

### Step 1: Install Node.js
If you haven't already, download and install Node.js from https://nodejs.org/
We recommend the LTS (Long-term Support) version.

### Step 2: Install Dependencies

Open a terminal in VS Code and run:
```bash
npm run install:all
```

This will install all dependencies for:
- Root project
- Backend API
- Frontend React app

### Step 3: Initialize Database with Sample Data

```bash
cd database
node init.js
cd ..
```

This creates sample menu items in the SQLite database.

### Step 4: Run the Application

Option A - Run Backend and Frontend together:
```bash
npm run dev
```

Option B - Run in VS Code Tasks:
1. Press `Ctrl+Shift+B` to open the task menu
2. Select "Install Dependencies" (only first time)
3. Select "Run Dev (Backend + Frontend)"

Option C - Run separately:
Terminal 1 (Backend):
```bash
npm run backend:dev
```

Terminal 2 (Frontend):
```bash
npm run frontend:dev
```

### Step 5: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## Troubleshooting

### npm command not found
- Restart VS Code after installing Node.js
- Add Node.js to your PATH environment variable
- Try using `npx` instead: `npx --version`

### Port already in use
Change the port in `backend/server.js`:
```javascript
const PORT = process.env.PORT || 5001;  // Change 5000 to 5001
```

### Database errors
Delete the database file and it will be recreated:
```bash
rm database/ktlm_kitchen.db
node database/init.js
```

### Dependencies installation fails
Try clearing npm cache:
```bash
npm cache clean --force
npm run install:all
```

## Next Steps

1. ✅ Install Node.js
2. ✅ Install dependencies
3. ✅ Initialize database
4. ✅ Run the application
5. Try creating an order in the POS interface
6. Check the Orders history tab
7. Customize menu items by editing database/init.js

## Project Features Ready to Use

✅ Create Orders - Add menu items to cart, set quantities, submit orders
✅ View Menu - Browse all items organized by category
✅ Order History - See all completed orders with timestamps
✅ Payment Processing - Process payments for orders
✅ Real-time Updates - Orders appear in history immediately

For more details, see README.md in the root directory.
