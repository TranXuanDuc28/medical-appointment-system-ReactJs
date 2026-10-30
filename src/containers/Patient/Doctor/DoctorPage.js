import React, { Component } from "react";
import { connect } from "react-redux";
import { push } from "connected-react-router";
import HomeHeader from "../../HomePage/HomeHeader";
import { getTopDoctorServices } from "../../../services/doctorServices";
import { getAllSpecialty } from "../../../services/userServices";
import { LANGUAGE } from "../../../utils";
import "./DoctorPage.scss";

const DEFAULT_AVATAR =
  "https://res.cloudinary.com/dehvr55kl/image/upload/v1754732538/360_F_549983970_bRCkYfk0P6PP5fKbMhZMIb07mCJ6esXL_tyysti.jpg";

class DoctorPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      doctors: [],
      filteredDoctors: [],
      specialties: [],
      selectedSpecialty: "ALL",
      searchTerm: "",
      loading: true,
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.language !== this.props.language) {
      this.fetchData();
    }
  }

  fetchData = async () => {
    try {
      this.setState({ loading: true });
      const lang = this.props.language || "vi";

      const [doctorRes, specialtyRes] = await Promise.all([
        getTopDoctorServices("", lang).catch(() => ({ errCode: -1 })),
        getAllSpecialty({ lang }).catch(() => ({ errCode: -1 })),
      ]);

      let formattedDoctors = [];
      if (doctorRes && doctorRes.errCode === 0 && Array.isArray(doctorRes.data)) {
        formattedDoctors = doctorRes.data.map((doc) => {
          let posVi = doc.positionData ? `${doc.positionData.valueVi} ` : "";
          let posEn = doc.positionData ? `${doc.positionData.valueEn} ` : "";
          let fullNameVi = `${posVi}${doc.lastName} ${doc.firstName}`.trim();
          let fullNameEn = `${posEn}${doc.firstName} ${doc.lastName}`.trim();

          let specialtyName =
            doc.Doctor_Infor?.doctorSpecialty?.specialtyData?.[0]?.name ||
            "Đa khoa";
          let clinicName =
            doc.Doctor_Infor?.nameClinic ||
            "Bệnh viện / Phòng khám liên kết";
          let clinicAddress =
            doc.Doctor_Infor?.addressClinic || "Hà Nội / TP. Hồ Chí Minh";
          let price = doc.Doctor_Infor?.priceTypeData
            ? lang === LANGUAGE.VI
              ? `${Number(doc.Doctor_Infor.priceTypeData.valueVi).toLocaleString("vi-VN")} VNĐ`
              : `${doc.Doctor_Infor.priceTypeData.valueEn} USD`
            : "250.000 VNĐ - 500.000 VNĐ";

          let avatarUrl = DEFAULT_AVATAR;
          if (doc.image) {
            if (doc.image.startsWith("data:") || doc.image.startsWith("http")) {
              avatarUrl = doc.image;
            } else {
              avatarUrl = doc.image;
            }
          }

          return {
            id: doc.id,
            fullName: lang === LANGUAGE.VI ? fullNameVi : fullNameEn,
            position: lang === LANGUAGE.VI ? doc.positionData?.valueVi : doc.positionData?.valueEn,
            specialty: specialtyName,
            clinicName: clinicName,
            clinicAddress: clinicAddress,
            price: price,
            avatar: avatarUrl,
          };
        });
      }

      let specialtyList = [];
      if (specialtyRes && specialtyRes.errCode === 0 && Array.isArray(specialtyRes.data)) {
        specialtyList = specialtyRes.data.map((s) => s.name).filter(Boolean);
      }

      this.setState({
        doctors: formattedDoctors,
        filteredDoctors: formattedDoctors,
        specialties: specialtyList,
        loading: false,
      });
    } catch (e) {
      console.error("Error fetching doctor page data:", e);
      this.setState({ loading: false });
    }
  };

  handleFilter = (searchTerm, specialty) => {
    const { doctors } = this.state;
    const term = searchTerm.toLowerCase().trim();

    const filtered = doctors.filter((doc) => {
      const matchSearch =
        !term ||
        doc.fullName.toLowerCase().includes(term) ||
        doc.specialty.toLowerCase().includes(term) ||
        doc.clinicName.toLowerCase().includes(term) ||
        doc.clinicAddress.toLowerCase().includes(term);

      const matchSpecialty =
        specialty === "ALL" ||
        doc.specialty.toLowerCase().includes(specialty.toLowerCase());

      return matchSearch && matchSpecialty;
    });

    this.setState({
      searchTerm,
      selectedSpecialty: specialty,
      filteredDoctors: filtered,
    });
  };

  handleSearchChange = (e) => {
    const term = e.target.value;
    this.handleFilter(term, this.state.selectedSpecialty);
  };

  handleSpecialtyChip = (specialty) => {
    this.handleFilter(this.state.searchTerm, specialty);
  };

  handleDoctorClick = (doc) => {
    this.props.navigate(`/detail-doctor/${doc.id}`);
  };

  render() {
    const { filteredDoctors, specialties, selectedSpecialty, searchTerm, loading } =
      this.state;

    return (
      <div className="doctor-page-container">
        <HomeHeader isShowBanner={false} />

        <div className="container">
          {/* Breadcrumb */}
          <div className="doctor-breadcrumb">
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
              <li className="breadcrumb-item active">Bác sĩ nổi bật</li>
            </ol>
          </div>

          {/* Hero Banner */}
          <div className="doctor-hero">
            <div className="hero-badge">
              <i className="fa fa-user-md"></i> Đội ngũ y bác sĩ hàng đầu
            </div>
            <h1 className="hero-title">Bác Sĩ Chuyên Khoa Uy Tín</h1>
            <p className="hero-desc">
              Kết nối trực tiếp với các Phó Giáo sư, Tiến sĩ, Bác sĩ Chuyên khoa
              I & II giàu kinh nghiệm tại các bệnh viện lớn trên toàn quốc.
            </p>
          </div>

          {/* Filter Card */}
          <div className="doctor-filter-card">
            <div className="search-input-wrap">
              <i className="fa fa-search search-icon"></i>
              <input
                type="text"
                className="search-input"
                placeholder="Tìm bác sĩ theo họ tên, chuyên khoa, bệnh viện..."
                value={searchTerm}
                onChange={this.handleSearchChange}
              />
            </div>

            {specialties.length > 0 && (
              <div className="specialty-chips-wrap">
                <button
                  className={`chip-btn ${
                    selectedSpecialty === "ALL" ? "active" : ""
                  }`}
                  onClick={() => this.handleSpecialtyChip("ALL")}
                >
                  Tất cả chuyên khoa
                </button>
                {specialties.map((s, idx) => (
                  <button
                    key={idx}
                    className={`chip-btn ${
                      selectedSpecialty === s ? "active" : ""
                    }`}
                    onClick={() => this.handleSpecialtyChip(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Meta section */}
          <div className="results-meta">
            <h2 className="results-title">Danh sách bác sĩ</h2>
            <div className="results-count">
              {filteredDoctors.length} bác sĩ nổi bật
            </div>
          </div>

          {/* Doctors Grid */}
          {loading ? (
            <div className="text-center py-5">
              <div
                className="spinner-border text-primary"
                style={{ width: "3rem", height: "3rem" }}
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted fw-semibold">
                Đang tải danh sách bác sĩ...
              </p>
            </div>
          ) : filteredDoctors.length > 0 ? (
            <div className="row">
              {filteredDoctors.map((doc) => (
                <div
                  key={doc.id}
                  className="col-lg-4 col-md-6 col-12 doctor-card-wrap"
                >
                  <div
                    className="doctor-card"
                    onClick={() => this.handleDoctorClick(doc)}
                  >
                    <div className="doctor-header">
                      <div className="avatar-wrapper">
                        <img
                          src={doc.avatar}
                          alt={doc.fullName}
                          className="doctor-avatar"
                          onError={(e) => {
                            e.target.src = DEFAULT_AVATAR;
                          }}
                        />
                        <span className="online-dot" title="Sẵn sàng tiếp nhận"></span>
                      </div>

                      <div className="doctor-title-wrap">
                        {doc.position && (
                          <div className="doctor-pos">{doc.position}</div>
                        )}
                        <h3 className="doctor-name" title={doc.fullName}>
                          {doc.fullName}
                        </h3>
                      </div>
                    </div>

                    <div className="doctor-body-meta">
                      <div className="meta-item specialty-badge-wrap">
                        <span className="specialty-badge">
                          <i className="fa fa-stethoscope me-1"></i>
                          {doc.specialty}
                        </span>
                      </div>

                      <div className="meta-item">
                        <i className="fa fa-hospital-o"></i>
                        <span>{doc.clinicName}</span>
                      </div>

                      <div className="meta-item">
                        <i className="fa fa-map-marker"></i>
                        <span>{doc.clinicAddress}</span>
                      </div>
                    </div>

                    <div className="doctor-card-footer">
                      <div className="price-box">
                        <div className="price-label">Giá khám</div>
                        <div className="price-val">{doc.price}</div>
                      </div>

                      <button
                        className="btn-book-doctor"
                        onClick={(e) => {
                          e.stopPropagation();
                          this.handleDoctorClick(doc);
                        }}
                      >
                        <span>Đặt khám</span>
                        <i className="fa fa-arrow-right"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <i className="fa fa-user-md empty-icon"></i>
              <h4 className="empty-title">Không tìm thấy bác sĩ phù hợp</h4>
              <p className="empty-desc">
                Thử thay đổi từ khóa tìm kiếm hoặc bấm xem tất cả chuyên khoa.
              </p>
              <button
                className="btn btn-outline-primary rounded-pill px-4 mt-3"
                onClick={() => this.handleFilter("", "ALL")}
              >
                <i className="fa fa-refresh me-2"></i>Xem tất cả bác sĩ
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isLoggedIn: state.user.isLoggedIn,
    language: state.app.language,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    navigate: (path) => dispatch(push(path)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DoctorPage);
