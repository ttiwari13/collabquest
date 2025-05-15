import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../../firebase';
import dayjs from 'dayjs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';

const ProductivityChart = ({ workspaceId }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
  const fetchTasks = async () => {
  const taskRef = collection(firestore, `workspaces/${workspaceId}/tasks`);
  const snapshot = await getDocs(taskRef);

  const taskCounts = {};

  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.createdAt && data.createdAt.toDate) {
      const date = dayjs(data.createdAt.toDate()).format('YYYY-MM-DD');
      taskCounts[date] = (taskCounts[date] || 0) + 1;
    }
  });

  const formattedData = Object.entries(taskCounts).map(([date, count]) => ({
    date,
    count,
  }));

  setChartData(formattedData);
};


    fetchTasks();
  }, [workspaceId]);

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#4F46E5" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductivityChart;
