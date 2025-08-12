// DashboardCharts.js
import React, { useEffect, useState } from "react";
import { Row, Col, Card, Spin } from "antd";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
};

const DashboardCharts = ({ projectId }) => {
  const [taskStatusData, setTaskStatusData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch Task Status Data
  // useEffect(() => {
  //   const fetchTaskStatus = async () => {
  //     try {
  //       const res = await fetch(`http://localhost:3000/api/v1/dashboard/12/task-status`);
  //       const data = await res.json();
  //       console.log(data)
  //       setTaskStatusData(data);
  //     } catch (err) {
  //       console.error("Failed to fetch task status data:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   if (projectId) {
  //     fetchTaskStatus();
  //   }
  // }, [projectId]);
useEffect(() => {
  const fetchTaskStatus = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/v1/dashboard/12/task-status`);
      const data = await res.json();
      console.log(data);
      setTaskStatusData(data);
    } catch (err) {
      console.error("Failed to fetch task status data:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchTaskStatus();
}, []);

  // Static Task Trend Data for now
  const taskTrendData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Tasks Created",
        data: [12, 19, 8, 15],
        fill: false,
        borderColor: "#1890ff",
        tension: 0.3,
      },
      {
        label: "Tasks Completed",
        data: [5, 14, 7, 10],
        fill: false,
        borderColor: "#52c41a",
        tension: 0.3,
      },
    ],
  };

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={12}>
        <Card title="Project Completion" style={{ width: "100%", height: 350 }}>
          <div style={{ height: 260 }}>
            {loading ? (
              <Spin />
            ) : (
              taskStatusData && <Pie data={taskStatusData} options={chartOptions} />
            )}
          </div>
        </Card>
      </Col>
      <Col xs={24} md={12}>
        <Card title="Task Trends Over Time" style={{ width: "100%", height: 350 }}>
          <div style={{ height: 260 }}>
            <Line data={taskTrendData} options={chartOptions} />
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default DashboardCharts;
