import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../utils/AuthContext';

const Header = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-blue-600 text-white">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          Secure Property Transaction
        </Link>
        <nav>
          <ul className="flex space-x-6">
            {currentUser ? (
              <>
                <li>
                  <span className="font-medium">Welcome, {currentUser.name}</span>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="hover:underline"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" className="hover:underline">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:underline">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;