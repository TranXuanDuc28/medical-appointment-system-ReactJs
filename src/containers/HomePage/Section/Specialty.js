import React, { Component } from "react";
import { connect } from "react-redux";
import { FormattedMessage } from "react-intl";
import Slider from "react-slick";
import { NextArrow, PrevArrow } from "../CustomArrows";
import { getAllSpecialty } from "../../../services/userServices";
import { withRouter } from "react-router";
class Specialty extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSpecialty: [],
    };
  }

  async componentDidMount() {
    this.getAllSpecialty();
  }

  getAllSpecialty = async () => {
    let res = await getAllSpecialty({ lang: this.props.language });
    console.log("res Specialty", res);
    if (res && res.errCode === 0) {
      this.setState({
        dataSpecialty: res.data ? res.data : [],
      });
    }
  };
  async componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.language !== this.props.language) {
      this.getAllSpecialty();
    }
  }
  handleViewDetailSpecialty = (item) => {
    if (this.props.history) {
      this.props.history.push(`/detail-specialty/${item.id}`);
    }
  };
  render() {
    let { dataSpecialty } = this.state;
    return (
      <div className="section-share section-specialty section-background">
        <div className="section-content">
          <div className="section-header">
            <span className="title-section">
              <FormattedMessage id="homepage.specialty-popular" />
            </span>
            <button
              className="btn-section"
              onClick={() => this.props.history.push("/specialty")}
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
              {dataSpecialty &&
                dataSpecialty.length > 0 &&
                dataSpecialty.map((item, index) => {
                  return (
                    <div
                      className="section-customize customize-specialty"
                      key={index}
                      onClick={() => this.handleViewDetailSpecialty(item)}
                    >
                      <div
                        className="bg-image section-specialty"
                        style={{
                          backgroundImage: `url(${item.image})`,
                        }}
                      />
                      <div className="title-section">{item.name}</div>
                    </div>
                  );
                })}
            </Slider>
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
  return {};
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Specialty)
);
