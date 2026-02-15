const XLSX = require('xlsx');
const path = require('path');

// Sample menu data
const sampleMenu = [
  { name: 'Spring Rolls', description: 'Crispy spring rolls with dipping sauce', price: 5.99, category: 'Appetizers' },
  { name: 'Chicken Wings', description: 'Buffalo or BBQ flavored wings', price: 8.99, category: 'Appetizers' },
  { name: 'Nachos', description: 'Tortilla chips with cheese and jalapeños', price: 7.99, category: 'Appetizers' },
  { name: 'Grilled Chicken Breast', description: 'Herb-marinated chicken breast with seasonal vegetables', price: 14.99, category: 'Main Courses' },
  { name: 'Ribeye Steak', description: '10oz premium ribeye with mashed potatoes', price: 24.99, category: 'Main Courses' },
  { name: 'Salmon Fillet', description: 'Pan-seared salmon with lemon butter sauce', price: 18.99, category: 'Main Courses' },
  { name: 'Pasta Carbonara', description: 'Traditional Italian pasta with bacon and creamy sauce', price: 12.99, category: 'Main Courses' },
  { name: 'Beef Burger', description: 'Juicy 8oz burger with cheese, lettuce, tomato', price: 11.99, category: 'Main Courses' },
  { name: 'French Fries', description: 'Crispy golden fries', price: 3.99, category: 'Sides' },
  { name: 'Caesar Salad', description: 'Fresh romaine with Caesar dressing', price: 6.99, category: 'Sides' },
  { name: 'Garlic Bread', description: 'Toasted bread with garlic butter', price: 3.99, category: 'Sides' },
  { name: 'Steamed Vegetables', description: 'Seasonal mix of steamed vegetables', price: 4.99, category: 'Sides' },
  { name: 'Soft Drink', description: 'Cola, Sprite, or Lemonade', price: 2.99, category: 'Beverages' },
  { name: 'Iced Tea', description: 'Fresh brewed iced tea', price: 2.49, category: 'Beverages' },
  { name: 'Coffee', description: 'Premium coffee - hot or iced', price: 3.49, category: 'Beverages' },
  { name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with molten center', price: 6.99, category: 'Desserts' },
  { name: 'Cheesecake', description: 'New York style cheesecake', price: 5.99, category: 'Desserts' },
  { name: 'Ice Cream', description: 'Choice of vanilla, chocolate, or strawberry', price: 4.99, category: 'Desserts' }
];

// Create workbook and worksheet
const ws = XLSX.utils.json_to_sheet(sampleMenu);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Menu');

// Set column widths
ws['!cols'] = [
  { wch: 25 }, // name
  { wch: 40 }, // description
  { wch: 10 }, // price
  { wch: 15 }  // category
];

// Write file
const filePath = path.join(__dirname, './menu.xlsx');
XLSX.writeFile(wb, filePath);
console.log(`✓ Menu template created at ${filePath}`);
console.log('You can now edit menu.xlsx and run: node database/init.js');
