import { Fragment, useState, useEffect } from "react";
import axios from "axios";
import "./index.scss";

const SideBar = ({ user, onlineUsers, roomData, setRoomData, setAllMsg }) => {
  const [value, setValue] = useState(0);
  const PATH = process.env.REACT_APP_BACKEND_URL;
  const handleChange = (tabIdx) => {
    setValue(tabIdx);
  };
  const handleChatRoom = (selectedUser) => {
    setRoomData({
      ...roomData,
      room: "test",
      receiver: selectedUser,
    });
    const receiverId = selectedUser.id;
    const currentUserId = user.id;
    axios
      .get(`${PATH}/api/get-msg/${receiverId}?userId=${currentUserId}`)
      .then((res) => {
        console.log("res aa", res);
        setAllMsg(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    axios
      .get(`${PATH}/api/get_all_users?id=${"ALL"}`)
      .then((res) => setAllUsers(res.data.users))
      .catch((err) => console.log(err));
  }, []);
  return (
    <div className="h-100 d-flex flex-column bg-light-custom">
      {/* Header */}
      {/* <div className="card rounded-0 border-0 mb-2">
        <div className="card-body py-2 px-3 d-flex align-items-center">
          <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center mr-2" style={{width: 40, height: 40, fontSize: 20}}>
            {user.firstName?.charAt(0) || 'U'}
          </div>
          <div className="ml-2">
            <div className="font-weight-bold">{user.firstName + " " + user.lastName}</div>
            <div className="text-muted" style={{fontSize: 12}}>{user.email}</div>
          </div>
        </div>
      </div> */}
      {/* Tabs */}
      <ul
        className="nav nav-tabs nav-fill"
        role="tablist"
        style={{ height: "54px" }}
      >
        <li className="nav-item" role="presentation">
          <a
            className={`nav-link ${value === 0 ? "active" : ""}`}
            onClick={() => handleChange(0)}
            role="tab"
            style={{
              height: "54px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            CHAT LIST
          </a>
        </li>
        <li className="nav-item" role="presentation">
          <a
            className={`nav-link ${value === 1 ? "active" : ""}`}
            onClick={() => handleChange(1)}
            role="tab"
            style={{
              height: "54px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            USER LIST
          </a>
        </li>
      </ul>
      {/* List */}
      <div className="flex-grow-1 overflow-auto">
        {value === 0 && (
          <ul className="list-group list-group-flush">
            {onlineUsers
              .filter((ele) => ele.id !== user.id)
              .map((item) => (
                <li
                  className="list-group-item list-group-item-action d-flex align-items-center"
                  key={item.id}
                  onClick={() => handleChatRoom(item)}
                  style={{ cursor: "pointer" }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: 40,
                      height: 40,
                      marginRight: 16,
                    }}
                  >
                    <div
                      className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center"
                      style={{ width: 40, height: 40, fontSize: 20 }}
                    >
                      {item.firstName?.charAt(0) || "U"}
                    </div>
                    {/* Chấm xanh online */}
                    {onlineUsers.some((u) => u.id === item.id) && (
                      <span
                        className="online-dot"
                        style={{
                          position: "absolute",
                          bottom: 2,
                          right: 1,
                          width: 11,
                          height: 11,
                          background: "#4caf50",
                          borderRadius: "50%",
                          border: "2px solid #fff",
                          boxShadow: "0 0 4px #4caf50",
                        }}
                      ></span>
                    )}
                  </div>
                  <div>
                    <div className="font-weight-bold">
                      {item.firstName + " " + item.lastName}
                    </div>
                    <div className="text-muted" style={{ fontSize: 12 }}>
                      {item.email}
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        )}
        {value === 1 && (
          <ul className="list-group list-group-flush">
            {allUsers
              .filter((ele) => ele.id !== user.id)
              .map((item) => (
                <li
                  className="list-group-item list-group-item-action d-flex align-items-center"
                  key={item.id}
                  onClick={() =>
                    handleChatRoom({
                      id: item.id,
                      name: item.firstName + " " + item.lastName,
                      email: item.email,
                    })
                  }
                  style={{ cursor: "pointer" }}
                >
                  <div
                    className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center mr-3"
                    style={{ width: 40, height: 40, fontSize: 20 }}
                  >
                    {item.firstName?.charAt(0) || "U"}
                  </div>
                  <div>
                    <div className="font-weight-bold">
                      {item.firstName + " " + item.lastName}
                    </div>
                    <div className="text-muted" style={{ fontSize: 12 }}>
                      {item.email}
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SideBar;
