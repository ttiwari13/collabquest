import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { firestore } from '../../firebase';
import CreateWorkspace from './CreateWorkspace.jsx';
import MemberList from './MemberList.jsx';
import ToDoList from './ToDoList.jsx'; // <-- Import ToDoList here
import { FaTrashAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [myWorkspaces, setMyWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, [auth]);

  // Redirect to signup if not logged in, but only after auth is checked
  useEffect(() => {
    if (authChecked && !user) {
      navigate('/signup');
    }
  }, [authChecked, user, navigate]);

  const fetchMyWorkspaces = async () => {
    if (!user) return;
    const q = query(collection(firestore, 'workspaces'), where('members', 'array-contains', user.uid));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setMyWorkspaces(data);
  };

  const handleSearch = async () => {
    const q = query(collection(firestore, 'workspaces'));
    const snapshot = await getDocs(q);
    const filtered = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(w => w.name.toLowerCase().includes(searchTerm.toLowerCase()) && !w.members.includes(user?.uid));
    setSearchResults(filtered);
  };

  const handleJoinWorkspace = async (workspaceId, currentMembers) => {
    try {
      const workspaceRef = doc(firestore, "workspaces", workspaceId);
      await updateDoc(workspaceRef, {
        members: [...currentMembers, user.uid],
      });
      alert("Joined workspace!");
      handleSearch();
      fetchMyWorkspaces();
    } catch (error) {
      console.error("Error joining workspace:", error);
    }
  };

  const handleDeleteWorkspace = async (workspaceId) => {
    const confirm = window.confirm("Are you sure you want to delete this workspace?");
    if (!confirm) return;

    try {
      await deleteDoc(doc(firestore, 'workspaces', workspaceId));
      alert("Workspace deleted.");
      setSelectedWorkspace(null);
      fetchMyWorkspaces();
    } catch (err) {
      console.error("Error deleting workspace:", err);
      alert("Failed to delete workspace.");
    }
  };

  useEffect(() => {
    if (user) fetchMyWorkspaces();
  }, [user]);

  if (!authChecked) {
    return <div className="flex items-center justify-center min-h-screen text-xl">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-[#265B63] text-[#CAB964] p-4">
        <h2 className="text-2xl font-semibold mb-4">Your Workspaces</h2>
        <ul className="space-y-2">
          {myWorkspaces.map((ws) => (
            <li
              key={ws.id}
              className={`p-2 rounded cursor-pointer hover:bg-[#1d474d] ${selectedWorkspace?.id === ws.id ? 'bg-[#1d474d]' : 'bg-[#265B63]'}`}
              onClick={() => setSelectedWorkspace(ws)}
            >
              {ws.name}
            </li>
          ))}
        </ul>

        {selectedWorkspace && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-[#CAB964]">Workspace Members</h3>
            <MemberList
              members={selectedWorkspace.members || []}
              adminId={selectedWorkspace.admin}
            />
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-[#CAB964] p-8">
        {selectedWorkspace ? (
          <div className="bg-white p-6 rounded shadow mt-2">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#265B63] mb-4">
                {selectedWorkspace.name} 
              </h2>
              {selectedWorkspace.admin === user?.uid && (
                <button onClick={() => handleDeleteWorkspace(selectedWorkspace.id)}>
                  <FaTrashAlt className="text-red-600 hover:text-red-800" title="Delete Workspace" />
                </button>
              )}
            </div>
            <p><strong>Admin:</strong> {selectedWorkspace.adminName || "Unknown Admin"}</p>
            <p><strong>Total Members:</strong> {selectedWorkspace.members.length}</p>

            <h3 className="mt-4 text-lg font-semibold text-[#265B63]">Members</h3>
            <MemberList
              members={selectedWorkspace.members || []}
              adminId={selectedWorkspace.admin}
            />

            {/* --- TO-DO LIST SECTION --- */}
            <h3 className="mt-4 text-lg font-semibold text-[#265B63]">Your To-Do List</h3>
            <ToDoList workspaceId={selectedWorkspace.id} />

            <h3 className="mt-4 text-lg font-semibold text-[#265B63]">Recent Activity (Coming Soon)</h3>
            <ul className="list-disc ml-6 text-sm text-gray-600 mt-2">
              <li>Live task updates will be shown here.</li>
              <li>Who added/edited what will appear in real-time.</li>
            </ul>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-[#265B63] mb-6">Dashboard</h1>
            <CreateWorkspace
              onWorkspaceCreated={(newWS) => {
                fetchMyWorkspaces();
                setSelectedWorkspace(newWS);
              }}
            />

            <div className="bg-[#265B63] p-6 rounded shadow mt-6">
              <h2 className="text-xl font-semibold text-[#CAB964] mb-4">Search Workspaces</h2>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyUp={handleSearch}
                placeholder="Search workspaces"
                className="w-full p-2 border rounded mb-4"
              />
              <ul className="space-y-2">
                {searchResults.map((ws) => (
                  <li key={ws.id} className="bg-gray-100 p-3 rounded flex justify-between items-center">
                    <span>{ws.name}</span>
                    <button
                      className="px-3 py-1 bg-[#265B63] text-white rounded hover:bg-[#1d474d]"
                      onClick={() => handleJoinWorkspace(ws.id, ws.members)}
                    >
                      Join
                    </button>
                  </li>
                ))}
                {searchResults.length === 0 && (
                  <p className="text-[#CAB964]">No workspaces found or already joined.</p>
                )}
              </ul>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
