import { useDraggable } from "@dnd-kit/core";
import { Card } from "antd";
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";

export default function TaskCard({ task }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  });

  const style = transform
    ? { transform: `translate(${transform.x}px,${transform.y}px)` }
    : undefined;

  // Timer based on backend fields
  const [liveSeconds, setLiveSeconds] = useState(task.elapsedTime || 0);

  useEffect(() => {
    let interval;

    if (task.status === "IN_PROGRESS" && task.startedAt) {
      interval = setInterval(() => {
        const started = new Date(task.startedAt);
        const now = new Date();
        const live = Math.floor((now - started) / 1000) + (task.elapsedTime || 0);
        setLiveSeconds(live);
      }, 1000);
    } else {
      setLiveSeconds(task.elapsedTime || 0);
    }

    return () => clearInterval(interval);
  }, [task.status, task.startedAt, task.elapsedTime]);

  const formatTime = (secs) => {
    const h = String(Math.floor(secs / 3600)).padStart(2, "0");
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab rounded-lg shadow-md hover:shadow-md"
    >
      <Card
        size="small"
        type="inner"
        title={task.title}
        extra={<Link to={String(task.id)}>View</Link>}
        className="bg-amber-400 p-4 rounded-md shadow-md text-black"
        style={{ minWidth: 290 }}
      >
        <div className="space-y-3">
          <div className="flex justify-between text-sm gap-4">
            <div className="flex flex-col">
              <h5 className="font-semibold text-black">Priority</h5>
              <p className="text-neutral-700">{task.priority || "Medium"}</p>
            </div>

            <div className="flex flex-col">
              <h5 className="font-semibold text-black">Time</h5>
              <p className="text-neutral-700">{formatTime(liveSeconds)}</p>
            </div>

            <div className="flex flex-col">
              <h5 className="font-semibold text-black">Assigned</h5>
              <p className="text-neutral-700">{task.User.fullName ||   task.assignedTo || "Unassigned"}</p>
            </div>
          </div>

          <div className="text-sm">
            <h5 className="font-semibold text-black">Description</h5>
            <p className="text-neutral-700 line-clamp-3">
              {task.description}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
