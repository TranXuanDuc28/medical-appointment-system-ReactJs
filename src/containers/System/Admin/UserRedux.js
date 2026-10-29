import React, { Component } from "react";
import { FormattedMessage } from "react-intl";
import { connect } from "react-redux";
import { LANGUAGE, CRUD_ACTION, CommonUtils } from "../../../utils";
import * as actions from "../../../store/actions";
import "./UserRedux.scss";
import "./TableManageUser.scss";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
import TableManageUser from "./TableManageUser";
import { toast } from "react-toastify";
class UserRedux extends Component {
  constructor(props) {
    super(props);
    this.state = {
      genderArr: [],
      roleArr: [],
      positionArr: [],
      previewImageUrl: "",
      isOpen: false,
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      address: "",
      gender: "",
      position: "",
      role: "",
      avatar: "",
      userIdEdit: "",
      action: CRUD_ACTION.CREATE,
    };
  }

  async componentDidMount() {
    this.props.getGenderStart();
    this.props.getRoleStart();
    this.props.getPositionStart();
  }
  handleChangeInput = (event, id) => {
    let coppyState = { ...this.state };
    coppyState[id] = event.target.value;
    if (id === "role") {
      if (event.target.value !== "R2") {
        coppyState.position = "";
      } else if (!coppyState.position) {
        coppyState.position = "P0";
      }
    }
    this.setState({
      ...coppyState,
    });
  };
  checkValidateInput = () => {
    let isVi = this.props.language === LANGUAGE.VI;
    let {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      address,
      gender,
      role,
      action,
    } = this.state;

    if (!email || !email.trim()) {
      toast.error(isVi ? "Vui lòng nhập Email!" : "Please enter Email!");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error(
        isVi
          ? "Email không hợp lệ (Ví dụ: user@example.com)!"
          : "Invalid email format (e.g. user@example.com)!"
      );
      return false;
    }

    if (action === CRUD_ACTION.CREATE) {
      if (!password || !password.trim()) {
        toast.error(isVi ? "Vui lòng nhập Mật khẩu!" : "Please enter Password!");
        return false;
      }
      if (password.trim().length < 6) {
        toast.error(
          isVi
            ? "Mật khẩu phải có tối thiểu 6 ký tự!"
            : "Password must be at least 6 characters!"
        );
        return false;
      }
    }

    if (!firstName || !firstName.trim()) {
      toast.error(isVi ? "Vui lòng nhập Họ!" : "Please enter Last name!");
      return false;
    }

    if (!lastName || !lastName.trim()) {
      toast.error(isVi ? "Vui lòng nhập Tên!" : "Please enter First name!");
      return false;
    }

    if (!phoneNumber || !String(phoneNumber).trim()) {
      toast.error(
        isVi ? "Vui lòng nhập Số điện thoại!" : "Please enter Phone number!"
      );
      return false;
    }

    const phoneRegex = /^[0-9+() -]{8,15}$/;
    if (!phoneRegex.test(String(phoneNumber).trim())) {
      toast.error(
        isVi
          ? "Số điện thoại không hợp lệ (phải từ 8 - 15 chữ số)!"
          : "Invalid phone number (must be 8 - 15 digits)!"
      );
      return false;
    }

    if (!address || !address.trim()) {
      toast.error(isVi ? "Vui lòng nhập Địa chỉ!" : "Please enter Address!");
      return false;
    }

    if (!gender) {
      toast.error(isVi ? "Vui lòng chọn Giới tính!" : "Please select Gender!");
      return false;
    }

    if (!role) {
      toast.error(isVi ? "Vui lòng chọn Vai trò!" : "Please select Role!");
      return false;
    }

    return true;
  };
  handleSaveUser = () => {
    let isValid = this.checkValidateInput();
    if (!isValid) return;

    if (this.state.action === CRUD_ACTION.CREATE) {
      this.props.createNewUser({
        email: this.state.email.trim(),
        password: this.state.password.trim(),
        firstName: this.state.firstName.trim(),
        lastName: this.state.lastName.trim(),
        phoneNumber: String(this.state.phoneNumber).trim(),
        address: this.state.address.trim(),
        gender: this.state.gender,
        positionId: this.state.role === "R2" ? this.state.position : null,
        roleId: this.state.role,
        avatar: this.state.avatar,
      });
    }
    if (this.state.action === CRUD_ACTION.UPDATE) {
      this.props.editUser({
        id: this.state.userIdEdit,
        email: this.state.email.trim(),
        password: this.state.password,
        firstName: this.state.firstName.trim(),
        lastName: this.state.lastName.trim(),
        phoneNumber: String(this.state.phoneNumber).trim(),
        address: this.state.address.trim(),
        gender: this.state.gender,
        positionId: this.state.role === "R2" ? this.state.position : null,
        roleId: this.state.role,
        avatar: this.state.avatar,
      });
    }
  };
  handleChangeInputImage = async (event) => {
    let data = event.target.files;
    let file = data[0];
    if (file) {
      let base64 = await CommonUtils.getBase64(file);
      let objectUrl = URL.createObjectURL(file);

      this.setState({
        previewImageUrl: objectUrl,
        avatar: base64,
      });
    }
  };
  openPreviewImage = () => {
    if (!this.state.previewImageUrl) return;
    this.setState({
      isOpen: true,
    });
  };
  handleEditUsersFromParent = (user) => {
    let imageBase64 = "";
    if (user.image) {
      if (typeof user.image === "string") {
        imageBase64 = user.image;
      } else if (user.image.data) {
        try {
          imageBase64 = new TextDecoder("utf-8").decode(
            new Uint8Array(user.image.data)
          );
        } catch (e) {
          console.error("Error decoding user image:", e);
        }
      }
    }
    let positionVal = user.roleId === "R2" ? user.positionId || "" : "";
    this.setState({
      email: user.email,
      password: "HARDCODE",
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      address: user.address,
      gender: user.gender,
      position: positionVal,
      role: user.roleId,
      userIdEdit: user.id,
      previewImageUrl: imageBase64,
      avatar: imageBase64,
      action: CRUD_ACTION.UPDATE,
    });
  };
  handleCancelEdit = () => {
    let arrGenders = this.props.genderRedux;
    let arrRoles = this.props.roleRedux;
    this.setState({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      address: "",
      gender: arrGenders && arrGenders.length > 0 ? arrGenders[0].keyMap : "",
      role: arrRoles && arrRoles.length > 0 ? arrRoles[0].keyMap : "",
      position: "",
      avatar: "",
      action: CRUD_ACTION.CREATE,
      previewImageUrl: "",
    });
  };
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.genderRedux !== this.props.genderRedux) {
      let arrGenders = this.props.genderRedux;
      this.setState({
        genderArr: arrGenders,
        gender: arrGenders && arrGenders.length > 0 ? arrGenders[0].keyMap : "",
      });
    }
    if (prevProps.roleRedux !== this.props.roleRedux) {
      let arrRoles = this.props.roleRedux;
      this.setState({
        roleArr: arrRoles,
        role: arrRoles && arrRoles.length > 0 ? arrRoles[0].keyMap : "",
      });
    }
    if (prevProps.positionRedux !== this.props.positionRedux) {
      let arrPositions = this.props.positionRedux;
      this.setState({
        positionArr: arrPositions,
      });
    }
    if (prevProps.listUserRedux !== this.props.listUserRedux) {
      let arrGenders = this.props.genderRedux;
      let arrRoles = this.props.roleRedux;
      this.setState({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        address: "",
        gender: arrGenders && arrGenders.length > 0 ? arrGenders[0].keyMap : "",
        role: arrRoles && arrRoles.length > 0 ? arrRoles[0].keyMap : "",
        position: "",
        avatar: "",
        action: CRUD_ACTION.CREATE,
        previewImageUrl: "",
      });
    }
  }

  render() {
    let isGenderLoading = this.props.isLoading;
    let genders = this.state.genderArr;
    let roles = this.state.roleArr;
    let positions = this.state.positionArr;
    let language = this.props.language;
    let {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      address,
      gender,
      position,
      role,
    } = this.state;
    // console.log("check", isGenderLoading)
    // console.log("roles",roles)
    // console.log(this.state.previewImageUrl)
    return (
      <div className="container py-4">
        <div className="title text-center my-4 fw-bold text-primary" style={{ fontSize: "24px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          <FormattedMessage id="manage-user.title" />
        </div>
        <div className="col-12">
          {isGenderLoading === true ? (
            <div className="text-center my-5 py-5 text-muted">
              <div className="spinner-border text-primary me-2" role="status"></div>
              <span>
                <FormattedMessage id="manage-user.loading" />
              </span>
            </div>
          ) : (
            <React.Fragment>
              <div className="card border-0 shadow-sm rounded-3 p-4 mb-4 bg-white">
                <div className="row g-3">
                <div className="col-md-3">
                  <label htmlFor="inputEmail" className="form-label">
                    <FormattedMessage id="manage-user.email" />
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="inputEmail"
                    value={email}
                    onChange={(event) => this.handleChangeInput(event, "email")}
                    disabled={
                      this.state.action === CRUD_ACTION.UPDATE ? true : false
                    }
                  />
                </div>
                <div className="col-md-3">
                  <label htmlFor="inputPassword" className="form-label">
                    <FormattedMessage id="manage-user.password" />
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="inputPassword"
                    value={password}
                    onChange={(event) =>
                      this.handleChangeInput(event, "password")
                    }
                    disabled={
                      this.state.action === CRUD_ACTION.UPDATE ? true : false
                    }
                  />
                </div>
                <div className="col-md-3">
                  <label htmlFor="inputPhone" className="form-label">
                    <FormattedMessage id="manage-user.phone-number" />
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="inputPhone"
                    value={phoneNumber}
                    onChange={(event) =>
                      this.handleChangeInput(event, "phoneNumber")
                    }
                  />
                </div>
              <div className="col-md-3">
                <label htmlFor="inputLastName" className="form-label">
                  <FormattedMessage id="manage-user.last-name" />
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="inputLastName"
                  value={firstName}
                  onChange={(event) =>
                    this.handleChangeInput(event, "firstName")
                  }
                />
              </div>
              <div className="col-md-3">
                <label htmlFor="inputFirstName" className="form-label">
                  <FormattedMessage id="manage-user.first-name" />
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="inputFirstName"
                  value={lastName}
                  onChange={(event) =>
                    this.handleChangeInput(event, "lastName")
                  }
                />
              </div>

              <div className="col-md-3">
                <label htmlFor="inputAddress" className="form-label">
                  <FormattedMessage id="manage-user.address" />
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="inputAddress"
                  placeholder={
                    language === LANGUAGE.VI
                      ? "123 Đường ABC..."
                      : "123 Main St..."
                  }
                  value={address}
                  onChange={(event) => this.handleChangeInput(event, "address")}
                />
              </div>
              <div className="col-md-3">
                <label htmlFor="inputGender" className="form-label">
                  <FormattedMessage id="manage-user.gender" />
                </label>
                <select
                  id="inputGender"
                  className="form-select"
                  value={gender}
                  onChange={(event) => this.handleChangeInput(event, "gender")}
                >
                  {genders &&
                    genders.length > 0 &&
                    genders.map((item, index) => {
                      return (
                        <option key={index} value={item.keyMap}>
                          {language === LANGUAGE.VI
                            ? item.valueVi
                            : item.valueEn}
                        </option>
                      );
                    })}
                </select>
              </div>
              <div className="col-md-3">
                <label htmlFor="inputPosition" className="form-label">
                  <FormattedMessage id="manage-user.position" />
                </label>
                <select
                  id="inputPosition"
                  className="form-select"
                  value={role === "R2" ? position : ""}
                  onChange={(event) =>
                    this.handleChangeInput(event, "position")
                  }
                  disabled={role !== "R2"}
                >
                  <option value="">
                    {language === LANGUAGE.VI
                      ? "— Không có chức danh —"
                      : "— No position —"}
                  </option>
                  {positions &&
                    positions.length > 0 &&
                    positions.map((item, index) => {
                      return (
                        <option key={index} value={item.keyMap}>
                          {language === LANGUAGE.VI
                            ? item.valueVi
                            : item.valueEn}
                        </option>
                      );
                    })}
                </select>
                {role !== "R2" && (
                  <small className="text-muted" style={{ fontSize: "11px" }}>
                    <FormattedMessage id="manage-user.only-doctor-position" />
                  </small>
                )}
              </div>

              <div className="col-md-3">
                <label htmlFor="inputRole" className="form-label">
                  <FormattedMessage id="manage-user.role" />
                </label>
                <select
                  id="inputRole"
                  className="form-select"
                  value={role}
                  onChange={(event) => this.handleChangeInput(event, "role")}
                >
                  {roles &&
                    roles.length > 0 &&
                    roles.map((item, index) => {
                      return (
                        <option key={index} value={item.keyMap}>
                          {language === LANGUAGE.VI
                            ? item.valueVi
                            : item.valueEn}
                        </option>
                      );
                    })}
                </select>
              </div>
              <div className="col-12 mt-2">
                <div className="preview-img-container">
                  <label className="form-label fw-bold d-block mb-2">
                    <i className="fas fa-camera me-2 text-primary"></i>
                    <FormattedMessage id="manage-user.image" />
                  </label>
                  <div className="avatar-upload-wrapper d-flex align-items-center gap-3">
                    <div
                      className="avatar-preview-box"
                      onClick={() => {
                        if (this.state.previewImageUrl) {
                          this.openPreviewImage();
                        } else {
                          document.getElementById("chooseImage")?.click();
                        }
                      }}
                      title={
                        this.state.previewImageUrl
                          ? (language === LANGUAGE.VI
                            ? "Bấm để xem ảnh phóng to"
                            : "Click to enlarge photo")
                          : (language === LANGUAGE.VI
                            ? "Bấm để chọn ảnh"
                            : "Click to choose photo")
                      }
                    >
                      {this.state.previewImageUrl ? (
                        <div
                          className="avatar-preview-img"
                          style={{
                            backgroundImage: `url(${this.state.previewImageUrl})`,
                          }}
                        >
                          <div className="avatar-preview-overlay">
                            <i className="fas fa-search-plus"></i>
                          </div>
                        </div>
                      ) : (
                        <div className="avatar-placeholder">
                          <i className="fas fa-user-circle"></i>
                          <span>
                            <FormattedMessage id="manage-user.no-image" />
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="avatar-actions">
                      <label
                        htmlFor="chooseImage"
                        className="btn btn-outline-primary btn-sm px-3 mb-1"
                        style={{ cursor: "pointer" }}
                      >
                        <i className="fas fa-upload me-2"></i>
                        {this.state.previewImageUrl ? (
                          <FormattedMessage id="manage-user.change-image" />
                        ) : (
                          <FormattedMessage id="manage-user.upload-image" />
                        )}
                      </label>
                      <input
                        type="file"
                        id="chooseImage"
                        hidden
                        accept="image/*"
                        onChange={(event) => this.handleChangeInputImage(event)}
                      />
                      <div className="text-muted small">
                        <FormattedMessage id="manage-user.image-note" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 mt-3 d-flex gap-2">
                <button
                  className={
                    this.state.action === CRUD_ACTION.UPDATE
                      ? "btn btn-warning px-4 fw-bold"
                      : "btn btn-primary px-4 fw-bold"
                  }
                  onClick={() => {
                    this.handleSaveUser();
                  }}
                >
                  <i
                    className={
                      this.state.action === CRUD_ACTION.UPDATE
                        ? "fas fa-edit me-2"
                        : "fas fa-plus me-2"
                    }
                  ></i>
                  {this.state.action === CRUD_ACTION.UPDATE ? (
                    <FormattedMessage id="manage-user.edit" />
                  ) : (
                    <FormattedMessage id="manage-user.save" />
                  )}
                </button>
                {this.state.action === CRUD_ACTION.UPDATE && (
                  <button
                    className="btn btn-secondary px-3"
                    onClick={() => this.handleCancelEdit()}
                  >
                    <i className="fas fa-times me-2"></i>
                    <FormattedMessage id="manage-user.cancel-edit" />
                  </button>
                )}
                </div>
              </div>
            </div>
            <div className="col-12 mb-5">
              <TableManageUser
                handleEditUsersFromParentKey={this.handleEditUsersFromParent}
              />
            </div>
          </React.Fragment>
        )}
      </div>

        {this.state.isOpen === true && (
          <Lightbox
            mainSrc={this.state.previewImageUrl}
            onCloseRequest={() =>
              this.setState({
                isOpen: false,
              })
            }
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    language: state.app.language,
    genderRedux: state.admin.genders,
    roleRedux: state.admin.roles,
    positionRedux: state.admin.positions,
    isLoading: state.admin.isLoading,
    listUserRedux: state.admin.listUser,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getGenderStart: () => dispatch(actions.fetchGenderStart()),
    getRoleStart: () => dispatch(actions.fetchRoleStart()),
    getPositionStart: () => dispatch(actions.fetchPositionStart()),
    createNewUser: (data) => dispatch(actions.createNewUser(data)),
    editUser: (data) => dispatch(actions.editUser(data)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserRedux);
