import React from "react";
import { Navigate } from "react-router-dom";

const TeacherProtectedRoute = ({ children }) => {
  const username = sessionStorage.getItem("username");
  
  // Check if username exists and starts with "teacher_"
  if (!username || !username.startsWith("teacher_")) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default TeacherProtectedRoute;
