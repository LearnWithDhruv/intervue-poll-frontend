import React from "react";
import { Navigate } from "react-router-dom";

const StudentProtectedRoute = ({ children }) => {
  const username = sessionStorage.getItem("username");

  if (!username) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const TeacherProtectedRoute = ({ children }) => {
  const username = sessionStorage.getItem("username");

  if (!username || !username.startsWith("teacher")) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export { StudentProtectedRoute, TeacherProtectedRoute };
