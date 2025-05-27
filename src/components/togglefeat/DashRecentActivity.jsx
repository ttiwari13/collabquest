// DashboardRecentActivity.jsx
import React, { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { firestore } from "../../firebase";

const DashboardRecentActivity = () => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const q = query(
      collection(firestore, "dashboardRecentActivity"),
      orderBy("timestamp", "desc"),
      limit(20)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setActivities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-[#CAB964] rounded shadow p-6 max-w-lg w-full mb-6 mx-auto">
      <h3 className="text-xl font-bold text-[#265B63] mb-4">Recent Completed Tasks</h3>
      <ul className="text-[#265B63] text-sm space-y-2">
        {activities.length === 0 && (
          <li>No completed tasks yet.</li>
        )}
        {activities.map((activity) => (
          <li key={activity.id}>
            <span className="font-semibold">
              {activity.userName || activity.userId}
            </span>{" "}
            completed
            <span className="italic"> "{activity.taskText}"</span>
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

export default DashboardRecentActivity;
