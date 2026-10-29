import React, { Component } from "react";
import { connect } from "react-redux";
import "./RemedyModal.scss";
import { FormattedMessage } from "react-intl";
import { Modal } from "react-bootstrap";
import _ from "lodash";
import Select from "react-select";
import { getAllMedicines } from "../../../services/userServices";
import { useState, useEffect } from "react";

// Component DiagnosisSelect
const DiagnosisSelect = ({
  value,
  onChange,
  placeholder = "Chọn hoặc tìm chẩn đoán...",
  isMulti = false,
}) => {
  const [diagnosisList, setDiagnosisList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDiagnosisList();
  }, []);

  const loadDiagnosisList = async () => {
    setIsLoading(true);
    try {
      // Giả lập API call - thực tế sẽ gọi API
      const mockData = [
        // Nhóm bệnh thường gặp
        {
          label: "🔥 Bệnh thường gặp",
          options: [
            {
              value: "J06.9",
              label:
                "J06.9 - Nhiễm trùng đường hô hấp trên cấp tính, không xác định",
            },
            {
              value: "K29.7",
              label: "K29.7 - Viêm dạ dày mãn tính, không xác định",
            },
            {
              value: "M79.3",
              label: "M79.3 - Viêm màng hoạt dịch, không xác định vị trí",
            },
            { value: "R50.9", label: "R50.9 - Sốt, không xác định" },
            { value: "R05", label: "R05 - Ho" },
            { value: "K59.0", label: "K59.0 - Táo bón" },
            { value: "R51", label: "R51 - Đau đầu" },
          ],
        },
        // Nhóm bệnh hô hấp
        {
          label: "🫁 Bệnh hô hấp",
          options: [
            { value: "J00", label: "J00 - Viêm mũi họng cấp tính" },
            {
              value: "J01.9",
              label: "J01.9 - Viêm xoang cấp tính, không xác định",
            },
            {
              value: "J02.9",
              label: "J02.9 - Viêm họng cấp tính, không xác định",
            },
            {
              value: "J03.9",
              label: "J03.9 - Viêm amidan cấp tính, không xác định",
            },
            { value: "J04.0", label: "J04.0 - Viêm thanh quản cấp tính" },
            {
              value: "J20.9",
              label: "J20.9 - Viêm phế quản cấp tính, không xác định",
            },
            {
              value: "J44.0",
              label: "J44.0 - Bệnh phổi tắc nghẽn mãn tính có đợt cấp",
            },
          ],
        },
        // Nhóm bệnh tiêu hóa
        {
          label: "🍽️ Bệnh tiêu hóa",
          options: [
            { value: "K25.9", label: "K25.9 - Loét dạ dày, không xác định" },
            { value: "K26.9", label: "K26.9 - Loét tá tràng, không xác định" },
            { value: "K30", label: "K30 - Chứng khó tiêu" },
            { value: "K31.9", label: "K31.9 - Bệnh dạ dày, không xác định" },
            {
              value: "K58.9",
              label: "K58.9 - Hội chứng ruột kích thích, không xác định",
            },
            { value: "K59.1", label: "K59.1 - Tiêu chảy chức năng" },
          ],
        },
        // Nhóm bệnh tim mạch
        {
          label: "❤️ Bệnh tim mạch",
          options: [
            { value: "I10", label: "I10 - Tăng huyết áp nguyên phát" },
            {
              value: "I25.9",
              label:
                "I25.9 - Bệnh tim thiếu máu cục bộ mãn tính, không xác định",
            },
            { value: "I50.9", label: "I50.9 - Suy tim, không xác định" },
            { value: "I48", label: "I48 - Rung nhĩ và cuồng nhĩ" },
          ],
        },
        // Nhóm bệnh cơ xương khớp
        {
          label: "🦴 Bệnh cơ xương khớp",
          options: [
            { value: "M25.9", label: "M25.9 - Rối loạn khớp, không xác định" },
            { value: "M54.9", label: "M54.9 - Đau lưng, không xác định" },
            {
              value: "M79.0",
              label: "M79.0 - Thấp khớp, không xác định vị trí",
            },
            { value: "M25.5", label: "M25.5 - Đau khớp" },
          ],
        },
        // Nhóm bệnh da liễu
        {
          label: "🌸 Bệnh da liễu",
          options: [
            { value: "L30.9", label: "L30.9 - Viêm da, không xác định" },
            { value: "L50.9", label: "L50.9 - Mề đay, không xác định" },
            { value: "L20.9", label: "L20.9 - Viêm da cơ địa, không xác định" },
          ],
        },
        // Nhóm bệnh nội tiết
        {
          label: "⚗️ Bệnh nội tiết",
          options: [
            {
              value: "E11.9",
              label: "E11.9 - Đái tháo đường type 2 không có biến chứng",
            },
            {
              value: "E78.5",
              label: "E78.5 - Rối loạn lipid máu, không xác định",
            },
            {
              value: "E04.9",
              label: "E04.9 - Bướu giáp không độc, không xác định",
            },
          ],
        },
      ];

      setDiagnosisList(mockData);
    } catch (error) {
      console.error("Error loading diagnosis list:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: "40px",
      borderColor: state.isFocused ? "#007bff" : "#ced4da",
      boxShadow: state.isFocused ? "0 0 0 0.2rem rgba(0,123,255,.25)" : null,
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
    option: (provided, state) => ({
      ...provided,
      fontSize: "14px",
      backgroundColor: state.isSelected
        ? "#007bff"
        : state.isFocused
        ? "#f8f9fa"
        : "white",
      color: state.isSelected ? "white" : "#333",
      "&:hover": {
        backgroundColor: state.isSelected ? "#007bff" : "#e9ecef",
      },
    }),
    groupHeading: (provided) => ({
      ...provided,
      fontSize: "12px",
      fontWeight: "bold",
      color: "#6c757d",
      backgroundColor: "#f8f9fa",
      padding: "8px 12px",
    }),
  };

  const formatGroupLabel = (data) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <span>{data.label}</span>
      <span
        style={{
          backgroundColor: "#6c757d",
          color: "white",
          borderRadius: "10px",
          padding: "2px 8px",
          fontSize: "10px",
        }}
      >
        {data.options.length}
      </span>
    </div>
  );
  return (
    <Select
      value={value}
      onChange={onChange}
      options={diagnosisList}
      isMulti={isMulti}
      isLoading={isLoading}
      placeholder={placeholder}
      isClearable
      isSearchable
      styles={customStyles}
      formatGroupLabel={formatGroupLabel}
      noOptionsMessage={() => "Không tìm thấy chẩn đoán phù hợp"}
      loadingMessage={() => "Đang tải danh sách chẩn đoán..."}
      filterOption={(option, searchText) => {
        if (!searchText) return true;
        const search = searchText.toLowerCase();
        return (
          option.label.toLowerCase().includes(search) ||
          option.value.toLowerCase().includes(search)
        );
      }}
      className="diagnosis-select"
      classNamePrefix="diagnosis-select"
    />
  );
};
// Component cho thông tin bệnh nhân
const PatientInfoSection = ({ patientInfo, onChange, onChangeEmail }) => (
  <div
    className="prescription-info-box"
    style={{
      border: "1px solid #ddd",
      padding: 15,
      marginBottom: 15,
      borderRadius: 5,
    }}
  >
    <h6 className="mb-3" style={{ color: "#2c3e50", fontWeight: "bold" }}>
      Thông tin bệnh nhân
    </h6>

    {/* Thông tin cơ bản */}
    <div className="row mb-2">
      <div className="col-3">
        <label className="form-label">Họ tên:</label>
        <input
          className="form-control"
          value={patientInfo.fullName}
          onChange={(e) => onChange("fullName", e.target.value)}
          placeholder="Nhập họ và tên"
        />
      </div>
      <div className="col-2">
        <label className="form-label">Ngày sinh:</label>
        <input
          type="date"
          className="form-control"
          value={patientInfo.birthDate}
          onChange={(e) => onChange("birthDate", e.target.value)}
        />
      </div>
      <div className="col-1">
        <label className="form-label">Tuổi:</label>
        <input
          type="number"
          className="form-control"
          value={patientInfo.age}
          onChange={(e) => onChange("age", e.target.value)}
          min="0"
          max="120"
        />
      </div>
      <div className="col-2">
        <label className="form-label">Giới tính:</label>
        <select
          className="form-control"
          value={patientInfo.gender}
          onChange={(e) => onChange("gender", e.target.value)}
        >
          <option value="Nam">Nam</option>
          <option value="Nữ">Nữ</option>
          <option value="Khác">Khác</option>
        </select>
      </div>
      <div className="col-2">
        <label className="form-label">Điện thoại:</label>
        <input
          className="form-control"
          value={patientInfo.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          placeholder="Số điện thoại"
        />
      </div>
    </div>

    {/* Thông tin bổ sung */}
    <div className="row mb-2">
      {/* Email */}
      <div className="col-3">
        <label className="form-label">Email bệnh nhân:</label>
        <input
          type="email"
          className="form-control"
          value={patientInfo.email}
          onChange={onChangeEmail}
          placeholder="email@example.com"
          required
        />
      </div>
      <div className="col-5">
        <label className="form-label">Địa chỉ:</label>
        <input
          className="form-control"
          value={patientInfo.address}
          onChange={(e) => onChange("address", e.target.value)}
          placeholder="Số nhà, đường"
        />
      </div>
      <div className="col-4">
        <label className="form-label">Tỉnh/TP:</label>
        <input
          className="form-control"
          value={patientInfo.city}
          onChange={(e) => onChange("city", e.target.value)}
          placeholder="Tỉnh/Thành phố"
        />
      </div>
    </div>
    <div className="row mb-2">
      <div className="col-2">
        <label className="form-label">C.nặng (kg):</label>
        <input
          type="number"
          className="form-control"
          value={patientInfo.weight}
          onChange={(e) => onChange("weight", e.target.value)}
          placeholder="kg"
          step="0.1"
        />
      </div>
      <div className="col-2">
        <label className="form-label">C.cao (cm):</label>
        <input
          type="number"
          className="form-control"
          value={patientInfo.height}
          onChange={(e) => onChange("height", e.target.value)}
          placeholder="cm"
        />
      </div>
      <div className="col-3">
        <label className="form-label">Nghề nghiệp:</label>
        <input
          className="form-control"
          value={patientInfo.occupation}
          onChange={(e) => onChange("occupation", e.target.value)}
          placeholder="Nghề nghiệp"
        />
      </div>
      <div className="col-5">
        <label className="form-label">Ghi chú:</label>
        <input
          className="form-control"
          value={patientInfo.note}
          onChange={(e) => onChange("note", e.target.value)}
          placeholder="Ghi chú thêm"
        />
      </div>
    </div>
  </div>
);

// Component cho thông tin khám bệnh
const ExaminationSection = ({ examInfo, onChange }) => {
  const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);

  const handleDiagnosisChange = (selectedOption) => {
    setSelectedDiagnosis(selectedOption);
    // Cập nhật giá trị vào examInfo
    const diagnosisText = selectedOption
      ? `${selectedOption.value} - ${selectedOption.label
          .split(" - ")
          .slice(1)
          .join(" - ")}`
      : "";
    onChange("diagnosis", diagnosisText);
  };

  return (
    <div
      className="examination-info-box"
      style={{
        border: "1px solid #ddd",
        padding: 15,
        marginBottom: 15,
        borderRadius: 5,
      }}
    >
      <h6 className="mb-3" style={{ color: "#2c3e50", fontWeight: "bold" }}>
        📋 Thông tin khám bệnh
      </h6>

      <div className="row mb-3">
        <div className="col-6">
          <label className="form-label">Khám lâm sàng:</label>
          <textarea
            className="form-control"
            rows="3"
            value={examInfo.clinicalExam}
            onChange={(e) => onChange("clinicalExam", e.target.value)}
            placeholder="VD: Tim: nhịp đều 80 l/phút, không tiếng thổi&#10;Phổi: phế quản thông thoáng, không ran&#10;Bụng: mềm, không đau ấn"
          />
        </div>
        <div className="col-6">
          <label className="form-label">Khám chi tiết:</label>
          <textarea
            className="form-control"
            rows="3"
            value={examInfo.detailExam}
            onChange={(e) => onChange("detailExam", e.target.value)}
            placeholder="VD: Khám tai mũi họng: amidan I độ, không sung huyết&#10;Da niêm mạc: hồng, không vàng da"
          />
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-6">
          <label className="form-label">
            🎯 Chẩn đoán (ICD-10):
            <span className="text-muted">(Tìm theo tên bệnh hoặc mã)</span>
          </label>
          <DiagnosisSelect
            value={selectedDiagnosis}
            onChange={handleDiagnosisChange}
            placeholder="Tìm kiếm chẩn đoán..."
          />

          {/* Input manual backup */}
          <div className="mt-2">
            <small className="text-muted">Hoặc nhập thủ công:</small>
            <input
              className="form-control form-control-sm"
              value={examInfo.diagnosis}
              onChange={(e) => onChange("diagnosis", e.target.value)}
              placeholder="VD: J06.9 - Nhiễm trùng đường hô hấp trên cấp tính"
            />
          </div>
        </div>
        <div className="col-6">
          <label className="form-label">⚠️ Dị ứng thuốc:</label>
          <input
            className="form-control"
            value={examInfo.allergy}
            onChange={(e) => onChange("allergy", e.target.value)}
            placeholder="VD: Penicillin, Aspirin, không có dị ứng"
          />
        </div>
      </div>

      <div className="row mb-2">
        <div className="col-6">
          <label className="form-label">💬 Lời dặn:</label>
          <textarea
            className="form-control"
            rows="2"
            value={examInfo.advice}
            onChange={(e) => onChange("advice", e.target.value)}
            placeholder="VD: Nghỉ ngơi, uống nhiều nước, tái khám sau 3-5 ngày nếu không đỡ"
          />
        </div>
        <div className="col-6">
          <label className="form-label">📝 Kết luận & Hướng điều trị:</label>
          <textarea
            className="form-control"
            rows="2"
            value={examInfo.conclusion}
            onChange={(e) => onChange("conclusion", e.target.value)}
            placeholder="VD: Điều trị nội khoa, theo dõi triệu chứng"
          />
        </div>
      </div>
    </div>
  );
};

// Component cho bảng thuốc
const PrescriptionTable = ({
  prescription,
  onPrescriptionChange,
  onRemoveMedicine,
  totalPrice,
}) => (
  <div className="prescription-table-container">
    <label className="form-label mb-2" style={{ fontWeight: "bold" }}>
      DANH SÁCH THUỐC
    </label>
    <div className="table-responsive">
      <table className="table table-bordered table-striped">
        <thead className="thead-light">
          <tr>
            <th style={{ width: "40px" }}>#</th>
            <th style={{ minWidth: "200px" }}>Tên thuốc</th>
            <th style={{ width: "80px" }}>Đơn vị</th>
            <th style={{ width: "90px" }}>Số lượng</th>
            <th style={{ width: "150px" }}>Đợt dùng</th>
            <th style={{ width: "120px" }}>Ghi chú</th>
            <th style={{ width: "100px" }}>Giá bán</th>
            <th style={{ width: "100px" }}>Tổng tiền</th>
            <th style={{ width: "50px" }}></th>
          </tr>
        </thead>
        <tbody>
          {prescription.length > 0 ? (
            prescription.map((med, idx) => (
              <tr key={med.value}>
                <td className="text-center">{idx + 1}</td>
                <td>
                  <div style={{ fontWeight: "bold", marginBottom: "2px" }}>
                    {med.name}
                  </div>
                  <div style={{ fontSize: "11px", color: "#666" }}>
                    {med.code} - {med.barcode} - {med.packaging}
                  </div>
                </td>
                <td className="text-center">{med.unit}</td>
                <td>
                  <input
                    type="number"
                    min={1}
                    className="form-control form-control-sm"
                    value={med.quantity}
                    onChange={(e) =>
                      onPrescriptionChange(idx, "quantity", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={med.dosage}
                    onChange={(e) =>
                      onPrescriptionChange(idx, "dosage", e.target.value)
                    }
                    placeholder="2 viên x 3 lần/ngày"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={med.note}
                    onChange={(e) =>
                      onPrescriptionChange(idx, "note", e.target.value)
                    }
                    placeholder="Sau ăn"
                  />
                </td>
                <td className="text-right">
                  {med.price?.toLocaleString()} VNĐ
                </td>
                <td className="text-right font-weight-bold">
                  {med.total?.toLocaleString()} VNĐ
                </td>
                <td className="text-center">
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => onRemoveMedicine(idx)}
                    title="Xóa thuốc"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={9} className="text-center text-muted py-4">
                <i
                  className="fas fa-pills mb-2"
                  style={{ fontSize: "24px" }}
                ></i>
                <div>Chưa có thuốc nào được chọn</div>
              </td>
            </tr>
          )}
        </tbody>
        {prescription.length > 0 && (
          <tfoot>
            <tr style={{ backgroundColor: "#f8f9fa" }}>
              <td colSpan={7} className="text-right font-weight-bold">
                Tổng tiền:
              </td>
              <td
                colSpan={2}
                className="text-right font-weight-bold text-danger"
              >
                {totalPrice.toLocaleString()} VNĐ
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  </div>
);

class RemedyModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // Thông tin bệnh nhân
      patientInfo: {
        fullName: "Trần Xuân Đức",
        birthDate: "",
        age: "21",
        gender: "Nam",
        address: "23 Thanh Lương",
        city: "TP. Đà Nẵng",
        phone: "0879994686",
        email: "",
        weight: "59",
        height: "180",
        occupation: "Sinh viên",
        note: "",
      },
      // Thông tin khám bệnh
      examInfo: {
        clinicalExam: "Da nhợt nhạt",
        detailExam: "Thiếu máu nhẹ",
        diagnosis: "",
        advice: "Nghỉ ngơi, uống nhiều nước, tránh thức khuya",
        allergy: "Không",
        conclusion: "Điều trị thuốc tại nhà",
      },
      // Thông tin toa thuốc
      medicines: [],
      selectedMedicine: null,
      prescription: [],
      totalPrice: 0,
      searchValue: "",
      isLoading: false,
    };
  }

  async componentDidMount() {
    this.setState({ isLoading: true });

    try {
      // Khởi tạo dữ liệu từ props
      if (this.props.dataModal && !_.isEmpty(this.props.dataModal)) {
        const { dataModal } = this.props;
        this.setState({
          patientInfo: {
            ...this.state.patientInfo,
            email: dataModal.email || "",
          },
        });
      }

      // Lấy danh sách thuốc từ API
      const response = await getAllMedicines();
      if (response?.data && response.errCode === 0) {
        const medicineOptions = response.data.map((item) => ({
          value: item.id,
          label: `${item.code} - ${item.name} - ${item.barcode} - hộp ${item.packaging}`,
          name: item.name,
          code: item.code,
          barcode: item.barcode,
          packaging: item.packaging,
          price: item.price,
          unit: item.unit || "viên",
        }));
        this.setState({ medicines: medicineOptions });
      }
    } catch (error) {
      console.error("Error loading medicines:", error);
    } finally {
      this.setState({ isLoading: false });
    }
  }

  // Xử lý thay đổi thông tin bệnh nhân
  handlePatientInfoChange = (field, value) => {
    this.setState({
      patientInfo: {
        ...this.state.patientInfo,
        [field]: value,
      },
    });
  };

  // Xử lý thay đổi thông tin khám bệnh
  handleExamInfoChange = (field, value) => {
    this.setState({
      examInfo: {
        ...this.state.examInfo,
        [field]: value,
      },
    });
  };

  // Xử lý thay đổi email
  handleEmailChange = (event) => {
    this.setState({
      patientInfo: {
        ...this.state.patientInfo,
        email: event.target.value,
      },
    });
  };

  // Xử lý chọn thuốc
  handleMedicineSelect = (selectedOption) => {
    if (!selectedOption) return;

    // Kiểm tra thuốc đã tồn tại trong toa
    const medicineExists = this.state.prescription.some(
      (item) => item.value === selectedOption.value
    );

    if (medicineExists) {
      alert("Thuốc này đã có trong toa thuốc!");
      return;
    }

    const newMedicine = {
      ...selectedOption,
      quantity: 1,
      dosage: "",
      note: "",
      total: selectedOption.price,
    };

    this.setState(
      {
        prescription: [...this.state.prescription, newMedicine],
        selectedMedicine: null,
        searchValue: "",
      },
      this.calculateTotalPrice
    );
  };

  // Xử lý thay đổi thông tin thuốc trong toa
  handlePrescriptionChange = (index, field, value) => {
    const updatedPrescription = [...this.state.prescription];

    if (field === "quantity") {
      const quantity = Math.max(1, Number(value) || 1);
      updatedPrescription[index].quantity = quantity;
      updatedPrescription[index].total =
        quantity * updatedPrescription[index].price;
    } else {
      updatedPrescription[index][field] = value;
    }

    this.setState(
      { prescription: updatedPrescription },
      this.calculateTotalPrice
    );
  };

  // Xử lý xóa thuốc khỏi toa
  handleRemoveMedicine = (index) => {
    const updatedPrescription = [...this.state.prescription];
    updatedPrescription.splice(index, 1);

    this.setState(
      { prescription: updatedPrescription },
      this.calculateTotalPrice
    );
  };

  // Tính tổng tiền
  calculateTotalPrice = () => {
    const totalPrice = this.state.prescription.reduce(
      (sum, medicine) => sum + (medicine.total || 0),
      0
    );
    this.setState({ totalPrice });
  };

  // Xử lý gửi toa thuốc
  handleSendRemedy = () => {
    const { patientInfo, examInfo, prescription, totalPrice } = this.state;

    // Validation cơ bản
    if (!patientInfo.email) {
      alert("Vui lòng nhập email!");
      return;
    }

    if (prescription.length === 0) {
      alert("Vui lòng chọn ít nhất một thuốc!");
      return;
    }

    // Gửi dữ liệu
    this.props.sendRemedy({
      patientInfo,
      examInfo,
      prescription,
      totalPrice,
    });
  };

  render() {
    const { isOpenModal, closeRemedyModal } = this.props;
    const {
      patientInfo,
      examInfo,
      medicines,
      selectedMedicine,
      prescription,
      totalPrice,
      isLoading,
    } = this.state;

    return (
      <Modal
        show={isOpenModal}
        onHide={closeRemedyModal}
        className="modal-booking-container"
        size="xl"
        centered
      >
        <div className="modal-booking-content">
          {/* Header */}
          <div className="modal-booking-header">
            <span className="left">
              <i className="fas fa-prescription-bottle-alt mr-2"></i> Thông tin
              kê khai khám
            </span>
            <span className="right">
              <button
                type="button"
                className="btn-close"
                onClick={closeRemedyModal}
                aria-label="Đóng"
              ></button>
            </span>
          </div>

          {/* Body */}
          <div className="modal-booking-body">
            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border" role="status">
                  <span className="sr-only">Đang tải...</span>
                </div>
                <div className="mt-2">Đang tải danh sách thuốc...</div>
              </div>
            ) : (
              <>
                {/* Thông tin bệnh nhân */}
                <PatientInfoSection
                  patientInfo={patientInfo}
                  onChange={this.handlePatientInfoChange}
                  onChangeEmail={this.handleEmailChange}
                />

                {/* Thông tin khám bệnh */}
                <ExaminationSection
                  examInfo={examInfo}
                  onChange={this.handleExamInfoChange}
                />

                {/* Tìm kiếm thuốc */}
                <div className="row mb-3">
                  <div className="col-12">
                    <label className="form-label">Tìm kiếm thuốc:</label>
                    <Select
                      value={selectedMedicine}
                      onChange={this.handleMedicineSelect}
                      options={medicines}
                      placeholder="Nhập tên hoặc mã thuốc để tìm kiếm..."
                      isClearable
                      isSearchable
                      noOptionsMessage={() => "Không tìm thấy thuốc"}
                      loadingMessage={() => "Đang tìm kiếm..."}
                      className="medicine-select"
                    />
                  </div>
                </div>

                {/* Bảng toa thuốc */}
                <PrescriptionTable
                  prescription={prescription}
                  onPrescriptionChange={this.handlePrescriptionChange}
                  onRemoveMedicine={this.handleRemoveMedicine}
                  totalPrice={totalPrice}
                />
              </>
            )}
          </div>

          {/* Footer */}
          <div className="modal-booking-footer">
            <button
              className="btn-booking-confirm"
              onClick={this.handleSendRemedy}
              disabled={isLoading || this.props.isProcessing}
            >
              <i className="fas fa-check mr-2"></i>
              {this.props.isProcessing ? "Đang gửi..." : <FormattedMessage id="patient.booking-modal.btnConfirm" />}
            </button>
            <button className="btn-booking-cancel" onClick={closeRemedyModal} disabled={this.props.isProcessing}>
              <i className="fas fa-times mr-2"></i>
              <FormattedMessage id="patient.booking-modal.btnCancel" />
            </button>
          </div>
        </div>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  language: state.app.language,
});

export default connect(mapStateToProps)(RemedyModal);
