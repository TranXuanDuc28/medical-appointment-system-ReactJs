import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import  './HomeFooter.scss';
import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";
// import React from "react";
import Slider from "react-slick";
class HomeFooter extends Component {
    render() {
        return (
            <React.Fragment>
               <div className=' section-footer'>
                  <div className='section-content'>
                    <div className='footer-left'>
                       BookingCare.
                    </div>
                    <div className='footer-right'>
                    <i className="fa fa-address-book" aria-hidden="true"></i>
                    </div>                 
                  </div>               
               </div>
               
            </React.Fragment>
        );
    }

}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.user.isLoggedIn,
    };
};

const mapDispatchToProps = dispatch => {
    return {
    
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeFooter);