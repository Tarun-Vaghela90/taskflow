import React, { useEffect, useState } from "react";
import { Row, Col, Card, Spin } from "antd";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
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

const DashboardCharts = ({ projectId, tasks }) => {
  const [taskStatusData, setTaskStatusData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch Task Status Data (Pie)
  useEffect(() => {
    const fetchTaskStatus = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/v1/dashboard/${projectId}/task-status`
        );
        const data = await res.json();
        setTaskStatusData(data);
      } catch (err) {
        console.error("Failed to fetch task status data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchTaskStatus();
    }
  }, [projectId]);

  // Prepare Bar Chart Data (Tasks per Member)
  const memberTaskCount = {};
  tasks.forEach((task) => {
    const memberName = task.User?.fullName || "Unassigned";
    memberTaskCount[memberName] = (memberTaskCount[memberName] || 0) + 1;
  });

  const tasksPerMemberData = {
    labels: Object.keys(memberTaskCount),
    datasets: [
      {
        label: "Tasks Assigned",
        data: Object.values(memberTaskCount),
        backgroundColor: "#1890ff",
      },
    ],
  };

  return (
    <Row gutter={[16, 16]}>
      {/* Pie Chart - Task Status */}
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

      {/* Bar Chart - Tasks per Member */}
      <Col xs={24} md={12}>
        <Card title="Tasks per Member" style={{ width: "100%", height: 350 }}>
          <div style={{ height: 260 }}>
            <Bar data={tasksPerMemberData} options={chartOptions} />
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default DashboardCharts;
