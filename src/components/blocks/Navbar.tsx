import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as FlowbiteNavbar, Dropdown } from 'flowbite-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserCircleIcon } from '@heroicons/react/24/outline';

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <FlowbiteNavbar fluid rounded>
      <FlowbiteNavbar.Brand as={Link} to="/">
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
          THY Forum
        </span>
      </FlowbiteNavbar.Brand>
      <FlowbiteNavbar.Toggle />
      <FlowbiteNavbar.Collapse>
        <FlowbiteNavbar.Link href="/" active>
          Home
        </FlowbiteNavbar.Link>
        <FlowbiteNavbar.Link href="/topics">
          Topics
        </FlowbiteNavbar.Link>
        <FlowbiteNavbar.Link href="/about">
          About
        </FlowbiteNavbar.Link>
        <FlowbiteNavbar.Link href="/contact">
          Contact
        </FlowbiteNavbar.Link>
      </FlowbiteNavbar.Collapse>
      <div className="flex md:order-2">
        {user ? (
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <div className="flex items-center space-x-2">
                <UserCircleIcon className="h-8 w-8 text-gray-700 dark:text-gray-300" />
                <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.displayName || 'User'}
                </span>
              </div>
            }
          >
            <Dropdown.Header>
              <span className="block text-sm">{user?.displayName}</span>
              <span className="block truncate text-sm font-medium">{user?.email}</span>
            </Dropdown.Header>
            <Dropdown.Item as={Link} to="/profile">
              Profile
            </Dropdown.Item>
            <Dropdown.Item as={Link} to="/settings">
              Settings
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleLogout}>
              Sign out
            </Dropdown.Item>
          </Dropdown>
        ) : (
          <div className="flex space-x-4">
            <Link
              to="/login"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </FlowbiteNavbar>
  );
};

export default Navbar; 