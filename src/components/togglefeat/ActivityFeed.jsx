import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { firestore } from '../../firebase';

const ActivityFeed = ({ workspaceId }) => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchActivities = async () => {
      const q = query(
        collection(firestore, 'workspaces', workspaceId, 'activity'),
        orderBy('timestamp', 'desc'),
        limit(20)
      );
      const snapshot = await getDocs(q);
      setActivities(snapshot.docs.map(doc => doc.data()));
    };
    fetchActivities();
  }, [workspaceId]);

  return (
    <ul>
      {activities.map((activity, idx) => (
        <li key={idx}>
          <span className="font-semibold">{activity.userName}</span> {activity.action} a todo: <span className="italic">{activity.text}</span> <span className="text-xs text-gray-500">{activity.timestamp && activity.timestamp.toDate().toLocaleString()}</span>
        </li>
      ))}
      {activities.length === 0 && <li className="text-gray-400">No recent activity.</li>}
    </ul>
  );
};

export default ActivityFeed;
