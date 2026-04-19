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
    this.setState({
      ...coppyState,
    });
  };
  handleSaveUser = () => {
    // console.log(this.state.action)
    if (this.state.action === CRUD_ACTION.CREATE) {
      this.props.createNewUser({
        email: this.state.email,
        password: this.state.password,
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        phoneNumber: this.state.phoneNumber,
        address: this.state.address,
        gender: this.state.gender,
        positionId: this.state.position,
        roleId: this.state.role,
        avatar: this.state.avatar,
      });
    }
    if (this.state.action === CRUD_ACTION.UPDATE) {
      this.props.editUser({
        id: this.state.userIdEdit,
        email: this.state.email,
        password: this.state.password,
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        phoneNumber: this.state.phoneNumber,
        address: this.state.address,
        gender: this.state.gender,
        positionId: this.state.position,
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
    console.log("user", user);
    let imageBase64 = "";
    if (user.image) {
      imageBase64 = new Buffer(user.image, "base64").toString("binary");
    }
    this.setState({
      email: user.email,
      password: "HARDCODE",
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      address: user.address,
      gender: user.gender,
      position: user.positionId,
      role: user.roleId,
      userIdEdit: user.id,
      previewImageUrl: imageBase64,
      action: CRUD_ACTION.UPDATE,
    });
  };
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.genderRedux !== this.props.genderRedux) {
      // console.log("2",this.props.genderRedux)
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
      // console.log("arrPositions",arrPositions)
      this.setState({
        positionArr: arrPositions,
        position:
          arrPositions && arrPositions.length > 0 ? arrPositions[0].keyMap : "",
      });
    }
    if (prevProps.listUserRedux !== this.props.listUserRedux) {
      // console.log("2",this.props.genderRedux)
      let arrGenders = this.props.genderRedux;
      let arrRoles = this.props.roleRedux;
      let arrPositions = this.props.positionRedux;
      this.setState({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        address: "",
        gender: arrGenders && arrGenders.length > 0 ? arrGenders[0].keyMap : "",
        role: arrRoles && arrRoles.length > 0 ? arrRoles[0].keyMap : "",
        position:
          arrPositions && arrPositions.length > 0 ? arrPositions[0].keyMap : "",
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
      <div className="container">
        <div className="title text-center mt-5">
          <FormattedMessage id="manage-user.title" />{" "}
        </div>
        <div className="col-12 ">
          {" "}
          {isGenderLoading === true ? (
            <div className="text-center mt-5">Loading...</div>
          ) : (
            <div className="container d-flex flex-wrap p-2" style={{ gap: 15 }}>
              <div className="col-md-3">
                <label for="inputEmail4" className="form-label">
                  {" "}
                  <FormattedMessage id="manage-user.email" />{" "}
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="inputEmail4"
                  value={email}
                  onChange={(event) => this.handleChangeInput(event, "email")}
                  disabled={
                    this.state.action === CRUD_ACTION.UPDATE ? true : false
                  }
                />
              </div>
              <div className="col-md-3">
                <label for="inputPassword4" className="form-label">
                  {" "}
                  <FormattedMessage id="manage-user.password" />{" "}
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="inputPassword4"
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
                <label for="inputPassword4" className="form-label">
                  {" "}
                  <FormattedMessage id="manage-user.phone-number" />{" "}
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="inputPassword4"
                  value={phoneNumber}
                  onChange={(event) =>
                    this.handleChangeInput(event, "phoneNumber")
                  }
                />
              </div>
              <div className="col-md-3">
                <label for="inputPassword4" className="form-label">
                  {" "}
                  <FormattedMessage id="manage-user.last-name" />{" "}
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="inputPassword4"
                  value={lastName}
                  onChange={(event) =>
                    this.handleChangeInput(event, "lastName")
                  }
                />
              </div>
              <div className="col-md-3">
                <label for="inputPassword4" className="form-label">
                  {" "}
                  <FormattedMessage id="manage-user.first-name" />{" "}
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="inputPassword4"
                  value={firstName}
                  onChange={(event) =>
                    this.handleChangeInput(event, "firstName")
                  }
                />
              </div>

              <div className="col-md-3">
                <label for="inputAddress" className="form-label">
                  <FormattedMessage id="manage-user.address" />
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="inputAddress"
                  placeholder="1234 Main St"
                  value={address}
                  onChange={(event) => this.handleChangeInput(event, "address")}
                />
              </div>
              <div className="col-md-3">
                <label for="inputState" className="form-label">
                  <FormattedMessage id="manage-user.gender" />
                </label>
                <select
                  id="inputState"
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
                <label for="inputState" className="form-label">
                  <FormattedMessage id="manage-user.position" />
                </label>
                <select
                  id="inputState"
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

              <div className="col-md-3">
                <label for="inputState" className="form-label">
                  <FormattedMessage id="manage-user.role" />
                </label>
                <select
                  id="inputState"
                  className="form-select"
                  value={position}
                  onChange={(event) =>
                    this.handleChangeInput(event, "position")
                  }
                >
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
              </div>
              <div className="col-md-12">
                <div className="preview-img-container">
                  <label htmlFor="chooseImage" className="form-label">
                    <FormattedMessage id="manage-user.image" />
                  </label>
                  <input
                    type="file"
                    id="chooseImage"
                    hidden
                    onClick={(event) => this.handleChangeInputImage(event)}
                  />
                  <div
                    className="previewImage"
                    style={{
                      backgroundImage: `url(${this.state.previewImageUrl})`,
                    }}
                    onClick={() => {
                      this.openPreviewImage();
                    }}
                  ></div>
                </div>
              </div>
              <div className="col-12">
                <button
                  className={
                    this.state.action === CRUD_ACTION.UPDATE
                      ? "btn btn-warning px-2"
                      : "btn btn-primary px-2"
                  }
                  onClick={() => {
                    this.handleSaveUser();
                  }}
                >
                  {this.state.action === CRUD_ACTION.UPDATE ? (
                    <FormattedMessage id="manage-user.edit" />
                  ) : (
                    <FormattedMessage id="manage-user.save" />
                  )}
                </button>
              </div>
              <div className="col-12 mb-5">
                <TableManageUser
                  handleEditUsersFromParentKey={this.handleEditUsersFromParent}
                />
              </div>
            </div>
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
