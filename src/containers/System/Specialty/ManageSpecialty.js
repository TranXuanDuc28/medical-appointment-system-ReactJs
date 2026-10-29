import React, { Component } from "react";
import { connect } from "react-redux";
import "./ManageSpecialty.scss";
import MarkdownIt from "markdown-it";
import MdEditor from "react-markdown-editor-lite";
import { CommonUtils, LANGUAGE } from "../../../utils";
import {
  createNewSpecialty,
  getAllDetailSpecialtyById,
  getAllSpecialty,
} from "../../../services/userServices";
import { toast } from "react-toastify";
import { CRUD_ACTION } from "../../../utils";
import Lightbox from "react-image-lightbox";
import Select from "react-select";

const mdParser = new MarkdownIt();

class ManageSpecialty extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      description: "",
      imageBase64: "",
      contentHTML: "",
      contentMarkdown: "",
      isSubmitting: false,
      previewImageUrl: "",
      isOpen: false,
      lang: "",
      hasOldData: false,
      arrAllSpecialty: [],
    };
  }
  async componentDidMount() {
    await this.getAllSpecialty();
  }

  async componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.language !== prevProps.language) {
      this.resetForm();
      await this.getAllSpecialty();
    }
  }
  getAllSpecialty = async () => {
    let res = await getAllSpecialty({ lang: "vi" });
    if (res && res.errCode === 0) {
      console.log("check res", res);
      let dataSelect = this.buildDataInputSelect(res.data, "SPECIALTYS");

      this.setState({
        arrAllSpecialty: dataSelect,
      });
    }
  };
  buildDataInputSelect = (inputData, type) => {
    let result = [];
    let language = this.props.language;
    if (inputData && inputData.length > 0) {
      if (type === "SPECIALTYS") {
        inputData.map((item, index) => {
          let object = {};
          let labelEn = `${item.name}`;
          let labelVi = `${item.name}`;
          object.value = item.id;
          object.label = language === LANGUAGE.VI ? labelVi : labelEn;
          result.push(object);
        });
      }
    }
    return result;
  };
  handleOnchangeInput = (event, id) => {
    let stateCopy = { ...this.state };
    stateCopy[id] = event.target.value;
    this.setState({
      ...stateCopy,
    });
  };

  handleEditorChange = ({ html, text }) => {
    this.setState({
      contentHTML: html,
      contentMarkdown: text,
    });
  };

  handleOnchangeImage = async (event) => {
    let data = event.target.files;
    let file = data[0];
    if (file) {
      let base64 = await CommonUtils.getBase64(file);
      this.setState({
        imageBase64: base64,
        previewImageUrl: URL.createObjectURL(file),
      });
    }
  };
  openPreviewImage = () => {
    if (!this.state.previewImageUrl) return;
    this.setState({
      isOpen: true,
    });
  };
  validateForm = () => {
    const { name, contentMarkdown } = this.state;
    // if (!name.trim()) {
    //   toast.error("Vui lòng nhập tên chuyên khoa");
    //   return false;
    // }
    if (!contentMarkdown) {
      toast.error("Vui lòng nhập mô tả chuyên khoa");
      return false;
    }
    return true;
  };

  handleSaveNewSpecialty = async () => {
    if (!this.validateForm()) return;
    this.setState({ isSubmitting: true });
    let { hasOldData } = this.state;
    console.log("specialtyData?");
    try {
      const specialtyData = {
        specialtyId: this.state.selectedOption?.value,
        name: this.state.name,
        description: this.state.description,
        imageBase64: this.state.imageBase64,
        contentHTML: this.state.contentHTML,
        contentMarkdown: this.state.contentMarkdown,
        action: hasOldData === true ? CRUD_ACTION.UPDATE : CRUD_ACTION.CREATE,
        lang: this.props.language,
      };
      console.log("specialtyData", specialtyData);
      let res = await createNewSpecialty(specialtyData);
      console.log("check res specialty", res);
      if (res && res.errCode === 0) {
        toast.success("Thêm chuyên khoa mới thành công!");
        this.resetForm();
      } else {
        toast.error(res?.errMessage || "Có lỗi xảy ra khi thêm chuyên khoa");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi thêm phòng khám");
    } finally {
      this.setState({ isSubmitting: false });
    }
  };
  resetForm = () => {
    this.setState({
      name: "",
      description: "",
      imageBase64: "",
      contentHTML: "",
      contentMarkdown: "",
      selectedOption: null, // reset option
      previewImageUrl: "", // reset ảnh
      hasOldData: false, // reset về trạng thái thêm mới
    });

    // Nếu muốn xoá cả file input (tên file ảnh hiển thị), bạn cần clear thủ công:
    if (this.fileInputRef) {
      this.fileInputRef.value = ""; // reset tên file chọn
    }
  };
  handleChangeSelect = async (selectedOption) => {
    this.setState({ selectedOption });
    if (selectedOption) {
      console.log("selectedOption", selectedOption);
      let id = selectedOption.value;
      let res = await getAllDetailSpecialtyById({
        id,
        lang: this.props.language,
      });
      console.log("check res ...", res);
      if (res && res.errCode === 0 && res.data) {
        this.setState({
          name: res.data.specialtyData[0].name,
          description: res.data.specialtyMarkdown?.[0]?.description || "",
          imageBase64: res.data.image,
          contentHTML: res.data.specialtyMarkdown[0].contentHTML,
          contentMarkdown: res.data.specialtyMarkdown[0].contentMarkdown,
          previewImageUrl: res.data.image,
          hasOldData: true,
        });
        console.log("check data", res.data.specialtyMarkdown);
      } else {
        // Nếu không có dữ liệu, reset form về trạng thái tạo mới
        this.setState({
          name: "",
          imageBase64: "",
          contentHTML: "",
          contentMarkdown: "",
          hasOldData: false,
          previewImageUrl: "",
        });
      }
    }
  };
  render() {
    const { hasOldData, isSubmitting } = this.state;
    return (
      <div className="manage-specialty-container">
        <div className="container-fluid py-4">
          <div className="text-center mb-4">
            <h3 className="ms-title fw-bold">Quản lý chuyên khoa</h3>
            <p className="text-muted">Thêm chuyên khoa mới vào hệ thống</p>
          </div>
          <div className="row justify-content-center">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-body">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      this.handleSaveNewSpecialty();
                    }}
                  >
                    <div className="row mb-3">
                      <div className="col-md-6 mb-3 mb-md-0">
                        <label className="form-label fw-bold">
                          <i className="fas fa-stethoscope me-2"></i>
                          Tên chuyên khoa <span className="text-danger">*</span>
                        </label>
                        {/* Select specialty có sẵn */}
                        <Select
                          value={this.state.selectedOption}
                          onChange={this.handleChangeSelect}
                          options={this.state.arrAllSpecialty}
                          placeholder="Chọn chuyên khoa có sẵn..."
                        />
                        <input
                          className="form-control mt-2"
                          type="text"
                          placeholder="Nhập tên chuyên khoa..."
                          value={this.state.name}
                          onChange={(event) =>
                            this.handleOnchangeInput(event, "name")
                          }
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">
                          <i className="fas fa-image me-2"></i>
                          Ảnh chuyên khoa
                        </label>
                        <input
                          className="form-control"
                          type="file"
                          accept="image/*"
                          ref={(ref) => (this.fileInputRef = ref)}
                          onChange={this.handleOnchangeImage}
                        />
                        <small className="form-text text-muted">
                          Chọn ảnh đại diện cho chuyên khoa (JPG, PNG, GIF)
                        </small>
                        {this.state.imageBase64 && (
                          <div
                            className="previewImage"
                            style={{
                              backgroundImage: `url(${this.state.previewImageUrl})`,
                            }}
                            onClick={() => {
                              this.openPreviewImage();
                            }}
                          ></div>
                        )}
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        <i className="fas fa-info-circle me-2"></i>
                        Mô tả ngắn chuyên khoa (hiển thị trên thẻ card)
                      </label>
                      <textarea
                        className="form-control"
                        rows="2"
                        placeholder="Nhập mô tả ngắn gọn về bệnh lý điều trị của chuyên khoa..."
                        value={this.state.description}
                        onChange={(event) =>
                          this.handleOnchangeInput(event, "description")
                        }
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        <i className="fas fa-edit me-2"></i>
                        Mô tả chuyên khoa <span className="text-danger">*</span>
                      </label>
                      <MdEditor
                        style={{ height: "300px" }}
                        renderHTML={(text) => mdParser.render(text)}
                        onChange={this.handleEditorChange}
                        value={this.state.contentMarkdown}
                        placeholder="Nhập mô tả chuyên khoa..."
                      />
                      <small className="form-text text-muted">
                        Sử dụng Markdown để định dạng nội dung.
                      </small>
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                      <button
                        type="button"
                        className="btn btn-secondary "
                        onClick={this.resetForm}
                        disabled={isSubmitting}
                      >
                        <i className="fas fa-undo me-2"></i>
                        Làm mới
                      </button>
                      <button
                        type="submit"
                        className="btn-save-specialty"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Đang lưu...
                          </>
                        ) : hasOldData ? (
                          <>
                            <i className="fas fa-edit me-2"></i>
                            Cập nhật chuyên khoa
                          </>
                        ) : (
                          <>
                            <i className="fas fa-save me-2"></i>
                            Lưu chuyên khoa
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        {this.state.isOpen === true && (
          <Lightbox
            mainSrc={this.state.previewImageUrl}
            onCloseRequest={() =>
              this.setState({
                isOpen: false,
              })
            }
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  language: state.app.language,
});

export default connect(mapStateToProps)(ManageSpecialty);
