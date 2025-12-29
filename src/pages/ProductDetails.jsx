import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import userService from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { useOutfit } from '../context/OutfitContext';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addFavorite } = useOutfit();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        setError(null);
        const data = await productService.getProductById(id);
        if (data && data.product) {
          setProduct(data.product);

          if (user?.uid) {
            const wishlist = await userService.getWishlist(user.uid);
            const isInWishlist = wishlist.wishlist?.some(item => 
              item.productId === data.product.productId
            );
            setIsFavorite(isInWishlist);
          }
        } else {
          setError('Product not found');
          setTimeout(() => navigate('/catalog'), 2000);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id, navigate, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Error Loading Product</h2>
          <p className="text-gray-400 mb-6">{error || 'Product not found'}</p>
          <Link to="/catalog" className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg transition-all">
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const productImages = [
    product.images?.main || product.imageUrl || '/placeholder.jpg',
    product.images?.overlay || product.images?.main || '/placeholder.jpg',
    product.images?.main || '/placeholder.jpg',
    product.images?.overlay || '/placeholder.jpg'
  ];

  const sizes = product.inventory?.sizes?.filter(s => s.stock > 0).map(s => s.size) || ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', '4XL'];

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const productId = product.productId || product._id;
      await userService.addToCart(user.uid, {
        productId,
        quantity,
        size: selectedSize
      });
      alert(`Added ${quantity} x ${product.name?.en || product.name} (Size: ${selectedSize}) to cart!`);
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Failed to add to cart. Please try again.');
    }
  };

  const handleAddToFavorites = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const productId = product.productId || product._id;
      if (isFavorite) {
        await userService.removeFromWishlist(user.uid, productId);
      } else {
        await userService.addToWishlist(user.uid, productId);
      }
      addFavorite(product);
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error('Error updating favorites:', err);
      alert('Failed to update favorites. Please try again.');
    }
  };

  const averageRating = product?.reviews?.averageRating || 
    (product?.reviews?.items?.length > 0 
      ? product.reviews.items.reduce((acc, review) => acc + review.rating, 0) / product.reviews.items.length 
      : 0);

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container py-10">
        {}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-300">
            <Link to="/" className="hover:text-cyan-400">Home</Link>
            <span className="text-gray-500">/</span>
            <Link to="/catalog" className="hover:text-cyan-400">Catalog</Link>
            <span className="text-gray-500">/</span>
            <span className="text-white/90 capitalize">{product.category}</span>
            <span className="text-gray-500">/</span>
            <span className="text-white">{product.name?.en || product.name}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {}
          <div className="space-y-4">
            {}
            <div className="aspect-square overflow-hidden rounded-2xl card">
              <img
                src={productImages[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {}
            <div className="grid grid-cols-4 gap-2">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square overflow-hidden rounded-xl border-2 transition-colors ${
                    selectedImageIndex === index ? 'border-cyan-400' : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {}
          <div className="space-y-6">
            {}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs tracking-wide text-black font-bold capitalize bg-gradient-to-r from-emerald-400 to-cyan-400 px-3 py-1 rounded-full">
                  {product.category}
                </span>
                {product.brand && (
                  <span className="text-xs tracking-wide text-white/80 uppercase">
                    {product.brand}
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">{product.name?.en || product.name}</h1>
              
              {}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(averageRating) ? 'text-yellow-400' : 'text-gray-600'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-gray-400">({product.reviews?.count || product.reviews?.items?.length || 0} reviews)</span>
              </div>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  ₹{(product.pricing?.selling || product.price || 0).toLocaleString('en-IN')}
                </div>
                {product.pricing?.mrp && product.pricing.mrp > product.pricing.selling && (
                  <div className="text-xl text-gray-500 line-through">
                    ₹{product.pricing.mrp.toLocaleString('en-IN')}
                  </div>
                )}
                {product.pricing?.discount && (
                  <span className="px-2 py-1 bg-red-500 text-white text-sm font-bold rounded">
                    {product.pricing.discount}% OFF
                  </span>
                )}
              </div>
            </div>

            {}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-lg font-semibold text-white">Size</label>
                <button
                  onClick={() => setShowSizeGuide(true)}
                  className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
                >
                  Size Guide
                </button>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 px-4 border-2 rounded-xl font-medium transition-colors ${
                      selectedSize === size
                        ? 'border-cyan-400 bg-cyan-400/10 text-cyan-300'
                        : 'border-white/10 hover:border-white/30 text-gray-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {}
            <div>
              <label className="text-lg font-semibold text-white mb-3 block">Quantity</label>
              <div className="flex items-center border border-white/20 rounded-xl w-36 bg-white/5">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-white/10 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="flex-1 text-center py-2 font-medium text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-white/10 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            {}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                className="w-full btn-primary py-4 px-6 text-lg"
              >
                Add to Cart - ₹{((product.pricing?.selling || product.price || 0) * quantity).toLocaleString('en-IN')}
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/try-on"
                  className="flex items-center justify-center gap-2 btn-secondary py-3 px-6"
                >
                  <span>✨</span>
                  Virtual Try-On
                </Link>
                <button
                  onClick={handleAddToFavorites}
                  className={`flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-medium transition-colors ${
                    isFavorite
                      ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30'
                      : 'btn-outline'
                  }`}
                >
                  <svg className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {isFavorite ? 'Favorited' : 'Add to Favorites'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {}
        {showSizeGuide && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="card max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Size Guide</h2>
                  <button
                    onClick={() => setShowSizeGuide(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 font-semibold text-white">Size</th>
                        <th className="text-left py-3 px-4 font-semibold text-white">Chest (inches)</th>
                        <th className="text-left py-3 px-4 font-semibold text-white">Waist (inches)</th>
                        <th className="text-left py-3 px-4 font-semibold text-white">Length (inches)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.sizeGuide && Object.keys(product.sizeGuide).length > 0 ? (
                        Object.entries(product.sizeGuide).map(([size, measurements]) => (
                          <tr key={size} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-3 px-4 font-medium text-white">{size}</td>
                            <td className="py-3 px-4 text-gray-200">{measurements.chest || 'N/A'}</td>
                            <td className="py-3 px-4 text-gray-200">{measurements.waist || 'N/A'}</td>
                            <td className="py-3 px-4 text-gray-200">{measurements.length || 'N/A'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="py-6 px-4 text-center text-gray-400">
                            Size guide not available for this product
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                  <h3 className="font-semibold text-white mb-2">How to Measure</h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• <strong>Chest:</strong> Measure around the fullest part of your chest</li>
                    <li>• <strong>Waist:</strong> Measure around your natural waistline</li>
                    <li>• <strong>Length:</strong> Measure from shoulder to desired hem length</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}