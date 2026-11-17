import { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  KeyRound,
  ArrowLeft
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ReaperMascotLogo from "../../components/branding/ReaperMascotLogo";
import ObsidianBackground from "../../components/ObsidianBackground";

export default function AuthPage() {
  const {
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
    switchView
  } = useAuth();

  // Form states
  const [formData, setFormData] = useState({
    fullName: "",
    email: pendingEmail || "",
    password: "",
    confirmPassword: "",
    rememberMe: true,
    verificationCode: "",
    resetToken: "",
    newPassword: "",
    confirmNewPassword: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Active email fallback
  const activeEmail = formData.email || pendingEmail;

  // Resend countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    if (error) setError("");
  }

  // Handle Login submission
  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.email || !formData.password) {
      setError("Please provide both email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await login({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      });
      if (res.requires_verification) {
        setSuccess("Please enter the verification code sent to your email.");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  // Handle Signup submission
  async function handleSignup(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!formData.email.trim()) {
      setError("Please enter a valid work or personal email.");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await signup({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password
      });
      setSuccess(res.message || "Account created! Verification code sent.");
    } catch (err) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Handle Email Verification submission
  async function handleVerify(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const code = formData.verificationCode.trim();
    if (!code || code.length < 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyEmail({
        email: activeEmail,
        code
      });
      setSuccess(res.message || "Verification successful!");
    } catch (err) {
      setError(err.message || "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  }

  // Handle Resend Verification
  async function handleResend() {
    if (resendCooldown > 0) return;
    setError("");
    setSuccess("");
    try {
      const res = await resendVerification({ email: activeEmail });
      setSuccess(res.message || "A fresh code has been sent.");
      setResendCooldown(30);
    } catch (err) {
      setError(err.message || "Failed to resend code.");
    }
  }

  // Handle Forgot Password submission
  async function handleForgotPassword(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword({ email: formData.email });
      setSuccess(res.message || "Password reset token generated.");
    } catch (err) {
      setError(err.message || "Failed to process request.");
    } finally {
      setLoading(false);
    }
  }

  // Handle Reset Password submission
  async function handleResetPassword(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.resetToken.trim()) {
      setError("Please enter the password reset token.");
      return;
    }
    if (formData.newPassword.length < 8) {
      setError("New password must contain at least 8 characters.");
      return;
    }
    if (formData.newPassword !== formData.confirmNewPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword({
        email: activeEmail,
        token: formData.resetToken,
        newPassword: formData.newPassword
      });
      setSuccess(res.message || "Password reset successfully! Please sign in.");
      setTimeout(() => switchView("login"), 1500);
    } catch (err) {
      setError(err.message || "Password reset failed. Invalid or expired token.");
    } finally {
      setLoading(false);
    }
  }

  // Quick Demo Login helper
  async function handleQuickDemo() {
    setError("");
    setSuccess("Authenticating with demo engineer credentials...");
    setLoading(true);
    try {
      await quickDemoLogin();
    } catch (err) {
      setError(err.message || "Quick demo login failed.");
      setLoading(false);
    }
  }

  return (
    <div className="reaper-auth-page">
      <ObsidianBackground />

      {/* Main Center Auth Container */}
      <div className="auth-card-wrapper animate-fadeInUp">
        {/* Brand Header */}
        <div className="auth-brand-header">
          <div className="auth-mascot-container">
            <ReaperMascotLogo size={76} glow={true} float={true} />
          </div>
          <h1 className="auth-brand-title">REAPER</h1>
          <p className="auth-brand-subtitle">
            AUTONOMOUS SOFTWARE REPAIR ENGINE
          </p>

          {/* Honest Backend Engine Status */}
          <div className="auth-engine-status-pill">
            <span className={`status-dot ${backendOnline ? "online" : "standby"}`} />
            <span>
              {backendOnline
                ? "FastAPI Auth Engine Online (Port 8000)"
                : "WebCrypto SHA-256 Engine Active (Sandbox Standby)"}
            </span>
          </div>
        </div>

        {/* Auth Card Box */}
        <div className="reaper-auth-card">
          {/* Status Alert Banners */}
          {error && (
            <div className="auth-alert error-alert animate-fadeIn">
              <AlertTriangle size={18} className="alert-icon" />
              <div className="alert-content">
                <span>{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="auth-alert success-alert animate-fadeIn">
              <CheckCircle2 size={18} className="alert-icon" />
              <div className="alert-content">
                <span>{success}</span>
              </div>
            </div>
          )}

          {/* VIEW: LOGIN */}
          {authView === "login" && (
            <div className="auth-view-content">
              <div className="auth-view-header">
                <h2>Welcome Back</h2>
                <p>Sign in to launch autonomous software repair sessions.</p>
              </div>

              <form onSubmit={handleLogin} className="auth-form" noValidate>
                <div className="auth-field">
                  <label htmlFor="login-email">Email Address</label>
                  <div className="auth-input-wrapper">
                    <Mail size={16} className="input-prefix-icon" />
                    <input
                      id="login-email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="engineer@reaper.ai"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <div className="field-label-row">
                    <label htmlFor="login-password">Password</label>
                    <button
                      type="button"
                      className="text-link-button"
                      onClick={() => {
                        setError("");
                        setSuccess("");
                        switchView("forgot", { email: formData.email });
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="auth-input-wrapper">
                    <Lock size={16} className="input-prefix-icon" />
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="auth-options-row">
                  <label className="auth-checkbox-label">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                    />
                    <span>Remember this machine</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="auth-primary-btn emerald-glow-hover"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="btn-spinner-row">
                      <RefreshCw size={16} className="spinner" />
                      <span>Signing in...</span>
                    </span>
                  ) : (
                    <span className="btn-inner-row">
                      <span>Sign In to REAPER</span>
                      <ArrowRight size={16} />
                    </span>
                  )}
                </button>
              </form>

              {/* Quick Demo Login Option */}
              <div className="auth-quick-demo-divider">
                <span>or test immediately</span>
              </div>

              <button
                type="button"
                className="auth-demo-shortcut-btn"
                onClick={handleQuickDemo}
                disabled={loading}
                title="Log in with demo@reaper.ai / Password123!"
              >
                <Sparkles size={16} className="demo-icon" />
                <div className="demo-btn-text">
                  <strong>Quick Demo Login</strong>
                  <small>Instant access as Lead Engineer (demo@reaper.ai)</small>
                </div>
              </button>

              <div className="auth-switch-prompt">
                <span>Don't have an account?</span>{" "}
                <button
                  type="button"
                  className="text-link-button bold-link"
                  onClick={() => {
                    setError("");
                    setSuccess("");
                    switchView("signup");
                  }}
                >
                  Create one now
                </button>
              </div>
            </div>
          )}

          {/* VIEW: SIGNUP */}
          {authView === "signup" && (
            <div className="auth-view-content">
              <div className="auth-view-header">
                <h2>Create Your Account</h2>
                <p>Begin running autonomous code investigations with REAPER.</p>
              </div>

              <form onSubmit={handleSignup} className="auth-form" noValidate>
                <div className="auth-field">
                  <label htmlFor="signup-name">Full Name</label>
                  <div className="auth-input-wrapper">
                    <User size={16} className="input-prefix-icon" />
                    <input
                      id="signup-name"
                      name="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Jane Doe"
                      autoComplete="name"
                      required
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="signup-email">Work Email</label>
                  <div className="auth-input-wrapper">
                    <Mail size={16} className="input-prefix-icon" />
                    <input
                      id="signup-email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="engineer@company.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="signup-password">Password</label>
                  <div className="auth-input-wrapper">
                    <Lock size={16} className="input-prefix-icon" />
                    <input
                      id="signup-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min. 8 characters"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="signup-confirm-password">Confirm Password</label>
                  <div className="auth-input-wrapper">
                    <Lock size={16} className="input-prefix-icon" />
                    <input
                      id="signup-confirm-password"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter password"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-primary-btn emerald-glow-hover"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="btn-spinner-row">
                      <RefreshCw size={16} className="spinner" />
                      <span>Creating Account...</span>
                    </span>
                  ) : (
                    <span className="btn-inner-row">
                      <span>Create REAPER Account</span>
                      <ArrowRight size={16} />
                    </span>
                  )}
                </button>
              </form>

              <div className="auth-switch-prompt">
                <span>Already have an account?</span>{" "}
                <button
                  type="button"
                  className="text-link-button bold-link"
                  onClick={() => {
                    setError("");
                    setSuccess("");
                    switchView("login");
                  }}
                >
                  Sign In
                </button>
              </div>
            </div>
          )}

          {/* VIEW: EMAIL VERIFICATION */}
          {authView === "verify" && (
            <div className="auth-view-content">
              <div className="auth-view-header">
                <div className="view-badge-icon">
                  <ShieldCheck size={26} color="var(--accent-emerald)" />
                </div>
                <h2>Verify Your Email</h2>
                <p>
                  We have dispatched a 6-digit confirmation code to:
                  <strong className="target-email-highlight"> {formData.email || pendingEmail}</strong>
                </p>
              </div>

              {/* Demo Helper Badge if running standalone */}
              {demoCodeHint && (
                <div className="demo-code-banner">
                  <span className="demo-badge">DEVELOPER CODE</span>
                  <span>Use code <code>{demoCodeHint}</code> to verify instantly</span>
                </div>
              )}

              <form onSubmit={handleVerify} className="auth-form" noValidate>
                <div className="auth-field">
                  <label htmlFor="verify-code">6-Digit Verification Code</label>
                  <div className="auth-input-wrapper code-input-wrapper">
                    <KeyRound size={16} className="input-prefix-icon" />
                    <input
                      id="verify-code"
                      name="verificationCode"
                      type="text"
                      maxLength={6}
                      value={formData.verificationCode}
                      onChange={handleChange}
                      placeholder="123456"
                      className="segmented-code-input"
                      autoFocus
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-primary-btn emerald-glow-hover"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="btn-spinner-row">
                      <RefreshCw size={16} className="spinner" />
                      <span>Verifying Code...</span>
                    </span>
                  ) : (
                    <span className="btn-inner-row">
                      <span>Verify Email & Enter REAPER</span>
                      <ArrowRight size={16} />
                    </span>
                  )}
                </button>

                <div className="resend-row">
                  <span>Didn't receive the email?</span>{" "}
                  <button
                    type="button"
                    className="text-link-button"
                    onClick={handleResend}
                    disabled={resendCooldown > 0}
                  >
                    {resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : "Resend Code"}
                  </button>
                </div>
              </form>

              <div className="auth-switch-prompt">
                <button
                  type="button"
                  className="back-nav-link"
                  onClick={() => switchView("login")}
                >
                  <ArrowLeft size={14} />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </div>
          )}

          {/* VIEW: FORGOT PASSWORD */}
          {authView === "forgot" && (
            <div className="auth-view-content">
              <div className="auth-view-header">
                <h2>Reset Your Password</h2>
                <p>
                  Enter your email address to receive password recovery instructions.
                </p>
              </div>

              {demoResetHint && (
                <div className="demo-code-banner">
                  <span className="demo-badge">RESET TOKEN</span>
                  <span>Use token <code>{demoResetHint}</code> on the reset screen</span>
                </div>
              )}

              <form onSubmit={handleForgotPassword} className="auth-form" noValidate>
                <div className="auth-field">
                  <label htmlFor="forgot-email">Account Email</label>
                  <div className="auth-input-wrapper">
                    <Mail size={16} className="input-prefix-icon" />
                    <input
                      id="forgot-email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="engineer@reaper.ai"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-primary-btn emerald-glow-hover"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="btn-spinner-row">
                      <RefreshCw size={16} className="spinner" />
                      <span>Dispatching Link...</span>
                    </span>
                  ) : (
                    <span className="btn-inner-row">
                      <span>Send Recovery Token</span>
                      <ArrowRight size={16} />
                    </span>
                  )}
                </button>

                {demoResetHint && (
                  <button
                    type="button"
                    className="auth-secondary-btn"
                    onClick={() => {
                      setFormData((p) => ({ ...p, resetToken: demoResetHint }));
                      switchView("reset");
                    }}
                  >
                    <span>Proceed to Enter New Password</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </form>

              <div className="auth-switch-prompt">
                <button
                  type="button"
                  className="back-nav-link"
                  onClick={() => switchView("login")}
                >
                  <ArrowLeft size={14} />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </div>
          )}

          {/* VIEW: RESET PASSWORD */}
          {authView === "reset" && (
            <div className="auth-view-content">
              <div className="auth-view-header">
                <h2>Create New Password</h2>
                <p>Enter the reset token sent to your email along with your new password.</p>
              </div>

              <form onSubmit={handleResetPassword} className="auth-form" noValidate>
                <div className="auth-field">
                  <label htmlFor="reset-token">Reset Token</label>
                  <div className="auth-input-wrapper">
                    <KeyRound size={16} className="input-prefix-icon" />
                    <input
                      id="reset-token"
                      name="resetToken"
                      type="text"
                      value={formData.resetToken}
                      onChange={handleChange}
                      placeholder="e.g. rst-a1b2c3d4"
                      required
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="new-password">New Password</label>
                  <div className="auth-input-wrapper">
                    <Lock size={16} className="input-prefix-icon" />
                    <input
                      id="new-password"
                      name="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="Min. 8 characters"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="confirm-new-password">Confirm New Password</label>
                  <div className="auth-input-wrapper">
                    <Lock size={16} className="input-prefix-icon" />
                    <input
                      id="confirm-new-password"
                      name="confirmNewPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={formData.confirmNewPassword}
                      onChange={handleChange}
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-primary-btn emerald-glow-hover"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="btn-spinner-row">
                      <RefreshCw size={16} className="spinner" />
                      <span>Updating Password...</span>
                    </span>
                  ) : (
                    <span className="btn-inner-row">
                      <span>Update Password & Sign In</span>
                      <ArrowRight size={16} />
                    </span>
                  )}
                </button>
              </form>

              <div className="auth-switch-prompt">
                <button
                  type="button"
                  className="back-nav-link"
                  onClick={() => switchView("login")}
                >
                  <ArrowLeft size={14} />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="auth-card-footer">
          <span>Protected by REAPER Autonomous Security</span>
          <span className="footer-dot">•</span>
          <span style={{ color: "var(--accent-champagne)" }}>
            Built by CiPher (Archi Sharma & Parth Goyal) • Engineering autonomous software repair.
          </span>
        </div>
      </div>
    </div>
  );
}
