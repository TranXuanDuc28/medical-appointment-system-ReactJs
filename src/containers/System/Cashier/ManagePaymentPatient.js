import React, { Component } from "react";
import { connect } from "react-redux";
import moment from "moment";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import DatePicker from "../../../components/Input/DatePicker";
import { getAllPatientForDoctor } from "../../../services/userServices";
import PaymentModal from "./PaymentModal";
import ReceiptModal from "./ReceiptModal";
import { getSocket } from "../../../socket";
import "./ManagePaymentPatient.scss";

const socket = getSocket();

const extractFees = (item) => {
  let examFee = 0;
  let medFee = 0;
  let totalFee = 0;

  // 1. Try parse bookingData.description JSON
  if (item?.bookingData?.description) {
    try {
      const parsed =
        typeof item.bookingData.description === "string"
          ? JSON.parse(item.bookingData.description)
          : item.bookingData.description;
      if (
        parsed &&
        (parsed.examinationFee !== undefined ||
          parsed.medicineFee !== undefined ||
          parsed.totalFee !== undefined)
      ) {
        examFee = Number(parsed.examinationFee) || 0;
        medFee = Number(parsed.medicineFee) || 0;
        totalFee = Number(parsed.totalFee) || (examFee + medFee);
      }
    } catch (e) {
      // not JSON
    }
  }

  // 2. Fallback if not parsed or 0
  if (!totalFee) {
    const doctorExamFee =
      Number(item?.doctorInforData?.priceTypeData?.valueVi) || 300000;
    const cashierTotal = Number(
      item?.bookingData?.totalPrire || item?.totalPrice || item?.totalPrire
    );

    if (cashierTotal && cashierTotal > 0) {
      totalFee = cashierTotal;
      if (totalFee >= doctorExamFee) {
        examFee = doctorExamFee;
        medFee = totalFee - doctorExamFee;
      } else {
        examFee = totalFee;
        medFee = 0;
      }
    } else {
      examFee = doctorExamFee;
      medFee = 0;
      totalFee = examFee;
    }
  }

  return { examFee, medFee, totalFee };
};

class ManagePaymentPatient extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataPatient: [],
      loading: true,
      searchKeyword: "",
      statusFilter: "ALL", // 'ALL' | 'S6' | 'S5'
      dateMode: "ALL", // 'ALL' | 'DATE'
      selectedDate: moment(new Date()).startOf("day").valueOf(),

      // Payment Modal
      isOpenModal: false,
      dataModal: null,

      // Receipt Modal
      isOpenReceiptModal: false,
      dataReceipt: null,

      isShowLoading: false,
    };
  }

  async componentDidMount() {
    const { user } = this.props;

    if (user && socket) {
      if (!socket.connected) socket.connect();
      socket.emit("ADD_USER", {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        roleId: user.roleId, // R4 for cashier
      });
    }

    if (socket) {
      // Listen for payment confirmation from Webhook or other cashiers
      socket.on("PAYMENT_CONFIRMED", (data) => {
        this.setState((prevState) => ({
          dataPatient: prevState.dataPatient.map((item) =>
            String(item.id) === String(data.bookingId)
              ? {
                  ...item,
                  statusId: "S5",
                  bookingData: {
                    ...(item.bookingData || {}),
                    totalPrire: data.amount,
                    cashier: "Hệ thống xác nhận",
                    paymentMethod: "TRANSFER_QR",
                  },
                }
              : item
          ),
        }));

        toast.success(
          `Xác nhận thanh toán cho mã #${data.bookingId} (${data.patientName || ""}) số tiền ${Number(
            data.amount || 0
          ).toLocaleString("vi-VN")} đ`
        );
      });

      socket.on("PAYMENT_SENT", () => {
        this.setState({ isShowLoading: false });
        toast.success("Xác nhận thanh toán và gửi thông báo thành công!");
        this.getDataPatient();
      });

      socket.on("ERROR", ({ message }) => {
        this.setState({ isShowLoading: false });
        toast.error(message || "Đã có lỗi xảy ra!");
      });
    }

    await this.getDataPatient();
  }

  componentWillUnmount() {
    if (socket) {
      socket.off("PAYMENT_CONFIRMED");
      socket.off("PAYMENT_SENT");
      socket.off("ERROR");
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.language !== this.props.language) {
      this.getDataPatient();
    }
  }

  getDataPatient = async () => {
    const { user, language } = this.props;
    const { dateMode, selectedDate } = this.state;
    if (!user) return;

    try {
      this.setState({ loading: true });
      const queryDate =
        dateMode === "ALL" ? "ALL" : new Date(selectedDate).getTime();

      const res = await getAllPatientForDoctor({
        doctorId: user.id,
        roleId: user.roleId,
        date: queryDate,
        lang: language || "vi",
      });

      if (res && res.errCode === 0) {
        this.setState({
          dataPatient: res.data || [],
          loading: false,
        });
      } else {
        this.setState({ loading: false });
      }
    } catch (e) {
      console.error("Error fetching cashier patients:", e);
      this.setState({ loading: false });
    }
  };

  handleDateModeChange = (mode) => {
    this.setState({ dateMode: mode }, () => {
      this.getDataPatient();
    });
  };

  handleOnChangeDatePicker = (date) => {
    const newDate = date && date[0] ? date[0] : new Date();
    this.setState(
      {
        selectedDate: newDate,
        dateMode: "DATE",
      },
      () => {
        this.getDataPatient();
      }
    );
  };

  handleBtnPayment = (item) => {
    const patientName = `${item.patientData?.firstName || ""} ${
      item.patientData?.lastName || ""
    }`.trim();
    const doctorName = `${
      item.doctorInforData?.doctorData?.firstName || ""
    } ${item.doctorInforData?.doctorData?.lastName || ""}`.trim();
    const specialtyName =
      item.doctorInforData?.specialty?.name || "Khám chuyên khoa";
    const { examFee, medFee, totalFee } = extractFees(item);

    const data = {
      ...item,
      patientId: item.patientId,
      doctorId: item.doctorId,
      timeType: item.timeType,
      timeString: item.timeTypeDataPatient?.valueVi,
      date: item.date,
      email: item.patientData?.email,
      patientName: patientName,
      patientPhone: item.patientData?.phoneNumber,
      patientAddress: item.patientData?.address,
      patientGender: item.patientData?.genderData?.valueVi,
      doctorName: doctorName,
      specialtyName: specialtyName,
      clinicName:
        item.doctorInforData?.nameClinic || "Hệ thống Y tế BookingCare",
      examinationPrice: examFee,
      medicinePrice: medFee,
      totalPrice: totalFee,
    };

    this.setState({
      isOpenModal: true,
      dataModal: data,
    });
  };

  handleOpenReceipt = (item) => {
    const patientName = `${item.patientData?.firstName || ""} ${
      item.patientData?.lastName || ""
    }`.trim();
    const doctorName = `${
      item.doctorInforData?.doctorData?.firstName || ""
    } ${item.doctorInforData?.doctorData?.lastName || ""}`.trim();
    const specialtyName =
      item.doctorInforData?.specialty?.name || "Khám chuyên khoa";
    const { examFee, medFee, totalFee } = extractFees(item);

    const data = {
      ...item,
      patientName: patientName,
      patientPhone: item.patientData?.phoneNumber,
      patientAddress: item.patientData?.address,
      patientGender: item.patientData?.genderData?.valueVi,
      doctorName: doctorName,
      specialtyName: specialtyName,
      clinicName:
        item.doctorInforData?.nameClinic || "Hệ thống Y tế BookingCare",
      timeString: item.timeTypeDataPatient?.valueVi,
      examinationPrice: examFee,
      medicinePrice: medFee,
      totalPrice: totalFee,
      paymentMethod: item.bookingData?.paymentMethod || "CASH",
      cashier: item.bookingData?.cashier || "Thu ngân",
    };

    this.setState({
      isOpenReceiptModal: true,
      dataReceipt: data,
    });
  };

  handleSendPayment = async (dataChild) => {
    const { dataModal } = this.state;
    if (!dataModal) return;

    this.setState({ isShowLoading: true });
    try {
      const examPrice =
        dataChild.examinationPrice !== undefined
          ? Number(dataChild.examinationPrice)
          : Number(dataModal.examinationPrice || 0);
      const medPrice =
        dataChild.medicinePrice !== undefined
          ? Number(dataChild.medicinePrice)
          : Number(dataModal.medicinePrice || 0);
      const totalPrice = Number(
        dataChild.totalPrice || (examPrice + medPrice)
      );

      if (socket) {
        socket.emit("SEND_PAYMENT", {
          doctorId: dataModal.doctorId,
          patientId: dataModal.patientId,
          timeType: dataModal.timeType,
          patientName: dataModal.patientName,
          email: dataChild.email,
          cashier: dataChild.cashier,
          date: dataChild.date,
          language: this.props.language || "vi",
          examinationPrice: examPrice,
          medicinePrice: medPrice,
          totalPrice: totalPrice,
          paymentMethod: dataChild.paymentMethod || "CASH",
          description: dataChild.description,
        });
      }

      const cashierDesc = JSON.stringify({
        examinationFee: examPrice,
        medicineFee: medPrice,
        totalFee: totalPrice,
        note: dataChild.description || "Thanh toán viện phí",
      });

      // Optimistic state update in table
      this.setState((prevState) => ({
        dataPatient: prevState.dataPatient.map((it) =>
          it.id === dataModal.id
            ? {
                ...it,
                statusId: "S5",
                bookingData: {
                  cashier: dataChild.cashier,
                  date: String(dataChild.date),
                  totalPrire: String(totalPrice),
                  paymentMethod: dataChild.paymentMethod,
                  description: cashierDesc,
                },
              }
            : it
        ),
        isOpenModal: false,
        isShowLoading: false,
        isOpenReceiptModal: true,
        dataReceipt: {
          ...dataModal,
          examinationPrice: examPrice,
          medicinePrice: medPrice,
          totalPrice: totalPrice,
          paymentMethod: dataChild.paymentMethod,
          cashier: dataChild.cashier,
        },
      }));

      toast.success(
        "Thu tiền viện phí thành công! Đang hiển thị biên lai..."
      );
    } catch (error) {
      console.error("Error sending payment:", error);
      toast.error("Đã có lỗi xảy ra khi xử lý hóa đơn!");
      this.setState({ isShowLoading: false });
    }
  };

  render() {
    const {
      dataPatient,
      loading,
      searchKeyword,
      statusFilter,
      dateMode,
      selectedDate,
      isOpenModal,
      dataModal,
      isOpenReceiptModal,
      dataReceipt,
      isShowLoading,
    } = this.state;

    const { user } = this.props;

    // Filter calculations
    const normalizedKeyword = searchKeyword.trim().toLowerCase();
    const filteredPatients = dataPatient.filter((item) => {
      // 1. Status Filter
      if (statusFilter !== "ALL" && item.statusId !== statusFilter) {
        return false;
      }

      // 2. Search Keyword
      if (normalizedKeyword) {
        const patientName = `${item.patientData?.firstName || ""} ${
          item.patientData?.lastName || ""
        }`.toLowerCase();
        const phone = (item.patientData?.phoneNumber || "").toLowerCase();
        const address = (item.patientData?.address || "").toLowerCase();
        const doctorName = `${
          item.doctorInforData?.doctorData?.firstName || ""
        } ${item.doctorInforData?.doctorData?.lastName || ""}`.toLowerCase();
        const bookingId = String(item.id || "").toLowerCase();

        return (
          patientName.includes(normalizedKeyword) ||
          phone.includes(normalizedKeyword) ||
          address.includes(normalizedKeyword) ||
          doctorName.includes(normalizedKeyword) ||
          bookingId.includes(normalizedKeyword)
        );
      }

      return true;
    });

    // Metrics
    const totalCount = dataPatient.length;
    const waitingCount = dataPatient.filter((p) => p.statusId === "S6").length;
    const paidCount = dataPatient.filter((p) => p.statusId === "S5").length;
    const totalRevenue = dataPatient
      .filter((p) => p.statusId === "S5")
      .reduce((sum, item) => {
        const { totalFee } = extractFees(item);
        return sum + totalFee;
      }, 0);

    return (
      <div className="manage-cashier-container">
        {/* Top Header */}
        <div className="cashier-page-header">
          <div className="header-left">
            <h1 className="header-title">
              <i className="fa fa-calculator text-primary me-2"></i>
              Quản lý Viện phí & Thu ngân
            </h1>
            <p className="header-desc">
              Theo dõi hồ sơ viện phí, thu tiền tại quầy và đối soát giao dịch
              thanh toán trực tuyến theo thời gian thực
            </p>
          </div>

          <div className="header-right">
            <div className="cashier-badge">
              <div className="cashier-avatar">
                <i className="fa fa-user-circle"></i>
              </div>
              <div className="cashier-info">
                <div className="cashier-role">Thu ngân ca trực</div>
                <div className="cashier-name">
                  {user ? `${user.firstName || ""} ${user.lastName || ""}` : "Guest"}
                </div>
              </div>
              <span className="live-pill">
                <span className="live-dot"></span> Sẵn sàng
              </span>
            </div>
          </div>
        </div>

        {/* Dashboard 4 KPI Cards */}
        <div className="cashier-stats-grid">
          <div
            className={`stat-card stat-total ${
              statusFilter === "ALL" ? "card-active" : ""
            }`}
            onClick={() => this.setState({ statusFilter: "ALL" })}
          >
            <div className="stat-icon total">
              <i className="fa fa-list-alt"></i>
            </div>
            <div className="stat-content">
              <div className="stat-label">Tổng lượt bệnh nhân</div>
              <div className="stat-value">{totalCount} ca</div>
            </div>
          </div>

          <div
            className={`stat-card stat-waiting ${
              statusFilter === "S6" ? "card-active" : ""
            }`}
            onClick={() => this.setState({ statusFilter: "S6" })}
          >
            <div className="stat-icon waiting">
              <i className="fa fa-hourglass-half"></i>
            </div>
            <div className="stat-content">
              <div className="stat-label">Chờ thanh toán (S6)</div>
              <div className="stat-value text-warning">{waitingCount} ca</div>
            </div>
          </div>

          <div
            className={`stat-card stat-paid ${
              statusFilter === "S5" ? "card-active" : ""
            }`}
            onClick={() => this.setState({ statusFilter: "S5" })}
          >
            <div className="stat-icon paid">
              <i className="fa fa-check-circle"></i>
            </div>
            <div className="stat-content">
              <div className="stat-label">Đã thanh toán (S5)</div>
              <div className="stat-value text-success">{paidCount} ca</div>
            </div>
          </div>

          <div className="stat-card stat-revenue">
            <div className="stat-icon revenue">
              <i className="fa fa-money"></i>
            </div>
            <div className="stat-content">
              <div className="stat-label">Tổng doanh thu thực thu</div>
              <div className="stat-value text-primary">
                {totalRevenue.toLocaleString("vi-VN")} đ
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Toolbar */}
        <div className="cashier-toolbar">
          <div className="toolbar-left">
            {/* Search Box */}
            <div className="search-input-wrap">
              <i className="fa fa-search search-icon"></i>
              <input
                type="text"
                placeholder="Tìm theo tên bệnh nhân, SĐT, mã booking..."
                value={searchKeyword}
                onChange={(e) =>
                  this.setState({ searchKeyword: e.target.value })
                }
                className="search-input"
              />
              {searchKeyword && (
                <button
                  className="clear-search-btn"
                  onClick={() => this.setState({ searchKeyword: "" })}
                >
                  <i className="fa fa-times-circle"></i>
                </button>
              )}
            </div>

            {/* Status Filter Tabs */}
            <div className="status-tabs-wrap">
              <button
                className={`status-tab-btn ${
                  statusFilter === "ALL" ? "active" : ""
                }`}
                onClick={() => this.setState({ statusFilter: "ALL" })}
              >
                Tất cả ({totalCount})
              </button>
              <button
                className={`status-tab-btn warning ${
                  statusFilter === "S6" ? "active" : ""
                }`}
                onClick={() => this.setState({ statusFilter: "S6" })}
              >
                Chờ thu ({waitingCount})
              </button>
              <button
                className={`status-tab-btn success ${
                  statusFilter === "S5" ? "active" : ""
                }`}
                onClick={() => this.setState({ statusFilter: "S5" })}
              >
                Đã thu ({paidCount})
              </button>
            </div>
          </div>

          <div className="toolbar-right">
            {/* Date Mode Picker */}
            <div className="date-mode-toggle">
              <button
                className={`mode-btn ${dateMode === "ALL" ? "active" : ""}`}
                onClick={() => this.handleDateModeChange("ALL")}
              >
                Tất cả ngày
              </button>
              <button
                className={`mode-btn ${dateMode === "DATE" ? "active" : ""}`}
                onClick={() => this.handleDateModeChange("DATE")}
              >
                Theo ngày
              </button>
            </div>

            {dateMode === "DATE" && (
              <div className="datepicker-wrap">
                <DatePicker
                  onChange={this.handleOnChangeDatePicker}
                  className="form-control cashier-datepicker"
                  value={selectedDate}
                />
              </div>
            )}

            <button
              className="refresh-btn"
              title="Làm mới dữ liệu"
              onClick={this.getDataPatient}
            >
              <i className="fa fa-refresh"></i>
            </button>
          </div>
        </div>

        {/* Patients Table Card */}
        <div className="cashier-table-card">
          {loading ? (
            <div className="table-loading-box">
              <ClipLoader color="#0284c7" size={40} />
              <div className="mt-3 text-muted">Đang tải danh sách viện phí...</div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table cashier-table align-middle">
                <thead>
                  <tr>
                    <th style={{ width: "50px", textAlign: "center" }}>STT</th>
                    <th style={{ width: "110px" }}>Mã hồ sơ</th>
                    <th style={{ width: "160px" }}>Thời gian & Ngày</th>
                    <th>Thông tin bệnh nhân</th>
                    <th>Bác sĩ & Chuyên khoa</th>
                    <th style={{ width: "130px", textAlign: "right" }}>Viện phí</th>
                    <th style={{ width: "120px", textAlign: "center" }}>Hình thức</th>
                    <th style={{ width: "140px", textAlign: "center" }}>Trạng thái</th>
                    <th style={{ width: "150px", textAlign: "center" }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients && filteredPatients.length > 0 ? (
                    filteredPatients.map((item, index) => {
                      const patientName = `${item.patientData?.firstName || ""} ${
                        item.patientData?.lastName || ""
                      }`.trim();
                      const doctorName = `${
                        item.doctorInforData?.doctorData?.firstName || ""
                      } ${
                        item.doctorInforData?.doctorData?.lastName || ""
                      }`.trim();
                      const specialtyName =
                        item.doctorInforData?.specialty?.name || "Khám bệnh";
                      const { examFee, medFee, totalFee } = extractFees(item);

                      const dateFormatted = item.date
                        ? moment(Number(item.date)).format("DD/MM/YYYY")
                        : moment().format("DD/MM/YYYY");

                      const isPaid = item.statusId === "S5";
                      const paymentMethod =
                        item.bookingData?.paymentMethod === "TRANSFER_QR"
                          ? "Quét mã QR"
                          : "Tiền mặt";

                      return (
                        <tr key={item.id || index} className={isPaid ? "row-paid" : "row-pending"}>
                          <td style={{ textAlign: "center", fontWeight: "600", color: "#64748b" }}>
                            {index + 1}
                          </td>
                          <td>
                            <span className="booking-code-badge">
                              #{item.id}
                            </span>
                          </td>
                          <td>
                            <div className="time-val fw-bold text-dark">
                              {item.timeTypeDataPatient?.valueVi || "Trong ngày"}
                            </div>
                            <div className="date-val text-muted small">
                              {dateFormatted}
                            </div>
                          </td>
                          <td>
                            <div className="patient-main-name">
                              {patientName || "Bệnh nhân"}
                              <span className="gender-tag ms-1">
                                ({item.patientData?.genderData?.valueVi || "Nam"})
                              </span>
                            </div>
                            <div className="patient-sub-meta">
                              <span>
                                <i className="fa fa-phone me-1"></i>
                                {item.patientData?.phoneNumber || "---"}
                              </span>
                              {item.patientData?.address && (
                                <span className="ms-2">
                                  <i className="fa fa-map-marker me-1"></i>
                                  {item.patientData.address}
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="doctor-main-name">
                              👨‍⚕️ {doctorName || "Bác sĩ phụ trách"}
                            </div>
                            <div className="specialty-val">
                              {specialtyName}
                            </div>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div className="fee-main-val">
                              {totalFee.toLocaleString("vi-VN")} đ
                            </div>
                            {medFee > 0 ? (
                              <div className="text-muted small" style={{ fontSize: "11px" }}>
                                (Khám: {examFee.toLocaleString("vi-VN")} + Thuốc: {medFee.toLocaleString("vi-VN")})
                              </div>
                            ) : (
                              <div className="text-muted small" style={{ fontSize: "11px" }}>
                                (Phí khám chuyên khoa)
                              </div>
                            )}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {isPaid ? (
                              <span className="payment-method-badge">
                                <i
                                  className={`fa ${
                                    item.bookingData?.paymentMethod === "TRANSFER_QR"
                                      ? "fa-qrcode text-info"
                                      : "fa-money text-success"
                                  } me-1`}
                                ></i>
                                {paymentMethod}
                              </span>
                            ) : (
                              <span className="text-muted small">Chưa thu</span>
                            )}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {isPaid ? (
                              <span className="status-badge paid">
                                <i className="fa fa-check-circle me-1"></i> Đã thanh toán
                              </span>
                            ) : (
                              <span className="status-badge pending">
                                <i className="fa fa-clock-o me-1"></i> Chờ thanh toán
                              </span>
                            )}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {isPaid ? (
                              <button
                                className="action-btn btn-receipt"
                                title="In biên lai viện phí"
                                onClick={() => this.handleOpenReceipt(item)}
                              >
                                <i className="fa fa-print me-1"></i> In biên lai
                              </button>
                            ) : (
                              <button
                                className="action-btn btn-pay"
                                title="Thu viện phí ngay"
                                onClick={() => this.handleBtnPayment(item)}
                              >
                                <i className="fa fa-credit-card me-1"></i> Thu tiền ngay
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center py-5">
                        <div className="empty-cashier-box">
                          <i className="fa fa-inbox fa-3x text-muted mb-3"></i>
                          <div className="fw-bold fs-6 text-dark">
                            Không có hồ sơ nào phù hợp với bộ lọc
                          </div>
                          <div className="small text-muted mt-1">
                            Vui lòng thử tìm từ khóa khác hoặc chuyển sang chế độ "Tất cả ngày"
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payment Modal */}
        {isOpenModal && (
          <PaymentModal
            isOpenModal={isOpenModal}
            dataModal={dataModal}
            closePaymentModal={() =>
              this.setState({ isOpenModal: false, dataModal: null })
            }
            handleSendPayment={this.handleSendPayment}
          />
        )}

        {/* Receipt Modal */}
        {isOpenReceiptModal && (
          <ReceiptModal
            isOpen={isOpenReceiptModal}
            onClose={() =>
              this.setState({
                isOpenReceiptModal: false,
                dataReceipt: null,
              })
            }
            dataReceipt={dataReceipt}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    language: state.app.language,
    user: state.user.userInfo,
  };
};

export default connect(mapStateToProps)(ManagePaymentPatient);
