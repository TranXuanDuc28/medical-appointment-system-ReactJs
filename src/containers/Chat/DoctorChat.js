import { useEffect, useRef, useState } from "react";
import SideBar from "./sidebar";
import ChatBox from "./mainchat";
import Profile from "./profile";
import { useHistory } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";
import { useSelector } from "react-redux";
const PATH = process.env.REACT_APP_BACKEND_URL;
const DoctorChat = () => {
  const socketRef = useRef();
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  //console.log("onlineUsers", onlineUsers);
  const [roomData, setRoomData] = useState({
    room: null,
    receiver: null,
  });
  const [allMsg, setAllMsg] = useState([]);
  const history = useHistory();
  const user = useSelector((state) => state.user.userInfo);

  //console.log("user from redux:", user);

  useEffect(() => {
    const socket = io.connect(PATH);
    socketRef.current = socket;
    socket.on("connect", () => setIsConnected(true));
    socket.off("disconnect", () => setIsConnected(false));
  }, [user]);

  useEffect(() => {
    if (isConnected && user) {
      socketRef.current.emit("ADD_USER", user);
      //console.log("Doctor emit ADD_USER:", user); // Thêm dòng này
      socketRef.current.on("USER_ADDED", (data) => {
        setOnlineUsers(data);
      });
      socketRef.current.on("RECEIVED_MSG", (data) => {
        //console.log("Doctor nhận được RECEIVED_MSG:", data); // Thêm dòng này
        const msg = data.data ? data.data : data;
        setAllMsg((prevState) => [...prevState, msg]);
      });
      socketRef.current.on("DELETED_MSG", (data) => {
        console.log("Doctor nhận được DELETED_MSG:", data); // Thêm dòng này
        setAllMsg((prevState) =>
          prevState.filter((item) => item.id != data.msgId)
        );
      });

      return () => socketRef.current.disconnect();
    }
  }, [isConnected, user]);
  const handleSendMsg = (msg, fileMeta) => {
    if (socketRef.current.connected) {
      let sender = { ...user };
      sender.socketId = socketRef.current.id;
      const data = {
        msg,
        receiver: roomData.receiver,
        sender,
        ...fileMeta,
      };
      //console.log("data msg", data);
      socketRef.current.emit("SEND_MSG", data);
    }
  };

  const handleDelete = (msgId) => {
    //console.log("data haha", data);
    socketRef.current.emit("DELETE_MSG", {
      msgId,
      receiverId: roomData.receiver?.id,
      userId: user?.id,
    });
    setAllMsg((prevState) => prevState.filter((data) => data.id != msgId));
  };

  const loadMoreMsg = () => {
    if (!roomData.receiver) return;
    const receiverId = roomData.receiver.id;
    const currentUserId = user.id;

    axios
      .get(
        `${PATH}/api/get-msg/${receiverId}?userId=${currentUserId}&offset=${allMsg.length}`
      )
      .then((res) => {
        // Nối tin nhắn cũ vào đầu mảng
        setAllMsg((prev) => [...res.data.data, ...prev]);
      })

      .catch((err) => {
        console.log(err);
      });
  };

  if (!user) return null;

  return (
    <div className="container-fluid mt-2" style={{ height: "93vh" }}>
      <div className="row h-100">
        <div
          className="col-3 h-100 p-0"
          style={{ borderRight: "1px solid #eee", overflow: "auto" }}
        >
          <SideBar
            user={user}
            onlineUsers={onlineUsers}
            roomData={roomData}
            setRoomData={setRoomData}
            setAllMsg={setAllMsg}
          />
        </div>
        <div className="col-6 h-100 p-0 d-flex flex-column">
          <ChatBox
            roomData={roomData}
            handleSendMsg={handleSendMsg}
            allMsg={allMsg}
            user={user}
            handleDelete={handleDelete}
            loadMoreMsg={loadMoreMsg}
          />
        </div>
        <div
          className="col-3 h-100 p-0"
          style={{ borderLeft: "1px solid #eee", overflow: "auto" }}
        >
          <Profile user={user} />
        </div>
      </div>
    </div>
  );
};
export default DoctorChat;
