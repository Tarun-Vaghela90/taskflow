import React from "react";
import TaskCard from "./TaskCard";
import { useDroppable } from "@dnd-kit/core";

export default function Column({ column, tasks }) {

    const {setNodeRef} = useDroppable({
        id:column.id,

    })

  return (
    <div className="flex w-80 flex-col rounded-lg bg-neutral-800 p-4">
      <h2 className="mb-4 font-semibold text-neutral-100">{column.title}</h2>

      <div className='flex flex-1 flex-col gap-4' ref={setNodeRef} >
        {
        tasks.map(task => (
  <TaskCard key={task.id} task={task} />
))
        }
      </div>
    </div>
  );
}

// const extra = (<div flex flex-1 flex-col gap-4>
//         {tasks.map((task) => (
//           <TaskCard key={task.id} id={task.id} title={task.title} />
//         ))}

//     </div>)
