// src/Pages/Admin/Tasks/ViewTask.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Card, Button, Input, Form, Tabs, Modal, Descriptions } from "antd";
import { useTheme } from "../../../shared/hooks/ThemeContext"; // ✅ import your hook

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import {
  fetchtaskById,
  updatetask,
  deletetask,
} from "../../../Redux/Slices/taskSlice";
import { toast } from "react-toastify";
import { useHttpClient } from "../../../shared/hooks/http-hook";
import { jwtDecode } from "jwt-decode";
import { DatePicker } from "antd";
import dayjs from "dayjs";
const { TextArea } = Input;

const editTaskSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required"),
});

const commentSchema = Yup.object().shape({
  comment: Yup.string().required("Enter Comment"),
});

export default function TaskView() {
   const { isAdmin , userId} = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const { selectedtask, loading } = useSelector((state) => state.task);

  const [editCommentId, setEditCommentId] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [comment, setComment] = useState([]);
  const [addComment, setAddComment] = useState(false);

  const token = localStorage.getItem("Token");
  const decoded = jwtDecode(token);
  const currentUserId = decoded.id;
  console.log("tarun",isAdmin)

  // form for editing task (in modal)
  const {
    control: editControl,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm({
    resolver: yupResolver(editTaskSchema),
    defaultValues: { title: "", description: "",dueDate: ""  },
  });

  // form for adding comment
  const {
    register: commentRegister,
    handleSubmit: handleCommentSubmit,
    reset: resetComment,
    formState: { errors: commentErrors },
  } = useForm({
    resolver: yupResolver(commentSchema),
  });

  const fetchComments = async () => {
    try {
      const reponseData = await sendRequest(
        `http://localhost:3000/api/v1/comments/${id}`,
        "GET",
        null,
        {
          "Content-Type": "application/json",
          Token: token,
        }
      );
      setComment(reponseData);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    dispatch(fetchtaskById(id));
    fetchComments();
  }, [dispatch, id]);

  useEffect(() => {
    if (selectedtask) {
      resetEdit({
        title: selectedtask.title || "",
        description: selectedtask.description || "",
        dueDate: selectedtask.dueDate || ""
      });
    }
  }, [selectedtask, resetEdit]);

  const onSubmitEdit = (data) => {
    console.log(data)
    dispatch(updatetask({ taskId: id, updatedData: data }))
      .unwrap()
      .then(() => {
        toast.success("Task updated successfully");
        dispatch(fetchtaskById(id));
        setIsEditModalVisible(false);
      })
      .catch(() => toast.error("Task update failed"));
  };

  const onSubmitComment = async (data) => {
    try {
      const reponseData = await sendRequest(
        "http://localhost:3000/api/v1/comments/",
        "POST",
        JSON.stringify({
          comment: data.comment,
          projectId: selectedtask.projectId,
          TaskId: id,
        }),
        {
          "Content-Type": "application/json",
          Token: token,
        }
      );
      setComment((prev) => [...prev, reponseData.data]);
      resetComment();
      setAddComment(false);
      toast.success("Commented Successfully");
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = () => {
    dispatch(deletetask(id))
      .unwrap()
      .then(() => {
        toast.success("Task deleted");
        navigate("/admin/tasks");
      })
      .catch(() => toast.error("Delete failed"));
  };

  const handleSaveEdit = async (commentId) => {
    try {
      await sendRequest(
        `http://localhost:3000/api/v1/comments/${commentId}`,
        "PUT",
        JSON.stringify({ comment: editedText }),
        {
          "Content-Type": "application/json",
          Token: token,
        }
      );
      setEditCommentId(null);
      fetchComments();
      toast.success("Comment Updated Successfully");
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await sendRequest(
        `http://localhost:3000/api/v1/comments/${commentId}`,
        "DELETE",
        null,
        {
          "Content-Type": "application/json",
          Token: token,
        }
      );
      fetchComments();
      toast.warning("Comment Deleted ");
    } catch (error) {
      console.log(error);
    }
  };



  const tabItems = [
    {
      key: "1",
      label: "Comments",
      children: (
        <>
          {!addComment && (
            <Button type="primary" onClick={() => setAddComment(true)}>
              Add Comment
            </Button>
          )}

          {addComment && (
            <div style={{ marginTop: 20 }}>
              <h4>Add a Comment</h4>
              <form onSubmit={handleCommentSubmit(onSubmitComment)}>
                <div className="mb-4">
                  <textarea
                    rows={4}
                    cols={100}
                    placeholder="Enter your comment here"
                    {...commentRegister("comment")}
                  />
                  {commentErrors.comment && (
                    <p style={{ color: "red" }}>{commentErrors.comment.message}</p>
                  )}
                </div>

                <Button
                  type="default"
                  style={{ marginTop: 10, marginRight: 10 }}
                  onClick={() => setAddComment(false)}
                >
                  Cancel
                </Button>

                <Button type="primary" htmlType="submit" style={{ marginTop: 10 }}>
                  Submit
                </Button>
              </form>
            </div>
          )}

          {Array.isArray(comment) && comment.length > 0 ? (
            comment.map((c, i) => (
              <Card key={i} style={{ marginBottom: 10, marginTop: 20 }}>
                {editCommentId === c.id ? (
                  <>
                    <Input.TextArea
                      rows={3}
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                    />
                    <div style={{ marginTop: 10 }}>
                      <Button
                        type="primary"
                        onClick={() => handleSaveEdit(c.id)}
                        style={{ marginRight: 8 }}
                      >
                        Save
                      </Button>
                      <Button onClick={() => setEditCommentId(null)}>Cancel</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p>{c.comment}</p>
                    <p>Commented By: {c.userId}</p>
                    <p style={{ color: "gray" }}>
                      Created: {new Date(c.createdAt).toLocaleString()}
                    </p>
                    {(c.userId === currentUserId || isAdmin) && (
                      <div>
                        <Button
                          type="link"
                          onClick={() => {
                            setEditCommentId(c.id);
                            setEditedText(c.comment);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          type="link"
                          danger
                          onClick={() => handleDeleteComment(c.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </Card>
            ))
          ) : (
            <p>No comments yet</p>
          )}
        </>
      ),
    },
    
  ];

  if (loading || !selectedtask) return <p>Loading task...</p>;

  return (
    <div style={{ padding: 24 }}>
      <h2>Task View</h2>

      <Card style={{ marginBottom: 24 }}>
  <Descriptions
    title="Task Details"
    bordered
    column={2}
    size="middle"
    labelStyle={{ fontWeight: "bold", width: "30%" }}
  >
    <Descriptions.Item label="Title">
      {selectedtask.title}
    </Descriptions.Item>

    <Descriptions.Item label="Description">
      {selectedtask.description}
    </Descriptions.Item>

    <Descriptions.Item label="Status">
      <span style={{ color: selectedtask.status === "TODO" ? "orange" : "green" }}>
        {selectedtask.status}
      </span>
    </Descriptions.Item>

    <Descriptions.Item label="Due Date">
      {selectedtask.dueDate
        ? new Date(selectedtask.dueDate).toLocaleString()
        : "Not set"}
    </Descriptions.Item>

    <Descriptions.Item label="Attachment">
      {selectedtask.attachment ? (
        <a href={selectedtask.attachment} target="_blank" rel="noopener noreferrer">
          View Attachment
        </a>
      ) : (
        "No attachment"
      )}
    </Descriptions.Item>

    <Descriptions.Item label="Project">
      {selectedtask.project?.name} (ID: {selectedtask.project?.id})
    </Descriptions.Item>

    <Descriptions.Item label="Assigned To">
      {selectedtask.User
        ? `${selectedtask.User.fullName} (${selectedtask.User.email})`
        : "Unassigned"}
    </Descriptions.Item>

   <Descriptions.Item label="Created By">
  {selectedtask.creator?.fullName
    ? `${selectedtask.creator.fullName} (ID:${selectedtask.creator?.id})`
    : "Unknown"}
</Descriptions.Item>


    <Descriptions.Item label="Started At">
      {selectedtask.startedAt
        ? new Date(selectedtask.startedAt).toLocaleString()
        : "Not started"}
    </Descriptions.Item>

    <Descriptions.Item label="Stopped At">
      {selectedtask.stoppedAt
        ? new Date(selectedtask.stoppedAt).toLocaleString()
        : "Not stopped"}
    </Descriptions.Item>

    <Descriptions.Item label="Elapsed Time">
      {selectedtask.elapsedTime
        ? `${(selectedtask.elapsedTime / 3600).toFixed(2)} hours`
        : "0 hours"}
    </Descriptions.Item>

    <Descriptions.Item label="Created At">
      {new Date(selectedtask.createdAt).toLocaleString()}
    </Descriptions.Item>

    <Descriptions.Item label="Updated At">
      {new Date(selectedtask.updatedAt).toLocaleString()}
    </Descriptions.Item>
  </Descriptions>

{isAdmin && (
  <div style={{ marginTop: 16 }}>
    <Button type="primary" onClick={() => setIsEditModalVisible(true)}>
      Edit
    </Button>
    <Button danger style={{ marginLeft: 8 }} onClick={handleDelete}>
      Delete
    </Button>
  </div>
)}

</Card>


      {/* Edit Task Modal */}
      <Modal
        title="Edit Task"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
      >
        <form onSubmit={handleEditSubmit(onSubmitEdit)}>
          <Form.Item
            label="Title"
            validateStatus={editErrors.title && "error"}
            help={editErrors.title?.message}
          >
            <Controller
              name="title"
              control={editControl}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>

          <Form.Item
            label="Description"
            validateStatus={editErrors.description && "error"}
            help={editErrors.description?.message}
          >
            <Controller
              name="description"
              control={editControl}
              render={({ field }) => <TextArea rows={4} {...field} />}
            />
          </Form.Item>

    {(decoded?.id === selectedtask?.createdBy || isAdmin) && (
  <Form.Item label="Due Date" validateStatus={editErrors.dueDate && "error"} help={editErrors.dueDate?.message}>
    <Controller
      name="dueDate"
      control={editControl}
      render={({ field }) => (
        <DatePicker
          {...field}
          style={{ width: "100%" }}
          format="YYYY-MM-DD"
          value={field.value ? dayjs(field.value) : null}
         
          onChange={(date) => field.onChange(date ? date.toISOString() : null)}
        />
      )}
    />
  </Form.Item>
)}

    
    

          <div style={{ textAlign: "right" }}>
            <Button onClick={() => setIsEditModalVisible(false)} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </div>
        </form>
      </Modal>

      <Tabs items={tabItems} style={{ marginTop: 24 }} />
    </div>
  );
}
