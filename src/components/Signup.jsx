import React, { useState, useEffect } from 'react';
import { getAuth, createUserWithEmailAndPassword, updateProfile, onAuthStateChanged } from 'firebase/auth';
import { app } from '../firebase';
import { setDoc, doc } from 'firebase/firestore'; // <-- Import Firestore methods
import { firestore } from '../firebase';           // <-- Import your Firestore instance
import pic1 from '../assets/pic1.png';
import pic2 from '../assets/pic2.png';
import pic3 from '../assets/pic3.png';
import pic4 from '../assets/pic4.png';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const auth = getAuth(app);
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Handle form submission
 const handleSignup = async (e) => {
  e.preventDefault();

  if (password !== confirmPassword) {
    alert('Passwords do not match!');
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: firstName });
    await setDoc(doc(firestore, 'users', userCredential.user.uid), {
      displayName: firstName,
      firstname: firstName,
      email: email,
    });

    alert('Account created successfully!');
    navigate('/dashboard');
  } catch (error) {
    console.error('Error creating account:', error);
    alert(error.message);
  }
};


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Current user:", user);
        console.log("Current displayName:", user.displayName);
      } else {
        console.log("No user is signed in.");
      }
    });
    return () => unsubscribe();
  }, [auth]);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center" style={{ backgroundColor: '#397f8a' }}>
      {/* Background images */}
      <img src={pic1} alt="pic1" className="absolute top-8 left-8 w-1/3 h-1/3 object-contain opacity-80" style={{ transform: 'rotate(-10deg)' }} />
      <img src={pic2} alt="pic2" className="absolute top-8 right-1 w-1/3 h-1/3 object-contain opacity-80" style={{ transform: 'rotate(10deg)' }} />
      <img src={pic3} alt="pic3" className="absolute bottom-8 left-1 w-1/3 h-1/3 object-contain opacity-80" style={{ transform: 'rotate(12deg)' }} />
      <img src={pic4} alt="pic4" className="absolute bottom-8 right-1 w-1/2 h-1/2 object-contain opacity-80" style={{ transform: 'rotate(-8deg)' }} />

      {/* Signup Form */}
      <div className="relative z-10 px-10 py-12 rounded-none shadow-lg w-[30rem]" style={{ backgroundColor: '#CAB964' }}>
        <div className="flex justify-center mb-6">
          <img src="/logocoll.png" alt="Logo" className="w-28 h-28 object-contain" />
        </div>
        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="p-2 rounded bg-white placeholder-[#397f8a]"
            required
          />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 rounded bg-white placeholder-[#397f8a]"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-2 rounded bg-white placeholder-[#397f8a]"
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="p-2 rounded bg-white placeholder-[#397f8a]"
            required
          />
          <input
            type="text"
            value="Contributor"
            disabled
            className="p-2 rounded bg-gray-200 text-[#397f8a] cursor-not-allowed"
          />
          <button
            type="submit"
            className="bg-[#397f8a] hover:bg-[#4fa4b1] text-white py-2 rounded transition-colors duration-300"
          >
            Create Account
          </button>
        </form>
        <div className="text-center mt-4">
          <p className="text-[#2a5c63]">
            Already have an account?{' '}
            <a href="/login" className="text-[#397f8a] font-medium">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
