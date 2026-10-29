import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import { LANGUAGE } from "../../../utils";

const Profile = ({ user }) => {
  // console.log("user profile", user);
  const history = useHistory();
  const language = useSelector((state) => state.app.language);

  if (!user) {
    return (
      <div className="h-100 w-100 d-flex align-items-center justify-content-center bg-light text-muted small">
        <i className="fas fa-spinner fa-spin me-2"></i>
        {language === LANGUAGE.VI ? "Đang tải hồ sơ..." : "Loading profile..."}
      </div>
    );
  }

  // Handle avatar image safely (string, base64, buffer, etc.)
  let avatarUrl = "";
  if (user.image) {
    if (typeof user.image === "string") {
      avatarUrl = user.image;
    } else if (user.image.data) {
      try {
        avatarUrl = new TextDecoder("utf-8").decode(
          new Uint8Array(user.image.data)
        );
      } catch (e) {
        avatarUrl = "";
      }
    }
  }

  // Position / Role title safely
  let title = "";
  if (user.positionData) {
    title =
      language === LANGUAGE.VI
        ? user.positionData.valueVi
        : user.positionData.valueEn;
  } else if (user.roleData) {
    title =
      language === LANGUAGE.VI
        ? user.roleData.valueVi
        : user.roleData.valueEn;
  } else if (user.roleId === "R2") {
    title = language === LANGUAGE.VI ? "Bác sĩ" : "Doctor";
  }

  const fullName =
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    user.email ||
    "";

  return (
    <div className="h-100 w-100 d-flex align-items-center justify-content-center bg-light p-3">
      <div
        className="card text-center w-100 border-0 shadow-sm"
        style={{
          maxWidth: 360,
          margin: "0 auto",
          background: "#fff",
          borderRadius: "16px",
        }}
      >
        <div className="card-body d-flex flex-column align-items-center p-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="avatar"
              className="rounded-circle mb-3"
              style={{
                width: 110,
                height: 110,
                objectFit: "cover",
                border: "4px solid #e9ecef",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            />
          ) : (
            <div
              className="rounded-circle mb-3 d-flex align-items-center justify-content-center bg-light text-primary"
              style={{
                width: 110,
                height: 110,
                border: "4px solid #e9ecef",
                fontSize: "42px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              <i className="fas fa-user-md"></i>
            </div>
          )}

          <h5 className="text-uppercase text-primary mb-1 fw-bold">
            {fullName}
          </h5>

          {title && (
            <div className="badge bg-primary-subtle text-primary mb-2 px-3 py-2 fw-semibold">
              {title}
            </div>
          )}

          {user.email && (
            <div className="text-muted small mb-1">
              <i className="fas fa-envelope me-1 text-secondary"></i>
              {user.email}
            </div>
          )}

          {user.phoneNumber && (
            <div className="text-muted small mb-1">
              <i className="fas fa-phone me-1 text-secondary"></i>
              {user.phoneNumber}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
