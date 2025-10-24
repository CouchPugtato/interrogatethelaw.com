import React from 'react';
import { Link } from 'react-router-dom';
import "./Header.css";

function Header() {
  return (
    <header className="App-header">
      <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontSize: '1.25rem', fontWeight: 700 }}>
        InterrogateTheLaw.com
      </Link>
      <nav className='nav-bar'>
        <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>Bills</Link>
        <Link to="/about" style={{ color: '#fff', textDecoration: 'none' }}>About</Link>
      </nav>
    </header>
  );
}

export default Header;