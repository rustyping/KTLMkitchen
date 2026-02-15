import React, { useState } from 'react';
import './OrderCart.css';

const OrderCart = ({ items, onRemoveItem, onUpdateQuantity, onSubmit }) => {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const [cashAmount, setCashAmount] = useState(total);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const change = cashAmount - total;

  const handleSubmit = () => {
    if (cashAmount < total) {
      alert('Cash amount must be at least Rp. ' + formatPrice(total));
      return;
    }
    onSubmit(total, cashAmount, change);
  };

  return (
    <div className="order-cart">
      <h2>🛒 Order Cart</h2>

      <div className="cart-items">
        {items.length === 0 ? (
          <p className="empty-cart">Cart is empty</p>
        ) : (
          items.map(item => (
            <div key={item.id} className="cart-item">
              <div className="item-info">
                <div className="item-name">{item.name}</div>
                <div className="item-price">{formatPrice(item.price)}</div>
              </div>
              <div className="item-controls">
                <button 
                  className="qty-btn"
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                >
                  −
                </button>
                <input 
                  type="number"
                  className="qty-input"
                  value={item.quantity}
                  onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                  min="1"
                />
                <button 
                  className="qty-btn"
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                >
                  +
                </button>
              </div>
              <div className="item-subtotal">
                {formatPrice(item.price * item.quantity)}
              </div>
              <button 
                className="remove-btn"
                onClick={() => onRemoveItem(item.id)}
                title="Remove item"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      <div className="cart-summary">
        <div className="summary-row total">
          <span>Total:</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      {items.length > 0 && (
        <div className="cash-section">
          <label>Cash Amount:</label>
          <div className="cash-input-group">
            <input 
              type="number"
              value={cashAmount}
              onChange={(e) => setCashAmount(parseFloat(e.target.value) || total)}
              className="cash-input"
              min={total}
              step="1000"
            />
            <button 
              className="match-btn"
              onClick={() => setCashAmount(total)}
              title="Set cash to match total"
            >
              Match
            </button>
          </div>
          <div className="change-display">
            Change: {formatPrice(change)}
          </div>
        </div>
      )}

      <div className="button-group">
        <button 
          className="submit-btn"
          onClick={handleSubmit}
          disabled={items.length === 0}
        >
          💳 Submit Order
        </button>
      </div>
    </div>
  );
};

export default OrderCart;
