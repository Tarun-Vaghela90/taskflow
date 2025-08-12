import React, { useEffect, useState } from "react";
import {
  Card,
  Descriptions,
  Row,
  Col,
  Grid,
  Spin,
  message,
  Dropdown,
  Button,
} from "antd";
import { DownOutlined } from "@ant-design/icons";
import DashboardChart from "./DashboardChart";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useTheme } from "../../../shared/hooks/ThemeContext";

const { useBreakpoint } = Grid;

export default function Dashboard() {
  const screens = useBreakpoint();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  const token = localStorage.getItem("Token");
  const decoded = jwtDecode(token);
  const { isAdmin } = useTheme();
  const getColumnCount = () => {
    if (screens.xs) return 1;
    if (screens.sm) return 2;
    if (screens.md) return 2;
    if (screens.lg) return 3;
    return 4;
  };

  // Fetch project list
  // Fetch project list
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/v1/projects/projectsData"
        );

        let allProjects = response.data.data; // API returns array of projects
        console.log(allProjects);

        // Get logged-in user info (assuming stored in localStorage)
        const userId = decoded?.id;

        let filteredProjects;

        if (isAdmin) {
          // Admin → see all projects
          filteredProjects = allProjects;
        } else {
          // Normal user → only projects where they are owner or in teamMembers
          filteredProjects = allProjects.filter(
            (project) =>
              project.ownerId === userId ||
              project.teamMembers?.some((member) => member.id === userId)
          );
        }

        setProjects(filteredProjects);
      } catch (err) {
        console.error(err);
        message.error("Failed to fetch projects");
      }
    };

    fetchProjects();
  }, []);

  // Fetch overview
  const fetchOverview = async (projectId) => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `http://localhost:3000/api/v1/dashboard/${projectId}/overview`
      );
      setOverview(data);
    } catch (error) {
      console.error("Error fetching overview:", error);
      message.error("Failed to load project overview");
    } finally {
      setLoading(false);
    }
  };

  // Dropdown menu
  const projectMenu = projects.map((p) => ({
    key: p.id,
    label: p.name,
    onClick: () => {
      setSelectedProject(p);
      fetchOverview(p.id);
    },
  }));

  // Load first project by default
  useEffect(() => {
    if (projects.length > 0) {
      setSelectedProject(projects[0]);
      fetchOverview(projects[0].id);
    }
  }, [projects]);

  return (
    <div style={{ padding: "16px" }}>
      {/* Project Selection */}
      <div style={{ marginBottom: 16 }}>
        <Dropdown menu={{ items: projectMenu }}>
          <Button type="primary">
            {selectedProject ? selectedProject.name : "Select Project"}{" "}
            <DownOutlined />
          </Button>
        </Dropdown>
      </div>

      {/* Charts Row - Pass selected project id */}
      <DashboardChart
        projectId={selectedProject?.id}
        tasks={selectedProject?.tasks || []}
      />

      {/* Info Cards Row */}
      {loading ? (
        <Spin style={{ display: "block", marginTop: 50 }} />
      ) : overview ? (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} md={12}>
            <Card title="Project Overview">
              <Card
                type="inner"
                title={overview.projectOverview.name}
                extra={<a href="#">View</a>}
              >
                <Descriptions
                  items={[
                    {
                      key: "1",
                      label: "Created At",
                      children: overview.projectOverview.createdAt
                        ? new Date(overview.projectOverview.createdAt)
                            .toISOString()
                            .split("T")[0]
                        : "N/A",
                    },
                    {
                      key: "2",
                      label: "Updated At",
                      children: overview.projectOverview.updatedAt
                        ? new Date(overview.projectOverview.updatedAt)
                            .toISOString()
                            .split("T")[0]
                        : "N/A",
                    },
                    {
                      key: "3",
                      label: "Status",
                      children: overview.projectOverview.status,
                    },
                    {
                      key: "4",
                      label: "Team Members",
                      children: Array.isArray(
                        overview.projectOverview.teamMembers
                      )
                        ? overview.projectOverview.teamMembers
                            .map((m) => m.fullName)
                            .join(", ")
                        : overview.projectOverview.teamMembers?.fullName ||
                          "No members",
                    },
                  ]}
                  column={getColumnCount()}
                />
              </Card>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card title="Project-wise Task Summary">
              <Card
                type="inner"
                title={overview.projectOverview.name}
                extra={<a href="#">View</a>}
              >
                <Descriptions
                  items={[
                    {
                      key: "1",
                      label: "Total Tasks",
                      children: overview.taskSummary.totalTasks,
                    },
                    {
                      key: "2",
                      label: "Completed",
                      children: overview.taskSummary.completed,
                    },
                    {
                      key: "3",
                      label: "In Progress",
                      children: overview.taskSummary.inProgress,
                    },
                    {
                      key: "4",
                      label: "Overdue",
                      children: overview.taskSummary.overdue,
                    },
                  ]}
                  column={getColumnCount()}
                />
              </Card>
            </Card>
          </Col>
        </Row>
      ) : (
        <p>No project selected</p>
      )}
    </div>
  );
}
