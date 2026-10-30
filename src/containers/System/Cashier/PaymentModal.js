import React, { Component } from "react";
import { connect } from "react-redux";
import { Modal } from "react-bootstrap";
import moment from "moment";
import { toast } from "react-toastify";
import { createPayOSPaymentLink } from "../../../services/userServices";
import { getSocket } from "../../../socket";
import "./PaymentModal.scss";

const socket = getSocket();

class PaymentModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: "CASH", // 'CASH' | 'QR'
      email: "",
      cashier: "",
      date: new Date().getTime(),
      examinationPrice: 300000,
      medicinePrice: 0,
      totalPrice: 300000,
      cashGiven: 300000,
      description: "",

      // PayOS VietQR
      isGeneratingQR: false,
      qrData: null,
      isQRPaid: false,
    };
  }

  componentDidMount() {
    this.initModalData();

    if (socket && !socket.hasPaymentModalListener) {
      socket.on("PAYMENT_CONFIRMED", (data) => {
        const { dataModal } = this.props;
        if (
          dataModal &&
          String(data.bookingId) === String(dataModal.id || dataModal.bookingId)
        ) {
          this.setState({ isQRPaid: true });
          toast.success(
            `Xác nhận thanh toán QR thành công cho mã BOOKING${data.bookingId}!`
          );
        }
      });
      socket.hasPaymentModalListener = true;
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.dataModal !== this.props.dataModal) {
      this.initModalData();
    }
  }

  initModalData = () => {
    const { dataModal, user } = this.props;
    if (!dataModal) return;

    const patientEmail =
      dataModal.email || dataModal.patientData?.email || "";
    const patientName =
      dataModal.patientName ||
      `${dataModal.patientData?.firstName || ""} ${
        dataModal.patientData?.lastName || ""
      }`.trim() ||
      "Bệnh nhân";

    const examinationPrice = Number(dataModal.examinationPrice) || 0;
    const medicinePrice = Number(dataModal.medicinePrice) || 0;
    const defaultPrice = Number(
      dataModal.totalPrice ||
        dataModal.totalPrire ||
        (examinationPrice + medicinePrice) ||
        dataModal.doctorInforData?.priceTypeData?.valueVi ||
        300000
    );

    const cashierName = user
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
      : "Thu ngân ca trực";

    this.setState({
      activeTab: "CASH",
      email: patientEmail,
      cashier: cashierName,
      date: new Date().getTime(),
      examinationPrice: examinationPrice,
      medicinePrice: medicinePrice,
      totalPrice: defaultPrice,
      cashGiven: defaultPrice,
      description: `Thanh toán viện phí - Mã BK#${dataModal.id || "0000"} (${patientName})`,
      isGeneratingQR: false,
      qrData: null,
      isQRPaid: false,
    });
  };

  handleGeneratePayOSQR = async () => {
    const { dataModal } = this.props;
    const { totalPrice } = this.state;
    if (!dataModal) return;

    try {
      this.setState({ isGeneratingQR: true });
      const bookingId = dataModal.id || dataModal.bookingId;
      const res = await createPayOSPaymentLink({
        bookingId: bookingId,
        amount: Number(totalPrice) || 300000,
        description: `BOOKING${bookingId}`.slice(0, 25),
      });

      if (res && res.errCode === 0 && res.data) {
        this.setState({
          qrData: res.data,
          isGeneratingQR: false,
        });
        toast.info("Đã tạo mã QR PayOS! Vui lòng hướng dẫn bệnh nhân quét mã.");
      } else {
        this.setState({ isGeneratingQR: false });
        toast.error(res?.errMessage || "Không thể tạo mã QR PayOS lúc này!");
      }
    } catch (e) {
      console.error("PayOS QR generation error:", e);
      this.setState({ isGeneratingQR: false });
      toast.error("Có lỗi xảy ra khi tạo mã QR PayOS!");
    }
  };

  handleSetCashGiven = (amount) => {
    this.setState({ cashGiven: amount });
  };

  handleConfirmCashPayment = () => {
    const { totalPrice, cashGiven, cashier, description, email, date, examinationPrice, medicinePrice } =
      this.state;

    if (Number(cashGiven) < Number(totalPrice)) {
      toast.warn(
        "Số tiền khách đưa chưa đủ để thanh toán viện phí! Vui lòng kiểm tra lại."
      );
      return;
    }

    this.props.handleSendPayment({
      email: email,
      cashier: cashier,
      date: date,
      examinationPrice: Number(examinationPrice || 0),
      medicinePrice: Number(medicinePrice || 0),
      totalPrice: Number(totalPrice),
      paymentMethod: "CASH",
      description: description,
    });
  };

  handleConfirmQRPaymentManual = () => {
    const { totalPrice, cashier, description, email, date, examinationPrice, medicinePrice } = this.state;
    this.props.handleSendPayment({
      email: email,
      cashier: cashier,
      date: date,
      examinationPrice: Number(examinationPrice || 0),
      medicinePrice: Number(medicinePrice || 0),
      totalPrice: Number(totalPrice),
      paymentMethod: "TRANSFER_QR",
      description: description || "Thanh toán quét mã QR PayOS",
    });
  };

  render() {
    const { isOpenModal, closePaymentModal, dataModal } = this.props;
    if (!isOpenModal || !dataModal) return null;

    const {
      activeTab,
      examinationPrice,
      medicinePrice,
      totalPrice,
      cashGiven,
      description,
      cashier,
      isGeneratingQR,
      qrData,
      isQRPaid,
    } = this.state;

    const patientName =
      dataModal.patientName ||
      `${dataModal.patientData?.firstName || ""} ${
        dataModal.patientData?.lastName || ""
      }`.trim() ||
      "Bệnh nhân";

    const patientPhone =
      dataModal.patientPhone ||
      dataModal.patientData?.phoneNumber ||
      "Chưa cập nhật";
    const doctorName =
      dataModal.doctorName ||
      `${dataModal.doctorInforData?.doctorData?.firstName || ""} ${
        dataModal.doctorInforData?.doctorData?.lastName || ""
      }`.trim() ||
      "Bác sĩ chuyên khoa";

    const specialtyName =
      dataModal.specialtyName ||
      dataModal.doctorInforData?.specialty?.name ||
      "Khám chuyên khoa";

    const bookingId = dataModal.id || dataModal.bookingId || "BK-0000";
    const changeDue = Math.max(0, Number(cashGiven) - Number(totalPrice));
    const isUnderpaid = Number(cashGiven) < Number(totalPrice);

    return (
      <Modal
        show={isOpenModal}
        onHide={closePaymentModal}
        size="lg"
        centered
        className="payment-modal-container"
      >
        <div className="payment-modal-header">
          <div className="title">
            <i className="fa fa-credit-card me-2"></i>
            <span>Thu viện phí & Xác nhận thanh toán</span>
          </div>
          <button className="close-btn" onClick={closePaymentModal}>
            <i className="fa fa-times"></i>
          </button>
        </div>

        <div className="payment-modal-body">
          {/* Patient & Booking Summary Card */}
          <div className="patient-summary-card">
            <div className="summary-left">
              <div className="patient-name">
                <i className="fa fa-user-circle me-1"></i> {patientName}
                <span className="booking-tag">#BK{bookingId}</span>
              </div>
              <div className="patient-meta">
                <span>
                  <i className="fa fa-phone me-1"></i> {patientPhone}
                </span>
                <span>
                  <i className="fa fa-user-md me-1"></i> {doctorName}
                </span>
                <span>
                  <i className="fa fa-stethoscope me-1"></i> {specialtyName}
                </span>
              </div>
            </div>
            <div className="summary-right">
              <div className="fee-breakdown-box">
                <div className="fee-breakdown-row">
                  <span className="fee-lbl">Phí khám:</span>
                  <span className="fee-val">
                    {Number(examinationPrice || 0).toLocaleString("vi-VN")} đ
                  </span>
                </div>
                {medicinePrice > 0 && (
                  <div className="fee-breakdown-row">
                    <span className="fee-lbl">Tiền thuốc:</span>
                    <span className="fee-val">
                      {Number(medicinePrice).toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                )}
                <div className="fee-breakdown-row total-row">
                  <span className="fee-lbl">Tổng viện phí:</span>
                  <span className="fee-val total-amount">
                    {Number(totalPrice).toLocaleString("vi-VN")} đ
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Tabs */}
          <div className="payment-method-tabs">
            <button
              className={`method-tab-btn ${activeTab === "CASH" ? "active" : ""}`}
              onClick={() => this.setState({ activeTab: "CASH" })}
            >
              <i className="fa fa-money me-2"></i>
              <span>1. Tiền mặt tại quầy</span>
            </button>
            <button
              className={`method-tab-btn ${activeTab === "QR" ? "active" : ""}`}
              onClick={() => {
                this.setState({ activeTab: "QR" });
                if (!qrData && !isGeneratingQR) {
                  this.handleGeneratePayOSQR();
                }
              }}
            >
              <i className="fa fa-qrcode me-2"></i>
              <span>2. Quét mã QR (PayOS / VietQR)</span>
            </button>
          </div>

          {/* TAB 1: TIỀN MẶT */}
          {activeTab === "CASH" && (
            <div className="cash-payment-form">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold small text-muted">
                    Số tiền viện phí cần thu (VNĐ)
                  </label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control fw-bold text-primary"
                      value={totalPrice}
                      onChange={(e) =>
                        this.setState({
                          totalPrice: Number(e.target.value) || 0,
                        })
                      }
                    />
                    <span className="input-group-text">đ</span>
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold small text-muted">
                    Số tiền khách đưa (VNĐ)
                  </label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control fw-bold"
                      value={cashGiven}
                      onChange={(e) =>
                        this.setState({
                          cashGiven: Number(e.target.value) || 0,
                        })
                      }
                    />
                    <span className="input-group-text">đ</span>
                  </div>
                </div>
              </div>

              {/* Quick Cash Chips */}
              <div className="quick-cash-row">
                <span className="quick-cash-label">Gợi ý nhanh:</span>
                <button
                  type="button"
                  className="chip-btn"
                  onClick={() => this.handleSetCashGiven(totalPrice)}
                >
                  Đúng {totalPrice.toLocaleString("vi-VN")} đ
                </button>
                <button
                  type="button"
                  className="chip-btn"
                  onClick={() => this.handleSetCashGiven(500000)}
                >
                  500.000 đ
                </button>
                <button
                  type="button"
                  className="chip-btn"
                  onClick={() => this.handleSetCashGiven(1000000)}
                >
                  1.000.000 đ
                </button>
                <button
                  type="button"
                  className="chip-btn"
                  onClick={() => this.handleSetCashGiven(2000000)}
                >
                  2.000.000 đ
                </button>
              </div>

              {/* Change Calculation Box */}
              <div
                className={`change-calc-box ${
                  isUnderpaid ? "underpaid" : "paid-ok"
                }`}
              >
                {isUnderpaid ? (
                  <div className="calc-alert text-danger">
                    <i className="fa fa-exclamation-triangle me-2"></i>
                    Khách còn thiếu:{" "}
                    <strong>
                      {(totalPrice - cashGiven).toLocaleString("vi-VN")} đ
                    </strong>
                  </div>
                ) : (
                  <div className="calc-alert text-success">
                    <i className="fa fa-check-circle me-2"></i>
                    Tiền thừa thối lại cho bệnh nhân:{" "}
                    <strong className="change-highlight">
                      {changeDue.toLocaleString("vi-VN")} đ
                    </strong>
                  </div>
                )}
              </div>

              <div className="row g-3 mt-2">
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">
                    Người thu tiền (Thu ngân)
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={cashier}
                    onChange={(e) => this.setState({ cashier: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">
                    Nội dung thu
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={description}
                    onChange={(e) =>
                      this.setState({ description: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: QUÉT MÃ QR (PAYOS / VIETQR) */}
          {activeTab === "QR" && (
            <div className="qr-payment-container">
              {isQRPaid ? (
                <div className="qr-success-box">
                  <div className="success-icon">
                    <i className="fa fa-check-circle"></i>
                  </div>
                  <h4 className="success-title">Thanh toán thành công!</h4>
                  <p className="success-sub">
                    Hệ thống đã nhận được giao dịch chuyển khoản cho hồ sơ khám{" "}
                    <strong>#BK{bookingId}</strong>.
                  </p>
                  <button
                    className="btn btn-success mt-2"
                    onClick={closePaymentModal}
                  >
                    Hoàn tất & Đóng
                  </button>
                </div>
              ) : isGeneratingQR ? (
                <div className="qr-loading-box">
                  <i className="fa fa-spinner fa-spin fa-2x text-primary mb-3"></i>
                  <div>Đang khởi tạo mã QR PayOS theo thời gian thực...</div>
                </div>
              ) : qrData ? (
                <div className="qr-display-grid">
                  <div className="qr-image-wrapper">
                    <img
                      src={`https://img.vietqr.io/image/${qrData.bin}-${
                        qrData.accountNumber
                      }-compact2.png?amount=${totalPrice}&addInfo=${encodeURIComponent(
                        qrData.description
                      )}&accountName=${encodeURIComponent(
                        qrData.accountName || "TRAN XUAN DUC"
                      )}`}
                      alt="PayOS VietQR"
                      className="vietqr-img"
                    />
                    <div className="qr-scan-badge">
                      <i className="fa fa-camera me-1"></i> Quét bằng mọi App
                      Ngân hàng
                    </div>
                  </div>

                  <div className="qr-details">
                    <h5 className="qr-detail-title">
                      Thông tin chuyển khoản PayOS
                    </h5>
                    <div className="qr-detail-row">
                      <span className="lbl">Số tài khoản:</span>
                      <span className="val fw-bold text-primary">
                        {qrData.accountNumber}
                      </span>
                    </div>
                    <div className="qr-detail-row">
                      <span className="lbl">Chủ tài khoản:</span>
                      <span className="val fw-bold">{qrData.accountName}</span>
                    </div>
                    <div className="qr-detail-row">
                      <span className="lbl">Số tiền:</span>
                      <span className="val fw-bold text-danger fs-6">
                        {Number(totalPrice).toLocaleString("vi-VN")} đ
                      </span>
                    </div>
                    <div className="qr-detail-row">
                      <span className="lbl">Nội dung CK:</span>
                      <span className="val badge bg-light text-dark border">
                        {qrData.description}
                      </span>
                    </div>

                    <div className="waiting-pulse">
                      <div className="pulse-dot"></div>
                      <span>
                        Hệ thống đang tự động lắng nghe giao dịch chuyển khoản...
                      </span>
                    </div>

                    <div className="manual-confirm-box mt-3">
                      <div className="small text-muted mb-2">
                        Nếu bệnh nhân đã chuyển khoản thành công nhưng mạng chậm:
                      </div>
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={this.handleConfirmQRPaymentManual}
                      >
                        <i className="fa fa-check me-1"></i> Xác nhận thủ công đã
                        nhận tiền QR
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-4">
                  <p className="text-muted mb-3">
                    Bấm nút bên dưới để tạo mã QR thanh toán PayOS cho ca khám
                    này:
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={this.handleGeneratePayOSQR}
                  >
                    <i className="fa fa-qrcode me-2"></i> Tạo mã QR PayOS
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="payment-modal-footer">
          {activeTab === "CASH" && (
            <button
              className="btn-confirm-pay"
              disabled={isUnderpaid}
              onClick={this.handleConfirmCashPayment}
            >
              <i className="fa fa-check-circle me-2"></i>
              Xác nhận đã thu tiền mặt
            </button>
          )}
          <button className="btn-cancel-modal" onClick={closePaymentModal}>
            Đóng
          </button>
        </div>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    language: state.app.language,
    user: state.user.userInfo,
  };
};

export default connect(mapStateToProps)(PaymentModal);
