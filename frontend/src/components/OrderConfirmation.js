import React, { useState } from 'react';
import './OrderConfirmation.css';

const OrderConfirmation = ({ order, onClose }) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [printError, setPrintError] = useState(null);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price || 0);
  };

  const handlePrint = async () => {
    setIsPrinting(true);
    setPrintError(null);

    try {
      // Request Bluetooth device - look for NP100S1BE5 or compatible thermal printer
      let device;
      try {
        device = await navigator.bluetooth.requestDevice({
          filters: [
            { name: 'NP100S1BE5' },
            { namePrefix: 'NP100' },
            { services: ['000018f0-0000-1000-8000-00805f9b34fb'] }
          ],
          optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
        });
      } catch (err) {
        throw new Error('Device not found. Make sure printer is powered on and paired.');
      }

      const server = await device.gatt.connect();
      
      // Wait a bit for connection to stabilize
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Try to get the service
      let service;
      try {
        service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
      } catch (err) {
        const services = await server.getPrimaryServices();
        if (services.length === 0) {
          throw new Error('No compatible service found on printer');
        }
        service = services[0];
      }

      // Try to get the characteristic
      let characteristic;
      try {
        characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');
      } catch (err) {
        const characteristics = await service.getCharacteristics();
        characteristic = characteristics.find(c => c.properties.write);
        if (!characteristic) {
          throw new Error('No writable characteristic found on printer');
        }
      }

      // Format receipt text
      let receipt = '\n=== KTLM KITCHEN ===\n';
      receipt += new Date().toLocaleString('id-ID') + '\n';
      receipt += 'Order #: ' + order.order_number + '\n';
      receipt += '============================\n';
      
      order.items.forEach(item => {
        const line = `${item.name} x${item.quantity}`;
        const price = formatPrice(item.price * item.quantity);
        receipt += line + '\n' + price + '\n';
      });

      receipt += '============================\n';
      receipt += 'Total: ' + formatPrice(order.total_amount) + '\n';
      receipt += 'Cash: ' + formatPrice(order.cash_amount) + '\n';
      receipt += 'Change: ' + formatPrice(order.change_amount) + '\n';
      receipt += '============================\n';
      receipt += 'Thank you!\n\n';

      // Send to printer - split into chunks if needed
      const encoder = new TextEncoder();
      const data = encoder.encode(receipt);
      
      // Try to write the value
      try {
        await characteristic.writeValue(data);
      } catch (writeErr) {
        // Try alternative: writeValueWithoutResponse if writeValue fails
        if (characteristic.properties.writeWithoutResponse) {
          await characteristic.writeValueWithoutResponse(data);
        } else {
          throw writeErr;
        }
      }

      // Wait a bit before disconnecting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Disconnect
      try {
        server.disconnect();
      } catch (e) {
        // Ignore disconnect errors
      }

      setIsPrinting(false);
      setTimeout(() => {
        alert('✓ Receipt printed successfully');
      }, 500);
    } catch (error) {
      console.error('Bluetooth Error:', error);
      setPrintError(error.message);
      setIsPrinting(false);
    }
  };

  return (
    <div className="confirmation-overlay">
      <div className="confirmation-modal">
        <h2>✓ Order Confirmation</h2>
        
        <div className="order-number">
          Order #: <strong>{order.order_number}</strong>
        </div>

        <div className="confirmation-items">
          <h3>Items:</h3>
          {order.items.map((item, index) => (
            <div key={index} className="confirmation-item">
              <span className="item-name">{item.name}</span>
              <span className="item-qty">x{item.quantity}</span>
              <span className="item-price">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="confirmation-summary">
          <div className="summary-row">
            <span>Total:</span>
            <strong>{formatPrice(order.total_amount)}</strong>
          </div>
          <div className="summary-row">
            <span>Cash:</span>
            <strong>{formatPrice(order.cash_amount)}</strong>
          </div>
          <div className="summary-row">
            <span>Change:</span>
            <strong>{formatPrice(order.change_amount)}</strong>
          </div>
        </div>

        {printError && (
          <div className="print-error">
            ⚠️ {printError}
          </div>
        )}

        <div className="confirmation-buttons">
          <button 
            className="print-btn"
            onClick={handlePrint}
            disabled={isPrinting}
          >
            {isPrinting ? '🖨️ Printing...' : '🖨️ Print Receipt'}
          </button>
          <button 
            className="close-btn"
            onClick={onClose}
          >
            ✓ Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
