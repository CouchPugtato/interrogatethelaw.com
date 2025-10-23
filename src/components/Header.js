import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="App-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontSize: '1.25rem', fontWeight: 700 }}>
        InterrogateTheLaw.com
      </Link>
      <nav style={{ display: 'flex', gap: '12px' }}>
        <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>Bills</Link>
        <Link to="/about" style={{ color: '#fff', textDecoration: 'none' }}>About</Link>
      </nav>
    </header>
  );
}

export default Header;