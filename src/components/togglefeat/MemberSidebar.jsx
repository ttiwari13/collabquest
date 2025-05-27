import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../firebase';

const MemberSidebar = ({ workspace }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspace) {
      setMembers([]);
      setLoading(false);
      return;
    }
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const memberIds = workspace.members || [];
        if (memberIds.length === 0) {
          setMembers([]);
          setLoading(false);
          return;
        }
        // Fetch user info for each member
        const memberPromises = memberIds.map(uid =>
          getDoc(doc(firestore, "users", uid))
        );
        const memberDocs = await Promise.all(memberPromises);
        setMembers(
          memberDocs
            .filter(doc => doc.exists())
            .map(doc => ({ id: doc.id, ...doc.data() }))
        );
      } catch (err) {
        console.error("Error fetching members:", err); // Debug
        setMembers([]);
      }
      setLoading(false);
    };
    fetchMembers();
  }, [workspace]);

  if (loading) return <div>Loading members...</div>;
  if (!members.length) return <div>No members found.</div>;

  return (
    <aside className="w-64 bg-gradient-to-r from-[#265B63] to-[#CAB964] p-4 shadow">
      <h3 className="font-bold mb-2 text-black">Members</h3>
      <ul className='text-black'>
        {members.map(member => (
          <li key={member.id}>{member.displayName || member.email || member.id}</li>
        ))}
      </ul>
    </aside>
  );
};

export default MemberSidebar;
