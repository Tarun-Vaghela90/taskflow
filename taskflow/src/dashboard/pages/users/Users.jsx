import { Button, Modal, Space, Table, Radio } from "antd";
import { EditOutlined,UserAddOutlined  } from "@ant-design/icons";
import axios from "axios";
import React, { useEffect, useState, useMemo } from "react";
import PopUp from "../../../components/form/PopUp";
import { toast } from "react-toastify";
import FormInput from "../../../components/form/FormInput";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

export default function Users() {
  const [user, setUser] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const token = localStorage.getItem("Token");

  // Dynamic schema depending on create or edit
  const schema = useMemo(() => {
    return yup.object().shape({
      email: yup.string().email("Invalid email").required("Email is Required"),
      password: editingUser
        ? yup
            .string()
            .nullable()
            .transform((v) => (v === "" ? null : v)) // convert empty string to null
            .test(
              "password-length",
              "Password must be at least 6 characters",
              (val) => !val || val.length >= 6
            )
        : yup
            .string()
            .required("Password is Required")
            .min(6, "Password must be at least 6 characters"),
      fullName: yup.string().required("Full Name is Required"),
      status: yup.boolean().required("Please select a role"),
    });
  }, [editingUser]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const fetchusers = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/users",
        {},
        {
          headers: { Token: token },
        }
      );
      setUser(response.data.data);
    } catch (err) {
      toast.error("Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchusers();
  }, []);

  const onSubmit = async (data) => {
  try {
    if (editingUser) {
      await axios.put(
        `http://localhost:3000/api/v1/users/updateUser/${editingUser.id}`, // send ID in URL
        {
          id: editingUser.id, // also include in body if backend expects it
          fullName: data.fullName,
          email: data.email,
          isAdmin: data.status,
          ...(data.password ? { password: data.password } : {}), // send password only if entered
        },
        {
          headers: {
            "Content-Type": "application/json",
            Token: token || "",
          },
        }
      );
      toast.success("User updated successfully");
    } else {
      await axios.post(
        "http://localhost:3000/api/v1/users/signup",
        {
          fullName: data.fullName,
          email: data.email,
          password: data.password,
          isAdmin: data.status,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Token: token || "",
          },
        }
      );
      toast.success("Account Created Successfully");
    }

    setIsModalOpen(false);
    reset();
    setEditingUser(null);
    fetchusers();
  } catch (err) {
    console.log(err);
    toast.error(
      err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Something went wrong"
    );
  }
};


  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(
        `http://localhost:3000/api/v1/users/${id}`,
        {
          headers: { Token: token },
        }
      );
      toast.success(response.data.message);
      fetchusers();
    } catch (error) {
      console.log(error);
      toast.warning(error.message);
    }
  };

  const handleEdit = (record) => {
    setEditingUser(record);
    setIsModalOpen(true);
    setValue("fullName", record.fullName);
    setValue("email", record.email);
    setValue("status", record.isAdmin);
    setValue("password", ""); // keep empty for optional update
  };

  const columns = [
    { title: "id", dataIndex: "id" },
    { title: "Full Name", dataIndex: "fullName" },
    { title: "Email", dataIndex: "email" },
    {
      title: "Role",
      dataIndex: "isAdmin",
      render: (isAdmin) => (isAdmin ? "Admin" : "User"),
    },
    { title: "CreatedAt", dataIndex: "createdAt" },
    { title: "UpdateAt", dataIndex: "updatedAt" },
    {
      title: "Actions",
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => handleEdit(record)}>
            <EditOutlined />
          </Button>
          <PopUp
            onDelete={() => handleDelete(record.id)}
            title="Are you sure? User Related will also be Deleted"
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
  <Button
    type="primary"
    onClick={() => {
      setEditingUser(null);
      reset();
      setIsModalOpen(true);
    }}
  >
    <UserAddOutlined /> 
  </Button>
</div>


      <Modal
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
        onOk={handleSubmit(onSubmit)}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <h2 className="text-2xl font-semibold mb-6 text-center text-gray-700">
            {editingUser ? "Edit User" : "Signup"}
          </h2>

          <div className="mb-4">
            <FormInput
              label="Full Name"
              name="fullName"
              type="text"
              register={register}
              error={errors.fullName}
              placeholder="Enter Full Name"
            />
          </div>

          <div className="mb-4">
            <FormInput
              label="Email"
              name="email"
              type="email"
              register={register}
              error={errors.email}
              placeholder="Enter Email"
            />
          </div>

          <div className="mb-4">
            <FormInput
              label="Password"
              name="password"
              type="password"
              register={register}
              error={errors.password}
              placeholder={
                editingUser
                  ? "Leave blank to keep old password"
                  : "Enter Password"
              }
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 font-medium text-gray-700">
              Select Role
            </label>
            <Radio.Group
              onChange={(e) => setValue("status", e.target.value)}
              value={watch("status")}
            >
              <Radio value={true}>Admin</Radio>
              <Radio value={false}>User</Radio>
            </Radio.Group>
            {errors.status && (
              <p className="text-red-500 text-sm mt-1">
                {errors.status.message}
              </p>
            )}
          </div>
        </form>
      </Modal>

      <Table dataSource={user} columns={columns} rowKey="id" />
    </div>
  );
}
