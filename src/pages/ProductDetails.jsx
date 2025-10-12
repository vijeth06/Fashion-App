import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { clothingItems } from '../data/clothingItems';
import { useAuth } from '../context/AuthContext';
import { useOutfit } from '../context/OutfitContext';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addFavorite } = useOutfit();
  
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Mock additional product data
  const productDetails = {
    description: "This premium piece combines comfort and style for the modern wardrobe. Crafted with high-quality materials and attention to detail, it's perfect for both casual and semi-formal occasions.",
    features: [
      "Premium quality fabric",
      "Comfortable fit",
      "Easy care instructions",
      "Available in multiple sizes",
      "Sustainable materials"
    ],
    specifications: {
      "Material": "100% Cotton",
      "Care": "Machine wash cold",
      "Origin": "Made in USA",
      "Fit": "Regular"
    },
    sizeGuide: {
      "XS": { chest: "32-34", waist: "24-26", length: "24" },
      "S": { chest: "34-36", waist: "26-28", length: "25" },
      "M": { chest: "36-38", waist: "28-30", length: "26" },
      "L": { chest: "38-40", waist: "30-32", length: "27" },
      "XL": { chest: "40-42", waist: "32-34", length: "28" },
      "XXL": { chest: "42-44", waist: "34-36", length: "29" }
    },
    reviews: [
      {
        id: 1,
        user: "Sarah M.",
        rating: 5,
        comment: "Love this piece! Perfect fit and great quality. The virtual try-on helped me choose the right size.",
        date: "2024-01-15"
      },
      {
        id: 2,
        user: "Mike R.",
        rating: 4,
        comment: "Good quality and fast shipping. Exactly as shown in the virtual try-on.",
        date: "2024-01-10"
      },
      {
        id: 3,
        user: "Emma K.",
        rating: 5,
        comment: "Amazing! The virtual fitting was so accurate. Highly recommend!",
        date: "2024-01-08"
      }
    ]
  };

  useEffect(() => {
    const foundProduct = clothingItems.find(item => item.id === parseInt(id));
    if (foundProduct) {
      setProduct(foundProduct);
    } else {
      navigate('/catalog');
    }
  }, [id, navigate]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Mock multiple images (using same image for demo)
  const productImages = [
    product.imageUrl,
    product.imageUrl,
    product.imageUrl,
    product.imageUrl
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Add to cart logic here
    alert(`Added ${quantity} x ${product.name} (Size: ${selectedSize}) to cart!`);
  };

  const handleAddToFavorites = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    addFavorite(product);
    setIsFavorite(!isFavorite);
  };

  const averageRating = productDetails.reviews.reduce((acc, review) => acc + review.rating, 0) / productDetails.reviews.length;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container py-10">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-300">
            <Link to="/" className="hover:text-cyan-400">Home</Link>
            <span className="text-gray-500">/</span>
            <Link to="/catalog" className="hover:text-cyan-400">Catalog</Link>
            <span className="text-gray-500">/</span>
            <span className="text-white/90 capitalize">{product.category}</span>
            <span className="text-gray-500">/</span>
            <span className="text-white">{product.name}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square overflow-hidden rounded-2xl card">
              <img
                src={productImages[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Image Thumbnails */}
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

          {/* Product Information */}
          <div className="space-y-6">
            {/* Product Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs tracking-wide text-black font-bold capitalize bg-gradient-to-r from-emerald-400 to-cyan-400 px-3 py-1 rounded-full">
                  {product.category}
                </span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">{product.name}</h1>
              
              {/* Rating */}
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
                <span className="text-gray-400">({productDetails.reviews.length} reviews)</span>
              </div>
              
              <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-6">${product.price}</div>
            </div>

            {/* Size Selection */}
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

            {/* Quantity */}
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

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                className="w-full btn-primary py-4 px-6 text-lg"
              >
                Add to Cart - ${(product.price * quantity).toFixed(2)}
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

        {/* Size Guide Modal */}
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
                      {Object.entries(productDetails.sizeGuide).map(([size, measurements]) => (
                        <tr key={size} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3 px-4 font-medium text-white">{size}</td>
                          <td className="py-3 px-4 text-gray-200">{measurements.chest}</td>
                          <td className="py-3 px-4 text-gray-200">{measurements.waist}</td>
                          <td className="py-3 px-4 text-gray-200">{measurements.length}</td>
                        </tr>
                      ))}
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