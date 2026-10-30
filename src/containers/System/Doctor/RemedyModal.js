import React, { Component, useState, useEffect } from "react";
import { connect } from "react-redux";
import { Modal } from "react-bootstrap";
import _ from "lodash";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { toast } from "react-toastify";
import { getAllMedicines } from "../../../services/userServices";
import "./RemedyModal.scss";

// Helper function: Chuẩn hóa chuỗi tiếng Việt không dấu để tìm kiếm thông minh
const removeVietnameseTones = (str) => {
  if (!str) return "";
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  return str.toLowerCase().trim();
};

// Danh mục ICD-10 phổ biến
// Danh mục ICD-10 phổ biến theo chuyên khoa (Bộ Y tế)
const ICD10_CATEGORIES = [
  {
    label: "🔥 Bệnh thường gặp & Triệu chứng chung",
    options: [
      { value: "J06.9", label: "J06.9 - Nhiễm trùng đường hô hấp trên cấp tính" },
      { value: "R50.9", label: "R50.9 - Sốt không rõ nguyên nhân" },
      { value: "R05", label: "R05 - Ho kéo dài" },
      { value: "R51", label: "R51 - Đau đầu cơ năng" },
      { value: "K08.8", label: "K08.8 - Đau răng (Toothache)" },
      { value: "R53", label: "R53 - Suy nhược cơ thể, mệt mỏi mạn" },
      { value: "R11", label: "R11 - Buồn nôn và nôn" },
      { value: "R10.4", label: "R10.4 - Đau bụng không xác định" },
      { value: "R42", label: "R42 - Chóng mặt, choáng váng" },
      { value: "A09", label: "A09 - Viêm dạ dày ruột / Tiêu chảy cấp" },
      { value: "K29.7", label: "K29.7 - Viêm dạ dày mạn tính" },
    ],
  },
  {
    label: "🫁 Hô hấp & Tai Mũi Họng",
    options: [
      { value: "J00", label: "J00 - Viêm mũi họng cấp tính (Cảm cúm thường)" },
      { value: "J01.9", label: "J01.9 - Viêm xoang cấp tính" },
      { value: "J02.9", label: "J02.9 - Viêm họng cấp tính" },
      { value: "J03.9", label: "J03.9 - Viêm amidan cấp tính" },
      { value: "J04.0", label: "J04.0 - Viêm thanh quản cấp tính" },
      { value: "J20.9", label: "J20.9 - Viêm phế quản cấp tính" },
      { value: "J40", label: "J40 - Viêm phế quản không đặc hiệu" },
      { value: "J44.9", label: "J44.9 - Bệnh phổi tắc nghẽn mạn tính (COPD)" },
      { value: "J45.9", label: "J45.9 - Hen phế quản (Suyễn)" },
      { value: "J18.9", label: "J18.9 - Viêm phổi không xác định" },
      { value: "J30.4", label: "J30.4 - Viêm mũi dị ứng thời tiết" },
      { value: "H66.9", label: "H66.9 - Viêm tai giữa cấp/mạn" },
      { value: "H60.9", label: "H60.9 - Viêm tai ngoài" },
    ],
  },
  {
    label: "🍽️ Tiêu hóa & Gan Mật",
    options: [
      { value: "K21.9", label: "K21.9 - Trào ngược dạ dày thực quản (GERD)" },
      { value: "K25.9", label: "K25.9 - Loét dạ dày" },
      { value: "K26.9", label: "K26.9 - Loét tá tràng" },
      { value: "K29.0", label: "K29.0 - Viêm dạ dày xuất huyết cấp" },
      { value: "K58.9", label: "K58.9 - Hội chứng ruột kích thích (IBS)" },
      { value: "K30", label: "K30 - Chứng khó tiêu chức năng" },
      { value: "K59.0", label: "K59.0 - Táo bón mạn tính" },
      { value: "K76.0", label: "K76.0 - Gan nhiễm mỡ không do rượu" },
      { value: "B18.2", label: "B18.2 - Viêm gan virus B / C mạn tính" },
      { value: "K80.2", label: "K80.2 - Sỏi túi mật không kèm viêm" },
      { value: "K64.9", label: "K64.9 - Trĩ nội / trĩ ngoại" },
    ],
  },
  {
    label: "❤️ Tim mạch & Tuần hoàn",
    options: [
      { value: "I10", label: "I10 - Tăng huyết áp nguyên phát" },
      { value: "I15.9", label: "I15.9 - Tăng huyết áp thứ phát" },
      { value: "I20.9", label: "I20.9 - Cơn đau thắt ngực (Thiếu máu cơ tim)" },
      { value: "I25.9", label: "I25.9 - Bệnh tim thiếu máu cục bộ mạn tính" },
      { value: "I50.9", label: "I50.9 - Suy tim, không xác định" },
      { value: "I49.9", label: "I49.9 - Rối loạn nhịp tim" },
      { value: "I48", label: "I48 - Rung nhĩ và cuồng nhĩ" },
      { value: "I83.9", label: "I83.9 - Suy giãn tĩnh mạch chi dưới" },
      { value: "I67.8", label: "I67.8 - Thiểu năng tuần hoàn não / Rối loạn tiền đình" },
    ],
  },
  {
    label: "🦴 Cơ xương khớp & Cột sống",
    options: [
      { value: "M54.5", label: "M54.5 - Đau thắt lưng cấp/mạn (Đau lưng cơ năng)" },
      { value: "M51.2", label: "M51.2 - Thoát vị đĩa đệm cột sống thắt lưng" },
      { value: "M50.9", label: "M50.9 - Thoái hóa / Thoát vị đĩa đệm cột sống cổ" },
      { value: "M47.9", label: "M47.9 - Thoái hóa cột sống" },
      { value: "M17.9", label: "M17.9 - Thoái hóa khớp gối" },
      { value: "M19.9", label: "M19.9 - Thoái hóa khớp khác" },
      { value: "M79.1", label: "M79.1 - Đau cơ, hội chứng đau mỏi vai gáy" },
      { value: "M10.9", label: "M10.9 - Bệnh Gout (Gút) cấp/mạn" },
      { value: "M06.9", label: "M06.9 - Viêm khớp dạng thấp" },
      { value: "M81.9", label: "M81.9 - Loãng xương không kèm gãy xương" },
    ],
  },
  {
    label: "🧠 Thần kinh & Tâm thần",
    options: [
      { value: "G43.9", label: "G43.9 - Đau đầu Migraine (Đau nửa đầu)" },
      { value: "G44.2", label: "G44.2 - Đau đầu do căng thẳng" },
      { value: "G45.9", label: "G45.9 - Cơn thiếu máu não thoáng qua (TIA)" },
      { value: "G51.0", label: "G51.0 - Liệt dây thần kinh số VII ngoại biên" },
      { value: "G47.0", label: "G47.0 - Rối loạn giấc ngủ, mất ngủ mạn tính" },
      { value: "F41.9", label: "F41.9 - Rối loạn lo âu lan tỏa" },
      { value: "F32.9", label: "F32.9 - Giai đoạn trầm cảm nhẹ/vừa" },
    ],
  },
  {
    label: "🩸 Nội tiết & Chuyển hóa",
    options: [
      { value: "E11.9", label: "E11.9 - Đái tháo đường type 2 (Tiểu đường không biến chứng)" },
      { value: "E10.9", label: "E10.9 - Đái tháo đường type 1" },
      { value: "E78.5", label: "E78.5 - Rối loạn lipid máu (Mỡ máu cao / Tăng cholesterol)" },
      { value: "E04.9", label: "E04.9 - Bướu giáp nhân lành tính" },
      { value: "E05.9", label: "E05.9 - Cường giáp (Basedow)" },
      { value: "E03.9", label: "E03.9 - Suy giáp" },
      { value: "E79.0", label: "E79.0 - Tăng acid uric máu không triệu chứng" },
      { value: "E66.9", label: "E66.9 - Thừa cân, béo phì" },
    ],
  },
  {
    label: "💧 Thận & Tiết niệu",
    options: [
      { value: "N39.0", label: "N39.0 - Nhiễm trùng đường tiết niệu (UTI)" },
      { value: "N30.9", label: "N30.9 - Viêm bàng quang cấp" },
      { value: "N20.0", label: "N20.0 - Sỏi thận" },
      { value: "N20.1", label: "N20.1 - Sỏi niệu quản" },
      { value: "N40", label: "N40 - Phì đại lành tính tuyến tiền liệt (BPH)" },
      { value: "N18.9", label: "N18.9 - Bệnh thận mạn tính" },
    ],
  },
  {
    label: "🌸 Da liễu & Dị ứng",
    options: [
      { value: "L20.9", label: "L20.9 - Viêm da cơ địa (Eczema)" },
      { value: "L50.9", label: "L50.9 - Mề đay dị ứng cấp/mạn" },
      { value: "L30.9", label: "L30.9 - Viêm da tiếp xúc dị ứng" },
      { value: "B35.9", label: "B35.9 - Nấm da, hắc lào" },
      { value: "B36.0", label: "B36.0 - Lang ben" },
      { value: "L70.0", label: "L70.0 - Mụn trứng cá thông thường" },
      { value: "B02.9", label: "B02.9 - Bệnh Zona thần kinh (Herpes zoster)" },
      { value: "L40.9", label: "L40.9 - Bệnh vẩy nến" },
    ],
  },
  {
    label: "👁️ Mắt / Nhãn khoa",
    options: [
      { value: "H10.9", label: "H10.9 - Viêm kết mạc cấp (Đau mắt đỏ)" },
      { value: "H00.0", label: "H00.0 - Chắp, lẹo mắt" },
      { value: "H52.1", label: "H52.1 - Tật cận thị" },
      { value: "H52.2", label: "H52.2 - Tật loạn thị" },
      { value: "H04.1", label: "H04.1 - Hội chứng khô mắt / Mỏi mắt điều tiết" },
    ],
  },
  {
    label: "🦠 Bệnh Truyền nhiễm",
    options: [
      { value: "A90", label: "A90 - Sốt xuất huyết Dengue" },
      { value: "B01.9", label: "B01.9 - Bệnh thủy đậu không biến chứng" },
      { value: "B08.4", label: "B08.4 - Bệnh tay chân miệng" },
      { value: "A16.9", label: "A16.9 - Bệnh lao phổi" },
      { value: "B82.9", label: "B82.9 - Nhiễm ký sinh trùng đường ruột" },
    ],
  },
  {
    label: "👩‍⚕️ Sản - Phụ khoa",
    options: [
      { value: "N76.0", label: "N76.0 - Viêm âm đạo cấp tính" },
      { value: "N72", label: "N72 - Viêm cổ tử cung" },
      { value: "N94.6", label: "N94.6 - Đau bụng kinh (Thống kinh)" },
      { value: "N91.2", label: "N91.2 - Rối loạn kinh nguyệt" },
      { value: "Z32.1", label: "Z32.1 - Mang thai, xác định" },
    ],
  },
  {
    label: "🦷 Răng - Hàm - Mặt & Nha khoa",
    options: [
      { value: "K08.8", label: "K08.8 - Đau răng, đau hàm cấp/mạn" },
      { value: "K02.9", label: "K02.9 - Sâu răng không xác định" },
      { value: "K04.0", label: "K04.0 - Viêm tủy răng cấp/mạn" },
      { value: "K04.7", label: "K04.7 - Áp xe quanh chóp răng" },
      { value: "K05.0", label: "K05.0 - Viêm lợi (viêm nướu) cấp tính" },
      { value: "K05.3", label: "K05.3 - Viêm nha chu mạn tính" },
      { value: "K01.1", label: "K01.1 - Răng khôn mọc lệch / Răng mọc ngầm" },
      { value: "K05.2", label: "K05.2 - Lợi trùm răng khôn (Viêm quanh thân răng)" },
      { value: "K12.0", label: "K12.0 - Viêm loét miệng tái phát (Nhiệt miệng)" },
      { value: "K03.0", label: "K03.0 - Mòn răng cơ học / Mòn cổ chân răng" },
      { value: "K07.6", label: "K07.6 - Rối loạn khớp thái dương hàm (TMJ)" },
    ],
  },
  {
    label: "🧒 Nhi khoa",
    options: [
      { value: "R56.0", label: "R56.0 - Co giật do sốt cao ở trẻ em" },
      { value: "E44.0", label: "E44.0 - Suy dinh dưỡng protein - năng lượng" },
      { value: "E55.0", label: "E55.0 - Còi xương do thiếu Vitamin D" },
      { value: "B08.4", label: "B08.4 - Bệnh tay chân miệng ở trẻ em" },
      { value: "L74.3", label: "L74.3 - Rôm sảy, hăm tã ở trẻ" },
      { value: "A08.0", label: "A08.0 - Tiêu chảy cấp do Rotavirus" },
      { value: "J21.9", label: "J21.9 - Viêm tiểu phế quản cấp ở trẻ nhỏ" },
    ],
  },
];

// Gợi ý liều dùng phổ biến
const QUICK_DOSAGE_OPTIONS = [
  "1 viên x 2 lần/ngày (sáng, tối sau ăn)",
  "1 viên x 3 lần/ngày (sau ăn)",
  "2 viên x 2 lần/ngày (sau ăn)",
  "1 viên khi đau hoặc sốt ≥ 38.5°C (cách 4-6h)",
  "Uống trước ăn 30 phút",
  "1 gói x 2 lần/ngày (pha nước ấm)",
];

// Component Creatable Select cho chẩn đoán ICD-10
const DiagnosisSelect = ({ value, onChange, placeholder }) => {
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: "38px",
      borderRadius: "7px",
      borderColor: state.isFocused ? "#0284c7" : "#cbd5e1",
      boxShadow: state.isFocused ? "0 0 0 3px rgba(2, 132, 199, 0.15)" : null,
      fontSize: "13.5px",
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
      borderRadius: "8px",
      overflow: "hidden",
    }),
    option: (provided, state) => ({
      ...provided,
      fontSize: "13px",
      backgroundColor: state.isSelected
        ? "#0284c7"
        : state.isFocused
        ? "#f0f9ff"
        : "white",
      color: state.isSelected ? "white" : "#1e293b",
      "&:hover": {
        backgroundColor: state.isSelected ? "#0284c7" : "#e0f2fe",
      },
    }),
    groupHeading: (provided) => ({
      ...provided,
      fontSize: "11.5px",
      fontWeight: "bold",
      color: "#475569",
      backgroundColor: "#f8fafc",
      padding: "6px 12px",
    }),
  };

  const formatGroupLabel = (data) => (
    <div className="d-flex justify-content-between align-items-center">
      <span>{data.label}</span>
      <span className="badge bg-secondary text-white rounded-pill px-2">
        {data.options.length}
      </span>
    </div>
  );

  return (
    <CreatableSelect
      value={value}
      onChange={onChange}
      options={ICD10_CATEGORIES}
      isClearable
      isSearchable
      styles={customStyles}
      formatGroupLabel={formatGroupLabel}
      placeholder={placeholder || "Tìm mã ICD-10 hoặc tự nhập chẩn đoán..."}
      formatCreateLabel={(inputValue) => `➕ Tạo chẩn đoán mới: "${inputValue}"`}
      noOptionsMessage={() => "Gõ để tạo chẩn đoán mới..."}
      filterOption={(option, searchText) => {
        if (!searchText) return true;
        const normSearch = removeVietnameseTones(searchText);
        const normLabel = removeVietnameseTones(option.label || "");
        const normValue = removeVietnameseTones(option.value || "");
        return normLabel.includes(normSearch) || normValue.includes(normSearch);
      }}
      className="diagnosis-select"
    />
  );
};

// Component Thông tin bệnh nhân (Grid 12 cột chuẩn, auto tính tuổi)
const PatientInfoSection = ({ patientInfo, onChange, onChangeEmail }) => (
  <div className="section-card">
    <div className="section-title">
      <i className="fa fa-user-circle text-primary me-2"></i>
      <span>Thông tin hành chính bệnh nhân</span>
    </div>

    {/* Hàng 1: 12 cột */}
    <div className="row g-2 mb-2">
      <div className="col-md-3">
        <label className="form-label">Họ và tên *:</label>
        <input
          type="text"
          className="form-control"
          value={patientInfo.fullName}
          onChange={(e) => onChange("fullName", e.target.value)}
          placeholder="Nhập họ và tên"
        />
      </div>
      <div className="col-md-2">
        <label className="form-label">Ngày sinh:</label>
        <input
          type="date"
          className="form-control"
          value={patientInfo.birthDate}
          onChange={(e) => onChange("birthDate", e.target.value)}
        />
      </div>
      <div className="col-md-2">
        <label className="form-label">Tuổi:</label>
        <input
          type="number"
          className="form-control"
          value={patientInfo.age}
          onChange={(e) => onChange("age", e.target.value)}
          min="0"
          max="120"
          placeholder="Tuổi"
        />
      </div>
      <div className="col-md-2">
        <label className="form-label">Giới tính:</label>
        <select
          className="form-select form-control"
          value={patientInfo.gender}
          onChange={(e) => onChange("gender", e.target.value)}
        >
          <option value="Nam">Nam</option>
          <option value="Nữ">Nữ</option>
          <option value="Khác">Khác</option>
        </select>
      </div>
      <div className="col-md-3">
        <label className="form-label">Số điện thoại:</label>
        <input
          type="text"
          className="form-control"
          value={patientInfo.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          placeholder="Số điện thoại"
        />
      </div>
    </div>

    {/* Hàng 2: 12 cột */}
    <div className="row g-2 mb-2">
      <div className="col-md-4">
        <label className="form-label">Email bệnh nhân (nhận đơn thuốc) *:</label>
        <input
          type="email"
          className="form-control"
          value={patientInfo.email}
          onChange={onChangeEmail}
          placeholder="email@example.com"
          required
        />
      </div>
      <div className="col-md-5">
        <label className="form-label">Địa chỉ cư trú:</label>
        <input
          type="text"
          className="form-control"
          value={patientInfo.address}
          onChange={(e) => onChange("address", e.target.value)}
          placeholder="Số nhà, tên đường, phường/xã"
        />
      </div>
      <div className="col-md-3">
        <label className="form-label">Tỉnh / Thành phố:</label>
        <input
          type="text"
          className="form-control"
          value={patientInfo.city}
          onChange={(e) => onChange("city", e.target.value)}
          placeholder="Tỉnh/Thành phố"
        />
      </div>
    </div>

    {/* Hàng 3: 12 cột */}
    <div className="row g-2">
      <div className="col-md-2">
        <label className="form-label">Cân nặng (kg):</label>
        <input
          type="number"
          className="form-control"
          value={patientInfo.weight}
          onChange={(e) => onChange("weight", e.target.value)}
          placeholder="VD: 60"
          step="0.5"
        />
      </div>
      <div className="col-md-2">
        <label className="form-label">Chiều cao (cm):</label>
        <input
          type="number"
          className="form-control"
          value={patientInfo.height}
          onChange={(e) => onChange("height", e.target.value)}
          placeholder="VD: 170"
        />
      </div>
      <div className="col-md-3">
        <label className="form-label">Nghề nghiệp:</label>
        <input
          type="text"
          className="form-control"
          value={patientInfo.occupation}
          onChange={(e) => onChange("occupation", e.target.value)}
          placeholder="Nghề nghiệp"
        />
      </div>
      <div className="col-md-5">
        <label className="form-label">Ghi chú hành chính / BHYT:</label>
        <input
          type="text"
          className="form-control"
          value={patientInfo.note}
          onChange={(e) => onChange("note", e.target.value)}
          placeholder="Mã thẻ BHYT hoặc thông tin đặc biệt"
        />
      </div>
    </div>
  </div>
);

// Component Khám lâm sàng & Chẩn đoán
const ExaminationSection = ({ examInfo, onChange, allergyWarning }) => {
  return (
    <div className="section-card">
      <div className="section-title">
        <i className="fa fa-stethoscope text-primary me-2"></i>
        <span>Khám lâm sàng & Chẩn đoán bệnh</span>
      </div>

      <div className="row g-3 mb-2">
        <div className="col-md-6">
          <label className="form-label">Khám lâm sàng chung:</label>
          <textarea
            className="form-control"
            rows="2"
            value={examInfo.clinicalExam}
            onChange={(e) => onChange("clinicalExam", e.target.value)}
            placeholder="VD: Mạch 75 l/p, HA: 120/80 mmHg, tim đều, phổi trong, bụng mềm..."
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Khám chuyên khoa chi tiết:</label>
          <textarea
            className="form-control"
            rows="2"
            value={examInfo.detailExam}
            onChange={(e) => onChange("detailExam", e.target.value)}
            placeholder="VD: Niêm mạc họng hồng, không giả mạc, amidan không sưng mủ..."
          />
        </div>
      </div>

      <div className="row g-3 mb-2">
        <div className="col-md-7">
          <label className="form-label">
            🎯 Chẩn đoán xác định (ICD-10) *:
          </label>
          <DiagnosisSelect
            value={
              examInfo.diagnosis
                ? { value: examInfo.diagnosis, label: examInfo.diagnosis }
                : null
            }
            onChange={(opt) => {
              onChange("diagnosis", opt ? opt.label || opt.value : "");
            }}
            placeholder="Tìm mã ICD-10 hoặc tự nhập chẩn đoán bệnh..."
          />
        </div>
        <div className="col-md-5">
          <label className="form-label">⚠️ Tiền sử dị ứng thuốc:</label>
          <input
            className="form-control"
            value={examInfo.allergy}
            onChange={(e) => onChange("allergy", e.target.value)}
            placeholder="VD: Không có hoặc Penicillin, Aspirin..."
          />
        </div>
      </div>

      {allergyWarning && (
        <div className="allergy-alert-banner">
          <i className="fa fa-exclamation-triangle fs-5 me-2"></i>
          <div>
            <strong>CẢNH BÁO AN TOÀN THUỐC:</strong> {allergyWarning}
          </div>
        </div>
      )}

      <div className="row g-3 mt-1">
        <div className="col-md-6">
          <label className="form-label">💬 Lời dặn của bác sĩ:</label>
          <textarea
            className="form-control"
            rows="2"
            value={examInfo.advice}
            onChange={(e) => onChange("advice", e.target.value)}
            placeholder="VD: Nghỉ ngơi, uống nhiều nước, ăn lỏng dễ tiêu, tái khám sau 3-5 ngày..."
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">📝 Kết luận & Hướng điều trị:</label>
          <textarea
            className="form-control"
            rows="2"
            value={examInfo.conclusion}
            onChange={(e) => onChange("conclusion", e.target.value)}
            placeholder="VD: Điều trị ngoại trú theo đơn thuốc, theo dõi nhiệt độ..."
          />
        </div>
      </div>
    </div>
  );
};

// Component Bảng đơn thuốc kèm gợi ý liều dùng nhanh
const PrescriptionTable = ({
  prescription,
  onPrescriptionChange,
  onQuantityBlur,
  onRemoveMedicine,
  onQuickDosageApply,
  examinationPrice = 300000,
  medicinePrice = 0,
  totalPrice = 300000,
}) => (
  <div className="prescription-table-container section-card">
    <div className="d-flex justify-content-between align-items-center mb-2">
      <div className="section-title mb-0 border-0 p-0">
        <i className="fa fa-medkit text-primary me-2"></i>
        <span>Danh mục thuốc chỉ định điều trị</span>
      </div>
      <small className="text-muted">
        (Có thể gửi kết luận không kê thuốc nếu bệnh nhân chỉ khám tư vấn)
      </small>
    </div>

    {/* Quick Dosage Chips */}
    {prescription && prescription.length > 0 && (
      <div className="dosage-chips-container mb-3">
        <span className="dosage-chips-lbl">
          <i className="fa fa-bolt text-warning me-1"></i>
          Gợi ý liều dùng nhanh:
        </span>
        {QUICK_DOSAGE_OPTIONS.map((item, idx) => (
          <span
            key={idx}
            className="dosage-chip"
            onClick={() => onQuickDosageApply(item)}
            title="Bấm để áp dụng nhanh liều dùng này"
          >
            + {item}
          </span>
        ))}
      </div>
    )}

    <div className="table-responsive">
      <table className="table table-bordered table-hover align-middle mb-0">
        <thead>
          <tr>
            <th style={{ width: "45px", textAlign: "center" }}>STT</th>
            <th style={{ minWidth: "220px" }}>Tên thuốc & Quy cách</th>
            <th style={{ width: "80px", textAlign: "center" }}>ĐVT</th>
            <th style={{ width: "90px", textAlign: "center" }}>Số lượng</th>
            <th style={{ minWidth: "200px" }}>Liều dùng & Cách dùng *</th>
            <th style={{ width: "130px" }}>Ghi chú</th>
            <th style={{ width: "110px", textAlign: "right" }}>Đơn giá</th>
            <th style={{ width: "120px", textAlign: "right" }}>Thành tiền</th>
            <th style={{ width: "50px", textAlign: "center" }}>Xóa</th>
          </tr>
        </thead>
        <tbody>
          {prescription && prescription.length > 0 ? (
            prescription.map((med, idx) => (
              <tr key={med.value || idx}>
                <td style={{ textAlign: "center", fontWeight: "600", color: "#64748b" }}>
                  {idx + 1}
                </td>
                <td>
                  <div className="med-name">{med.name}</div>
                  {med.description ? (
                    <div className="med-desc">{med.description}</div>
                  ) : (
                    <div className="med-desc">Đơn vị: {med.unit || "viên"}</div>
                  )}
                </td>
                <td style={{ textAlign: "center" }}>
                  <span className="badge bg-light text-dark border">
                    {med.unit || "viên"}
                  </span>
                </td>
                <td>
                  <input
                    type="number"
                    min={1}
                    className="form-control form-control-sm text-center fw-bold"
                    value={med.quantity}
                    onChange={(e) =>
                      onPrescriptionChange(idx, "quantity", e.target.value)
                    }
                    onBlur={() => onQuantityBlur(idx)}
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
                    placeholder="VD: 1 viên x 2 lần/ngày (sau ăn)"
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
                    placeholder="VD: Sau ăn"
                  />
                </td>
                <td style={{ textAlign: "right" }}>
                  {Number(med.price || 0).toLocaleString("vi-VN")} đ
                </td>
                <td style={{ textAlign: "right", fontWeight: "700", color: "#0284c7" }}>
                  {Number(med.total || 0).toLocaleString("vi-VN")} đ
                </td>
                <td style={{ textAlign: "center" }}>
                  <button
                    type="button"
                    className="btn-delete-med"
                    onClick={() => onRemoveMedicine(idx)}
                    title="Xóa thuốc khỏi toa"
                  >
                    <i className="fa fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={9} className="text-center text-muted py-4">
                <i className="fa fa-medkit fa-2x text-muted mb-2 d-block"></i>
                <div style={{ fontStyle: "italic", fontSize: "13px" }}>
                  Chưa kê đơn thuốc. Bạn có thể tìm thuốc ở ô bên dưới hoặc gửi hóa đơn chỉ tính phí khám.
                </div>
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr style={{ backgroundColor: "#f8fafc" }}>
            <td colSpan={7} style={{ textAlign: "right", fontWeight: "600", color: "#334155" }}>
              1. Phí khám bệnh chuyên khoa:
            </td>
            <td colSpan={2} style={{ textAlign: "right", fontWeight: "700", color: "#0284c7" }}>
              {Number(examinationPrice).toLocaleString("vi-VN")} đ
            </td>
          </tr>
          <tr style={{ backgroundColor: "#f8fafc" }}>
            <td colSpan={7} style={{ textAlign: "right", fontWeight: "600", color: "#334155" }}>
              2. Tiền thuốc điều trị theo đơn:
            </td>
            <td colSpan={2} style={{ textAlign: "right", fontWeight: "700", color: "#0284c7" }}>
              {Number(medicinePrice).toLocaleString("vi-VN")} đ
            </td>
          </tr>
          <tr style={{ backgroundColor: "#f0fdf4", borderTop: "2px solid #86efac" }}>
            <td colSpan={7} style={{ textAlign: "right", fontWeight: "800", color: "#dc2626", fontSize: "14.5px" }}>
              TỔNG VIỆN PHÍ (Phí khám + Tiền thuốc):
            </td>
            <td colSpan={2} style={{ textAlign: "right", fontWeight: "800", color: "#dc2626", fontSize: "16px" }}>
              {Number(totalPrice).toLocaleString("vi-VN")} đ
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
);

class RemedyModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      patientInfo: {
        fullName: "",
        birthDate: "",
        age: "",
        gender: "Nam",
        address: "",
        city: "",
        phone: "",
        email: "",
        weight: "",
        height: "",
        occupation: "",
        note: "",
      },
      examInfo: {
        clinicalExam: "Tim đều, phổi trong, bụng mềm, không sốt",
        detailExam: "Khám chuyên khoa bình thường",
        diagnosis: "",
        advice: "Nghỉ ngơi, uống nhiều nước, tái khám khi có dấu hiệu bất thường",
        allergy: "Không",
        conclusion: "Điều trị ngoại trú theo đơn thuốc",
      },
      medicines: [],
      selectedMedicine: null,
      prescription: [],
      examinationPrice: 300000,
      medicinePrice: 0,
      totalPrice: 300000,
      isLoading: false,
    };
  }

  async componentDidMount() {
    this.initModalData();
    await this.loadAllMedicines();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.dataModal !== this.props.dataModal ||
      (!prevProps.isOpenModal && this.props.isOpenModal)
    ) {
      this.initModalData();
    }
  }

  // Khởi tạo sạch dữ liệu từ ca khám thực tế
  initModalData = () => {
    const { dataModal } = this.props;
    if (!dataModal || _.isEmpty(dataModal)) return;

    const patientName =
      dataModal.patientName ||
      `${dataModal.patientData?.firstName || ""} ${dataModal.patientData?.lastName || ""}`.trim() ||
      "";
    const patientPhone =
      dataModal.patientPhone ||
      dataModal.patientData?.phoneNumber ||
      "";
    const patientAddress =
      dataModal.patientAddress ||
      dataModal.patientData?.address ||
      "";
    const patientGender =
      dataModal.patientGender ||
      dataModal.patientData?.genderData?.valueVi ||
      "Nam";
    const patientEmail =
      dataModal.email ||
      dataModal.patientData?.email ||
      "";
    const examPrice = Number(dataModal.examinationPrice || 300000);

    this.setState({
      patientInfo: {
        fullName: patientName,
        birthDate: "",
        age: "",
        gender: patientGender,
        address: patientAddress,
        city: "",
        phone: patientPhone,
        email: patientEmail,
        weight: "",
        height: "",
        occupation: "",
        note: "",
      },
      examInfo: {
        clinicalExam: "Tim đều, phổi trong, bụng mềm, không sốt",
        detailExam: "Khám chuyên khoa bình thường",
        diagnosis: "",
        advice: "Nghỉ ngơi, uống nhiều nước, tái khám khi có dấu hiệu bất thường",
        allergy: "Không",
        conclusion: "Điều trị ngoại trú theo đơn thuốc",
      },
      prescription: [],
      selectedMedicine: null,
      examinationPrice: examPrice,
      medicinePrice: 0,
      totalPrice: examPrice,
    });
  };

  // Tải danh sách thuốc từ cơ sở dữ liệu
  loadAllMedicines = async () => {
    try {
      this.setState({ isLoading: true });
      const response = await getAllMedicines();
      if (response?.data && response.errCode === 0) {
        const uniqueMedicines = [];
        const seenNames = new Set();

        response.data.forEach((item) => {
          const key = (item.name || "").trim().toLowerCase();
          if (!seenNames.has(key)) {
            seenNames.add(key);
            uniqueMedicines.push(item);
          }
        });

        const medicineOptions = uniqueMedicines.map((item) => ({
          value: item.id,
          label: `${item.name} (${item.unit || "viên"}) - ${Number(item.price || 0).toLocaleString("vi-VN")} đ${item.description ? ` - ${item.description}` : ""}`,
          name: item.name,
          description: item.description || "",
          price: item.price || 0,
          unit: item.unit || "viên",
        }));
        this.setState({ medicines: medicineOptions });
      }
    } catch (error) {
      console.error("Error loading medicines:", error);
    } finally {
      this.setState({ isLoading: false });
    }
  };

  // Xử lý thay đổi thông tin bệnh nhân & tự tính tuổi
  handlePatientInfoChange = (field, value) => {
    const newPatientInfo = {
      ...this.state.patientInfo,
      [field]: value,
    };

    if (field === "birthDate" && value) {
      const birthYear = new Date(value).getFullYear();
      const currentYear = new Date().getFullYear();
      if (birthYear && birthYear <= currentYear) {
        newPatientInfo.age = String(currentYear - birthYear);
      }
    }

    this.setState({ patientInfo: newPatientInfo });
  };

  handleExamInfoChange = (field, value) => {
    this.setState({
      examInfo: {
        ...this.state.examInfo,
        [field]: value,
      },
    });
  };

  handleEmailChange = (event) => {
    this.setState({
      patientInfo: {
        ...this.state.patientInfo,
        email: event.target.value,
      },
    });
  };

  // Chọn thêm thuốc vào toa
  handleMedicineSelect = (selectedOption) => {
    if (!selectedOption) return;

    const medicineExists = this.state.prescription.some(
      (item) => item.value === selectedOption.value
    );

    if (medicineExists) {
      toast.warn(`Thuốc "${selectedOption.name}" đã có trong toa thuốc!`);
      return;
    }

    const newMedicine = {
      ...selectedOption,
      quantity: 1,
      dosage: "",
      note: "",
      total: Number(selectedOption.price || 0),
    };

    this.setState(
      {
        prescription: [...this.state.prescription, newMedicine],
        selectedMedicine: null,
      },
      this.calculateTotalPrice
    );
  };

  // Thay đổi thông tin trong bảng thuốc
  handlePrescriptionChange = (index, field, value) => {
    const updatedPrescription = [...this.state.prescription];
    if (!updatedPrescription[index]) return;

    if (field === "quantity") {
      if (value === "") {
        updatedPrescription[index].quantity = "";
        updatedPrescription[index].total = 0;
      } else {
        const q = Math.max(1, parseInt(value, 10) || 1);
        updatedPrescription[index].quantity = q;
        updatedPrescription[index].total = q * Number(updatedPrescription[index].price || 0);
      }
    } else {
      updatedPrescription[index][field] = value;
    }

    this.setState(
      { prescription: updatedPrescription },
      this.calculateTotalPrice
    );
  };

  // Rời ô số lượng thuốc: chuẩn hóa giá trị tối thiểu 1
  handleQuantityBlur = (index) => {
    const updatedPrescription = [...this.state.prescription];
    if (!updatedPrescription[index]) return;

    const currentQty = parseInt(updatedPrescription[index].quantity, 10);
    const validQty = isNaN(currentQty) || currentQty < 1 ? 1 : currentQty;
    updatedPrescription[index].quantity = validQty;
    updatedPrescription[index].total = validQty * Number(updatedPrescription[index].price || 0);

    this.setState(
      { prescription: updatedPrescription },
      this.calculateTotalPrice
    );
  };

  // Xóa thuốc khỏi toa
  handleRemoveMedicine = (index) => {
    const updatedPrescription = [...this.state.prescription];
    updatedPrescription.splice(index, 1);

    this.setState(
      { prescription: updatedPrescription },
      this.calculateTotalPrice
    );
  };

  // Áp dụng liều dùng nhanh
  handleQuickDosageApply = (dosageText) => {
    const { prescription } = this.state;
    if (!prescription || prescription.length === 0) {
      toast.info("Vui lòng chọn thuốc vào toa trước khi chọn liều dùng gợi ý!");
      return;
    }

    let targetIndex = prescription.findIndex((m) => !m.dosage || m.dosage.trim() === "");
    if (targetIndex === -1) {
      targetIndex = prescription.length - 1;
    }

    const updated = [...prescription];
    updated[targetIndex].dosage = dosageText;
    this.setState({ prescription: updated });
    toast.success(`Đã áp dụng liều dùng cho thuốc: ${updated[targetIndex].name}`);
  };

  // Tính lại tổng tiền
  calculateTotalPrice = () => {
    const medicinePrice = this.state.prescription.reduce(
      (sum, med) => sum + (Number(med.total) || 0),
      0
    );
    const examinationPrice = Number(
      this.state.examinationPrice || this.props.dataModal?.examinationPrice || 300000
    );
    const totalPrice = examinationPrice + medicinePrice;
    this.setState({
      medicinePrice,
      examinationPrice,
      totalPrice,
    });
  };

  // Kiểm tra cảnh báo dị ứng thuốc
  checkAllergyWarning = () => {
    const { examInfo, prescription } = this.state;
    const allergyText = (examInfo.allergy || "").toLowerCase().trim();
    if (!allergyText || allergyText === "không" || allergyText === "khong") return null;

    const matchedMedicines = [];
    prescription.forEach((med) => {
      const medName = (med.name || "").toLowerCase();
      const words = allergyText.split(/[,;\s]+/).filter((w) => w.length > 3);
      for (let word of words) {
        if (medName.includes(word)) {
          matchedMedicines.push(med.name);
          break;
        }
      }
    });

    if (matchedMedicines.length > 0) {
      return `Phát hiện thuốc "${matchedMedicines.join(", ")}" có thể liên quan đến tiền sử dị ứng (${examInfo.allergy}) của bệnh nhân!`;
    }
    return null;
  };

  // Gửi toa thuốc & hóa đơn khám bệnh
  handleSendRemedy = () => {
    const {
      patientInfo,
      examInfo,
      prescription,
      medicinePrice,
      examinationPrice,
      totalPrice,
    } = this.state;

    // 1. Kiểm tra họ tên
    if (!patientInfo.fullName || patientInfo.fullName.trim() === "") {
      toast.error("Vui lòng nhập họ và tên bệnh nhân!");
      return;
    }

    // 2. Kiểm tra email
    if (!patientInfo.email || patientInfo.email.trim() === "") {
      toast.error("Vui lòng nhập email bệnh nhân để gửi toa thuốc!");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(patientInfo.email.trim())) {
      toast.error("Định dạng email bệnh nhân không hợp lệ (ví dụ: ten@example.com)!");
      return;
    }

    // 3. Kiểm tra chẩn đoán
    if (!examInfo.diagnosis || examInfo.diagnosis.trim() === "") {
      toast.error("Vui lòng chọn hoặc nhập chẩn đoán bệnh (ICD-10)!");
      return;
    }

    // 4. Kiểm tra liều dùng nếu có kê thuốc
    if (prescription.length > 0) {
      const missingDosageMed = prescription.find(
        (m) => !m.dosage || String(m.dosage).trim() === ""
      );
      if (missingDosageMed) {
        toast.warn(`Thuốc "${missingDosageMed.name}" chưa có liều dùng/cách dùng. Vui lòng nhập hướng dẫn uống thuốc trước khi gửi!`);
        return;
      }
    }

    // Gửi dữ liệu ra component cha
    this.props.sendRemedy({
      patientInfo: {
        ...patientInfo,
        fullName: patientInfo.fullName.trim(),
        email: patientInfo.email.trim(),
      },
      examInfo: {
        ...examInfo,
        diagnosis: examInfo.diagnosis.trim(),
      },
      prescription: prescription.map((m) => ({
        ...m,
        quantity: Math.max(1, Number(m.quantity) || 1),
        total: Math.max(1, Number(m.quantity) || 1) * Number(m.price || 0),
      })),
      medicinePrice: Number(medicinePrice) || 0,
      examinationPrice: Number(examinationPrice) || 300000,
      totalPrice: Number(totalPrice) || (Number(examinationPrice) + Number(medicinePrice)),
    });
  };

  render() {
    const { isOpenModal, closeRemedyModal, isProcessing } = this.props;
    const {
      patientInfo,
      examInfo,
      medicines,
      selectedMedicine,
      prescription,
      examinationPrice,
      medicinePrice,
      totalPrice,
      isLoading,
    } = this.state;

    const allergyWarning = this.checkAllergyWarning();

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
              <i className="fa fa-file-text-o me-2"></i>
              <span>Kê khai thông tin khám bệnh & Toa thuốc điện tử</span>
            </span>
            <button
              type="button"
              className="btn-close-modal"
              onClick={closeRemedyModal}
              title="Đóng cửa sổ"
            >
              <i className="fa fa-times"></i>
            </button>
          </div>

          {/* Body */}
          <div className="modal-booking-body">
            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Đang tải...</span>
                </div>
                <div className="mt-2 text-muted">Đang chuẩn bị danh mục y tế...</div>
              </div>
            ) : (
              <>
                {/* 1. Thông tin bệnh nhân */}
                <PatientInfoSection
                  patientInfo={patientInfo}
                  onChange={this.handlePatientInfoChange}
                  onChangeEmail={this.handleEmailChange}
                />

                {/* 2. Thông tin khám bệnh & Chẩn đoán */}
                <ExaminationSection
                  examInfo={examInfo}
                  onChange={this.handleExamInfoChange}
                  allergyWarning={allergyWarning}
                />

                {/* 3. Tìm kiếm thuốc thông minh */}
                <div className="section-card">
                  <div className="section-title">
                    <i className="fa fa-search text-primary me-2"></i>
                    <span>Tìm kiếm & Thêm thuốc vào toa</span>
                  </div>
                  <Select
                    value={selectedMedicine}
                    onChange={this.handleMedicineSelect}
                    options={medicines}
                    placeholder="Nhập tên thuốc hoặc công dụng (hỗ trợ tiếng Việt không dấu, ví dụ: ha sot, khang sinh)..."
                    isClearable
                    isSearchable
                    noOptionsMessage={() => "Không tìm thấy thuốc phù hợp trong danh mục"}
                    loadingMessage={() => "Đang tìm kiếm..."}
                    filterOption={(option, searchText) => {
                      if (!searchText) return true;
                      const normSearch = removeVietnameseTones(searchText);
                      const normLabel = removeVietnameseTones(option.label || "");
                      return normLabel.includes(normSearch);
                    }}
                    className="medicine-select"
                  />
                </div>

                {/* 4. Bảng toa thuốc & tổng viện phí */}
                <PrescriptionTable
                  prescription={prescription}
                  onPrescriptionChange={this.handlePrescriptionChange}
                  onQuantityBlur={this.handleQuantityBlur}
                  onRemoveMedicine={this.handleRemoveMedicine}
                  onQuickDosageApply={this.handleQuickDosageApply}
                  examinationPrice={examinationPrice}
                  medicinePrice={medicinePrice}
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
              disabled={isLoading || isProcessing}
            >
              {isProcessing ? (
                <>
                  <i className="fa fa-spinner fa-spin me-2"></i>
                  <span>Đang xử lý & gửi đơn...</span>
                </>
              ) : (
                <>
                  <i className="fa fa-paper-plane me-2"></i>
                  <span>Gửi đơn thuốc & Hóa đơn viện phí</span>
                </>
              )}
            </button>
            <button
              className="btn-booking-cancel"
              onClick={closeRemedyModal}
              disabled={isProcessing}
            >
              <i className="fa fa-times me-2"></i>
              <span>Hủy bỏ</span>
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
