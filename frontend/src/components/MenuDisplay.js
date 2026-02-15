import React, { useState } from 'react';
import './MenuDisplay.css';

const MenuDisplay = ({ items, onAddToCart, loading }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [manualPrices, setManualPrices] = useState({});

  const categories = ['All', ...new Set(items.map(item => item.category))];

  const filteredItems = selectedCategory === 'All' 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  const handleManualPriceChange = (itemId, price) => {
    setManualPrices(prev => ({
      ...prev,
      [itemId]: parseFloat(price) || 0
    }));
  };

  const handleAddToCart = (item) => {
    if (item.manual_price === true && (!manualPrices[item.id] || manualPrices[item.id] <= 0)) {
      alert('Please enter a price for this item');
      return;
    }
    
    const itemWithPrice = {
      ...item,
      price: item.manual_price === true ? manualPrices[item.id] : item.price
    };
    
    onAddToCart(itemWithPrice);
    
    // Clear manual price after adding
    if (item.manual_price === true) {
      setManualPrices(prev => ({
        ...prev,
        [item.id]: ''
      }));
    }
  };

  if (loading) {
    return <div className="menu-loading">Loading menu...</div>;
  }

  return (
    <div className="menu-display">
      <h2>📋 Menu</h2>
      
      <div className="category-filter">
        {categories.map(category => (
          <button
            key={category}
            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="items-grid">
        {filteredItems.length === 0 ? (
          <p className="no-items">No items in this category</p>
        ) : (
          filteredItems.map(item => (
            <div key={item.id} className="menu-item">
              <div className="item-header">
                <h3>{item.name}</h3>
                {item.manual_price === true ? (
                  <span className="price-label">Manual Entry *</span>
                ) : (
                  <span className="price">Rp. {item.price.toLocaleString('id-ID')}</span>
                )}
              </div>
              {item.description && (
                <p className="description">{item.description}</p>
              )}
              {item.manual_price === true && (
                <div className="manual-price-input">
                  <label>Enter Price (Rp.):</label>
                  <input 
                    type="number"
                    placeholder="0"
                    value={manualPrices[item.id] || ''}
                    onChange={(e) => handleManualPriceChange(item.id, e.target.value)}
                    min="0"
                    step="1000"
                  />
                </div>
              )}
              <button 
                className="add-btn"
                onClick={() => handleAddToCart(item)}
              >
                + Add to Cart
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MenuDisplay;
