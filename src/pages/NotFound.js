import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center py-12 px-4">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-3xl font-semibold mb-4">Page Not Found</h2>
      <p className="text-gray-600 mb-8 max-w-md">
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link 
          to="/" 
          className="btn btn-primary px-6 py-3"
        >
          â† Back to Home
        </Link>
        <Link 
          to="/catalog" 
          className="btn btn-outline px-6 py-3"
        >
          Browse Catalog
        </Link>
      </div>
      <div className="mt-12 text-gray-400">
        <p className="text-sm">Looking for something specific? Try our search or contact support.</p>
      </div>
    </div>
  );
};

export default NotFound;
