import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { Bot, MapPin, Navigation, RotateCcw, ChevronDown } from "lucide-react";
import MarkdownIt from "markdown-it";
import "./AIAssistant.scss";

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});

const DEFAULT_MESSAGE = {
  id: 1,
  text: "Xin chào! Tôi là Trợ lý Y tế Thông minh của Hệ thống Đặt lịch Khám bệnh. Tôi có thể đồng hành hỗ trợ bạn tư vấn triệu chứng, tìm bác sĩ giỏi theo khu vực và đặt lịch khám. Bạn đang có thắc mắc gì về sức khỏe?",
  isBot: true,
  isComplete: true,
};

const AIAssistant = () => {
  const history = useHistory();
  const userInfo = useSelector((state) => state.user?.userInfo);
  const patientInfo = useSelector((state) => state.patient?.patientInfo);
  const userLocation = patientInfo?.address || userInfo?.address || localStorage.getItem("user_location") || "";
  const [selectedLocation, setSelectedLocation] = useState(
    () => localStorage.getItem("user_location") || patientInfo?.address || userInfo?.address || ""
  );
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showChat, setShowChat] = useState(() => {
    return localStorage.getItem("ai_chat_open") === "true";
  });
  
  // Khởi tạo lịch sử tin nhắn từ localStorage để không bị mất khi reload (F5) trang
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem("ai_medical_messages");
      if (saved) {
        let parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Tự động làm sạch tàn dư link tuyệt đối hoặc chữ "Khi bấm vào" từ phiên cũ
          return parsed.map((m) => {
            if (m && typeof m.text === "string") {
              let cleanText = m.text.replace(/https?:\/\/(?:localhost|127\.0\.0\.1):\d+\/detail-doctor\//g, "/detail-doctor/");
              cleanText = cleanText.replace(/\n+\s*Khi bấm vào(?:\s+link[^\n]*)?$/i, "").trim();
              return { ...m, text: cleanText };
            }
            return m;
          });
        }
      }
    } catch (e) {
      console.warn("Failed to load saved messages:", e);
    }
    return [DEFAULT_MESSAGE];
  });
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [modelStatus, setModelStatus] = useState("not_loaded");
  const [suggestions, setSuggestions] = useState([]);
  const [apiStatus, setApiStatus] = useState("unknown");
  const [streamingMessageId, setStreamingMessageId] = useState(null);

  // Ref để abort streaming request
  const abortControllerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const PATH = process.env.REACT_APP_CHATBOT_URL;

  useEffect(() => {
    loadModel();
  }, []);

  useEffect(() => {
    if (inputText.length > 2 && modelStatus === "loaded") {
      getSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [inputText, modelStatus]);

  // Auto scroll to bottom when new message arrives
  const messagesRef = useRef(messages);

  // Tự động lưu toàn bộ tin nhắn vào localStorage và cập nhật messagesRef
  useEffect(() => {
    messagesRef.current = messages;
    try {
      if (messages && messages.length > 0) {
        localStorage.setItem("ai_medical_messages", JSON.stringify(messages));
      }
    } catch (e) {
      console.warn("Failed to persist messages:", e);
    }
  }, [messages]);

  // Đảm bảo đồng bộ dữ liệu vào localStorage ngay khi reload trang hoặc chuyển trang
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        if (messagesRef.current && messagesRef.current.length > 0) {
          localStorage.setItem("ai_medical_messages", JSON.stringify(messagesRef.current));
        }
      } catch (e) {}
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Bắt sự kiện click vào link bên trong nội dung chat để chuyển trang mượt bằng React Router (SPA)
  // Giúp AIAssistant không bị unmount, giữ nguyên 100% cuộc trò chuyện và cửa sổ chat
  const handleMessagesClick = (e) => {
    const targetLink = e.target.closest("a");
    if (!targetLink) return;

    const href = targetLink.getAttribute("href");
    if (!href) return;

    // Nếu là đường dẫn nội bộ (bắt đầu bằng "/" hoặc chứa host hiện tại)
    if (href.startsWith("/")) {
      e.preventDefault();
      history.push(href);
    } else if (href.includes(window.location.host)) {
      e.preventDefault();
      try {
        const urlObj = new URL(href);
        history.push(urlObj.pathname + urlObj.search + urlObj.hash);
      } catch (err) {
        history.push(href);
      }
    } else if (href.startsWith("http://") || href.startsWith("https://")) {
      // Link bên ngoài: Mở tab mới
      targetLink.setAttribute("target", "_blank");
      targetLink.setAttribute("rel", "noopener noreferrer");
    }
  };

  const loadModel = async (isMounted = true) => {
    if (!isMounted) return;
    setModelStatus("loading");
    try {
      const response = await fetch(`${PATH}/load_model`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!isMounted) return;
      
      const data = await response.json();

      if (response.ok) {
        setModelStatus("loaded");
        console.log("DeepSeek Model (Ollama) loaded successfully");

        const healthResponse = await fetch(`${PATH}/health`);
        if (healthResponse.ok && isMounted) {
          const healthData = await healthResponse.json();
          console.log("Health check:", healthData);
        }

        const testResponse = await fetch(`${PATH}/test_api`);
        if (testResponse.ok && isMounted) {
          setApiStatus("working");
        } else if (testResponse.status === 429 && isMounted) {
          setApiStatus("rate_limited");
        } else if (isMounted) {
          setApiStatus("error");
        }
      } else if (isMounted) {
        setModelStatus("error");
        console.error("Failed to load model:", data.error);
      }
    } catch (error) {
      if (isMounted) {
        setModelStatus("error");
        console.error("Error loading model:", error);
      }
    }
  };

  const getSuggestions = async () => {
    try {
      const response = await fetch(`${PATH}/suggestions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error("Error getting suggestions:", error);
    }
  };

  const handleClick = () => {
    const nextState = !showChat;
    setShowChat(nextState);
    localStorage.setItem("ai_chat_open", nextState ? "true" : "false");
  };

  const handleCloseChat = () => {
    setShowChat(false);
    localStorage.setItem("ai_chat_open", "false");
  };

  // Chọn nhanh tỉnh thành từ nút bấm (Quick Chips)
  const handleSelectLocation = (city) => {
    localStorage.setItem("user_location", city);
    setSelectedLocation(city);
    handleSendMessageStream(`Mình đang ở ${city} bạn ơi, hãy gợi ý bác sĩ hoặc cơ sở y tế gần mình nhất.`);
  };

  // Đổi nhanh vị trí từ menu trên Header (chỉ cập nhật vị trí ưu tiên)
  const handleQuickChangeLocation = (city) => {
    localStorage.setItem("user_location", city);
    setSelectedLocation(city);
    const locMsg = {
      id: Date.now(),
      text: `📍 *Đã cập nhật khu vực ưu tiên:* **${city}**. Chatbot sẽ ưu tiên tìm kiếm và gợi ý các bác sĩ tại đây cho bạn!`,
      isBot: true,
      isComplete: true,
    };
    setMessages((prev) => [...prev, locMsg]);
  };

  // Xóa vị trí đã lưu (chuyển sang tìm kiếm chung toàn quốc)
  const handleClearLocation = () => {
    localStorage.removeItem("user_location");
    setSelectedLocation("");
    const clearMsg = {
      id: Date.now(),
      text: "📍 *Đã xóa khu vực ưu tiên.* Chatbot sẽ tìm kiếm và đề xuất thông tin tổng quát trên toàn quốc.",
      isBot: true,
      isComplete: true,
    };
    setMessages((prev) => [...prev, clearMsg]);
  };

  // Làm mới cuộc trò chuyện (Clear chat history & Reset session)
  const handleResetChat = async () => {
    if (window.confirm("Bạn có muốn xóa cuộc trò chuyện này để bắt đầu phiên tư vấn mới không?")) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const newSessionId = "session_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
      localStorage.setItem("ai_medical_session_id", newSessionId);
      localStorage.setItem("ai_medical_messages", JSON.stringify([DEFAULT_MESSAGE]));
      messagesRef.current = [DEFAULT_MESSAGE];
      setMessages([DEFAULT_MESSAGE]);
      setInputText("");
      setSuggestions([]);
      setIsLoading(false);
      setStreamingMessageId(null);

      try {
        await fetch(`${PATH}/clear_history`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: newSessionId }),
        });
      } catch (err) {
        console.warn("Clear history warning:", err);
      }
    }
  };

  // Tự động định vị GPS khi người dùng bấm nút
  const handleGetGPSLocation = (autoSend = true) => {
    if (!navigator.geolocation) {
      alert("Trình duyệt không hỗ trợ định vị GPS.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        let detectedCity = "Hà Nội";
        let detectedDistrict = "";
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&accept-language=vi`,
            { headers: { "User-Agent": "MedicalAppointmentBot/1.0" } }
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const raw = (addr.city || addr.state || addr.province || addr.county || "").toLowerCase();
            if (raw.includes("hà nội") || lat >= 20.0) {
              detectedCity = "Hà Nội";
            } else if (raw.includes("hồ chí minh") || raw.includes("sài gòn") || lat <= 11.5) {
              detectedCity = "TP. Hồ Chí Minh";
            } else if (raw.includes("đà nẵng") || (lat >= 15.5 && lat <= 16.5)) {
              detectedCity = "Đà Nẵng";
            } else if (addr.city || addr.state || addr.province) {
              detectedCity = addr.city || addr.state || addr.province;
            }

            // Trích xuất quận / huyện / thị xã / phường
            const distRaw = addr.suburb || addr.quarter || addr.city_district || addr.district || addr.county || "";
            if (distRaw) {
              detectedDistrict = distRaw;
            }
          }
        } catch (err) {
          if (lat >= 19.5) detectedCity = "Hà Nội";
          else if (lat >= 14.5) detectedCity = "Đà Nẵng";
          else detectedCity = "TP. Hồ Chí Minh";
        } finally {
          setIsLocating(false);
          const fullLocation = detectedDistrict ? `${detectedDistrict}, ${detectedCity}` : detectedCity;
          localStorage.setItem("user_location", fullLocation);
          setSelectedLocation(fullLocation);
          if (autoSend) {
            handleSendMessageStream(`Mình đang ở ${fullLocation} (qua định vị GPS), hãy gợi ý bác sĩ hoặc cơ sở y tế gần mình nhất nhé.`);
          } else {
            const gpsMsg = {
              id: Date.now(),
              text: `📍 *Định vị GPS thành công:* **${fullLocation}**. Hệ thống đã cập nhật vị trí ưu tiên của bạn!`,
              isBot: true,
              isComplete: true,
            };
            setMessages((prev) => [...prev, gpsMsg]);
          }
        }
      },
      (error) => {
        setIsLocating(false);
        console.warn("GPS error:", error);
        alert("Không thể truy cập GPS (có thể do bị chặn quyền riêng tư trong trình duyệt). Bạn có thể chọn nhanh các tỉnh thành như Hà Nội, TP.HCM, Đà Nẵng nhé!");
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Streaming version của handleSendMessage
  const handleSendMessageStream = async (customText = null) => {
    const currentInputText = (typeof customText === "string" ? customText : inputText).trim();
    if (!currentInputText) return;

    // Abort previous streaming request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const userMessage = {
      id: Date.now(),
      text: currentInputText,
      isBot: false,
      isComplete: true,
    };

    // Tạo bot message placeholder
    const botMessageId = Date.now() + 1;
    const botMessage = {
      id: botMessageId,
      text: "",
      isBot: true,
      isComplete: false,
    };

    const initialMsgs = [...messagesRef.current, userMessage, botMessage];
    messagesRef.current = initialMsgs;
    try {
      localStorage.setItem("ai_medical_messages", JSON.stringify(initialMsgs));
    } catch (e) {}

    setMessages(initialMsgs);
    if (typeof customText !== "string") {
      setInputText("");
    }
    setIsLoading(true);
    setSuggestions([]);
    setStreamingMessageId(botMessageId);

    // Tạo AbortController cho request này
    abortControllerRef.current = new AbortController();

    // Lấy hoặc khởi tạo session_id độc lập cho người dùng
    let sessionId = localStorage.getItem("ai_medical_session_id");
    if (!sessionId) {
      sessionId = "session_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
      localStorage.setItem("ai_medical_session_id", sessionId);
    }

    try {
      const activeLoc = selectedLocation || userLocation || localStorage.getItem("user_location") || "";
      const response = await fetch(`${PATH}/generate_stream_chatbox`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: currentInputText,
          session_id: sessionId,
          location: activeLoc
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);

            if (data === "[DONE]") {
              setIsLoading(false);
              setStreamingMessageId(null);
              setMessages((prev) => {
                const finalMsgs = prev.map((msg) =>
                  msg.id === botMessageId ? { ...msg, isComplete: true } : msg
                );
                messagesRef.current = finalMsgs;
                try {
                  localStorage.setItem("ai_medical_messages", JSON.stringify(finalMsgs));
                } catch (e) {}
                return finalMsgs;
              });
              return;
            }

            try {
              const parsed = JSON.parse(data);

              if (parsed.type === "chunk") {
                // Append text to the streaming message
                setMessages((prev) => {
                  const updated = prev.map((msg) =>
                    msg.id === botMessageId
                      ? { ...msg, text: msg.text + parsed.content }
                      : msg
                  );
                  messagesRef.current = updated;
                  return updated;
                });
              } else if (parsed.type === "error") {
                setMessages((prev) => {
                  const updated = prev.map((msg) =>
                    msg.id === botMessageId
                      ? {
                          ...msg,
                          text: parsed.content,
                          isComplete: true,
                        }
                      : msg
                  );
                  messagesRef.current = updated;
                  try {
                    localStorage.setItem("ai_medical_messages", JSON.stringify(updated));
                  } catch (e) {}
                  return updated;
                });
                setIsLoading(false);
                setStreamingMessageId(null);
                return;
              }
            } catch (e) {
              console.log("Could not parse SSE data:", data);
            }
          }
        }
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Streaming request aborted");
        return;
      }

      console.error("Streaming error:", error);
      const errorMessage = {
        id: Date.now() + 2,
        text: "Xin lỗi, tôi không thể kết nối được. Vui lòng thử lại sau.",
        isBot: true,
        isComplete: true,
      };

      // Remove placeholder và add error message
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== botMessageId).concat(errorMessage)
      );
    } finally {
      setIsLoading(false);
      setStreamingMessageId(null);
      abortControllerRef.current = null;
    }
  };

  // // Fallback to non-streaming version
  // const handleSendMessage = async () => {
  //   if (!inputText.trim()) return;

  //   const userMessage = {
  //     id: Date.now(),
  //     text: inputText,
  //     isBot: false,
  //     isComplete: true,
  //   };

  //   setMessages((prev) => [...prev, userMessage]);
  //   setInputText("");
  //   setIsLoading(true);
  //   setSuggestions([]);

  //   try {
  //     const response = await fetch(`${PATH}/generate", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ text: inputText }),
  //     });

  //     const data = await response.json();

  //     if (response.ok) {
  //       const botMessage = {
  //         id: Date.now() + 1,
  //         text: data.answer,
  //         isBot: true,
  //         isComplete: true,
  //       };
  //       setMessages((prev) => [...prev, botMessage]);
  //     } else {
  //       const errorMessage = {
  //         id: Date.now() + 1,
  //         text: `Lỗi: ${data.error || "Không thể kết nối với AI"}`,
  //         isBot: true,
  //         isComplete: true,
  //       };
  //       setMessages((prev) => [...prev, errorMessage]);
  //     }
  //   } catch (error) {
  //     const errorMessage = {
  //       id: Date.now() + 1,
  //       text: "Xin lỗi, tôi không thể kết nối được. Vui lòng thử lại sau.",
  //       isBot: true,
  //       isComplete: true,
  //     };
  //     setMessages((prev) => [...prev, errorMessage]);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleSuggestionClick = (suggestion) => {
    setInputText(suggestion);
    setSuggestions([]);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      // Sử dụng streaming version mặc định
      handleSendMessageStream();
    }
  };

  const testAPI = async () => {
    try {
      const response = await fetch(`${PATH}/test_api`);
      const data = await response.json();

      if (response.ok) {
        setApiStatus("working");
        console.log("API test successful:", data.message);
      } else if (response.status === 429) {
        setApiStatus("rate_limited");
        console.log("API rate limited:", data.message);
      } else {
        setApiStatus("error");
        console.log("API test failed:", data.message);
      }
    } catch (error) {
      setApiStatus("error");
      console.error("API test error:", error);
    }
  };

  const testWebData = async () => {
    try {
      const response = await fetch(`${PATH}/web_data`);
      const data = await response.json();

      if (response.ok) {
        console.log("Web data test successful:", data.message);
        console.log("Web data:", data.data);
        alert(`Dữ liệu web: ${JSON.stringify(data.data, null, 2)}`);
      } else {
        console.log("Web data test failed:", data.message);
        alert(`Lỗi: ${data.message}`);
      }
    } catch (error) {
      console.error("Web data test error:", error);
      alert(`Lỗi kết nối: ${error.message}`);
    }
  };

  const testDoctorDetail = async () => {
    try {
      const response = await fetch(`${PATH}/test_doctor_detail`);
      const data = await response.json();

      if (response.ok) {
        console.log("Doctor detail test successful:", data.message);
        console.log("Doctor detail:", data.data);
        alert(
          `Thông tin bác sĩ chi tiết: ${JSON.stringify(data.data, null, 2)}`
        );
      } else {
        console.log("Doctor detail test failed:", data.message);
        alert(`Lỗi: ${data.message}`);
      }
    } catch (error) {
      console.error("Doctor detail test error:", error);
      alert(`Lỗi kết nối: ${error.message}`);
    }
  };

  return (
    <>
      <div className="ai-assistant-icon" onClick={handleClick}>
        <div className="ai-icon-circle">
          <Bot className="ai-robot-icon" />
        </div>
        <div className="ai-text">Trợ lý AI</div>
        <div className={`model-status ${modelStatus}`}>
          {modelStatus === "loaded"}
          {modelStatus === "loading"}
          {modelStatus === "error"}
        </div>
      </div>

      {showChat && (
        <div className="ai-chat-box">
          <div className="chat-header">
            <div className="chat-title">
              <Bot className="chat-bot-icon" />
              <div className="title-text-group">
                <span className="title-main">Trợ lý AI</span>
                <button
                  type="button"
                  className={`header-location-badge-btn ${showLocationMenu ? "active" : ""}`}
                  onClick={() => setShowLocationMenu(!showLocationMenu)}
                  title="Bấm để đổi tỉnh thành hoặc định vị lại vị trí"
                >
                  <MapPin size={10} />
                  <span className="badge-loc-text">{selectedLocation || "Toàn quốc"}</span>
                  <ChevronDown size={10} className={`badge-arrow ${showLocationMenu ? "open" : ""}`} />
                </button>
              </div>
            </div>
            <div className="header-actions">
              <button
                type="button"
                className="new-chat-btn"
                onClick={handleResetChat}
                title="Bắt đầu cuộc trò chuyện mới (Xóa lịch sử)"
              >
                <RotateCcw size={15} />
              </button>
              {modelStatus === "error" && (
                <button
                  type="button"
                  className="retry-btn"
                  onClick={loadModel}
                  title="Thử lại kết nối AI"
                >
                  🔄
                </button>
              )}
              <button 
                type="button" 
                className="close-btn" 
                onClick={handleCloseChat}
                title="Đóng cửa sổ chat"
              >
                ×
              </button>
            </div>
          </div>

          {/* Menu chọn & định vị lại vị trí (Dropdown) */}
          {showLocationMenu && (
            <>
              <div 
                className="location-menu-backdrop" 
                onClick={() => setShowLocationMenu(false)} 
              />
              <div className="location-dropdown-menu">
                <div className="menu-header">
                  <span>Khu vực ưu tiên tìm bác sĩ</span>
                  <button
                    type="button"
                    className="menu-close-btn"
                    onClick={() => setShowLocationMenu(false)}
                  >
                    ×
                  </button>
                </div>

                <button
                  type="button"
                  className="menu-gps-btn"
                  onClick={() => {
                    setShowLocationMenu(false);
                    handleGetGPSLocation(false);
                  }}
                  disabled={isLocating}
                >
                  <Navigation size={13} className={isLocating ? "nav-spin" : ""} />
                  <span>{isLocating ? "Đang định vị GPS..." : "📍 Định vị lại vị trí hiện tại (GPS)"}</span>
                </button>

                <div className="menu-subheading">Hoặc chọn nhanh thành phố:</div>
                <div className="menu-city-grid">
                  {[
                    "Hà Nội",
                    "TP. Hồ Chí Minh",
                    "Đà Nẵng",
                    "Cần Thơ",
                    "Hải Phòng",
                    "Bình Dương",
                    "Huế",
                    "Quảng Ninh",
                  ].map((city) => (
                    <button
                      key={city}
                      type="button"
                      className={`city-pill ${selectedLocation === city ? "selected" : ""}`}
                      onClick={() => {
                        handleQuickChangeLocation(city);
                        setShowLocationMenu(false);
                      }}
                    >
                      {city}
                    </button>
                  ))}
                </div>

                {selectedLocation && (
                  <button
                    type="button"
                    className="menu-clear-btn"
                    onClick={() => {
                      handleClearLocation();
                      setShowLocationMenu(false);
                    }}
                  >
                    Bỏ chọn vị trí (Tìm kiếm toàn quốc)
                  </button>
                )}
              </div>
            </>
          )}

          {modelStatus === "not_loaded" && (
            <div className="model-status-message">
              <p>Đang khởi tạo AI...</p>
            </div>
          )}
          {modelStatus === "error" && (
            <div className="model-status-message error">
              <p>Không thể kết nối AI. Vui lòng thử lại.</p>
              <button onClick={loadModel} className="retry-model-btn">
                Thử lại
              </button>
            </div>
          )}
          {apiStatus === "rate_limited" && (
            <div className="model-status-message warning">
              <p>AI đang bận xử lý nhiều yêu cầu. Vui lòng thử lại sau.</p>
            </div>
          )}
          {apiStatus === "error" && (
            <div className="model-status-message error">
              <p> Lỗi kết nối AI!</p>
              <p>Vui lòng kiểm tra lại máy chủ.</p>
            </div>
          )}

          <div className="chat-messages" onClick={handleMessagesClick}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${
                  message.isBot ? "bot-message" : "user-message"
                }`}
              >
                <div className="message-content">
                  <div dangerouslySetInnerHTML={{ __html: md.render(message.text) }} />
                  {/* Hiển thị cursor khi đang streaming */}
                  {!message.isComplete && message.id === streamingMessageId && (
                    <span className="streaming-cursor">▋</span>
                  )}
                </div>
              </div>
            ))}
            {isLoading && !streamingMessageId && (
              <div className="message bot-message">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Hàng nút bấm chọn vị trí nhanh (Quick Location Action Chips) */}
          {(() => {
            const lastMsg = messages[messages.length - 1];
            const isBotAskingLocation =
              lastMsg &&
              lastMsg.isBot &&
              lastMsg.isComplete &&
              !isLoading &&
              (lastMsg.text.includes("tỉnh/thành") ||
                lastMsg.text.includes("khu vực nào") ||
                lastMsg.text.includes("Hà Nội, TP.HCM") ||
                lastMsg.text.includes("gần bạn nhất") ||
                lastMsg.text.includes("nắm được khu vực"));

            if (!isBotAskingLocation) return null;

            return (
              <div className="location-action-bar">
                <div className="location-bar-header">
                  <MapPin size={12} className="loc-pin-icon" />
                  <span>Chọn nhanh khu vực để tìm bác sĩ gần bạn:</span>
                </div>
                <div className="location-chips">
                  <button
                    type="button"
                    className="chip-btn gps-chip"
                    onClick={handleGetGPSLocation}
                    disabled={isLocating || isLoading}
                    title="Tự động phát hiện vị trí qua GPS"
                  >
                    <Navigation size={12} className={isLocating ? "nav-spin" : ""} />
                    <span>{isLocating ? "Đang định vị..." : "📍 Vị trí hiện tại (GPS)"}</span>
                  </button>
                  {["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Huế"].map((city) => (
                    <button
                      type="button"
                      key={city}
                      className={`chip-btn city-chip ${selectedLocation === city ? "selected" : ""}`}
                      onClick={() => handleSelectLocation(city)}
                      disabled={isLoading || isLocating}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}

          {suggestions.length > 0 && (
            <div className="suggestions">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="suggestion-btn"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <div className="chat-input">
            <input
              type="text"
              placeholder="Nhập câu hỏi của bạn..."
              className="input-field"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading || modelStatus !== "loaded"}
            />
            <button
              className="send-btn"
              onClick={() => handleSendMessageStream()} // Sử dụng arrow function để không truyền nhầm Synthetic Event
              disabled={
                isLoading || !inputText.trim() || modelStatus !== "loaded"
              }
            >
              {isLoading ? "Đang gửi..." : "Gửi"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
