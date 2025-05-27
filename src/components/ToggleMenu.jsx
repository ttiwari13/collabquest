import React, { useState } from 'react';
import { HiX } from 'react-icons/hi';
import { FaBars } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '../firebase';
import img1 from '../assets/pic1.png';
import img2 from '../assets/pic2.png';
import img3 from '../assets/pic3.png';
import img4 from '../assets/pic4.png';

const ToggleMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // ✅ Get workspaceId from localStorage (or wherever you're storing it)
  const workspaceId = localStorage.getItem('selectedWorkspaceId');

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false); // Close menu
  };

  const handleLogout = async () => {
    try {
      const auth = getAuth(app);
      await signOut(auth);
      alert('You have logged out successfully!');
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      alert('Error logging out. Please try again.');
    }
  };

  return (
    <div className="fixed top-8 right-20 z-50 overflow-visible">
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="text-3xl text-[#397f8a]">
          <FaBars />
        </button>
      )}

      <div
        className={`fixed top-0 right-0 h-full w-64 text-[#CAB964] p-6 overflow-hidden transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ backgroundColor: '#265B63' }}
      >
        {/* Decorative Images */}
        <img src={img1} alt="bg1" className="absolute top-4 left-6 w-20 opacity-70 rotate-12 pointer-events-none" />
        <img src={img2} alt="bg2" className="absolute top-1/3 right-4 w-20 opacity-80 -rotate-6 pointer-events-none" />
        <img src={img3} alt="bg3" className="absolute bottom-20 left-8 w-20 opacity-75 rotate-3 pointer-events-none" />
        <img src={img4} alt="bg4" className="absolute bottom-8 right-6 w-20 opacity-90 -rotate-12 pointer-events-none" />

        {/* Close Button */}
        <div className="flex justify-end z-10 relative">
          <button onClick={() => setIsOpen(false)} className="text-2xl text-[#CAB964]">
            <HiX />
          </button>
        </div>

        {/* Menu Items */}
        <ul className="space-y-6 mt-10 text-lg font-medium relative z-10">
          <li className="cursor-pointer" onClick={() => handleNavigation('/dashboard')}>
            Dashboard
          </li>
          <li className="cursor-pointer" onClick={() => handleNavigation('/settings')}>
            Settings
          </li>
          <li className="cursor-pointer" onClick={handleLogout}>
            Logout
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ToggleMenu;
