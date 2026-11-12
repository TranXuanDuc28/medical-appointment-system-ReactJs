import React, { Component } from "react";
import { connect } from "react-redux";
import { Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import HomeHeader from "../../HomePage/HomeHeader";
import HomeFooter from "../../HomePage/HomeFooter";
import { getAllSpecialty } from "../../../services/userServices";
import { getTopDoctorServices } from "../../../services/doctorServices";
import "./MedicalFacilityPage.scss";

// Dữ liệu mặc định các khoa phòng tại bệnh viện
const HOSPITAL_DEPARTMENTS = [
  {
    id: 1,
    name: "Khoa Tim Mạch & Can Thiệp Mạch",
    room: "Phòng 201 - 205 (Tầng 2, Tòa A)",
    headDoctor: "PGS.TS.BS Nguyễn Văn An",
    desc: "Chẩn đoán và điều trị bệnh mạch vành, tăng huyết áp, suy tim, rối loạn nhịp tim với hệ thống máy can thiệp DSA hiện đại.",
    icon: "fa-heartbeat",
    gradient: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
    specialtyId: 1,
    casesPerDay: "120+ lượt khám/ngày",
  },
  {
    id: 2,
    name: "Khoa Tiêu Hóa & Gan Mật",
    room: "Phòng 206 - 210 (Tầng 2, Tòa A)",
    headDoctor: "GS.TS.BS Hà Văn Quyết",
    desc: "Nội soi tiêu hóa không đau độ nét cao (NBI), tầm soát ung thư dạ dày - đại tràng, điều trị viêm loét, trào ngược, viêm gan virus.",
    icon: "fa-medkit",
    gradient: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
    specialtyId: 2,
    casesPerDay: "150+ lượt khám/ngày",
  },
  {
    id: 3,
    name: "Khoa Cơ Xương Khớp & Cột Sống",
    room: "Phòng 211 - 215 (Tầng 2, Tòa A)",
    headDoctor: "GS.TS.BS Vũ Văn Hòe",
    desc: "Khám và điều trị thoái hóa khớp, thoát vị đĩa đệm, đau dây thần kinh tọa, viêm khớp dạng thấp, tiêm huyết tương giàu tiểu cầu (PRP).",
    icon: "fa-wheelchair",
    gradient: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
    specialtyId: 3,
    casesPerDay: "110+ lượt khám/ngày",
  },
  {
    id: 4,
    name: "Khoa Thần Kinh & Đột Quỵ",
    room: "Phòng 301 - 305 (Tầng 3, Tòa A)",
    headDoctor: "TS.BS Trần Thị Thu Hà",
    desc: "Tầm soát nguy cơ đột quỵ, điều trị đau đầu mạn tính, mất ngủ kéo dài, rối loạn tiền đình, bệnh Parkinson và động kinh.",
    icon: "fa-user-md",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
    specialtyId: 4,
    casesPerDay: "90+ lượt khám/ngày",
  },
  {
    id: 5,
    name: "Khoa Nhi & Sơ Sinh",
    room: "Phòng 401 - 406 (Tầng 4, Tòa A)",
    headDoctor: "BSCKII Nguyễn Thị Thảo",
    desc: "Khám bệnh hô hấp, tiêu hóa, dinh dưỡng và tiêm chủng cho trẻ em. Không gian thân thiện giúp bé thoải mái, không sợ khám.",
    icon: "fa-child",
    gradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
    specialtyId: 5,
    casesPerDay: "130+ lượt khám/ngày",
  },
  {
    id: 6,
    name: "Khoa Sản Phụ Khoa",
    room: "Phòng 407 - 412 (Tầng 4, Tòa A)",
    headDoctor: "ThS.BS Ngô Thị Mỹ Lành",
    desc: "Quản lý thai kỳ trọn gói, siêu âm 5D phát hiện dị tật sớm, tầm soát ung thư cổ tử cung (HPV/Pap smear), điều trị viêm nhiễm phụ khoa.",
    icon: "fa-female",
    gradient: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
    specialtyId: 6,
    casesPerDay: "140+ lượt khám/ngày",
  },
  {
    id: 7,
    name: "Khoa Tai Mũi Họng",
    room: "Phòng 219 - 222 (Tầng 2, Tòa A)",
    headDoctor: "BSCKII Lê Tuấn Vũ",
    desc: "Nội soi Tai Mũi Họng ống mềm không đau, điều trị viêm xoang, viêm amidan, ngủ ngáy, phẫu thuật nạo VA Plasma thế hệ mới.",
    icon: "fa-stethoscope",
    gradient: "linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)",
    specialtyId: 7,
    casesPerDay: "100+ lượt khám/ngày",
  },
  {
    id: 8,
    name: "Khoa Mắt & Khúc Xạ",
    room: "Phòng 216 - 218 (Tầng 2, Tòa A)",
    headDoctor: "TS.BS Hoàng Minh Đạt",
    desc: "Đo khám khúc xạ chuyên sâu, phát hiện tật cận - viễn - loạn thị, điều trị đục thủy tinh thể (Phaco), bệnh lý võng mạc tiểu đường.",
    icon: "fa-eye",
    gradient: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
    specialtyId: 8,
    casesPerDay: "80+ lượt khám/ngày",
  },
  {
    id: 9,
    name: "Khoa Hô Hấp & Bệnh Phổi",
    room: "Phòng 306 - 310 (Tầng 3, Tòa A)",
    headDoctor: "PGS.TS Lê Thị Tuyết Lan",
    desc: "Đo chức năng thông khí phổi, tầm soát và điều trị hen phế quản, viêm phổi, bệnh phổi tắc nghẽn mạn tính (COPD), hậu COVID-19.",
    icon: "fa-heart",
    gradient: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
    specialtyId: 9,
    casesPerDay: "85+ lượt khám/ngày",
  },
  {
    id: 10,
    name: "Trung Tâm Chẩn Đoán Hình Ảnh & Xét Nghiệm",
    room: "Tầng 3, Tòa B (Khu Cận Lâm Sàng)",
    headDoctor: "TS.BS Phạm Đức Hưng",
    desc: "Trang bị máy chụp MRI 3.0 Tesla, CT Scanner 128 lát, X-quang kỹ thuật số, hệ thống xét nghiệm tự động hoàn toàn đạt chuẩn ISO 15189.",
    icon: "fa-flask",
    gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    specialtyId: 10,
    casesPerDay: "300+ lượt chụp chiếu/ngày",
  },
];

// Gói khám sức khỏe tại viện
const HOSPITAL_PACKAGES = [
  {
    id: "PK-01",
    name: "Gói Khám Sức Khỏe Tổng Quát Cơ Bản",
    badge: "Tiết kiệm",
    badgeColor: "#10b981",
    price: 1800000,
    originalPrice: 2200000,
    itemsCount: "14 danh mục khám & cận lâm sàng",
    features: [
      "Khám nội tổng quát, tai mũi họng, răng hàm mặt, mắt",
      "Xét nghiệm máu: đường huyết, mỡ máu, chức năng gan thận",
      "Tổng phân tích nước tiểu 10 thông số",
      "Chụp X-quang tim phổi thẳng kỹ thuật số",
      "Siêu âm ổ bụng tổng quát màu 4D",
      "Điện tâm đồ ECG 12 chuyển đạo",
    ],
  },
  {
    id: "PK-02",
    name: "Gói Khám Toàn Diện & Tầm Soát Ung Thư Nâng Cao",
    badge: "Bán chạy nhất",
    badgeColor: "#ef4444",
    price: 4200000,
    originalPrice: 5300000,
    itemsCount: "26 danh mục khám chuyên sâu",
    features: [
      "Toàn bộ quyền lợi của gói khám cơ bản",
      "Định lượng dấu ấn ung thư sớm (Gan, Tiêu hóa, Phổi, Tuyến tiền liệt/Vú)",
      "Chụp CT Scanner lồng ngực liều thấp",
      "Nội soi Tai Mũi Họng ống mềm độ phân giải cao",
      "Siêu âm tuyến giáp & Siêu âm mạch máu cảnh",
      "Tư vấn chế độ dinh dưỡng cá nhân hóa cùng Bác sĩ Chuyên khoa II",
    ],
  },
  {
    id: "PK-03",
    name: "Gói Tầm Soát Bệnh Lý Tim Mạch & Đột Quỵ",
    badge: "Chuyên sâu",
    badgeColor: "#8b5cf6",
    price: 2600000,
    originalPrice: 3200000,
    itemsCount: "16 danh mục chuyên biệt Tim Mạch",
    features: [
      "Khám trực tiếp bởi Bác sĩ Chuyên khoa Tim mạch giàu kinh nghiệm",
      "Điện tim đồ ECG & Siêu âm tim Doppler màu thành ngực",
      "Siêu âm Doppler động mạch cảnh tầm soát mảng xơ vữa",
      "Bộ mỡ máu toàn phần (Cholesterol, Triglycerid, HDL-C, LDL-C)",
      "Định lượng điện giải đồ và men tim",
      "Đánh giá phân tầng nguy cơ tim mạch và đột quỵ trong 10 năm",
    ],
  },
  {
    id: "PK-04",
    name: "Gói Tầm Soát Tiêu Hóa & Nội Soi Tiền Mê Không Đau",
    badge: "Nhiều người chọn",
    badgeColor: "#0284c7",
    price: 3500000,
    originalPrice: 4200000,
    itemsCount: "Nội soi Dạ dày + Đại tràng NBI",
    features: [
      "Bác sĩ Gây mê hồi sức kiểm tra trước nội soi an toàn tuyệt đối",
      "Nội soi dạ dày tiền mê công nghệ NBI nhuộm màu ảo phóng đại",
      "Nội soi toàn bộ khung đại tràng tiền mê êm ái, tỉnh ngay sau 15 phút",
      "Tìm và diệt vi khuẩn HP (Helicobacter Pylori) nhanh",
      "Cắt polyp ngay trong quá trình nội soi nếu phát hiện tổn thương nghi ngờ",
      "Chế độ ăn nhẹ dinh dưỡng phục hồi sau nội soi tại viện",
    ],
  },
];

// Sơ đồ các tầng của bệnh viện
const HOSPITAL_FLOORS = [
  {
    floor: "Tầng 1",
    name: "Khu Tiếp Đón, Cấp Cứu & Dược Phẩm",
    desc: "Khoa Cấp cứu 24/7, Quầy Lễ tân & Đăng ký khám nhanh FastTrack, Quầy Thu ngân BHYT, Nhà thuốc Bệnh viện đạt chuẩn GPP, Quầy cà phê & tiếp đón thân nhân.",
    icon: "fa-ambulance",
    color: "#ef4444",
  },
  {
    floor: "Tầng 2",
    name: "Khu Khám Chuyên Khoa Ngoại Trú (Khối Nội & Giác Quan)",
    desc: "Khoa Tim Mạch, Khoa Tiêu Hóa, Khoa Cơ Xương Khớp, Khoa Tai Mũi Họng, Khoa Mắt, Khoa Răng Hàm Mặt, Phòng đo khúc xạ, Phòng đo thính lực.",
    icon: "fa-stethoscope",
    color: "#0284c7",
  },
  {
    floor: "Tầng 3",
    name: "Trung Tâm Chẩn Đoán Hình Ảnh & Thăm Dò Chức Năng",
    desc: "Phòng chụp Cộng hưởng từ MRI 3.0T, Phòng chụp CT Scanner 128 dãy, Phòng X-quang kỹ thuật số, Hệ thống Phòng Siêu âm 4D/5D, Khu vực Nội soi tiêu hóa NBI, Khoa Xét nghiệm tự động ISO 15189.",
    icon: "fa-microchip",
    color: "#8b5cf6",
  },
  {
    floor: "Tầng 4",
    name: "Khu Khám Sản Phụ Khoa & Nhi Khoa",
    desc: "Khoa Sản Phụ khoa, Phòng khám Thai định kỳ, Phòng tiêm chủng vắc xin cho trẻ, Khu vui chơi trẻ em thân thiện, Khoa Hô hấp & Thăm dò chức năng phổi.",
    icon: "fa-baby",
    color: "#f97316",
  },
  {
    floor: "Tầng 5",
    name: "Trung Tâm Phẫu Thuật Gây Mê & Hồi Sức Tích Cực (ICU)",
    desc: "Hệ thống 8 phòng mổ vô khuẩn Hybrid áp lực dương hiện đại, Khu hồi tỉnh theo dõi sát, Đơn vị Hồi sức tích cực (ICU) trang bị máy thở và monitor trung tâm 24/24.",
    icon: "fa-procedures",
    color: "#10b981",
  },
  {
    floor: "Tầng 6 - 8",
    name: "Khu Điều Trị Nội Trú Tiêu Chuẩn & Phòng VIP",
    desc: "Phòng nội trú đơn tiêu chuẩn khách sạn, Phòng VIP đầy đủ tiện nghi (TV, sofa, chuông cấp cứu đầu giường, ban công thoáng mát), chế độ dinh dưỡng bệnh lý phục vụ tận giường.",
    icon: "fa-bed",
    color: "#0f766e",
  },
];

// Khung giờ tiếp đón khám bệnh tại viện
const TIME_SLOTS_HOSPITAL = [
  { key: "H1", label: "07:30 - 08:30", period: "Buổi sáng" },
  { key: "H2", label: "08:30 - 09:30", period: "Buổi sáng" },
  { key: "H3", label: "09:30 - 10:30", period: "Buổi sáng" },
  { key: "H4", label: "10:30 - 11:30", period: "Buổi sáng" },
  { key: "H5", label: "13:30 - 14:30", period: "Buổi chiều" },
  { key: "H6", label: "14:30 - 15:30", period: "Buổi chiều" },
  { key: "H7", label: "15:30 - 16:30", period: "Buổi chiều" },
];

class MedicalFacilityPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: "DEPARTMENTS", // DEPARTMENTS | PACKAGES | PROCESS | INSURANCE | FLOORS
      specialties: [],
      doctors: [],
      loading: true,
      searchTerm: "",

      // Booking modal tại viện
      isOpenBookingModal: false,
      selectedDepartment: null,
      selectedPackage: null,
      selectedDoctorId: "",
      patientName: "",
      patientPhone: "",
      patientGender: "M",
      patientBirthYear: "1992",
      patientAddress: "",
      patientInsuranceCode: "",
      examType: "SERVICE", // SERVICE: Khám dịch vụ theo yêu cầu | BHYT: Khám BHYT
      bookingDate: this.getDefaultDate(),
      bookingSlot: "H2",
      symptoms: "",

      // Booking success state
      bookingSuccess: false,
      receiptData: null,
      isSubmitting: false,
    };
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    this.fetchHospitalData();
    if (this.props.patientInfo) {
      this.setState({
        patientName: this.props.patientInfo.name || this.props.patientInfo.firstName || "",
        patientPhone: this.props.patientInfo.phoneNumber || "",
        patientAddress: this.props.patientInfo.address || "",
      });
    }
  }

  getDefaultDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  fetchHospitalData = async () => {
    try {
      this.setState({ loading: true });
      const [specialtyRes, doctorRes] = await Promise.all([
        getAllSpecialty({ lang: "vi" }).catch(() => ({ errCode: -1 })),
        getTopDoctorServices("", "vi").catch(() => ({ errCode: -1 })),
      ]);

      let specialties = [];
      if (specialtyRes && specialtyRes.errCode === 0 && Array.isArray(specialtyRes.data)) {
        specialties = specialtyRes.data;
      }

      let doctors = [];
      if (doctorRes && doctorRes.errCode === 0 && Array.isArray(doctorRes.data)) {
        doctors = doctorRes.data;
      }

      this.setState({
        specialties,
        doctors,
        loading: false,
      });
    } catch (e) {
      console.error("Error loading hospital data:", e);
      this.setState({ loading: false });
    }
  };

  handleOpenBooking = (item, type = "DEPARTMENT") => {
    if (type === "DEPARTMENT") {
      this.setState({
        selectedDepartment: item,
        selectedPackage: null,
        isOpenBookingModal: true,
        bookingSuccess: false,
      });
    } else {
      this.setState({
        selectedPackage: item,
        selectedDepartment: null,
        isOpenBookingModal: true,
        bookingSuccess: false,
      });
    }
  };

  handleCloseBooking = () => {
    this.setState({
      isOpenBookingModal: false,
      bookingSuccess: false,
    });
  };

  handleInputChange = (field, value) => {
    this.setState({ [field]: value });
  };

  handleFormSubmit = (e) => {
    e.preventDefault();
    const { patientName, patientPhone, bookingDate, bookingSlot, selectedDepartment, selectedPackage, examType } = this.state;

    if (!patientName.trim()) {
      toast.warning("Vui lòng nhập họ và tên người khám!");
      return;
    }
    if (!patientPhone.trim() || patientPhone.trim().length < 9) {
      toast.warning("Vui lòng nhập số điện thoại hợp lệ!");
      return;
    }

    this.setState({ isSubmitting: true });

    setTimeout(() => {
      const orderNumber = Math.floor(100 + Math.random() * 900);
      const bookingCode = "BV-" + orderNumber;
      const slotObj = TIME_SLOTS_HOSPITAL.find((s) => s.key === bookingSlot) || TIME_SLOTS_HOSPITAL[0];

      const receipt = {
        bookingCode,
        orderNumber,
        departmentName: selectedDepartment ? selectedDepartment.name : selectedPackage.name,
        roomLocation: selectedDepartment ? selectedDepartment.room : "Khu Khám Tổng Quát (Tầng 2, Tòa A)",
        examTypeName: examType === "SERVICE" ? "Khám theo yêu cầu (Dịch vụ)" : "Khám có thẻ BHYT",
        patientName,
        patientPhone,
        bookingDate,
        slotLabel: slotObj.label,
        patientInsuranceCode: this.state.patientInsuranceCode,
      };

      this.setState({
        isSubmitting: false,
        bookingSuccess: true,
        receiptData: receipt,
      });

      toast.success("Đăng ký khám tại bệnh viện thành công! Vui lòng lưu lại Phiếu Khám Tiếp Đón.");
    }, 600);
  };

  formatCurrency = (num) => {
    if (!num) return "0 đ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(num);
  };

  render() {
    const {
      activeTab,
      specialties,
      doctors,
      searchTerm,
      isOpenBookingModal,
      selectedDepartment,
      selectedPackage,
      patientName,
      patientPhone,
      patientGender,
      patientBirthYear,
      patientAddress,
      patientInsuranceCode,
      examType,
      bookingDate,
      bookingSlot,
      symptoms,
      bookingSuccess,
      receiptData,
      isSubmitting,
    } = this.state;

    // Lọc danh sách khoa phòng theo từ khóa tìm kiếm
    const filteredDepartments = HOSPITAL_DEPARTMENTS.filter((d) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        d.name.toLowerCase().includes(term) ||
        d.desc.toLowerCase().includes(term) ||
        d.headDoctor.toLowerCase().includes(term) ||
        d.room.toLowerCase().includes(term)
      );
    });

    return (
      <div className="hospital-facility-page">
        {/* Header điều hướng chung */}
        <HomeHeader isShowBanner={false} />

        {/* HERO BANNER BỆNH VIỆN DUY NHẤT */}
        <section className="hospital-hero">
          <div className="hospital-hero-overlay"></div>
          <div className="hero-inner-container">
            <div className="hospital-badge">
              <i className="fa fa-hospital-o"></i> BỆNH VIỆN ĐA KHOA QUỐC TẾ BOOKINGCARE
            </div>
            <h1 className="hero-main-title">
              Trung Tâm Khám Chữa Bệnh <span>Kỹ Thuật Cao Chuẩn Quốc Tế</span>
            </h1>
            <p className="hero-subtitle">
              Địa chỉ: <strong>28 Thành Thái, Dịch Vọng Hậu, Cầu Giấy, Hà Nội</strong> • 
              Hotline cấp cứu &amp; đặt khám: <strong className="text-warning">1900-2805</strong>
            </p>

            <div className="hero-action-buttons">
              <button
                className="btn-hero-primary"
                onClick={() => this.handleOpenBooking(HOSPITAL_DEPARTMENTS[0], "DEPARTMENT")}
              >
                <i className="fa fa-calendar-check-o"></i> Đặt Lịch Khám Tiếp Đón Nhanh (FastTrack)
              </button>
              <button
                className="btn-hero-secondary"
                onClick={() => this.setState({ activeTab: "FLOORS" })}
              >
                <i className="fa fa-map-signs"></i> Xem Sơ Đồ Khoa Phòng Bệnh Viện
              </button>
            </div>

            {/* Quick Hospital Highlights */}
            <div className="hospital-stats-bar">
              <div className="stat-box">
                <span className="num">12+</span>
                <span className="label">Khoa lâm sàng &amp; cận lâm sàng</span>
              </div>
              <div className="divider"></div>
              <div className="stat-box">
                <span className="num">50+</span>
                <span className="label">Bác sĩ, Giáo sư, Tiến sĩ chuyên môn cao</span>
              </div>
              <div className="divider"></div>
              <div className="stat-box">
                <span className="num">100%</span>
                <span className="label">Áp dụng thông tuyến BHYT toàn quốc</span>
              </div>
              <div className="divider"></div>
              <div className="stat-box">
                <span className="num">24/7</span>
                <span className="label">Khoa Cấp cứu &amp; Tiếp nhận điều trị</span>
              </div>
            </div>
          </div>
        </section>

        {/* TABS ĐIỀU HƯỚNG NỘI BỘ BỆNH VIỆN */}
        <div className="hospital-nav-tabs-wrapper">
          <div className="tabs-container">
            <button
              className={`tab-btn ${activeTab === "DEPARTMENTS" ? "active" : ""}`}
              onClick={() => this.setState({ activeTab: "DEPARTMENTS" })}
            >
              <i className="fa fa-stethoscope"></i>
              <span>Các Khoa Chuyên Môn</span>
            </button>
            <button
              className={`tab-btn ${activeTab === "PACKAGES" ? "active" : ""}`}
              onClick={() => this.setState({ activeTab: "PACKAGES" })}
            >
              <i className="fa fa-medkit"></i>
              <span>Gói Khám &amp; Tầm Soát</span>
            </button>
            <button
              className={`tab-btn ${activeTab === "PROCESS" ? "active" : ""}`}
              onClick={() => this.setState({ activeTab: "PROCESS" })}
            >
              <i className="fa fa-list-ol"></i>
              <span>Quy Trình Khám 5 Bước</span>
            </button>
            <button
              className={`tab-btn ${activeTab === "INSURANCE" ? "active" : ""}`}
              onClick={() => this.setState({ activeTab: "INSURANCE" })}
            >
              <i className="fa fa-shield"></i>
              <span>Chính Sách BHYT &amp; Viện Phí</span>
            </button>
            <button
              className={`tab-btn ${activeTab === "FLOORS" ? "active" : ""}`}
              onClick={() => this.setState({ activeTab: "FLOORS" })}
            >
              <i className="fa fa-building-o"></i>
              <span>Sơ Đồ Tầng &amp; Chỉ Dẫn</span>
            </button>
          </div>
        </div>

        {/* NỘI DUNG CHÍNH THEO TABS */}
        <div className="hospital-main-content">
          {/* TAB 1: KHOA CHUYÊN MÔN CỦA BỆNH VIỆN */}
          {activeTab === "DEPARTMENTS" && (
            <section className="departments-section">
              <div className="section-header-row">
                <div className="header-titles">
                  <h2>Các Khoa Lâm Sàng &amp; Cận Lâm Sàng Của Bệnh Viện</h2>
                  <p>
                    Bệnh viện quy tụ đầy đủ các chuyên khoa mũi nhọn, liên kết chặt chẽ trong hội chẩn và điều trị toàn diện.
                  </p>
                </div>
                <div className="search-dept-box">
                  <i className="fa fa-search"></i>
                  <input
                    type="text"
                    placeholder="Tìm khoa khám: Tim mạch, Tiêu hóa, Nhi..."
                    value={searchTerm}
                    onChange={(e) => this.setState({ searchTerm: e.target.value })}
                  />
                  {searchTerm && (
                    <button className="clear-btn" onClick={() => this.setState({ searchTerm: "" })}>
                      <i className="fa fa-times"></i>
                    </button>
                  )}
                </div>
              </div>

              <div className="departments-grid">
                {filteredDepartments.map((dept) => (
                  <div key={dept.id} className="dept-card">
                    <div className="card-accent" style={{ background: dept.gradient }}>
                      <div className="dept-icon-circle">
                        <i className={`fa ${dept.icon}`}></i>
                      </div>
                      <span className="room-tag">{dept.room}</span>
                    </div>

                    <div className="card-body">
                      <h3 className="dept-title">{dept.name}</h3>
                      <div className="doctor-in-charge">
                        <i className="fa fa-user-md text-primary"></i>
                        <span>Trưởng khoa: <strong>{dept.headDoctor}</strong></span>
                      </div>
                      <p className="dept-desc">{dept.desc}</p>

                      <div className="dept-meta">
                        <span className="meta-stat">
                          <i className="fa fa-users text-success"></i> {dept.casesPerDay}
                        </span>
                      </div>

                      <div className="card-actions">
                        <button
                          className="btn-book-dept"
                          onClick={() => this.handleOpenBooking(dept, "DEPARTMENT")}
                        >
                          <i className="fa fa-calendar-plus-o"></i> Đặt Khám Tại Khoa Này
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* TAB 2: GÓI KHÁM SỨC KHỎE TẠI BỆNH VIỆN */}
          {activeTab === "PACKAGES" && (
            <section className="packages-section">
              <div className="section-title-center">
                <span className="tag">DỊCH VỤ TRỌN GÓI</span>
                <h2>Các Gói Khám Sức Khỏe &amp; Tầm Soát Tại Bệnh Viện</h2>
                <p>Khám tổng quát định kỳ, tầm soát bệnh lý sớm với chi phí tối ưu, quy trình chuyên nghiệp khép kín</p>
              </div>

              <div className="packages-grid">
                {HOSPITAL_PACKAGES.map((pkg) => (
                  <div key={pkg.id} className="package-card">
                    <div className="pkg-header">
                      <span className="pkg-badge" style={{ background: pkg.badgeColor }}>
                        {pkg.badge}
                      </span>
                      <h3>{pkg.name}</h3>
                      <div className="pkg-price-wrap">
                        <span className="price">{this.formatCurrency(pkg.price)}</span>
                        {pkg.originalPrice && (
                          <span className="old-price">{this.formatCurrency(pkg.originalPrice)}</span>
                        )}
                      </div>
                      <span className="items-count"><i className="fa fa-list-check"></i> {pkg.itemsCount}</span>
                    </div>

                    <div className="pkg-body">
                      <h4>Danh mục nổi bật trong gói:</h4>
                      <ul className="pkg-features">
                        {pkg.features.map((feat, idx) => (
                          <li key={idx}>
                            <i className="fa fa-check-circle text-success"></i>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>

                      <button
                        className="btn-choose-package"
                        onClick={() => this.handleOpenBooking(pkg, "PACKAGE")}
                      >
                        <i className="fa fa-calendar-check-o"></i> Đăng Ký Gói Khám Này
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* TAB 3: QUY TRÌNH KHÁM 5 BƯỚC TẠI VIỆN */}
          {activeTab === "PROCESS" && (
            <section className="process-section">
              <div className="section-title-center">
                <span className="tag">TIẾP ĐÓN NHANH CHÓNG</span>
                <h2>Quy Trình 5 Bước Khám Chữa Bệnh Tại Bệnh Viện</h2>
                <p>Bệnh nhân đặt trước qua website được ưu tiên tiếp đón qua luồng FastTrack không phải chờ đợi</p>
              </div>

              <div className="process-timeline">
                <div className="timeline-step">
                  <div className="step-badge">1</div>
                  <div className="step-content">
                    <div className="icon-box"><i className="fa fa-id-card-o"></i></div>
                    <h3>Bước 1: Tiếp đón &amp; Quét mã Check-in</h3>
                    <p>
                      Đến Quầy Lễ Tân (Tầng 1, Tòa A), xuất trình mã số hẹn <strong>BV-XXXX</strong> trên điện thoại để nhận số thứ tự ưu tiên và sổ khám bệnh điện tử ngay lập tức.
                    </p>
                  </div>
                </div>

                <div className="timeline-step">
                  <div className="step-badge">2</div>
                  <div className="step-content">
                    <div className="icon-box"><i className="fa fa-user-md"></i></div>
                    <h3>Bước 2: Khám lâm sàng chuyên khoa</h3>
                    <p>
                      Di chuyển đến đúng phòng khám chuyên khoa đã hẹn. Bác sĩ chuyên khoa thăm khám trực tiếp, kiểm tra sinh hiệu và chỉ định các xét nghiệm cần thiết.
                    </p>
                  </div>
                </div>

                <div className="timeline-step">
                  <div className="step-badge">3</div>
                  <div className="step-content">
                    <div className="icon-box"><i className="fa fa-flask"></i></div>
                    <h3>Bước 3: Thực hiện cận lâm sàng (Nếu có)</h3>
                    <p>
                      Lấy mẫu máu/nước tiểu tại Tầng 3 và chụp chiếu (X-quang, Siêu âm, MRI, CT) theo chỉ dẫn của điều dưỡng phụ trách. Kết quả được số hóa tự động chuyển về máy bác sĩ.
                    </p>
                  </div>
                </div>

                <div className="timeline-step">
                  <div className="step-badge">4</div>
                  <div className="step-content">
                    <div className="icon-box"><i className="fa fa-file-text-o"></i></div>
                    <h3>Bước 4: Bác sĩ kết luận &amp; Kê đơn thuốc</h3>
                    <p>
                      Quay lại phòng khám ban đầu. Bác sĩ phân tích kết quả xét nghiệm, chẩn đoán xác định, giải thích kỹ lưỡng tình trạng bệnh và kê đơn thuốc điện tử.
                    </p>
                  </div>
                </div>

                <div className="timeline-step">
                  <div className="step-badge">5</div>
                  <div className="step-content">
                    <div className="icon-box"><i className="fa fa-medkit"></i></div>
                    <h3>Bước 5: Thanh toán &amp; Lĩnh thuốc</h3>
                    <p>
                      Thanh toán viện phí / khấu trừ BHYT tại Quầy Thu ngân Tầng 1 và nhận thuốc tại Nhà thuốc Bệnh viện đạt chuẩn GPP kèm hướng dẫn sử dụng chi tiết.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* TAB 4: CHÍNH SÁCH BHYT & BẢO LÃNH VIỆN PHÍ */}
          {activeTab === "INSURANCE" && (
            <section className="insurance-section">
              <div className="section-title-center">
                <span className="tag">TIẾT KIỆM &amp; MINH BẠCH</span>
                <h2>Chính Sách Bảo Hiểm Y Tế &amp; Bảo Lãnh Viện Phí</h2>
                <p>Bệnh viện áp dụng đầy đủ quyền lợi BHYT nhà nước và liên kết trực tiếp với hơn 30 hãng bảo hiểm tư nhân</p>
              </div>

              <div className="insurance-cards-grid">
                <div className="ins-card">
                  <div className="ins-icon bg-green"><i className="fa fa-shield"></i></div>
                  <h3>Khám Chữa Bệnh BHYT Nhà Nước</h3>
                  <ul>
                    <li>Áp dụng <strong>thông tuyến BHYT toàn quốc</strong> (người bệnh không cần giấy chuyển viện vẫn được hưởng quyền lợi khi cấp cứu hoặc đăng ký ban đầu).</li>
                    <li>Được trừ trực tiếp chi phí thuốc, vật tư y tế, ngày giường nội trú và các kỹ thuật cận lâm sàng theo danh mục quy định của Bộ Y tế.</li>
                    <li>Thủ tục quét thẻ BHYT &amp; Căn cước công dân gắn chip (VNeID) diễn ra trong 30 giây.</li>
                  </ul>
                </div>

                <div className="ins-card">
                  <div className="ins-icon bg-blue"><i className="fa fa-credit-card"></i></div>
                  <h3>Bảo Lãnh Viện Phí Tư Nhân 100%</h3>
                  <ul>
                    <li>Bệnh viện liên kết trực tiếp với các hãng bảo hiểm lớn: <strong>Bảo Việt, PVI, Prudential, Manulife, Liberty, Dai-ichi, AIA, Generali...</strong></li>
                    <li>Bệnh nhân không cần thanh toán trước tiền mặt (trong hạn mức bảo lãnh của thẻ).</li>
                    <li>Bộ phận bảo lãnh phụ trách làm việc trực tiếp với hãng bảo hiểm, xuất hóa đơn VAT điện tử nhanh chóng.</li>
                  </ul>
                </div>
              </div>

              {/* BẢNG GIÁ DỊCH VỤ NIÊM YẾT */}
              <div className="pricing-table-container">
                <h3>Bảng Giá Một Số Dịch Vụ Khám Chữa Bệnh Niêm Yết Tại Bệnh Viện</h3>
                <div className="table-responsive">
                  <table className="table-pricing">
                    <thead>
                      <tr>
                        <th>Tên Dịch Vụ Y Tế</th>
                        <th>Giá Có BHYT (Ước tính)</th>
                        <th>Giá Khám Dịch Vụ Theo Yêu Cầu</th>
                        <th>Ghi Chú</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Khám Bác sĩ Chuyên khoa (Ngoại trú)</strong></td>
                        <td>38.700 đ - 50.000 đ</td>
                        <td>200.000 đ</td>
                        <td>Thăm khám lâm sàng chi tiết</td>
                      </tr>
                      <tr>
                        <td><strong>Khám Giáo sư / Phó Giáo sư / Trưởng khoa</strong></td>
                        <td>Được hưởng BHYT phần gốc</td>
                        <td>350.000 đ - 500.000 đ</td>
                        <td>Đặt hẹn đích danh chuyên gia</td>
                      </tr>
                      <tr>
                        <td><strong>Chụp X-quang Tim phổi Kỹ thuật số</strong></td>
                        <td>65.000 đ</td>
                        <td>150.000 đ</td>
                        <td>Máy chụp kỹ thuật số liều tia thấp</td>
                      </tr>
                      <tr>
                        <td><strong>Siêu âm Ổ bụng Tổng quát màu 4D</strong></td>
                        <td>43.900 đ</td>
                        <td>220.000 đ</td>
                        <td>Đầu dò đa tần sắc nét</td>
                      </tr>
                      <tr>
                        <td><strong>Chụp Cộng hưởng từ MRI 3.0 Tesla</strong></td>
                        <td>Theo danh mục chỉ định BHYT</td>
                        <td>2.200.000 đ - 2.800.000 đ</td>
                        <td>Công nghệ Silent Scan không ồn</td>
                      </tr>
                      <tr>
                        <td><strong>Nội soi Dạ dày Tiền mê không đau (NBI)</strong></td>
                        <td>Hỗ trợ chi phí vật tư BHYT</td>
                        <td>1.500.000 đ - 1.800.000 đ</td>
                        <td>Êm ái, không buồn nôn, tỉnh ngay</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* TAB 5: SƠ ĐỒ CÁC TẦNG & CHỈ DẪN DI CHUYỂN */}
          {activeTab === "FLOORS" && (
            <section className="floors-section">
              <div className="section-title-center">
                <span className="tag">SƠ ĐỒ KHOA PHÒNG</span>
                <h2>Sơ Đồ Tầng &amp; Chỉ Dẫn Bệnh Viện</h2>
                <p>Giúp người bệnh và thân nhân dễ dàng tìm kiếm phòng khám, khu cận lâm sàng và khu điều trị nội trú</p>
              </div>

              <div className="floors-list">
                {HOSPITAL_FLOORS.map((f, idx) => (
                  <div key={idx} className="floor-card">
                    <div className="floor-badge" style={{ backgroundColor: f.color }}>
                      {f.floor}
                    </div>
                    <div className="floor-info">
                      <div className="floor-name">
                        <i className={`fa ${f.icon}`} style={{ color: f.color }}></i>
                        <h3>{f.name}</h3>
                      </div>
                      <p>{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* THÔNG TIN DI CHUYỂN & CHỈ ĐƯỜNG */}
              <div className="directions-box">
                <div className="dir-left">
                  <h3><i className="fa fa-map-marker text-danger"></i> Thông Tin Tiếp Đón &amp; Chỉ Đường</h3>
                  <p><strong>Địa chỉ:</strong> 28 Thành Thái, Dịch Vọng Hậu, Cầu Giấy, Hà Nội</p>
                  <p><strong>Bãi đỗ xe:</strong> Bệnh viện có bãi đỗ xe ô tô và xe máy miễn phí rộng rãi dưới tầng hầm B1 &amp; B2 có bảo vệ hướng dẫn 24/24.</p>
                  <p><strong>Tuyến xe buýt đi qua:</strong> Xe buýt số 05, 30, 39, 44, 68 dừng ngay trước cổng bệnh viện.</p>
                </div>
                <div className="dir-right">
                  <div className="callout-card">
                    <h4>Cần Hỗ Trợ Đón Tiếp Người Già / Xe Lăn?</h4>
                    <p>Bệnh viện có đội ngũ Chăm sóc khách hàng túc trực tại sảnh hỗ trợ xe lăn và đón tiếp ưu tiên tận nơi.</p>
                    <div className="tel-highlight">Hotline: 1900-2805</div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* MODAL ĐẶT LỊCH KHÁM TIẾP ĐÓN NHANH TẠI VIỆN (FASTTRACK) */}
        {(selectedDepartment || selectedPackage) && (
          <Modal
            show={isOpenBookingModal}
            onHide={this.handleCloseBooking}
            centered
            size="lg"
            className="hospital-booking-modal"
          >
            <div className="modal-header-hospital">
              <div className="header-text">
                <span className="badge-fasttrack">PHIẾU ĐĂNG KÝ TIẾP ĐÓN NHANH (FASTTRACK)</span>
                <h2>{selectedDepartment ? selectedDepartment.name : selectedPackage.name}</h2>
              </div>
              <button className="btn-close-modal" onClick={this.handleCloseBooking}>
                <i className="fa fa-times"></i>
              </button>
            </div>

            <div className="modal-body-hospital">
              {bookingSuccess ? (
                /* MÀN HÌNH BIÊN NHẬN SỐ THỨ TỰ TIẾP ĐÓN */
                <div className="booking-receipt-screen">
                  <div className="success-icon-badge">
                    <i className="fa fa-check"></i>
                  </div>
                  <h3>ĐĂNG KÝ TIẾP ĐÓN TẠI BỆNH VIỆN THÀNH CÔNG!</h3>
                  <p className="sub-txt">
                    Vui lòng chụp ảnh màn hình hoặc lưu lại mã số tiếp đón để xuất trình tại <strong>Quầy Lễ Tân Tầng 1</strong> khi đến viện.
                  </p>

                  <div className="ticket-card">
                    <div className="ticket-header">
                      <span className="t-label">SỐ THỨ TỰ TIẾP ĐÓN ƯU TIÊN</span>
                      <div className="ticket-code">{receiptData.bookingCode}</div>
                    </div>

                    <div className="ticket-body">
                      <div className="t-row">
                        <span>Khoa / Dịch vụ khám:</span>
                        <strong>{receiptData.departmentName}</strong>
                      </div>
                      <div className="t-row">
                        <span>Vị trí phòng khám:</span>
                        <strong>{receiptData.roomLocation}</strong>
                      </div>
                      <div className="t-row">
                        <span>Hình thức khám:</span>
                        <strong className="text-primary">{receiptData.examTypeName}</strong>
                      </div>
                      <div className="t-row">
                        <span>Bệnh nhân:</span>
                        <strong>{receiptData.patientName}</strong>
                      </div>
                      <div className="t-row">
                        <span>Số điện thoại:</span>
                        <strong>{receiptData.patientPhone}</strong>
                      </div>
                      {receiptData.patientInsuranceCode && (
                        <div className="t-row">
                          <span>Mã thẻ BHYT:</span>
                          <strong>{receiptData.patientInsuranceCode}</strong>
                        </div>
                      )}
                      <div className="t-row time-highlight">
                        <span>Thời gian tiếp đón:</span>
                        <strong className="text-success">{receiptData.slotLabel} — Ngày {receiptData.bookingDate}</strong>
                      </div>
                    </div>

                    <div className="ticket-footer-note">
                      <i className="fa fa-info-circle"></i> Quý khách vui lòng đến trước giờ hẹn 10 - 15 phút để hoàn tất thủ tục kiểm tra huyết áp và sinh hiệu ban đầu.
                    </div>
                  </div>

                  <div className="receipt-actions">
                    <button className="btn-done-ticket" onClick={this.handleCloseBooking}>
                      <i className="fa fa-check"></i> Hoàn Tất
                    </button>
                  </div>
                </div>
              ) : (
                /* FORM ĐĂNG KÝ KHÁM */
                <form onSubmit={this.handleFormSubmit} className="hospital-form">
                  <div className="selected-item-bar">
                    <div className="item-title">
                      <i className="fa fa-hospital-o text-primary"></i>
                      <span>{selectedDepartment ? selectedDepartment.name : selectedPackage.name}</span>
                    </div>
                    <div className="item-location">
                      <i className="fa fa-map-marker text-danger"></i>
                      <span>{selectedDepartment ? selectedDepartment.room : "Khu Khám Bệnh Tổng Quát"}</span>
                    </div>
                  </div>

                  {/* Chọn hình thức khám */}
                  <div className="form-group-box">
                    <label className="section-label">Hình thức khám tại Bệnh viện</label>
                    <div className="exam-type-toggle">
                      <label className={`type-card ${examType === "SERVICE" ? "active" : ""}`}>
                        <input
                          type="radio"
                          name="examType"
                          value="SERVICE"
                          checked={examType === "SERVICE"}
                          onChange={() => this.setState({ examType: "SERVICE" })}
                        />
                        <div className="type-icon"><i className="fa fa-star text-warning"></i></div>
                        <div>
                          <strong>Khám Dịch Vụ Theo Yêu Cầu</strong>
                          <span>Tự chọn Bác sĩ, ưu tiên khám nhanh, không mất thời gian chờ đợi</span>
                        </div>
                      </label>

                      <label className={`type-card ${examType === "BHYT" ? "active" : ""}`}>
                        <input
                          type="radio"
                          name="examType"
                          value="BHYT"
                          checked={examType === "BHYT"}
                          onChange={() => this.setState({ examType: "BHYT" })}
                        />
                        <div className="type-icon"><i className="fa fa-shield text-success"></i></div>
                        <div>
                          <strong>Khám Hưởng Bảo Hiểm Y Tế (BHYT)</strong>
                          <span>Hưởng đầy đủ quyền lợi thanh toán BHYT nhà nước theo quy định</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Thông tin bệnh nhân */}
                  <div className="form-group-box">
                    <label className="section-label">Thông Tin Bệnh Nhân Tiếp Đón</label>
                    <div className="form-grid-2">
                      <div className="input-field">
                        <label>Họ và tên bệnh nhân <span className="req">*</span></label>
                        <input
                          type="text"
                          placeholder="Ví dụ: Nguyễn Văn A"
                          value={patientName}
                          onChange={(e) => this.handleInputChange("patientName", e.target.value)}
                          required
                        />
                      </div>

                      <div className="input-field">
                        <label>Số điện thoại liên hệ <span className="req">*</span></label>
                        <input
                          type="tel"
                          placeholder="Ví dụ: 0912345678"
                          value={patientPhone}
                          onChange={(e) => this.handleInputChange("patientPhone", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-grid-3">
                      <div className="input-field">
                        <label>Giới tính</label>
                        <select
                          value={patientGender}
                          onChange={(e) => this.handleInputChange("patientGender", e.target.value)}
                        >
                          <option value="M">Nam</option>
                          <option value="F">Nữ</option>
                        </select>
                      </div>

                      <div className="input-field">
                        <label>Năm sinh / Tuổi</label>
                        <input
                          type="number"
                          placeholder="Ví dụ: 1990"
                          value={patientBirthYear}
                          onChange={(e) => this.handleInputChange("patientBirthYear", e.target.value)}
                        />
                      </div>

                      <div className="input-field">
                        <label>Mã thẻ BHYT (Nếu có)</label>
                        <input
                          type="text"
                          placeholder="Ví dụ: DN401..."
                          value={patientInsuranceCode}
                          onChange={(e) => this.handleInputChange("patientInsuranceCode", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="input-field full">
                      <label>Địa chỉ thường trú</label>
                      <input
                        type="text"
                        placeholder="Số nhà, đường, Phường/Xã, Quận/Huyện..."
                        value={patientAddress}
                        onChange={(e) => this.handleInputChange("patientAddress", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Chọn thời gian khám tại viện */}
                  <div className="form-group-box">
                    <label className="section-label">Chọn Ngày &amp; Khung Giờ Khám Tại Viện</label>
                    <div className="form-grid-2">
                      <div className="input-field">
                        <label>Ngày khám tại viện <span className="req">*</span></label>
                        <input
                          type="date"
                          min={this.getDefaultDate()}
                          value={bookingDate}
                          onChange={(e) => this.handleInputChange("bookingDate", e.target.value)}
                          required
                        />
                      </div>

                      <div className="input-field">
                        <label>Khung giờ tiếp đón <span className="req">*</span></label>
                        <div className="slots-grid-hosp">
                          {TIME_SLOTS_HOSPITAL.map((s) => (
                            <button
                              type="button"
                              key={s.key}
                              className={`slot-btn ${bookingSlot === s.key ? "active" : ""}`}
                              onClick={() => this.handleInputChange("bookingSlot", s.key)}
                            >
                              <span>{s.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="input-field full">
                      <label>Triệu chứng hoặc lý do khám</label>
                      <textarea
                        rows="2"
                        placeholder="Mô tả triệu chứng bệnh, tiền sử bệnh hoặc nhu cầu khám cụ thể..."
                        value={symptoms}
                        onChange={(e) => this.handleInputChange("symptoms", e.target.value)}
                      ></textarea>
                    </div>
                  </div>

                  <div className="form-footer-buttons">
                    <button type="button" className="btn-cancel-modal" onClick={this.handleCloseBooking}>
                      Hủy bỏ
                    </button>
                    <button type="submit" className="btn-submit-hospital" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <span><i className="fa fa-spinner fa-spin"></i> Đang đăng ký...</span>
                      ) : (
                        <span><i className="fa fa-check-circle"></i> Xác Nhận Đăng Ký Khám Tiếp Đón Nhanh</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </Modal>
        )}

        {/* Footer */}
        <HomeFooter />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isLoggedIn: state.user.isLoggedIn,
    language: state.app.language,
    patientInfo: state.patient.patientInfo,
  };
};

export default connect(mapStateToProps)(MedicalFacilityPage);
