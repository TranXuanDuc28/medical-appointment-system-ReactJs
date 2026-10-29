import { useEffect, useRef } from "react";
import axios from "axios";
import { getSocket } from "../socket";
import { useDispatch, useSelector } from "react-redux";
import {
  setChatMessages,
  addChatMessage,
  deleteChatMessage,
  setChatLoading,
} from "../store/actions/chatActions";

const PATH = process.env.REACT_APP_BACKEND_URL;

export default function useChatMessages({ user, receiver }) {
  const socketRef = useRef();
  const dispatch = useDispatch();
  const messages = useSelector((state) => state.chat.messages);
  const isLoading = useSelector((state) => state.chat.isLoading);

  // Kết nối socket (singleton)
  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;
    if (!socket.connected) socket.connect();
    return () => {
      // KHÔNG disconnect ở đây, chỉ disconnect khi logout toàn app
    };
  }, []);

  // Lắng nghe tin nhắn mới, chỉ gán listener 1 lần khi user login
  useEffect(() => {
    const socket = socketRef.current;
    const handleReceivedMsg = (data) => {
      const msg = data.data ? data.data : data;
      // Kiểm tra nếu tin nhắn liên quan đến receiver hiện tại thì mới add
      // (1) Nếu mình là sender hoặc receiver
      // (2) Hoặc receiver là null (chưa chọn ai)
      if (
        (receiver &&
          ((msg.sender?.id === user.id && msg.receiver?.id === receiver.id) ||
            (msg.sender?.id === receiver.id &&
              msg.receiver?.id === user.id))) ||
        !receiver
      ) {
        dispatch(addChatMessage(msg));
      }
    };
    const handleDeletedMsg = (data) => {
      console.log("Nhận được DELETED_MSG:", data);
      dispatch(deleteChatMessage(data.msgId));
    };
    const setupListeners = () => {
      console.log("Socket connected:", socket.id);
      // Clear listener cũ trước khi gán mới
      socket.off("RECEIVED_MSG").on("RECEIVED_MSG", handleReceivedMsg);
      socket.off("DELETED_MSG").on("DELETED_MSG", handleDeletedMsg);
    };

    const handleConnect = () => {
      if (user) setupListeners();
    };

    if (socket.connected && user) {
      setupListeners();
    } else {
      socket.on("connect", handleConnect);
    }
    // Cleanup khi unmount
    return () => {
      if (socket) {
        socket.off("connect", handleConnect);
        socket.off("RECEIVED_MSG");
        socket.off("DELETED_MSG");
      }
    };
    // eslint-disable-next-line
  }, [user, receiver, dispatch]); // Thêm receiver vào dependency

  // Lắng nghe sự kiện tin nhắn bị xóa
  // useEffect(() => {
  //   const socket = socketRef.current;
  //   console.log("Kết nối socket để lắng nghe DELETED_MSG", socket.id);
  //   if (socket && socket.connected) {
  //     const handleDeletedMsg = (data) => {
  //       console.log("Nhận được DELETED_MSG:", data);
  //       // Nếu dùng Redux:
  //       dispatch(deleteChatMessage(data.msgId));
  //       // Nếu dùng state cục bộ:
  //       // setAllMsg((prev) => prev.filter((item) => item.id !== data.msgId));
  //     };
  //     socket.on("DELETED_MSG", (data) => {
  //       console.log("Doctor nhận được DELETED_MSG:", data); // Thêm dòng này
  //       handleDeletedMsg(data);
  //     });

  //     return () => {
  //       socket.off("DELETED_MSG", handleDeletedMsg);
  //     };
  //   }
  // }, [dispatch]);

  // Load tin nhắn khi receiver/user thay đổi
  useEffect(() => {
    if (receiver && user) {
      loadMessages(receiver.id);
    } else {
      dispatch(setChatMessages([]));
    }
    // eslint-disable-next-line
  }, [receiver, user, dispatch]);

  const loadMessages = (receiverId, offsetVal = 0) => {
    if (!user) return;
    dispatch(setChatLoading(true));
    axios
      .get(
        `${PATH}/api/get-msg/${receiverId}?userId=${user.id}&offset=${offsetVal}`
      )
      .then((res) => {
        if (offsetVal > 0) {
          // prepend messages
          dispatch(setChatMessages([...res.data.data, ...messages]));
        } else {
          dispatch(setChatMessages(res.data.data || []));
        }
      })
      .catch(() => {})
      .finally(() => dispatch(setChatLoading(false)));
  };

  // Gửi tin nhắn: đã tách ra hook riêng
  const handleDeleteMessage = (msgId) => {
    dispatch(deleteChatMessage(msgId));
    // Emit socket để các client khác cũng xóa
    const socket = socketRef.current;
    if (socket?.connected) {
      socket.emit("DELETE_MSG", {
        msgId,
        receiverId: receiver?.id,
        userId: user?.id,
      });
    }
  };

  const loadMore = () => {
    if (!receiver) return;
    const offset = messages.length;
    loadMessages(receiver.id, offset);
  };

  return {
    messages,
    isLoading,
    // sendMessage: đã tách ra hook riêng
    deleteMessage: handleDeleteMessage,
    loadMore,
    setMessages: (msgs) => dispatch(setChatMessages(msgs)),
  };
}
