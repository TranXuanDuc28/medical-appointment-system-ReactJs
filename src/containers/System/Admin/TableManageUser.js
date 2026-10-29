import React, { Component } from "react";
import { connect } from "react-redux";
import * as action from "../../../store/actions";
import { FormattedMessage } from "react-intl";
import { LANGUAGE } from "../../../utils";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
import moment from "moment";
import "./TableManageUser.scss";

class TableManageUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      listUser: [],
      searchTerm: "",
      filterRole: "ALL",
      filterGender: "ALL",
      currentPage: 1,
      pageSize: 5,
      previewAvatarUrl: "",
      isOpenLightbox: false,
    };
  }

  componentDidMount() {
    this.props.getAllUser();
    if (this.props.listUserRedux) {
      this.setState({
        listUser: this.props.listUserRedux,
      });
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.listUserRedux !== this.props.listUserRedux) {
      this.setState({
        listUser: this.props.listUserRedux,
      });
    }
  }

  handleDeleteUsers = (item) => {
    let { language } = this.props;
    let name =
      `${item.firstName || ""} ${item.lastName || ""}`.trim() || item.email;
    let confirmMsg =
      language === LANGUAGE.VI
        ? `Bạn có chắc chắn muốn xóa người dùng "${name}" không?`
        : `Are you sure you want to delete user "${name}"?`;
    if (window.confirm(confirmMsg)) {
      this.props.deleteUser(item.id);
    }
  };

  handleEditUsers = (user) => {
    this.props.handleEditUsersFromParentKey(user);
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  decodeImage = (image) => {
    if (!image) return "";
    if (typeof image === "string") return image;
    if (image.data) {
      try {
        return new TextDecoder("utf-8").decode(new Uint8Array(image.data));
      } catch (e) {
        return "";
      }
    }
    return "";
  };

  getLabel = (list, keyMap) => {
    if (!list || list.length === 0 || !keyMap) return keyMap || "—";
    let item = list.find((x) => x.keyMap === keyMap);
    if (!item) return keyMap;
    return this.props.language === LANGUAGE.VI ? item.valueVi : item.valueEn;
  };

  getRoleBadgeClass = (roleId) => {
    switch (roleId) {
      case "R1":
        return "badge-role-admin";
      case "R2":
        return "badge-role-doctor";
      case "R3":
        return "badge-role-patient";
      case "R4":
        return "badge-role-cashier";
      default:
        return "badge-role-default";
    }
  };

  getFilteredList = () => {
    let { listUser, searchTerm, filterRole, filterGender } = this.state;
    if (!listUser || listUser.length === 0) return [];

    return listUser.filter((item) => {
      if (filterRole !== "ALL" && item.roleId !== filterRole) {
        return false;
      }
      if (filterGender !== "ALL" && item.gender !== filterGender) {
        return false;
      }
      if (searchTerm.trim()) {
        let q = searchTerm.toLowerCase().trim();
        let fullName = `${item.firstName || ""} ${item.lastName || ""}`.toLowerCase();
        let email = (item.email || "").toLowerCase();
        let phone = (item.phoneNumber || "").toLowerCase();
        let address = (item.address || "").toLowerCase();
        return (
          fullName.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          address.includes(q)
        );
      }
      return true;
    });
  };

  handleChangePage = (newPage, totalPages) => {
    if (newPage >= 1 && newPage <= totalPages) {
      this.setState({ currentPage: newPage });
    }
  };

  renderPagination = (totalPages, currentPage) => {
    let { language } = this.props;
    let isVi = language === LANGUAGE.VI;
    let pages = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="table-pagination-container d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
        <div className="pagination-info text-muted small">
          <FormattedMessage id="manage-user.page" />{" "}
          <strong>{currentPage}</strong> / <strong>{totalPages}</strong>
        </div>

        <ul className="pagination pagination-sm mb-0">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => this.handleChangePage(1, totalPages)}
              title={isVi ? "Trang đầu" : "First page"}
            >
              <i className="fas fa-angle-double-left"></i>
            </button>
          </li>
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => this.handleChangePage(currentPage - 1, totalPages)}
              title={isVi ? "Trang trước" : "Previous page"}
            >
              <i className="fas fa-angle-left"></i>
            </button>
          </li>

          {pages.map((p) => (
            <li
              key={p}
              className={`page-item ${p === currentPage ? "active" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => this.handleChangePage(p, totalPages)}
              >
                {p}
              </button>
            </li>
          ))}

          <li
            className={`page-item ${
              currentPage === totalPages ? "disabled" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() => this.handleChangePage(currentPage + 1, totalPages)}
              title={isVi ? "Trang sau" : "Next page"}
            >
              <i className="fas fa-angle-right"></i>
            </button>
          </li>
          <li
            className={`page-item ${
              currentPage === totalPages ? "disabled" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() => this.handleChangePage(totalPages, totalPages)}
              title={isVi ? "Trang cuối" : "Last page"}
            >
              <i className="fas fa-angle-double-right"></i>
            </button>
          </li>
        </ul>
      </div>
    );
  };

  render() {
    let {
      searchTerm,
      filterRole,
      filterGender,
      currentPage,
      pageSize,
      isOpenLightbox,
      previewAvatarUrl,
    } = this.state;

    let roles = this.props.roleRedux || [];
    let genders = this.props.genderRedux || [];
    let positions = this.props.positionRedux || [];
    let language = this.props.language;

    let filteredUsers = this.getFilteredList();
    let totalUsers = filteredUsers.length;
    let totalPages = Math.ceil(totalUsers / pageSize) || 1;
    let validPage = Math.min(Math.max(currentPage, 1), totalPages);
    let startIndex = (validPage - 1) * pageSize;
    let displayedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

    return (
      <div className="table-manage-user-wrapper mt-4">
        <div className="table-header-toolbar card border-0 shadow-sm mb-3">
          <div className="card-body p-3">
            <div className="row g-2 align-items-center">
              <div className="col-md-5">
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="fas fa-search text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder={
                      language === LANGUAGE.VI
                        ? "Tìm theo họ tên, email, SĐT, địa chỉ..."
                        : "Search by name, email, phone, address..."
                    }
                    value={searchTerm}
                    onChange={(e) =>
                      this.setState({
                        searchTerm: e.target.value,
                        currentPage: 1,
                      })
                    }
                  />
                  {searchTerm && (
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() =>
                        this.setState({ searchTerm: "", currentPage: 1 })
                      }
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
              </div>

              <div className="col-md-3">
                <select
                  className="form-select form-select-sm"
                  value={filterRole}
                  onChange={(e) =>
                    this.setState({
                      filterRole: e.target.value,
                      currentPage: 1,
                    })
                  }
                >
                  <option value="ALL">
                    {language === LANGUAGE.VI ? "Tất cả vai trò" : "All roles"}
                  </option>
                  {roles.map((r, idx) => (
                    <option key={idx} value={r.keyMap}>
                      {language === LANGUAGE.VI ? r.valueVi : r.valueEn}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-2">
                <select
                  className="form-select form-select-sm"
                  value={filterGender}
                  onChange={(e) =>
                    this.setState({
                      filterGender: e.target.value,
                      currentPage: 1,
                    })
                  }
                >
                  <option value="ALL">
                    {language === LANGUAGE.VI ? "Tất cả giới tính" : "All genders"}
                  </option>
                  {genders.map((g, idx) => (
                    <option key={idx} value={g.keyMap}>
                      {language === LANGUAGE.VI ? g.valueVi : g.valueEn}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-2 text-md-end">
                <div className="d-flex align-items-center justify-content-md-end gap-1">
                  <span className="small text-muted text-nowrap">
                    <FormattedMessage id="manage-user.per-page" />
                  </span>
                  <select
                    className="form-select form-select-sm w-auto"
                    value={pageSize}
                    onChange={(e) =>
                      this.setState({
                        pageSize: Number(e.target.value),
                        currentPage: 1,
                      })
                    }
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="table-responsive card border-0 shadow-sm rounded-3">
          <table id="tableManageUser" className="table align-middle mb-0">
            <thead>
              <tr>
                <th style={{ width: "45px" }} className="text-center">#</th>
                <th style={{ width: "60px" }} className="text-center">
                  <FormattedMessage id="manage-user.image" />
                </th>
                <th>Email</th>
                <th>
                  <FormattedMessage id="manage-user.last-name" />
                </th>
                <th>
                  <FormattedMessage id="manage-user.first-name" />
                </th>
                <th>
                  <FormattedMessage id="manage-user.address" />
                </th>
                <th>
                  <FormattedMessage id="manage-user.phone-number" />
                </th>
                <th>
                  <FormattedMessage id="manage-user.gender" />
                </th>
                <th>
                  <FormattedMessage id="manage-user.position" />
                </th>
                <th>
                  <FormattedMessage id="manage-user.role" />
                </th>
                <th className="text-nowrap text-center">
                  <FormattedMessage id="manage-user.created-at" />
                </th>
                <th className="text-nowrap text-center">
                  <FormattedMessage id="manage-user.updated-at" />
                </th>
                <th style={{ width: "110px" }} className="text-center">
                  <FormattedMessage id="manage-user.action" />
                </th>
              </tr>
            </thead>
            <tbody>
              {displayedUsers && displayedUsers.length > 0 ? (
                displayedUsers.map((item, index) => {
                  let avatarUrl = this.decodeImage(item.image);
                  let roleName = this.getLabel(roles, item.roleId);
                  let posName =
                    item.roleId === "R2" && item.positionId
                      ? this.getLabel(positions, item.positionId)
                      : "—";
                  let genderName = this.getLabel(genders, item.gender);
                  let roleClass = this.getRoleBadgeClass(item.roleId);

                  return (
                    <tr key={item.id || index}>
                      <td className="text-center text-muted small">
                        {startIndex + index + 1}
                      </td>
                      <td className="text-center">
                        {avatarUrl ? (
                          <div
                            className="user-avatar-circle"
                            style={{ backgroundImage: `url(${avatarUrl})` }}
                            onClick={() =>
                              this.setState({
                                previewAvatarUrl: avatarUrl,
                                isOpenLightbox: true,
                              })
                            }
                            title={
                              language === LANGUAGE.VI
                                ? "Bấm để xem ảnh phóng to"
                                : "Click to enlarge photo"
                            }
                          ></div>
                        ) : (
                          <div className="user-avatar-circle placeholder-avatar">
                            <i className="fas fa-user"></i>
                          </div>
                        )}
                      </td>
                      <td className="fw-medium text-dark">{item.email}</td>
                      <td>{item.firstName}</td>
                      <td>{item.lastName}</td>
                      <td
                        className="text-truncate"
                        style={{ maxWidth: "160px" }}
                        title={item.address}
                      >
                        {item.address || "—"}
                      </td>
                      <td>{item.phoneNumber || "—"}</td>
                      <td>
                        <span
                          className={`badge ${item.gender === "M"
                              ? "bg-info text-dark"
                              : item.gender === "F"
                                ? "bg-danger-subtle text-danger"
                                : "bg-light text-dark"
                            }`}
                        >
                          {genderName}
                        </span>
                      </td>
                      <td>
                        {posName && posName !== "—" && posName !== "None" ? (
                          <span className="badge bg-secondary-subtle text-secondary">
                            {posName}
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${roleClass}`}>
                          {roleName}
                        </span>
                      </td>
                      <td className="text-nowrap small text-muted text-center" title={item.createdAt}>
                        {item.createdAt
                          ? moment(item.createdAt).format("DD/MM/YYYY HH:mm")
                          : "—"}
                      </td>
                      <td className="text-nowrap small text-muted text-center" title={item.updatedAt}>
                        {item.updatedAt
                          ? moment(item.updatedAt).format("DD/MM/YYYY HH:mm")
                          : "—"}
                      </td>
                      <td className="text-center">
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={() => this.handleEditUsers(item)}
                            title={
                              language === LANGUAGE.VI
                                ? "Sửa thông tin"
                                : "Edit user"
                            }
                          >
                            <i className="fas fa-pencil-alt"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => this.handleDeleteUsers(item)}
                            title={
                              language === LANGUAGE.VI
                                ? "Xóa người dùng"
                                : "Delete user"
                            }
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="13" className="text-center py-4 text-muted">
                    <i className="fas fa-search me-2"></i>
                    <FormattedMessage id="manage-user.no-users-found" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalUsers > 0 && this.renderPagination(totalPages, validPage)}

        {isOpenLightbox && (
          <Lightbox
            mainSrc={previewAvatarUrl}
            onCloseRequest={() =>
              this.setState({
                isOpenLightbox: false,
                previewAvatarUrl: "",
              })
            }
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    listUserRedux: state.admin.listUser,
    genderRedux: state.admin.genders,
    roleRedux: state.admin.roles,
    positionRedux: state.admin.positions,
    language: state.app.language,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getAllUser: () => dispatch(action.getAllUser()),
    deleteUser: (idInput) => dispatch(action.deleteUser(idInput)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TableManageUser);
