import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import "./HomeHeader.scss";
import { FormattedMessage } from "react-intl";
import { LANGUAGE } from "../../utils";
import { changeLanguage } from "../../store/actions/appActions";
import LoginModal from "../../containers/Auth/LoginModal";
import * as actions from "../../store/actions";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import banner1 from "../../assets/images/banner/141422-144204-dat-lich-kham-bookingcare-pharmacity.jpg";
import banner2 from "../../assets/images/banner/112216-qt-city.png";
import banner3 from "../../assets/images/banner/165707-mediplus.png";
import banner4 from "../../assets/images/banner/142138-song-khoe-suot-doi-1.png";

class HomeHeader extends Component {
  state = {
    showLoginModal: false,
    showLogoutMenu: false,
  };

  handleOpenLogin = () => {
    this.setState({ showLoginModal: true });
  };

  handleCloseLogin = () => {
    this.setState({ showLoginModal: false });
  };

  handleLoginSuccess = () => {
    this.setState({ showLoginModal: false });
  };

  handleChangeLanguage = (language) => {
    this.props.changeLanguageRedux(language);
  };

  handleLichHenClick = () => {
    const user = this.props.patientInfo; // Lấy từ redux
    if (user) {
      this.props.history.push("/lich-hen");
    } else {
      this.handleOpenLogin();
    }
  };

  handleAvatarClick = () => {
    const { patientInfo } = this.props;
    if (!patientInfo) {
      this.setState({ showLoginModal: true });
    } else {
      this.setState((prev) => ({ showLogoutMenu: !prev.showLogoutMenu }));
    }
  };

  handleLogout = () => {
    // Dispatch action logout ở đây, ví dụ:
    if (this.props.patientLogout) this.props.patientLogout();
    this.setState({ showLogoutMenu: false });
    // Có thể chuyển hướng về trang chủ nếu muốn
    this.props.history.push("/home");
  };

  render() {
    let language = this.props.language;
    const { patientInfo } = this.props;
    const { showLogoutMenu } = this.state;
    console.log("avatar:", patientInfo);

    // Danh sách banner
    const banners = [banner1, banner2, banner3, banner4];

    // Cấu hình slider
    const sliderSettings = {
      dots: true,
      infinite: true,
      speed: 2000,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 4000, // 1 giây đổi ảnh
      arrows: false,
    };

    return (
      <React.Fragment>
        <div className="home-header-container">
          <div className="home-header-content">
            <div className="left-content">
              <button>
                <i className="fa fa-bars" aria-hidden="true"></i>
              </button>
              <div
                className="header-logo "
                onClick={() => this.props.history.push("/home")}
              ></div>
            </div>
            <div className="center-content">
              <div className="left-child-content">
                <div className="subs-title1 subs-title1-yellow">
                  <FormattedMessage id="homeheader.all" />
                </div>
                <div className="subs-title1">
                  <FormattedMessage id="homeheader.at-home" />
                </div>
                <div className="subs-title1">
                  <FormattedMessage id="homeheader.at-hospital" />
                </div>
                <div className="subs-title1">
                  <FormattedMessage id="homeheader.healthy-living" />
                </div>
              </div>
              <div className="right-child-content">
                <div className="search-input">
                  <i className="fa fa-search" aria-hidden="true"></i>
                  <FormattedMessage id="homeheader.search-package">
                    {(placeholder) => (
                      <input
                        className="placeHolderSearch"
                        type="text"
                        placeholder={placeholder}
                      />
                    )}
                  </FormattedMessage>
                </div>
              </div>
            </div>
            <div className="right-content">
              <div className="schedule" onClick={this.handleLichHenClick}>
                <i className="fa fa-calendar" aria-hidden="true"></i>
                <div className="subs-title2">
                  <FormattedMessage id="homeheader.schedule" />
                </div>
              </div>
              <div className="chat">
                <i className="fa fa-comments" aria-hidden="true"></i>
                <div
                  className="subs-title2"
                  onClick={() => this.props.history.push("/chat-patient")}
                >
                  <FormattedMessage id="homeheader.chat" />
                </div>
              </div>
              <div className="support">
                <i className="fa fa-question-circle" aria-hidden="true"></i>
                <div className="subs-title2">
                  <FormattedMessage id="homeheader.support" />
                </div>
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
              {patientInfo ? (
                <div
                  className="d-flex align-items-center ps-3"
                  style={{ position: "relative" }}
                >
                  <img
                    src={
                      patientInfo?.avatar
                        ? patientInfo.avatar
                        : "https://res.cloudinary.com/dehvr55kl/image/upload/v1754732538/360_F_549983970_bRCkYfk0P6PP5fKbMhZMIb07mCJ6esXL_tyysti.jpg"
                    }
                    alt="avatar"
                    className="rounded-circle"
                    style={{
                      width: 40,
                      height: 40,
                      objectFit: "cover",
                      marginRight: 10,
                      border: "2px solid #ddd",
                      cursor: "pointer",
                    }}
                    onClick={this.handleAvatarClick}
                  />
                  <div className="name-account">
                    <span className="fw-bold" style={{ fontSize: "14px" }}>
                      {patientInfo
                        ? `${patientInfo.firstName} ${patientInfo.lastName}`
                        : ""}
                    </span>
                  </div>
                  {/* Menu logout */}
                  {patientInfo && showLogoutMenu && (
                    <div
                      style={{
                        position: "absolute",
                        top: 50,
                        right: 0,
                        background: "#fff",
                        border: "1px solid #ddd",
                        borderRadius: 6,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        zIndex: 100,
                        minWidth: 120,
                        padding: 8,
                      }}
                    >
                      <button
                        className="btn btn-outline-danger w-100"
                        onClick={this.handleLogout}
                      >
                        <FormattedMessage id="homeheader.logout" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="d-flex align-items-center ps-3"
                  style={{ position: "relative" }}
                >
                  <img
                    src={
                      "https://res.cloudinary.com/dehvr55kl/image/upload/v1754732538/360_F_549983970_bRCkYfk0P6PP5fKbMhZMIb07mCJ6esXL_tyysti.jpg"
                    }
                    alt="avatar"
                    className="rounded-circle"
                    style={{
                      width: 40,
                      height: 40,
                      objectFit: "cover",
                      marginRight: 10,
                      border: "2px solid #ddd",
                      cursor: "pointer",
                    }}
                    onClick={this.handleAvatarClick}
                  />
                  <div className="d-flex flex-column">
                    <span className="fw-bold" style={{ fontSize: "14px" }}>
                      <FormattedMessage id="homeheader.guest" />
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          {this.props.isShowBanner === true && (
            <div className="home-banner-slider">
              <Slider {...sliderSettings}>
                {banners.map((banner, index) => (
                  <div key={index}>
                    <img
                      src={banner}
                      alt={`banner-${index}`}
                      className="banner-img"
                    />
                  </div>
                ))}
              </Slider>
            </div>
          )}
        </div>
        {this.state.showLoginModal && (
          <LoginModal
            onClose={this.handleCloseLogin}
            onLoginSuccess={this.handleLoginSuccess}
          />
        )}
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isLoggedIn: state.user.isLoggedIn,
    language: state.app.language,
    patientInfo: state.patient.patientInfo,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    changeLanguageRedux: (language) => dispatch(changeLanguage(language)),
    patientLogout: () => dispatch(actions.patientLogout()), // Thay bằng action logout thực tế của bạn
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(HomeHeader)
);
