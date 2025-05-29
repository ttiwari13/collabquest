import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  query,
  where,
  updateDoc,
  doc,getDocs, startAt,endAt,
  deleteDoc,
  orderBy,
  limit,
  onSnapshot,
  arrayUnion
} from 'firebase/firestore';
import { firestore } from '../../firebase';
import CreateWorkspace from './CreateWorkspace.jsx';
import ToDoList from './ToDoList.jsx';
import MemberSidebar from './MemberSidebar.jsx';
import WorkspaceRecentActivity from './WorkspaceRecentActivity.jsx';
import { FaSignOutAlt, FaPlus, FaSearch, FaTrash, FaUserPlus, FaBars, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import TimerModal from './TimerModal';
//import LeaderboardGraph from './LeaderboardGraph';
//import Workspace3DRoom from './Workspace3DRoom.jsx';

// Helper for formatting time
function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
}
function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const DashboardRecentActivityFlex = ({ userId }) => {
  const [activities, setActivities] = useState([]);
  useEffect(() => {
    if (!userId) return;
    const q = query(
      collection(firestore, "dashboardRecentActivity"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
      limit(20)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setActivities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [userId]);
  return (
    <div className="bg-gradient-to-br from-[#265B63] to-[#CAB964] rounded shadow p-3 sm:p-4 flex-1 min-w-0 max-w-full lg:max-w-xs flex flex-col">
      <h3 className="text-sm sm:text-base font-bold text-white mb-2">Your Completed Tasks</h3>
      <ul className="text-white text-xs space-y-1 flex-1 overflow-y-auto max-h-32 sm:max-h-none">
        {activities.length === 0 && (
          <li>You haven't completed any tasks yet.</li>
        )}
        {activities.map((activity) => (
          <li key={activity.id} className="break-words">
            <span className="italic">"{activity.taskText}"</span>
            <span className="ml-2 text-[10px] text-gray-200 block sm:inline">
              {activity.timestamp && activity.timestamp.toDate
                ? activity.timestamp.toDate().toLocaleString()
                : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [myWorkspaces, setMyWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [streak, setStreak] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [allTasks, setAllTasks] = useState([]);
  const navigate = useNavigate();
  const auth = getAuth();
  const [globalSearchResults, setGlobalSearchResults] = useState([]);
  const [isGlobalSearching, setIsGlobalSearching] = useState(false);
  const [extraTime, setExtraTime] = useState(0); // in seconds
  const [stopwatchAccumulated, setStopwatchAccumulated] = useState(0);
  const [workspaceMembers, setWorkspaceMembers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (authChecked && !user) {
      navigate('/signup');
    }
  }, [authChecked, user, navigate]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(firestore, 'workspaces'), where('members', 'array-contains', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMyWorkspaces(data);
      setSelectedWorkspace(ws => ws && data.find(d => d.id === ws.id) ? ws : null);
    });
    return () => unsubscribe();
  }, [user]);

  const filteredWorkspaces = myWorkspaces.filter(ws =>
    ws.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  //3d
useEffect(() => {
  if (!selectedWorkspace) {
    setWorkspaceMembers([]);
    return;
  }
  const fetchMembers = async () => {
    const memberIds = selectedWorkspace.members || [];
    if (!memberIds.length) {
      setWorkspaceMembers([]);
      return;
    }
    // Fetch user profiles with avatarUrl
    const q = query(collection(firestore, "users"), where("uid", "in", memberIds));
    const snap = await getDocs(q);
    setWorkspaceMembers(
      snap.docs.map(doc => ({
        uid: doc.id,
        ...doc.data(),
        color: doc.data().color || "#265b63"
      }))
    );
  };
  fetchMembers();
}, [selectedWorkspace]);

  // Fetch all tasks across all workspaces for the CURRENT USER ONLY (for dashboard)
  useEffect(() => {
    if (!user) return;
    if (!myWorkspaces.length) {
      setAllTasks([]);
      return;
    }
    const unsubscribes = [];
    let all = [];
    myWorkspaces.forEach(ws => {
      // FIXED: Add where clause to filter tasks by current user's ID
      const q = query(
        collection(firestore, 'workspaces', ws.id, 'tasks'),
        where('createdBy', '==', user.uid) // Only fetch tasks created by current user
      );
      const unsub = onSnapshot(q, (snapshot) => {
        all = all.filter(t => t.workspaceId !== ws.id);
        const tasks = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          workspaceId: ws.id,
        }));
        all = [...all, ...tasks];
        setAllTasks([...all]);
      });
      unsubscribes.push(unsub);
    });
    return () => unsubscribes.forEach(unsub => unsub());
  }, [user, myWorkspaces]);

  // Dashboard-wide stats (all workspaces) - NOW ONLY FOR CURRENT USER
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => t.completed).length;
  const uncompletedTasks = totalTasks - completedTasks;
  const completionPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Prepare data for completion over time graph (dashboard-wide) - NOW ONLY FOR CURRENT USER
  const completionHistory = allTasks
    .filter(t => t.completed && t.completedAt)
    .map(t => ({
      date: formatDate(t.completedAt.toDate ? t.completedAt.toDate() : t.completedAt),
    }));

  const completionByDate = completionHistory.reduce((acc, { date }) => {
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(completionByDate)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([date, count]) => ({
      date, count,
    }));

  // Enhanced search function
  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // If empty, clear global search results
    if (!value.trim()) {
      setGlobalSearchResults([]);
      return;
    }

    setIsGlobalSearching(true);
    try {
      const q = query(
        collection(firestore, 'workspaces'),
        orderBy('name'),
        startAt(value),
        endAt(value + '\uf8ff'),
        limit(10)
      );

      const snap = await getDocs(q);
      const results = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter out workspaces user is already a member of
      const filteredResults = results.filter(ws => 
        !ws.members || !ws.members.includes(user?.uid)
      );
      
      setGlobalSearchResults(filteredResults);
    } catch (err) {
      console.error("Global workspace search error:", err);
      setGlobalSearchResults([]);
    }
    setIsGlobalSearching(false);
  };

  // Join workspace function
  const handleJoinWorkspace = async (workspace) => {
    if (!user) return;
    
    try {
      const workspaceRef = doc(firestore, 'workspaces', workspace.id);
      await updateDoc(workspaceRef, {
        members: arrayUnion(user.uid)
      });
      
      alert(`Successfully joined "${workspace.name}"!`);
      
      // Remove from global search results since user is now a member
      setGlobalSearchResults(prev => prev.filter(ws => ws.id !== workspace.id));
      
      // Clear search term to show user's workspaces
      setSearchTerm('');
      
    } catch (error) {
      console.error("Error joining workspace:", error);
      alert("Failed to join workspace. Please try again.");
    }
  };

  // Admin-only workspace deletion
  const handleDeleteWorkspace = async (workspaceId) => {
    const ws = myWorkspaces.find(w => w.id === workspaceId);
    if (!ws || ws.admin !== user?.uid) {
      alert("Only the admin can delete this workspace.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this workspace? This cannot be undone.")) {
      return;
    }
    try {
      await deleteDoc(doc(firestore, "workspaces", workspaceId));
      alert("Workspace deleted successfully!");
      setSelectedWorkspace(null);
    } catch (error) {
      console.error("Error deleting workspace:", error);
      alert("Failed to delete workspace.");
    }
  };

  const handleLeaveWorkspace = async (workspace) => {
    if (!user) return;
    if (workspace.admin === user.uid) {
      alert("Admin cannot leave the workspace. Please transfer admin rights first.");
      return;
    }
    const confirmLeave = window.confirm(`Are you sure you want to leave "${workspace.name}"?`);
    if (!confirmLeave) return;
    try {
      const workspaceRef = doc(firestore, 'workspaces', workspace.id);
      const updatedMembers = (Array.isArray(workspace.members) ? workspace.members : []).filter(memberId => memberId !== user.uid);
      await updateDoc(workspaceRef, { members: updatedMembers });
      if (selectedWorkspace?.id === workspace.id) {
        setSelectedWorkspace(null);
      }
      alert(`You have left "${workspace.name}".`);
    } catch (error) {
      console.error("Error leaving workspace:", error);
      alert("Failed to leave the workspace. Please try again.");
    }
  };

  const handleUseTemplate = () => {
    alert("Template feature coming soon!");
  };

  if (!authChecked) {
    return <div className="flex items-center justify-center min-h-screen text-xl">Loading...</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Mobile Header */}
      <div className="lg:hidden bg-[#265B63] text-[#CAB964] p-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Workspaces</h2>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-[#CAB964] hover:text-white p-2"
        >
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Workspace Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-[#265B63] text-[#CAB964] p-4
        transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:transform-none transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'block' : 'hidden lg:block'}
      `}>
        <div className="hidden lg:flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Workspaces</h2>
          <button
            title="Create Workspace"
            onClick={() => setShowCreateModal(true)}
            className="text-[#CAB964] hover:text-white bg-[#1d474d] rounded-full p-2 ml-2"
          >
            <FaPlus />
          </button>
        </div>
        
        {/* Mobile create button */}
        <div className="lg:hidden flex items-center justify-between mb-4">
          <button
            title="Create Workspace"
            onClick={() => setShowCreateModal(true)}
            className="text-[#CAB964] hover:text-white bg-[#1d474d] rounded px-3 py-2 text-sm"
          >
            <FaPlus className="inline mr-2" />
            Create Workspace
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="flex items-center bg-[#1d474d] rounded mb-3 px-2 py-1">
          <FaSearch className="text-[#CAB964] mr-2 text-sm" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search workspaces"
            className="bg-transparent outline-none text-[#CAB964] flex-1 text-sm"
          />
        </div>

        {/* Loading indicator */}
        {isGlobalSearching && (
          <div className="text-[#CAB964] text-sm mb-2">Searching...</div>
        )}

        {/* Global Search Results */}
        {globalSearchResults.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-[#CAB964] mb-2">Available Workspaces</h3>
            <ul className="space-y-2 max-h-40 overflow-y-auto">
              {globalSearchResults.map((ws) => (
                <li
                  key={ws.id}
                  className="p-2 rounded bg-[#1d474d] border border-[#CAB964] border-opacity-30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <span className="text-[#CAB964] font-medium text-sm truncate block">{ws.name}</span>
                      {ws.adminName && (
                        <div className="text-xs text-yellow-400 mt-1 truncate">
                          Admin: {ws.adminName}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleJoinWorkspace(ws)}
                      title="Join Workspace"
                      className="text-green-400 hover:text-green-600 ml-2 flex-shrink-0"
                    >
                      <FaUserPlus />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* User's Workspaces */}
        {searchTerm && globalSearchResults.length === 0 && !isGlobalSearching && (
          <div className="text-[#CAB964] text-sm mb-2">No workspaces found</div>
        )}

        <div className="mb-2">
          <h3 className="text-sm font-semibold text-[#CAB964] mb-2">Your Workspaces</h3>
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {filteredWorkspaces.map((ws) => {
              const isAdmin = ws.admin === user?.uid;
              return (
                <li
                  key={ws.id}
                  className={`p-2 rounded cursor-pointer hover:bg-[#1d474d] flex flex-col ${selectedWorkspace?.id === ws.id ? 'bg-[#1d474d]' : 'bg-[#265B63]'}`}
                  onClick={() => {
                    setSelectedWorkspace(ws);
                    setSidebarOpen(false); // Close sidebar on mobile after selection
                  }}
                >
                  <div className="flex items-center min-w-0">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleLeaveWorkspace(ws);
                      }}
                      title="Leave Workspace"
                      className="text-yellow-400 hover:text-yellow-600 mr-2 flex-shrink-0"
                    >
                      <FaSignOutAlt className="text-sm" />
                    </button>
                    <span className="flex-1 text-sm truncate">{ws.name}</span>
                    {isAdmin && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleDeleteWorkspace(ws.id);
                        }}
                        title="Delete Workspace"
                        className="text-red-600 hover:text-red-800 ml-2 flex-shrink-0"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    )}
                  </div>
                  {ws.adminName && (
                    <span className="ml-6 mt-1 text-xs text-yellow-400 font-semibold truncate">
                      Admin: {ws.adminName}
                    </span>
                  )}
                </li>
              );
            })}
            {filteredWorkspaces.length === 0 && !searchTerm && (
              <li className="text-[#CAB964] p-2 text-sm">No workspaces found.</li>
            )}
          </ul>
        </div>

        {/* CreateWorkspace Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded p-4 sm:p-6 shadow-lg w-full max-w-md relative max-h-[90vh] overflow-y-auto">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-900"
                onClick={() => setShowCreateModal(false)}
              >✕</button>
              <CreateWorkspace
                onWorkspaceCreated={(newWS) => {
                  setSelectedWorkspace(newWS);
                  setShowCreateModal(false);
                }}
              />
            </div>
          </div>
        )}
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 bg-[#CAB964] p-4 sm:p-6 lg:p-8 flex flex-col xl:flex-row gap-4 xl:gap-8">
        <div className="flex-1 min-w-0">
          {/* MAIN DASHBOARD STATS/CHARTS */}
          {!selectedWorkspace && (
            <div className="flex flex-col items-center justify-start h-full space-y-4 sm:space-y-6 relative w-full">
              {/* Use Template Button - Top Right */}
              <div className="w-full flex justify-end mb-2 sm:mb-0">
                <button
                  className="px-3 py-2 sm:px-4 bg-[#265B63] text-[#CAB964] rounded shadow hover:bg-[#1d474d] transition text-sm whitespace-nowrap"
                  onClick={handleUseTemplate}
                >
                  Use Template
                </button>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#265B63] text-center px-4">
                Hey, {user?.displayName || user?.email || "there"} <span role="img" aria-label="wave">👋</span>
              </h1>
              <p className="text-base sm:text-lg text-[#265B63] mb-2 text-center max-w-md px-4">
                Welcome back! Select a workspace or start something new.
              </p>
              
              {/* --- DASHBOARD STATS & CHARTS FLEXBOX --- */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 mt-2 w-full max-w-7xl">
                {/* Total Tasks */}
                <div className="bg-gradient-to-br from-[#265B63] to-[#CAB964] rounded shadow p-3 sm:p-4 lg:p-6 flex flex-col items-center min-h-[80px] sm:min-h-[100px]">
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{totalTasks}</span>
                  <span className="text-white text-xs sm:text-sm text-center">Your Total Tasks</span>
                </div>
                {/* Completed */}
                <div className="bg-gradient-to-br from-[#265B63] to-[#CAB964] rounded shadow p-3 sm:p-4 lg:p-6 flex flex-col items-center min-h-[80px] sm:min-h-[100px]">
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{completedTasks}</span>
                  <span className="text-white text-xs sm:text-sm text-center">Your Completed</span>
                </div>
                {/* Uncompleted */}
                <div className="bg-gradient-to-br from-[#265B63] to-[#CAB964] rounded shadow p-3 sm:p-4 lg:p-6 flex flex-col items-center min-h-[80px] sm:min-h-[100px]">
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{uncompletedTasks}</span>
                  <span className="text-white text-xs sm:text-sm text-center">Your Pending</span>
                </div>
                {/* Circular Progress */}
                <div className="bg-gradient-to-br from-[#265B63] to-[#CAB964] rounded shadow p-3 sm:p-4 lg:p-6 flex flex-col items-center min-h-[80px] sm:min-h-[100px]">
                  <div style={{ width: 60, height: 60 }} className="sm:w-20 sm:h-20">
                    <CircularProgressbar
                      value={completionPercent}
                      text={`${completedTasks}/${totalTasks}`}
                      styles={buildStyles({
                        pathColor: '#ffffff',
                        textColor: '#ffffff',
                        trailColor: 'rgba(255,255,255,0.3)',
                        textSize: '12px'
                      })}
                    />
                  </div>
                  <span className="text-white mt-2 text-xs sm:text-sm text-center">Your Progress</span>
                </div>
                {/* Task Completed Streak */}
                <div className="bg-gradient-to-br from-[#265B63] to-[#CAB964] rounded shadow p-3 sm:p-4 lg:p-6 flex flex-col items-center min-h-[80px] sm:min-h-[100px]">
                  <span className="text-2xl sm:text-3xl lg:text-4xl text-white mb-1 sm:mb-2">🔥</span>
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{streak}</span>
                  <span className="text-white text-xs sm:text-sm text-center">Your Task Streak</span>
                </div>
                {/* Total Time */}
                <div className="bg-gradient-to-br from-[#265B63] to-[#CAB964] rounded shadow p-3 sm:p-4 lg:p-6 flex flex-col items-center min-h-[80px] sm:min-h-[100px]">
                  <span className="text-2xl sm:text-3xl lg:text-4xl text-white mb-1 sm:mb-2">⏱️</span>
                  <span className="text-sm sm:text-lg lg:text-xl font-bold text-white text-center leading-tight"> 
                    {formatTime(totalTime + stopwatchAccumulated + extraTime)}
                  </span>
                  <span className="text-white text-xs sm:text-sm text-center">Your Total Time</span>
                </div>
              </div>

              {/* Your Completed Tasks - Full Width on Mobile */}
              <div className="w-full max-w-7xl mt-4">
                <DashboardRecentActivityFlex userId={user?.uid} />
              </div>
              
              {/* Completion Over Time Graph */}
              <div className="mt-6 sm:mt-8 w-full max-w-4xl">
                <h4 className="text-base sm:text-lg font-semibold text-[#265B63] mb-2 text-center">Your Task Completion Over Time</h4>
                <div className="bg-gradient-to-br from-[#265B63] to-[#CAB964] rounded shadow p-3 sm:p-4">
                  <ResponsiveContainer width="100%" height={200} className="sm:h-[220px]">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.3)" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12, fill: '#ffffff' }}
                        interval="preserveStartEnd"
                        axisLine={{ stroke: '#ffffff' }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: '#ffffff' }} 
                        axisLine={{ stroke: '#ffffff' }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#265B63'
                        }}
                      />
                      <Line type="monotone" dataKey="count" stroke="#ffffff" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
          
          {/* Workspace Selected: Show WorkspaceRecentActivity and ToDoList */}
          {selectedWorkspace && (
            <div className="max-w-none xl:max-w-2xl mx-auto">
              <ToDoList workspace={selectedWorkspace} user={user} />
              <WorkspaceRecentActivity workspaceId={selectedWorkspace.id} />
            </div>
          )}
        </div>
        
        {/* MemberSidebar on the right when workspace is selected */}
        {selectedWorkspace && (
          <div className="w-full xl:w-72 xl:flex-shrink-0">
            <MemberSidebar workspace={selectedWorkspace} user={user} />
          </div>
        )}
      </main>
      
      <TimerModal
        setExtraTime={setExtraTime}
        stopwatchAccumulated={stopwatchAccumulated}
        setStopwatchAccumulated={setStopwatchAccumulated}
      />
    </div>
  );
};

export default Dashboard;