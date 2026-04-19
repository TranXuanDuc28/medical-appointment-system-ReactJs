import React, { Component } from "react";
import { connect } from "react-redux";
import * as action from "../../../store/actions";
import MarkdownIt from "markdown-it";
import MdEditor from "react-markdown-editor-lite";
import { FormattedMessage } from "react-intl";
// import style manually
import "react-markdown-editor-lite/lib/index.css";

// Register plugins if required
// MdEditor.use(YOUR_PLUGINS_HERE);

// Initialize a markdown parser
const mdParser = new MarkdownIt(/* Markdown-it options */);

// Finish!
function handleEditorChange({ html, text }) {
  console.log("handleEditorChange", html, text);
}
class TableManageUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      listUser: [],
    };
  }

  componentDidMount() {
    this.props.getAllUser();
    console.log(this.props);
    this.setState({
      listUser: this.props.listUserRedux,
    });
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.listUserRedux !== this.props.listUserRedux) {
      // console.log("2",this.props.genderRedux)
      let arrListUser = this.props.listUserRedux;
      this.setState({
        listUser: arrListUser,
      });
    }
  }
  handleDeleteUsers = (item) => {
    this.props.deleteUser(item.id);
  };
  handleEditUsers = (user) => {
    this.props.handleEditUsersFromParentKey(user);
  };
  render() {
    let arrUsers = this.state.listUser;
    // console.log(arrUsers)
    return (
      <React.Fragment>
        <table id="tableManageUser">
          <tbody>
            <tr>
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
              <th>
                <FormattedMessage id="manage-user.action" />
              </th>
            </tr>

            {arrUsers &&
              arrUsers.map((item, index) => {
                return (
                  <tr key={index}>
                    <td>{item.email}</td>
                    <td>{item.firstName}</td>
                    <td>{item.lastName}</td>
                    <td>{item.address}</td>
                    <td>{item.phoneNumber}</td>
                    <td>{item.gender}</td>
                    <td>{item.positionId}</td>
                    <td>{item.roleId}</td>
                    <td>
                      <a
                        type="button"
                        className="btn btn-primary mx-3 px-3"
                        onClick={() => {
                          this.handleEditUsers(item);
                        }}
                      >
                        Sửa
                      </a>
                      <a
                        type="button"
                        className="btn btn-danger px-3"
                        onClick={() => {
                          this.handleDeleteUsers(item);
                        }}
                      >
                        Xóa
                      </a>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    listUserRedux: state.admin.listUser,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getAllUser: () => dispatch(action.getAllUser()),
    deleteUser: (idInput) => dispatch(action.deleteUser(idInput)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TableManageUser);
