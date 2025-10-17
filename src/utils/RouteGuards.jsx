import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { getDashboardPath } from "./roleRedirect";

const API_URL = 'https://user-service-o0l2.onrender.com/api/user';

export const RequireAuth = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login', { replace: true, state: { from: location.pathname } });
      return;
    }
    axios
      .get(`${API_URL}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const user = res.data;
        if (user?.active === false) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          navigate('/login', { replace: true });
          return;
        }
        setChecking(false);
      })
      .catch(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
      });
  }, [navigate, location.pathname]);

  if (checking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F10100]"></div>
      </div>
    );
  }

  return children;
};

export const RequireRole = ({ roles = [], children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login', { replace: true, state: { from: location.pathname } });
      return;
    }
    axios
      .get(`${API_URL}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const user = res.data;
        if (user?.active === false) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          navigate('/login', { replace: true });
          return;
        }
        if (!roles.includes(user?.role)) {
          navigate(getDashboardPath(user?.role), { replace: true });
          return;
        }
        setChecking(false);
      })
      .catch(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
      });
  }, [navigate, location.pathname, roles]);

  if (checking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F10100]"></div>
      </div>
    );
  }

  return children;
};



