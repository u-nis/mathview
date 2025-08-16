"use client";
import MathEditor from "@/components/mathview/MathEditor";
import Editor from "../components/Editor/Editor";
import TopBar from "../components/TopBar/TopBar";
import { createContext } from "react";
import { useState } from "react";

export const UserContext = createContext({});

export default function Home() {
  const [user, setUser] = useState({ name: "Mohamed", age: 24 });
  return (
    <UserContext.Provider value={{ user, setUser }}>
      <div>
        <TopBar />
        <Editor />
      </div>
    </UserContext.Provider>
  );
}
