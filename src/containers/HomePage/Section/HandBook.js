import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import "slick-carousel/slick/slick.css";
import Slider from "react-slick";
import { NextArrow, PrevArrow } from "../CustomArrows";
import axios from "axios";
import { getAllHandBook } from "../../../services/userServices";
import { FormattedMessage } from "react-intl";

class HandBook extends Component {
  state = {
    handbooks: [],
    loading: true,
  };

  async componentDidMount() {
    this.getAllHandBook();
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.language !== this.props.language) {
      this.getAllHandBook();
    }
  }
  getAllHandBook = async () => {
    try {
      const res = await getAllHandBook({ lang: this.props.language });
      this.setState({ handbooks: res.data || [], loading: false });
    } catch (e) {
      this.setState({ loading: false });
    }
  };

  handleClickHandBook = (id) => {
    this.props.history.push(`/handbook/${id}`);
  };

  render() {
    const { handbooks, loading } = this.state;
    console.log("state handbook", this.state);

    return (
      <React.Fragment>
        <div className="section-share section-handlebook">
          <div className="section-content">
            <div className="section-header">
              <div className="title-section">
                <FormattedMessage id="homepage.handbook" />
              </div>
              <div>
                <button
                  className="btn-section"
                  onClick={() => this.props.history.push("/handbook")}
                >
                  <FormattedMessage id="homepage.more-infor" />
                </button>
              </div>
            </div>
            <div className="section-body">
              {loading ? (
                <div>Đang tải...</div>
              ) : (
                <Slider
                  {...this.props.settings}
                  nextArrow={<NextArrow />}
                  prevArrow={<PrevArrow />}
                >
                  {handbooks.map((item) => (
                    <div
                      className="section-customize"
                      key={item.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => this.handleClickHandBook(item.id)}
                    >
                      <div
                        className="bg-image section-handlebook"
                        style={{
                          backgroundImage: `url(${item.image})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          height: 180,
                          borderRadius: 12,
                        }}
                      ></div>
                      <div className="title-section">
                        {item.handbookData && item.handbookData.length > 0 
                          ? item.handbookData[0].title 
                          : "Cẩm nang sức khỏe"}
                      </div>
                    </div>
                  ))}
                </Slider>
              )}
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    language: state.app.language,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(HandBook)
);
