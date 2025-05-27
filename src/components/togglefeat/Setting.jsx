import React, { useEffect, useState } from 'react';
import { getAuth, updateProfile, updatePassword } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '../../firebase';
import { FiEdit } from 'react-icons/fi';

const Setting = () => {
  const auth = getAuth(app);
  const storage = getStorage(app);

  const [name, setName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [changePhoto, setChangePhoto] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);

 useEffect(() => {
  const user = auth.currentUser;
  if (user) {
    setName(user.displayName || '');
    setEmail(user.email || '');
    setPhotoURL(user.photoURL || '');
  }
}, []); // only run once



  const handleImageUpload = async () => {
  if (!imageFile) return;
  const storageRef = ref(storage, `profileImages/${auth.currentUser.uid}`);
  await uploadBytes(storageRef, imageFile);
  const url = await getDownloadURL(storageRef);
  await updateProfile(auth.currentUser, { photoURL: url });
  await auth.currentUser.reload(); // refresh currentUser data
  setPhotoURL(auth.currentUser.photoURL || ''); // now photoURL is fresh
  setImageFile(null);
  setChangePhoto(false);
  alert('Profile picture updated!');
};

  const handleNameUpdate = async () => {
    await updateProfile(auth.currentUser, { displayName: name });
    alert('Name updated!');
    setIsEditingName(false);
  };

  const handlePasswordChange = async () => {
    try {
      await updatePassword(auth.currentUser, newPassword);
      alert('Password changed successfully!');
      setNewPassword('');
      setShowPasswordInput(false);
    } catch (err) {
      alert('Error updating password. You may need to re-authenticate.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#CAB964] py-12 px-6 flex justify-center items-start">
      <div className="bg-gradient-to-r from-[#265B63] to-[#CAB964] rounded-xl shadow-lg p-8 w-full max-w-2xl">
        <h2 className="text-3xl font-semibold text-[#265B63] mb-6 text-center">Settings</h2>

        {/* Profile Photo */}
        <div className="mb-6 text-center">
          <img
            src={photoURL || 'https://via.placeholder.com/100'}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover mx-auto mb-3 border-4 border-[#265B63]"
          />

          {!changePhoto ? (
            <button
              onClick={() => setChangePhoto(true)}
              className="px-4 py-2 bg-[#265B63] text-white rounded hover:bg-[#1d474d]"
            >
              Change Photo
            </button>
          ) : (
            <>
              <input
                type="file"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="mb-2 text-sm"
              />
              <div className="flex justify-center gap-2">
                <button
                  onClick={handleImageUpload}
                  className="px-4 py-2 bg-[#265B63] text-white rounded hover:bg-[#1d474d]"
                >
                  Upload
                </button>
                <button
                  onClick={() => {
                    setChangePhoto(false);
                    setImageFile(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>

        {/* Name with edit icon */}
        <div className="mb-6">
          <label className="block text-white font-semibold mb-1">Name</label>
          <div className="flex items-center gap-2 ">
            <input
              type="text"
              value={name}
              readOnly={!isEditingName}
              onChange={(e) => setName(e.target.value)}
              className={`w-full p-2 border  rounded focus:outline-none focus:ring-2 focus:ring-[#265B63] ${
                isEditingName ? '' : 'bg-gray-100 text-gray-700'
              }`}
            />
            {!isEditingName && (
              <button
                onClick={() => setIsEditingName(true)}
                className="text-[#265B63] hover:text-[#1d474d]"
                title="Edit name"
              >
                <FiEdit size={20} />
              </button>
            )}
          </div>
          {isEditingName && (
            <button
              onClick={handleNameUpdate}
              className="mt-2 px-4 py-2 bg-[#265B63] text-white rounded hover:bg-[#1d474d]"
            >
              Update
            </button>
          )}
        </div>

        {/* Email */}
        <div className="mb-6">
          <label className="block text-white font-semibold mb-1">Email</label>
          <input
            type="email"
            value={email}
            readOnly
            className="w-full p-2 border rounded bg-gray-100 text-gray-700"
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block text-white font-semibold mb-1">Password</label>
          {!showPasswordInput ? (
            <button
              onClick={() => setShowPasswordInput(true)}
              className="px-4 py-2 bg-[#265B63] text-white rounded hover:bg-[#1d474d]"
            >
              Change Password
            </button>
          ) : (
            <>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full p-2 mt-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#265B63]"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handlePasswordChange}
                  className="px-4 py-2 bg-[#265B63] text-white rounded hover:bg-[#1d474d]"
                >
                  Save New Password
                </button>
                <button
                  onClick={() => {
                    setShowPasswordInput(false);
                    setNewPassword('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Setting;
