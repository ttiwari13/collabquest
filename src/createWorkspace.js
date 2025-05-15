import { useNavigate } from 'react-router-dom';
import { firestore } from './firebase';

// inside component
const navigate = useNavigate();

const docRef = await addDoc(collection(firestore, "workspaces"), {
  name,
  createdBy: user.uid,
  members: [user.uid], // add creator to members
  createdAt: serverTimestamp(),
});

navigate(`/workspace/${docRef.id}`); // redirect to new workspace
