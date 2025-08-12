import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchtasks,
  updateTaskStatus,
  createtask,
} from "../../Redux/Slices/taskSlice";
import { DatePicker } from "antd"; // ✅ import DatePicker
import dayjs from "dayjs";
import { DndContext } from "@dnd-kit/core";
import Column from "./Column";
import { Modal, Button, Input, Select, message } from "antd";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useTheme } from "../../shared/hooks/ThemeContext";

const COLUMN = [
  { id: "TODO", title: "To Do" },
  { id: "IN_PROGRESS", title: "In Progress" },
  { id: "DONE", title: "Done" },
];

// Yup schema
const schema = yup.object().shape({
  title: yup.string().required("Title is required"),
  description: yup.string().required("Description is required"),
  status: yup.string().required("Status is required"),
  assignedTo: yup
  .number()
  .typeError("Assigned user must be a number")
  .required("Assigned user is required"),
  projectId: yup
  .number()
  .typeError("Project ID must be a number")
  .required("Project ID is required"),
  dueDate: yup
  .date()
  .typeError("Due date is required")
  .required("Due date is required"),
});

export default function KanbanBoard() {
  const dispatch = useDispatch();
  const { tasks } = useSelector((state) => state.task);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  
  const {showMessage} = useTheme();
  const token = localStorage.getItem("Token");
  const decoded = token ? jwtDecode(token) : {};
  const currentUserId = decoded.id;
  const isAdmin = decoded.isAdmin;

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      status: "TODO",
      projectId: "",
      assignedTo: "",
      dueDate: null, 
    },
  });
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const getAssignableUsers = () => {
  if (!selectedProjectId) return [];

  const project = projects.find((p) => p.id === selectedProjectId);
  if (!project) return [];

  // Always only allow members of the selected project
  return [
    ...(project.teamMembers || []),
    ...(project.ownerId
      ? users.filter((u) => u.id === project.ownerId)
      : []),
  ].filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i); // Remove duplicates
};



  const fetchUsers = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/users",
        {},
        { headers: { Token: token } }
      );
      setUsers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/v1/projects/projectsData"
      );
      let allProjects = response.data.data || [];
      console.log("kanban projctslist", allProjects);
    if (!isAdmin) {
  allProjects = allProjects.filter(
    (project) =>
      project.ownerId === currentUserId ||
      project.teamMembers?.some((m) =>
        typeof m === "object" ? m.id === currentUserId : m === currentUserId
      )
  );
}


      setProjects(allProjects);
      console.log("successof fetch prokect",allProjects)
    } catch (error) {
      console.error("Error fetching projects", error);
    }
  };

  useEffect(() => {
    dispatch(fetchtasks());
    fetchUsers();
    fetchProjects();
  }, [dispatch]);

  // const getVisibleTasks = () => {
  //   if (isAdmin) {
  //     return tasks.flatMap((project) => project.tasks || []);
  //   }
  //   return tasks
  //     .filter(
  //       (project) =>
  //         project.ownerId === currentUserId ||
  //         project.teamMembers?.some((m) => m.id === currentUserId)
  //     )
  //     .flatMap((project) => project.tasks || []);
  // };
  const getVisibleTasks = () => {
  let filteredProjects = isAdmin
    ? tasks
    : tasks.filter(
        (project) =>
          project.ownerId === currentUserId ||
          project.teamMembers?.some((m) => m.id === currentUserId)
      );

  return filteredProjects.flatMap((project) =>
    (project.tasks || []).map((task) => ({
      ...task,
      projectName: project.name // ✅ attach project name to each task
    }))
  );
};


  const visibleTasks = getVisibleTasks();

  // const handleDragEnd = async (event) => {
  //   const { active, over } = event;
  //   if (!over) return;

  //   const taskId = active.id;
  //   const newStatus = over.id;
  //   const draggedTask = visibleTasks.find(
  //     (task) => task.id === parseInt(taskId)
  //   );

  //   if (draggedTask && draggedTask.status !== newStatus) {
  //     const res = await dispatch(
  //       updateTaskStatus({ taskId, status: newStatus })
  //     );
  //     if (res.meta.requestStatus === "fulfilled") {
  //       // ✅ Immediately refresh tasks so UI updates without reload
  //       dispatch(fetchtasks());
  //     } else {
  //       showMessage("error","Failed to update task status");
  //     }
  //   }
  // };


 const handleDragEnd = async (event) => {
  const { active, over } = event;
  if (!over) return;

  const taskId = active.id;
  const newStatus = over.id;

  const draggedTask = visibleTasks.find(
    (task) => task.id === parseInt(taskId)
  );

  if (!draggedTask || draggedTask.status === newStatus) return;

  // ===== PERMISSION CHECK BEFORE API CALL =====
  const project = projects.find((p) => p.id === draggedTask.projectId);

  const isAllowed =
    isAdmin ||
    project?.ownerId === currentUserId ||
    project?.teamMembers?.some((m) => m.id === currentUserId);

  if (!isAllowed) {
    showMessage("error", "You don't have permission to update this task");
    return;
  }

  try {
    console.log(newStatus)
    const res = await dispatch(
      updateTaskStatus({ taskId, status: newStatus })
    );

    if (res.meta.requestStatus === "fulfilled") {
      dispatch(fetchtasks()); // ✅ refresh UI
    } else if (res.meta.requestStatus === "rejected") {
      // ✅ Show backend error if API rejects
      const backendError =
        res.payload?.message || // from rejectWithValue in thunk
        res.error?.message ||   // fallback error from thunk
        "Failed to update task status";

      showMessage("error", backendError);
    }
  } catch (err) {
    console.error("Status update error:", err);
    const backendError =
      err.response?.data?.message ||
      err.message ||
      "Something went wrong while updating task";
    showMessage("error", backendError);
  }
};



  const onSubmit = async (data) => {
    const allowedProjects = isAdmin
      ? projects
      : projects.filter(
          (p) =>
            p.ownerId === currentUserId ||
            p.teamMembers?.some((m) => m.id === currentUserId)
        );

    const isAllowedProject = allowedProjects.some(
      (p) => p.id === data.projectId
    );
    if (!isAllowedProject) {
      return showMessage("error",
        "You don't have permission to create a task in this project"
      );
    }

    if (!isAdmin) {
      const project = allowedProjects.find((p) => p.id === data.projectId);
      const isMember =
        project.teamMembers?.some((m) => m.id === data.assignedTo) ||
        project.ownerId === data.assignedTo;
      if (!isMember) {
        return showMessage("error",
          "You can only assign tasks to members of this project"
        );
      }
    }

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("status", data.status);
    formData.append("projectId", Number(data.projectId));
    formData.append("assignedTo", Number(data.assignedTo));
    formData.append(
      "dueDate",
      dayjs(data.dueDate).format("YYYY-MM-DD") // ✅ send formatted date
    );
    if (file) {
      formData.append("attachment", file);
    }

    try {
      const res = await dispatch(createtask(formData));
      if (res.meta.requestStatus === "fulfilled") {
        showMessage("success","Task created successfully!")
        setIsModalOpen(false);
        reset();
        setFile(null);
        dispatch(fetchtasks());
      } else {
        showMessage("error","Failed to create task")
      }
    } catch (err) {
      console.error("Create Task Error:", err);
      showMessage("error","Something went wrong")
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Kanban Board</h2>
        <Button type="primary" onClick={() => setIsModalOpen(true)}>
          + New Task
        </Button>
      </div>

      {/* Create Task Modal */}
      <Modal
        title="Create New Task"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          reset();
          setFile(null);
        }}
        footer={null}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <div>
            <label>Title</label>
            <Controller
              name="title"
              control={control}
              render={({ field }) => <Input {...field} />}
            />
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label>Description</label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => <Input.TextArea {...field} />}
            />
            {errors.description && (
              <p className="text-red-500 text-sm">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label>Status</label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <select {...field} className="w-full border p-2 rounded">
                  <option value="TODO">TODO</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="DONE">DONE</option>
                </select>
              )}
            />
            {errors.status && (
              <p className="text-red-500 text-sm">{errors.status.message}</p>
            )}
          </div>

          <div>
            <label>Project</label>
            <Controller
              name="projectId"
              control={control}
              render={({ field }) => {
                // Filter allowed projects for current user
                const allowedProjects = projects.filter(
                  (p) =>
                    p.ownerId === currentUserId ||
                    p.teamMembers?.some((m) => m.id === currentUserId)
                );

                return (
                  <Select
                    {...field}
                    placeholder="Choose a Project"
                    style={{ width: "100%" }}
                    onChange={(value) => {
                      field.onChange(Number(value));
                      setSelectedProjectId(Number(value)); // update for assignable users
                    }}
                    value={field.value}
                  >
                    {allowedProjects.map((project) => (
                      <Select.Option key={project.id} value={project.id}>
                        {project.name}
                      </Select.Option>
                    ))}
                  </Select>
                );
              }}
            />
            {errors.projectId && (
              <p className="text-red-500 text-sm">{errors.projectId.message}</p>
            )}
          </div>

          <div>
            <label>Assign To</label>
            <Controller
              name="assignedTo"
              control={control}
              render={({ field }) => (
               <Select
  {...field}
  placeholder="Choose a user"
  style={{ width: "100%" }}
  onChange={(value) => field.onChange(value)}
  value={field.value}
>
  {getAssignableUsers().map((user) => {
    const project = projects.find((p) => p.id === selectedProjectId);
    let roleLabel = "";

    if (project) {
      if (project.ownerId === user.id) {
        roleLabel = "Owner";
      } else {
        roleLabel = "Member";
      }

      // Append Admin if user is global admin
      if (user.isAdmin) {
        roleLabel += " - Admin";
      }
    }

    return (
      <Select.Option key={user.id} value={user.id}>
        {user.fullName} - {roleLabel}
      </Select.Option>
    );
  })}
</Select>

              )}
            />

            {errors.assignedTo && (
              <p className="text-red-500 text-sm">
                {errors.assignedTo.message}
              </p>
            )}
          </div>
          <div>
            <label>Due Date</label>
            <Controller
              name="dueDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  style={{ width: "100%" }}
                  format="YYYY-MM-DD"
                  onChange={(date) => field.onChange(date)}
                />
              )}
            />
            {errors.dueDate && (
              <p className="text-red-500 text-sm">{errors.dueDate.message}</p>
            )}
          </div>


          <div>
            <label>Attachment (optional)</label>
            <Input type="file" onChange={(e) => setFile(e.target.files[0])} />
          </div>

          <Button type="primary" htmlType="submit" className="mt-2">
            Create Task
          </Button>
        </form>
      </Modal>

      {/* Kanban Columns */}
      <div className="flex gap-8">
        <DndContext onDragEnd={handleDragEnd}>
          {COLUMN.map((column) => (
            <Column
              key={column.id}
              column={column}
              tasks={visibleTasks.filter((task) => task.status === column.id)}
              
            />
          ))}
        </DndContext>
      </div>
    </div>
  );
}
