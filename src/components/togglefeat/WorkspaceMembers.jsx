import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../../firebase";

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
    return <div className="text-xs text-[#CAB964] ml-6 mt-1">Loading members...</div>;
  }

  return (
    <div className="text-xs text-[#CAB964] ml-6 mt-1 flex flex-wrap gap-2">
      {membersInfo.length === 0 && <span>No members found.</span>}
      {membersInfo.map((member) => (
        <span key={member.uid} className="bg-[#1d474d] rounded px-2 py-0.5">{member.name}</span>
      ))}
    </div>
  );
};

export default WorkspaceMembers;
