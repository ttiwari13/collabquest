import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { firestore } from "../../firebase";
import { FaTrash, FaEdit, FaCheck, FaPlus } from "react-icons/fa";

const ToDoList = ({ workspace, user }) => {
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    if (!workspace) return;
    const q = query(
      collection(firestore, "workspaces", workspace.id, "tasks"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [workspace]);

  // Add new task
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const docRef = await addDoc(
      collection(firestore, "workspaces", workspace.id, "tasks"),
      {
        text: newTaskText.trim(),
        completed: false,
        createdAt: serverTimestamp(),
        createdBy: user.uid, // Important for security
      }
    );
    // Log activity
    await addDoc(
      collection(firestore, "workspaces", workspace.id, "recentActivity"),
      {
        userId: user.uid,
        userName: user.displayName || user.email || "Unknown",
        action: "added",
        taskText: newTaskText.trim(),
        taskId: docRef.id,
        timestamp: serverTimestamp(),
      }
    );
    setNewTaskText("");
  };

  // Mark as complete/incomplete
  const handleToggleComplete = async (task) => {
    const taskRef = doc(
      firestore,
      "workspaces",
      workspace.id,
      "tasks",
      task.id
    );
    const newCompleted = !task.completed;
    await updateDoc(taskRef, {
      completed: newCompleted,
      completedAt: newCompleted ? serverTimestamp() : null,
    });

    // Log in workspace recentActivity
    await addDoc(
      collection(firestore, "workspaces", workspace.id, "recentActivity"),
      {
        userId: user.uid,
        userName: user.displayName || user.email || "Unknown",
        action: newCompleted ? "completed" : "marked incomplete",
        taskText: task.text,
        taskId: task.id,
        timestamp: serverTimestamp(),
      }
    );

    // Log in global dashboardRecentActivity (only if completed)
    if (newCompleted) {
      await addDoc(
        collection(firestore, "dashboardRecentActivity"),
        {
          userId: user.uid,
          userName: user.displayName || user.email || "Unknown",
          taskText: task.text,
          timestamp: serverTimestamp(),
        }
      );
    }
  };

  // Delete task
  const handleDeleteTask = async (task) => {
    if (
      window.confirm(
        `Are you sure you want to delete the task: "${task.text}"?`
      )
    ) {
      await deleteDoc(
        doc(firestore, "workspaces", workspace.id, "tasks", task.id)
      );
      // Log activity
      await addDoc(
        collection(firestore, "workspaces", workspace.id, "recentActivity"),
        {
          userId: user.uid,
          userName: user.displayName || user.email || "Unknown",
          action: "deleted",
          taskText: task.text,
          taskId: task.id,
          timestamp: serverTimestamp(),
        }
      );
    }
  };

  // Edit task
  const handleEditTask = (task) => {
    setEditingTaskId(task.id);
    setEditingText(task.text);
  };

  const handleSaveEdit = async (task) => {
    const taskRef = doc(
      firestore,
      "workspaces",
      workspace.id,
      "tasks",
      task.id
    );
    await updateDoc(taskRef, { text: editingText });
    // Log activity
    await addDoc(
      collection(firestore, "workspaces", workspace.id, "recentActivity"),
      {
        userId: user.uid,
        userName: user.displayName || user.email || "Unknown",
        action: "edited",
        taskText: editingText,
        taskId: task.id,
        timestamp: serverTimestamp(),
      }
    );
    setEditingTaskId(null);
    setEditingText("");
  };

  return (
    <div className="bg-gradient-to-r from-[#265B63] to-[#CAB964] rounded-lg shadow-lg p-4 sm:p-6 max-w-lg w-full mx-auto my-8">
      <h2 className="text-lg sm:text-xl font-bold text-black mb-4 text-center">
        {workspace.name} - ToDo List
      </h2>
      <form
        onSubmit={handleAddTask}
        className="flex flex-col sm:flex-row items-stretch sm:items-center mb-6 gap-2"
      >
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          className="flex-1 border border-[#265B63] rounded px-2 py-2 text-sm focus:outline-none"
          placeholder="Add a new task..."
        />
        <button
          type="submit"
          className="bg-[#265B63] text-white px-4 py-2 rounded hover:bg-[#1d474d] flex items-center justify-center text-sm"
        >
          <FaPlus className="mr-1" /> Add
        </button>
      </form>
      <ul className="space-y-3">
        {tasks.length === 0 && (
          <li className="text-gray-200 text-center">No tasks yet.</li>
        )}
        {tasks.map((task) => (
          <li
            key={task.id}
            className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-2 rounded transition-all ${
              task.completed
                ? "bg-green-100/80 text-green-800"
                : "bg-white/10 text-white"
            }`}
          >
            <div className="flex items-center flex-1">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggleComplete(task)}
                className="mr-2 accent-[#265B63]"
              />
              {editingTaskId === task.id ? (
                <input
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  className="border border-[#265B63] rounded px-2 py-1 flex-1 text-black"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveEdit(task);
                  }}
                  autoFocus
                />
              ) : (
                <span
                  className={`flex-1 text-base ${
                    task.completed ? "line-through opacity-60" : ""
                  }`}
                >
                  {task.text}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2 sm:mt-0 ml-0 sm:ml-2">
              {/* Only show edit/delete if current user is creator */}
              {editingTaskId === task.id ? (
                <button
                  className="text-green-700 hover:text-green-900"
                  onClick={() => handleSaveEdit(task)}
                  title="Save"
                >
                  <FaCheck />
                </button>
              ) : (
                task.createdBy === user.uid && (
                  <button
                    className="text-blue-300 hover:text-blue-500"
                    onClick={() => handleEditTask(task)}
                    title="Edit"
                    disabled={task.completed}
                  >
                    <FaEdit />
                  </button>
                )
              )}
              {task.createdBy === user.uid && (
                <button
                  className="text-red-400 hover:text-red-600"
                  onClick={() => handleDeleteTask(task)}
                  title="Delete"
                >
                  <FaTrash />
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ToDoList;
