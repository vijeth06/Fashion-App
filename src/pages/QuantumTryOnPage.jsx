import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import QuantumTryOn from '../components/QuantumTryOn';

const QuantumTryOnPage = () => {
  const { user } = useAuth();
  const [selectedItem, setSelectedItem] = useState(null);
  const [indianProducts, setIndianProducts] = useState([]);

  useEffect(() => {
    const loadIndianProducts = async () => {
      try {
        const { default: indianProductService } = await import(
          '../services/indianProductService'
        );
        const result = await indianProductService.getAllProducts();

        if (result.success) {
          const quantumProducts = result.products.map((product) => ({
            ...product,
            id: product.productId,
            fabricPhysics: {
              quantumProperties: {
                colorShifting: product.type === 'saree' || product.type === 'kurta',
                temperatureAdaptive: product.material === 'Silk',
                materialDensity: product.type === 'hoodie' ? 0.8 : 0.5,
                elasticity: product.type === 'jeans' ? 0.3 : 0.7
              }
            }
          }));
          setIndianProducts(quantumProducts);

          const featured = quantumProducts.find((p) => p.featured);
          if (featured) setSelectedItem(featured);
        }
      } catch (error) {
        console.error('Failed to load Indian products for quantum try-on:', error);
      }
    };

    loadIndianProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-950/20 via-green-950/20 to-blue-950/20 py-8">
      {}
      <div className="container mx-auto px-6 mb-8">
        <div className="text-center">
          <h1 className="text-6xl font-black text-white mb-4">
            à¤•à¥à¤µà¤¾à¤‚à¤Ÿà¤®
            <span className="block text-transparent bg-gradient-to-r from-orange-400 via-white to-green-500 bg-clip-text">
              VIRTUAL TRY-ON
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Quantum Physics-Based Virtual Try-On for Fashion
          </p>
          <p className="text-lg text-gray-400">
            Quantum Physics-based Virtual Try-on for Indian Fashion
          </p>
        </div>
      </div>

      {}
      <div className="container mx-auto px-6 mb-8">
        <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-orange-400/30">
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
            🌟 <span className="ml-2">Select Fashion Items</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {indianProducts.slice(0, 12).map((item) => (
              <motion.div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`relative bg-black/40 backdrop-blur-xl border rounded-2xl p-4 cursor-pointer transition-all duration-300 ${
                  selectedItem?.id === item.id
                    ? 'border-orange-400 bg-orange-400/10'
                    : 'border-gray-600/30 hover:border-orange-400/50'
                }`}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="aspect-square bg-gradient-to-br from-orange-500/20 to-green-500/20 rounded-xl mb-3 flex items-center justify-center">
                  <span className="text-2xl">
                    {item.type === 'kurta'
                      ? '👕'
                      : item.type === 'saree'
                        ? '🥻'
                        : item.type === 'jacket'
                          ? '🧥'
                          : item.type === 'jeans'
                            ? '👖'
                            : '👔'}
                  </span>
                </div>
                <h4 className="text-white font-mono text-xs mb-1 truncate">
                  {item.name}
                </h4>
                <p className="text-gray-400 text-xs truncate">{item.brand}</p>
                <p className="text-orange-400 text-xs font-bold">
                  ₹{item.price.selling.toLocaleString('en-IN')}
                </p>

                {}
                <div className="absolute top-2 right-2 flex flex-col space-y-1">
                  {item.fabricPhysics?.quantumProperties?.colorShifting && (
                    <div
                      className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"
                      title="Color Shifting"
                    />
                  )}
                  {item.fabricPhysics?.quantumProperties?.temperatureAdaptive && (
                    <div
                      className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"
                      title="Temperature Adaptive"
                    />
                  )}
                  <div
                    className="w-2 h-2 bg-green-400 rounded-full animate-pulse"
                    title="Quantum Enabled"
                  />
                </div>

                {}
                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  {item.region === 'Pan-India'
                    ? '🇮🇳'
                    : item.region === 'North Indian'
                      ? 'N'
                      : item.region === 'South Indian'
                        ? 'S'
                        : '🌍'}
                </div>
              </motion.div>
            ))}
          </div>
          <p className="text-gray-400 text-sm mt-4 text-center">
            Select an item to experience quantum fabric simulation • à¤†à¤‡à¤Ÿà¤® à¤šà¥à¤¨à¥‡à¤‚ à¤”à¤°
            à¤•à¥à¤µà¤¾à¤‚à¤Ÿà¤® à¤•à¤ªà¤¡à¤¼à¤¾ à¤¸à¤¿à¤®à¥à¤²à¥‡à¤¶à¤¨ à¤•à¤¾ à¤…à¤¨à¥à¤­à¤µ à¤•à¤°à¥‡à¤‚
          </p>
        </div>
      </div>

      {}
      <QuantumTryOn
        selectedItem={selectedItem}
        userProfile={user}
        onItemSelect={setSelectedItem}
        indianProducts={indianProducts}
      />
    </div>
  );
};

export default QuantumTryOnPage;
