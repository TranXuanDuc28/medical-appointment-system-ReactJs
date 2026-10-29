import React, { Component } from "react";
import { connect } from "react-redux";
import { push } from "connected-react-router";
import Header from "../../Header/Header";
import {
  getFeaturedPackages,
  searchPackages,
  getFilterOptions as getPackageFilterOptions,
} from "../../../services/packageService";
import {
  getFeaturedFacilities,
  searchFacilities,
  getFilterOptions as getFacilityFilterOptions,
} from "../../../services/facilityService";
import HomeHeader from "../../HomePage/HomeHeader";

class GeneralExamPage extends Component {
  constructor(props) {
    super(props);
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
        ageRange: "",
        minPrice: "",
        maxPrice: "",
        facilityId: "",
        specialtyId: "",
        type: "",
        level: "",
        minRating: "",
      },
      filterOptions: {
        categories: [],
        ageRanges: [],
        genders: [],
        facilities: [],
        specialties: [],
        types: [],
        levels: [],
        priceRange: { min: 0, max: 0 },
        ratingRange: { min: 0, max: 5 },
      },
      sortBy: "createdAt",
      sortOrder: "DESC",
    };
  }

  componentDidMount() {
    this.fetchData();
    this.fetchFilterOptions();
  }

  fetchData = async () => {
    try {
      this.setState({ loading: true });

      // Fetch featured packages and facilities in parallel
      const [packagesResponse, facilitiesResponse] = await Promise.all([
        getFeaturedPackages(),
        getFeaturedFacilities(),
      ]);
      console.log("packagesResponse", packagesResponse);
      console.log("facilitiesResponse", facilitiesResponse);
      this.setState({
        packages: packagesResponse.data || [],
        facilities: facilitiesResponse.data || [],
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      this.setState({
        error: "Có lỗi xảy ra khi tải dữ liệu",
        loading: false,
      });
    }
  };

  fetchFilterOptions = async () => {
    try {
      const [packageFilters, facilityFilters] = await Promise.all([
        getPackageFilterOptions(),
        getFacilityFilterOptions(),
      ]);
      console.log("packageFilters", packageFilters);

      this.setState({
        filterOptions: {
          ...packageFilters.data,
          ...facilityFilters.data,
        },
      });
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  handleSearch = async () => {
    const { filters, sortBy, sortOrder } = this.state;

    try {
      this.setState({ loading: true, searchMode: true });

      // Prepare search parameters
      const searchParams = {
        ...filters,
        sortBy,
        sortOrder,
        limit: 20,
      };

      // Remove empty values
      Object.keys(searchParams).forEach((key) => {
        if (!searchParams[key] || searchParams[key] === "") {
          delete searchParams[key];
        }
      });

      // Search packages and facilities in parallel
      const [packagesResponse, facilitiesResponse] = await Promise.all([
        searchPackages(searchParams),
        searchFacilities(searchParams),
      ]);
      console.log("packagesResponse", packagesResponse);
      console.log("facilitiesResponse", facilitiesResponse);

      this.setState({
        searchResults: {
          packages: packagesResponse.data.packages || [],
          facilities: facilitiesResponse.data.facilities || [],
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
    this.setState((prevState) => ({
      filters: {
        ...prevState.filters,
        [field]: value,
      },
    }));
  };

  handleSortChange = (field) => {
    this.setState((prevState) => ({
      sortBy: field,
      sortOrder:
        prevState.sortBy === field && prevState.sortOrder === "ASC"
          ? "DESC"
          : "ASC",
    }));
  };

  handleResetFilters = () => {
    this.setState(
      {
        filters: {
          keyword: "",
          category: "",
          gender: "",
          ageRange: "",
          minPrice: "",
          maxPrice: "",
          facilityId: "",
          specialtyId: "",
          type: "",
          level: "",
          minRating: "",
        },
        searchMode: false,
        sortBy: "createdAt",
        sortOrder: "DESC",
      },
      () => {
        this.fetchData();
      }
    );
  };

  handlePackageClick = (packageItem) => {
    this.props.navigate(`/package-detail/${packageItem.id}`);
  };

  handleFacilityClick = (facility) => {
    this.props.navigate(`/facility-detail/${facility.id}`);
  };

  formatPrice = (price) => {
    if (!price || price === 0) {
      return "Chưa xác định";
    }
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  renderSearchResults = () => {
    const { searchResults, searchMode } = this.state;
    const PATH = process.env.REACT_APP_BACKEND_URL;
    console.log("Search results:", searchResults);

    if (!searchMode) return null;

    return (
      <div className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="h3 fw-bold text-dark mb-0">Kết quả tìm kiếm</h2>
          <button
            className="btn btn-outline-secondary"
            onClick={this.handleResetFilters}
          >
            <i className="fa fa-refresh me-2"></i>
            Làm mới
          </button>
        </div>

        {/* Packages Results */}
        {searchResults.packages.length > 0 && (
          <div className="mb-4">
            <h4 className="h5 fw-bold text-dark mb-3">
              Gói khám ({searchResults.packages.length})
            </h4>
            <div className="row g-4">
              {searchResults.packages.map((packageItem) => (
                <div key={packageItem.id} className="col-lg-3 col-md-6 col-12">
                  <div
                    className="card h-100 border-0 shadow-sm"
                    onClick={() => this.handlePackageClick(packageItem)}
                    style={{
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-8px)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 25px rgba(0,0,0,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 0.125rem 0.25rem rgba(0,0,0,0.075)";
                    }}
                  >
                    <img
                      src={PATH + packageItem.image}
                      className="card-img-top"
                      alt={packageItem.name}
                      style={{ height: "200px", objectFit: "cover" }}
                    />
                    <div className="card-body">
                      <h6
                        className="card-title fw-bold text-dark mb-2"
                        style={{ fontSize: "14px" }}
                      >
                        {packageItem.name}
                      </h6>
                      <p className="card-text text-muted small mb-2">
                        {packageItem.facilityData?.name || "Không xác định"}
                      </p>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-primary fw-bold">
                          Giá: {this.formatPrice(packageItem.price)}
                        </span>
                        <span className="badge bg-light text-dark">
                          {packageItem.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Facilities Results */}
        {searchResults.packages.length > 0 && (
          <div className="mb-4">
            <h4 className="h5 fw-bold text-dark mb-3">Cơ sở y tế</h4>
            <div className="row g-4">
              {searchResults.packages.map((pkg) => {
                const facility = pkg.facilityData;
                console.log("facility", facility);
                return (
                  <div
                    key={facility.id}
                    className="col-lg-2 col-md-4 col-sm-6 col-12"
                  >
                    <div
                      className="card border-0 shadow-sm text-center"
                      onClick={() => this.handleFacilityClick(facility)}
                      style={{
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 15px rgba(0,0,0,0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 0.125rem 0.25rem rgba(0,0,0,0.075)";
                      }}
                    >
                      <div className="card-body p-3">
                        <img
                          src={PATH + facility.logo}
                          className="img-fluid mb-3"
                          alt={facility.name}
                          style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "contain",
                          }}
                        />
                        <h6
                          className="card-title fw-bold text-dark mb-1"
                          style={{ fontSize: "12px" }}
                        >
                          {facility.name}
                        </h6>
                        <p className="card-text text-muted small mb-0">
                          {facility.description}
                        </p>
                        <div className="mt-2">
                          <span className="badge bg-warning text-dark">
                            <i className="fa fa-star me-1"></i>
                            {facility.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No Results */}
        {searchResults.packages.length === 0 &&
          searchResults.facilities.length === 0 && (
            <div className="text-center py-5">
              <i className="fa fa-search fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">Không tìm thấy kết quả</h5>
              <p className="text-muted">
                Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
              </p>
            </div>
          )}
      </div>
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
    } = this.state;
    const PATH = process.env.REACT_APP_BACKEND_URL;

    if (loading) {
      return (
        <div className="bg-light min-vh-100">
          <HomeHeader isShowBanner={false} />
          <div className="container py-4">
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Đang tải dữ liệu...</p>
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-light min-vh-100">
          <HomeHeader isShowBanner={false} />
          <div className="container py-4">
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-light min-vh-100">
        <HomeHeader isShowBanner={false} />

        <div className="container py-4">
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <i className="fa fa-home text-primary me-2"></i>
                <span className="text-primary">Khám tổng quát</span>
              </li>
            </ol>
          </nav>

          {/* Page Title */}
          <div className="text-center mb-5">
            <h1 className="display-4 fw-bold text-dark mb-3">Khám tổng quát</h1>
            <p
              className="lead text-muted mx-auto"
              style={{ maxWidth: "600px" }}
            >
              Chọn gói khám sức khỏe phù hợp với nhu cầu của bạn
            </p>
          </div>

          {/* Search and Filter Section */}
          <div
            className="bg-warning p-4 rounded-3 mb-5"
            style={{ background: "linear-gradient(135deg, #FFD700, #FFA500)" }}
          >
            <div className="row g-3">
              <div className="col-md-6">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tìm kiếm gói khám, cơ sở y tế..."
                    value={filters.keyword}
                    onChange={(e) =>
                      this.handleFilterChange("keyword", e.target.value)
                    }
                    onKeyPress={(e) => e.key === "Enter" && this.handleSearch()}
                  />
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={this.handleSearch}
                  >
                    <i className="fa fa-search"></i> Tìm kiếm
                  </button>
                </div>
              </div>
              <div className="col-md-6">
                <div className="row g-2">
                  <div className="col-6">
                    <select
                      className="form-select"
                      value={filters.category}
                      onChange={(e) =>
                        this.handleFilterChange("category", e.target.value)
                      }
                    >
                      <option value="">Tất cả danh mục</option>
                      {filterOptions.categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-6">
                    <select
                      className="form-select"
                      value={filters.gender}
                      onChange={(e) =>
                        this.handleFilterChange("gender", e.target.value)
                      }
                    >
                      <option value="">Tất cả giới tính</option>
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="both">Cả hai</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="row g-2">
                  <div className="col-6">
                    <select
                      className="form-select"
                      value={filters.minPrice}
                      onChange={(e) =>
                        this.handleFilterChange("minPrice", e.target.value)
                      }
                    >
                      <option value="">Giá từ</option>
                      <option value="0">0 VND</option>
                      <option value="1000000">1 triệu VND</option>
                      <option value="5000000">5 triệu VND</option>
                      <option value="10000000">10 triệu VND</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <select
                      className="form-select"
                      value={filters.maxPrice}
                      onChange={(e) =>
                        this.handleFilterChange("maxPrice", e.target.value)
                      }
                    >
                      <option value="">Giá đến</option>
                      <option value="5000000">5 triệu VND</option>
                      <option value="10000000">10 triệu VND</option>
                      <option value="20000000">20 triệu VND</option>
                      <option value="50000000">50 triệu VND</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="col-md-6 text-end">
                <button
                  className="btn btn-warning me-2"
                  onClick={this.handleSearch}
                >
                  <i className="fa fa-search me-2"></i>
                  Tìm kiếm
                </button>
                <button
                  className="btn btn-outline-secondary"
                  onClick={this.handleResetFilters}
                >
                  <i className="fa fa-refresh"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Search Results */}
          {this.renderSearchResults()}

          {/* Featured Packages Section */}
          {!searchMode && (
            <div className="mb-5">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="h3 fw-bold text-dark mb-0">Gói nổi bật</h2>
                <button className="btn btn-outline-secondary">XEM THÊM</button>
              </div>

              <div className="row g-4">
                {packages.map((packageItem) => (
                  <div
                    key={packageItem.id}
                    className="col-lg-3 col-md-6 col-12"
                  >
                    <div
                      className="card h-100 border-0 shadow-sm"
                      onClick={() => this.handlePackageClick(packageItem)}
                      style={{
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-8px)";
                        e.currentTarget.style.boxShadow =
                          "0 8px 25px rgba(0,0,0,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 0.125rem 0.25rem rgba(0,0,0,0.075)";
                      }}
                    >
                      <img
                        src={PATH + packageItem.image}
                        className="card-img-top"
                        alt={packageItem.name}
                        style={{ height: "200px", objectFit: "cover" }}
                      />
                      <div className="card-body">
                        <h6
                          className="card-title fw-bold text-dark mb-2"
                          style={{ fontSize: "14px" }}
                        >
                          {packageItem.name}
                        </h6>
                        <p className="card-text text-muted small mb-2">
                          {packageItem.facilityData?.name || "Không xác định"}
                        </p>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-primary fw-bold">
                            Giá: {this.formatPrice(packageItem.price)}
                          </span>
                          <span className="badge bg-light text-dark">
                            {packageItem.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Medical Facilities Section */}
          {!searchMode && (
            <div className="mb-5">
              <h2 className="h3 fw-bold text-dark mb-4">Cơ sở y tế</h2>

              <div className="row g-4">
                {facilities.map((facility) => (
                  <div
                    key={facility.id}
                    className="col-lg-2 col-md-4 col-sm-6 col-12"
                  >
                    <div
                      className="card border-0 shadow-sm text-center"
                      onClick={() => this.handleFacilityClick(facility)}
                      style={{
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        height: "100%",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 15px rgba(0,0,0,0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 0.125rem 0.25rem rgba(0,0,0,0.075)";
                      }}
                    >
                      <div className="card-body p-3">
                        <img
                          src={PATH + facility.logo}
                          className="img-fluid mb-3"
                          alt={facility.name}
                          style={{
                            width: "auto",
                            height: "50px",
                            objectFit: "cover",
                          }}
                        />
                        <h6
                          className="card-title fw-bold text-dark mb-1"
                          style={{ fontSize: "12px" }}
                        >
                          {facility.name}
                        </h6>
                        <p className="card-text text-muted small mb-0">
                          {facility.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(GeneralExamPage);
