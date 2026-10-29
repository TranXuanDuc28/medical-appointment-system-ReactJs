import React, { Component } from "react";
import { connect } from "react-redux";

import { FormattedMessage } from "react-intl";
import "./DetailSpecialty.scss";
import HomeHeader from "../../HomePage/HomeHeader";
import DoctorSchedule from "../Doctor/DoctorSchedule";
import DoctorExtraInfor from "../Doctor/DoctorExtraInfor";
import ProfileDoctor from "../Doctor/ProfileDoctor";
import {
  getAllDetailSpecialtyById,
  getAllCodeServices,
} from "../../../services/userServices";
import _ from "lodash";
import { LANGUAGES } from "../../../utils";
import { lang } from "moment";
class DetailSpecialty extends Component {
  constructor(props) {
    super(props);
    this.state = {
      arrDoctorId: [],
      dataDetailSpecialty: {},
      listProvince: [],
    };
  }

  async componentDidMount() {
    this.fetchSpecialtyDetail();
  }

  async fetchSpecialtyDetail() {
    if (
      this.props.match &&
      this.props.match.params &&
      this.props.match.params.id
    ) {
      let id = this.props.match.params.id;

      let res = await getAllDetailSpecialtyById({
        id: id,
        location: "ALL",
        lang: this.props.language,
      });

      let resProvince = await getAllCodeServices("PROVINCE");

      if (
        res &&
        res.errCode === 0 &&
        resProvince &&
        resProvince.errCode === 0
      ) {
        let data = res.data;
        let arrDoctorId = [];
        if (data && !_.isEmpty(res.data)) {
          let arr = data.doctorSpecialty;
          if (arr && arr.length > 0) {
            arr.sort((a, b) => a.doctorId - b.doctorId);
            arr.map((item) => {
              arrDoctorId.push(item.doctorId);
            });
          }
        }
        console.log("arrDoctorId 1", arrDoctorId);
        let dataProvince = resProvince.data;

        if (dataProvince && dataProvince.length > 0) {
          dataProvince.unshift({
            createdAt: null,
            keyMap: "ALL",
            type: "PROVINCE",
            valueEn: "ALL",
            valueVi: "Toàn quốc",
          });
        }
        this.setState({
          dataDetailSpecialty: res.data,
          arrDoctorId: arrDoctorId,
          listProvince: dataProvince ? dataProvince : [],
        });
      }
    }
  }
  async componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.language !== this.props.language) {
      this.fetchSpecialtyDetail();
    }
  }

  handleOnchangeSelect = async (event) => {
    if (
      this.props.match &&
      this.props.match.params &&
      this.props.match.params.id
    ) {
      let id = this.props.match.params.id;
      let location = event.target.value;
      let res = await getAllDetailSpecialtyById({
        id: id,
        location: location,
        lang: this.props.language,
      });
      console.log("res", res);

      if (res && res.errCode === 0) {
        let data = res.data;
        let arrDoctorId = [];
        if (data && !_.isEmpty(res.data)) {
          let arr = data.doctorSpecialty;
          if (arr && arr.length > 0) {
            arr.sort((a, b) => a.doctorId - b.doctorId);
            arr.map((item) => {
              arrDoctorId.push(item.doctorId);
            });
          }
        }
        console.log("arrDoctorId 2", arrDoctorId);

        this.setState({
          dataDetailSpecialty: res.data,
          arrDoctorId: arrDoctorId,
        });
      }
    }
  };
  render() {
    let { arrDoctorId, dataDetailSpecialty, listProvince } = this.state;
    console.log("dataDetailSpecialty", dataDetailSpecialty);
    let { language } = this.props;
    return (
      <div className="detail-specialty-container">
        <HomeHeader isShowBanner={false} />
        <div className="detail-specialty-body">
          <div className="description-specialty">
            <div className="title-detail-specialty">
              {dataDetailSpecialty && dataDetailSpecialty.specialtyData && dataDetailSpecialty.specialtyData.length > 0 && (
                <h3>
                  {dataDetailSpecialty.specialtyData[0].name}
                </h3>
              )}
            </div>
            {dataDetailSpecialty && dataDetailSpecialty.specialtyMarkdown && dataDetailSpecialty.specialtyMarkdown.length > 0 && (
              <div
                dangerouslySetInnerHTML={{
                  __html: dataDetailSpecialty.specialtyMarkdown[0].contentHTML,
                }}
              ></div>
            )}
          </div>
          <div className="search-sp-doctor">
            <select
              onChange={(event) => this.handleOnchangeSelect(event)}
              className="search-sp-doctor-select"
            >
              {listProvince &&
                listProvince.length > 0 &&
                listProvince.map((item, index) => {
                  return (
                    <option key={index} value={item.keyMap}>
                      {language === LANGUAGES.VI ? item.valueVi : item.valueEn}
                    </option>
                  );
                })}
            </select>
          </div>

          {(!dataDetailSpecialty || !dataDetailSpecialty.id) && (
            <div className="text-center py-5 text-muted">
              <i className="fa fa-info-circle fa-2x mb-3 d-block text-secondary"></i>
              <h5>Chuyên khoa không tồn tại hoặc chưa được cập nhật dữ liệu.</h5>
            </div>
          )}

          {dataDetailSpecialty &&
            dataDetailSpecialty.id &&
            (!arrDoctorId || arrDoctorId.length === 0) && (
              <div className="text-center py-4 text-muted bg-white rounded shadow-sm my-3 p-4">
                <p className="mb-0">
                  Hiện chưa có bác sĩ nào thuộc chuyên khoa này tại khu vực đã chọn.
                </p>
              </div>
            )}

          {arrDoctorId &&
            arrDoctorId.length > 0 &&
            arrDoctorId.map((item, index) => {
              return (
                <div className="each-doctor" key={index}>
                  <div className="dt-content-left">
                    <div className="profile-doctor">
                      <ProfileDoctor
                        doctorId={item}
                        isShowDescriptionDoctor={true}
                        isShowLinkDetail={true}
                        isShowPrice={true}
                        //   dataTime={dataTime}
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

export default connect(mapStateToProps, mapDispatchToProps)(DetailSpecialty);
