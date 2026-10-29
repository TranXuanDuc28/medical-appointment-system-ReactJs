import actionTypes from "./actionTypes";
import { getSocket } from "../../socket";

export const patientLoginSuccess = (patientInfo) => ({
  type: actionTypes.PATIENT_LOGIN_SUCCESS,
  patientInfo,
});
export const patientLoginFail = () => ({
  type: actionTypes.PATIENT_LOGIN_FAIL,
});

export const patientLogout = () => (dispatch) => {
  const socket = getSocket();
  if (socket && socket.connected) socket.disconnect();
  dispatch({ type: actionTypes.PATIENT_LOGOUT });
};
