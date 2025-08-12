import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Card,
  Descriptions,
  List,
  Tag,
  Avatar,
  Typography,
  Divider,
  Spin,
  Button,
  Space,
} from "antd";
import { EditOutlined, UserOutlined } from "@ant-design/icons";

export default function Viewproject() {
  const { id } = useParams();
  const token = localStorage.getItem("Token");
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const { Title, Paragraph } = Typography;

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/v1/projects/projectsData/${id}`,
          {
            headers: {
              Token: token,
            },
          }
        );
        setProject(res.data?.data || null);
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProject();
  }, [id, token]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!project) {
    return (
      <Card style={{ maxWidth: 600, margin: "50px auto", textAlign: "center" }}>
        <Title level={3} type="danger">
          Project not found
        </Title>
      </Card>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px" }}>
      <Card
        bordered={false}
        style={{
          marginBottom: 24,
          background: "#fefefe",
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        }}
        title={
          <Space align="center" style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <div>
              <Title level={2} style={{ margin: 0 }}>
                {project.name}
              </Title>
              <Paragraph type="secondary" style={{ margin: 0 }}>
                {project.description}
              </Paragraph>
            </div>
            <Button type="primary" icon={<EditOutlined />}>
              Edit Project
            </Button>
          </Space>
        }
      >
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="Project ID">{project.id}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={project.status === "Completed" ? "green" : "blue"}>
              {project.status || "N/A"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {new Date(project.createdAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Updated At">
            {new Date(project.updatedAt).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Owner" style={{ marginBottom: 24 }}>
        {project.owner ? (
          <Space>
          <Avatar
        src={
          project.owner?.profilePhoto
            ? `http://localhost:3000/${project.owner.profilePhoto}`
            : null
        }
        icon={!project.owner?.profilePhoto && <UserOutlined />}
      />
            <span>
              {project.owner.fullName} ({project.owner.email})
            </span>
          </Space>
        ) : (
          <Paragraph type="secondary">No owner information available.</Paragraph>
        )}
      </Card>

      <Card title="Team Members" style={{ marginBottom: 24 }}>
  {project.teamMembers?.length > 0 ? (
    <List
      dataSource={project.teamMembers}
      renderItem={(member) => (
        <List.Item>
          <List.Item.Meta
            avatar={
              <Avatar
                src={
                  member?.profilePhoto
                    ? `http://localhost:3000/${member.profilePhoto}`
                    : null
                }
                icon={!member?.profilePhoto && <UserOutlined />}
              />
            }
            title={member.fullName}
            description={member.email}
          />
        </List.Item>
      )}
    />
  ) : (
    <span>No team members assigned</span>
  )}
</Card>


      <Card title="Tasks">
        {project.tasks?.length > 0 ? (
          <List
            grid={{ gutter: 16, column: 2 }}
            dataSource={project.tasks}
            renderItem={(task) => (
              <List.Item>
                <Card
                  title={task.title}
                  extra={
                    <Tag
                      color={
                        task.status?.toLowerCase() === "completed"
                          ? "green"
                          : "blue"
                      }
                    >
                      {task.status?.trim() || "PENDING"}
                    </Tag>
                  }
                  style={{ height: "100%" }}
                >
                  <p>
                    <strong>Description:</strong> {task.description}
                  </p>
                  <p>
                    <strong>Assigned To:</strong>{" "}
                    {task.User?.fullName || "Unassigned"}
                  </p>
                  {task.attachment && (
                    <img
                      src={`http://localhost:3000/uploads/${task.attachment}`}
                      alt="attachment"
                      style={{
                        marginTop: 8,
                        maxWidth: "100%",
                        height: 180,
                        objectFit: "contain",
                        borderRadius: 4,
                        border: "1px solid #f0f0f0",
                      }}
                    />
                  )}
                </Card>
              </List.Item>
            )}
          />
        ) : (
          <Paragraph type="secondary">No tasks for this project.</Paragraph>
        )}
      </Card>
    </div>
  );
}
