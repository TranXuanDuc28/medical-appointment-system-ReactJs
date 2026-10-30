import React, { Component } from "react";
import { connect } from "react-redux";
import * as actions from "../../../store/actions";
import { CRUD_ACTION, LANGUAGE } from "../../../utils";
import Select from "react-select";
import { ToastContainer, toast } from "react-toastify";
import "../../../utils/constant";
import {
  getScheduleDoctorByDate,
  getExtraDoctorInforByIdServices,
} from "../../../services/doctorServices";
import { FormattedMessage } from "react-intl";
import "./DoctorExtraInfor.scss";
import { NumericFormat } from "react-number-format";
import { LANGUAGES } from "../../../utils";

class DoctorExtraInfor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showDoctorExtraInfor: false,
      extraInfor: {},
    };
  }

  async componentDidMount() {
    if (this.props.doctorIdFromParent) {
      let res = await getExtraDoctorInforByIdServices(
        this.props.doctorIdFromParent,
        this.props.language
      );
      if (res && res.errCode === 0) {
        this.setState({
          extraInfor: res.data || {},
        });
      }
    }
  }

  async componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.language !== this.props.language) {
      let res = await getExtraDoctorInforByIdServices(
        this.props.doctorIdFromParent,
        this.props.language
      );
      if (res && res.errCode === 0) {
        this.setState({
          extraInfor: res.data || {},
        });
      }
    }
    if (prevProps.doctorIdFromParent !== this.props.doctorIdFromParent) {
      let res = await getExtraDoctorInforByIdServices(
        this.props.doctorIdFromParent,
        this.props.language
      );
      if (res && res.errCode === 0) {
        this.setState({
          extraInfor: res.data || {},
        });
      }
    }
  }

  showDoctorExtraInfor = (status) => {
    this.setState({
      showDoctorExtraInfor: status,
    });
  };

  render() {
    let { showDoctorExtraInfor, extraInfor } = this.state;
    let { language } = this.props;

    return (
      <div className="doctor-extra-infor-container">
        <div className="content-up">
          <div className="text-address">
            <i className="fas fa-map-marked-alt text-icon"></i>
            <FormattedMessage id="patient.extra-infor-doctor.text-address" />
          </div>
          <div className="name-clinic">
            <i className="fas fa-hospital me-2 clinic-icon"></i>
            {extraInfor && extraInfor.nameClinic ? extraInfor.nameClinic : ""}
          </div>
          <div className="detail-address">
            <i className="fas fa-location-arrow me-2 address-icon"></i>
            {extraInfor && extraInfor.addressClinic
              ? extraInfor.addressClinic
              : ""}
          </div>
        </div>

        <div className="content-down">
          {!showDoctorExtraInfor ? (
            <div className="short-price-box">
              <span className="price-title">
                <FormattedMessage id="patient.extra-infor-doctor.price" />
              </span>
              <span className="price-amount">
                {extraInfor &&
                  extraInfor.priceTypeData &&
                  language === LANGUAGE.VI && (
                    <NumericFormat
                      value={extraInfor.priceTypeData.valueVi}
                      displayType={"text"}
                      thousandSeparator={"."}
                      decimalSeparator={","}
                      suffix={" VNĐ"}
                    />
                  )}
                {extraInfor &&
                  extraInfor.priceTypeData &&
                  language === LANGUAGE.EN && (
                    <NumericFormat
                      value={extraInfor.priceTypeData.valueEn}
                      displayType={"text"}
                      thousandSeparator={","}
                      prefix={"$"}
                    />
                  )}
              </span>
              <button
                type="button"
                className="btn-toggle-price"
                onClick={() => this.showDoctorExtraInfor(true)}
              >
                <FormattedMessage id="patient.extra-infor-doctor.detail" />
                <i className="fas fa-chevron-down ms-1"></i>
              </button>
            </div>
          ) : (
            <div className="expanded-price-box">
              <div className="price-header">
                <span className="title-price">
                  <i className="fas fa-file-invoice-dollar me-2 text-primary"></i>
                  <FormattedMessage id="patient.extra-infor-doctor.price" />
                </span>
                <button
                  type="button"
                  className="btn-hide-price"
                  onClick={() => this.showDoctorExtraInfor(false)}
                >
                  <FormattedMessage id="patient.extra-infor-doctor.hide-price" />
                  <i className="fas fa-chevron-up ms-1"></i>
                </button>
              </div>

              <div className="detail-price-card">
                <div className="price-row">
                  <span className="left-label">
                    <FormattedMessage id="patient.extra-infor-doctor.price" />
                  </span>
                  <span className="right-value">
                    {extraInfor &&
                      extraInfor.priceTypeData &&
                      language === LANGUAGE.VI && (
                        <NumericFormat
                          value={extraInfor.priceTypeData.valueVi}
                          displayType={"text"}
                          thousandSeparator={"."}
                          decimalSeparator={","}
                          suffix={" VNĐ"}
                        />
                      )}
                    {extraInfor &&
                      extraInfor.priceTypeData &&
                      language === LANGUAGE.EN && (
                        <NumericFormat
                          value={extraInfor.priceTypeData.valueEn}
                          displayType={"text"}
                          thousandSeparator={","}
                          prefix={"$"}
                        />
                      )}
                  </span>
                </div>
                {extraInfor && extraInfor.note && (
                  <div className="price-note">
                    <i className="fas fa-info-circle me-1"></i>
                    {extraInfor.note}
                  </div>
                )}
              </div>

              <div className="insurance-box">
                <div className="insurance-title">
                  <i className="fas fa-shield-alt me-2 text-success"></i>
                  <FormattedMessage id="patient.extra-infor-doctor.insurance-title" />
                </div>
                <div className="insurance-desc">
                  <FormattedMessage id="patient.extra-infor-doctor.insurance-desc" />
                </div>
              </div>

              <div className="payment-box">
                <div className="payment-title">
                  <i className="fas fa-credit-card me-2 text-info"></i>
                  <FormattedMessage id="patient.extra-infor-doctor.payment" />
                </div>
                <div className="payment-methods">
                  <span className="payment-badge">
                    <i className="fas fa-money-bill-wave me-1"></i>
                    {extraInfor.paymentTypeData &&
                      (language === LANGUAGE.VI
                        ? extraInfor.paymentTypeData.valueVi
                        : extraInfor.paymentTypeData.valueEn)}
                  </span>
                  <span className="payment-badge">
                    <i className="fas fa-qrcode me-1"></i>
                    {language === LANGUAGE.VI
                      ? "Chuyển khoản QR (PayOS)"
                      : "QR Bank Transfer"}
                  </span>
                </div>
              </div>
            </div>
          )}
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

export default connect(mapStateToProps, mapDispatchToProps)(DoctorExtraInfor);
