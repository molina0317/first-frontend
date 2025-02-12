import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import Login from "./components/Login";
import Register from "./components/Register";
import Grid from "./components/Grid";

function App() {
  return (
    <Router> {/* Ensure the entire app is wrapped inside BrowserRouter */}
        <nav className="navbar navbar-expand navbar-dark bg-dark">
          <div className="navbar-nav ml-auto">
            <li className="nav-item">
              <Link to="/login" className="nav-link">
                Login
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/register" className="nav-link">
                Sign Up
              </Link>
            </li>
          </div>
        </nav>
        <div>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/grid" element={<Grid />} />
            <Route path="*" element={<Login />} /> {/* Redirect unknown paths to Login */}
          </Routes>
        </div>
    </Router>
  );
}

export default App;
