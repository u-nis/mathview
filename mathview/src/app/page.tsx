"use client";
import TopBar from "../components/TopBar/TopBar";
import Workspace from "../components/Workspace/Workspace";

export default function Home() {
  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <TopBar />
      <Workspace />
    </div>
  );
}
