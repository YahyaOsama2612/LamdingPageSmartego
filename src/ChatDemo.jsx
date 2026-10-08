import { useEffect, useRef, useState } from "react";

const SCENARIOS = [
  {
    key: "whatsapp", channel: "WhatsApp", color: "#059669", turns: [
      ["in", "Hi, is the Gold plan still available?"],
      ["out", "Yes! Gold is 1,000 EGP for 5 months. Want me to send the payment link?"],
      ["in", "Yes please"],
      ["out", "Sent. I'll confirm your subscription as soon as it's paid."],
    ]
  },
  {
    key: "messenger", channel: "Messenger", color: "#2563eb", turns: [
      ["in", "Do you deliver to Alexandria?"],
      ["out", "We do! Orders placed before 4 PM arrive the next day."],
      ["in", "Can I track my order?"],
      ["out", "Of course. Send me your order number and I'll check it now."],
    ]
  },
  {
    key: "instagram", channel: "Instagram", color: "linear-gradient(135deg,#f58529,#dd2a7b 55%,#8134af)", turns: [
      ["in", "Saw your post! Is the blue one in stock?"],
      ["out", "Yes, the blue one is in stock in all sizes. Which size do you need?"],
      ["in", "Medium please"],
      ["out", "Reserved a Medium for you. I'll send the checkout link now."],
    ]
  },
  {
    key: "whatsapp", channel: "WhatsApp", color: "#059669", turns: [
      ["in", "What time do you open tomorrow?"],
      ["out", "We open at 10 AM. I can also book you a slot if you like."],
      ["in", "Book 11 AM please"],
      ["out", "Done. You're booked for 11 AM tomorrow."],
    ]
  },
];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function ChatDemo() {
  const [idx, setIdx] = useState(0);
  const [msgs, setMsgs] = useState([]);
  const [typing, setTyping] = useState(false);
  const chatRef = useRef(null);
  const sc = SCENARIOS[idx];

  // smooth auto-scroll whenever content grows
  useEffect(() => {
    const el = chatRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [msgs.length, typing]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setMsgs(SCENARIOS[0].turns.map(([from, text]) => ({ from, text, shown: text.length, done: true })));
      return;
    }
    let dead = false;
    const patchLast = (p) => setMsgs((m) => m.map((x, k) => (k === m.length - 1 ? { ...x, ...p } : x)));
    (async () => {
      let i = 0;
      while (!dead) {
        setIdx(i % SCENARIOS.length); setMsgs([]);
        await sleep(600);
        for (const [from, text] of SCENARIOS[i % SCENARIOS.length].turns) {
          if (dead) return;
          if (from === "in") {
            setMsgs((m) => [...m, { from, text, shown: text.length }]);
            await sleep(1000);
          } else {
            setTyping(true); await sleep(1200); if (dead) return;
            setTyping(false);
            // full text is added once so the bubble keeps its final height while streaming
            setMsgs((m) => [...m, { from, text, shown: 0, live: true }]);
            for (let c = 1; c <= text.length; c++) {
              if (dead) return;
              patchLast({ shown: c });
              await sleep(20);
            }
            patchLast({ live: false, done: true });
            await sleep(900);
          }
        }
        await sleep(2400); i++;
      }
    })();
    return () => { dead = true; };
  }, []);

  return (
    <div className="phone" data-channel={sc.key} style={{ "--out": sc.color }} role="img" aria-label="Example conversation answered automatically by Smartego">
      <div className="phone-top">
        <div className="avatar" style={{ background: sc.color }}>S</div>
        <div>
          <strong>Your business</strong>
          <small><i className="live" />{typing ? "Smartego is typing…" : "Replies automatically"}</small>
        </div>
        <span className="chan" key={sc.channel}>{sc.channel}</span>
      </div>
      <div className="chat" ref={chatRef} aria-hidden="true">
        {msgs.map((m, i) => (
          <div key={i} className={`msg ${m.from}${m.live ? " live" : ""}`}>
            {m.text.slice(0, m.shown)}
            <span style={{ visibility: "hidden" }}>{m.text.slice(m.shown)}</span>
            {m.from === "out" && (
              <span className="tag" style={{ visibility: m.done ? "visible" : "hidden" }}>Auto-reply</span>
            )}
          </div>
        ))}
        {typing && <div className="dots"><span /><span /><span /></div>}
      </div>
    </div>
  );
}