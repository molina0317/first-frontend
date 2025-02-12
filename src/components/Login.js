import React, { useState } from "react";
import { useForm } from "react-hook-form";

import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const { register,  formState: { errors } } = useForm();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/grid");
    } catch (error) {
      alert("Invalid credentials");
    }
  };

  const handleEmailChange = (e) => {
    if (e.target.value) {
      setEmail(e.target.value)
    }
  }

  const handlePasswordChange = (e) => {
    if (e.target.value) {
      setPassword(e.target.value)
    }
  }

  return (
    <div>
      <div className="col-md-12">
        <div className="card card-container">
          <img
            src="//ssl.gstatic.com/accounts/ui/avatar_2x.png"
            alt="profile-img"
            className="profile-img-card"
          />
          <form>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                onChange={event => handleEmailChange(event)}
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
              />
              {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className={`form-control ${errors.password ? "is-invalid" : ""}`}
                onChange={e => handlePasswordChange(e)}
              />
              {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
            </div>

            <div className="form-group">
              <button className="btn btn-primary btn-block" disabled={loading} onClick={handleSubmit}>
                {loading && <span className="spinner-border spinner-border-sm"></span>}
                <span>Login</span>
              </button>
            </div>
            
            {message && (
              <div className="form-group">
                <div className="alert alert-danger" role="alert">
                  {message}
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;