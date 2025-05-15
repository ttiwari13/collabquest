import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../firebase"; // Use the correct Firestore instance

const WorkspaceMembers = ({ memberIds }) => {
  const [membersInfo, setMembersInfo] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMembersInfo = async () => {
      setLoading(true);
      try {
        const memberDetails = await Promise.all(
          memberIds.map(async (uid) => {
            const userDoc = await getDoc(doc(firestore, 'users', uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              return {
                uid,
                name: data.firstname || data.displayName || data.name || 'Unknown User'
              };
            } else {
              return { uid, name: 'Unknown User' };
            }
          })
        );
        setMembersInfo(memberDetails);
      } catch (err) {
        console.error("Error fetching member info:", err);
        setMembersInfo([]);
      }
      setLoading(false);
    };

    if (memberIds && memberIds.length > 0) {
      fetchMembersInfo();
    } else {
      setMembersInfo([]);
    }
  }, [memberIds]);

  if (loading) {
    return <div className="p-4 bg-white rounded shadow">Loading workspace members...</div>;
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-2">Workspace Members:</h2>
      <ul className="list-disc pl-5">
        {membersInfo.length === 0 && <li>No members found.</li>}
        {membersInfo.map((member) => (
          <li key={member.uid}>{member.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default WorkspaceMembers;
