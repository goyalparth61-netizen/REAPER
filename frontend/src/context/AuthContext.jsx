import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authView, setAuthView] = useState("login"); // "login" | "signup" | "verify" | "forgot" | "reset"
  const [pendingEmail, setPendingEmail] = useState("");
  const [demoCodeHint, setDemoCodeHint] = useState("");
  const [demoResetHint, setDemoResetHint] = useState("");
  const [backendOnline, setBackendOnline] = useState(false);

  // Initialize session and check backend
  useEffect(() => {
    let active = true;

    async function init() {
      try {
        const session = authService.getSession();
        if (session.isAuthenticated) {
          setUser(session.user);
          setToken(session.token);
          setIsAuthenticated(true);
        }
      } catch (e) {
        console.error("Auth init error:", e);
      }

      try {
        const online = await authService.checkBackendHealth();
        if (active) setBackendOnline(online);
      } catch {
        if (active) setBackendOnline(false);
      }

      if (active) setIsLoading(false);
    }

    init();

    // Periodic backend health ping
    const interval = setInterval(async () => {
      try {
        const online = await authService.checkBackendHealth();
        if (active) setBackendOnline(online);
      } catch {
        if (active) setBackendOnline(false);
      }
    }, 10000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  async function login({ email, password, rememberMe }) {
    const result = await authService.login({ email, password, rememberMe });
    if (result.requires_verification) {
      setPendingEmail(result.email || email);
      if (result.demo_verification_code) {
        setDemoCodeHint(result.demo_verification_code);
      }
      setAuthView("verify");
      return result;
    }

    if (result.success && result.user) {
      setUser(result.user);
      setToken(result.token);
      setIsAuthenticated(true);
      setAuthView("login");
    }
    return result;
  }

  async function signup({ fullName, email, password }) {
    const result = await authService.signup({ fullName, email, password });
    if (result.requires_verification) {
      setPendingEmail(result.email || email);
      if (result.demo_verification_code) {
        setDemoCodeHint(result.demo_verification_code);
      }
      setAuthView("verify");
    }
    return result;
  }

  async function verifyEmail({ email, code }) {
    const targetEmail = email || pendingEmail;
    const result = await authService.verifyEmail({ email: targetEmail, code });
    if (result.success && result.user) {
      setUser(result.user);
      setToken(result.token);
      setIsAuthenticated(true);
      setDemoCodeHint("");
    }
    return result;
  }

  async function resendVerification({ email }) {
    const targetEmail = email || pendingEmail;
    const result = await authService.resendVerification({ email: targetEmail });
    if (result.demo_verification_code) {
      setDemoCodeHint(result.demo_verification_code);
    }
    return result;
  }

  async function forgotPassword({ email }) {
    const result = await authService.forgotPassword({ email });
    setPendingEmail(email);
    if (result.demo_reset_token) {
      setDemoResetHint(result.demo_reset_token);
    }
    return result;
  }

  async function resetPassword({ email, token: resetTok, newPassword }) {
    const targetEmail = email || pendingEmail;
    const result = await authService.resetPassword({
      email: targetEmail,
      token: resetTok,
      newPassword
    });
    if (result.success) {
      setDemoResetHint("");
      setAuthView("login");
    }
    return result;
  }

  async function quickDemoLogin() {
    return await login({
      email: "demo@reaper.ai",
      password: "Password123!",
      rememberMe: true
    });
  }

  async function logout() {
    await authService.logout();
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setAuthView("login");
  }

  function switchView(view, extra = {}) {
    if (extra.email) setPendingEmail(extra.email);
    setAuthView(view);
  }

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    authView,
    pendingEmail,
    demoCodeHint,
    demoResetHint,
    backendOnline,
    login,
    signup,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    quickDemoLogin,
    logout,
    switchView,
    setPendingEmail
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
