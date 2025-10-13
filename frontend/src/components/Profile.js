import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../api';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="profile">
      <h1>My Profile</h1>

      <div className="profile-info">
        <h2>Account Information</h2>
        <div className="info-item">
          <strong>Username:</strong> {user.username}
        </div>
        <div className="info-item">
          <strong>Email:</strong> {user.email}
        </div>
      </div>

      <div className="orders-section">
        <h2>Order History</h2>
        {orders.length === 0 ? (
          <p>You haven't placed any orders yet.</p>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.id} className="order-item">
                <div className="order-header">
                  <span className="order-id">Order #{order.id}</span>
                  <span className="order-status">{order.status}</span>
                  <span className="order-date">{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                <div className="order-details">
                  <p className="order-items">{order.items}</p>
                  <p className="order-total">Total: ${order.total}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
