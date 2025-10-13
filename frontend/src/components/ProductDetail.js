import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { productsAPI } from '../api';
import { useCart } from '../context/CartContext';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await productsAPI.getById(id);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, quantity);
      alert('Product added to cart!');
    } catch (error) {
      alert('Failed to add product to cart. Please login first.');
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= product.stock) {
      setQuantity(value);
    }
  };

  if (loading) {
    return <div className="loading">Loading product...</div>;
  }

  if (!product) {
    return <div className="error">Product not found</div>;
  }

  return (
    <div className="product-detail">
      <div className="product-detail-container">
        <div className="product-image-section">
          <img src={product.image_url} alt={product.name} className="product-detail-image" />
        </div>

        <div className="product-info-section">
          <h1>{product.name}</h1>
          <p className="product-category">Category: {product.category}</p>
          <p className="product-description">{product.description}</p>
          <p className="product-price">${product.price}</p>
          <p className={`product-stock ${product.stock === 0 ? 'out-of-stock' : ''}`}>
            Stock: {product.stock}
          </p>

          {product.stock > 0 && (
            <div className="add-to-cart-section">
              <label htmlFor="quantity">Quantity:</label>
              <input
                type="number"
                id="quantity"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={handleQuantityChange}
                className="quantity-input"
              />
              <button onClick={handleAddToCart} className="add-to-cart-btn">
                Add to Cart
              </button>
            </div>
          )}

          {product.stock === 0 && (
            <p className="out-of-stock-message">This product is currently out of stock.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
