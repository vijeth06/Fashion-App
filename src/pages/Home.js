import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="text-center">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-6">Virtual Fashion Try-On</h1>
        <p className="text-xl text-gray-600 mb-12">
          Try on the latest fashion trends from the comfort of your home. No fitting rooms, no hassle!
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">ðŸ‘•</div>
            <h2 className="text-2xl font-bold mb-4">Browse Catalog</h2>
            <p className="text-gray-600 mb-6">Explore our collection of trendy clothing items and accessories.</p>
            <Link to="/catalog" className="btn btn-primary">
              View Catalog
            </Link>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">ðŸ“¸</div>
            <h2 className="text-2xl font-bold mb-4">Try It On</h2>
            <p className="text-gray-600 mb-6">Upload your photo and see how our clothes look on you.</p>
            <Link to="/try-on" className="btn btn-secondary">
              Start Trying On
            </Link>
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureStep 
              number="1" 
              title="Upload Your Photo" 
              description="Take a selfie or upload a full-body photo with a clear background." 
            />
            <FeatureStep 
              number="2" 
              title="Choose Outfits" 
              description="Browse our catalog and select items you'd like to try on." 
            />
            <FeatureStep 
              number="3" 
              title="See the Magic" 
              description="Our AI will show you how the outfit looks on you in real-time." 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureStep = ({ number, title, description }) => (
  <div className="flex flex-col items-center text-center">
    <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mb-4">
      {number}
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default Home;
