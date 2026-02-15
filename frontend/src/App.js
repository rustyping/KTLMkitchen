import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import MenuDisplay from './components/MenuDisplay';
import OrderCart from './components/OrderCart';
import OrderHistory from './components/OrderHistory';
import OrderConfirmation from './components/OrderConfirmation';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [currentView, setCurrentView] = useState('pos');
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmationOrder, setConfirmationOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);

  // Load menu items
  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/menu`);
      setMenuItems(response.data || []);
    } catch (error) {
      console.error('Error fetching menu:', error);
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Load orders
  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/orders`);
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const updateCartQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(cart.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      ));
    }
  };

  const submitOrder = async (total, cashAmount, change) => {
    try {
      if (cart.length === 0) {
        alert('Cart is empty');
        return;
      }

      const orderData = {
        items: cart.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        total_amount: total,
        cash_amount: cashAmount,
        change_amount: change
      };

      const response = await axios.post(`${API_URL}/orders`, orderData);
      
      // Store order details for confirmation modal
      setOrderDetails({
        order_number: response.data.order_number,
        items: cart,
        total_amount: total,
        cash_amount: cashAmount,
        change_amount: change
      });
      
      setConfirmationOrder(response.data);
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error creating order');
    }
  };

  const handleConfirmationClose = () => {
    setConfirmationOrder(null);
    setOrderDetails(null);
    setCart([]);
    fetchOrders();
  };

  return (
    <div className="App">
      <header className="header">
        <h1>🍽️ KTLM Kitchen POS System</h1>
        <nav className="nav">
          <button 
            className={`nav-btn ${currentView === 'pos' ? 'active' : ''}`}
            onClick={() => setCurrentView('pos')}
          >
            📝 New Order
          </button>
          <button 
            className={`nav-btn ${currentView === 'history' ? 'active' : ''}`}
            onClick={() => { setCurrentView('history'); fetchOrders(); }}
          >
            📊 Orders
          </button>
        </nav>
      </header>

      <main className="main-content">
        {currentView === 'pos' ? (
          <div className="pos-layout">
            <div className="menu-section">
              <MenuDisplay 
                items={menuItems} 
                onAddToCart={addToCart}
                loading={loading}
              />
            </div>
            <div className="cart-section">
              <OrderCart 
                items={cart}
                onRemoveItem={removeFromCart}
                onUpdateQuantity={updateCartQuantity}
                onSubmit={submitOrder}
              />
            </div>
          </div>
        ) : (
          <OrderHistory orders={orders} onOrdersRefresh={fetchOrders} />
        )}
      </main>

      {confirmationOrder && orderDetails && (
        <OrderConfirmation 
          order={orderDetails}
          onClose={handleConfirmationClose}
        />
      )}
    </div>
  );
}

export default App;
