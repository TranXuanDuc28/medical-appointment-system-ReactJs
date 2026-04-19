import axios from "../axios";
const registerUser = (data) => {
  return axios.post("/api/register", data);
};
const handleLoginApi = (email, password) => {
  return axios.post("/api/login", { email, password });
};

const handlePatientChatLogin = (email, password) => {
  return axios.post("/api/login-patient-chat", { email, password });
};

const postLogout = () => {
  return axios.post("/api/logout");
};

const handleGetAllUsers = (id) => {
  return axios.get(`/api/get_all_users?id=${id}`);
};
const createNewUsersServices = (data) => {
  return axios.post("/api/create_new_users", data);
};
const deleteUsersServices = (id) => {
  return axios.delete("/api/delete_users", {
    data: {
      id,
    },
  });
};
const editUsersServices = (data) => {
  return axios.put("/api/edit_users", data);
};
const getAllCodeServices = (inputType) => {
  return axios.get(`/api/allcode?type=${inputType}`);
};

const postVerifyBookAppointment = (data) => {
  return axios.post("/api/verify-book-appointment", data);
};
// Specialty Services
const createNewSpecialty = (data) => {
  return axios.post("/api/create-new-specialty", data);
};
const getAllSpecialty = (data) => {
  return axios.get(`/api/get-specialty?lang=${data.lang}`);
};
const getAllDetailSpecialtyById = (data) => {
  return axios.get(
    `/api/get-detail-specialty-by-id?id=${data.id}&location=${data.location}&lang=${data.lang}`
  );
};
// Clinic related services
const createNewClinic = (data) => {
  return axios.post("/api/create-new-clinic", data);
};
const getAllClinic = (data) => {
  return axios.get(`/api/get-clinic?lang=${data.lang}`);
};
const getAllDetailClinicById = (data) => {
  console.log("check data service", data);
  return axios.get(
    `/api/get-detail-clinic-by-id?id=${data.id}&lang=${data.lang}`
  );
};
// HandBook related services
const createNewHandBook = (data) => {
  return axios.post("/api/create-new-handbook", data);
};
const getAllHandBook = (data) => {
  return axios.get(`/api/get-handbook?lang=${data.lang}`);
};
const getAllDetailHandBookById = (data) => {
  return axios.get(
    `/api/get-detail-handbook-by-id?id=${data.id}&lang=${data.lang}`
  );
};
const getRelatedHandBooks = (data) => {
  return axios.get(
    `/api/get-related-handbooks?id=${data.id}&limit=${data.limit || 4}&lang=${
      data.lang
    }`
  );
};

const getAllPatientForDoctor = (data) => {
  console.log("data", data);
  return axios.get(
    `/api/get-list-patient-for-doctor?doctorId=${data.doctorId}&roleId=${data.roleId}&date=${data.date}&lang=${data.lang}`
  );
};
const postSendRemedy = (data) => {
  return axios.post("/api/send-remedy", data);
};
const getAllMedicines = () => {
  return axios.get("/api/get-medicines");
};
const postMedicalAppointmentStatus = (data) => {
  return axios.post("/api/update-medical-appointment-status", data);
};

const postSendPayment = (data) => {
  return axios.post("/api/send-payment", data);
};
const getPatientAppointments = (patientId) => {
  return axios.get(`/api/get-patient-appointments?patientId=${patientId}`);
};

export {
  registerUser,
  handleLoginApi,
  handleGetAllUsers,
  createNewUsersServices,
  deleteUsersServices,
  editUsersServices,
  getAllCodeServices,
  postVerifyBookAppointment,
  createNewSpecialty,
  getAllSpecialty,
  getAllDetailSpecialtyById,
  createNewClinic,
  getAllClinic,
  getAllDetailClinicById,
  createNewHandBook,
  getAllHandBook,
  getAllDetailHandBookById,
  getRelatedHandBooks,
  getAllPatientForDoctor,
  postSendRemedy,
  getAllMedicines,
  postMedicalAppointmentStatus,
  postSendPayment,
  handlePatientChatLogin,
  getPatientAppointments,
  postLogout,
};
