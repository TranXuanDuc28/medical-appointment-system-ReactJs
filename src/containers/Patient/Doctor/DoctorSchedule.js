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
  }
  async componentDidMount() {
    let { language, patientInfo } = this.props;
    console.log("patientInfo", patientInfo);
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
        console.log("Slot updated received:", timeType);
        this.setState((prevState) => ({
          allAvailableTime: prevState.allAvailableTime.map((slot) =>
            slot.timeType === timeType
              ? { ...slot, status: "booked" } // mark as booked
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
  }

  componentWillUnmount() {
    // Cleanup Socket.IO listeners
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

  handleClickScheduleTime = (time) => {
    const { patientInfo } = this.props;
    if (!patientInfo) {
      toast.warn("Bạn cần đăng nhập để tiếp tục đặt lịch!");
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
    console.log("allAvailableTime", allAvailableTime);
    return (
      <>
        <div className="schedule-container">
          <div className="all-schedule">
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
          <div className="all-available-time">
            <div className="text-calendar">
              <i className="fas fa-calendar-alt">
                <span>
                  <FormattedMessage id="patient.detail-doctor.schedule" />
                </span>
              </i>
            </div>
            <div className="time-content">
              {allAvailableTime && allAvailableTime.length > 0 ? (
                allAvailableTime.map((item, index) => {
                  let timeDisplay =
                    language === LANGUAGE.VI
                      ? item.timeTypeData.valueVi
                      : item.timeTypeData.valueEn;

                  return (
                    <button
                      key={index}
                      className={`${language === LANGUAGE.VI ? "btn-vie" : "btn-en"
                        } ${item.status === "booked" ? "btn-disabled" : ""}`}
                      onClick={() => this.handleClickScheduleTime(item)}
                      disabled={item.status === "booked"} // disable nếu slot đã booked
                    >
                      {timeDisplay}
                    </button>
                  );
                })
              ) : (
                <div>
                  <FormattedMessage id="patient.detail-doctor.no-schedule" />
                </div>
              )}
            </div>
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
