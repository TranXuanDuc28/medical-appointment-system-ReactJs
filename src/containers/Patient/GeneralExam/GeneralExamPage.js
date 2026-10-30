import React, { Component } from "react";
import { connect } from "react-redux";
import { push } from "connected-react-router";
import { Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import moment from "moment";
import "moment/locale/vi";

import HomeHeader from "../../HomePage/HomeHeader";
import DatePicker from "../../../components/Input/DatePicker";
import {
  getFeaturedPackages,
  getAllPackages,
  searchPackages,
  getFilterOptions as getPackageFilterOptions,
  getPackageBookingSlots,
} from "../../../services/packageService";
import {
  getFeaturedFacilities,
  getAllFacilities,
  searchFacilities,
  getFilterOptions as getFacilityFilterOptions,
} from "../../../services/facilityService";
import { postPatientBookAppointment } from "../../../services/doctorServices";

import "./GeneralExamPage.scss";

// Mapping facilityId to known doctor in doctor_infor
const FACILITY_DOCTOR_MAP = {
  21: { id: 2, name: "BS Ngô Thị Mỹ Lành" },
  22: { id: 22, name: "PGS.TS Lê Thị Tuyết Lan" },
  23: { id: 26, name: "BSCKII Trần Thị Minh Hằng" },
  24: { id: 17, name: "ThS.BS Nguyễn Trung Nhật" },
  25: { id: 28, name: "GS.TS Vũ Văn Hòe" },
};

// Mapping facilityId to known Clinic ID for direct navigation
const FACILITY_CLINIC_MAP = {
  22: 3, // Phòng khám Bệnh viện Đại học Y Dược 1 -> Clinic ID 3
  23: 7, // Hệ thống Y tế Thu Cúc TCI -> Clinic ID 7
};

const TIME_SLOTS = [
  { key: "T1", label: "08:00 - 09:00" },
  { key: "T2", label: "09:00 - 10:00" },
  { key: "T3", label: "10:00 - 11:00" },
  { key: "T4", label: "11:00 - 12:00" },
  { key: "T5", label: "13:00 - 14:00" },
  { key: "T6", label: "14:00 - 15:00" },
  { key: "T7", label: "15:00 - 16:00" },
  { key: "T8", label: "16:00 - 17:00" },
];

const DEFAULT_PACKAGE_IMAGE =
  "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80";
const DEFAULT_FACILITY_LOGO =
  "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=200&q=80";

class GeneralExamPage extends Component {
  constructor(props) {
    super(props);
    moment.locale("vi");
    this.state = {
      packages: [],
      facilities: [],
      loading: true,
      error: null,
      searchMode: false,
      searchResults: {
        packages: [],
        facilities: [],
      },
      filters: {
        keyword: "",
        category: "",
        gender: "",
        minPrice: "",
        maxPrice: "",
      },
      filterOptions: {
        categories: [],
        priceRange: { min: 0, max: 0 },
      },
      selectedCategoryChip: "",

      // Modals
      isOpenPackageModal: false,
      selectedPackage: null,
      modalActiveTab: "detail", // 'detail' | 'booking'

      isOpenFacilityModal: false,
      selectedFacility: null,
      facilityPackages: [],

      // Booking Form State
      bookingDate: new Date(Date.now() + 86400000), // Default tomorrow
      selectedTimeSlot: "T1",
      patientName: "",
      patientPhone: "",
      patientEmail: "",
      patientAddress: "",
      patientGender: "M",
      patientNote: "",
      isSubmittingBooking: false,

      // Hybrid Model: Doctor Pool & Capacity Slot Management
      availableDoctors: [],
      selectedDoctorId: "auto",
      slots: [],
      loadingSlots: false,
    };
  }

  componentDidMount() {
    this.fetchData();
    this.fetchFilterOptions();
  }

  fetchData = async () => {
    try {
      this.setState({ loading: true });

      const [packagesResponse, facilitiesResponse] = await Promise.all([
        getAllPackages().catch(() => getFeaturedPackages()),
        getAllFacilities().catch(() => getFeaturedFacilities()),
      ]);

      // Deduplicate facilities by name if any duplicates exist
      const rawFacilities = facilitiesResponse.data || [];
      const seenNames = new Set();
      const uniqueFacilities = rawFacilities.filter((f) => {
        if (!f || !f.name) return false;
        if (seenNames.has(f.name.trim())) return false;
        seenNames.add(f.name.trim());
        return true;
      });

      this.setState({
        packages: packagesResponse.data || [],
        facilities: uniqueFacilities,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      this.setState({
        error: "Có lỗi xảy ra khi tải dữ liệu gói khám",
        loading: false,
      });
    }
  };

  fetchFilterOptions = async () => {
    try {
      const packageFilters = await getPackageFilterOptions();
      if (packageFilters && packageFilters.data) {
        this.setState({
          filterOptions: {
            categories: packageFilters.data.categories || [],
            priceRange: packageFilters.data.priceRange || { min: 0, max: 0 },
          },
        });
      }
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  handleSearch = async () => {
    const { filters } = this.state;

    try {
      this.setState({ loading: true, searchMode: true });

      const searchParams = {
        ...filters,
        limit: 20,
      };

      Object.keys(searchParams).forEach((key) => {
        if (!searchParams[key] || searchParams[key] === "") {
          delete searchParams[key];
        }
      });

      const [packagesResponse, facilitiesResponse] = await Promise.all([
        searchPackages(searchParams),
        searchFacilities(searchParams),
      ]);

      const rawFacilities =
        facilitiesResponse.data?.facilities || facilitiesResponse.data || [];
      const seenNames = new Set();
      const uniqueFacilities = rawFacilities.filter((f) => {
        if (!f || !f.name) return false;
        if (seenNames.has(f.name.trim())) return false;
        seenNames.add(f.name.trim());
        return true;
      });

      this.setState({
        searchResults: {
          packages:
            packagesResponse.data?.packages || packagesResponse.data || [],
          facilities: uniqueFacilities,
        },
        loading: false,
      });
    } catch (error) {
      console.error("Error searching:", error);
      this.setState({
        error: "Có lỗi xảy ra khi tìm kiếm",
        loading: false,
      });
    }
  };

  handleFilterChange = (field, value) => {
    this.setState(
      (prevState) => ({
        filters: {
          ...prevState.filters,
          [field]: value,
        },
        selectedCategoryChip: field === "category" ? value : prevState.selectedCategoryChip,
      }),
      () => {
        // Trigger search automatically when dropdown filters change
        if (field !== "keyword") {
          this.handleSearch();
        }
      }
    );
  };

  handleCategoryChipClick = (category) => {
    const newCategory = this.state.selectedCategoryChip === category ? "" : category;
    this.setState(
      (prevState) => ({
        selectedCategoryChip: newCategory,
        filters: {
          ...prevState.filters,
          category: newCategory,
        },
      }),
      () => {
        this.handleSearch();
      }
    );
  };

  handleResetFilters = () => {
    this.setState(
      {
        filters: {
          keyword: "",
          category: "",
          gender: "",
          minPrice: "",
          maxPrice: "",
        },
        selectedCategoryChip: "",
        searchMode: false,
      },
      () => {
        this.fetchData();
      }
    );
  };

  // Fetch real-time available doctors & capacity slots (Hybrid Model)
  fetchBookingSlots = async (facilityId, date, doctorId) => {
    try {
      this.setState({ loadingSlots: true });
      const dateTimestamp = new Date(date).setHours(0, 0, 0, 0).toString();
      const res = await getPackageBookingSlots(
        facilityId,
        dateTimestamp,
        doctorId || "auto"
      );

      if (res && res.errCode === 0 && res.data) {
        const slots = res.data.slots || [];
        const availableDoctors = res.data.availableDoctors || [];

        // Check if current slot is full; if so, select first non-full slot
        let currentSlot = slots.find((s) => s.key === this.state.selectedTimeSlot);
        let nextSelectedSlot = this.state.selectedTimeSlot;
        if (!currentSlot || currentSlot.isFull) {
          const firstAvailable = slots.find((s) => !s.isFull);
          if (firstAvailable) nextSelectedSlot = firstAvailable.key;
        }

        this.setState({
          availableDoctors,
          slots,
          selectedTimeSlot: nextSelectedSlot,
          loadingSlots: false,
        });
      } else {
        this.setState({ loadingSlots: false });
      }
    } catch (e) {
      console.error("Error fetching package booking slots:", e);
      this.setState({ loadingSlots: false });
    }
  };

  // Click Package -> Open Package Modal
  handlePackageClick = (pkg) => {
    const { patientInfo, userInfo } = this.props;
    let name = "";
    let phone = "";
    let email = "";
    let address = "";
    let gender = "M";

    if (patientInfo) {
      name =
        `${patientInfo.lastName || ""} ${patientInfo.firstName || ""}`.trim() ||
        patientInfo.fullName ||
        "";
      phone = patientInfo.phoneNumber || "";
      email = patientInfo.email || "";
      address = patientInfo.address || "";
      gender = patientInfo.gender === "F" ? "F" : "M";
    } else if (userInfo) {
      name = `${userInfo.lastName || ""} ${userInfo.firstName || ""}`.trim();
      phone = userInfo.phoneNumber || "";
      email = userInfo.email || "";
      address = userInfo.address || "";
      gender = userInfo.gender === "F" ? "F" : "M";
    }

    const tomorrow = new Date(Date.now() + 86400000);

    this.setState(
      {
        selectedPackage: pkg,
        modalActiveTab: "detail",
        isOpenPackageModal: true,
        patientName: name,
        patientPhone: phone,
        patientEmail: email,
        patientAddress: address,
        patientGender: gender,
        bookingDate: tomorrow,
        selectedDoctorId: "auto",
        selectedTimeSlot: "T1",
      },
      () => {
        this.fetchBookingSlots(pkg.facilityId, tomorrow, "auto");
      }
    );
  };

  handleBookingDateChange = (date) => {
    const newDate = date[0] || new Date();
    this.setState({ bookingDate: newDate }, () => {
      if (this.state.selectedPackage) {
        this.fetchBookingSlots(
          this.state.selectedPackage.facilityId,
          newDate,
          this.state.selectedDoctorId
        );
      }
    });
  };

  handleDoctorSelectChange = (e) => {
    const doctorId = e.target.value;
    this.setState({ selectedDoctorId: doctorId }, () => {
      if (this.state.selectedPackage) {
        this.fetchBookingSlots(
          this.state.selectedPackage.facilityId,
          this.state.bookingDate,
          doctorId
        );
      }
    });
  };

  // Click Facility -> Navigate to Clinic or Open Facility Modal
  handleFacilityClick = (facility) => {
    if (!facility) return;

    // Check if facility maps to an existing clinic in the database
    if (FACILITY_CLINIC_MAP[facility.id]) {
      this.props.navigate(`/detail-clinic/${FACILITY_CLINIC_MAP[facility.id]}`);
      return;
    }

    // For other facilities, display facility info modal with packages available
    const facilityPackages = this.state.packages.filter(
      (p) => p.facilityId === facility.id
    );

    this.setState({
      selectedFacility: facility,
      facilityPackages: facilityPackages,
      isOpenFacilityModal: true,
    });
  };

  handleConfirmBooking = async () => {
    const {
      selectedPackage,
      bookingDate,
      selectedTimeSlot,
      patientName,
      patientPhone,
      patientEmail,
      patientAddress,
      patientGender,
      patientNote,
      slots,
      availableDoctors,
      selectedDoctorId,
    } = this.state;

    if (!patientName.trim()) {
      toast.error("Vui lòng nhập họ và tên bệnh nhân!");
      return;
    }
    if (!patientPhone.trim()) {
      toast.error("Vui lòng nhập số điện thoại liên hệ!");
      return;
    }
    if (!patientEmail.trim()) {
      toast.error("Vui lòng nhập email nhận thông tin đặt lịch!");
      return;
    }
    if (!patientAddress.trim()) {
      toast.error("Vui lòng nhập địa chỉ liên hệ!");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(patientEmail.trim())) {
      toast.error("Email không hợp lệ. Vui lòng kiểm tra lại!");
      return;
    }

    // Identify assigned doctor from real-time slot or selected doctor
    const currentSlot = slots.find((s) => s.key === selectedTimeSlot);
    if (currentSlot && currentSlot.isFull) {
      toast.error(
        "Khung giờ này đã kín chỗ tiếp nhận. Vui lòng chọn khung giờ khác!"
      );
      return;
    }

    const doctorToAssign =
      currentSlot?.assignedDoctor ||
      availableDoctors.find((d) => String(d.id) === String(selectedDoctorId)) ||
      availableDoctors[0] ||
      FACILITY_DOCTOR_MAP[selectedPackage.facilityId] || {
        id: 22,
        name: "PGS.TS Lê Thị Tuyết Lan",
      };

    const slotLabel = currentSlot?.label || "08:00 - 09:00";
    const dateObj = bookingDate || new Date();
    const dateTimestamp = new Date(dateObj).setHours(0, 0, 0, 0).toString();
    const formattedDate = moment(dateObj).format("dddd - DD/MM/YYYY");
    const timeString = `${slotLabel} (${formattedDate})`;

    this.setState({ isSubmittingBooking: true });

    try {
      const res = await postPatientBookAppointment({
        fullName: patientName.trim(),
        phoneNumber: patientPhone.trim(),
        email: patientEmail.trim(),
        address: patientAddress.trim(),
        reason: `[Gói khám: ${selectedPackage.name}]${
          patientNote ? ` - ${patientNote.trim()}` : ""
        }`,
        birthday: new Date().getTime(),
        date: dateTimestamp,
        selectedGender: patientGender,
        doctorId: doctorToAssign.id,
        timeType: selectedTimeSlot,
        language: this.props.language || "vi",
        timeString: timeString,
        doctorName: `${doctorToAssign.name} - ${selectedPackage.name}`,
        patientId: this.props.patientInfo?.id || this.props.userInfo?.id,
      });

      if (res && res.errCode === 0) {
        toast.success(
          "Đặt lịch gói khám thành công! Vui lòng kiểm tra email để xác nhận lịch khám."
        );
        this.setState({
          isOpenPackageModal: false,
          isSubmittingBooking: false,
        });
      } else {
        toast.error(
          res?.errMessage || "Đặt lịch thất bại. Vui lòng thử lại sau!"
        );
        this.setState({ isSubmittingBooking: false });
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại!");
      this.setState({ isSubmittingBooking: false });
    }
  };

  formatPrice = (price) => {
    if (!price || price === 0) {
      return "Liên hệ";
    }
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  parseJsonArray = (jsonString) => {
    if (!jsonString) return [];
    try {
      const parsed = JSON.parse(jsonString);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [jsonString];
    }
  };

  getImageUrl = (imagePath, defaultImage) => {
    if (!imagePath) return defaultImage;
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
    return `${backendUrl}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
  };

  renderPackageCard = (pkg) => {
    return (
      <div key={pkg.id} className="col-lg-3 col-md-6 col-12 mb-4">
        <div
          className="package-card"
          onClick={() => this.handlePackageClick(pkg)}
        >
          <div className="package-img-wrapper">
            <img
              src={this.getImageUrl(pkg.image, DEFAULT_PACKAGE_IMAGE)}
              alt={pkg.name}
              className="package-img"
              onError={(e) => {
                e.target.src = DEFAULT_PACKAGE_IMAGE;
              }}
            />
            {pkg.category && (
              <span className="badge-category">{pkg.category}</span>
            )}
            <span className="badge-gender">
              {pkg.gender === "female"
                ? "Dành cho Nữ"
                : pkg.gender === "male"
                ? "Dành cho Nam"
                : "Nam & Nữ"}
            </span>
          </div>

          <div className="package-card-body">
            <div className="package-facility">
              <i className="fa fa-hospital-o"></i>
              <span>{pkg.facilityData?.name || "Cơ sở uy tín"}</span>
            </div>

            <h3 className="package-name" title={pkg.name}>
              {pkg.name}
            </h3>

            <div className="package-meta">
              {pkg.duration && (
                <span>
                  <i className="fa fa-clock-o"></i>
                  {pkg.duration} phút
                </span>
              )}
              {pkg.ageRange && (
                <span>
                  <i className="fa fa-user-circle-o"></i>
                  {pkg.ageRange} tuổi
                </span>
              )}
            </div>

            <div className="package-card-footer">
              <div>
                <div className="price-label">Giá trọn gói</div>
                <div className="package-price">{this.formatPrice(pkg.price)}</div>
              </div>
              <button
                className="btn-view-detail"
                onClick={(e) => {
                  e.stopPropagation();
                  this.handlePackageClick(pkg);
                }}
              >
                Đặt lịch <i className="fa fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  renderFacilityCard = (facility) => {
    return (
      <div key={facility.id} className="col-lg-2 col-md-4 col-sm-6 col-12 mb-4">
        <div
          className="facility-card"
          onClick={() => this.handleFacilityClick(facility)}
        >
          <div className="facility-logo-wrap">
            <img
              src={this.getImageUrl(facility.logo, DEFAULT_FACILITY_LOGO)}
              alt={facility.name}
              onError={(e) => {
                e.target.src = DEFAULT_FACILITY_LOGO;
              }}
            />
          </div>
          <h4 className="facility-name" title={facility.name}>
            {facility.name}
          </h4>
          <p className="facility-address">
            {facility.address || facility.description || "TP. Hồ Chí Minh / Hà Nội"}
          </p>
          <div className="facility-rating">
            <i className="fa fa-star"></i>
            <span>{facility.rating || "4.8"}</span>
          </div>
        </div>
      </div>
    );
  };

  renderPackageModal = () => {
    const {
      isOpenPackageModal,
      selectedPackage,
      modalActiveTab,
      bookingDate,
      selectedTimeSlot,
      patientName,
      patientPhone,
      patientEmail,
      patientAddress,
      patientGender,
      patientNote,
      isSubmittingBooking,
      availableDoctors,
      selectedDoctorId,
      slots,
      loadingSlots,
    } = this.state;

    if (!selectedPackage) return null;

    const includedServices = this.parseJsonArray(selectedPackage.includedServices);
    
    // Calculate doctor banner display name according to Hybrid model
    let doctorBannerName = "";
    if (selectedDoctorId === "auto") {
      const currentAssignedDoc = slots.find((s) => s.key === selectedTimeSlot)?.assignedDoctor;
      if (currentAssignedDoc) {
        doctorBannerName = `${currentAssignedDoc.name} (Tự động điều phối)`;
      } else if (availableDoctors && availableDoctors.length > 0) {
        doctorBannerName = `Tự động phân công (${availableDoctors.length} bác sĩ trực ca)`;
      } else {
        doctorBannerName = (FACILITY_DOCTOR_MAP[selectedPackage.facilityId] || { name: "Bác sĩ phụ trách" }).name;
      }
    } else {
      const chosenDoc = availableDoctors.find((d) => String(d.id) === String(selectedDoctorId));
      doctorBannerName = chosenDoc ? chosenDoc.name : "Bác sĩ phụ trách";
    }

    const displayedSlots =
      slots && slots.length > 0
        ? slots
        : TIME_SLOTS.map((s) => ({
            ...s,
            availableSeats: 3,
            isFull: false,
          }));

    return (
      <Modal
        show={isOpenPackageModal}
        onHide={() => this.setState({ isOpenPackageModal: false })}
        className="general-modal"
        centered
        size="lg"
      >
        <div className="modal-header">
          <div className="modal-title">
            <i className="fa fa-stethoscope"></i>
            <span>{selectedPackage.name}</span>
          </div>
          <button
            className="close-btn"
            onClick={() => this.setState({ isOpenPackageModal: false })}
          >
            <i className="fa fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          {/* Tabs */}
          <div className="modal-tabs">
            <button
              className={`tab-btn ${modalActiveTab === "detail" ? "active" : ""}`}
              onClick={() => this.setState({ modalActiveTab: "detail" })}
            >
              <i className="fa fa-info-circle me-1"></i> Thông tin gói khám
            </button>
            <button
              className={`tab-btn ${modalActiveTab === "booking" ? "active" : ""}`}
              onClick={() => this.setState({ modalActiveTab: "booking" })}
            >
              <i className="fa fa-calendar-check-o me-1"></i> Đặt lịch khám ngay
            </button>
          </div>

          {modalActiveTab === "detail" ? (
            /* TAB 1: Chi tiết gói */
            <div>
              <div className="package-detail-header">
                <img
                  src={this.getImageUrl(
                    selectedPackage.image,
                    DEFAULT_PACKAGE_IMAGE
                  )}
                  alt={selectedPackage.name}
                  className="modal-pkg-img"
                  onError={(e) => {
                    e.target.src = DEFAULT_PACKAGE_IMAGE;
                  }}
                />
                <div className="modal-pkg-info">
                  <div className="info-facility">
                    <i className="fa fa-hospital-o me-1"></i>
                    {selectedPackage.facilityData?.name || "Cơ sở y tế uy tín"}
                  </div>
                  <h3 className="info-name">{selectedPackage.name}</h3>
                  <div className="info-price">
                    {this.formatPrice(selectedPackage.price)}
                  </div>
                  <div className="info-tags">
                    {selectedPackage.category && (
                      <span className="info-tag">
                        <i className="fa fa-tag me-1"></i>
                        {selectedPackage.category}
                      </span>
                    )}
                    {selectedPackage.duration && (
                      <span className="info-tag">
                        <i className="fa fa-clock-o me-1"></i>
                        {selectedPackage.duration} phút
                      </span>
                    )}
                    <span className="info-tag">
                      <i className="fa fa-venus-mars me-1"></i>
                      {selectedPackage.gender === "female"
                        ? "Nữ"
                        : selectedPackage.gender === "male"
                        ? "Nam"
                        : "Cả nam và nữ"}
                    </span>
                    {selectedPackage.ageRange && (
                      <span className="info-tag">
                        <i className="fa fa-user-o me-1"></i>
                        {selectedPackage.ageRange} tuổi
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {selectedPackage.description && (
                <div className="mb-4">
                  <h5 className="fw-bold text-dark mb-2" style={{ fontSize: "15px" }}>
                    Mô tả gói khám
                  </h5>
                  <p className="text-muted" style={{ fontSize: "14px", lineHeight: 1.6 }}>
                    {selectedPackage.description}
                  </p>
                </div>
              )}

              {includedServices.length > 0 && (
                <div className="mb-4">
                  <h5 className="fw-bold text-dark mb-2" style={{ fontSize: "15px" }}>
                    Danh mục dịch vụ bao gồm ({includedServices.length} hạng mục)
                  </h5>
                  <ul className="service-list">
                    {includedServices.map((service, idx) => (
                      <li key={idx}>
                        <i className="fa fa-check-circle"></i>
                        <span>{service}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedPackage.requirements && (
                <div className="requirement-box mb-3">
                  <div className="req-title">
                    <i className="fa fa-exclamation-circle"></i>
                    Lưu ý trước khi đi khám:
                  </div>
                  <div>{selectedPackage.requirements}</div>
                </div>
              )}

              {selectedPackage.notes && (
                <div className="text-muted small">
                  <i className="fa fa-info-circle me-1"></i>
                  <strong>Ghi chú:</strong> {selectedPackage.notes}
                </div>
              )}
            </div>
          ) : (
            /* TAB 2: Đặt lịch khám */
            <div>
              <div className="booking-summary-banner">
                <div>
                  <div className="banner-title">{selectedPackage.name}</div>
                  <div className="banner-sub">
                    Bác sĩ: <strong>{doctorBannerName}</strong> | Cơ sở:{" "}
                    <strong>{selectedPackage.facilityData?.name || "Trung tâm Y tế"}</strong>
                  </div>
                </div>
                <div className="banner-price">
                  {this.formatPrice(selectedPackage.price)}
                </div>
              </div>

              {/* Step 1: Chọn bác sĩ, ngày và khung giờ */}
              <div className="mb-4">
                <div className="form-section-label">
                  <i className="fa fa-calendar text-primary"></i>
                  <span>1. Chọn bác sĩ, ngày và khung giờ khám</span>
                </div>

                {/* Bác sĩ phụ trách / Phân công ca */}
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">
                    Bác sĩ tiếp nhận ca khám
                  </label>
                  <select
                    className="form-select modal-form-control"
                    value={selectedDoctorId}
                    onChange={this.handleDoctorSelectChange}
                  >
                    <option value="auto">
                      ✨ Cơ sở y tế tự phân công bác sĩ trực ca (Tối ưu nhất - Giảm tải chờ đợi)
                    </option>
                    {availableDoctors &&
                      availableDoctors.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          👨‍⚕️ {doc.name} {doc.specialty ? `— Chuyên khoa: ${doc.specialty}` : ""}
                        </option>
                      ))}
                  </select>
                  <div
                    className="form-text text-muted"
                    style={{ fontSize: "12px", marginTop: "4px" }}
                  >
                    {selectedDoctorId === "auto" ? (
                      <span>
                        <i className="fa fa-info-circle text-info me-1"></i>
                        Hệ thống sẽ tự động gán bác sĩ có lịch trống tối ưu tại cơ sở để đảm bảo bạn được khám đúng giờ.
                      </span>
                    ) : (
                      <span>
                        <i className="fa fa-user-md text-success me-1"></i>
                        Bạn đã chọn đích danh bác sĩ. Khung giờ hiển thị bên dưới tương ứng với số ca tiếp nhận của bác sĩ này.
                      </span>
                    )}
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-md-5">
                    <label className="form-label small fw-bold text-muted">
                      Ngày khám
                    </label>
                    <DatePicker
                      onChange={this.handleBookingDateChange}
                      className="form-control modal-form-control"
                      value={bookingDate}
                      minDate={new Date()}
                    />
                  </div>
                  <div className="col-md-7">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label className="form-label small fw-bold text-muted mb-0">
                        Khung giờ còn chỗ
                      </label>
                      {loadingSlots && (
                        <span className="small text-primary">
                          <i className="fa fa-spinner fa-spin me-1"></i> Đang kiểm tra...
                        </span>
                      )}
                    </div>
                    <div className="time-slots-grid">
                      {displayedSlots.map((slot) => {
                        const isSelected = selectedTimeSlot === slot.key;
                        const isFull = slot.isFull;
                        return (
                          <button
                            key={slot.key}
                            type="button"
                            disabled={isFull}
                            className={`time-slot-btn ${
                              isSelected ? "selected" : ""
                            } ${isFull ? "slot-full" : ""}`}
                            onClick={() =>
                              !isFull &&
                              this.setState({ selectedTimeSlot: slot.key })
                            }
                          >
                            <span className="slot-time">{slot.label}</span>
                            {isFull ? (
                              <span className="slot-badge full">
                                Đã kín chỗ
                              </span>
                            ) : (
                              <span className="slot-badge available">
                                Còn {slot.availableSeats != null ? slot.availableSeats : 3} chỗ
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Thông tin bệnh nhân */}
              <div>
                <div className="form-section-label">
                  <i className="fa fa-user-plus text-primary"></i>
                  <span>2. Thông tin bệnh nhân đặt lịch</span>
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">
                      Họ và tên bệnh nhân <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control modal-form-control"
                      placeholder="Ví dụ: Nguyễn Văn A"
                      value={patientName}
                      onChange={(e) =>
                        this.setState({ patientName: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">
                      Số điện thoại <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control modal-form-control"
                      placeholder="Ví dụ: 0912345678"
                      value={patientPhone}
                      onChange={(e) =>
                        this.setState({ patientPhone: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">
                      Địa chỉ Email <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-control modal-form-control"
                      placeholder="Email nhận mã xác nhận và kết quả"
                      value={patientEmail}
                      onChange={(e) =>
                        this.setState({ patientEmail: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">
                      Giới tính
                    </label>
                    <select
                      className="form-select modal-form-control"
                      value={patientGender}
                      onChange={(e) =>
                        this.setState({ patientGender: e.target.value })
                      }
                    >
                      <option value="M">Nam</option>
                      <option value="F">Nữ</option>
                      <option value="O">Khác</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-bold text-muted">
                      Địa chỉ liên hệ <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control modal-form-control"
                      placeholder="Quận/Huyện, Tỉnh/Thành phố"
                      value={patientAddress}
                      onChange={(e) =>
                        this.setState({ patientAddress: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-bold text-muted">
                      Lý do khám / Triệu chứng hiện tại (nếu có)
                    </label>
                    <textarea
                      className="form-control modal-form-control"
                      rows="2"
                      placeholder="Mô tả tóm tắt tình trạng sức khỏe hoặc yêu cầu thêm..."
                      value={patientNote}
                      onChange={(e) =>
                        this.setState({ patientNote: e.target.value })
                      }
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn-secondary-custom"
            onClick={() => this.setState({ isOpenPackageModal: false })}
          >
            Đóng
          </button>
          {modalActiveTab === "detail" ? (
            <button
              type="button"
              className="btn-primary-custom"
              onClick={() => this.setState({ modalActiveTab: "booking" })}
            >
              <span>Đặt lịch khám gói này</span>
              <i className="fa fa-arrow-right"></i>
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary-custom"
              disabled={isSubmittingBooking}
              onClick={this.handleConfirmBooking}
            >
              {isSubmittingBooking ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <i className="fa fa-check"></i>
                  <span>Xác nhận đặt lịch</span>
                </>
              )}
            </button>
          )}
        </div>
      </Modal>
    );
  };

  renderFacilityModal = () => {
    const { isOpenFacilityModal, selectedFacility, facilityPackages } =
      this.state;

    if (!selectedFacility) return null;

    return (
      <Modal
        show={isOpenFacilityModal}
        onHide={() => this.setState({ isOpenFacilityModal: false })}
        className="general-modal"
        centered
        size="lg"
      >
        <div className="modal-header">
          <div className="modal-title">
            <i className="fa fa-hospital-o"></i>
            <span>Thông tin cơ sở y tế</span>
          </div>
          <button
            className="close-btn"
            onClick={() => this.setState({ isOpenFacilityModal: false })}
          >
            <i className="fa fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          <div className="d-flex align-items-center gap-3 mb-4">
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f8fafc",
                padding: "8px",
              }}
            >
              <img
                src={this.getImageUrl(
                  selectedFacility.logo,
                  DEFAULT_FACILITY_LOGO
                )}
                alt={selectedFacility.name}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
                onError={(e) => {
                  e.target.src = DEFAULT_FACILITY_LOGO;
                }}
              />
            </div>
            <div>
              <h4 className="fw-bold text-dark mb-1">
                {selectedFacility.name}
              </h4>
              <p className="text-muted small mb-1">
                <i className="fa fa-map-marker text-danger me-1"></i>
                {selectedFacility.address || "Việt Nam"}
              </p>
              {selectedFacility.phone && (
                <p className="text-muted small mb-0">
                  <i className="fa fa-phone text-primary me-1"></i>
                  Hotline: {selectedFacility.phone}
                </p>
              )}
            </div>
          </div>

          {selectedFacility.description && (
            <div className="mb-4">
              <h6 className="fw-bold text-dark mb-2">Giới thiệu</h6>
              <p className="text-muted small" style={{ lineHeight: 1.6 }}>
                {selectedFacility.description}
              </p>
            </div>
          )}

          {/* Packages of this facility */}
          <div>
            <h6 className="fw-bold text-dark mb-3">
              Các gói khám tại cơ sở này ({facilityPackages.length})
            </h6>
            {facilityPackages.length > 0 ? (
              <div className="row g-3">
                {facilityPackages.map((pkg) => (
                  <div key={pkg.id} className="col-md-6 col-12">
                    <div
                      className="p-3 border rounded-3 d-flex align-items-center justify-content-between"
                      style={{
                        background: "#f8fafc",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onClick={() => {
                        this.setState({
                          isOpenFacilityModal: false,
                          selectedPackage: pkg,
                          modalActiveTab: "detail",
                          isOpenPackageModal: true,
                        });
                      }}
                    >
                      <div>
                        <div
                          className="fw-bold text-dark mb-1"
                          style={{ fontSize: "13.5px" }}
                        >
                          {pkg.name}
                        </div>
                        <div className="text-danger fw-bold small">
                          {this.formatPrice(pkg.price)}
                        </div>
                      </div>
                      <button className="btn btn-sm btn-outline-primary rounded-pill">
                        Chi tiết
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted small fst-italic">
                Hiện tại chưa có gói khám nào liên kết với cơ sở này.
              </p>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn-secondary-custom"
            onClick={() => this.setState({ isOpenFacilityModal: false })}
          >
            Đóng
          </button>
        </div>
      </Modal>
    );
  };

  render() {
    const {
      packages,
      facilities,
      loading,
      error,
      filters,
      filterOptions,
      searchMode,
      searchResults,
      selectedCategoryChip,
    } = this.state;

    if (loading) {
      return (
        <div className="general-exam-page">
          <HomeHeader isShowBanner={false} />
          <div className="container py-5 text-center">
            <div
              className="spinner-border text-primary"
              style={{ width: "3rem", height: "3rem" }}
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted fw-semibold">
              Đang tải danh sách gói khám & cơ sở y tế...
            </p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="general-exam-page">
          <HomeHeader isShowBanner={false} />
          <div className="container py-5">
            <div className="alert alert-danger shadow-sm" role="alert">
              <i className="fa fa-exclamation-triangle me-2"></i>
              {error}
            </div>
          </div>
        </div>
      );
    }

    const displayedPackages = searchMode
      ? searchResults.packages
      : packages;
    const displayedFacilities = searchMode
      ? searchResults.facilities
      : facilities;

    return (
      <div className="general-exam-page">
        <HomeHeader isShowBanner={false} />

        <div className="container">
          {/* Breadcrumb */}
          <div className="custom-breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <a
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    this.props.navigate("/home");
                  }}
                >
                  <i className="fa fa-home"></i> Trang chủ
                </a>
              </li>
              <li className="breadcrumb-item active">Khám tổng quát</li>
            </ol>
          </div>

          {/* Hero Section */}
          <div className="hero-section">
            <div className="hero-badge">
              <i className="fa fa-shield"></i>
              Bảo vệ sức khỏe chủ động
            </div>
            <h1 className="hero-title">Gói Khám Sức Khỏe Toàn Diện</h1>
            <p className="hero-desc">
              Lựa chọn các gói khám tổng quát chất lượng cao từ các bệnh viện và
              phòng khám hàng đầu, với lịch hẹn nhanh chóng và bảng giá minh bạch.
            </p>
          </div>

          {/* Search & Filter Panel (Replaced ugly yellow box with modern medical cyan UI) */}
          <div className="filter-panel">
            <div className="row g-3">
              <div className="col-lg-5 col-md-12">
                <div className="search-input-group">
                  <i className="fa fa-search search-icon"></i>
                  <input
                    type="text"
                    className="form-control search-control"
                    placeholder="Tìm gói khám, bệnh viện, phòng khám..."
                    value={filters.keyword}
                    onChange={(e) =>
                      this.handleFilterChange("keyword", e.target.value)
                    }
                    onKeyPress={(e) =>
                      e.key === "Enter" && this.handleSearch()
                    }
                  />
                </div>
              </div>

              <div className="col-lg-3 col-md-4 col-sm-6">
                <select
                  className="form-select filter-select"
                  value={filters.category}
                  onChange={(e) =>
                    this.handleFilterChange("category", e.target.value)
                  }
                >
                  <option value="">Tất cả danh mục</option>
                  {filterOptions.categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-lg-2 col-md-4 col-sm-6">
                <select
                  className="form-select filter-select"
                  value={filters.gender}
                  onChange={(e) =>
                    this.handleFilterChange("gender", e.target.value)
                  }
                >
                  <option value="">Giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="both">Cả hai</option>
                </select>
              </div>

              <div className="col-lg-2 col-md-4 col-12">
                <div className="filter-actions">
                  <button
                    className="btn-search"
                    type="button"
                    onClick={this.handleSearch}
                  >
                    <i className="fa fa-filter"></i>
                    Lọc
                  </button>
                  <button
                    className="btn-reset"
                    type="button"
                    title="Xóa bộ lọc"
                    onClick={this.handleResetFilters}
                  >
                    <i className="fa fa-refresh"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Category Chips */}
            {filterOptions.categories.length > 0 && (
              <div className="quick-categories">
                <span className="quick-label">
                  <i className="fa fa-tags me-1"></i> Danh mục:
                </span>
                <span
                  className={`cat-chip ${
                    selectedCategoryChip === "" ? "active" : ""
                  }`}
                  onClick={() => this.handleCategoryChipClick("")}
                >
                  Tất cả
                </span>
                {filterOptions.categories.map((cat) => (
                  <span
                    key={cat}
                    className={`cat-chip ${
                      selectedCategoryChip === cat ? "active" : ""
                    }`}
                    onClick={() => this.handleCategoryChipClick(cat)}
                  >
                    {cat}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Section: Danh sách gói khám */}
          <div className="mb-5">
            <div className="section-header">
              <div className="section-title-wrap">
                <div className="section-badge">Gói khám được chọn lọc</div>
                <h2 className="section-title">
                  {searchMode ? "Kết quả tìm kiếm gói khám" : "Gói khám nổi bật"}
                </h2>
              </div>
              <div className="result-count">
                Hiển thị {displayedPackages.length} gói khám
              </div>
            </div>

            {displayedPackages.length > 0 ? (
              <div className="row g-4">
                {displayedPackages.map((pkg) => this.renderPackageCard(pkg))}
              </div>
            ) : (
              <div className="empty-state">
                <i className="fa fa-search empty-icon"></i>
                <h4 className="empty-title">Không tìm thấy gói khám phù hợp</h4>
                <p className="empty-desc">
                  Thử tìm kiếm với từ khóa khác hoặc bấm nút làm mới bộ lọc để
                  xem tất cả các gói khám.
                </p>
                <button
                  className="btn btn-outline-primary rounded-pill px-4"
                  onClick={this.handleResetFilters}
                >
                  <i className="fa fa-refresh me-2"></i>Làm mới bộ lọc
                </button>
              </div>
            )}
          </div>

          {/* Section: Cơ sở y tế triển khai */}
          <div className="mb-5">
            <div className="section-header">
              <div className="section-title-wrap">
                <div className="section-badge">Hệ thống liên kết</div>
                <h2 className="section-title">Cơ sở y tế triển khai</h2>
              </div>
              <div className="result-count">
                {displayedFacilities.length} cơ sở
              </div>
            </div>

            {displayedFacilities.length > 0 ? (
              <div className="row g-4">
                {displayedFacilities.map((f) => this.renderFacilityCard(f))}
              </div>
            ) : (
              <div className="empty-state">
                <i className="fa fa-hospital-o empty-icon"></i>
                <h4 className="empty-title">Chưa có cơ sở y tế phù hợp</h4>
              </div>
            )}
          </div>
        </div>

        {/* Package Detail & Booking Modal */}
        {this.renderPackageModal()}

        {/* Facility Info Modal */}
        {this.renderFacilityModal()}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isLoggedIn: state.user.isLoggedIn,
    language: state.app.language,
    patientInfo: state.patient.patientInfo,
    userInfo: state.user.userInfo,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    navigate: (path) => dispatch(push(path)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(GeneralExamPage);
