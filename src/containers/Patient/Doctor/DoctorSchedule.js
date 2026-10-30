import React, { Component } from "react";
import { connect } from "react-redux";
import * as actions from "../../../store/actions";
import { CRUD_ACTION, LANGUAGE } from "../../../utils";
import Select from "react-select";
import { ToastContainer, toast } from "react-toastify";
import _ from "lodash";
import moment from "moment";
import localization from "moment/locale/vi";
import "../../../utils/constant";
import { getScheduleDoctorByDate } from "../../../services/doctorServices";
import { FormattedMessage } from "react-intl";
import BookingModal from "./Modal/BookingModal";
import { getSocket } from "../../../socket";

const socket = getSocket();

class DoctorSchedule extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDay: "",
      allDays: [],
      allAvailableTime: [],
      isOpenModalBooking: false,
      dataTime: {},
      showBookingForm: false,
      email: "",
    };
    this.timer = null;
  }

  async componentDidMount() {
    let { language, patientInfo } = this.props;
    let allDay = this.getArrays(language);

    // Connect user to Socket.IO
    if (!socket.connected) socket.connect();
    if (patientInfo) {
      socket.emit("ADD_USER", patientInfo);
    }

    // Fetch initial slots for the first day and join the room
    if (this.props.doctorIdFromParent) {
      socket.emit("GET_SLOTS", {
        doctorId: this.props.doctorIdFromParent,
        date: String(allDay[0].value),
      });
      socket.emit("JOIN_ROOM", {
        doctorId: this.props.doctorIdFromParent,
        date: String(allDay[0].value),
      });
    }

    // Listen for available slots
    socket.on("SLOTS_RECEIVED", (data) => {
      this.setState({
        allAvailableTime: data.data || [],
      });
    });

    // Listen for slot updates (e.g., when a slot is booked)
    socket.on("SLOT_UPDATED", ({ doctorId, date, timeType }) => {
      if (
        +doctorId === +this.props.doctorIdFromParent &&
        +date === +this.state.selectedDay
      ) {
        this.setState((prevState) => ({
          allAvailableTime: prevState.allAvailableTime.map((slot) =>
            slot.timeType === timeType
              ? { ...slot, status: "booked" }
              : slot
          ),
        }));
      }
    });

    // Handle errors
    socket.on("ERROR", ({ message }) => {
      toast.error(message);
    });

    // Handle reconnection to sync state
    socket.on("connect", () => {
      if (this.props.doctorIdFromParent && this.state.selectedDay) {
        socket.emit("GET_SLOTS", {
          doctorId: +this.props.doctorIdFromParent,
          date: String(this.state.selectedDay),
        });
        socket.emit("JOIN_ROOM", {
          doctorId: +this.props.doctorIdFromParent,
          date: String(this.state.selectedDay),
        });
      }
    });

    this.setState({
      allDays: allDay,
      selectedDay: allDay[0].value,
    });

    // Real-time minute timer to automatically update expired status as time ticks
    this.timer = setInterval(() => {
      this.forceUpdate();
    }, 60000);
  }

  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    socket.off("SLOTS_RECEIVED");
    socket.off("SLOT_UPDATED");
    socket.off("ERROR");
    socket.off("connect");
  }

  getArrays = (language) => {
    let allDay = [];
    for (let i = 0; i < 7; i++) {
      let object = {};

      if (language === LANGUAGE.VI) {
        if (i === 0) {
          let ddMM = moment(new Date()).format("DD/MM");
          let today = `Hôm nay - ${ddMM}`;
          object.label = today;
        } else {
          object.label = this.capitalizeFirst(
            moment(new Date()).add(i, "days").format("dddd - DD/MM")
          );
        }
      } else {
        if (i === 0) {
          let ddMM = moment(new Date()).format("DD/MM");
          let today = `Today - ${ddMM}`;
          object.label = today;
        } else {
          object.label = moment(new Date())
            .add(i, "days")
            .locale("en")
            .format("ddd - DD/MM");
        }
      }

      object.value = moment(new Date())
        .add(i, "days")
        .startOf("days")
        .valueOf();
      allDay.push(object);
    }
    return allDay;
  };

  handleChangeSelect = async (event) => {
    if (this.props.doctorIdFromParent && this.props.doctorIdFromParent != -1) {
      let doctorId = this.props.doctorIdFromParent;
      let date = event.target.value;

      socket.emit("GET_SLOTS", {
        doctorId,
        date,
      });
      socket.emit("JOIN_ROOM", {
        doctorId,
        date,
      });

      this.setState({ selectedDay: date });
    }
  };

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Check if a time slot has already passed in real-time
   */
  isSlotExpired = (item) => {
    const { selectedDay } = this.state;
    if (!selectedDay) return false;

    const selectedMoment = moment(Number(selectedDay));
    const now = moment();

    // Past date entirely (e.g. yesterday)
    if (selectedMoment.isBefore(now, "day")) {
      return true;
    }

    // Future date (tomorrow, day after...) -> not expired
    if (!selectedMoment.isSame(now, "day")) {
      return false;
    }

    // If TODAY: check against slot start hour/minute
    let startHour = null;
    let startMin = 0;

    const TIME_MAP = {
      T1: 8,
      T2: 9,
      T3: 10,
      T4: 11,
      T5: 13,
      T6: 14,
      T7: 15,
      T8: 16,
    };

    if (item.timeType && TIME_MAP[item.timeType] !== undefined) {
      startHour = TIME_MAP[item.timeType];
    } else if (item.timeTypeData && item.timeTypeData.valueVi) {
      const match = item.timeTypeData.valueVi.match(/^(\d{1,2}):(\d{2})/);
      if (match) {
        startHour = parseInt(match[1], 10);
        startMin = parseInt(match[2], 10);
      }
    }

    if (startHour !== null) {
      const currentHour = now.hour();
      const currentMin = now.minute();

      if (currentHour > startHour) {
        return true;
      }
      if (currentHour === startHour && currentMin >= startMin) {
        return true;
      }
    }

    return false;
  };

  handleClickScheduleTime = (time) => {
    const { patientInfo, language } = this.props;

    // Check if slot expired before opening modal
    if (this.isSlotExpired(time)) {
      toast.warn(
        language === LANGUAGE.VI
          ? "Khung giờ khám này đã qua. Vui lòng chọn khung giờ khác hoặc ngày tiếp theo!"
          : "This appointment slot has passed. Please select another slot or date!"
      );
      return;
    }

    if (!patientInfo) {
      toast.warn(
        language === LANGUAGE.VI
          ? "Bạn cần đăng nhập để tiếp tục đặt lịch!"
          : "Please login to proceed with booking!"
      );
      return;
    }

    this.setState({
      isOpenModalBooking: true,
      dataTime: time,
      email: patientInfo.email || "",
    });
  };

  closeBookingModal = () => {
    this.setState({
      isOpenModalBooking: false,
    });
  };

  async componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.language !== this.props.language) {
      let allDay = this.getArrays(this.props.language);
      this.setState({
        allDays: allDay,
      });
    }
    if (
      prevProps.doctorIdFromParent !== this.props.doctorIdFromParent &&
      this.props.doctorIdFromParent !== -1
    ) {
      let allDay = this.getArrays(this.props.language);

      socket.emit("GET_SLOTS", {
        doctorId: +this.props.doctorIdFromParent,
        date: String(allDay[0].value),
      });
      socket.emit("JOIN_ROOM", {
        doctorId: +this.props.doctorIdFromParent,
        date: String(allDay[0].value),
      });

      this.setState({ allDays: allDay, selectedDay: allDay[0].value });
    }
  }

  render() {
    let { allDays, allAvailableTime, dataTime, isOpenModalBooking } =
      this.state;
    let { language } = this.props;

    let hasAvailableSlots = false;

    return (
      <>
        <div className="schedule-container">
          <div className="schedule-header">
            <div className="all-schedule">
              <i className="far fa-calendar-check select-icon"></i>
              <select
                value={this.state.selectedDay}
                onChange={(event) => this.handleChangeSelect(event)}
              >
                {allDays &&
                  allDays.length > 0 &&
                  allDays.map((item, index) => {
                    return (
                      <option value={item.value} key={index}>
                        {item.label}
                      </option>
                    );
                  })}
              </select>
            </div>
          </div>

          <div className="all-available-time">
            <div className="text-calendar">
              <i className="fas fa-calendar-alt"></i>
              <span className="calendar-title">
                <FormattedMessage id="patient.detail-doctor.schedule" />
              </span>
            </div>

            <div className="schedule-guide">
              <i className="far fa-hand-point-up"></i>
              <span>
                <FormattedMessage id="patient.detail-doctor.choose" />
                <FormattedMessage id="patient.detail-doctor.book-free" />
              </span>
            </div>

            {/* Comprehensive Legend: Còn trống, Đã đặt, Đã qua giờ */}
            <div className="schedule-legend">
              <span className="legend-item available">
                <span className="legend-dot available-dot"></span>
                <FormattedMessage id="patient.detail-doctor.legend-available" />
              </span>
              <span className="legend-item booked">
                <span className="legend-dot booked-dot"></span>
                <FormattedMessage id="patient.detail-doctor.legend-booked" />
              </span>
              <span className="legend-item expired">
                <span className="legend-dot expired-dot"></span>
                <FormattedMessage id="patient.detail-doctor.legend-expired" />
              </span>
            </div>

            <div className="time-content">
              {allAvailableTime && allAvailableTime.length > 0 ? (
                allAvailableTime.map((item, index) => {
                  let timeDisplay =
                    language === LANGUAGE.VI
                      ? item.timeTypeData.valueVi
                      : item.timeTypeData.valueEn;

                  let isBooked = item.status === "booked";
                  let isExpired = this.isSlotExpired(item);

                  if (!isBooked && !isExpired) {
                    hasAvailableSlots = true;
                  }

                  let buttonClass = "btn-active";
                  let iconClass = "far fa-clock slot-icon";
                  let titleTooltip =
                    language === LANGUAGE.VI
                      ? "Bấm để đặt lịch khám"
                      : "Click to book this slot";

                  if (isExpired) {
                    buttonClass = "btn-expired";
                    iconClass = "fas fa-history slot-icon";
                    titleTooltip =
                      language === LANGUAGE.VI
                        ? "Khung giờ này đã qua trong ngày"
                        : "This appointment slot has passed today";
                  } else if (isBooked) {
                    buttonClass = "btn-disabled";
                    iconClass = "fas fa-lock slot-icon";
                    titleTooltip =
                      language === LANGUAGE.VI
                        ? "Khung giờ này đã kín lịch"
                        : "This slot is booked";
                  }

                  return (
                    <button
                      key={index}
                      className={`time-slot-btn ${
                        language === LANGUAGE.VI ? "btn-vie" : "btn-en"
                      } ${buttonClass}`}
                      onClick={() => this.handleClickScheduleTime(item)}
                      disabled={isBooked || isExpired}
                      title={titleTooltip}
                    >
                      <i className={iconClass}></i>
                      <span className="slot-text">{timeDisplay}</span>
                      {isExpired && (
                        <span className="expired-badge">
                          {language === LANGUAGE.VI ? "Đã qua" : "Passed"}
                        </span>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="no-schedule-box">
                  <i className="far fa-calendar-times"></i>
                  <span>
                    <FormattedMessage id="patient.detail-doctor.no-schedule" />
                  </span>
                </div>
              )}
            </div>

            {/* Thông báo nếu tất cả khung giờ trong ngày đã qua hoặc kín */}
            {allAvailableTime &&
              allAvailableTime.length > 0 &&
              !hasAvailableSlots && (
                <div className="all-slots-passed-notice">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  <span>
                    <FormattedMessage id="patient.detail-doctor.all-slots-passed" />
                  </span>
                </div>
              )}
          </div>
        </div>

        <BookingModal
          dataTime={dataTime}
          isOpenModalBooking={isOpenModalBooking}
          closeBookingModal={this.closeBookingModal}
          socket={socket}
        />
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    language: state.app.language,
    patientInfo: state.patient.patientInfo,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(DoctorSchedule);
