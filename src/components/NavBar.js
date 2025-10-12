import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavBar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-primary">Virtual Try-On</span>
          </Link>
          
          <div className="hidden md:flex space-x-8">
            <NavLink to="/" isActive={isActive('/')}>
              Home
            </NavLink>
            <NavLink to="/catalog" isActive={isActive('/catalog')}>
              Catalog
            </NavLink>
            <NavLink to="/try" isActive={isActive('/try')}>
              Try On
            </NavLink>
            <NavLink to="/favorites" isActive={isActive('/favorites')}>
              Favorites
            </NavLink>
          </div>
          
          <div className="md:hidden">
            {/* Mobile menu button */}
            <button className="text-dark hover:text-primary focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className="md:hidden hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <MobileNavLink to="/" isActive={isActive('/')}>
            Home
          </MobileNavLink>
          <MobileNavLink to="/catalog" isActive={isActive('/catalog')}>
            Catalog
          </MobileNavLink>
          <MobileNavLink to="/try" isActive={isActive('/try')}>
            Try On
          </MobileNavLink>
          <MobileNavLink to="/favorites" isActive={isActive('/favorites')}>
            Favorites
          </MobileNavLink>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, isActive, children }) => (
  <Link
    to={to}
    className={`px-3 py-2 text-sm font-medium ${
      isActive
        ? 'text-primary border-b-2 border-primary'
        : 'text-dark hover:text-primary'
    }`}
  >
    {children}
  </Link>
);

const MobileNavLink = ({ to, isActive, children }) => (
  <Link
    to={to}
    className={`block px-3 py-2 rounded-md text-base font-medium ${
      isActive ? 'bg-primary text-white' : 'text-dark hover:bg-gray-50'
    }`}
  >
    {children}
  </Link>
);

export default NavBar;
