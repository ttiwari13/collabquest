// Login.jsx
// Created by Tanishka ✨

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import pic1 from '../assets/pic1.png';
import pic2 from '../assets/pic2.png';
import pic3 from '../assets/pic3.png';
import pic4 from '../assets/pic4.png';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      navigate('/home');
    } catch (err) {
      setError('Failed to log in. Please check your credentials and try again.');
    }
  };

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center"
      style={{ backgroundColor: '#397f8a' }}
    >
      {/* Decorative Images */}
      <img src={pic1} alt="pic1" className="absolute top-8 left-8 w-1/3 h-1/3 object-contain opacity-80" style={{ transform: 'rotate(-10deg)' }} />
      <img src={pic2} alt="pic2" className="absolute top-8 right-1 w-1/3 h-1/3 object-contain opacity-80" style={{ transform: 'rotate(10deg)' }} />
      <img src={pic3} alt="pic3" className="absolute bottom-8 left-1 w-1/3 h-1/3 object-contain opacity-80" style={{ transform: 'rotate(12deg)' }} />
      <img src={pic4} alt="pic4" className="absolute bottom-8 right-1 w-1/2 h-1/2 object-contain opacity-80" style={{ transform: 'rotate(-8deg)' }} />

      {/* Login Form */}
      <div className="relative z-10 px-10 py-12 shadow-lg w-[30rem]" style={{ backgroundColor: '#CAB964' }}>
        <div className="flex justify-center mb-6">
          <img src="/logocoll.png" alt="Logo" className="w-28 h-28 object-contain" />
        </div>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email Address"
            className="p-2 rounded bg-white placeholder-[#397f8a]"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="p-2 rounded bg-white placeholder-[#397f8a]"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <button
            type="submit"
            className="bg-[#397f8a] hover:bg-[#4fa4b1] text-white py-2 rounded transition-colors duration-300"
          >
            Login
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-[#2a5c63]">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#397f8a] font-medium">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
