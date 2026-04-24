import axios from "axios";
import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";

const STORAGE_TOKEN_KEY = "interntech_token";
const STORAGE_USER_KEY = "interntech_user";

const initialState = {
  user: null,
  token: null,
  loading: true
};

const AuthContext = createContext(null);

function authReducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        loading: false
      };
    case "UPDATE_USER":
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : action.payload,
        loading: false
      };
    case "RESTORE":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const persistAuth = (token, user) => {
    localStorage.setItem(STORAGE_TOKEN_KEY, token);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
  };

  const clearAuth = () => {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
  };

  const login = (token, user) => {
    persistAuth(token, user);
    dispatch({ type: "LOGIN", payload: { token, user } });
  };

  const logout = () => {
    clearAuth();
    dispatch({ type: "LOGOUT" });
  };

  const updateUser = (userPatch) => {
    const nextUser = state.user ? { ...state.user, ...userPatch } : userPatch;
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(nextUser));
    dispatch({ type: "UPDATE_USER", payload: userPatch });
  };

  const isAdmin = () => state.user?.role === "admin";
  const isCollege = () => state.user?.role === "college";
  const isCompany = () => state.user?.role === "company";

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const storedToken = localStorage.getItem(STORAGE_TOKEN_KEY);

        if (!storedToken) {
          if (isMounted) {
            dispatch({ type: "LOGOUT" });
          }
          return;
        }

        const response = await axios.get("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${storedToken}`
          },
          timeout: 15000
        });

        if (!isMounted) {
          return;
        }

        persistAuth(storedToken, response.data);
        dispatch({
          type: "RESTORE",
          payload: {
            token: storedToken,
            user: response.data
          }
        });
      } catch (_error) {
        clearAuth();
        if (isMounted) {
          dispatch({ type: "LOGOUT" });
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleForceLogout = () => {
      logout();
    };

    window.addEventListener("interntech:logout", handleForceLogout);
    return () => window.removeEventListener("interntech:logout", handleForceLogout);
  }, []);

  const value = useMemo(
    () => ({
      user: state.user,
      token: state.token,
      loading: state.loading,
      isAuthenticated: Boolean(state.token && state.user),
      login,
      logout,
      updateUser,
      isAdmin,
      isCollege,
      isCompany
    }),
    [state.loading, state.token, state.user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
