import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { connect } from "react-redux";
import "slick-carousel/slick/slick.css";
import Slider from "react-slick";
import { NextArrow, PrevArrow } from "../CustomArrows";
import { withRouter } from "react-router";
import { FormattedMessage } from "react-intl";
import { getAllClinic } from "../../../services/userServices";
class MedicalFacility extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataClinic: [],
    };
  }

  async componentDidMount() {
    let res = await getAllClinic({ lang: this.props.language });
    if (res && res.errCode === 0) {
      this.setState({
        dataClinic: res.data ? res.data : [],
      });
    }
  }
  async componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.language !== this.props.language) {
      let res = await getAllClinic({ lang: this.props.language });
      if (res && res.errCode === 0) {
        this.setState({
          dataClinic: res.data ? res.data : [],
        });
      }
    }
  }
  handleViewDetailClinic = (item) => {
    if (this.props.history) {
      this.props.history.push(`/detail-clinic/${item.id}`);
    }
  };
  render() {
    let { dataClinic } = this.state;
    return (
      <React.Fragment>
        <div className="section-share section-medical-facility">
          <div className="section-content">
            <div className="section-header">
              <span className="title-section">
                <FormattedMessage id="homepage.medical-facility" />
              </span>
              <button
                className="btn-section"
                onClick={() => this.props.history.push("/medical-facility")}
              >
                <span className="title-more-infor">
                  <FormattedMessage id="homepage.more-infor" />
                </span>
              </button>
            </div>
            <div className="section-body">
              <Slider
                {...this.props.settings}
                nextArrow={<NextArrow />}
                prevArrow={<PrevArrow />}
              >
                {dataClinic &&
                  dataClinic.length > 0 &&
                  dataClinic.map((item, index) => {
                    return (
                      <div
                        className="section-customize customize-medical-facility"
                        key={index}
                        onClick={() => this.handleViewDetailClinic(item)}
                      >
                        <div
                          className="bg-image section-medical-facility"
                          style={{
                            backgroundImage: `url(${item.image})`,
                          }}
                        ></div>
                        <div className="title-section"> {item.name}</div>
                      </div>
                    );
                  })}
              </Slider>
            </div>
          </div>
        </div>
      </React.Fragment>
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
  return {};
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(MedicalFacility)
);
