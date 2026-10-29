import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect, Route, Switch } from "react-router-dom";
import "./DetailDoctors.scss";
import "./DoctorSchedule.scss";
import HomeHeader from "../../HomePage/HomeHeader";
import DoctorSchedule from "./DoctorSchedule";
import * as actions from "../../../store/actions";
import { LANGUAGE } from "../../../utils";
import DoctorExtraInfor from "./DoctorExtraInfor";
import PatientChatBox from "../../Chat/PatientChatBox"; // sẽ tạo mới file này
import LikeAndShare from "../SocialPlugin/LikeAndShare";
import Comment from "../SocialPlugin/Comment";
import { FormattedMessage } from "react-intl";

class DetailDoctors extends Component {
  constructor(props) {
    super(props);
    this.state = {
      detailDoctorbyId: [],
      currentDoctorId: "-1",
      showChatBox: false, // Thêm state này
    };
  }
  async componentDidMount() {
    if (
      this.props.match &&
      this.props.match.params &&
      this.props.match.params.id
    ) {
      let id = this.props.match.params.id;
      this.props.getDetailDoctorById(id, this.props.language);
      this.setState({
        currentDoctorId: this.props.match.params.id,
      });
    }
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      prevProps.language !== this.props.language &&
      this.state.currentDoctorId !== "-1"
    ) {
      this.props.getDetailDoctorById(
        this.state.currentDoctorId,
        this.props.language
      );
    }
    if (prevProps.detailDoctorRedux !== this.props.detailDoctorRedux) {
      this.setState({
        detailDoctorbyId: this.props.detailDoctorRedux,
      });
    }
  }

  render() {
    let detailDoctorbyId = this.state.detailDoctorbyId;
    //console.log("check2",this.state.detailDoctorbyId)
    let language = this.props.language;
    let nameVi = "",
      nameEn = "";
    if (detailDoctorbyId) {
      let posVi = detailDoctorbyId.positionData
        ? `${detailDoctorbyId.positionData.valueVi}, `
        : "";
      let posEn = detailDoctorbyId.positionData
        ? `${detailDoctorbyId.positionData.valueEn}, `
        : "";
      nameEn = `${posEn}${detailDoctorbyId.lastName} ${detailDoctorbyId.firstName}`;
      nameVi = `${posVi}${detailDoctorbyId.firstName} ${detailDoctorbyId.lastName} `;
    }
    // URL public từ ngrok (ví dụ bạn chạy ngrok http 3000)
    const NGROK_URL = "https://b2243b14e432.ngrok-free.app";

    // Lấy đường dẫn hiện tại (phần sau domain)
    const path = window.location.pathname;
    console.log("path", path);

    // Tạo full URL bằng ngrok
    const url = `${NGROK_URL}${path}`;
    let currentURL =
      +process.env.REACT_APP_IS_LOCALHOST === 1 ? url : window.location.href;
    console.log("href", window.location.href);

    return (
      <React.Fragment>
        <HomeHeader isShowBanner={false} />
        <div className="detail-doctor-container">
          <div className="intro-doctor">
            <div
              className="content-left"
              style={{
                backgroundImage: `url(${
                  detailDoctorbyId && detailDoctorbyId.image
                    ? detailDoctorbyId.image
                    : ""
                })`,
                backgroundPosition: "center",
                backgroundSize: "cover",
                borderRadius: "50%",
                width: "130px",
                height: "130px",
                border: "none",
              }}
            ></div>
            <div className="content-right">
              <div className="up">
                {language === LANGUAGE.VI ? nameVi : nameEn}
              </div>
              <div className="down">
                {detailDoctorbyId &&
                  detailDoctorbyId.Markdown &&
                  detailDoctorbyId.Markdown.description && (
                    <span>{detailDoctorbyId.Markdown.description}</span>
                  )}
                <div className="like-share-plugin">
                  <LikeAndShare dataHref={currentURL} />
                </div>
              </div>
              {/* Nút Liên hệ */}
              <button
                className="btn btn-primary mt-3"
                onClick={() => this.setState({ showChatBox: true })}
                style={{ minWidth: 120 }}
              >
                <FormattedMessage id="patient.detail-doctor.contact" />
              </button>
            </div>
          </div>
          <div className="schedule-doctor">
            <div className="content-left">
              <DoctorSchedule doctorIdFromParent={this.state.currentDoctorId} />
            </div>
            <div className="content-right">
              <DoctorExtraInfor
                doctorIdFromParent={this.state.currentDoctorId}
              />
            </div>
          </div>
          <div className="detail-infor-doctor">
            {detailDoctorbyId &&
              detailDoctorbyId.Markdown &&
              detailDoctorbyId.Markdown.contentHTML && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: detailDoctorbyId.Markdown.contentHTML,
                  }}
                ></div>
              )}
          </div>
          <div className="comment-doctor">
            <Comment dataHref={currentURL} width={"100%"} />
          </div>
        </div>
        {/* Popup Chatbox */}
        {this.state.showChatBox && (
          <PatientChatBox
            doctor={detailDoctorbyId}
            onClose={() => this.setState({ showChatBox: false })}
          />
        )}
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    language: state.app.language,
    detailDoctorRedux: state.admin.inforDoctorById,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getDetailDoctorById: (id, lang) =>
      dispatch(actions.getDetailDoctorById(id, lang)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailDoctors);
