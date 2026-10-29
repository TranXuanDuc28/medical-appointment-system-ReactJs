import React, { useState } from "react";
import { connect } from "react-redux";
import * as actions from "../../store/actions";
import { handlePatientChatLogin } from "../../services/userServices";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import FacebookLogin from "@greatsumini/react-facebook-login";
import { jwtDecode } from "jwt-decode"; // đúng với version mới
import "./LoginModal.scss";
import RegisterModal from "./RegisterModal"; // Thêm dòng này

const LoginModal = ({ onClose, onLoginSuccess, patientLoginSuccess }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [errMessage, setErrMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogin = async () => {
    setErrMessage("");
    setIsLoading(true);

    try {
      const data = await handlePatientChatLogin(
        formData.username,
        formData.password
      );

      if (data && data.errCode !== 0) {
        setErrMessage(data.errMessage);
      } else if (data && data.errCode === 0) {
        patientLoginSuccess(data.users);
        // this.props.patientLoginSuccess(data.users);
        onLoginSuccess();
        //console.log("Đăng nhập thành công!");
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setErrMessage(error.response.data.errMessage);
      } else {
        setErrMessage("Có lỗi xảy ra khi đăng nhập");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  // Xử lý đăng nhập Google thành công
  const handleGoogleSuccess = (credentialResponse) => {
    if (credentialResponse.credential) {
      try {
        const decoded = jwtDecode(credentialResponse.credential);
        const fullName = (decoded.name || decoded.given_name || "").trim();
        const nameParts = fullName.split(" ");
        const firstName =
          nameParts.length > 1
            ? nameParts.slice(0, -1).join(" ")
            : decoded.given_name || fullName;
        const lastName =
          decoded.family_name ||
          (nameParts.length > 1 ? nameParts[nameParts.length - 1] : "");

        patientLoginSuccess({
          id: decoded.sub ? decoded.sub.substring(0, 5) : Date.now().toString(),
          firstName: firstName,
          lastName: lastName,
          email: decoded.email,
          avatar: decoded.picture,
          isGoogle: true,
        });
        onLoginSuccess();
      } catch (err) {
        console.error("Decode Google Token Error:", err);
        setErrMessage("Đăng nhập Google thất bại!");
      }
    }
  };

  const handleFacebookResponse = (response) => {
    if (response && !response.error) {
      const fullName = (response.name || "").trim();
      const nameParts = fullName.split(" ");
      const firstName =
        nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : fullName;
      const lastName =
        nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

      patientLoginSuccess({
        id: response.id || Date.now().toString(),
        firstName: firstName,
        lastName: lastName,
        email: response.email || "",
        avatar: response.picture && response.picture.data ? response.picture.data.url : "",
        isFacebook: true,
      });
      onLoginSuccess();
    } else {
      setErrMessage("Đăng nhập Facebook thất bại");
    }
  };

  return (
    <>
      {!showRegister && (
        <div className="login-modal-overlay" onClick={onClose}>
          <div className="login-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Đăng nhập để tiếp tục</h3>
              <button className="close-btn" onClick={onClose}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Email</label>
                <input
                  className="form-control"
                  type="text"
                  placeholder="Nhập email của bạn..."
                  value={formData.username}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                  onKeyDown={handleKeyDown}
                />
              </div>

              <div className="form-group">
                <label>Mật khẩu</label>
                <div className="password-input">
                  <input
                    className="form-control"
                    type={isShowPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu..."
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    onKeyDown={handleKeyDown}
                  />
                  <span
                    className="password-toggle"
                    onClick={() => setIsShowPassword(!isShowPassword)}
                  >
                    <i
                      className={
                        isShowPassword ? "fas fa-eye" : "fas fa-eye-slash"
                      }
                    ></i>
                  </span>
                </div>
              </div>

              {errMessage && <div className="error-message">{errMessage}</div>}

              <button
                className="btn-login"
                onClick={handleLogin}
                disabled={isLoading || !formData.username || !formData.password}
              >
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>

              <div className="login-divider">
                <span>Hoặc đăng nhập bằng</span>
              </div>

              <div className="social-login-wrapper">
                <div className="google-btn-container">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setErrMessage("Đăng nhập Google thất bại")}
                    size="large"
                    shape="pill"
                    width="340"
                    text="signin_with"
                    logo_alignment="left"
                  />
                </div>

                <div className="facebook-btn-container">
                  <FacebookLogin
                    appId={
                      process.env.REACT_APP_FACEBOOK_APP_ID
                    }
                    autoLoad={false}
                    fields="name,email,picture"
                    onProfileSuccess={handleFacebookResponse}
                    onFail={(error) => {
                      console.log("Facebook Login Failed:", error);
                      setErrMessage("Đăng nhập Facebook thất bại");
                    }}
                    render={({ onClick }) => (
                      <button
                        type="button"
                        className="facebook-custom-btn"
                        onClick={onClick}
                      >
                        <span className="facebook-icon-wrapper">
                          <i className="fab fa-facebook-f"></i>
                        </span>
                        <span className="facebook-text">
                          Đăng nhập bằng Facebook
                        </span>
                      </button>
                    )}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <p>
                  Chưa có tài khoản?{" "}
                  <span
                    style={{ color: "#007bff", cursor: "pointer" }}
                    onClick={() => setShowRegister(true)}
                  >
                    Đăng ký ngay
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {showRegister && (
        <RegisterModal
          onClose={() => setShowRegister(false)}
          onRegisterSuccess={() => {
            setShowRegister(false);
            // Có thể tự động mở lại LoginModal hoặc thông báo đăng ký thành công
          }}
          onSwitchToLogin={() => setShowRegister(false)}
        />
      )}
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    lang: state.app.language,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    patientLoginSuccess: (patientInfo) =>
      dispatch(actions.patientLoginSuccess(patientInfo)),
    patientLoginFail: () => dispatch(actions.patientLoginFail()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginModal);
