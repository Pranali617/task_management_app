import React, { useState } from "react";
import TaskList from "../components/TaskList";
import TaskForm from "../components/TaskForm";

function Home() {
  const [refresh, setRefresh] = useState(false);

  return (
    <div>
      <h1>Task Collaboration Demo</h1>
      <TaskForm onCreated={() => setRefresh(!refresh)} />
      <TaskList key={refresh} />
    </div>
  );
}

export default Home;
