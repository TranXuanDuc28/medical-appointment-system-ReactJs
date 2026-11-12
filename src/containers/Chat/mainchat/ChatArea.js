import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import "../sidebar/index.scss";
const ChatArea = ({ allMsg, user, handleDelete, loadMoreMsg }) => {
  const chatContainerRef = useRef(null);
  const [previewImg, setPreviewImg] = useState(null);
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [allMsg]);
  return (
    <div ref={chatContainerRef} className="flex-grow-1 overflow-auto bg-light"
      style={{ minHeight: 0 }}
    >
      {/* <div className="sticky-top bg-light pb-2" style={{ zIndex: 2 }}>
        <span className="badge badge-pill badge-secondary">Today</span>
      </div> */}
      <ul className="list-group mb-2">
        <li className="list-group-item text-center p-2">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={loadMoreMsg}
          >
            Xem thêm
          </button>
        </li>

        {allMsg.map((item) => {
          const isSent = item.sender.id == user.id;

          return (
            <li
              className={`list-group-item border-0 d-flex mb-2 ${isSent ? "flex-row-reverse" : ""
                }`}
              key={item.id}
              style={{ position: "relative" }}
            >
              <div
                className={`d-flex align-items-start ${isSent ? "flex-row-reverse" : ""
                  }`}
                style={{ width: "100%" }}
              >
                <div className={`${isSent ? "ms-2" : "me-2"}`}>
                  <div
                    className="d-flex align-items-center justify-content-center overflow-hidden"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundColor: "#ccc", // fallback màu nền
                    }}
                  >
                    {item.sender.image ? (
                      <img
                        src={item.sender.image}
                        alt="avatar"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "50%",
                        }}
                      />
                    ) : (
                      <span
                        style={{
                          fontSize: 18,
                          color: "white",
                        }}
                      >
                        {item.sender.name?.charAt(0) || "U"}
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className={`card ${item.file_url
                      ? "bg-light-custom "
                      : isSent
                        ? "bg-primary text-white"
                        : " bg-light-custom"
                    }`}
                  style={{
                    padding: "12px",
                    border: "1px solid #ccc",
                    borderRadius: "12px",
                    maxWidth: "75%",
                    wordBreak: "break-word",
                    background: item.file_url ? "transparent" : undefined,
                    boxShadow: item.file_url ? "none" : undefined,
                  }}
                >
                  <div style={{ fontSize: 13 }}>
                    {item.msg && (
                      <div style={{ marginBottom: item.file_url ? 8 : 0 }}>
                        {item.msg}
                      </div>
                    )}
                    {item.file_url && (
                      <div
                        style={{
                          marginTop: 4,
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        {item.file_type &&
                          item.file_type.startsWith("image") ? (
                          <img
                            src={item.file_url}
                            alt={item.file_name || "image"}
                            style={{
                              maxWidth: 220,
                              maxHeight: 180,
                              borderRadius: 10,
                              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                              border: "1px solid #eee",
                              background: "#fff",
                              cursor: "pointer",
                            }}
                            onClick={() => setPreviewImg(item.file_url)}
                            className="chat-img-thumb"
                            title="Nhấn để phóng to"
                          />
                        ) : (
                          <a
                            href={item.file_url}
                            download={item.file_name || true}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "8px 12px",

                              borderRadius: 8,

                              color: "#007bff",
                              fontWeight: 500,
                            }}
                          >
                            <i
                              className="fa fa-file"
                              style={{ marginRight: 8, fontSize: 18 }}
                            />
                            {item.file_name || "Tải file"}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="d-flex align-items-center justify-content-between mt-2">
                    <span className="small">
                      {item.createdAt
                        ? dayjs(item.createdAt).format("HH:mm")
                        : ""}
                    </span>
                    {isSent && (
                      <button
                        className="btn btn-link btn-sm p-0 text-danger ml-3"
                        onClick={() => handleDelete(item.id)}
                        title="Xóa"
                        style={{ alignSelf: "center", marginLeft: 8 }}
                      >
                        <i className="fa fa-trash" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}

        <div />
      </ul>
      {/* Modal phóng to ảnh */}
      {previewImg && (
        <div
          className="chat-img-modal"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setPreviewImg(null)}
        >
          <img
            src={previewImg}
            alt="preview"
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              borderRadius: 8,
              boxShadow: "0 2px 16px #0008",
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            style={{
              position: "fixed",
              top: 24,
              right: 32,
              fontSize: 32,
              color: "#fff",
              background: "none",
              border: "none",
              cursor: "pointer",
              zIndex: 10000,
            }}
            onClick={() => setPreviewImg(null)}
            title="Đóng"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};
export default ChatArea;
