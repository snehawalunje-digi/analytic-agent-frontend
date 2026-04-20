import { useState, useEffect, useRef } from "react";

const SESSION_KEY = "ga4-chat-session-id";

function getSessionId() {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = (crypto.randomUUID && crypto.randomUUID()) || `s-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function ChatAssistant({ startDate, endDate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi! Ask me anything about your GA4 analytics. Try \"top pages last 30 days\" or \"compare sessions this week vs last week\"." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [followUps, setFollowUps] = useState([]);
  const sessionIdRef = useRef(getSessionId());
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const send = async (text) => {
    const q = (text ?? input).trim();
    if (!q || loading) return;

    setMessages(prev => [...prev, { role: "user", text: q }]);
    setInput("");
    setFollowUps([]);
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          sessionId: sessionIdRef.current,
          startDate,
          endDate
        })
      });
      const data = await res.json();
      if (data.sessionId) {
        sessionIdRef.current = data.sessionId;
        localStorage.setItem(SESSION_KEY, data.sessionId);
      }
      setMessages(prev => [
        ...prev,
        { role: "ai", text: data.answer || "I couldn't find that in your GA4 data." }
      ]);
      setFollowUps(data.followUps || []);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [...prev, { role: "ai", text: "Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const resetSession = () => {
    localStorage.removeItem(SESSION_KEY);
    sessionIdRef.current = getSessionId();
    setMessages([{ role: "ai", text: "New session started. What would you like to know?" }]);
    setFollowUps([]);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed", bottom: 24, right: 24, width: 56, height: 56,
          borderRadius: "50%", backgroundColor: "#2563eb", color: "#fff",
          fontSize: 24, border: "none", cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)", zIndex: 9999
        }}
      >
        💬
      </button>

      {isOpen && (
        <div
          style={{
            position: "fixed", bottom: 96, right: 24, width: 380, height: 540,
            backgroundColor: "#fff", borderRadius: 12,
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            display: "flex", flexDirection: "column", zIndex: 9999
          }}
        >
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #e5e7eb", fontWeight: 600, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>GA4 Assistant</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={resetSession} title="New session" style={{ border: "none", background: "none", cursor: "pointer", fontSize: 14, color: "#6b7280" }}>↻</button>
              <button onClick={() => setIsOpen(false)} style={{ border: "none", background: "none", cursor: "pointer" }}>✕</button>
            </div>
          </div>

          <div ref={scrollRef} style={{ flex: 1, padding: 12, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  background: msg.role === "user" ? "#2563eb" : "#f3f4f6",
                  color: msg.role === "user" ? "#fff" : "#111827",
                  padding: "8px 12px", borderRadius: 8, maxWidth: "85%",
                  whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.4
                }}
              >
                {msg.text}
              </div>
            ))}
            {loading && <div style={{ fontSize: 12, color: "#6b7280" }}>Thinking…</div>}

            {!loading && followUps.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                {followUps.map((f, i) => (
                  <button
                    key={i}
                    onClick={() => send(f)}
                    style={{
                      fontSize: 12, padding: "4px 10px", borderRadius: 999,
                      border: "1px solid #d1d5db", background: "#fff",
                      color: "#374151", cursor: "pointer"
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ padding: 12, borderTop: "1px solid #e5e7eb", display: "flex", gap: 8 }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about your analytics..."
              style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #d1d5db", fontSize: 14 }}
              onKeyDown={e => e.key === "Enter" && send()}
              disabled={loading}
            />
            <button
              onClick={() => send()}
              disabled={loading}
              style={{
                backgroundColor: loading ? "#9ca3af" : "#2563eb", color: "#fff",
                border: "none", borderRadius: 6, padding: "8px 12px",
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatAssistant;
