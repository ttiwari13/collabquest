import React, { useState } from 'react';
import { firestore } from '../../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const CreateWorkspace = ({ onWorkspaceCreated }) => {
  const [workspaceName, setWorkspaceName] = useState('');
  const [error, setError] = useState('');
  const auth = getAuth();
  const user = auth.currentUser;

  const handleCreateWorkspace = async () => {
    if (!workspaceName) {
      setError('Please enter a workspace name.');
      return;
    }

    if (!user) {
      setError('You must be logged in to create a workspace.');
      return;
    }

    try {
      // Try to get the user's firstname from Firestore
      let adminName = user.displayName || user.email;
      const userDoc = await getDoc(doc(firestore, 'users', user.uid));
      if (userDoc.exists() && userDoc.data().firstname) {
        adminName = userDoc.data().firstname;
      }

      const workspaceRef = doc(
        firestore,
        'workspaces',
        workspaceName.toLowerCase().replace(/\s+/g, '_')
      );
      const newWorkspace = {
        name: workspaceName,
        admin: user.uid,          // Admin's UID
        adminName: adminName,     // Admin's name (firstname preferred)
        members: [user.uid],      // The user is the first member
        createdAt: new Date(),
      };

      await setDoc(workspaceRef, newWorkspace);

      // Notify the parent component (Dashboard) that a workspace was created
      onWorkspaceCreated({ ...newWorkspace, id: workspaceRef.id });
      setWorkspaceName(''); // Reset input field
      setError('');
    } catch (err) {
      console.error("Error creating workspace: ", err);
      setError("Failed to create workspace.");
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold text-[#265B63] mb-4">Create a Workspace</h2>
      <input
        type="text"
        value={workspaceName}
        onChange={(e) => setWorkspaceName(e.target.value)}
        placeholder="Workspace Name"
        className="w-full p-2 border rounded mb-4"
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        onClick={handleCreateWorkspace}
        className="bg-[#265B63] text-white py-2 px-4 rounded hover:bg-[#1d474d]"
      >
        Create Workspace
      </button>
    </div>
  );
};

export default CreateWorkspace;
