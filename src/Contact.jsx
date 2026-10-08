import { useEffect, useState } from "react";
import { sendContact } from "./api.js";

const EMPTY = { f_name: "", l_name: "", phone: "", email: "", message: "" };

function validate(v) {
  const e = {};
  if (!v.f_name.trim()) e.f_name = "Enter your first name.";
  if (!v.l_name.trim()) e.l_name = "Enter your last name.";
  if (!/^\+?[\d\s-]{8,16}$/.test(v.phone.trim())) e.phone = "Enter a valid phone number, like +20 100 000 0000.";
  if (!/^\S+@\S+\.\S+$/.test(v.email.trim())) e.email = "Enter a valid email address.";
  if (v.message.trim().length < 10) e.message = "Tell us a little more (at least 10 characters).";
  return e;
}

export default function Contact({ prefill }) {
  const [v, setV] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | sent | failed
  const [serverError, setServerError] = useState("");

  // When a package is chosen, pre-write the message
  useEffect(() => {
    if (prefill) setV((s) => ({ ...s, message: prefill }));
  }, [prefill]);

  const set = (k) => (e) => {
    setV({ ...v, [k]: e.target.value });
    if (errors[k]) setErrors({ ...errors, [k]: undefined });
  };

  async function submit(e) {
    e.preventDefault();
    const found = validate(v);
    setErrors(found);
    if (Object.keys(found).length) return;
    setStatus("sending"); setServerError("");
    try {
      await sendContact(Object.fromEntries(Object.entries(v).map(([k, x]) => [k, x.trim()])));
      setStatus("sent"); setV(EMPTY);
    } catch (err) {
      setServerError(err.message); setStatus("failed");
    }
  }

  if (status === "sent") {
    return (
      <div className="sent" role="status">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M7.5 12.5l3 3 6-7" /></svg>
        <h3>Message sent</h3>
        <p>Thanks. Our team will reply to your email or phone soon.</p>
        <button className="btn ghost sm" onClick={() => setStatus("idle")}>Send another message</button>
      </div>
    );
  }

  const Field = ({ k, label, type = "text", auto, area }) => (
    <label className={`field${errors[k] ? " bad" : ""}${area ? " full" : ""}`}>
      <span>{label}</span>
      {area
        ? <textarea rows="5" value={v[k]} onChange={set(k)} aria-invalid={!!errors[k]} />
        : <input type={type} autoComplete={auto} value={v[k]} onChange={set(k)} aria-invalid={!!errors[k]} />}
      {errors[k] && <em role="alert">{errors[k]}</em>}
    </label>
  );

  return (
    <form className="form" onSubmit={submit} noValidate>
      <Field k="f_name" label="First name" auto="given-name" />
      <Field k="l_name" label="Last name" auto="family-name" />
      <Field k="phone" label="Phone" type="tel" auto="tel" />
      <Field k="email" label="Email" type="email" auto="email" />
      <Field k="message" label="How can we help?" area />
      {status === "failed" && <p className="form-err full" role="alert">We couldn't send your message. {serverError}</p>}
      <button className="btn full" disabled={status === "sending"}>{status === "sending" ? "Sending…" : "Send message"}</button>
    </form>
  );
}
