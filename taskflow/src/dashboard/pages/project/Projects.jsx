import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Input,
  Modal,
  Space,
  Form,
  Select,
  message,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProjects,
  deleteProject,
  updateProject,
  createProject,
  addProjectMember,
} from "../../../Redux/Slices/projectSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PopUp from "../../../components/form/PopUp.jsx";
import { EditOutlined, UserAddOutlined, EyeOutlined } from "@ant-design/icons";
import { jwtDecode } from "jwt-decode";

const Projects = () => {
  const dispatch = useDispatch();
  const { projects, status } = useSelector((state) => state.project);
  const navigate = useNavigate();

  const [editProjectId, setEditProjectId] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [admin, setAdmin] = useState(false);
  const [userId, setUserId] = useState(null);

  const token = localStorage.getItem("Token");

  const [form] = Form.useForm();

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("userID :" + decoded.id);
        setAdmin(Boolean(decoded.isAdmin));
        setUserId(decoded.id);
      } catch (err) {
        console.error("Error decoding token:", err);
      }
    }
  }, [token]);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.post(
          "http://localhost:3000/api/v1/users",
          {},
          {
            headers: {
              Token: token,
            },
          }
        );
        setUsers(response.data.data || []);
      } catch (error) {
        console.error("Error fetching users", error);
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = (id) => {
    dispatch(deleteProject(id));
  };

  const handleView = (id) => {
    navigate(`/admin/projects/project/${id}`);
  };

  const openModal = (type, project = null) => {
    form.resetFields();
    setModalType(type);

    if (type === "edit" && project) {
      setEditProjectId(project.id);
      form.setFieldsValue({
        name: project?.name || "",
        description: project?.description || "",
        status: project?.status || "pending", // ✅ Pre-fill status for edit
        // userIds: project?.teamMembers?.map((m) => m.id) || [],
      });
    } else if (type === "addMember" && project) {
      setSelectedProjectId(project.id);
    }
    setIsModalOpen(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (modalType === "create") {
        const projectRes = await dispatch(
          createProject({ ...values, ownerId: 1 }) // ✅ status included in values
        ).unwrap();

        await dispatch(
          addProjectMember({
            members: values.userIds.map((uid) => ({
              userId: uid,
              projectId: projectRes.id,
            })),
          })
        ).unwrap();

        await dispatch(fetchProjects());
        message.success("Project created successfully");
      } else if (modalType === "edit") {
        await dispatch(
          updateProject({
            projectId: editProjectId,
            updatedData: {
              name: values.name,
              description: values.description,
              status: values.status, // ✅ send updated status
            },
          })
        ).unwrap();

        const selectedUserIds = values.userIds || [];
        const existingIds =
          projects
            .find((p) => p.id === editProjectId)
            ?.teamMembers?.map((m) => m.id) || [];

        const newMembers = selectedUserIds.filter(
          (id) => !existingIds.includes(id)
        );

        if (newMembers.length > 0) {
          await dispatch(
            addProjectMember({
              members: newMembers.map((uid) => ({
                userId: uid,
                projectId: editProjectId,
              })),
            })
          ).unwrap();
        }

        await dispatch(fetchProjects());
        message.success("Project updated successfully");
      } else if (modalType === "addMember") {
        await dispatch(
          addProjectMember({
            members: values.userIds.map((uid) => ({
              userId: uid,
              projectId: selectedProjectId,
            })),
          })
        ).unwrap();

        await dispatch(fetchProjects());
        message.success("Members added successfully");
      }

      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      console.error(error);
      message.error("Something went wrong. Please try again.");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
  };

  const filteredProjects = admin
    ? projects
    : (projects || []).filter(
        (p) =>
          p.ownerId === userId ||
          p.teamMembers?.some((m) => m.id === userId)
      );

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 80,
    },
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
    },
    {
      title: "Status", // ✅ Added column
      dataIndex: "status",
      render: (text) =>
        text
          ? text.charAt(0).toUpperCase() + text.slice(1).replace("_", " ")
          : "N/A",
    },
    {
      title: "Owner",
      dataIndex: "owner",
      render: (_, record) => record?.owner?.fullName ?? "N/A",
    },
    {
      title: "Team Members",
      dataIndex: "teamMembers",
      render: (_, record) =>
        record?.teamMembers?.length > 0
          ? record.teamMembers.map((member) => member.fullName).join(", ")
          : "N/A",
    },
    {
      title: "Actions",
      render: (_, record) => (
        <Space>
          <Button onClick={() => openModal("edit", record)}>
            <EditOutlined />
          </Button>
          <PopUp
            onDelete={() => handleDelete(record.id)}
            title="Are you sure? Related tasks will also be deleted"
          />
          <Button onClick={() => handleView(record.id)}>
            <EyeOutlined />
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => openModal("create")}>
          Add Project
        </Button>
      </Space>

      <Table
        dataSource={filteredProjects || []}
        columns={columns}
        rowKey="id"
        loading={status === "loading"}
      />

      <Modal
        title={
          modalType === "create"
            ? "Add New Project"
            : modalType === "edit"
            ? "Edit Project"
            : "Add Member to Project"
        }
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleCancel}
        okText={
          modalType === "create"
            ? "Create"
            : modalType === "edit"
            ? "Update"
            : "Add"
        }
      >
        <Form layout="vertical" form={form}>
          {(modalType === "create" || modalType === "edit") && (
            <>
              <Form.Item
                label="Name"
                name="name"
                rules={[
                  { required: true, message: "Please enter project name" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Description"
                name="description"
                rules={[
                  { required: true, message: "Please enter description" },
                ]}
              >
                <Input />
              </Form.Item>

              {/* ✅ Status Field */}
              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: "Please select status" }]}
              >
                <Select placeholder="Select status">
                  <Select.Option value="pending">Pending</Select.Option>
                  <Select.Option value="in_progress">In Progress</Select.Option>
                  <Select.Option value="completed">Completed</Select.Option>
                  <Select.Option value="archived">Archived</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Project Members"
                name="userIds"
                rules={
                  modalType === "create"
                    ? [{ required: true, message: "Please select users" }]
                    : []
                }
              >
                <Select mode="multiple" placeholder="Choose users" allowClear>
                  {users.map((user) => (
                    <Select.Option key={user.id} value={user.id}>
                      {user.fullName} - {user.isAdmin ? "Admin" : "Member"}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              {modalType === "edit" && (
                <div style={{ marginBottom: "16px" }}>
                  <h4>Current Members:</h4>
                  {projects
                    .find((p) => p.id === editProjectId)
                    ?.teamMembers?.map((member) => (
                      <div
                        key={member.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <span style={{ flex: 1 }}>{member.fullName}</span>
                        <Button
                          danger
                          size="small"
                          onClick={() => {
                            axios
                              .delete(
                                `http://localhost:3000/api/v1/projectmembers/${member.id}`,
                                {
                                  headers: { Token: token },
                                  data: { projectId: editProjectId },
                                }
                              )
                              .then(() => dispatch(fetchProjects()))
                              .catch((err) => console.error(err));
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    )) ?? <p>No members</p>}
                </div>
              )}
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default Projects;
