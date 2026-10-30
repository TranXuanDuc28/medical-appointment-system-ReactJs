import React, { Component } from "react";
import { connect } from "react-redux";
import { push } from "connected-react-router";
import HomeHeader from "../../HomePage/HomeHeader";
import { getAllClinic } from "../../../services/userServices";
import { getAllFacilities } from "../../../services/facilityService";
import "./MedicalFacilityPage.scss";

const DEFAULT_CLINIC_IMAGE =
  "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80";

// Mapping facility IDs to matching clinic IDs in database
const FACILITY_TO_CLINIC = {
  22: 3, // Đại học Y Dược 1
  23: 7, // Thu Cúc TCI
};

class MedicalFacilityPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      clinics: [],
      filteredClinics: [],
      loading: true,
      searchTerm: "",
      selectedCity: "ALL", // 'ALL' | 'HN' | 'HCM'
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

      const [clinicRes, facilityRes] = await Promise.all([
        getAllClinic({ lang }).catch(() => ({ errCode: -1 })),
        getAllFacilities().catch(() => ({ errCode: -1 })),
      ]);

      let combined = [];
      const seenNames = new Set();

      // 1. Add primary clinics from /api/get-clinic
      if (clinicRes && clinicRes.errCode === 0 && Array.isArray(clinicRes.data)) {
        clinicRes.data.forEach((c) => {
          if (c && c.name && !seenNames.has(c.name.trim().toLowerCase())) {
            seenNames.add(c.name.trim().toLowerCase());
            combined.push({
              id: c.id,
              name: c.name,
              address: c.address || "Hà Nội / TP. Hồ Chí Minh",
              image: c.image || DEFAULT_CLINIC_IMAGE,
              description: c.descriptionHTML || c.descriptionMarkdown || "",
              type: "clinic",
              targetRoute: `/detail-clinic/${c.id}`,
            });
          }
        });
      }

      // 2. Add facilities from /api/facilities/all if not already added
      if (facilityRes && facilityRes.errCode === 0 && Array.isArray(facilityRes.data)) {
        facilityRes.data.forEach((f) => {
          if (f && f.name && !seenNames.has(f.name.trim().toLowerCase())) {
            seenNames.add(f.name.trim().toLowerCase());
            const clinicId = FACILITY_TO_CLINIC[f.id];
            const targetRoute = clinicId
              ? `/detail-clinic/${clinicId}`
              : `/general-exam`;

            const backendUrl =
              process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
            const imageUrl = f.logo
              ? (f.logo.startsWith("http") ? f.logo : `${backendUrl}${f.logo.startsWith("/") ? "" : "/"}${f.logo}`)
              : DEFAULT_CLINIC_IMAGE;

            combined.push({
              id: f.id,
              name: f.name,
              address: f.address || f.description || "Việt Nam",
              image: imageUrl,
              description: f.description || "",
              type: "facility",
              targetRoute: targetRoute,
            });
          }
        });
      }

      this.setState({
        clinics: combined,
        filteredClinics: combined,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching clinics:", error);
      this.setState({ loading: false });
    }
  };

  handleFilter = (searchTerm, city) => {
    const { clinics } = this.state;
    const term = searchTerm.toLowerCase().trim();

    const filtered = clinics.filter((item) => {
      const matchName =
        !term ||
        (item.name && item.name.toLowerCase().includes(term)) ||
        (item.address && item.address.toLowerCase().includes(term));

      let matchCity = true;
      if (city === "HN") {
        matchCity =
          item.address &&
          (item.address.toLowerCase().includes("hà nội") ||
            item.address.toLowerCase().includes("ha noi"));
      } else if (city === "HCM") {
        matchCity =
          item.address &&
          (item.address.toLowerCase().includes("hồ chí minh") ||
            item.address.toLowerCase().includes("tp.hcm") ||
            item.address.toLowerCase().includes("hcm") ||
            item.address.toLowerCase().includes("sài gòn"));
      }

      return matchName && matchCity;
    });

    this.setState({
      searchTerm,
      selectedCity: city,
      filteredClinics: filtered,
    });
  };

  handleSearchChange = (e) => {
    const term = e.target.value;
    this.handleFilter(term, this.state.selectedCity);
  };

  handleCityChange = (city) => {
    this.handleFilter(this.state.searchTerm, city);
  };

  handleCardClick = (item) => {
    if (item.targetRoute) {
      this.props.navigate(item.targetRoute);
    }
  };

  detectCityTag = (address) => {
    if (!address) return "Toàn quốc";
    const lower = address.toLowerCase();
    if (lower.includes("hà nội") || lower.includes("ha noi")) return "Hà Nội";
    if (
      lower.includes("hồ chí minh") ||
      lower.includes("tp.hcm") ||
      lower.includes("hcm") ||
      lower.includes("sài gòn")
    )
      return "TP. HCM";
    return "Toàn quốc";
  };

  render() {
    const { filteredClinics, loading, searchTerm, selectedCity } = this.state;

    return (
      <div className="medical-facility-page">
        <HomeHeader isShowBanner={false} />

        <div className="container">
          {/* Breadcrumb */}
          <div className="facility-breadcrumb">
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
              <li className="breadcrumb-item active">Cơ sở y tế</li>
            </ol>
          </div>

          {/* Hero Banner */}
          <div className="facility-hero">
            <div className="hero-badge">
              <i className="fa fa-hospital-o"></i> Hệ thống bệnh viện & phòng khám
            </div>
            <h1 className="hero-title">Cơ Sở Y Tế Hàng Đầu</h1>
            <p className="hero-desc">
              Khám và điều trị tại các bệnh viện tuyến đầu, phòng khám đa khoa uy
              tín trên cả nước với đầy đủ trang thiết bị y tế hiện đại.
            </p>
          </div>

          {/* Search & Filter Card */}
          <div className="search-filter-card">
            <div className="row g-3 align-items-center">
              <div className="col-lg-7 col-md-12">
                <div className="search-input-wrap">
                  <i className="fa fa-search search-icon"></i>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Tìm theo tên bệnh viện, phòng khám, địa chỉ..."
                    value={searchTerm}
                    onChange={this.handleSearchChange}
                  />
                </div>
              </div>

              <div className="col-lg-5 col-md-12">
                <div className="city-filter-chips">
                  <span className="text-muted small fw-bold me-1">Khu vực:</span>
                  <button
                    className={`chip-btn ${selectedCity === "ALL" ? "active" : ""}`}
                    onClick={() => this.handleCityChange("ALL")}
                  >
                    Tất cả
                  </button>
                  <button
                    className={`chip-btn ${selectedCity === "HN" ? "active" : ""}`}
                    onClick={() => this.handleCityChange("HN")}
                  >
                    <i className="fa fa-map-marker text-danger"></i> Hà Nội
                  </button>
                  <button
                    className={`chip-btn ${selectedCity === "HCM" ? "active" : ""}`}
                    onClick={() => this.handleCityChange("HCM")}
                  >
                    <i className="fa fa-map-marker text-danger"></i> TP. Hồ Chí Minh
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results meta */}
          <div className="results-meta">
            <h2 className="results-title">Danh sách cơ sở y tế</h2>
            <div className="results-count">
              {filteredClinics.length} cơ sở y tế
            </div>
          </div>

          {/* Facility List Grid */}
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
                Đang tải danh sách cơ sở y tế...
              </p>
            </div>
          ) : filteredClinics.length > 0 ? (
            <div className="row">
              {filteredClinics.map((clinic) => {
                const cityTag = this.detectCityTag(clinic.address);
                return (
                  <div
                    key={`${clinic.type}-${clinic.id}`}
                    className="col-lg-4 col-md-6 col-12 clinic-card-wrap"
                  >
                    <div
                      className="clinic-card"
                      onClick={() => this.handleCardClick(clinic)}
                    >
                      <div className="card-img-wrap">
                        <img
                          src={clinic.image}
                          alt={clinic.name}
                          className="card-img"
                          onError={(e) => {
                            e.target.src = DEFAULT_CLINIC_IMAGE;
                          }}
                        />
                        <span className="badge-location">
                          <i className="fa fa-map-pin"></i>
                          {cityTag}
                        </span>
                      </div>

                      <div className="card-body-content">
                        <h3 className="clinic-name" title={clinic.name}>
                          {clinic.name}
                        </h3>

                        <div className="clinic-address">
                          <i className="fa fa-map-marker"></i>
                          <span>{clinic.address}</span>
                        </div>

                        <div className="card-footer-action">
                          <span className="clinic-tag">
                            <i className="fa fa-check-circle me-1"></i>
                            Đã xác minh
                          </span>
                          <button
                            className="btn-detail"
                            onClick={(e) => {
                              e.stopPropagation();
                              this.handleCardClick(clinic);
                            }}
                          >
                            <span>Xem chi tiết</span>
                            <i className="fa fa-arrow-right"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <i className="fa fa-hospital-o empty-icon"></i>
              <h4 className="empty-title">Không tìm thấy cơ sở y tế phù hợp</h4>
              <p className="empty-desc">
                Thử thay đổi từ khóa tìm kiếm hoặc bấm xem tất cả khu vực.
              </p>
              <button
                className="btn btn-outline-primary rounded-pill px-4 mt-3"
                onClick={() => this.handleFilter("", "ALL")}
              >
                <i className="fa fa-refresh me-2"></i>Xem tất cả cơ sở y tế
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

export default connect(mapStateToProps, mapDispatchToProps)(MedicalFacilityPage);
