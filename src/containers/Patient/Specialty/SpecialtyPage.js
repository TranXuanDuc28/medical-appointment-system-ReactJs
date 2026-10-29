import React, { Component } from "react";
import { connect } from "react-redux";
import { push } from "connected-react-router";
import Header from "../../Header/Header";

// Import available specialty icons
import coXuongKhop from "../../../assets/images/101627-co-xuong-khop.png";
import thanKinh from "../../../assets/images/101739-than-kinh.png";
import tieuHoa from "../../../assets/images/101713-tieu-hoa.png";
import timMach from "../../../assets/images/101713-tim-mach.png";
import taiMuiHong from "../../../assets/images/101713-tai-mui-hong.png";
import cotSong from "../../../assets/images/101627-cot-song.png";
import cotruyen from "../../../assets/images/101739-y-hoc-co-truyen.png";
import chamcuu from "../../../assets/images/101627-cham-cuu.png";
import sanphukhoa from "../../../assets/images/101713-san-phu-khoa.png";
import nhikhoa from "../../../assets/images/101655-nhi-khoa.png";
import dalieu from "../../../assets/images/101638-da-lieu.png";
import phuchoichucnang from "../../../assets/images/101713-phuc-hoi-chuc-nang.png";
import HomeHeader from "../../HomePage/HomeHeader";
import { getAllSpecialty } from "../../../services/userServices";
import "./SpecialtyPage.scss";

// Placeholder icons for missing ones
const placeholderIcon =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iMzgiIGZpbGw9IiM0MDk5YTQiIG9wYWNpdHk9IjAuMSIvPgo8Y2lyY2xlIGN4PSI0MCIgY3k9IjQwIiByPSIzMCIgZmlsbD0iIzQwOTlhNCIgb3BhY2l0eT0iMC4yIi8+CjxjaXJjbGUgY3g9IjQwIiBjeT0iNDAiIHI9IjIyIiBmaWxsPSIjNDA5OWE0IiBvcGFjaXR5PSIwLjMiLz4KPC9zdmc+";

const iconMap = {
  "cơ xương khớp": coXuongKhop,
  "thần kinh": thanKinh,
  "tiêu hóa": tieuHoa,
  "tim mạch": timMach,
  "tai mũi họng": taiMuiHong,
  "cột sống": cotSong,
  "y học cổ truyền": cotruyen,
  "châm cứu": chamcuu,
  "sản phụ khoa": sanphukhoa,
  "nhi khoa": nhikhoa,
  "da liễu": dalieu,
  "phục hồi chức năng": phuchoichucnang,
};

class SpecialtyPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      specialties: [],
      searchTerm: "",
    };
  }

  componentDidMount() {
    this.fetchSpecialties();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.language !== this.props.language) {
      this.fetchSpecialties();
    }
  }

  fetchSpecialties = async () => {
    try {
      let res = await getAllSpecialty({ lang: this.props.language || "vi" });
      if (res && res.errCode === 0 && res.data) {
        const fallbackIcons = [
          coXuongKhop,
          thanKinh,
          tieuHoa,
          timMach,
          taiMuiHong,
          cotSong,
          cotruyen,
          chamcuu,
          sanphukhoa,
          nhikhoa,
          dalieu,
          phuchoichucnang,
        ];

        let specialties = res.data.map((item, index) => {
          let nameLower = (item.name || "").toLowerCase().trim();
          let matchedIcon =
            iconMap[nameLower] ||
            fallbackIcons[index % fallbackIcons.length] ||
            placeholderIcon;
          return {
            id: item.id,
            name: item.name,
            icon: item.image || matchedIcon,
            description:
              item.description ||
              "Chuyên điều trị các bệnh chuyên sâu cùng bác sĩ giàu kinh nghiệm",
          };
        });
        this.setState({ specialties });
      }
    } catch (e) {
      console.error("Error fetching specialties:", e);
    }
  };

  handleSpecialtyClick = (specialty) => {
    this.props.navigate(`/detail-specialty/${specialty.id}`);
  };

  handleSearchChange = (e) => {
    this.setState({ searchTerm: e.target.value });
  };

  render() {
    const { specialties, searchTerm } = this.state;
    const filteredSpecialties = specialties.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );

    return (
      <div className="specialty-page-container">
        <HomeHeader isShowBanner={false} />

        <div className="container py-4">
          {/* Breadcrumb */}
          <div className="specialty-breadcrumb-wrapper">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <a
                    href="#home"
                    onClick={(e) => {
                      e.preventDefault();
                      this.props.navigate("/home");
                    }}
                  >
                    <i className="fa fa-home"></i>
                    <span>Trang chủ</span>
                  </a>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  <span className="fw-bold text-dark">Khám Chuyên khoa</span>
                </li>
              </ol>
            </nav>
          </div>

          {/* Page Title & Search */}
          <div className="specialty-page-header">
            <h1 className="page-title">Khám Chuyên khoa</h1>
            <p className="page-subtitle">
              Tìm bác sĩ và đặt lịch khám theo chuyên khoa phù hợp với tình trạng sức khỏe của bạn
            </p>

            <div className="specialty-search-wrapper">
              <i className="fa fa-search search-icon"></i>
              <input
                type="text"
                className="search-input"
                placeholder="Tìm kiếm chuyên khoa (ví dụ: Cơ xương khớp, Thần kinh...)"
                value={searchTerm}
                onChange={this.handleSearchChange}
              />
            </div>
          </div>

          {/* Specialties Grid */}
          <div className="row g-4 mb-5">
            {filteredSpecialties && filteredSpecialties.length > 0 ? (
              filteredSpecialties.map((specialty) => (
                <div
                  key={specialty.id}
                  className="col-lg-3 col-md-4 col-sm-6 col-12 specialty-card-col"
                >
                  <div
                    className="specialty-card"
                    onClick={() => this.handleSpecialtyClick(specialty)}
                  >
                    <div className="specialty-banner">
                      <div
                        className="specialty-banner-img"
                        style={{
                          backgroundImage: `url(${specialty.icon})`,
                        }}
                      />
                    </div>
                    <div className="specialty-card-body">
                      <h5 className="specialty-name">{specialty.name}</h5>
                      <p className="specialty-desc">{specialty.description}</p>
                      <div className="specialty-action-btn">
                        <span>Khám phá ngay</span>
                        <i className="fa fa-angle-right"></i>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12">
                <div className="no-specialty-found">
                  <i className="fa fa-search"></i>
                  <p>Không tìm thấy chuyên khoa nào phù hợp với từ khóa "{searchTerm}".</p>
                </div>
              </div>
            )}
          </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(SpecialtyPage);
