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
  render() {
    const { isLoggedIn } = this.props;
    //let linkToRedirect = isLoggedIn ? "/system/user-manage" : "/home";
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
      <div>
        <HomeHeader isShowBanner={true} />
        <ComprehensiveService />
        <Specialty settings={settings} />
        <MedicalFacility settings={settings} />
        <OutstandingDoctor settings={settings} />
        <HandBook settings={settings} />
        <About />
        <HomeFooter />
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
