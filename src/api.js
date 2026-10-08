const BASE = import.meta.env.VITE_API_URL || "https://bcknd.smartego.org/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { Accept: "application/json", "Content-Type": "application/json", ...options.headers },
  });
  let data = null;
  try { data = await res.json(); } catch { /* empty body */ }
  if (!res.ok || data?.status === false) {
    const firstError = data?.errors && Object.values(data.errors).flat()[0];
    throw new Error(firstError || data?.message || `Request failed (${res.status})`);
  }
  return data;
}

// GET /user/packages?lang=en|ar -> { face_packages: [], whats_packages: [] }
// `lang` is required by the backend ("en" or "ar").
export const getPackages = (lang = "en", signal) =>
  request(`/user/packages?lang=${encodeURIComponent(lang)}`, { signal });

// POST /user/contact-us -> { f_name, l_name, phone, email, message }
export const sendContact = (payload) =>
  request("/user/contact-us", { method: "POST", body: JSON.stringify(payload) });

/* ---------- price helpers ---------- */
const isActive = (d) => {
  if (!d) return false;
  const now = Date.now();
  return (!d.from || now >= Date.parse(d.from)) && (!d.to || now <= Date.parse(d.to));
};
const apply = (base, rule) => {
  const amount = parseFloat(rule.amount) || 0;
  const pct = /percent|%/i.test(rule.type || "");
  return pct ? (base * amount) / 100 : amount;
};

// Returns { base, final, discount, tax } in the package currency (EGP).
export function priceBreakdown(pkg) {
  const base = parseFloat(pkg.price) || 0;
  const discount = isActive(pkg.discount) ? Math.min(apply(base, pkg.discount), base) : 0;
  const afterDiscount = base - discount;
  const tax = pkg.tax ? apply(afterDiscount, pkg.tax) : 0;
  return { base, discount, tax, final: afterDiscount + tax };
}
export const money = (n) => Number(n).toLocaleString("en-US", { maximumFractionDigits: 2 });
export const pkgName = (p, lang = "en") => (p.names && (p.names[lang] || p.names.en || p.names.ar)) || p.name;
