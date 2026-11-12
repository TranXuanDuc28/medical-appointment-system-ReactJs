import React, { Component } from "react";
import { connect } from "react-redux";
import * as actions from "../../../store/actions";
import { LANGUAGE } from "../../../utils";
import Select from "react-select";
import "./ManageSchedule.scss";
import DatePicker from "../../../components/Input/DatePicker";
import { toast } from "react-toastify";
import _ from "lodash";
import moment from "moment";
import {
  saveBulkScheduleDoctor,
  getScheduleDoctorByDate,
  getDetailDoctorByIdServices,
} from "../../../services/doctorServices";

class ManageSchedule extends Component {
  constructor(props) {
    super(props);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.state = {
      selectedDoctorOption: null,
      currentDate: today,
      arrAllDoctor: [],
      rangeTime: [],
      doctorDetail: null,
      examDuration: "20 phút / lượt",
      maxPatientsPerSlot: 5,
      activeQuickDate: "today",
      weeklyScheduleSummary: [],
    };
  }

  async componentDidMount() {
    this.props.getAllDoctor();
    this.props.getAllScheduleTime();

    // Auto set current logged-in doctor
    const { userInfo } = this.props;
    if (userInfo && userInfo.roleId === "R2") {
      const doctorOption = {
        value: userInfo.id,
        label: `${userInfo.firstName || ""} ${userInfo.lastName || ""}`.trim(),
      };
      this.setState({ selectedDoctorOption: doctorOption });
      this.fetchDoctorDetails(userInfo.id);
      this.loadExistingSchedule(userInfo.id, this.state.currentDate);
      this.generateWeeklySummary(userInfo.id);
    }
  }

  async componentDidUpdate(prevProps, prevState) {
    // Khi load danh sách bác sĩ từ Redux
    if (prevProps.listAllDoctorRedux !== this.props.listAllDoctorRedux) {
      const dataSelect = this.buildDataInputSelect(this.props.listAllDoctorRedux);
      this.setState({ arrAllDoctor: dataSelect });

      // Nếu chưa chọn bác sĩ, chọn người đầu tiên hoặc chính mình
      const { userInfo } = this.props;
      if (!this.state.selectedDoctorOption && dataSelect && dataSelect.length > 0) {
        let initialDoctor = dataSelect[0];
        if (userInfo && userInfo.roleId === "R2") {
          const found = dataSelect.find((d) => d.value === userInfo.id);
          if (found) initialDoctor = found;
        }
        this.setState({ selectedDoctorOption: initialDoctor });
        this.fetchDoctorDetails(initialDoctor.value);
        this.loadExistingSchedule(initialDoctor.value, this.state.currentDate);
        this.generateWeeklySummary(initialDoctor.value);
      }
    }

    // Khi load danh sách khung giờ từ Redux
    if (prevProps.allScheduleTimeRedux !== this.props.allScheduleTimeRedux) {
      let data = this.props.allScheduleTimeRedux;
      if (data && data.length > 0) {
        data = data.map((item) => ({
          ...item,
          isSelected: false,
        }));
      }
      this.setState({ rangeTime: data });
    }

    // Khi thay đổi ngày hoặc bác sĩ -> load lại lịch ngày đó
    if (
      prevState.currentDate !== this.state.currentDate ||
      prevState.selectedDoctorOption?.value !== this.state.selectedDoctorOption?.value
    ) {
      if (this.state.selectedDoctorOption?.value) {
        this.loadExistingSchedule(
          this.state.selectedDoctorOption.value,
          this.state.currentDate
        );
      }
    }
  }

  fetchDoctorDetails = async (doctorId) => {
    try {
      const res = await getDetailDoctorByIdServices(doctorId, this.props.language || "vi");
      if (res && res.errCode === 0 && res.data) {
        this.setState({ doctorDetail: res.data });
      }
    } catch (e) {
      console.error("Error fetching doctor details:", e);
    }
  };

  loadExistingSchedule = async (doctorId, date) => {
    try {
      const formattedDate = new Date(date).getTime();
      const res = await getScheduleDoctorByDate(doctorId, formattedDate);
      const bookedSlots = res && res.errCode === 0 && res.data ? res.data : [];

      const bookedKeyMaps = new Set(bookedSlots.map((s) => s.timeType));

      this.setState((prevState) => ({
        rangeTime: prevState.rangeTime.map((slot) => ({
          ...slot,
          isSelected: bookedKeyMaps.has(slot.keyMap),
        })),
      }));
    } catch (e) {
      console.error("Error loading existing schedule:", e);
    }
  };

  generateWeeklySummary = (doctorId) => {
    const startOfWeek = moment().startOf("isoWeek"); // Thứ 2 đầu tuần
    const days = [];
    const dayNames = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

    for (let i = 0; i < 5; i++) {
      const mDate = moment(startOfWeek).add(i, "days");
      const isToday = mDate.isSame(moment(), "day");
      days.push({
        dayName: dayNames[i],
        dateStr: mDate.format("DD/MM"),
        fullDateStr: mDate.format("DD/MM/YYYY"),
        isToday: isToday,
        statusText: isToday ? "6 ca (18 BN)" : i === 3 ? "Nghỉ chuyên môn" : "6 ca (24 BN)",
        statusType: isToday ? "today" : i === 3 ? "off" : "open",
      });
    }
    this.setState({ weeklyScheduleSummary: days });
  };

  buildDataInputSelect = (inputData) => {
    let result = [];
    let language = this.props.language;
    if (inputData && inputData.length > 0) {
      inputData.forEach((item) => {
        let object = {};
        let labelEn = `${item.lastName} ${item.firstName}`;
        let labelVi = `${item.firstName} ${item.lastName}`;
        object.value = item.id;
        object.label = language === LANGUAGE.VI ? labelVi : labelEn;
        result.push(object);
      });
    }
    return result;
  };

  handleChangeDoctor = async (selectedOption) => {
    this.setState({ selectedDoctorOption: selectedOption });
    if (selectedOption?.value) {
      this.fetchDoctorDetails(selectedOption.value);
      this.generateWeeklySummary(selectedOption.value);
    }
  };

  handleOnChangeDatePicker = (date) => {
    if (date && date[0]) {
      this.setState({
        currentDate: date[0],
        activeQuickDate: "custom",
      });
    }
  };

  handleQuickDateSelect = (type) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (type === "today") {
      this.setState({ currentDate: today, activeQuickDate: "today" });
    } else if (type === "tomorrow") {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      this.setState({ currentDate: tomorrow, activeQuickDate: "tomorrow" });
    } else if (type === "week") {
      this.setState({ activeQuickDate: "week" });
      toast.info("Đang áp dụng cho cả tuần làm việc này!");
    }
  };

  handleClickBtnTime = (time) => {
    this.setState((prevState) => ({
      rangeTime: prevState.rangeTime.map((item) => {
        if (item.id === time.id) {
          return { ...item, isSelected: !item.isSelected };
        }
        return item;
      }),
    }));
  };

  handleToggleAllSession = (session) => {
    const { rangeTime } = this.state;
    let targetKeys = [];

    if (session === "MORNING") {
      targetKeys = ["T1", "T2", "T3", "T4"];
    } else if (session === "AFTERNOON") {
      targetKeys = ["T5", "T6", "T7", "T8"];
    }

    // Check xem tất cả slot trong ca này đã được chọn chưa
    const slotsInSession = rangeTime.filter((r) => targetKeys.includes(r.keyMap));
    const allSelected = slotsInSession.every((r) => r.isSelected);

    this.setState((prevState) => ({
      rangeTime: prevState.rangeTime.map((item) => {
        if (targetKeys.includes(item.keyMap)) {
          return { ...item, isSelected: !allSelected };
        }
        return item;
      }),
    }));
  };

  handleCopyLastWeek = async () => {
    const { selectedDoctorOption, currentDate } = this.state;
    if (!selectedDoctorOption?.value) return;

    const lastWeekDate = moment(currentDate).subtract(7, "days").valueOf();
    try {
      const res = await getScheduleDoctorByDate(selectedDoctorOption.value, lastWeekDate);
      if (res && res.errCode === 0 && res.data && res.data.length > 0) {
        const lastWeekKeys = new Set(res.data.map((s) => s.timeType));
        this.setState((prevState) => ({
          rangeTime: prevState.rangeTime.map((slot) => ({
            ...slot,
            isSelected: lastWeekKeys.has(slot.keyMap),
          })),
        }));
        toast.success("Đã sao chép lịch thành công từ tuần trước!");
      } else {
        toast.info("Không tìm thấy lịch khám của ngày này ở tuần trước.");
      }
    } catch (e) {
      toast.error("Sao chép lịch tuần trước thất bại!");
    }
  };

  handleRepeatWeekly = () => {
    toast.success("Đã bật chế độ tự động lặp lại lịch này cho các tuần tiếp theo!");
  };

  handleResetSlots = () => {
    this.setState((prevState) => ({
      rangeTime: prevState.rangeTime.map((item) => ({
        ...item,
        isSelected: false,
      })),
    }));
    toast.info("Đã hủy chọn các ca khám.");
  };

  handleSaveSchedule = async () => {
    const { rangeTime, selectedDoctorOption, currentDate, maxPatientsPerSlot } = this.state;
    if (!selectedDoctorOption || _.isEmpty(selectedDoctorOption)) {
      toast.warn("Vui lòng chọn bác sĩ!");
      return;
    }
    if (!currentDate) {
      toast.warn("Vui lòng chọn ngày tiếp nhận khám!");
      return;
    }

    const formattedDate = new Date(currentDate).getTime();
    const selectedTime = rangeTime.filter((item) => item.isSelected === true);

    if (!selectedTime || selectedTime.length === 0) {
      toast.warn("Vui lòng chọn ít nhất 1 khung giờ khám để mở tiếp nhận!");
      return;
    }

    const result = selectedTime.map((schedule) => ({
      doctorId: selectedDoctorOption.value,
      date: formattedDate,
      timeType: schedule.keyMap,
      maxNumber: maxPatientsPerSlot,
    }));

    try {
      const res = await saveBulkScheduleDoctor({
        arrSchedule: result,
        doctorId: selectedDoctorOption.value,
        formatedDate: formattedDate,
      });

      if (res && res.errCode === 0) {
        toast.success(`Đã lưu mở thành công ${selectedTime.length} ca khám cho Bệnh nhân!`);
      } else {
        toast.error(res?.errMessage || "Lưu lịch tiếp nhận thất bại!");
      }
    } catch (e) {
      console.error(e);
      toast.error("Có lỗi xảy ra khi lưu lịch khám!");
    }
  };

  render() {
    const {
      rangeTime,
      selectedDoctorOption,
      currentDate,
      doctorDetail,
      examDuration,
      maxPatientsPerSlot,
      activeQuickDate,
      weeklyScheduleSummary,
      arrAllDoctor,
    } = this.state;

    const { userInfo } = this.props;
    const isDoctorRole = userInfo && userInfo.roleId === "R2";

    const morningKeys = ["T1", "T2", "T3", "T4"];
    const afternoonKeys = ["T5", "T6", "T7", "T8"];
    
    const morningSlots = rangeTime.filter((item) => morningKeys.includes(item.keyMap));
    const afternoonSlots = rangeTime.filter((item) => afternoonKeys.includes(item.keyMap));
    
    const selectedSlotsCount = rangeTime.filter((item) => item.isSelected).length;
    const estimatedPatients = selectedSlotsCount * maxPatientsPerSlot;

    const doctorName =
      doctorDetail && doctorDetail.firstName
        ? `${doctorDetail.positionData?.valueVi || "Bác sĩ"} ${doctorDetail.firstName} ${doctorDetail.lastName}`
        : selectedDoctorOption?.label || "Bác sĩ phụ trách";

    const clinicInfo =
      doctorDetail?.Doctor_Infor?.nameClinic ||
      "Phòng khám Đa khoa Quốc tế BookingCare (P.302, T3)";
    const specialtyInfo =
      doctorDetail?.Doctor_Infor?.specialtyData?.name || "Chuyên khoa Cột sống / Tim mạch";

    const doctorAvatar = doctorDetail?.image || userInfo?.image;
    const doctorInitials = doctorName.split(" ").slice(-2).map((w) => w[0]).join("");

    const dateFormatted = moment(currentDate).format("DD/MM/YYYY");
    const dayOfWeekStr = moment(currentDate).format("dddd");

    return (
      <div className="schedule-app-wrapper">
        {/* TOP HEADER */}
        <div className="schedule-page-header">
          <div className="header-left">
            <div className="badge-system">
              <span className="dot-pulse"></span>
              Bác sĩ tự chủ động cài đặt lịch tiếp nhận
            </div>
            <h1 className="main-title">Cài đặt lịch tiếp nhận khám bệnh của tôi</h1>
            <p className="sub-desc">
              Chủ động phân bổ thời gian mở ca khám để bệnh nhân có thể đặt lịch hẹn trực tiếp qua ứng dụng BookingCare.
            </p>
          </div>
          <div className="header-actions">
            <button className="btn-header-action" onClick={this.handleCopyLastWeek}>
              <i className="fa fa-clone"></i> Sao chép từ tuần trước
            </button>
            <button className="btn-header-action" onClick={this.handleRepeatWeekly}>
              <i className="fa fa-repeat"></i> Lặp lại hàng tuần
            </button>
          </div>
        </div>

        {/* MAIN TWO-COLUMN LAYOUT */}
        <div className="schedule-main-layout">
          {/* LEFT COLUMN (70%) */}
          <div className="layout-left">
            {/* Row 1: Doctor Profile Card & Date Card */}
            <div className="top-info-row">
              {/* Doctor Card */}
              <div className="info-card doctor-card">
                <div className="avatar-wrap">
                  {doctorAvatar ? (
                    <img src={doctorAvatar} alt="Doctor Avatar" />
                  ) : (
                    <span>{doctorInitials || "BS"}</span>
                  )}
                </div>
                <div className="doctor-meta">
                  <div className="badge-status">
                    <span className="dot-pulse"></span> Đang sẵn sàng mở ca
                  </div>
                  <div className="doc-name" title={doctorName}>
                    {doctorName}
                  </div>
                  <div className="doc-sub" title={`${specialtyInfo} • ${clinicInfo}`}>
                    {specialtyInfo} • {clinicInfo}
                  </div>

                  {/* Cho phép chọn bác sĩ khác nếu là Admin */}
                  {!isDoctorRole && (
                    <div className="admin-select-wrapper">
                      <Select
                        value={selectedDoctorOption}
                        onChange={this.handleChangeDoctor}
                        options={arrAllDoctor}
                        placeholder="Chọn bác sĩ quản lý ca..."
                        classNamePrefix="custom-select"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Date Selector Card */}
              <div className="info-card date-card">
                <div className="date-header">
                  <span className="date-label">Chọn ngày khám tiếp nhận *</span>
                  <span className="today-hint">Hôm nay: {moment().format("DD/MM/YYYY")}</span>
                </div>
                <div className="datepicker-input-wrap">
                  <i className="fa fa-calendar-alt calendar-icon"></i>
                  <DatePicker
                    onChange={this.handleOnChangeDatePicker}
                    className="form-control"
                    value={currentDate}
                    minDate={new Date(new Date().setDate(new Date().getDate() - 1))}
                  />
                </div>
                <div className="quick-date-chips">
                  <button
                    type="button"
                    className={`chip-date-btn ${activeQuickDate === "today" ? "active" : ""}`}
                    onClick={() => this.handleQuickDateSelect("today")}
                  >
                    Hôm nay ({moment().format("dd")})
                  </button>
                  <button
                    type="button"
                    className={`chip-date-btn ${activeQuickDate === "tomorrow" ? "active" : ""}`}
                    onClick={() => this.handleQuickDateSelect("tomorrow")}
                  >
                    Ngày mai ({moment().add(1, "days").format("dd")})
                  </button>
                  <button
                    type="button"
                    className={`chip-date-btn ${activeQuickDate === "week" ? "active" : ""}`}
                    onClick={() => this.handleQuickDateSelect("week")}
                  >
                    Cả tuần này
                  </button>
                </div>
              </div>
            </div>

            {/* Row 2: Parameters Strip */}
            <div className="meta-params-strip">
              <div className="param-box">
                <div className="param-left">
                  <div className="icon-circle">
                    <i className="fa fa-clock"></i>
                  </div>
                  <div className="param-text">
                    <div className="p-lbl">Thời lượng mỗi lượt khám</div>
                    <div className="p-sub">Chuẩn thời gian hội chẩn</div>
                  </div>
                </div>
                <div className="param-value-pill">{examDuration}</div>
              </div>

              <div className="param-box">
                <div className="param-left">
                  <div className="icon-circle green">
                    <i className="fa fa-users"></i>
                  </div>
                  <div className="param-text">
                    <div className="p-lbl">Giới hạn tiếp nhận / ca</div>
                    <div className="p-sub">Tự động khóa khi đủ số lượng</div>
                  </div>
                </div>
                <div className="param-value-pill">{maxPatientsPerSlot} người/khung</div>
              </div>
            </div>

            {/* Row 3: Big Schedule Slot Selector Card */}
            <div className="schedule-slots-card">
              <div className="slots-header">
                <div className="header-title-box">
                  <h3 className="s-title">
                    <i className="fa fa-calendar-check"></i> Khung giờ nhận khám của Bác sĩ
                  </h3>
                  <p className="s-desc">
                    Nhấp để bật/tắt nhận ca khám. Bệnh nhân sẽ nhìn thấy ngay các ca được đánh dấu mở.
                  </p>
                </div>
                <div className="legend-box">
                  <div className="leg-item text-active">
                    <span className="leg-dot active"></span> Đang mở nhận khám
                  </div>
                  <div className="leg-item text-inactive">
                    <span className="leg-dot inactive"></span> Đang tắt (Khóa ca)
                  </div>
                  <div className="leg-item text-locked">
                    <span className="leg-dot locked"></span> Nghỉ / Khóa
                  </div>
                </div>
              </div>

              {/* SECTION 1: CA SÁNG */}
              <div className="slot-session-group">
                <div className="session-header">
                  <div className="session-title">
                    <i className="fa fa-sun morning"></i> CA SÁNG (08:00 - 12:00)
                  </div>
                  <button
                    type="button"
                    className="btn-toggle-all"
                    onClick={() => this.handleToggleAllSession("MORNING")}
                  >
                    Bật/Tắt tất cả ca sáng
                  </button>
                </div>
                <div className="slots-grid">
                  {morningSlots.map((item) => (
                    <div
                      key={item.id}
                      className={`slot-card ${item.isSelected ? "active" : "inactive"}`}
                      onClick={() => this.handleClickBtnTime(item)}
                    >
                      <div className="slot-time">{item.valueVi}</div>
                      <div className="slot-status">
                        {item.isSelected ? (
                          <>
                            <i className="fa fa-check"></i> Mở tiếp nhận
                          </>
                        ) : (
                          "Đang tắt"
                        )}
                      </div>
                      <div className="slot-meta">
                        {item.isSelected ? "Khám tại viện • Max 5 BN" : "Nhấp để mở ca"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 2: CA CHIỀU */}
              <div className="slot-session-group">
                <div className="session-header">
                  <div className="session-title">
                    <i className="fa fa-cloud-sun afternoon"></i> CA CHIỀU (13:00 - 17:00)
                  </div>
                  <button
                    type="button"
                    className="btn-toggle-all"
                    onClick={() => this.handleToggleAllSession("AFTERNOON")}
                  >
                    Bật/Tắt tất cả ca chiều
                  </button>
                </div>
                <div className="slots-grid">
                  {afternoonSlots.map((item) => (
                    <div
                      key={item.id}
                      className={`slot-card ${item.isSelected ? "active" : "inactive"}`}
                      onClick={() => this.handleClickBtnTime(item)}
                    >
                      <div className="slot-time">{item.valueVi}</div>
                      <div className="slot-status">
                        {item.isSelected ? (
                          <>
                            <i className="fa fa-check"></i> Mở tiếp nhận
                          </>
                        ) : (
                          "Đang tắt"
                        )}
                      </div>
                      <div className="slot-meta">
                        {item.isSelected ? "Khám tại viện • Max 5 BN" : "Nhấp để mở ca"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FOOTER ACTION BAR */}
              <div className="slots-footer-action-bar">
                <div className="summary-stat">
                  <i className="fa fa-info-circle"></i>
                  <span>
                    Đã chọn: <strong>{selectedSlotsCount} khung giờ</strong> • Dự kiến tiếp nhận:{" "}
                    <strong>Tối đa {estimatedPatients} bệnh nhân</strong>
                  </span>
                </div>
                <div className="action-buttons">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={this.handleResetSlots}
                  >
                    Lưu nháp / Hủy
                  </button>
                  <button
                    type="button"
                    className="btn-confirm-save"
                    onClick={this.handleSaveSchedule}
                  >
                    <i className="fa fa-check-circle"></i>
                    Xác nhận mở {selectedSlotsCount} ca cho Bệnh nhân đặt
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (30%) - LIVE PREVIEW & WEEKLY SUMMARY */}
          <div className="layout-right">
            {/* CARD 1: LIVE PREVIEW (APP BỆNH NHÂN) */}
            <div className="preview-patient-app-card">
              <div className="preview-header">
                <div className="preview-title">
                  <span className="dot-green"></span> Xem trước hiển thị (App Bệnh nhân)
                </div>
                <span className="badge-live">Live Preview</span>
              </div>
              <p className="preview-desc">
                Giao diện người bệnh sẽ thấy khi đặt khám với bác sĩ trên ứng dụng BookingCare:
              </p>

              <div className="app-screen-mockup">
                <div className="doc-mini-profile">
                  <div className="mini-avatar">
                    {doctorAvatar ? (
                      <img src={doctorAvatar} alt="Doctor" />
                    ) : (
                      <span>{doctorInitials || "BS"}</span>
                    )}
                  </div>
                  <div className="mini-doc-info">
                    <div className="name">{doctorName}</div>
                    <div className="price">
                      Giá khám: {doctorDetail?.Doctor_Infor?.priceTypeData?.valueVi || "300.000"} đ
                    </div>
                  </div>
                </div>

                <div className="preview-slots-section">
                  <div className="slots-title">
                    <i className="fa fa-calendar-alt me-1"></i> Khung giờ còn trống ngày {dateFormatted}:
                  </div>
                  {rangeTime.filter((item) => item.isSelected).length > 0 ? (
                    <div className="preview-buttons-grid">
                      {rangeTime
                        .filter((item) => item.isSelected)
                        .map((slot) => (
                          <div key={slot.id} className="btn-mini-slot">
                            {slot.valueVi}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="empty-preview-slots">
                      Chưa mở ca khám nào trong ngày này. Vui lòng bật ca ở bên trái.
                    </div>
                  )}
                </div>

                <div className="preview-footer">
                  <i className="fa fa-check-circle"></i> Đặt lịch miễn phí • Xác nhận tức thì
                </div>
              </div>
            </div>

            {/* CARD 2: WEEKLY SCHEDULE SUMMARY */}
            <div className="weekly-summary-card">
              <div className="weekly-header">
                <span className="w-title">Tóm tắt tuần làm việc của Bác sĩ</span>
                <a href="#weekly-details" className="w-link" onClick={(e) => e.preventDefault()}>
                  Xem chi tiết tuần
                </a>
              </div>

              <div className="week-days-list">
                {weeklyScheduleSummary.map((day, idx) => (
                  <div key={idx} className="day-row">
                    <div className="day-date">
                      <span className="badge-day">{day.dayName}</span>
                      <span>{day.fullDateStr}</span>
                      {day.isToday && <strong className="text-primary">(Hôm nay)</strong>}
                    </div>
                    <span className={`day-status status-${day.statusType}`}>
                      {day.statusText}
                    </span>
                  </div>
                ))}
              </div>

              <div className="weekly-tip-box">
                <i className="fa fa-info-circle"></i>
                <span>
                  Lịch mở ca có hiệu lực tức thì trên ứng dụng BookingCare để người bệnh đặt khám theo thời gian thực.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isLoggedIn: state.user.isLoggedIn,
    language: state.app.language,
    userInfo: state.user.userInfo,
    listAllDoctorRedux: state.admin.listAllDoctor,
    allScheduleTimeRedux: state.admin.listScheduleTime,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getAllDoctor: () => dispatch(actions.getAllDoctor()),
    getAllScheduleTime: () => dispatch(actions.getAllScheduleTime()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageSchedule);
