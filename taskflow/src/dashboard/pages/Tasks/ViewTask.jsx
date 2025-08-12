// src/Pages/Admin/Tasks/ViewTask.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Card, Button, Input, Form, Tabs, Modal } from "antd";
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

const { TextArea } = Input;

const editTaskSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required"),
});

const commentSchema = Yup.object().shape({
  comment: Yup.string().required("Enter Comment"),
});

export default function TaskView() {
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
  const isAdmin = decoded.isAdmin;

  // form for editing task (in modal)
  const {
    control: editControl,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm({
    resolver: yupResolver(editTaskSchema),
    defaultValues: { title: "", description: "" },
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
      });
    }
  }, [selectedtask, resetEdit]);

  const onSubmitEdit = (data) => {
    dispatch(updatetask({ taskId: id, updatedData: data }))
      .unwrap()
      .then(() => {
        toast.success("Task updated successfully");
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

  const dummyTimeLogs = [
    { duration: "2h", createdAt: new Date().toISOString() },
    { duration: "1.5h", createdAt: new Date().toISOString() },
  ];

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
    {
      key: "2",
      label: "Time Logs",
      children: dummyTimeLogs.map((t, i) => (
        <Card key={i} style={{ marginBottom: 10 }}>
          <p>Duration: {t.duration}</p>
          <p style={{ color: "gray" }}>
            Logged at: {new Date(t.createdAt).toLocaleString()}
          </p>
        </Card>
      )),
    },
  ];

  if (loading || !selectedtask) return <p>Loading task...</p>;

  return (
    <div style={{ padding: 24 }}>
      <h2>Task View</h2>

      <Card>
        <h3>{selectedtask.title}</h3>
        <p>{selectedtask.description}</p>
        <p>
          <strong>Status:</strong> {selectedtask.status}
        </p>
        <p>
          <strong>Created By:</strong> {selectedtask.createdBy}
        </p>
        <p>
          <strong>Project id:</strong> {selectedtask.projectId}
        </p>
        <p>
          <strong>Created At:</strong>{" "}
          {new Date(selectedtask.createdAt).toLocaleString()}
        </p>

        <Button type="primary" onClick={() => setIsEditModalVisible(true)}>
          Edit
        </Button>
        <Button danger style={{ marginLeft: 8 }} onClick={handleDelete}>
          Delete
        </Button>
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
