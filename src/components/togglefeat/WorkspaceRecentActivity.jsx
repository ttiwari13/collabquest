import React, { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { firestore } from "../../firebase";

const actionVerb = {
  added: "added task",
  deleted: "deleted task",
  completed: "completed task",
  "marked incomplete": "marked task as incomplete",
  edited: "edited task",
};

const WorkspaceRecentActivity = ({ workspaceId }) => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (!workspaceId) return;
    const q = query(
      collection(firestore, "workspaces", workspaceId, "recentActivity"),
      orderBy("timestamp", "desc"),
      limit(20)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setActivities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [workspaceId]);

  return (
    <div className="bg-[#CAB964] rounded shadow p-4 max-w-lg w-full mb-6 mx-auto">
      <h3 className="text-lg font-bold text-[#265B63] mb-2">Workspace Recent Activity</h3>
      <ul className="text-[#265B63] text-sm space-y-2">
        {activities.length === 0 && (
          <li>No recent activity yet.</li>
        )}
        {activities.map((activity) => (
          <li key={activity.id}>
            <span className="font-semibold">{activity.userName || activity.userId}</span>{" "}
            {actionVerb[activity.action] || activity.action}{" "}
            {activity.taskText && (
              <span>
                &quot;<span className="font-semibold">{activity.taskText}</span>&quot;
              </span>
            )}
            <span className="ml-2 text-xs text-gray-400">
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

export default WorkspaceRecentActivity;
