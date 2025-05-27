import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, updateDoc, arrayRemove } from 'firebase/firestore';
import { firestore } from '../../firebase';
import MemberList from './MemberList';
import TodoList from './ToDoList';
import ActivityFeed from './ActivityFeed';
import ProductivityChart from './ProductivityChart';
import { FaSignOutAlt } from 'react-icons/fa';
import { getAuth } from 'firebase/auth';

function WorkspacePage() {
  const { workspaceId } = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [taskData, setTaskData] = useState([]);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const docRef = doc(firestore, 'workspaces', workspaceId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setWorkspace({ id: docSnap.id, ...docSnap.data() });
        } else {
          setWorkspace(null);
        }
      } catch (err) {
        console.error("Error fetching workspace:", err);
        setWorkspace(null);
      }
    };

    const fetchTasks = async () => {
      try {
        const tasksRef = collection(firestore, 'workspaces', workspaceId, 'tasks');
        const tasksSnapshot = await getDocs(tasksRef);
        const tasksList = tasksSnapshot.docs.map(doc => doc.data());
        setTasks(tasksList);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      }
    };

    Promise.all([fetchWorkspace(), fetchTasks()]).finally(() => {
      setLoading(false);
    });
  }, [workspaceId]);

  useEffect(() => {
    const aggregateTaskData = () => {
      const completedTasks = tasks.filter(task => task.status === 'completed');
      const dailyTaskCounts = completedTasks.reduce((acc, task) => {
        const date = task.completedAt?.toDate().toLocaleDateString();
        if (date) {
          acc[date] = (acc[date] || 0) + 1;
        }
        return acc;
      }, {});
      const formattedData = Object.entries(dailyTaskCounts).map(([date, count]) => ({ date, count }));
      setTaskData(formattedData);
    };

    if (tasks.length > 0) {
      aggregateTaskData();
    }
  }, [tasks]);

  // --- Leave Workspace Handler ---
  const handleLeaveWorkspace = async () => {
    if (!user) return;
    if (workspace.admin === user.uid) {
      alert("Admin cannot leave the workspace. Please transfer admin rights first.");
      return;
    }
    const confirmLeave = window.confirm(`Are you sure you want to leave "${workspace.name}"?`);
    if (!confirmLeave) return;

    try {
      const wsRef = doc(firestore, 'workspaces', workspaceId);
      await updateDoc(wsRef, {
        members: arrayRemove(user.uid)
      });
      alert(`You have left "${workspace.name}".`);
      navigate('/dashboard');
    } catch (err) {
      alert('Failed to leave workspace.');
      console.error(err);
    }
  };

  if (loading) return <div className="p-4 text-lg">Loading workspace...</div>;
  if (!workspace) return <div className="p-4 text-red-600">Workspace not found.</div>;

  return (
    <div className="flex min-h-screen bg-[#CAB964]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#265B63] text-[#CAB964] p-4 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Members</h2>
        <MemberList members={workspace.members} adminId={workspace.admin} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Workspace name and leave icon */}
        <div className="flex items-center gap-2">
          <h2 className="text-3xl font-bold text-indigo-600">{workspace.name}</h2>
          {user && workspace.members?.includes(user.uid) && (
            <button
              title="Leave Workspace"
              onClick={handleLeaveWorkspace}
              className="ml-2 text-yellow-500 hover:text-yellow-700 text-xl"
            >
              <FaSignOutAlt />
            </button>
          )}
        </div>
        <p className="text-lg mb-2 font-medium">
          Admin: {workspace.adminName || 'Unknown Admin'}
        </p>
        <p className="text-md mb-4">
          Total Members: {workspace.members ? workspace.members.length : 0}
        </p>

        {/* To-Do List */}
        <section className="bg-white rounded p-4 shadow">
          <h3 className="text-xl font-semibold mb-2">To-Do List</h3>
          <TodoList workspaceId={workspaceId} />
        </section>

        {/* Productivity Chart */}
        <section className="bg-white rounded p-4 shadow">
          <h3 className="text-xl font-semibold mb-2">Productivity Chart</h3>
          <ProductivityChart data={taskData} />
        </section>

        {/* Activity Feed */}
        <section className="bg-white rounded p-4 shadow">
          <h3 className="text-xl font-semibold mb-2">Recent Activity</h3>
          <ActivityFeed workspaceId={workspaceId} />
        </section>
      </main>
    </div>
  );
}

export default WorkspacePage;
