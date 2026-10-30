import React, { Component } from "react";
import { connect } from "react-redux";
import { push } from "connected-react-router";
import logo1 from "../../../assets/images/161905-iconkham-chuyen-khoa.webp";
import logo2 from "../../../assets/images/161817-iconkham-tu-xa.webp";
import logo3 from "../../../assets/images/161350-iconkham-tong-quan.webp";
import logo4 from "../../../assets/images/161340-iconxet-nghiem-y-hoc.webp";
import logo5 from "../../../assets/images/161403-iconsuc-khoe-tinh-than.webp";
import logo6 from "../../../assets/images/161410-iconkham-nha-khoa.webp";
import logo7 from "../../../assets/images/161421-icongoi-phau-thuat.webp";
import logo8 from "../../../assets/images/145257-thiet-ke-chua-co-ten-3.webp";
import logo9 from "../../../assets/images/161442-iconbai-test-suc-khoe2.webp";
import logo10 from "../../../assets/images/163421-153524-near-home-01.webp";
import { FormattedMessage } from "react-intl";
class ComprehensiveService extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleServiceClick = (type) => {
    switch (type) {
      case "SPECIALTY":
        this.props.navigate("/specialty");
        break;
      case "REMOTE":
        this.props.navigate("/chat-patient");
        break;
      case "GENERAL":
        this.props.navigate("/general-exam");
        break;
      case "TEST":
        this.props.navigate("/general-exam");
        break;
      case "MENTAL":
        this.props.navigate("/detail-specialty/11");
        break;
      case "DENTAL":
        this.props.navigate("/detail-specialty/17");
        break;
      case "SURGERY":
        this.props.navigate("/detail-specialty/15");
        break;
      case "DIABETES": {
        const handbookEl = document.querySelector(".section-handbook");
        if (handbookEl) {
          handbookEl.scrollIntoView({ behavior: "smooth" });
        } else {
          this.props.navigate("/detail-specialty/12");
        }
        break;
      }
      case "HEALTH_TEST":
        this.props.navigate("/health-test");
        break;
      case "NEARBY": {
        const facilityEl = document.querySelector(".section-medical-facility");
        if (facilityEl) {
          facilityEl.scrollIntoView({ behavior: "smooth" });
        } else {
          this.props.navigate("/general-exam");
        }
        break;
      }
      default:
        break;
    }
  };

  render() {
    return (
      <div className="home-body1-container">
        <div className="subs-title">
          <FormattedMessage id="homepage.comprehensive" />
        </div>
        <div className="home-body1-content">
          <div
            className="child-content"
            onClick={() => this.handleServiceClick("SPECIALTY")}
          >
            <div className="image-container">
              <img src={logo1} alt="Khám chuyên khoa" />
            </div>
            <div className="child-subs-title">
              <FormattedMessage id="homepage.specialist-examination" />
            </div>
          </div>
          <div
            className="child-content"
            onClick={() => this.handleServiceClick("REMOTE")}
          >
            <div className="image-container">
              <img src={logo2} alt="Khám từ xa" />
            </div>
            <div className="child-subs-title">
              <FormattedMessage id="homepage.remote-examination" />
            </div>
          </div>
          <div
            className="child-content"
            onClick={() => this.handleServiceClick("GENERAL")}
          >
            <div className="image-container">
              <img src={logo3} alt="Khám tổng quát" />
            </div>
            <div className="child-subs-title">
              <FormattedMessage id="homepage.general-examination" />
            </div>
          </div>
          <div
            className="child-content"
            onClick={() => this.handleServiceClick("TEST")}
          >
            <div className="image-container">
              <img src={logo4} alt="Xét nghiệm y học" />
            </div>
            <div className="child-subs-title">
              <FormattedMessage id="homepage.medical-test" />
            </div>
          </div>
          <div
            className="child-content"
            onClick={() => this.handleServiceClick("MENTAL")}
          >
            <div className="image-container">
              <img src={logo5} alt="Sức khỏe tinh thần" />
            </div>
            <div className="child-subs-title">
              <FormattedMessage id="homepage.mental-health" />
            </div>
          </div>
          <div
            className="child-content"
            onClick={() => this.handleServiceClick("DENTAL")}
          >
            <div className="image-container">
              <img src={logo6} alt="Khám nha khoa" />
            </div>
            <div className="child-subs-title">
              <FormattedMessage id="homepage.dental-examination" />
            </div>
          </div>
          <div
            className="child-content"
            onClick={() => this.handleServiceClick("SURGERY")}
          >
            <div className="image-container">
              <img src={logo7} alt="Gói phẫu thuật" />
            </div>
            <div className="child-subs-title">
              <FormattedMessage id="homepage.surgical-package" />
            </div>
          </div>
          <div
            className="child-content"
            onClick={() => this.handleServiceClick("DIABETES")}
          >
            <div className="image-container">
              <img src={logo8} alt="Sống khỏe tiểu đường" />
            </div>
            <div className="child-subs-title">
              <FormattedMessage id="homepage.healthy-living-diabetes" />
            </div>
          </div>
          <div
            className="child-content"
            onClick={() => this.handleServiceClick("HEALTH_TEST")}
          >
            <div className="image-container">
              <img src={logo9} alt="Bài test sức khỏe" />
            </div>
            <div className="child-subs-title">
              <FormattedMessage id="homepage.health-test" />
            </div>
          </div>
          <div
            className="child-content"
            onClick={() => this.handleServiceClick("NEARBY")}
          >
            <div className="image-container">
              <img src={logo10} alt="Y tế gần bạn" />
            </div>
            <div className="child-subs-title">
              <FormattedMessage id="homepage.medical-near-you" />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isLoggedIn: state.user.isLoggedIn,
    language: state.app.language,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    navigate: (path) => dispatch(push(path)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ComprehensiveService);
