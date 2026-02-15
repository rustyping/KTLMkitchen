import React, { useState } from 'react';
import './OrderHistory.css';

const OrderHistory = ({ orders, onOrdersRefresh }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return '#4caf50';
      case 'pending': return '#ff9800';
      case 'cancelled': return '#f44336';
      default: return '#666';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price || 0);
  };

  const handleOrderClick = async (order) => {
    setLoading(true);
    try {
      // Fetch order details including items
      const response = await fetch(`http://localhost:5000/api/orders/${order.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }
      const orderData = await response.json();
      
      setSelectedOrder(order);
      setEditingOrder({ ...order });
      setOrderItems(orderData.items || []);
    } catch (error) {
      console.error('Error fetching order details:', error);
      alert('Error loading order details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (newStatus) => {
    setEditingOrder({
      ...editingOrder,
      status: newStatus
    });
  };

  const handleSave = async () => {
    try {
      // Update the order status via API
      const response = await fetch(`http://localhost:5000/api/orders/${selectedOrder.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: editingOrder.status })
      });

      if (!response.ok) {
        throw new Error('Failed to update order');
      }

      setSelectedOrder(null);
      setEditingOrder(null);
      setOrderItems([]);
      alert('✓ Order updated successfully');
      
      // Trigger refresh if callback exists
      if (onOrdersRefresh) {
        onOrdersRefresh();
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Error updating order: ' + error.message);
    }
  };

  const handleClose = () => {
    setSelectedOrder(null);
    setEditingOrder(null);
  };

  return (
    <div className="order-history">
      <h2>📊 Order History</h2>

      {orders.length === 0 ? (
        <p className="no-orders">No orders found</p>
      ) : (
        <div className="orders-table">
          <div className="table-header">
            <div className="col-order">Order #</div>
            <div className="col-amount">Amount</div>
            <div className="col-status">Status</div>
            <div className="col-time">Time</div>
          </div>

          {orders.map(order => (
            <div 
              key={order.id} 
              className="table-row clickable"
              onClick={() => handleOrderClick(order)}
            >
              <div className="col-order">{order.order_number}</div>
              <div className="col-amount">{formatPrice(order.total_amount)}</div>
              <div className="col-status">
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {order.status}
                </span>
              </div>
              <div className="col-time">
                {new Date(order.created_at).toLocaleString('id-ID')}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && editingOrder && (
        <div className="order-detail-overlay">
          <div className="order-detail-modal">
            <div className="detail-header">
              <h2>Order Details</h2>
              <button className="close-btn" onClick={handleClose}>✕</button>
            </div>

            <div className="detail-content">
              <div className="detail-section">
                <label>Order Number:</label>
                <input 
                  type="text" 
                  value={editingOrder.order_number}
                  readOnly
                  className="readonly"
                />
              </div>

              <div className="detail-section">
                <label>Amount:</label>
                <input 
                  type="text" 
                  value={formatPrice(editingOrder.total_amount)}
                  readOnly
                  className="readonly"
                />
              </div>

              <div className="detail-section">
                <label>Cash:</label>
                <input 
                  type="text" 
                  value={formatPrice(editingOrder.cash_amount)}
                  readOnly
                  className="readonly"
                />
              </div>

              <div className="detail-section">
                <label>Change:</label>
                <input 
                  type="text" 
                  value={formatPrice(editingOrder.change_amount)}
                  readOnly
                  className="readonly"
                />
              </div>

              <div className="detail-section">
                <label>Status:</label>
                <select 
                  value={editingOrder.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="status-select"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="detail-section">
                <label>Date/Time:</label>
                <input 
                  type="text" 
                  value={new Date(editingOrder.created_at).toLocaleString('id-ID')}
                  readOnly
                  className="readonly"
                />
              </div>

              <div className="items-section">
                <h3>Order Items</h3>
                {loading ? (
                  <p className="loading">Loading items...</p>
                ) : orderItems.length === 0 ? (
                  <p className="no-items">No items in this order</p>
                ) : (
                  <div className="items-list">
                    {orderItems.map((item, index) => (
                      <div key={index} className="item-row">
                        <div className="item-detail">
                          <div className="item-name">{item.name || 'Item'}</div>
                          <div className="item-info">
                            Qty: {item.quantity} × {formatPrice(item.unit_price)}
                          </div>
                        </div>
                        <div className="item-total">
                          {formatPrice(item.subtotal)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="detail-buttons">
              <button className="save-btn" onClick={handleSave}>
                ✓ Save Changes
              </button>
              <button className="cancel-btn" onClick={handleClose}>
                ✕ Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
