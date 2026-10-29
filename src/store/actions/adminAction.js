import {
  getAllCodeServices,
  createNewUsersServices,
  handleGetAllUsers,
  deleteUsersServices,
  editUsersServices,
  getAllSpecialty,
  getAllClinic,
} from "../../services/userServices";
import {
  getTopDoctorServices,
  getAllDoctorServices,
  saveDetailInforDoctorServices,
  getDetailDoctorByIdServices,
} from "../../services/doctorServices";
import actionTypes from "./actionTypes";
import { toast } from "react-toastify";

export const fetchGenderStart = () => {
  return async (dispatch, getState) => {
    try {
      dispatch({
        type: actionTypes.FETCH_GENDER_START,
      });
      let res = await getAllCodeServices("GENDER");
      if (res && res.errCode === 0) {
        dispatch(fetchGenderSuccess(res.data));
      } else {
        dispatch(fetchGenderFailed());
      }
    } catch (error) {
      dispatch(fetchGenderFailed());
    }
  };
};
export const fetchGenderSuccess = (genderData) => ({
  type: actionTypes.FETCH_GENDER_SUCCESS,
  data: genderData,
});
export const fetchGenderFailed = () => ({
  type: actionTypes.FETCH_GENDER_FAILED,
});
export const fetchRoleStart = () => {
  return async (dispatch, getState) => {
    try {
      let res = await getAllCodeServices("ROLE");
      if (res && res.errCode === 0) {
        dispatch(fetchRoleSuccess(res.data));
      } else {
        dispatch(fetchRoleFailed());
      }
    } catch (error) {
      dispatch(fetchRoleFailed());
    }
  };
};
export const fetchRoleSuccess = (roleData) => ({
  type: actionTypes.FETCH_ROLE_SUCCESS,
  data: roleData,
});
export const fetchRoleFailed = () => ({
  type: actionTypes.FETCH_ROLE_FAILED,
});
export const fetchPositionStart = () => {
  return async (dispatch, getState) => {
    try {
      let res = await getAllCodeServices("POSITION");
      if (res && res.errCode === 0) {
        dispatch(fetchPositionSuccess(res.data));
      } else {
        dispatch(fetchPositionFailed());
      }
    } catch (error) {
      dispatch(fetchPositionFailed());
    }
  };
};
export const fetchPositionSuccess = (positionData) => ({
  type: actionTypes.FETCH_POSITION_SUCCESS,
  data: positionData,
});
export const fetchPositionFailed = () => ({
  type: actionTypes.FETCH_POSITION_FAILED,
});
export const createNewUser = (data) => {
  // console.log(data);
  return async (dispatch, getState) => {
    try {
      let isVi = getState()?.app?.language === "vi";
      let res = await createNewUsersServices(data);
      // console.log("123",res);
      if (res && res.errCode === 0) {
        toast.success(isVi ? "Thêm mới người dùng thành công!" : "User created successfully!");
        dispatch(createUserSuccess(res.data));
        dispatch(getAllUser());
      } else {
        toast.error(isVi ? (res?.errMessage || "Thêm người dùng thất bại!") : (res?.errMessage || "Failed to create user!"));
        dispatch(createUserFailed());
      }
    } catch (error) {
      let isVi = getState()?.app?.language === "vi";
      toast.error(isVi ? "Thêm người dùng thất bại!" : "Failed to create user!");
      dispatch(createUserFailed());
    }
  };
};
export const createUserSuccess = () => ({
  type: actionTypes.CREATE_USER_SUCCESS,
});
export const createUserFailed = () => ({
  type: actionTypes.CREATE_USER_FAILED,
});
export const getAllUser = () => {
  // console.log(data);
  return async (dispatch, getState) => {
    try {
      let res = await handleGetAllUsers("ALL");
      console.log(res);
      // console.log("123",res);
      if (res && res.errCode === 0) {
        dispatch(getAllUserSuccess(res.users));
      } else {
        dispatch(getAllUserFailed());
      }
    } catch (error) {
      dispatch(getAllUserFailed());
    }
  };
};
export const getAllUserSuccess = (data) => ({
  type: actionTypes.GET_ALL_USER_SUCCESS,
  users: data,
});
export const getAllUserFailed = () => ({
  type: actionTypes.GET_ALL_USER_FAILED,
});
export const deleteUser = (idInput) => {
  // console.log(data);
  return async (dispatch, getState) => {
    try {
      let isVi = getState()?.app?.language === "vi";
      let res = await deleteUsersServices(idInput);
      if (res && res.errCode === 0) {
        toast.success(isVi ? "Xóa người dùng thành công!" : "User deleted successfully!");
        dispatch(deleteUserSuccess());
        dispatch(getAllUser());
      } else {
        toast.error(isVi ? (res?.errMessage || "Xóa người dùng thất bại!") : (res?.errMessage || "Failed to delete user!"));
        dispatch(deleteUserFailed());
      }
    } catch (error) {
      let isVi = getState()?.app?.language === "vi";
      toast.error(isVi ? "Xóa người dùng thất bại!" : "Failed to delete user!");
      dispatch(deleteUserFailed());
    }
  };
};
export const deleteUserSuccess = () => ({
  type: actionTypes.DELETE_USER_SUCCESS,
});
export const deleteUserFailed = () => ({
  type: actionTypes.DELETE_USER_FAILED,
});
export const editUser = (data) => {
  // console.log(data);
  return async (dispatch, getState) => {
    try {
      let isVi = getState()?.app?.language === "vi";
      let res = await editUsersServices(data);
      // console.log(res);
      // console.log("123",res);
      if (res && res.errCode === 0) {
        toast.success(isVi ? "Cập nhật người dùng thành công!" : "User updated successfully!");
        dispatch(editUserSuccess());
        dispatch(getAllUser());
      } else {
        toast.error(isVi ? (res?.errMessage || "Cập nhật người dùng thất bại!") : (res?.errMessage || "Failed to update user!"));
        dispatch(editUserFailed());
      }
    } catch (error) {
      let isVi = getState()?.app?.language === "vi";
      toast.error(isVi ? "Cập nhật người dùng thất bại!" : "Failed to update user!");
      dispatch(editUserFailed());
    }
  };
};
export const editUserSuccess = () => ({
  type: actionTypes.EDIT_USER_SUCCESS,
});
export const editUserFailed = () => ({
  type: actionTypes.EDIT_USER_FAILED,
});
export const getTopDoctorHome = (data) => {
  // console.log(data);
  return async (dispatch, getState) => {
    try {
      let res = await getTopDoctorServices("", data.lang);

      // console.log("123",res);
      if (res && res.errCode === 0) {
        dispatch(getTopDoctorSuccess(res.data));
      } else {
        dispatch(getTopDoctorFailed());
      }
    } catch (error) {
      dispatch(getTopDoctorFailed());
    }
  };
};
export const getTopDoctorSuccess = (data) => ({
  type: actionTypes.GET_TOP_DOCTOR_SUCCESS,
  doctorData: data,
});
export const getTopDoctorFailed = () => ({
  type: actionTypes.GET_TOP_DOCTOR_FAILED,
});
export const getAllDoctor = () => {
  // console.log(data);
  return async (dispatch, getState) => {
    try {
      let res = await getAllDoctorServices();

      // console.log("123",res);
      if (res && res.errCode === 0) {
        dispatch(getAllDoctorSuccess(res.data));
      } else {
        dispatch(getAllDoctorFailed());
      }
    } catch (error) {
      dispatch(getAllDoctorFailed());
    }
  };
};
export const getAllDoctorSuccess = (data) => ({
  type: actionTypes.GET_ALL_DOCTOR_SUCCESS,
  allDoctorData: data,
});
export const getAllDoctorFailed = () => ({
  type: actionTypes.GET_ALL_DOCTOR_FAILED,
});
export const saveDetailInforDoctor = (data) => {
  return async (dispatch, getState) => {
    try {
      let isVi = getState()?.app?.language === "vi";
      let res = await saveDetailInforDoctorServices(data);

      // console.log("123",res);
      if (res && res.errCode === 0) {
        toast.success(isVi ? "Lưu thông tin bác sĩ thành công!" : "Doctor info saved successfully!");
        dispatch(getInforDoctorSuccess());
      } else {
        toast.error(isVi ? (res?.errMessage || "Lưu thông tin thất bại!") : (res?.errMessage || "Failed to save doctor info!"));
        dispatch(getInforDoctorFailed());
      }
    } catch (error) {
      let isVi = getState()?.app?.language === "vi";
      toast.error(isVi ? "Lưu thông tin thất bại!" : "Failed to save doctor info!");
      dispatch(getInforDoctorFailed());
    }
  };
};
export const getInforDoctorSuccess = () => ({
  type: actionTypes.SAVE_INFOR_DOCTOR_SUCCESS,
});
export const getInforDoctorFailed = () => ({
  type: actionTypes.SAVE_INFOR_DOCTOR_FAILED,
});
export const getDetailDoctorById = (inputId, lang) => {
  // console.log(data);
  return async (dispatch, getState) => {
    try {
      let res = await getDetailDoctorByIdServices(inputId, lang);
      if (res && res.errCode === 0) {
        dispatch(getInforDoctorByIdSuccess(res.data));
      } else {
        dispatch(getInforDoctorByIdFailed());
      }
    } catch (error) {
      dispatch(getInforDoctorByIdFailed());
    }
  };
};
export const getInforDoctorByIdSuccess = (data) => ({
  type: actionTypes.GET_DOCTOR_BY_ID_SUCCESS,
  data: data,
});
export const getInforDoctorByIdFailed = () => ({
  type: actionTypes.GET_DOCTOR_BY_ID_FAILED,
});
export const getAllScheduleTime = () => {
  // console.log(data);
  return async (dispatch, getState) => {
    try {
      let res = await getAllCodeServices("TIME");
      if (res && res.errCode === 0) {
        dispatch(getAllScheduleTimeSuccess(res.data));
      } else {
        dispatch(getAllScheduleTimeFailed());
      }
    } catch (error) {
      dispatch(getAllScheduleTimeFailed());
    }
  };
};
export const getAllScheduleTimeSuccess = (data) => ({
  type: actionTypes.GET_ALL_SCHEDULE_TIME_SUCCESS,
  dataTime: data,
});
export const getAllScheduleTimeFailed = () => ({
  type: actionTypes.GET_ALL_SCHEDULE_TIME_FAILED,
});
export const fetchAllRequireDoctorInforStart = (data) => {
  return async (dispatch, getState) => {
    try {
      dispatch({
        type: actionTypes.FETCH_ALL_DOCTOR_INFOR_START,
      });
      let resPrice = await getAllCodeServices("PRICE");
      let resPayment = await getAllCodeServices("PAYMENT");
      let resProvince = await getAllCodeServices("PROVINCE");
      let resSpecialty = await getAllSpecialty(data);
      let resClinic = await getAllClinic(data);
      if (
        resPrice &&
        resPayment &&
        resProvince &&
        resPrice.errCode === 0 &&
        resPayment.errCode === 0 &&
        resProvince.errCode === 0 &&
        resSpecialty.errCode === 0 &&
        resClinic.errCode === 0
      ) {
        let data = {
          resPrice: resPrice.data,
          resProvince: resProvince.data,
          resPayment: resPayment.data,
          resSpecialty: resSpecialty.data,
          resClinic: resClinic.data,
        };
        dispatch(fetchAllDoctorInforSuccess(data));
      } else {
        dispatch(fetchAllDoctorInforFailed());
      }
    } catch (error) {
      dispatch(fetchAllDoctorInforFailed());
    }
  };
};
export const fetchAllDoctorInforSuccess = (allRequireDoctorInfor) => ({
  type: actionTypes.FETCH_ALL_DOCTOR_INFOR_SUCCESS,
  data: allRequireDoctorInfor,
});
export const fetchAllDoctorInforFailed = () => ({
  type: actionTypes.FETCH_ALL_DOCTOR_INFOR_FAILED,
});
