import React, { useEffect, useState } from "react";
import api from "../api/api";

function TaskList() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const res = await api.get("/task/tasks/");
      setTasks(res.data);
    };
    fetchTasks();
  }, []);

  return (
    <div>
      <h2>Tasks</h2>
      {tasks.map(task => (
        <div key={task.uid} style={{border:"1px solid gray", padding:"10px", margin:"5px"}}>
          <h3>{task.title}</h3>
          <p>{task.description}</p>
          <p>Status: {task.status} | Priority: {task.priority}</p>
          <p>Assigned to: {task.assigned_to || "Unassigned"}</p>
        </div>
      ))}
    </div>
  );
}

export default TaskList;
