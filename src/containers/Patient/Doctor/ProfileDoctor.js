import React, { Component } from "react";
import { connect } from "react-redux";
import { FormattedMessage } from "react-intl";
import "./ProfileDoctor.scss";
import { getProfileDoctorById } from "../../../services/doctorServices";
import { LANGUAGE } from "../../../utils";
import { NumericFormat } from "react-number-format";
import moment from "moment";
import _ from "lodash";
import { Link } from "react-router-dom";
class DoctorInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataProfile: {},
    };
  }
  async componentDidMount() {
    console.log("123123");
    let data = await this.getDoctorInforById(this.props.doctorId);
    this.setState({
      dataProfile: data,
    });
  }

  getDoctorInforById = async (doctorId) => {
    console.log("check language", this.props.language);
    let results = {};
    if (doctorId) {
      let res = await getProfileDoctorById(doctorId, this.props.language);
      if (res && res.errCode === 0) {
        results = res.data;
      }
    }
    return results;
  };
  renderTimeBooking = (dataTime) => {
    let { language } = this.props;
    console.log("dataTime", dataTime);
    if (dataTime && !_.isEmpty(dataTime)) {
      let time =
        language === LANGUAGE.VI
          ? dataTime.timeTypeData.valueVi
          : dataTime.timeTypeData.valueEn;
      let date =
        language === LANGUAGE.VI
          ? moment.unix(+dataTime.date / 1000).format("DD/MM/YYYY")
          : moment
            .unix(+dataTime.date / 1000)
            .locale("en")
            .format("MM/DD/YYYY");
      return (
        <>
          <div>
            {time} - {date}
          </div>
          <div>
            <FormattedMessage id="patient.booking-modal.priceBooking" />
          </div>
        </>
      );
    }
    return <></>;
  };
  async componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.language !== this.props.language) {
      let data = await this.getDoctorInforById(this.props.doctorId);
      this.setState({ dataProfile: data });
    }
  }
  render() {
    let { dataProfile } = this.state;
    console.log("dataProfile", dataProfile);
    let {
      language,
      isShowDescriptionDoctor,
      dataTime,
      isShowPrice,
      isShowLinkDetail,
      doctorId,
    } = this.props;
    let nameVi = "",
      nameEn = "";
    if (dataProfile && dataProfile.positionData) {
      nameEn = `${dataProfile.positionData.valueEn}, ${dataProfile.lastName} ${dataProfile.firstName}`;
      nameVi = `${dataProfile.positionData.valueVi}, ${dataProfile.firstName} ${dataProfile.lastName} `;
    }
    return (
      <div className="doctor-infor-container">
        <div className="intro-doctor">
          <div
            className="content-left"
            style={{
              backgroundImage: `url(${dataProfile && dataProfile.image ? dataProfile.image : ""
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
              {isShowDescriptionDoctor === true ? (
                <>
                  (
                  {dataProfile &&
                    dataProfile.Markdown &&
                    dataProfile.Markdown.description && (
                      <span>{dataProfile.Markdown.description}</span>
                    )}
                  )
                </>
              ) : (
                <>{this.renderTimeBooking(dataTime)}</>
              )}
            </div>
          </div>
        </div>
        {isShowLinkDetail == true && (
          <div className="view-detail-doctor">
            <Link to={`/detail-doctor/${doctorId}`}>
              <FormattedMessage id="homepage.more-infor" />
            </Link>
          </div>
        )}
        {isShowPrice === true && (
          <div className="price">
            <FormattedMessage id="patient.booking-modal.price" />
            {dataProfile &&
              dataProfile.Doctor_Infor &&
              language === LANGUAGE.VI && (
                <NumericFormat
                  value={dataProfile.Doctor_Infor.priceTypeData.valueVi}
                  className="currency me-2"
                  displayType={"text"}
                  thousandSeparator={true}
                  suffix={"VND"}
                />
              )}
            {dataProfile &&
              dataProfile.Doctor_Infor &&
              language === LANGUAGE.EN && (
                <NumericFormat
                  value={dataProfile.Doctor_Infor.priceTypeData.valueEn}
                  className="currency me-2"
                  displayType={"text"}
                  thousandSeparator={true}
                  suffix={"$"}
                />
              )}
          </div>
        )}
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

export default connect(mapStateToProps, mapDispatchToProps)(DoctorInfo);
