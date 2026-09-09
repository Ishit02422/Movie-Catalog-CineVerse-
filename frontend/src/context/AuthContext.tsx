"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, LoginCredentials, RegisterCredentials, AuthResponse } from "../types/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  checkUser: (identifier: string, country_code?: string) => Promise<{ exists: boolean; data?: any }>;
  sendPhoneOtp: (
    identifier: string,
    mode?: "signin" | "register",
    country_code?: string
  ) => Promise<{
    success: boolean;
    type?: "phone" | "email";
    exists?: boolean;
    isNewUser?: boolean;
    user_name?: string;
    otp_preview?: string;
    dev_otp?: string;
    message: string;
  }>;
  verifyPhoneOtp: (
    identifier: string,
    otp: string,
    userDetails?: {
      name?: string;
      first_name?: string;
      surname?: string;
      gender?: "Male" | "Female" | "Other";
      mode?: "signin" | "register";
    }
  ) => Promise<void>;
  updateProfile: (data: {
    first_name?: string;
    surname?: string;
    gender?: "Male" | "Female" | "Other";
    phone?: string;
    email?: string;
  }) => Promise<void>;
  deleteAccount: () => Promise<void>;
  loginWithGoogle: (name?: string, email?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1"
    ? "https://movie-catalog-cineverse.onrender.com/api"
    : "http://localhost:5000/api");

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load user & token from sessionStorage on boot and validate session
  // sessionStorage automatically resets when the browser / tab is closed
  useEffect(() => {
    async function loadSession() {
      try {
        // Clear any old legacy permanent localStorage token
        localStorage.removeItem("cineverse_token");
        localStorage.removeItem("cineverse_user");

        const storedToken = sessionStorage.getItem("cineverse_token");
        const storedUser = sessionStorage.getItem("cineverse_user");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Validate token with backend
          try {
            const res = await fetch(`${API_BASE_URL}/auth/me`, {
              headers: { Authorization: `Bearer ${storedToken}` },
            });
            if (res.ok) {
              const data = await res.json();
              setUser(data.data);
              sessionStorage.setItem("cineverse_user", JSON.stringify(data.data));
            } else if (res.status === 401) {
              // Dead token/user -> clear it
              sessionStorage.removeItem("cineverse_token");
              sessionStorage.removeItem("cineverse_user");
              setToken(null);
              setUser(null);
            }
          } catch (e) {
            console.warn("Backend session validation offline:", e);
          }
        }
      } catch (err) {
        console.error("Failed to restore session from sessionStorage:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSession();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data: AuthResponse = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Invalid credentials. Please try again.");
    }

    setToken(data.token);
    setUser(data.data);
    sessionStorage.setItem("cineverse_token", data.token);
    sessionStorage.setItem("cineverse_user", JSON.stringify(data.data));
  };

  const register = async (credentials: RegisterCredentials): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data: AuthResponse = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Registration failed. Please try again.");
    }
  };

  const checkUser = async (
    identifier: string,
    country_code?: string
  ): Promise<{ exists: boolean; data?: any }> => {
    const res = await fetch(`${API_BASE_URL}/auth/check-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, country_code }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to check account existence.");
    }
    return data;
  };

  const sendPhoneOtp = async (
    identifier: string,
    mode?: "signin" | "register",
    country_code?: string
  ): Promise<{
    success: boolean;
    type?: "phone" | "email";
    exists?: boolean;
    isNewUser?: boolean;
    user_name?: string;
    otp_preview?: string;
    dev_otp?: string;
    message: string;
  }> => {
    const res = await fetch(`${API_BASE_URL}/auth/phone/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, mode, country_code }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to send verification code.");
    }

    return data;
  };

  const verifyPhoneOtp = async (
    identifier: string,
    otp: string,
    userDetails?: {
      name?: string;
      first_name?: string;
      surname?: string;
      gender?: "Male" | "Female" | "Other";
      mode?: "signin" | "register";
    }
  ): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/auth/phone/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier,
        otp,
        mode: userDetails?.mode,
        name: userDetails?.name,
        first_name: userDetails?.first_name,
        surname: userDetails?.surname,
        gender: userDetails?.gender,
      }),
    });

    const data: AuthResponse = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Invalid OTP code.");
    }

    setToken(data.token);
    setUser(data.data);
    sessionStorage.setItem("cineverse_token", data.token);
    sessionStorage.setItem("cineverse_user", JSON.stringify(data.data));
  };

  const updateProfile = async (data: {
    first_name?: string;
    surname?: string;
    gender?: "Male" | "Female" | "Other";
    phone?: string;
    email?: string;
  }): Promise<void> => {
    if (!token) {
      throw new Error("You must be logged in to update your profile.");
    }

    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const resData: AuthResponse = await res.json();

    if (!res.ok) {
      if (res.status === 401) {
        logout();
      }
      throw new Error(resData.message || "Failed to update profile.");
    }

    if (resData.token) {
      setToken(resData.token);
      sessionStorage.setItem("cineverse_token", resData.token);
    }

    setUser(resData.data);
    sessionStorage.setItem("cineverse_user", JSON.stringify(resData.data));
  };

  const deleteAccount = async (): Promise<void> => {
    if (!token) {
      throw new Error("You must be logged in to delete your account.");
    }

    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const resData = await res.json();

    if (!res.ok) {
      throw new Error(resData.message || "Failed to delete account.");
    }

    // Clean up local session and return to guest state
    logout();
  };

  const loginWithGoogle = async (): Promise<void> => {
    try {
      const { signInWithGooglePopup } = await import("../utils/firebase");
      const googleUser = await signInWithGooglePopup();

      const res = await fetch(`${API_BASE_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: googleUser.name,
          email: googleUser.email,
          photo_url: googleUser.photoURL,
        }),
      });

      const data: AuthResponse = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Google Sign-In failed.");
      }

      setToken(data.token);
      setUser(data.data);
      sessionStorage.setItem("cineverse_token", data.token);
      sessionStorage.setItem("cineverse_user", JSON.stringify(data.data));
    } catch (err: any) {
      if (err.code === "auth/popup-closed-by-user") {
        console.log("User closed Google login popup.");
        return;
      }
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem("cineverse_token");
    sessionStorage.removeItem("cineverse_user");
    localStorage.removeItem("cineverse_token");
    localStorage.removeItem("cineverse_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        checkUser,
        sendPhoneOtp,
        verifyPhoneOtp,
        updateProfile,
        deleteAccount,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
