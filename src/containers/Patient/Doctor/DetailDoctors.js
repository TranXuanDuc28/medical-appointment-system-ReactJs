import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import "./DetailDoctors.scss";
import "./DoctorSchedule.scss";
import HomeHeader from "../../HomePage/HomeHeader";
import DoctorSchedule from "./DoctorSchedule";
import * as actions from "../../../store/actions";
import { LANGUAGE } from "../../../utils";
import DoctorExtraInfor from "./DoctorExtraInfor";
import PatientChatBox from "../../Chat/PatientChatBox";
import LikeAndShare from "../SocialPlugin/LikeAndShare";
import Comment from "../SocialPlugin/Comment";
import { FormattedMessage } from "react-intl";
import { toast } from "react-toastify";

class DetailDoctors extends Component {
  constructor(props) {
    super(props);
    this.state = {
      detailDoctorbyId: {},
      currentDoctorId: "-1",
      showChatBox: false,
      isSaved: false,
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
        currentDoctorId: id,
      });

      // Check saved status from localStorage
      const savedDocs = JSON.parse(localStorage.getItem("saved_doctors") || "[]");
      if (savedDocs.includes(id)) {
        this.setState({ isSaved: true });
      }
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
        detailDoctorbyId: this.props.detailDoctorRedux || {},
      });
    }
  }

  handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast.success(
        this.props.language === LANGUAGE.VI
          ? "Đã sao chép liên kết bác sĩ vào bộ nhớ tạm!"
          : "Doctor link copied to clipboard!"
      );
    });
  };

  handleToggleSave = () => {
    const { currentDoctorId, isSaved } = this.state;
    const { language } = this.props;
    let savedDocs = JSON.parse(localStorage.getItem("saved_doctors") || "[]");

    if (isSaved) {
      savedDocs = savedDocs.filter((id) => id !== currentDoctorId);
      this.setState({ isSaved: false });
      toast.info(
        language === LANGUAGE.VI
          ? "Đã bỏ lưu hồ sơ bác sĩ"
          : "Doctor removed from saved list"
      );
    } else {
      savedDocs.push(currentDoctorId);
      this.setState({ isSaved: true });
      toast.success(
        language === LANGUAGE.VI
          ? "Đã lưu hồ sơ bác sĩ vào danh sách quan tâm!"
          : "Doctor saved to your favorites!"
      );
    }
    localStorage.setItem("saved_doctors", JSON.stringify(savedDocs));
  };

  handleGoBack = () => {
    if (this.props.history && this.props.history.length > 1) {
      this.props.history.goBack();
    } else {
      this.props.history.push("/home");
    }
  };

  render() {
    let { detailDoctorbyId, isSaved } = this.state;
    let language = this.props.language;

    let nameVi = "",
      nameEn = "";
    if (detailDoctorbyId && detailDoctorbyId.id) {
      let posVi = detailDoctorbyId.positionData
        ? `${detailDoctorbyId.positionData.valueVi} `
        : "";
      let posEn = detailDoctorbyId.positionData
        ? `${detailDoctorbyId.positionData.valueEn} `
        : "";

      let fullNameVi = `${detailDoctorbyId.firstName || ""} ${
        detailDoctorbyId.lastName || ""
      }`.trim();
      let fullNameEn = `${detailDoctorbyId.lastName || ""} ${
        detailDoctorbyId.firstName || ""
      }`.trim();

      nameVi = `${posVi}${fullNameVi}`;
      nameEn = `${posEn}${fullNameEn}`;
    }

    const currentURL = window.location.href;

    return (
      <React.Fragment>
        <HomeHeader isShowBanner={false} />

        <div className="detail-doctor-page">
          {/* Breadcrumb Navigation */}
          <div className="breadcrumb-wrapper">
            <div className="breadcrumb-content">
              <span
                className="crumb-item"
                onClick={() => this.props.history.push("/home")}
              >
                <i className="fas fa-home me-1"></i>
                <FormattedMessage id="patient.detail-doctor.home" />
              </span>
              <i className="fas fa-chevron-right crumb-divider"></i>
              <span
                className="crumb-item"
                onClick={() => this.props.history.push("/all-doctors")}
              >
                <FormattedMessage id="patient.detail-doctor.doctor" />
              </span>
              <i className="fas fa-chevron-right crumb-divider"></i>
              <span className="crumb-active">
                {language === LANGUAGE.VI ? nameVi : nameEn}
              </span>
            </div>
            <button className="btn-back-nav" onClick={this.handleGoBack}>
              <i className="fas fa-arrow-left me-1"></i>
              <FormattedMessage id="patient.detail-doctor.back" />
            </button>
          </div>

          <div className="detail-doctor-container">
            {/* Doctor Profile Banner */}
            <div className="intro-doctor-card">
              <div className="avatar-wrapper">
                <div
                  className="doctor-avatar"
                  style={{
                    backgroundImage: `url(${
                      detailDoctorbyId && detailDoctorbyId.image
                        ? detailDoctorbyId.image
                        : ""
                    })`,
                  }}
                ></div>
                <div
                  className="verified-pill"
                  title={
                    language === LANGUAGE.VI
                      ? "Bác sĩ uy tín đã được xác thực chuyên môn"
                      : "Verified Doctor"
                  }
                >
                  <i className="fas fa-check-circle me-1"></i>
                  <span>
                    <FormattedMessage id="patient.detail-doctor.verified-doctor" />
                  </span>
                </div>
              </div>

              <div className="intro-info">
                <div className="doctor-header-row">
                  <h1 className="doctor-name">
                    {language === LANGUAGE.VI ? nameVi : nameEn}
                  </h1>
                </div>

                <div className="doctor-meta-tags">
                  <span className="meta-tag specialty">
                    <i className="fas fa-stethoscope me-1"></i>
                    {language === LANGUAGE.VI
                      ? "Chuyên khoa Cơ Xương Khớp"
                      : "Musculoskeletal Specialty"}
                  </span>
                  <span className="meta-tag experience">
                    <i className="fas fa-award me-1"></i>
                    {language === LANGUAGE.VI
                      ? "Hơn 20 năm kinh nghiệm"
                      : "20+ Years Experience"}
                  </span>
                </div>

                <div className="doctor-desc">
                  {detailDoctorbyId &&
                    detailDoctorbyId.Markdown &&
                    detailDoctorbyId.Markdown.description && (
                      <p>{detailDoctorbyId.Markdown.description}</p>
                    )}
                </div>

                <div className="doctor-action-toolbar">
                  <button
                    className="btn-chat-doctor"
                    onClick={() => this.setState({ showChatBox: true })}
                  >
                    <i className="fas fa-comment-dots me-2"></i>
                    <FormattedMessage id="patient.detail-doctor.contact" />
                  </button>

                  <button
                    className="btn-action-tool"
                    onClick={this.handleCopyLink}
                    title="Sao chép liên kết hồ sơ bác sĩ"
                  >
                    <i className="fas fa-share-alt me-1"></i>
                    <FormattedMessage id="patient.detail-doctor.share" />
                  </button>

                  <button
                    className={`btn-action-tool ${isSaved ? "saved-active" : ""}`}
                    onClick={this.handleToggleSave}
                    title="Lưu vào danh sách bác sĩ quan tâm"
                  >
                    <i
                      className={`${
                        isSaved ? "fas fa-bookmark" : "far fa-bookmark"
                      } me-1`}
                    ></i>
                    <FormattedMessage
                      id={
                        isSaved
                          ? "patient.detail-doctor.saved"
                          : "patient.detail-doctor.save"
                      }
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Doctor Schedule and Extra Info Card */}
            <div className="schedule-section-card">
              <div className="schedule-col-left">
                <DoctorSchedule
                  doctorIdFromParent={this.state.currentDoctorId}
                />
              </div>
              <div className="schedule-divider-vertical"></div>
              <div className="schedule-col-right">
                <DoctorExtraInfor
                  doctorIdFromParent={this.state.currentDoctorId}
                />
              </div>
            </div>

            {/* Doctor Biography & Clinical Background */}
            <div className="detail-infor-card">
              <div className="card-header-styled">
                <i className="fas fa-file-medical-alt header-icon"></i>
                <h2>
                  {language === LANGUAGE.VI
                    ? "Thông tin chi tiết & Quá trình công tác"
                    : "Doctor Biography & Professional Qualifications"}
                </h2>
              </div>

              {detailDoctorbyId &&
                detailDoctorbyId.Markdown &&
                detailDoctorbyId.Markdown.contentHTML && (
                  <div
                    className="markdown-formatted-content"
                    dangerouslySetInnerHTML={{
                      __html: detailDoctorbyId.Markdown.contentHTML,
                    }}
                  ></div>
                )}
            </div>

            {/* Patient Feedback & Reviews */}
            <div className="patient-reviews-card">
              <div className="card-header-styled">
                <i className="fas fa-star header-icon review-star"></i>
                <h2>
                  <FormattedMessage id="patient.detail-doctor.patient-reviews" />
                </h2>
                <span className="rating-badge">
                  4.9 / 5 <i className="fas fa-star ms-1"></i> (98%{" "}
                  <FormattedMessage id="patient.detail-doctor.rating-satisfaction" />
                  )
                </span>
              </div>

              <div className="review-list">
                <div className="review-item">
                  <div className="review-top">
                    <div className="reviewer-info">
                      <div className="reviewer-avatar">NT</div>
                      <div>
                        <div className="reviewer-name">Nguyễn Thị H. (58 tuổi)</div>
                        <div className="review-date">
                          <i className="far fa-clock me-1"></i>Đã khám ngày 24/10/2026 • Khám Thoái hóa khớp gối
                        </div>
                      </div>
                    </div>
                    <div className="review-stars">
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                    </div>
                  </div>
                  <div className="review-body">
                    Bác sĩ giải thích tình trạng thoái hóa khớp gối rất chi tiết và dễ hiểu, kê đơn thuốc hợp lý và dặn dò kỹ lưỡng về chế độ ăn uống, tập phục hồi chức năng. Đặt hẹn qua hệ thống rất đúng giờ, không phải xếp hàng chờ đợi.
                  </div>
                </div>

                <div className="review-item">
                  <div className="review-top">
                    <div className="reviewer-info">
                      <div className="reviewer-avatar">TV</div>
                      <div>
                        <div className="reviewer-name">Trần Văn T. (62 tuổi)</div>
                        <div className="review-date">
                          <i className="far fa-clock me-1"></i>Đã khám ngày 18/10/2026 • Đau thần kinh tọa
                        </div>
                      </div>
                    </div>
                    <div className="review-stars">
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                    </div>
                  </div>
                  <div className="review-body">
                    Bác sĩ rất ân cần, thăm khám cẩn thận từng khớp và cột sống. Sau 2 tuần theo phác đồ điều trị của bác sĩ thì chân tôi đã đỡ đau nhức rất nhiều, đêm ngủ ngon hơn hẳn.
                  </div>
                </div>
              </div>
            </div>

            {/* Facebook Social Plugin & Discussion */}
            <div className="comment-doctor-card">
              <div className="card-header-styled">
                <i className="far fa-comments header-icon"></i>
                <h2>Hỏi đáp & Bình luận</h2>
              </div>
              <Comment dataHref={currentURL} width={"100%"} />
            </div>
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

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(DetailDoctors)
);
