import React, { Component } from "react";
import { Modal } from "react-bootstrap";
import moment from "moment";
import "./ReceiptModal.scss";

// Utility to convert numbers to Vietnamese text
const UNITS = ["", " nghìn", " triệu", " tỷ"];
const DIGITS = [
  "không",
  "một",
  "hai",
  "ba",
  "bốn",
  "năm",
  "sáu",
  "bảy",
  "tám",
  "chín",
];

function readThreeDigits(threeDigits, showZeroHundred = false) {
  let hundred = Math.floor(threeDigits / 100);
  let ten = Math.floor((threeDigits % 100) / 10);
  let one = threeDigits % 10;
  let result = "";

  if (hundred > 0 || showZeroHundred) {
    result += DIGITS[hundred] + " trăm ";
    if (ten === 0 && one > 0) result += "lẻ ";
  }

  if (ten > 1) {
    result += DIGITS[ten] + " mươi ";
    if (one === 1) result += "mốt ";
    else if (one === 5) result += "lăm ";
    else if (one > 0) result += DIGITS[one] + " ";
  } else if (ten === 1) {
    result += "mười ";
    if (one === 5) result += "lăm ";
    else if (one > 0) result += DIGITS[one] + " ";
  } else if (ten === 0 && one > 0 && (hundred > 0 || showZeroHundred)) {
    result += DIGITS[one] + " ";
  } else if (ten === 0 && one > 0 && hundred === 0) {
    result += DIGITS[one] + " ";
  }

  return result.trim();
}

function numberToVietnameseWords(number) {
  if (!number || isNaN(number) || number === 0) return "Không đồng chẵn";
  let numStr = Math.round(Math.abs(number)).toString();
  let groups = [];
  while (numStr.length > 0) {
    groups.unshift(numStr.slice(-3));
    numStr = numStr.slice(0, -3);
  }

  let words = [];
  for (let i = 0; i < groups.length; i++) {
    let groupVal = parseInt(groups[i], 10);
    if (groupVal > 0) {
      let groupText = readThreeDigits(groupVal, i > 0);
      let unitIndex = groups.length - 1 - i;
      words.push(groupText + UNITS[unitIndex]);
    }
  }

  let finalStr = words.join(" ").trim();
  finalStr = finalStr.charAt(0).toUpperCase() + finalStr.slice(1) + " đồng chẵn.";
  return finalStr;
}

class ReceiptModal extends Component {
  handlePrint = () => {
    window.print();
  };

  render() {
    const { isOpen, onClose, dataReceipt } = this.props;
    if (!dataReceipt) return null;

    const patientName =
      dataReceipt.patientName ||
      `${dataReceipt.patientData?.firstName || ""} ${
        dataReceipt.patientData?.lastName || ""
      }`.trim() ||
      "Bệnh nhân";

    const patientPhone =
      dataReceipt.patientPhone ||
      dataReceipt.patientData?.phoneNumber ||
      "Chưa cập nhật";
    const patientAddress =
      dataReceipt.patientAddress ||
      dataReceipt.patientData?.address ||
      "Chưa cập nhật";
    const patientGender =
      dataReceipt.patientGender ||
      dataReceipt.patientData?.genderData?.valueVi ||
      "";

    const doctorName =
      dataReceipt.doctorName ||
      `${dataReceipt.doctorInforData?.doctorData?.firstName || ""} ${
        dataReceipt.doctorInforData?.doctorData?.lastName || ""
      }`.trim() ||
      "Bác sĩ chuyên khoa";

    const specialtyName =
      dataReceipt.specialtyName ||
      dataReceipt.doctorInforData?.specialty?.name ||
      "Khám chuyên khoa";

    const clinicName =
      dataReceipt.clinicName ||
      dataReceipt.doctorInforData?.nameClinic ||
      "Phòng khám Đa khoa BookingCare";

    const bookingId = dataReceipt.id || dataReceipt.bookingId || "BK-0000";

    let examPrice = Number(dataReceipt.examinationPrice);
    let medPrice = Number(dataReceipt.medicinePrice);

    if (isNaN(examPrice) || isNaN(medPrice) || (!examPrice && !medPrice)) {
      if (dataReceipt.bookingData?.description) {
        try {
          const parsed =
            typeof dataReceipt.bookingData.description === "string"
              ? JSON.parse(dataReceipt.bookingData.description)
              : dataReceipt.bookingData.description;
          if (parsed) {
            if (parsed.examinationFee !== undefined)
              examPrice = Number(parsed.examinationFee);
            if (parsed.medicineFee !== undefined)
              medPrice = Number(parsed.medicineFee);
          }
        } catch (e) {}
      }
    }

    const doctorExamFee =
      Number(dataReceipt.doctorInforData?.priceTypeData?.valueVi) || 300000;
    const amount = Number(
      dataReceipt.totalPrice ||
        dataReceipt.totalPrire ||
        dataReceipt.bookingData?.totalPrire ||
        (examPrice || 0) + (medPrice || 0) ||
        doctorExamFee
    );

    if (!examPrice && !medPrice) {
      if (amount > doctorExamFee) {
        examPrice = doctorExamFee;
        medPrice = amount - doctorExamFee;
      } else {
        examPrice = amount;
        medPrice = 0;
      }
    } else if (!examPrice) {
      examPrice = Math.max(0, amount - (medPrice || 0));
    }

    const timeString =
      dataReceipt.timeString ||
      dataReceipt.timeTypeDataPatient?.valueVi ||
      "Trong ngày";

    const dateFormatted = dataReceipt.date
      ? moment(Number(dataReceipt.date)).format("DD/MM/YYYY")
      : moment().format("DD/MM/YYYY");

    const paymentMethodText =
      dataReceipt.paymentMethod === "TRANSFER_QR"
        ? "Chuyển khoản QR (VietQR / PayOS)"
        : dataReceipt.paymentMethod === "CREDIT_CARD"
        ? "Thẻ ngân hàng / POS"
        : "Tiền mặt (Cash)";

    const cashierName = dataReceipt.cashier || "Thu ngân ca trực";
    const amountInWords = numberToVietnameseWords(amount);

    return (
      <Modal
        show={isOpen}
        onHide={onClose}
        size="lg"
        centered
        className="receipt-modal-container"
      >
        <div className="receipt-modal-header no-print">
          <div className="title">
            <i className="fa fa-file-text-o me-2"></i>
            <span>Biên lai thu tiền viện phí & Dịch vụ khám bệnh</span>
          </div>
          <button className="close-btn" onClick={onClose}>
            <i className="fa fa-times"></i>
          </button>
        </div>

        <div className="receipt-modal-body">
          {/* Printable Receipt Paper */}
          <div className="receipt-paper" id="printable-receipt">
            {/* Hospital Header */}
            <div className="hospital-header">
              <div className="hospital-left">
                <div className="hospital-brand">
                  <i className="fa fa-hospital-o me-2"></i>
                  <span>HỆ THỐNG Y TẾ BOOKINGCARE</span>
                </div>
                <div className="hospital-sub">{clinicName}</div>
                <div className="hospital-contact">
                  <span>
                    <i className="fa fa-map-marker me-1"></i> 20-22 Dương Quang
                    Trung, Phường 12, Quận 10, TP.HCM
                  </span>
                  <span>
                    <i className="fa fa-phone me-1"></i> Hotline: 1900-2805 |
                    Website: bookingcare.vn
                  </span>
                </div>
              </div>
              <div className="receipt-meta">
                <div className="receipt-no">
                  Số HĐ: <strong>HD-{bookingId}</strong>
                </div>
                <div className="receipt-date">
                  Ngày in: {moment().format("DD/MM/YYYY HH:mm")}
                </div>
              </div>
            </div>

            <div className="divider-double"></div>

            {/* Document Title */}
            <div className="receipt-title-box">
              <h2 className="receipt-main-title">
                PHIẾU THU TIỀN VIỆN PHÍ & DỊCH VỤ
              </h2>
              <div className="receipt-sub-title">
                (Liên 1: Lưu nội bộ / Liên 2: Giao bệnh nhân)
              </div>
            </div>

            {/* Patient & Doctor Info Grid */}
            <div className="info-grid">
              <div className="info-row">
                <div className="info-col">
                  <span className="info-label">Họ tên bệnh nhân:</span>
                  <span className="info-val patient-highlight">
                    {patientName}
                  </span>
                </div>
                <div className="info-col">
                  <span className="info-label">Giới tính:</span>
                  <span className="info-val">{patientGender || "Nam"}</span>
                </div>
              </div>

              <div className="info-row">
                <div className="info-col">
                  <span className="info-label">Số điện thoại:</span>
                  <span className="info-val">{patientPhone}</span>
                </div>
                <div className="info-col">
                  <span className="info-label">Địa chỉ:</span>
                  <span className="info-val">{patientAddress}</span>
                </div>
              </div>

              <div className="info-row">
                <div className="info-col">
                  <span className="info-label">Bác sĩ khám:</span>
                  <span className="info-val">{doctorName}</span>
                </div>
                <div className="info-col">
                  <span className="info-label">Chuyên khoa:</span>
                  <span className="info-val">{specialtyName}</span>
                </div>
              </div>

              <div className="info-row">
                <div className="info-col">
                  <span className="info-label">Thời gian khám:</span>
                  <span className="info-val">
                    {timeString} ({dateFormatted})
                  </span>
                </div>
                <div className="info-col">
                  <span className="info-label">Mã đặt hẹn (Booking):</span>
                  <span className="info-val">
                    <span className="badge-booking">#{bookingId}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Fee Breakdown Table */}
            <table className="fee-table">
              <thead>
                <tr>
                  <th style={{ width: "50px", textAlign: "center" }}>STT</th>
                  <th>Nội dung dịch vụ / Khoản thu</th>
                  <th style={{ width: "80px", textAlign: "center" }}>ĐVT</th>
                  <th style={{ width: "70px", textAlign: "center" }}>SL</th>
                  <th style={{ width: "130px", textAlign: "right" }}>Đơn giá</th>
                  <th style={{ width: "140px", textAlign: "right" }}>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ textAlign: "center" }}>1</td>
                  <td>
                    <strong>Phí khám chuyên khoa ({specialtyName})</strong>
                    <div className="service-desc">
                      Bác sĩ chỉ định: {doctorName} | Phòng khám: {clinicName}
                    </div>
                  </td>
                  <td style={{ textAlign: "center" }}>Lượt</td>
                  <td style={{ textAlign: "center" }}>1</td>
                  <td style={{ textAlign: "right" }}>
                    {examPrice.toLocaleString("vi-VN")} đ
                  </td>
                  <td style={{ textAlign: "right", fontWeight: "700" }}>
                    {examPrice.toLocaleString("vi-VN")} đ
                  </td>
                </tr>
                {medPrice > 0 && (
                  <tr>
                    <td style={{ textAlign: "center" }}>2</td>
                    <td>
                      <strong>Thuốc điều trị theo đơn bác sĩ kê</strong>
                      <div className="service-desc">
                        Toa thuốc điều trị ngoại trú theo chỉ định của bác sĩ
                      </div>
                    </td>
                    <td style={{ textAlign: "center" }}>Đơn</td>
                    <td style={{ textAlign: "center" }}>1</td>
                    <td style={{ textAlign: "right" }}>
                      {medPrice.toLocaleString("vi-VN")} đ
                    </td>
                    <td style={{ textAlign: "right", fontWeight: "700" }}>
                      {medPrice.toLocaleString("vi-VN")} đ
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="5" className="total-label">
                    TỔNG CỘNG TIỀN THANH TOÁN:
                  </td>
                  <td className="total-val">
                    {amount.toLocaleString("vi-VN")} VNĐ
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Words & Method */}
            <div className="amount-words-box">
              <div className="words-line">
                <strong>Số tiền viết bằng chữ: </strong>
                <em>{amountInWords}</em>
              </div>
              <div className="method-line">
                <strong>Hình thức thanh toán: </strong>
                <span>{paymentMethodText}</span>
              </div>
            </div>

            {/* Signature Area */}
            <div className="signature-area">
              <div className="sig-block">
                <div className="sig-title">Người nộp tiền</div>
                <div className="sig-sub">(Ký và ghi rõ họ tên)</div>
                <div className="sig-space"></div>
                <div className="sig-name">{patientName}</div>
              </div>
              <div className="sig-block">
                <div className="sig-date">
                  Ngày {moment().format("DD")} tháng {moment().format("MM")} năm{" "}
                  {moment().format("YYYY")}
                </div>
                <div className="sig-title">Người lập phiếu / Thu ngân</div>
                <div className="sig-sub">(Ký và đóng dấu)</div>
                <div className="sig-space">
                  <div className="stamp-box">ĐÃ THU TIỀN</div>
                </div>
                <div className="sig-name">{cashierName}</div>
              </div>
            </div>

            <div className="receipt-footer-note">
              * Quý khách vui lòng giữ lại biên lai này để đối chiếu khi cần
              thiết. Chúc Quý khách nhiều sức khỏe!
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="receipt-modal-footer no-print">
          <button className="btn-print" onClick={this.handlePrint}>
            <i className="fa fa-print me-2"></i> In phiếu thu
          </button>
          <button className="btn-close-receipt" onClick={onClose}>
            Đóng
          </button>
        </div>
      </Modal>
    );
  }
}

export default ReceiptModal;
