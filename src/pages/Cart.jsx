import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import productService from '../services/productService';

export default function Cart() {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [showPromoInput, setShowPromoInput] = useState(false);

  useEffect(() => {
    async function fetchCart() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const cartData = await userService.getCart(user.uid);

        const itemsWithDetails = await Promise.all(
          (cartData.cart || []).map(async (item) => {
            try {
              const productData = await productService.getProductById(item.productId);
              const product = productData.product;
              return {
                id: item._id || item.productId,
                productId: item.productId,
                name: product.name?.en || product.name,
                price: product.pricing?.selling || product.price,
                mrp: product.pricing?.mrp,
                quantity: item.quantity,
                size: item.size,
                imageUrl: product.images?.main || product.imageUrl,
                category: product.category,
                tryOnPreview: product.images?.overlay || product.images?.main
              };
            } catch (err) {
              console.error(`Error fetching product ${item.productId}:`, err);
              return null;
            }
          })
        );
        setCartItems(itemsWithDetails.filter(item => item !== null));
      } catch (err) {
        console.error('Error fetching cart:', err);
        setError(err.message || 'Failed to load cart');
      } finally {
        setLoading(false);
      }
    }
    fetchCart();
  }, [user]);

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    try {
      const item = cartItems.find(i => i.id === itemId);

      const inventoryResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/api/v1/products/${item.productId}/inventory?size=${item.size}`
      );
      const inventoryData = await inventoryResponse.json();

      if (inventoryData.available < newQuantity) {
        alert(`Only ${inventoryData.available} items available in stock`);
        return;
      }

      const oldCartItems = [...cartItems];

      setCartItems(prev =>
        prev.map(i =>
          i.id === itemId
            ? { ...i, quantity: newQuantity }
            : i
        )
      );

      const response = await userService.updateCartItem(
        user.uid,
        item.productId,
        { quantity: newQuantity, size: item.size }
      );

      if (!response.success) {

        setCartItems(oldCartItems);
        alert('Failed to update cart. Reverted to previous state.');
        return;
      }

      const cartResponse = await userService.getCart(user.uid);
      setCartItems(cartResponse.cart.map(cartItem => ({
        ...cartItem,
        id: cartItem._id || cartItem.productId
      })));

    } catch (err) {
      console.error('Error updating quantity:', err);
      alert('Failed to update quantity. Please try again.');

      try {
        const freshCart = await userService.getCart(user.uid);
        setCartItems(freshCart.cart.map(cartItem => ({
          ...cartItem,
          id: cartItem._id || cartItem.productId
        })));
      } catch (fetchError) {
        console.error('Error fetching fresh cart:', fetchError);
      }
    }
  };

  const removeItem = async (itemId) => {
    try {
      const item = cartItems.find(i => i.id === itemId);
      await userService.removeFromCart(user.uid, item.productId);
      setCartItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      console.error('Error removing item:', err);
      alert('Failed to remove item. Please try again.');
    }
  };

  const applyCoupon = async () => {
    if (!promoCode.trim()) {
      alert('Please enter a coupon code');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/v1/coupons/validate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: promoCode.trim(),
            cartValue: subtotal,
            userId: user.uid
          })
        }
      );

      const data = await response.json();

      if (!data.success) {
        alert(data.message || 'Invalid coupon code');
        return;
      }

      setDiscount(data.coupon.discountAmount / subtotal);
      alert(
        `Coupon applied! â‚¹${data.coupon.discountAmount} discount`
      );
      setShowPromoInput(false);

    } catch (error) {
      console.error('Error applying coupon:', error);
      alert('Failed to apply coupon. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = subtotal * discount;
  const shipping = subtotal > 2000 ? 0 : 99; // Free shipping above â‚¹2000
  const gst = (subtotal - discountAmount) * 0.18; // 18% GST
  const total = subtotal - discountAmount + shipping + gst;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">ðŸ›’</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign in to view your cart</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to access your shopping cart.</p>
          <Link to="/login" className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Cart</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">Review your items before checkout</p>
        </div>

        {cartItems.length === 0 ? (
          
          <div className="text-center py-16">
            <div className="text-8xl mb-6">ðŸ›’</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8 text-lg">Looks like you haven't added any items to your cart yet.</p>
            <div className="space-y-4">
              <Link 
                to="/catalog"
                className="inline-block bg-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-purple-700 transition-colors"
              >
                Start Shopping
              </Link>
              <div className="text-center">
                <Link to="/try-on" className="text-purple-600 hover:text-purple-700 font-medium">
                  Or try our Virtual Try-On â†’
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row gap-6">
                    {}
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {item.tryOnPreview && (
                        <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                          <img 
                            src={item.tryOnPreview} 
                            alt={`${item.name} try-on preview`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-1 left-1 bg-purple-600 text-white text-xs px-1 py-0.5 rounded">
                            Try-On
                          </div>
                        </div>
                      )}
                    </div>

                    {}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-gray-600 capitalize text-sm">{item.category} â€¢ Size: {item.size}</p>
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Qty:</span>
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 hover:bg-gray-50 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 hover:bg-gray-50 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">
                            â‚¹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </div>
                          <div className="text-sm text-gray-500">
                            â‚¹{item.price.toLocaleString('en-IN')} each
                          </div>
                          {item.mrp && item.mrp > item.price && (
                            <div className="text-xs text-green-600">
                              Save â‚¹{((item.mrp - item.price) * item.quantity).toLocaleString('en-IN')}
                            </div>
                          )}
                        </div>
                      </div>

                      {}
                      <div className="mt-4 flex gap-2">
                        <Link 
                          to="/try-on"
                          className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1"
                        >
                          <span>âœ¨</span>
                          Try On Again
                        </Link>
                        <Link 
                          to={`/catalog/${item.productId}`}
                          className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {}
              <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
                <p className="text-gray-600 mb-4">Need more items?</p>
                <Link 
                  to="/catalog"
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Continue Shopping â†’
                </Link>
              </div>
            </div>

            {}
            <div className="space-y-6">
              {}
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span>â‚¹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({(discount * 100).toFixed(0)}%)</span>
                      <span>-â‚¹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'FREE' : `â‚¹${shipping.toLocaleString('en-IN')}`}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600">
                    <span>GST (18%)</span>
                    <span>â‚¹{gst.toLocaleString('en-IN')}</span>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-semibold text-gray-900">
                      <span>Total</span>
                      <span>â‚¹{Math.round(total).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {}
                <div className="mt-6">
                  {!showPromoInput ? (
                    <button
                      onClick={() => setShowPromoInput(true)}
                      className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                    >
                      + Add promo code
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="Enter promo code"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <button
                          onClick={applyCoupon}
                          disabled={loading || !promoCode.trim()}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors disabled:opacity-50"
                        >
                          {loading ? 'Applying...' : 'Apply'}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">Try: SAVE10 or WELCOME20</p>
                    </div>
                  )}
                </div>

                {}
                {subtotal < 2000 && subtotal > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      ðŸ’¡ Add â‚¹{(2000 - subtotal).toLocaleString('en-IN')} more for free shipping!
                    </p>
                  </div>
                )}

                {}
                <Link
                  to="/checkout"
                  className="w-full mt-6 bg-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-center block hover:bg-purple-700 transition-colors"
                >
                  Proceed to Checkout
                </Link>

                {}
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Secure checkout</span>
                </div>
              </div>

              {}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Your Look</h3>
                <p className="text-sm text-gray-500">Product recommendations will appear here</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}