import React, { Component } from "react";
import { connect } from "react-redux";
import { Modal, Button } from "react-bootstrap";
import "./MedicalSummaryModal.scss";
import { getPatientHistory, getMedicalSummary } from "../../../services/userServices";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";

class MedicalSummaryModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [],
      summary: "",
      isLoading: false,
    };
  }

  async componentDidUpdate(prevProps) {
    if (this.props.isOpenModal && prevProps.isOpenModal !== this.props.isOpenModal) {
      if (this.props.dataModal && this.props.dataModal.patientId) {
        await this.handleGetSummary();
      }
    }
  }

  handleGetSummary = async () => {
    this.setState({ isLoading: true, summary: "" });
    try {
      let resHistory = await getPatientHistory(this.props.dataModal.patientId);
      if (resHistory && resHistory.errCode === 0) {
        let history = resHistory.data;
        this.setState({ history: history });
        
        if (history && history.length > 0) {
          let resSummary = await getMedicalSummary({ history: history });
          if (resSummary && resSummary.data && resSummary.data.summary) {
            this.setState({ summary: resSummary.data.summary });
          } else {
            toast.error("Không thể tạo tóm tắt bệnh án.");
          }
        } else {
          this.setState({ summary: "Bệnh nhân chưa có lịch sử khám bệnh trước đó." });
        }
      } else {
        toast.error("Không thể lấy lịch sử khám bệnh.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Đã xảy ra lỗi khi xử lý dữ liệu.");
    } finally {
      this.setState({ isLoading: false });
    }
  };

  render() {
    let { isOpenModal, closeSummaryModal, dataModal } = this.props;
    let { summary, isLoading } = this.state;

    return (
      <Modal
        show={isOpenModal}
        onHide={closeSummaryModal}
        className={"medical-summary-modal-container"}
        size="lg"
        centered
      >
        <div className="modal-header">
          <h5 className="modal-title">Tóm tắt bệnh án thông minh (AI)</h5>
          <button
            type="button"
            className="close"
            aria-label="Close"
            onClick={closeSummaryModal}
            style={{ border: 'none', background: 'none' }}
          >
            <span aria-hidden="true" style={{ fontSize: '1.5rem' }}>×</span>
          </button>
        </div>
        <Modal.Body style={{ position: 'relative' }}>
          {isLoading && (
            <div className="loading-overlay" style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <ClipLoader color="#45c3d2" size={50} />
              <div className="mt-2 text-primary">AI đang phân tích và tóm tắt...</div>
            </div>
          )}
          <div className="row">
            <div className="col-12 mb-3">
              <h5>Bệnh nhân: <b>{dataModal.patientName}</b></h5>
            </div>
            <div className="col-12">
              <div className="summary-content p-3 bg-light border rounded">
                {summary ? (
                  <div className="ai-summary" dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, '<br/>') }} />
                ) : !isLoading ? (
                  <div className="text-muted italic">Đang chuẩn bị dữ liệu...</div>
                ) : null}
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeSummaryModal}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
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

export default connect(mapStateToProps, mapDispatchToProps)(MedicalSummaryModal);
