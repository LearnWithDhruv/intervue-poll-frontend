import React, { useState } from "react";
import stars from "../../assets/spark.svg";
import "./LoginPage.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

let apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const LoginPage = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const selectRole = (role) => {
    setSelectedRole(role);
    setError("");
  };

  const continueToPoll = async () => {
    if (!selectedRole) {
      setError("Please select a role.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      if (selectedRole === "teacher") {
        const response = await axios.post(`${apiUrl}/teacher-login`);
        if (response.data && response.data.username) {
          sessionStorage.setItem("username", response.data.username);
          navigate("/teacher-home-page");
        } else {
          throw new Error("Invalid response from server");
        }
      } else if (selectedRole === "student") {
        navigate("/student-home-page");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Failed to login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="poll-container text-center">
        <button className="btn btn-sm intervue-btn mb-5">
          <img src={stars} className="px-1" alt="" />
          Intervue Poll
        </button>
        <h3 className="poll-title">
          Welcome to the <b>Live Polling System</b>
        </h3>
        <p className="poll-description">
          Please select the role that best describes you to begin using the live
          polling system
        </p>

        {error && <div className="alert alert-danger mb-3">{error}</div>}

        <div className="d-flex justify-content-around mb-4">
          <div
            className={`role-btn ${selectedRole === "student" ? "active" : ""}`}
            onClick={() => selectRole("student")}
          >
            <p>I'm a Student</p>
            <span>
              Submit answers and view live poll results in real-time.
            </span>
          </div>
          <div
            className={`role-btn ${selectedRole === "teacher" ? "active" : ""}`}
            onClick={() => selectRole("teacher")}
          >
            <p>I'm a Teacher</p>
            <span>Create polls and view live results from students.</span>
          </div>
        </div>

        <button 
          className="btn continue-btn" 
          onClick={continueToPoll}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Loading...
            </>
          ) : (
            "Continue"
          )}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
