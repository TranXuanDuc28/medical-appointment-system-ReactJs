import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { connect } from "react-redux";
import HomeHeader from "./HomeHeader";
import ComprehensiveService from "./Section/ComprehensiveService";
import Specialty from "./Section/Specialty";
import MedicalFacility from "./Section/MedicalFacility";
import OutstandingDoctor from "./Section/OutstandingDoctor";
import HandBook from "./Section/HandBook";
import About from "./Section/About";
import HomeFooter from "./HomeFooter";
import AIAssistant from "./AIAssistant";
import "./HomePage.scss";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

class HomePage extends Component {
  constructor(props) {
    super(props);
    this.observer = null;
    this.scrollContainers = [];
  }

  componentDidMount() {
    this.initScrollReveal();
  }

  componentDidUpdate() {
    this.initScrollReveal();
  }

  componentWillUnmount() {
    if (this.observer) {
      this.observer.disconnect();
    }
    window.removeEventListener("scroll", this.handleScroll);
    if (this.scrollContainers && this.scrollContainers.length > 0) {
      this.scrollContainers.forEach((container) => {
        container.removeEventListener("scroll", this.handleScroll);
      });
    }
  }

  initScrollReveal = () => {
    const items = document.querySelectorAll(".scroll-reveal-item");
    if (!items || items.length === 0) return;

    // Kiểm tra phần tử nào đã lọt vào vùng nhìn thì kích hoạt xổ ra
    const checkElementsInView = () => {
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      items.forEach((el) => {
        if (!el.classList.contains("reveal-visible")) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= windowHeight - 70 && rect.bottom >= 0) {
            el.classList.add("reveal-visible");
          }
        }
      });
    };

    // 1. Dùng IntersectionObserver cho độ mượt mà cao nhất
    if ("IntersectionObserver" in window) {
      if (this.observer) this.observer.disconnect();

      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("reveal-visible");
              this.observer.unobserve(entry.target);
            }
          });
        },
        {
          root: null,
          rootMargin: "0px 0px -50px 0px",
          threshold: 0.08,
        }
      );

      items.forEach((el) => {
        const rect = el.getBoundingClientRect();
        // Nếu phần tử đã nằm trong tầm nhìn lúc đầu thì hiện ngay
        if (rect.top <= (window.innerHeight || document.documentElement.clientHeight) - 70 && rect.bottom >= 0) {
          el.classList.add("reveal-visible");
        } else {
          this.observer.observe(el);
        }
      });
    }

    // 2. Lắng nghe sự kiện Scroll Event
    this.handleScroll = () => {
      checkElementsInView();
    };

    window.addEventListener("scroll", this.handleScroll, { passive: true });

    // Tìm các container cuộn CustomScrollbars trong ứng dụng
    this.scrollContainers = document.querySelectorAll(
      ".content-container, .content-container > div, .main-container"
    );
    this.scrollContainers.forEach((container) => {
      container.addEventListener("scroll", this.handleScroll, { passive: true });
    });

    // Kích hoạt ngay lúc ban đầu
    checkElementsInView();
    setTimeout(checkElementsInView, 150);
    setTimeout(checkElementsInView, 500);
  };

  render() {
    const { isLoggedIn } = this.props;
    let settings = {
      infinite: false,
      speed: 500,
      slidesToShow: 4,
      slidesToScroll: 1,
      responsive: [
        {
          breakpoint: 1200, // Dưới 1200px
          settings: {
            slidesToShow: 3,
            slidesToScroll: 1,
          },
        },
        {
          breakpoint: 992, // Dưới 992px
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
          },
        },
        {
          breakpoint: 768, // Dưới 768px
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
          },
        },
        {
          breakpoint: 576, // Dưới 576px
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
          },
        },
      ],
    };

    return (
      <div className="homepage-container">
        <HomeHeader isShowBanner={true} />

        <div className="scroll-reveal-item">
          <ComprehensiveService />
        </div>

        <div className="scroll-reveal-item">
          <Specialty settings={settings} />
        </div>

        <div className="scroll-reveal-item">
          <MedicalFacility settings={settings} />
        </div>

        <div className="scroll-reveal-item">
          <OutstandingDoctor settings={settings} />
        </div>

        <div className="scroll-reveal-item">
          <HandBook settings={settings} />
        </div>

        <div className="scroll-reveal-item">
          <About />
        </div>

        <div className="scroll-reveal-item">
          <HomeFooter />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isLoggedIn: state.user.isLoggedIn,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
