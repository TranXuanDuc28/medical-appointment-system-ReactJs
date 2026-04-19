import React, { Component } from "react";
import { connect } from "react-redux";
import { push } from "connected-react-router";

import * as actions from "../../store/actions";
import "./Login.scss";
import { handleLoginApi } from "../../services/userServices";
class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      isShowPassword: false,
      errMessage: "",
    };
  }
  handleOnChangeUsername = (event) => {
    this.setState({
      username: event.target.value,
    });
  };
  handleOnChangePassword = (event) => {
    this.setState({
      password: event.target.value,
    });
  };
  handleButtonLogin = async () => {
    this.setState({
      errMessage: "",
    });
    try {
      let data = await handleLoginApi(this.state.username, this.state.password);
      if (data && data.errCode !== 0) {
        this.setState({
          errMessage: data.errMessage,
        });
      }
      if (data && data.errCode === 0) {
        this.props.userLoginSuccess(data.users);
        //console.log("Dang nhap thanh cong!")
      }
    } catch (error) {
      if (error.response) {
        if (error.response.data) {
          this.setState({
            errMessage: error.response.data.errMessage,
          });
        }
      }
    }
  };
  isShowHidePassword = () => {
    this.setState({
      isShowPassword: !this.state.isShowPassword,
    });
  };
  render() {
    return (
      <div className="login-background">
        <div className="login-container">
          <div className="login-content">
            <div className="col-12 text-login">Login</div>
            <div className="form-group login-input">
              <label>Tên đăng nhập</label>
              <input
                className="form-control"
                name="username"
                placeholder="Nhập tên..."
                onChange={(event) => this.handleOnChangeUsername(event)}
              />
            </div>
            <div className="form-group login-input">
              <label>Mật khẩu</label>
              <div className="custom-input-password">
                <input
                  className="form-control"
                  name="password"
                  placeholder="Mật khẩu..."
                  type={this.state.isShowPassword ? "text" : "password"}
                  onChange={(event) => this.handleOnChangePassword(event)}
                />
                <span
                  onClick={() => {
                    this.isShowHidePassword();
                  }}
                >
                  <i
                    className={
                      this.state.isShowPassword
                        ? "fas fa-eye"
                        : "fas fa-eye-slash"
                    }
                  ></i>
                </span>
              </div>
            </div>
            <div className="col-12">{this.state.errMessage}</div>
            <div className="col-12">
              <button
                className="btn-login"
                onClick={() => this.handleButtonLogin()}
              >
                Đăng nhập
              </button>
            </div>
            <div className="col-12 forget-password">
              <p>Bạn quên mật khẩu?</p>
            </div>
            <div className="col-12 text-center">
              <p>Hoặc đăng nhập với:</p>
            </div>
            <div className="col-12 social-login">
              <i className="fab fa-google-plus-g google"></i>
              <i className="fab fa-facebook-f facebook"></i>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    lang: state.app.language,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    navigate: (path) => dispatch(push(path)),
    userLoginSuccess: (userInfo) =>
      dispatch(actions.userLoginSuccess(userInfo)),
    userLoginFail: () => dispatch(actions.userLoginFail()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
