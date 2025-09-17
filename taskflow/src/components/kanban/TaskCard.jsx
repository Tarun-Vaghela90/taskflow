import { useDraggable } from "@dnd-kit/core";
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { PlayCircleOutlined, PauseCircleOutlined } from "@ant-design/icons";
import { useTheme } from "../../shared/hooks/ThemeContext";

export default function TaskCard({ task }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  const [liveSeconds, setLiveSeconds] = useState(task.elapsedTime || 0);
  const [startedAt, setStartedAt] = useState(task.startedAt || null);
  const [isRunning, setIsRunning] = useState(task.isRunning || false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { userId } = useTheme();

  // Check if logged in user is assigned
  const isAssignedUser =
    userId &&
    (task.User?.id?.toString() === userId.toString() ||
      task.assignedTo?.toString() === userId.toString());

  // Sync timer with backend on mount
  useEffect(() => {
    const fetchTimer = async () => {
      try {
        const token = localStorage.getItem("Token");
        const res = await axios.get(
          `http://localhost:3000/api/v1/tasks/task/${task.id}/timer`,
          { headers: { Token: token } }
        );

        const timerData = res.data?.data || {};
        setLiveSeconds(timerData.elapsedTime || 0);
        setIsRunning(timerData.isRunning || false);
        setStartedAt(timerData.startedAt || null);
      } catch (err) {
        console.warn("Could not sync timer state", err);
      }
    };

    fetchTimer();
  }, [task.id]);

  // Timer effect (local ticking)
  useEffect(() => {
    let interval;
    if (isRunning && startedAt) {
      interval = setInterval(() => {
        const started = new Date(startedAt);
        const now = new Date();
        const diff = Math.floor((now - started) / 1000);
        setLiveSeconds(diff + (task.elapsedTime || 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, startedAt, task.elapsedTime]);

  // Start/Stop Handler
  const handleTimerAction = async (action) => {
    setError("");
    const prevRunning = isRunning;
    const prevStartedAt = startedAt;

    try {
      setIsLoading(true);

      const token = localStorage.getItem("Token");

      // Prevent duplicate "start" if already running
      if (action === "start" && isRunning) {
        setError("Timer already running");
        return;
      }

      if (action === "start") {
        setStartedAt(new Date().toISOString());
        setIsRunning(true);
        setLiveSeconds(task.elapsedTime || 0);
      } else if (action === "stop") {
        setStartedAt(null);
        setIsRunning(false);
      }

      const res = await axios.post(
        `http://localhost:3000/api/v1/tasks/task/${task.id}/timer`,
        { action },
        { headers: { Token: token } }
      );

      const data = res.data?.data || {};
      setLiveSeconds(data.elapsedTime || 0);
      setIsRunning(data.isRunning || false);
      setStartedAt(data.startedAt || null);
    } catch (err) {
      console.error("Failed to toggle timer", err);
      const msg =
        err.response?.data?.message || `Could not ${action} timer`;
      setError(msg);
      // Rollback to previous state
      setIsRunning(prevRunning);
      setStartedAt(prevStartedAt);
    } finally {
      setIsLoading(false);
    }
  };

  // Format seconds into HH:MM:SS
  function formatTime(seconds) {
    if (!seconds || seconds < 0) seconds = 0;
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  }

  // Format date
  function formatDate(dateString) {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  // Status → background colors
  const statusColors = {
    TODO: "#d9d9d9", // Gray
    IN_PROGRESS: "#1890ff", // Blue
    DONE: "#52c41a", // Green
    BLOCKED: "#ff4d4f", // Red
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="cursor-default">
      <div className="bg-white text-black rounded-2xl shadow-md hover:shadow-lg p-5 w-[290px] border border-gray-100 transition-all duration-200 flex flex-col">
        
        {/* Drag Handle */}
        <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600 mb-2 self-start" title="Drag task">
          ⠿
        </div>

        {/* Title & View Link */}
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-lg font-semibold text-gray-900 leading-snug line-clamp-2">
            {task.title || "Untitled Task"}
          </h2>
          <Link
            to={String(task.id)}
            className="text-xs font-medium text-blue-500 hover:underline shrink-0"
          >
            View
          </Link>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm mb-4">
          {isAssignedUser && (
            <div className="text-gray-500">
              Time:
              <span className="text-gray-900 ml-1 font-semibold">
                {formatTime(liveSeconds)}
              </span>
            </div>
          )}
          <div className="text-gray-500">
            Assigned:
            <span className="text-gray-900 ml-1 font-medium truncate inline-block max-w-[110px] align-bottom">
              {task.User?.fullName ||
                task.assignedUser?.fullName ||
                task.assignedTo ||
                "Unassigned"}
            </span>
          </div>
          <div className="text-gray-500">
            Created:
            <span className="text-gray-900 ml-1">{formatDate(task.createdAt)}</span>
          </div>
          <div className="text-gray-500">
            Due:
            <span className="text-gray-900 ml-1">{formatDate(task.dueDate)}</span>
          </div>
          <div className="text-gray-500">
            Project:
            <span className="text-gray-900 ml-1">{task.projectName}</span>
          </div>
          <div className="col-span-2">
            <span
              style={{
                backgroundColor: statusColors[task.status] || "#f0f0f0",
                color: "#fff",
                padding: "4px 8px",
                borderRadius: "9999px",
                fontSize: "0.75rem",
                fontWeight: "600",
                display: "inline-block",
              }}
            >
              {task.status || "N/A"}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="flex-1">
          <p className="text-xs uppercase text-gray-400 mb-1">Description</p>
          <p className="text-gray-800 text-sm leading-snug line-clamp-3">
            {task.description || "No description"}
          </p>
        </div>

        {/* Timer Controls */}
        {isAssignedUser && (
          <div className="mt-4 flex justify-start items-center gap-2">
            {!isRunning ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleTimerAction("start");
                }}
                disabled={isLoading}
                className="px-3 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all"
              >
                <PlayCircleOutlined />
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleTimerAction("stop");
                }}
                disabled={isLoading}
                className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
              >
                <PauseCircleOutlined />
              </button>
            )}
          </div>
        )}

        {/* Error */}
        {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
      </div>
    </div>
  );
}
