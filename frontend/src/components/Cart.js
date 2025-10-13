import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ordersAPI } from '../api';
import './Cart.css';

const Cart = () => {
  const { cart, loading, updateCartItem, removeFromCart, getCartTotal } = useCart();

  const handleQuantityChange = async (id, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItem(id, newQuantity);
    } catch (error) {
      alert('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (id) => {
    if (window.confirm('Are you sure you want to remove this item from your cart?')) {
      try {
        await removeFromCart(id);
      } catch (error) {
        alert('Failed to remove item');
      }
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      await ordersAPI.createOrder();
      alert('Order placed successfully!');
      // Cart will be cleared automatically by the backend
    } catch (error) {
      alert('Failed to place order');
    }
  };

  if (loading) {
    return <div className="loading">Loading cart...</div>;
  }

  if (cart.length === 0) {
    return (
      <div className="empty-cart">
        <h1>Your Cart is Empty</h1>
        <p>Add some products to your cart to get started.</p>
        <Link to="/products" className="shop-now-btn">Shop Now</Link>
      </div>
    );
  }

  return (
    <div className="cart">
      <h1>Shopping Cart</h1>

      <div className="cart-content">
        <div className="cart-items">
          {cart.map(item => (
            <div key={item.id} className="cart-item">
              <img src={item.image_url} alt={item.name} className="cart-item-image" />
              <div className="cart-item-info">
                <h3>{item.name}</h3>
                <p className="cart-item-price">${item.price}</p>
              </div>
              <div className="cart-item-controls">
                <div className="quantity-controls">
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    className="quantity-btn"
                  >
                    -
                  </button>
                  <span className="quantity">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    className="quantity-btn"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="remove-btn"
                >
                  Remove
                </button>
              </div>
              <div className="cart-item-total">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal ({cart.length} items):</span>
            <span>${getCartTotal().toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>${getCartTotal().toFixed(2)}</span>
          </div>
          <button onClick={handleCheckout} className="checkout-btn">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
