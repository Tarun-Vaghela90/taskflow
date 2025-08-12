import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { Spin, message } from "antd";
import { toast } from "react-toastify";
import { CameraOutlined } from "@ant-design/icons";
import FormInput from "../components/form/FormInput";

const schema = yup.object().shape({
  fullName: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
});

const EditProfile = ({ onClose, onSuccess }) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const token = localStorage.getItem("Token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:3000/api/v1/users/me", {
          headers: { Token: token },
        });

        const { fullName, email, profilePhoto } = res.data.User;
        setValue("fullName", fullName);
        setValue("email", email);

        if (profilePhoto) {
          setProfileImage(`http://localhost:3000/${profilePhoto}`);
        }
      } catch (error) {
        message.error("Failed to load profile");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchProfile();
  }, [setValue, token]);

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("fullName", data.fullName);
      formData.append("email", data.email);
      if (previewImage) {
        formData.append("profilePhoto", previewImage);
      }

      await axios.put("http://localhost:3000/api/v1/users/update", formData, {
        headers: {
          Token: token,
          "Content-Type": "multipart/form-data",
        },
      });
      if (onSuccess) onSuccess();
      toast.success("Profile updated successfully");
    } catch (error) {
      message.error("Failed to update profile");
      console.error(error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewImage(file);
      setProfileImage(URL.createObjectURL(file));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin tip="Loading profile..." />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <img
            src={
              profileImage ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            alt="Profile"
            className="w-28 h-28 rounded-full object-cover border-4 border-gray-200 shadow"
          />
          <label
            htmlFor="profilePhoto"
            className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer shadow hover:bg-blue-700 transition"
          >
            <CameraOutlined className="text-white text-lg" />
          </label>
          <input
            id="profilePhoto"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>
        <h2 className="text-2xl font-semibold mt-4">Edit Profile</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          label="Full Name"
          name="fullName"
          placeholder="Enter your name"
          register={register}
          error={errors.fullName}
          required
        />

        <FormInput
          label="Email"
          name="email"
          type="email"
          placeholder="Enter your email"
          register={register}
          error={errors.email}
          required
        />

        <div className="flex gap-3 pt-2">
  <button
    type="submit"
    disabled={isSubmitting}
    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm disabled:opacity-60"
  >
    {isSubmitting ? "Saving..." : "Save Changes"}
  </button>

  <button
    type="button"
    onClick={onClose}
    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition font-medium shadow-sm"
  >
    Cancel
  </button>
</div>
      </form>
         
    </>
  );
};

export default EditProfile;
