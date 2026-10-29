import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { connect } from "react-redux";
import "slick-carousel/slick/slick.css";
import * as actions from "../../../store/actions";
import { LANGUAGE } from "../../../utils";
import { withRouter } from "react-router-dom";
import Slider from "react-slick";
import { NextArrow, PrevArrow } from "../CustomArrows";
import { FormattedMessage } from "react-intl";
class OutstandingDoctor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      arrDoctors: [],
    };
  }
  componentDidMount() {
    this.props.getTopDoctorHomeRedux({ lang: this.props.language });
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.language !== this.props.language) {
      this.props.getTopDoctorHomeRedux({ lang: this.props.language });
    }
    if (prevProps.listDoctorRedux !== this.props.listDoctorRedux) {
      this.setState({
        arrDoctors: this.props.listDoctorRedux,
      });
    }
  }
  handelViewDetailDoctor = (doctor) => {
    this.props.history.push(`/detail-doctor/${doctor.id}`);
  };
  render() {
    let arrDoctors = this.state.arrDoctors;
    // arrDoctors = arrDoctors.concat(arrDoctors).concat(arrDoctors)
    console.log("check arrDoctors: ", arrDoctors);
    let language = this.props.language;

    return (
      <React.Fragment>
        <div className="section-share section-background">
          <div className="section-content">
            <div className="section-header">
              <div className="title-section">
                <FormattedMessage id="homepage.doctor" />{" "}
              </div>
              <div>
                {" "}
                <button className="btn-section">
                  <FormattedMessage id="homepage.more-infor" />
                </button>
              </div>
            </div>
            <div className="section-body">
              <Slider
                {...this.props.settings}
                nextArrow={<NextArrow />}
                prevArrow={<PrevArrow />}
              >
                {arrDoctors &&
                  arrDoctors.length > 0 &&
                  arrDoctors.map((item, index) => {
                    let posVi = item.positionData ? `${item.positionData.valueVi}, ` : "";
                    let posEn = item.positionData ? `${item.positionData.valueEn}, ` : "";
                    let nameVi = `${posVi}${item.firstName} ${item.lastName}`;
                    let nameEn = `${posEn}${item.lastName} ${item.firstName}`;
                    return (
                      <div
                        className="section-customize customize-outstanding-doctor"
                        key={index}
                        onClick={() => this.handelViewDetailDoctor(item)}
                      >
                        <div
                          className="bg-image section-outstanding-doctor"
                          style={{
                            backgroundImage: `url(${item.image})`,
                          }}
                        ></div>
                        <div className="title-section">
                          {language === LANGUAGE.VI ? nameVi : nameEn}
                          <br />
                          <span
                            style={{ color: "#0014ff", fontFamily: "initial" }}
                          >
                            <FormattedMessage id="homepage.specialty" /> -{" "}
                            {
                              item.Doctor_Infor.doctorSpecialty.specialtyData[0]
                                .name
                            }
                          </span>
                        </div>
                      </div>
                    );
                  })}

                {/* <div className='section-customize customize-outstanding-doctor'>
                                <div className='bg-image section-outstanding-doctor'></div>
                                <div className='title-section'>
                                Bác sĩ Chuyên khoa II Lê Hồng Anh<br/><span>Hô hấp - phổi</span></div>
                            </div>
                            <div className='section-customize customize-outstanding-doctor'>
                                <div className='bg-image section-outstanding-doctor'></div>
                                <div className='title-section'>
                                Bác sĩ Chuyên khoa II Lê Hồng Anh<br/><span>Hô hấp - phổi</span></div>
                            </div>
                            <div className='section-customize customize-outstanding-doctor'>
                                <div className='bg-image section-outstanding-doctor'></div>
                                <div className='title-section'>
                                Bác sĩ Chuyên khoa II Lê Hồng Anh<br/><span>Hô hấp - phổi</span></div>
                            </div>
                            <div className='section-customize customize-outstanding-doctor'>
                                <div className='bg-image section-outstanding-doctor'></div>
                                <div className='title-section'>
                                Bác sĩ Chuyên khoa II Lê Hồng Anh<br/><span>Hô hấp - phổi</span></div>
                            </div>
                            <div className='section-customize customize-outstanding-doctor'>
                                <div className='bg-image section-outstanding-doctor'></div>
                                <div className='title-section'>
                                Bác sĩ Chuyên khoa II Lê Hồng Anh<br/><span>Hô hấp - phổi</span></div>
                            </div> */}
              </Slider>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    language: state.app.language,
    isLoggedIn: state.user.isLoggedIn,
    listDoctorRedux: state.admin.listDoctor,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getTopDoctorHomeRedux: (data) => dispatch(actions.getTopDoctorHome(data)),
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(OutstandingDoctor)
);
