import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const apiKey = process.env.REACT_APP_GROQ_API_KEY;
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.1-8b-instant",
          messages: updatedMessages,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const assistantMessage = res?.data?.choices[0]?.message;
      if (assistantMessage) {
        setMessages([...updatedMessages, assistantMessage]);
      }
    } catch (error) {
      console.error("Error calling Groq API:", error);
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: "Sorry, something went wrong." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "20px auto",
        padding: 20,
        borderRadius: 8,
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        backgroundColor: "#f9fafb",
        display: "flex",
        flexDirection: "column",
        height: "90vh",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>🧠 AI Chatbot</h2>
      <div
        style={{
          flexGrow: 1,
          overflowY: "auto",
          padding: "10px 15px",
          backgroundColor: "#fff",
          borderRadius: 8,
          border: "1px solid #ddd",
          marginBottom: 15,
          boxShadow: "inset 0 1px 4px rgba(0,0,0,0.05)",
        }}
      >
        {messages.length === 0 && (
          <p style={{ color: "#999", textAlign: "center", marginTop: 50 }}>
            Start the conversation by typing a message below...
          </p>
        )}
        {messages.map((msg, idx) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={idx}
              style={{
                marginBottom: 15,
                display: "flex",
                justifyContent: isUser ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "75%",
                  backgroundColor: isUser ? "#4f46e5" : "#e0e7ff",
                  color: isUser ? "white" : "#1e293b",
                  padding: "10px 15px",
                  borderRadius: 18,
                  borderTopRightRadius: isUser ? 0 : 18,
                  borderTopLeftRadius: isUser ? 18 : 0,
                  boxShadow:
                    "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
                  whiteSpace: "pre-wrap",
                  fontSize: 15,
                  lineHeight: 1.4,
                }}
              >
                {isUser ? (
                  <p style={{ margin: 0 }}>{msg.content}</p>
                ) : (
                  <ReactMarkdown
                    components={{
                      p: ({ node, ...props }) => (
                        <p style={{ margin: "0 0 10px" }} {...props} />
                      ),
                      li: ({ node, ...props }) => (
                        <li style={{ marginBottom: 6 }} {...props} />
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
        }}
      >
        <input
          type="text"
          placeholder={
            loading ? "Waiting for AI response..." : "Type your message..."
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={loading}
          style={{
            flexGrow: 1,
            padding: "12px 16px",
            borderRadius: 20,
            border: "1.5px solid #ddd",
            fontSize: 16,
            outline: "none",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#4f46e5")}
          onBlur={(e) => (e.target.style.borderColor = "#ddd")}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          style={{
            backgroundColor: loading || !input.trim() ? "#a5b4fc" : "#4f46e5",
            color: "white",
            border: "none",
            borderRadius: 20,
            padding: "12px 24px",
            fontWeight: "600",
            fontSize: 16,
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            boxShadow: "0 2px 6px rgba(79, 70, 229, 0.4)",
            transition: "background-color 0.3s",
          }}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default App;
