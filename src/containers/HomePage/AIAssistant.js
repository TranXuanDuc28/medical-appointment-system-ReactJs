import React, { useState, useEffect, useRef } from "react";
import { Bot } from "lucide-react";
import MarkdownIt from "markdown-it";
import "./AIAssistant.scss";

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});

const AIAssistant = () => {
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Xin chào! Tôi là trợ lý AI của hệ thống y tế. Tôi có thể giúp bạn trả lời các câu hỏi về sức khỏe, địa chỉ bệnh viện, và các thông tin y tế khác. Bạn có thể hỏi tôi bất cứ điều gì!",
      isBot: true,
      isComplete: true,
    },
  ]);
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
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
    setShowChat(!showChat);
  };

  // Streaming version của handleSendMessage
  const handleSendMessageStream = async () => {
    if (!inputText.trim()) return;

    // Abort previous streaming request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const userMessage = {
      id: Date.now(),
      text: inputText,
      isBot: false,
      isComplete: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInputText = inputText;
    setInputText("");
    setIsLoading(true);
    setSuggestions([]);

    // Tạo bot message placeholder
    const botMessageId = Date.now() + 1;
    const botMessage = {
      id: botMessageId,
      text: "",
      isBot: true,
      isComplete: false,
    };

    setMessages((prev) => [...prev, botMessage]);
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
      const response = await fetch(`${PATH}/generate_stream_chatbox`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: currentInputText,
          session_id: sessionId
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
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === botMessageId ? { ...msg, isComplete: true } : msg
                )
              );
              return;
            }

            try {
              const parsed = JSON.parse(data);

              if (parsed.type === "chunk") {
                // Append text to the streaming message
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === botMessageId
                      ? { ...msg, text: msg.text + parsed.content }
                      : msg
                  )
                );
              } else if (parsed.type === "error") {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === botMessageId
                      ? {
                          ...msg,
                          text: parsed.content,
                          isComplete: true,
                        }
                      : msg
                  )
                );
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
              <span>Trợ lý AI</span>
            </div>
            <div className="header-actions">
              <button
                className="test-api-btn"
                onClick={testAPI}
                title="Test API"
              >
                🔧
              </button>
              <button
                className="test-web-data-btn"
                onClick={testWebData}
                title="Test Web Data"
              >
                🌐
              </button>
              <button
                className="test-doctor-detail-btn"
                onClick={testDoctorDetail}
                title="Test Doctor Detail"
              >
                👨‍⚕️
              </button>
              {modelStatus === "error" && (
                <button
                  className="retry-btn"
                  onClick={loadModel}
                  title="Thử lại load model"
                >
                  🔄
                </button>
              )}
              <button className="close-btn" onClick={() => setShowChat(false)}>
                ×
              </button>
            </div>
          </div>

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

          <div className="chat-messages">
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
              onClick={handleSendMessageStream} // Sử dụng streaming version
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
