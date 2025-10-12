import React from 'react';
import { Link, NavLink } from 'react-router-dom';

export default function NavBar() {
  return (
    <header className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="brand">VF Try-On</Link>
        <nav className="navlinks">
          <NavLink to="/catalog" className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}>Catalog</NavLink>
          <NavLink to="/try" className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}>Try On</NavLink>
          <NavLink to="/favorites" className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}>Favorites</NavLink>
          <NavLink to="/looks" className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}>Looks</NavLink>
          <NavLink to="/cart" className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}>Cart</NavLink>
          <NavLink to="/profile" className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}>Profile</NavLink>
        </nav>
      </div>
    </header>
  );
}