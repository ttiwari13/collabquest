import React, { useEffect, useState } from 'react';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '../../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const ToDoList = ({ workspaceId }) => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Listen for auth state changes to get the current user
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch only the current user's todos for this workspace
  const fetchTodos = async () => {
    if (!user) return;
    setLoading(true);
    const q = query(
      collection(firestore, 'workspaces', workspaceId, 'todos'),
      where('userId', '==', user.uid)
    );
    const snapshot = await getDocs(q);
    setTodos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  useEffect(() => {
    fetchTodos();
    // eslint-disable-next-line
  }, [workspaceId, user]);

  const handleAddTodo = async () => {
    if (!newTodo.trim() || !user) return;
    await addDoc(collection(firestore, 'workspaces', workspaceId, 'todos'), {
      text: newTodo,
      status: 'pending',
      userId: user.uid,
      createdAt: serverTimestamp(),
    });
    setNewTodo('');
    fetchTodos();
  };

  const handleToggleStatus = async (todo) => {
    const todoRef = doc(firestore, 'workspaces', workspaceId, 'todos', todo.id);
    await updateDoc(todoRef, {
      status: todo.status === 'completed' ? 'pending' : 'completed',
    });
    fetchTodos();
  };

  const handleDelete = async (todoId) => {
    await deleteDoc(doc(firestore, 'workspaces', workspaceId, 'todos', todoId));
    fetchTodos();
  };

  return (
    <div>
      <div className="flex mb-4">
        <input
          type="text"
          value={newTodo}
          onChange={e => setNewTodo(e.target.value)}
          className="flex-1 p-2 border rounded mr-2"
          placeholder="Add a new task..."
        />
        <button
          onClick={handleAddTodo}
          className="bg-[#265B63] text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul className="space-y-2">
          {todos.map(todo => (
            <li key={todo.id} className="flex items-center justify-between bg-gray-100 p-2 rounded">
              <span
                className={`flex-1 cursor-pointer ${todo.status === 'completed' ? 'line-through text-gray-400' : ''}`}
                onClick={() => handleToggleStatus(todo)}
              >
                {todo.text}
              </span>
              <button
                onClick={() => handleDelete(todo.id)}
                className="ml-2 text-red-500 hover:text-red-700"
                title="Delete"
              >
                ✕
              </button>
            </li>
          ))}
          {todos.length === 0 && <li className="text-gray-400">No tasks yet.</li>}
        </ul>
      )}
    </div>
  );
};

export default ToDoList;
