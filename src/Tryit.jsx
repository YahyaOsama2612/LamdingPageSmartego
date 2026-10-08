import { useEffect, useRef, useState } from "react";

const RULES = [
  [
    /human|agent|person|talk to|support|بشر|موظف/i,
    "Sure. I'm passing this chat to a teammate now, and they'll reply here shortly.",
  ],
  [
    /price|cost|plan|package|how much|subscri|سعر|باقة|كام/i,
    "You can see every package, its message allowance and its price in the Plans section below. Want me to point you to the right one?",
  ],
  [
    /hour|open|close|time|when|مواعيد|ميعاد/i,
    "We're open every day from 10 AM to 10 PM. Outside those hours I'll keep answering for you.",
  ],
  [
    /order|track|ship|deliver|where is|طلب|شحن/i,
    "Send me your order number and I'll check its status right away.",
  ],
  [
    /^(hi|hello|hey|good|salam|مرحبا|اهلا|السلام)/i,
    "Hello! Welcome. Ask me about prices, opening hours or your order.",
  ],
];
const FALLBACK =
  "Thanks for your message. I'm not sure about that one, so I've flagged it for a teammate to follow up.";
const CHIPS = [
  "How much does it cost?",
  "What are your opening hours?",
  "Where is my order?",
  "I want to talk to a person",
];
const answerFor = (q) =>
  (RULES.find(([re]) => re.test(q)) || [null, FALLBACK])[1];

export default function TryIt() {
  const initialMessage =
    "Hi! I'm an auto-reply assistant. Ask me anything a customer would ask.";
  const [msgs, setMsgs] = useState([
    {
      from: "out",
      done: true,
      text: initialMessage,
      shown: initialMessage.length,
    },
  ]);
  const [typing, setTyping] = useState(false);
  const [busy, setBusy] = useState(false);
  const [text, setText] = useState("");
  const timers = useRef([]);
  const list = useRef(null);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    const el = list.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, typing]);

  function send(q) {
    q = q.trim();
    if (!q || busy) return;
    setText("");
    setBusy(true);
    setTyping(true);
    setMsgs((m) => [...m, { from: "in", text: q }]);
    const ans = answerFor(q);
    timers.current.push(
      setTimeout(() => {
        setTyping(false);
        setMsgs((m) => [
          ...m,
          { from: "out", text: ans, shown: 0, live: true },
        ]);
        let i = 0;
        const tick = () => {
          i++;
          const finished = i >= ans.length;
          setMsgs((m) =>
            m.map((x, k) =>
              k === m.length - 1
                ? { ...x, shown: i, live: !finished, done: finished }
                : x,
            ),
          );
          if (finished) setBusy(false);
          else timers.current.push(setTimeout(tick, 18));
        };
        tick();
      }, 900),
    );
  }

  return (
    <div className="try">
      <div className="head">
        <h2>Try an automatic reply yourself</h2>
        <p>
          Type what a customer might ask, or tap a suggestion. This is a
          simulated demo, so nothing is sent anywhere.
        </p>
        <div className="qr">
          {CHIPS.map((c) => (
            <button
              key={c}
              className="chipbtn"
              disabled={busy}
              onClick={() => send(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="phone tryphone" style={{ "--out": "var(--em)" }}>
        <div className="phone-top">
          <div className="avatar">S</div>
          <div>
            <strong>Your business</strong>
            <small>
              <i className="live" />
              {typing ? "Smartego is typing…" : "Online"}
            </small>
          </div>
        </div>
        <div className="try-list" ref={list} aria-live="polite">
          {msgs.map((m, i) => (
            <div key={i} className={`msg ${m.from}${m.live ? " live" : ""}`}>
              {m.from === "out" ? (
                <>
                  {m.text.slice(0, m.shown)}
                  <span style={{ visibility: "hidden" }}>
                    {m.text.slice(m.shown)}
                  </span>
                </>
              ) : (
                m.text
              )}
              {m.from === "out" && (
                <span
                  className="tag"
                  style={{ visibility: m.done ? "visible" : "hidden" }}
                >
                  Auto-reply
                </span>
              )}
            </div>
          ))}
          {typing && (
            <div className="dots">
              <span />
              <span />
              <span />
            </div>
          )}
        </div>
        <div className="try-form" role="group">
          <input
            dir="auto"
            value={text}
            placeholder="Type a customer message"
            aria-label="Customer message"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(text)}
          />
          <button
            className="btn sm"
            disabled={busy || !text.trim()}
            onClick={() => send(text)}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
