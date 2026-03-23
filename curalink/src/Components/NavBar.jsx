import React from 'react';
import './NavBar.css';
import logo from './CuraLinkLogo.png';
import { Link } from 'react-router-dom';

function NavBar() {
  
  return (
    <div className='NavBarContainer'>

      <nav className="navbar">

        <Link to="/" className="brand">
          <img src={logo} alt="CuraLink logo" style={{ width: '30px' }} />
          <span className="brand-name">CuraLink</span>
        </Link>

        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/services">Services</Link></li>
          <li><Link to="/about">About Us</Link></li>
          {/* <li><Link to="/faq">FAQ</Link></li> */}
        </ul>

        <div className="auth-buttons">
            <Link to="/find" className="btn-quote">Find Out</Link>
        </div>

        

    </nav>
    </div>
  )
}

export default NavBar