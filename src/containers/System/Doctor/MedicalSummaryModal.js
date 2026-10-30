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
      const patientId = this.props.dataModal?.patientId;
      if (!patientId) {
        this.setState({ summary: "Không tìm thấy thông tin bệnh nhân." });
        return;
      }

      let resHistory = await getPatientHistory(patientId);
      if (resHistory && resHistory.errCode === 0) {
        let history = resHistory.data || [];
        this.setState({ history: history });

        if (history.length > 0) {
          let resSummary = await getMedicalSummary({ history: history });
          let summaryText = resSummary?.summary || resSummary?.data?.summary;
          if (summaryText) {
            this.setState({ summary: summaryText });
          } else {
            toast.error("Không thể tạo tóm tắt bệnh án.");
          }
        } else {
          this.setState({
            summary: "Bệnh nhân chưa có lịch sử khám bệnh trước đó trong hệ thống.",
          });
        }
      } else {
        toast.error(resHistory?.errMessage || "Không thể lấy lịch sử khám bệnh.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Đã xảy ra lỗi khi xử lý dữ liệu.");
    } finally {
      this.setState({ isLoading: false });
    }
  };

  handleCopyToClipboard = () => {
    const { summary } = this.state;
    if (!summary) return;
    const plainText = summary.replace(/\*\*/g, "").replace(/\*/g, "-");
    navigator.clipboard.writeText(plainText).then(
      () => toast.success("Đã sao chép tóm tắt vào bộ nhớ tạm!"),
      () => toast.error("Không thể sao chép văn bản.")
    );
  };

  renderFormattedSummary = (text) => {
    if (!text) return null;

    const lines = text.split("\n");
    return lines.map((line, idx) => {
      let trimmed = line.trim();
      if (!trimmed) {
        return <div key={idx} style={{ height: "6px" }} />;
      }

      const isBullet = trimmed.startsWith("*") || trimmed.startsWith("-");
      if (isBullet) {
        trimmed = trimmed.replace(/^[\*\-]\s*/, "");
      }

      const parts = trimmed.split(/(\*\*.*?\*\*)/g);
      const renderedContent = parts.map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={pIdx}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={idx} className="summary-bullet">
            • {renderedContent}
          </div>
        );
      }

      return (
        <div key={idx} className="summary-line">
          {renderedContent}
        </div>
      );
    });
  };

  render() {
    let { isOpenModal, closeSummaryModal, dataModal } = this.props;
    let { summary, isLoading, history } = this.state;

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
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        <Modal.Body style={{ position: "relative" }}>
          {isLoading && (
            <div
              className="loading-overlay"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(255, 255, 255, 0.75)",
                zIndex: 10,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ClipLoader color="#0071ba" size={45} />
              <div className="mt-2 text-primary font-weight-bold">
                AI đang phân tích và tóm tắt...
              </div>
            </div>
          )}

          <div className="mb-3 d-flex justify-content-between align-items-center">
            <div>
              <span>Bệnh nhân: </span>
              <strong className="text-primary" style={{ fontSize: "16px" }}>
                {dataModal?.patientName || "N/A"}
              </strong>
              {history && history.length > 0 && (
                <span className="text-muted ms-2" style={{ fontSize: "13px" }}>
                  ({history.length} lần khám trước)
                </span>
              )}
            </div>
            {summary && !isLoading && (
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={this.handleCopyToClipboard}
                title="Sao chép nội dung tóm tắt"
              >
                Sao chép
              </button>
            )}
          </div>

          <div className="summary-box">
            {summary ? (
              <div className="ai-summary-text">{this.renderFormattedSummary(summary)}</div>
            ) : !isLoading ? (
              <div className="text-muted font-italic">Đang chuẩn bị dữ liệu...</div>
            ) : null}
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
