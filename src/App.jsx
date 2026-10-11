import { useEffect, useState } from "react";
import ChatDemo from "./ChatDemo.jsx";
import TryIt from "./Tryit.jsx";
import Packages from "./Packages.jsx";
import Contact from "./Contact.jsx";
import Reveal from "./Reveal.jsx";
import { pkgName } from "./api.js";

const FEATURES = [
  ["Instant replies, day and night", "Common questions about prices, availability and orders are answered in seconds, at any hour."],
  ["WhatsApp and Messenger together", "Connect your WhatsApp numbers and Facebook pages and manage both from one place."],
  ["A message balance you can see", "Every subscription shows the messages sent and the messages left, so you never run out without noticing."],
  ["Arabic and English", "Packages and replies work in both languages, so customers are answered in the one they write in."],
];
const STEPS = [
  ["Connect your channel", "Link your WhatsApp number or Messenger page to your Smartego account."],
  ["Choose a package", "Pick the message allowance and length that fits your volume. Change it any time."],
  ["Let automation reply", "Customers get instant answers, and you follow usage from your dashboard."],
];
const HEADLINE = "Answer every customer message, even while you sleep.".split(" ");
const BUBBLES = [[8, 90, 14, 0], [22, 60, 18, 3], [38, 110, 16, 6], [55, 70, 20, 1.5], [70, 100, 15, 4.5], [86, 64, 19, 8]];

export default function App() {
  const [prefill, setPrefill] = useState("");
  const [lang, setLang] = useState("en"); // sent to GET /user/packages as ?lang=

  const choose = (pkg) => {
    setPrefill(`Hi, I'd like to subscribe to the ${pkgName(pkg, lang)} package (${pkg.msg_number} messages, ${pkg.months} months).`);
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // scroll progress bar
    const root = document.documentElement;
    const onScroll = () => root.style.setProperty("--p", root.scrollTop / ((root.scrollHeight - root.clientHeight) || 1));
    // cursor spotlight on hero + plan cards
    const onMove = (e) => {
      const c = e.target.closest?.(".plan,.hero-bg");
      if (!c) return;
      const r = c.getBoundingClientRect();
      c.style.setProperty("--mx", `${e.clientX - r.left}px`);
      c.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("pointermove", onMove);
    return () => { window.removeEventListener("scroll", onScroll); document.removeEventListener("pointermove", onMove); };
  }, []);

  return (
    <>
      <div className="progress" aria-hidden="true" />
      <header>
        <div className="wrap bar">
          <a className="logo" href="#top">
            <i><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z" /><path d="M8.5 12l2.5 2.5 4.5-5" /></svg></i>
            Smartego
          </a>
          <nav aria-label="Main"><a href="#features">Features</a><a href="#try">Try it</a><a href="#how">How it works</a><a href="#plans">Plans</a><a href="#contact">Contact</a></nav>
          <div className="lang" role="group" aria-label="Package language">
            {["en", "ar"].map((l) => (
              <button key={l} className={lang === l ? "on" : ""} aria-pressed={lang === l} onClick={() => setLang(l)}>{l === "en" ? "EN" : "عربي"}</button>
            ))}
          </div>
          <a className="btn sm" href="#plans">Get started</a>
        </div>
      </header>

      <main id="top">
        <div className="hero-bg">
          <div className="drift" aria-hidden="true">
            {BUBBLES.map(([x, w, t, d], i) => <i key={i} style={{ "--x": `${x}%`, "--w": `${w}px`, "--t": `${t + 8}s`, "--dl": `${d}s` }} />)}
          </div>
          <div className="wrap hero">
            <div>
              <h1 aria-label={HEADLINE.join(" ")}>
                {HEADLINE.map((w, i) => <span key={i} className="w" style={{ "--i": i }} aria-hidden="true">{w}{" "}</span>)}
              </h1>
              <p className="lead rise-late">Smartego connects your WhatsApp and Messenger to automated replies. Customers get an answer in seconds, and your team only steps in when a person is really needed.</p>
              <div className="cta-row rise-late" style={{ "--i": 2 }}>
                <a className="btn" href="#try">Try a live reply</a>
                <a className="btn ghost" href="#plans">See plans</a>
              </div>
              <div className="channels rise-late" style={{ "--i": 3 }} aria-label="Supported channels">
                <span className="chip"><b />WhatsApp</span>
                <span className="chip m"><b />Messenger</span>
              </div>
            </div>
            <div className="stage">
              <ChatDemo />
              <div className="float f1"><strong>2 s</strong><small>average first reply</small></div>
              <div className="float f2"><strong>24/7</strong><small>always on</small></div>
            </div>
          </div>
        </div>

        <section id="features">
          <div className="wrap">
            <Reveal className="head"><h2>Support that keeps up with your customers</h2><p>Set your replies once. Smartego handles the repeat questions so nobody waits for an answer.</p></Reveal>
            <div className="feats">
              {FEATURES.map(([t, d], i) => <Reveal className="feat" key={t} delay={(i % 2) * 120}><h3>{t}</h3><p>{d}</p></Reveal>)}
            </div>
          </div>
        </section>

        <section id="try" className="trysec">
          <div className="wrap"><Reveal><TryIt /></Reveal></div>
        </section>

        <section id="how" className="band">
          <div className="wrap">
            <Reveal className="head"><h2>Up and running in three steps</h2><p>No developers needed. Most businesses finish setup in one sitting.</p></Reveal>
            <ol className="steps">{STEPS.map(([t, d], i) => <Reveal as="li" key={t} delay={i * 180}><h3>{t}</h3><p>{d}</p></Reveal>)}</ol>
          </div>
        </section>

        <section id="plans">
          <div className="wrap">
            <Reveal className="head"><h2>Pick the package that fits your volume</h2><p>Pay in Egyptian pounds. Prices include any active discount and tax. Use the EN / عربي switch to change the package language.</p></Reveal>
            <Packages onChoose={choose} lang={lang} />
          </div>
        </section>

        <section id="contact" className="contact">
          <div className="wrap contact-grid">
            <Reveal className="head">
              <h2>Talk to the Smartego team</h2>
              <p>Questions about a package, a custom volume, or setting up your channel? Send us a message and we'll get back to you.</p>
            </Reveal>
            <Reveal delay={150}><Contact prefill={prefill} /></Reveal>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap"><span>© 2026 Smartego. All rights reserved.</span><span>Automated support for WhatsApp and Messenger</span></div>
      </footer>
    </>
  );
}