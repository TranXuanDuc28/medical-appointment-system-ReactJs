import React, { Component } from "react";
import { connect } from "react-redux";
import { FormattedMessage } from "react-intl";
import "./DetailClinic.scss";
import HomeHeader from "../../HomePage/HomeHeader";
import DoctorSchedule from "../Doctor/DoctorSchedule";
import DoctorExtraInfor from "../Doctor/DoctorExtraInfor";
import ProfileDoctor from "../Doctor/ProfileDoctor";
import {
  getAllDetailClinicById,
  getAllCodeServices,
} from "../../../services/userServices";
import _ from "lodash";
import { LANGUAGES } from "../../../utils";
class DetailClinic extends Component {
  constructor(props) {
    super(props);
    this.state = {
      arrDoctorId: [],
      dataDetailClinic: {},
      headings: [],
      activeHeadingId: "",
    };
    this.observer = null;
  }

  async componentDidMount() {
    this.fetchClinicDetail();
  }

  async fetchClinicDetail() {
    if (this.props.match?.params?.id) {
      let id = this.props.match.params.id;
      let res = await getAllDetailClinicById({ id, lang: this.props.language });

      if (res && res.errCode === 0) {
        const contentHTML = res.data?.clinicMarkdown?.contentHTML || "";
        const processed = this.processDescriptionHTML(contentHTML);

        let arrDoctorId = [];
        if (res.data?.doctorClinic?.length > 0) {
          arrDoctorId = res.data.doctorClinic.map((item) => item.doctorId);
        }

        this.setState(
          {
            dataDetailClinic: {
              ...res.data,
              contentHTML: processed.html,
            },
            headings: processed.headings,
            arrDoctorId,
          },
          () => this.observeHeadings()
        );
      }
    }
  }
  async componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.language !== this.props.language) {
      this.fetchClinicDetail();
    }
  }

  generateSlug = (text) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "");
  };

  processDescriptionHTML = (html) => {
    if (!html) return { html: "", headings: [] };

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const headingsData = [];
    const headings = doc.querySelectorAll("h2");

    headings.forEach((h, index) => {
      const text = h.textContent.trim();
      if (!text) return;
      const id = this.generateSlug(text) || `section-${index}`;
      h.setAttribute("id", id);
      headingsData.push({ id, text });
    });

    return {
      html: doc.body.innerHTML,
      headings: headingsData,
    };
  };

  observeHeadings() {
    if (this.observer) this.observer.disconnect();

    const options = { root: null, rootMargin: "0px", threshold: 0.3 };
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.setState({ activeHeadingId: entry.target.id });
        }
      });
    }, options);

    this.state.headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) this.observer.observe(el);
    });
  }
  render() {
    let { arrDoctorId, dataDetailClinic, headings, activeHeadingId } =
      this.state;
    console.log("check dataDetailClinic:", dataDetailClinic);
    let { language } = this.props;
    return (
      <div className="detail-clinic-container">
        <HomeHeader isShowBanner={false} />
        {/* Clinic Header Section */}
        <div className="container my-4 border rounded shadow-sm">
          <div className="bg-white mb-4">
            <div className="row align-items-center d-flex justify-content-center border-bottom mb-4 bg-light-custom p-3">
              <div className="col-md-2 col-4 text-center mb-3 mb-md-0">
                <img
                  src={dataDetailClinic?.image}
                  alt={dataDetailClinic?.name}
                  className="img-fluid rounded"
                  style={{
                    maxWidth: 150,
                    maxHeight: 150,
                    objectFit: "contain",
                  }}
                />
              </div>
              <div className="col-md-7 col-8">
                <h3 className="fw-bold mb-1">{dataDetailClinic?.name}</h3>
                <div className="text-muted mb-2">
                  {dataDetailClinic?.address}
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {dataDetailClinic?.images &&
                    dataDetailClinic.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`clinic-img-${idx}`}
                        className="rounded"
                        style={{
                          width: 70,
                          height: 50,
                          objectFit: "cover",
                          border: "1px solid #eee",
                        }}
                      />
                    ))}
                </div>
              </div>
            </div>
            {/* Tabs */}
            {/* Menu Tabs tự động */}
            <div className="d-flex justify-content-center mt-4">
              <ul className="nav nav-tabs mt-4" role="tablist">
                {headings.map((h) => (
                  <li className="nav-item" key={h.id} role="presentation">
                    <button
                      className={`nav-link ${
                        activeHeadingId === h.id ? "active" : ""
                      }`}
                      type="button"
                      onClick={() => {
                        const el = document.getElementById(h.id);
                        el?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }}
                    >
                      {h.text}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Feature Icons */}
            <div className="d-flex gap-4 mt-4 justify-content-center flex-wrap">
              <div className="text-center">
                <div
                  className="bg-warning bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center mb-2"
                  style={{ width: 56, height: 56 }}
                >
                  <i className="fa fa-heartbeat fa-2x text-warning"></i>
                </div>
                <div className="fw-bold text-warning">Tất cả</div>
              </div>
              <div className="text-center">
                <div
                  className="bg-info bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center mb-2"
                  style={{ width: 56, height: 56 }}
                >
                  <i className="fa fa-user-md fa-2x text-info"></i>
                </div>
                <div className="fw-bold text-info">Bác sĩ</div>
              </div>
              <div className="text-center">
                <div
                  className="bg-primary bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center mb-2"
                  style={{ width: 56, height: 56 }}
                >
                  <i className="fa fa-stethoscope fa-2x text-primary"></i>
                </div>
                <div className="fw-bold text-primary">Nội soi</div>
              </div>
              <div className="text-center">
                <div
                  className="bg-success bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center mb-2"
                  style={{ width: 56, height: 56 }}
                >
                  <i className="fa fa-cut fa-2x text-success"></i>
                </div>
                <div className="fw-bold text-success">Phẫu thuật</div>
              </div>
            </div>
          </div>
        </div>

        {/* End Clinic Header Section */}
        <div className="detail-clinic-body">
          <div className="description-clinic">
            {dataDetailClinic && !_.isEmpty(dataDetailClinic) && (
              <div
                dangerouslySetInnerHTML={{
                  __html: dataDetailClinic.contentHTML,
                }}
              ></div>
            )}
          </div>
          {arrDoctorId &&
            arrDoctorId.length > 0 &&
            arrDoctorId.map((item, index) => {
              return (
                <div className="each-doctor" key={item}>
                  <div className="dt-content-left">
                    <div className="profile-doctor">
                      <ProfileDoctor
                        doctorId={item}
                        isShowDescriptionDoctor={true}
                        isShowLinkDetail={true}
                        isShowPrice={true}
                      />
                    </div>
                  </div>
                  <div className="dt-content-right">
                    <div className="doctor-schedule">
                      <DoctorSchedule doctorIdFromParent={item} key={index} />
                    </div>
                    <div className="doctor-extra-infor">
                      <DoctorExtraInfor doctorIdFromParent={item} />
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    language: state.app.language,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailClinic);
