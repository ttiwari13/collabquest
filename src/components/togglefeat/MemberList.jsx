import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../firebase';

const MemberList = ({ members, adminId }) => {
  const [memberInfos, setMemberInfos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!Array.isArray(members) || members.length === 0) {
      setMemberInfos([]);
      return;
    }

    const fetchMembers = async () => {
      setLoading(true);
      try {
        const infos = await Promise.all(
          members.map(async (uid) => {
            const userDoc = await getDoc(doc(firestore, 'users', uid));
            let name = 'Unknown User';
            if (userDoc.exists()) {
              const data = userDoc.data();
              name = data.firstname || data.displayName || data.name || 'Unknown User';
            }
            return {
              uid,
              name,
              isAdmin: uid === adminId,
            };
          })
        );
        // Admin ko list ke top pe lao
        infos.sort((a, b) => (b.isAdmin ? 1 : -1));
        setMemberInfos(infos);
      } catch (err) {
        console.error("Error fetching member info:", err);
        setMemberInfos([]);
      }
      setLoading(false);
    };

    fetchMembers();
  }, [members, adminId]);

  if (loading) {
    return <div className="ml-6 text-gray-500">Loading members...</div>;
  }

  if (!memberInfos.length) {
    return <div className="ml-6 text-gray-500">No members found.</div>;
  }

  return (
    <ul className="list-disc ml-6">
      {memberInfos.map((member) => (
        <li key={member.uid}>
          <span className={member.isAdmin ? "font-bold text-yellow-700" : ""}>
            {member.name}
          </span>
          {member.isAdmin && (
            <span className="text-xs text-yellow-600 ml-2">(Admin)</span>
          )}
          {member.name === 'Unknown User' && (
            <span className="text-xs text-gray-400 ml-2">({member.uid})</span>
          )}
        </li>
      ))}
    </ul>
  );
};

export default MemberList;
