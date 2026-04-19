import React, { Component } from "react";
import { connect } from "react-redux";
import { LANGUAGE, USER_ROLE } from "../../utils";
import * as actions from "../../store/actions";
import Navigator from "../../components/Navigator";
import { adminMenu, doctorMenu, cashierMenu } from "./menuApp";
import { FormattedMessage } from "react-intl";
import { postLogout } from "../../services/userServices";
import _ from "lodash";
import "./Header.scss";

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      menuApp: [],
    };
  }
  handleChangeLanguage = (language) => {
    this.props.changeLanguageRedux(language);
  };
  componentDidMount() {
    let userInfo = this.props.userInfo;
    let menu = [];
    if (userInfo && !_.isEmpty(userInfo)) {
      let role = userInfo.roleId;
      // console.log("check", role)
      if (role === USER_ROLE.ADMIN) {
        menu = adminMenu;
      }
      if (role === USER_ROLE.DOCTOR) {
        menu = doctorMenu;
      }
      if (role === USER_ROLE.CASHIER) {
        menu = cashierMenu;
      }
    }
    this.setState({
      menuApp: menu,
    });
  }
  render() {
    const { processLogout, language, userInfo } = this.props;
    console.log("check1", userInfo);
    // console.log("check2", this.state.menuApp)

    return (
      <div className="header-container">
        {/* thanh navigator */}
        <div className="header-tabs-container">
          <Navigator menus={this.state.menuApp} />
        </div>

        {/* nút logout */}
        <div className="header-content-right">
          <div className="nameuser">
            {/* {" " + userInfo && language === LANGUAGE.VI
              ? userInfo.roleData.valueVi
              : userInfo.roleData.valueEn}
            {" - "} */}
            {userInfo && userInfo.firstName
              ? userInfo.firstName + " " + userInfo.lastName
              : ""}
          </div>
          <div className="language">
            <div
              className={
                language === LANGUAGE.VI
                  ? "subs-title2 active-vi"
                  : "subs-title2"
              }
            >
              <span onClick={() => this.handleChangeLanguage(LANGUAGE.VI)}>
                VI
              </span>
            </div>
            <div
              className={
                language === LANGUAGE.EN
                  ? "subs-title2 active-en"
                  : "subs-title2"
              }
            >
              <span onClick={() => this.handleChangeLanguage(LANGUAGE.EN)}>
                EN
              </span>
            </div>
          </div>
          <div className="btn btn-logout" onClick={processLogout}>
            <i className="fas fa-sign-out-alt"></i>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isLoggedIn: state.user.isLoggedIn,
    userInfo: state.user.userInfo,
    language: state.app.language,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    processLogout: async () => {
      try {
        await postLogout();
        dispatch(actions.processLogout());
      } catch (e) {
        console.log(e);
        dispatch(actions.processLogout()); // fallback
      }
    },
    changeLanguageRedux: (language) =>
      dispatch(actions.changeLanguage(language)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);
