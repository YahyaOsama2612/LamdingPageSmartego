import { useEffect, useMemo, useState } from "react";
import { getPackages, priceBreakdown, money, pkgName } from "./api.js";

const TABS = [
  { key: "whats_packages", label: "WhatsApp" },
  { key: "face_packages", label: "Messenger" },
  { key: "instagram_packages", label: "Instagram" },
];

function Skeleton() {
  return (
    <div className="plans">
      {[0, 1, 2].map((i) => (
        <div key={i} className="plan skel" aria-hidden="true" />
      ))}
    </div>
  );
}

function Plan({ pkg, recommended, onChoose, lang }) {
  const { base, discount, tax, final } = priceBreakdown(pkg);
  const perThousand = pkg.msg_number ? (final / pkg.msg_number) * 1000 : null;
  return (
    <article className={`plan${recommended ? " rec" : ""}`}>
      <h3>
        {pkgName(pkg, lang)}
        {recommended && <span className="badge">Best value</span>}
      </h3>
      <div>
        {discount > 0 && <s className="was">{money(base)} EGP</s>}
        <div className="price">
          {money(final)}{" "}
          <small>
            EGP / {pkg.months} {pkg.months === 1 ? "month" : "months"}
          </small>
        </div>
        {(discount > 0 || tax > 0) && (
          <p className="fine">
            {discount > 0 && <>Includes {money(discount)} EGP off. </>}
            {tax > 0 && <>Includes {money(tax)} EGP tax.</>}
          </p>
        )}
      </div>
      <ul>
        <li>{Number(pkg.msg_number).toLocaleString("en-US")} messages</li>
        <li>
          {pkg.months} {pkg.months === 1 ? "month" : "months"} of service
        </li>
        {perThousand && <li>{money(perThousand)} EGP per 1,000 messages</li>}
      </ul>
      <button
        className={`btn${recommended ? "" : " ghost"}`}
        onClick={() => onChoose(pkg)}
      >
        Choose {pkgName(pkg, lang)}
      </button>
    </article>
  );
}

export default function Packages({ onChoose, lang }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState(TABS[0].key);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    setData(null);
    setError("");
    getPackages(lang, ctrl.signal)
      .then(setData)
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      });
    return () => ctrl.abort();
  }, [attempt, lang]);

  const list = useMemo(
    () =>
      [
        ...(data?.[tab] ??
          (tab === "instagram_packages" ? data?.insta_packages : null) ??
          []),
      ].sort((a, b) => parseFloat(a.price) - parseFloat(b.price)),
    [data, tab],
  );
  // Best value = lowest price per message
  const bestId = useMemo(() => {
    if (list.length < 2) return null;
    return list.reduce((best, p) =>
      priceBreakdown(p).final / p.msg_number <
      priceBreakdown(best).final / best.msg_number
        ? p
        : best,
    ).id;
  }, [list]);

  return (
    <>
      <div className="tabs" role="tablist" aria-label="Channel">
        <span
          className="pill"
          style={{
            transform: `translateX(${TABS.findIndex((t) => t.key === tab) * 100}%)`,
          }}
        />
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            className={tab === t.key ? "on" : ""}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error ? (
        <div className="state" role="alert">
          <p>We couldn't load the packages. {error}</p>
          <button
            className="btn ghost sm"
            onClick={() => setAttempt((n) => n + 1)}
          >
            Try again
          </button>
        </div>
      ) : !data ? (
        <Skeleton />
      ) : list.length === 0 ? (
        <div className="state">
          <p>
            No packages are available for this channel right now. Contact us and
            we'll set one up.
          </p>
        </div>
      ) : (
        <div className="plans" key={tab}>
          {list.map((p) => (
            <Plan
              key={p.id}
              pkg={p}
              recommended={p.id === bestId}
              onChoose={onChoose}
              lang={lang}
            />
          ))}
        </div>
      )}
    </>
  );
}
