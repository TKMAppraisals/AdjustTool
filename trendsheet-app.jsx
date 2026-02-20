import { useState, useCallback, useMemo, useEffect } from "react";

// ─── Utility Functions ───
const fmt = (n, decimals = 0) => {
  if (n === null || n === undefined || isNaN(n)) return "N/A";
  return Number(n).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};
const fmtCur = (n) => (isNaN(n) || n === null ? "N/A" : "$" + fmt(n));
const fmtPct = (n, d = 1) => (isNaN(n) || n === null ? "N/A" : (n * 100).toFixed(d) + "%");
const safeDivide = (a, b) => (b === 0 || isNaN(a) || isNaN(b) ? null : a / b);
const median = (arr) => {
  const s = arr.filter((x) => x != null && !isNaN(x)).sort((a, b) => a - b);
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const avg = (arr) => {
  const s = arr.filter((x) => x != null && !isNaN(x));
  return s.length ? s.reduce((a, b) => a + b, 0) / s.length : null;
};
const parseNum = (v) => { const n = parseFloat(v); return isNaN(n) ? null : n; };

const TABS = [
  { id: "subject", label: "Subject", icon: "🏠" },
  { id: "comps", label: "Comparables", icon: "📊" },
  { id: "adjustments", label: "Adjustments", icon: "⚖️" },
  { id: "trending", label: "Market Trends", icon: "📈" },
  { id: "reconciliation", label: "Reconciliation", icon: "🎯" },
  { id: "mls", label: "MLS Data", icon: "📋" },
];

const CONDITIONS = ["Excellent","Good +","Good","Moderate +","Moderate","Fair +","Fair","Poor +","Poor"];
const COND_AGES = [0, 5, 15, 22, 30, 37, 45, 50, 55];

const emptySubject = () => ({
  effectiveDate: new Date().toISOString().split("T")[0],
  salesPrice: "", siteSize: "", siteSizeUnit: "sf",
  yearBuilt: "", bedrooms: "", agFullBath: "", gla: "",
  bgFinSF: "", bgUnFinSF: "", bgBath: "",
  attachedGarage: "", carport: "", condition: "Good",
  designStyle: "", stories: "", pool: false,
});

const emptyComp = (i) => ({
  id: i, included: true, mlsNumber: "", address: "",
  salePrice: "", contractDate: "", closeDate: "",
  sqFt: "", yearBuilt: "", bedrooms: "", fullBath: "",
  gla: "", bgFinSF: "", bgUnFinSF: "", bgBath: "",
  garage: "", carport: "", siteSize: "", siteSizeUnit: "sf",
  stories: "", condition: "Good", designStyle: "", pool: false,
  dom: "", listPrice: "", concessions: "",
  weight: i < 3 ? "0.20" : "0.10",
  adjType: "", adjFinConc: "", adjDate: "", adjLocation: "",
  adjOwnership: "", adjLot: "", adjView: "", adjDesign: "",
  adjQuality: "", adjAge: "", adjCondition: "", adjRooms: "",
  adjBedroom: "", adjBath: "", adjGLA: "", adjBasement: "",
  adjBasement2: "", adjFunctional: "", adjHeatCool: "",
  adjEnergyEff: "", adjVehicle: "", adjPatio: "",
});

// ─── Components ───
const Card = ({ title, children, className = "", accent = false }) => (
  <div className={`card ${accent ? "card-accent" : ""} ${className}`}>
    {title && <div className="card-header">{title}</div>}
    <div className="card-body">{children}</div>
  </div>
);

const Field = ({ label, value, onChange, type = "text", options, unit, small, disabled, prefix }) => (
  <div className={`field ${small ? "field-sm" : ""}`}>
    <label>{label}</label>
    <div className="field-input-wrap">
      {prefix && <span className="field-prefix">{prefix}</span>}
      {options ? (
        <select value={value || ""} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
          {options.map((o) => <option key={typeof o === "string" ? o : o.value} value={typeof o === "string" ? o : o.value}>{typeof o === "string" ? o : o.label}</option>)}
        </select>
      ) : type === "checkbox" ? (
        <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} disabled={disabled} />
      ) : (
        <input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} disabled={disabled}
          className={prefix ? "has-prefix" : ""} />
      )}
      {unit && <span className="field-unit">{unit}</span>}
    </div>
  </div>
);

const StatBox = ({ label, value, sub, color }) => (
  <div className="stat-box" style={color ? { borderLeftColor: color } : {}}>
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
    {sub && <div className="stat-sub">{sub}</div>}
  </div>
);

// ─── Subject Tab ───
function SubjectTab({ subject, setSubject }) {
  const up = (k, v) => setSubject((p) => ({ ...p, [k]: v }));
  return (
    <div className="tab-content">
      <div className="section-grid">
        <Card title="Property Info">
          <Field label="Effective Date" value={subject.effectiveDate} onChange={(v) => up("effectiveDate", v)} type="date" />
          <Field label="Sales Price" value={subject.salesPrice} onChange={(v) => up("salesPrice", v)} type="number" prefix="$" />
          <Field label="Design / Style" value={subject.designStyle} onChange={(v) => up("designStyle", v)} />
          <Field label="Stories" value={subject.stories} onChange={(v) => up("stories", v)} type="number" />
          <Field label="Pool" value={subject.pool} onChange={(v) => up("pool", v)} type="checkbox" />
        </Card>
        <Card title="Site & Structure">
          <div className="field-row">
            <Field label="Site Size" value={subject.siteSize} onChange={(v) => up("siteSize", v)} type="number" />
            <Field label="Unit" value={subject.siteSizeUnit} onChange={(v) => up("siteSizeUnit", v)}
              options={[{ value: "sf", label: "Sq Ft" }, { value: "acres", label: "Acres" }]} small />
          </div>
          <Field label="Year Built" value={subject.yearBuilt} onChange={(v) => up("yearBuilt", v)} type="number" />
          <Field label="Condition" value={subject.condition} onChange={(v) => up("condition", v)} options={CONDITIONS} />
          <Field label="GLA (Above Grade)" value={subject.gla} onChange={(v) => up("gla", v)} type="number" unit="sf" />
        </Card>
        <Card title="Room Count">
          <Field label="Bedrooms" value={subject.bedrooms} onChange={(v) => up("bedrooms", v)} type="number" />
          <Field label="Full Baths (AG)" value={subject.agFullBath} onChange={(v) => up("agFullBath", v)} type="number" />
        </Card>
        <Card title="Below Grade">
          <Field label="Finished SF" value={subject.bgFinSF} onChange={(v) => up("bgFinSF", v)} type="number" unit="sf" />
          <Field label="Unfinished SF" value={subject.bgUnFinSF} onChange={(v) => up("bgUnFinSF", v)} type="number" unit="sf" />
          <Field label="BG Baths" value={subject.bgBath} onChange={(v) => up("bgBath", v)} type="number" />
        </Card>
        <Card title="Vehicle Storage">
          <Field label="Attached Garage" value={subject.attachedGarage} onChange={(v) => up("attachedGarage", v)} type="number" />
          <Field label="Carport" value={subject.carport} onChange={(v) => up("carport", v)} type="number" />
        </Card>
      </div>
    </div>
  );
}

// ─── Comps Tab ───
function CompsTab({ comps, setComps, subject }) {
  const upComp = (i, k, v) => setComps((p) => p.map((c, j) => (j === i ? { ...c, [k]: v } : c)));
  const addComp = () => setComps((p) => [...p, emptyComp(p.length)]);
  const removeComp = (i) => setComps((p) => p.filter((_, j) => j !== i));

  return (
    <div className="tab-content">
      <div className="comp-actions">
        <button className="btn btn-primary" onClick={addComp}>+ Add Comparable</button>
        <span className="comp-count">{comps.length} comparable{comps.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="comp-list">
        {comps.map((c, i) => (
          <Card key={i} title={
            <div className="comp-header-row">
              <label className="comp-include">
                <input type="checkbox" checked={c.included} onChange={(e) => upComp(i, "included", e.target.checked)} />
                <span>Comp {i + 1}</span>
              </label>
              <span className="comp-addr">{c.address || "No address"}</span>
              {comps.length > 1 && <button className="btn-icon btn-remove" onClick={() => removeComp(i)}>✕</button>}
            </div>
          } className={c.included ? "" : "comp-excluded"}>
            <div className="comp-grid">
              <Field label="MLS #" value={c.mlsNumber} onChange={(v) => upComp(i, "mlsNumber", v)} small />
              <Field label="Address" value={c.address} onChange={(v) => upComp(i, "address", v)} small />
              <Field label="Sale Price" value={c.salePrice} onChange={(v) => upComp(i, "salePrice", v)} type="number" prefix="$" small />
              <Field label="Contract Date" value={c.contractDate} onChange={(v) => upComp(i, "contractDate", v)} type="date" small />
              <Field label="Close Date" value={c.closeDate} onChange={(v) => upComp(i, "closeDate", v)} type="date" small />
              <Field label="List Price" value={c.listPrice} onChange={(v) => upComp(i, "listPrice", v)} type="number" prefix="$" small />
              <Field label="DOM" value={c.dom} onChange={(v) => upComp(i, "dom", v)} type="number" small />
              <Field label="GLA" value={c.gla} onChange={(v) => upComp(i, "gla", v)} type="number" unit="sf" small />
              <Field label="Year Built" value={c.yearBuilt} onChange={(v) => upComp(i, "yearBuilt", v)} type="number" small />
              <Field label="Bedrooms" value={c.bedrooms} onChange={(v) => upComp(i, "bedrooms", v)} type="number" small />
              <Field label="Full Baths" value={c.fullBath} onChange={(v) => upComp(i, "fullBath", v)} type="number" small />
              <Field label="Stories" value={c.stories} onChange={(v) => upComp(i, "stories", v)} type="number" small />
              <div className="field-row">
                <Field label="Site Size" value={c.siteSize} onChange={(v) => upComp(i, "siteSize", v)} type="number" small />
                <Field label="" value={c.siteSizeUnit} onChange={(v) => upComp(i, "siteSizeUnit", v)}
                  options={[{ value: "sf", label: "SF" }, { value: "acres", label: "Ac" }]} small />
              </div>
              <Field label="Condition" value={c.condition} onChange={(v) => upComp(i, "condition", v)} options={CONDITIONS} small />
              <Field label="Garage" value={c.garage} onChange={(v) => upComp(i, "garage", v)} type="number" small />
              <Field label="Carport" value={c.carport} onChange={(v) => upComp(i, "carport", v)} type="number" small />
              <Field label="Concessions" value={c.concessions} onChange={(v) => upComp(i, "concessions", v)} type="number" prefix="$" small />
              <Field label="BG Fin SF" value={c.bgFinSF} onChange={(v) => upComp(i, "bgFinSF", v)} type="number" small />
              <Field label="BG UnFin SF" value={c.bgUnFinSF} onChange={(v) => upComp(i, "bgUnFinSF", v)} type="number" small />
              <Field label="BG Bath" value={c.bgBath} onChange={(v) => upComp(i, "bgBath", v)} type="number" small />
              <Field label="Pool" value={c.pool} onChange={(v) => upComp(i, "pool", v)} type="checkbox" small />
              <Field label="Weight %" value={c.weight} onChange={(v) => upComp(i, "weight", v)} type="number" small />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Adjustments Tab ───
function AdjustmentsTab({ comps, setComps, subject, config, setConfig }) {
  const upComp = (i, k, v) => setComps((p) => p.map((c, j) => (j === i ? { ...c, [k]: v } : c)));
  const upCfg = (k, v) => setConfig((p) => ({ ...p, [k]: v }));
  const active = comps.filter((c) => c.included);

  const adjRows = [
    { key: "adjType", label: "Sale Type" },
    { key: "adjFinConc", label: "Financing / Concessions" },
    { key: "adjDate", label: "Date of Sale" },
    { key: "adjLocation", label: "Location" },
    { key: "adjOwnership", label: "Ownership" },
    { key: "adjLot", label: "Lot Size", auto: true },
    { key: "adjView", label: "View" },
    { key: "adjDesign", label: "Design / Style" },
    { key: "adjQuality", label: "Quality" },
    { key: "adjAge", label: "Age", auto: true },
    { key: "adjCondition", label: "Condition" },
    { key: "adjRooms", label: "Rooms" },
    { key: "adjBedroom", label: "Bedrooms", auto: true },
    { key: "adjBath", label: "Baths", auto: true },
    { key: "adjGLA", label: "GLA", auto: true },
    { key: "adjBasement", label: "Basement (Fin)" },
    { key: "adjBasement2", label: "Basement (Unfin)" },
    { key: "adjFunctional", label: "Functional" },
    { key: "adjHeatCool", label: "Heating / Cooling" },
    { key: "adjEnergyEff", label: "Energy Efficiency" },
    { key: "adjVehicle", label: "Vehicle Storage", auto: true },
    { key: "adjPatio", label: "Patio / Deck" },
  ];

  const getAdjTotal = (c) => adjRows.reduce((s, r) => s + (parseNum(c[r.key]) || 0), 0);
  const getAdjPrice = (c) => (parseNum(c.salePrice) || 0) + getAdjTotal(c);

  return (
    <div className="tab-content">
      <Card title="Adjustment Configuration" className="config-card">
        <div className="config-grid">
          <Field label="GLA $/SF" value={config.glaPSF} onChange={(v) => upCfg("glaPSF", v)} type="number" small />
          <Field label="BG Fin %" value={config.bgFinPct} onChange={(v) => upCfg("bgFinPct", v)} type="number" small />
          <Field label="BG Unfin %" value={config.bgUnfinPct} onChange={(v) => upCfg("bgUnfinPct", v)} type="number" small />
          <Field label="Bath Contrib %" value={config.bathPct} onChange={(v) => upCfg("bathPct", v)} type="number" small />
          <Field label="Garage $/unit" value={config.garagePerUnit} onChange={(v) => upCfg("garagePerUnit", v)} type="number" small />
          <Field label="Carport $/unit" value={config.carportPerUnit} onChange={(v) => upCfg("carportPerUnit", v)} type="number" small />
          <Field label="Age $/year" value={config.agePerYear} onChange={(v) => upCfg("agePerYear", v)} type="number" small />
          <Field label="Bedroom $/unit" value={config.bedroomPerUnit} onChange={(v) => upCfg("bedroomPerUnit", v)} type="number" small />
          <Field label="Lot $/sf" value={config.lotPerSF} onChange={(v) => upCfg("lotPerSF", v)} type="number" small />
        </div>
      </Card>

      <div className="adj-table-wrap">
        <table className="adj-table">
          <thead>
            <tr>
              <th className="adj-label-col">Adjustment</th>
              <th className="adj-subj-col">Subject</th>
              {active.map((c, i) => <th key={i}>Comp {comps.indexOf(c) + 1}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr className="adj-price-row">
              <td>Sale Price</td>
              <td className="adj-subj">{fmtCur(parseNum(subject.salesPrice))}</td>
              {active.map((c, i) => <td key={i}>{fmtCur(parseNum(c.salePrice))}</td>)}
            </tr>
            {adjRows.map((r) => (
              <tr key={r.key} className={r.auto ? "adj-auto-row" : ""}>
                <td className="adj-label">{r.label} {r.auto && <span className="auto-badge">calc</span>}</td>
                <td className="adj-subj">—</td>
                {active.map((c, ci) => (
                  <td key={ci}>
                    <input type="number" className="adj-input" value={c[r.key] || ""}
                      onChange={(e) => upComp(comps.indexOf(c), r.key, e.target.value)}
                      placeholder="0" />
                  </td>
                ))}
              </tr>
            ))}
            <tr className="adj-total-row">
              <td>Net Adjustment</td>
              <td></td>
              {active.map((c, i) => {
                const t = getAdjTotal(c);
                return <td key={i} className={t > 0 ? "pos" : t < 0 ? "neg" : ""}>{fmtCur(t)}</td>;
              })}
            </tr>
            <tr className="adj-total-row adj-final-row">
              <td>Adjusted Price</td>
              <td></td>
              {active.map((c, i) => <td key={i}><strong>{fmtCur(getAdjPrice(c))}</strong></td>)}
            </tr>
            <tr className="adj-total-row">
              <td>Adj. $/SF</td>
              <td></td>
              {active.map((c, i) => {
                const gla = parseNum(c.gla);
                return <td key={i}>{gla ? fmtCur(Math.round(getAdjPrice(c) / gla)) : "N/A"}</td>;
              })}
            </tr>
            <tr className="adj-total-row">
              <td>Net Adj. %</td>
              <td></td>
              {active.map((c, i) => {
                const sp = parseNum(c.salePrice);
                return <td key={i}>{sp ? fmtPct(getAdjTotal(c) / sp) : "N/A"}</td>;
              })}
            </tr>
            <tr className="adj-total-row">
              <td>Gross Adj. %</td>
              <td></td>
              {active.map((c, i) => {
                const sp = parseNum(c.salePrice);
                const gross = adjRows.reduce((s, r) => s + Math.abs(parseNum(c[r.key]) || 0), 0);
                return <td key={i}>{sp ? fmtPct(gross / sp) : "N/A"}</td>;
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Market Trends Tab ───
function TrendingTab({ mlsData, subject }) {
  const sales = mlsData.filter((r) => r.status && r.status.toLowerCase().includes("s") && r.salePrice);
  const listings = mlsData.filter((r) => r.status && (r.status.toLowerCase().includes("act") || r.status.toLowerCase().includes("a")));

  const effDate = new Date(subject.effectiveDate);
  const getQuarter = (d, qMonths) => {
    const start = new Date(effDate);
    start.setMonth(start.getMonth() - qMonths);
    const end = new Date(effDate);
    end.setMonth(end.getMonth() - (qMonths - 3));
    return sales.filter((s) => {
      const cd = new Date(s.closeDate);
      return cd >= start && cd < end;
    });
  };

  const quarters = [
    { label: "0-3 Mo", data: getQuarter(3) },
    { label: "4-6 Mo", data: getQuarter(6) },
    { label: "7-9 Mo", data: getQuarter(9) },
    { label: "10-12 Mo", data: getQuarter(12) },
  ];

  const totalSales = sales.length;
  const totalListings = listings.length;
  const absRate = totalSales > 0 ? (totalSales / 12).toFixed(1) : "N/A";
  const monthsSupply = totalSales > 0 && totalListings > 0 ? (totalListings / (totalSales / 12)).toFixed(1) : "N/A";

  return (
    <div className="tab-content">
      <div className="stats-row">
        <StatBox label="Total Sales (12 Mo)" value={totalSales} color="#2563eb" />
        <StatBox label="Active Listings" value={totalListings} color="#059669" />
        <StatBox label="Absorption Rate" value={absRate} sub="sales/month" color="#7c3aed" />
        <StatBox label="Months Supply" value={monthsSupply} color="#dc2626" />
      </div>

      <Card title="Quarterly Trend Analysis">
        {quarters.length > 0 ? (
          <table className="trend-table">
            <thead>
              <tr>
                <th>Period</th>
                <th># Sales</th>
                <th>Avg $/SF</th>
                <th>Avg Price</th>
                <th>Median Price</th>
                <th>Median DOM</th>
              </tr>
            </thead>
            <tbody>
              {quarters.map((q, i) => {
                const prices = q.data.map((s) => parseNum(s.salePrice)).filter(Boolean);
                const ppsf = q.data.map((s) => {
                  const p = parseNum(s.salePrice), g = parseNum(s.gla);
                  return p && g ? p / g : null;
                }).filter(Boolean);
                const doms = q.data.map((s) => parseNum(s.dom)).filter(Boolean);
                return (
                  <tr key={i}>
                    <td>{q.label}</td>
                    <td>{q.data.length}</td>
                    <td>{fmtCur(Math.round(avg(ppsf) || 0))}</td>
                    <td>{fmtCur(Math.round(avg(prices) || 0))}</td>
                    <td>{fmtCur(Math.round(median(prices) || 0))}</td>
                    <td>{fmt(Math.round(median(doms) || 0))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p>📋 Paste MLS data in the "MLS Data" tab to generate trend analysis</p>
          </div>
        )}
      </Card>

      {sales.length > 0 && (
        <Card title="Price Distribution (Sales)">
          <div className="mini-chart">
            {(() => {
              const prices = sales.map(s => parseNum(s.salePrice)).filter(Boolean).sort((a,b) => a-b);
              const mn = prices[0], mx = prices[prices.length-1], range = mx - mn || 1;
              const bucketCount = 10;
              const bucketSize = range / bucketCount;
              const buckets = Array(bucketCount).fill(0);
              prices.forEach(p => { const idx = Math.min(Math.floor((p - mn) / bucketSize), bucketCount - 1); buckets[idx]++; });
              const maxB = Math.max(...buckets);
              return (
                <div className="bar-chart">
                  {buckets.map((b, i) => (
                    <div key={i} className="bar-col">
                      <div className="bar" style={{ height: `${(b / maxB) * 100}%` }}>
                        {b > 0 && <span className="bar-label">{b}</span>}
                      </div>
                      <div className="bar-x">{fmtCur(Math.round(mn + i * bucketSize) / 1000)}k</div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Reconciliation Tab ───
function ReconciliationTab({ comps, subject, setComps }) {
  const active = comps.filter((c) => c.included);
  const adjRows = [
    "adjType","adjFinConc","adjDate","adjLocation","adjOwnership","adjLot","adjView",
    "adjDesign","adjQuality","adjAge","adjCondition","adjRooms","adjBedroom","adjBath",
    "adjGLA","adjBasement","adjBasement2","adjFunctional","adjHeatCool","adjEnergyEff","adjVehicle","adjPatio",
  ];
  const getAdjTotal = (c) => adjRows.reduce((s, r) => s + (parseNum(c[r]) || 0), 0);
  const getAdjPrice = (c) => (parseNum(c.salePrice) || 0) + getAdjTotal(c);

  const adjPrices = active.map(getAdjPrice).filter((p) => p > 0);
  const avgAdjPrice = avg(adjPrices);
  const medAdjPrice = median(adjPrices);
  const minAdj = adjPrices.length ? Math.min(...adjPrices) : null;
  const maxAdj = adjPrices.length ? Math.max(...adjPrices) : null;
  const range = minAdj && maxAdj ? maxAdj - minAdj : null;

  const totalWeight = active.reduce((s, c) => s + (parseNum(c.weight) || 0), 0);
  const weightedValue = totalWeight > 0
    ? active.reduce((s, c) => s + getAdjPrice(c) * (parseNum(c.weight) || 0), 0) / totalWeight
    : null;

  // GLA analysis
  const compPricesPerSF = active.map((c) => {
    const gla = parseNum(c.gla), adjP = getAdjPrice(c);
    return gla && adjP ? adjP / gla : null;
  }).filter(Boolean);

  return (
    <div className="tab-content">
      <div className="stats-row">
        <StatBox label="Weighted Value" value={fmtCur(Math.round(weightedValue || 0))} color="#2563eb" />
        <StatBox label="Avg Adjusted" value={fmtCur(Math.round(avgAdjPrice || 0))} color="#059669" />
        <StatBox label="Median Adjusted" value={fmtCur(Math.round(medAdjPrice || 0))} color="#7c3aed" />
        <StatBox label="Range" value={fmtCur(Math.round(range || 0))} color="#dc2626" />
      </div>

      <div className="section-grid cols-2">
        <Card title="Comparable Weighting">
          <table className="recon-table">
            <thead>
              <tr><th>Comp</th><th>Adj. Price</th><th>Weight</th><th>Contribution</th></tr>
            </thead>
            <tbody>
              {active.map((c, i) => {
                const ap = getAdjPrice(c);
                const w = parseNum(c.weight) || 0;
                return (
                  <tr key={i}>
                    <td>Comp {comps.indexOf(c) + 1}</td>
                    <td>{fmtCur(Math.round(ap))}</td>
                    <td>
                      <input type="number" className="adj-input" value={c.weight}
                        onChange={(e) => {
                          const idx = comps.indexOf(c);
                          setComps((p) => p.map((cc, j) => j === idx ? { ...cc, weight: e.target.value } : cc));
                        }} step="0.05" style={{ width: 60 }} />
                    </td>
                    <td>{fmtCur(Math.round(ap * w))}</td>
                  </tr>
                );
              })}
              <tr className="total-row">
                <td>Total</td>
                <td></td>
                <td className={Math.abs(totalWeight - 1) < 0.01 ? "pos" : "neg"}>{fmtPct(totalWeight)}</td>
                <td><strong>{fmtCur(Math.round(weightedValue || 0))}</strong></td>
              </tr>
            </tbody>
          </table>
        </Card>

        <Card title="GLA Adjustment Analysis">
          <div className="mini-stats">
            <div><span>Min $/SF:</span> {fmtCur(Math.round(Math.min(...(compPricesPerSF.length ? compPricesPerSF : [0]))))}</div>
            <div><span>Max $/SF:</span> {fmtCur(Math.round(Math.max(...(compPricesPerSF.length ? compPricesPerSF : [0]))))}</div>
            <div><span>Avg $/SF:</span> {fmtCur(Math.round(avg(compPricesPerSF) || 0))}</div>
            <div><span>Median $/SF:</span> {fmtCur(Math.round(median(compPricesPerSF) || 0))}</div>
          </div>
        </Card>
      </div>

      <Card title="Value Indicators Summary" accent>
        <div className="value-summary">
          <div className="value-row">
            <span>Reconciled (Weighted):</span>
            <strong className="big-value">{fmtCur(Math.round(weightedValue || 0))}</strong>
          </div>
          <div className="value-row">
            <span>Average Adjusted:</span>
            <span>{fmtCur(Math.round(avgAdjPrice || 0))}</span>
          </div>
          <div className="value-row">
            <span>Median Adjusted:</span>
            <span>{fmtCur(Math.round(medAdjPrice || 0))}</span>
          </div>
          <div className="value-row">
            <span>Indicated Range:</span>
            <span>{fmtCur(Math.round(minAdj || 0))} – {fmtCur(Math.round(maxAdj || 0))}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── MLS Data Tab ───
function MLSDataTab({ mlsData, setMlsData }) {
  const [rawText, setRawText] = useState("");

  const parseMLS = useCallback(() => {
    if (!rawText.trim()) return;
    const lines = rawText.trim().split("\n");
    if (lines.length < 2) return;
    const headers = lines[0].split("\t").map((h) => h.trim());
    const findCol = (keywords) => headers.findIndex((h) => keywords.some((k) => h.toLowerCase().includes(k.toLowerCase())));

    const colMap = {
      mlsNumber: findCol(["MLS", "Listing #", "Listing Number"]),
      status: findCol(["Status"]),
      listPrice: findCol(["List Price", "Orig Price"]),
      salePrice: findCol(["Sold Price", "Sale Price", "Sold"]),
      listDate: findCol(["List Date", "Lst Date"]),
      closeDate: findCol(["Close Date", "Closing Date"]),
      dom: findCol(["DOM", "Days on Market"]),
      pendDate: findCol(["Pend Date", "Pending", "Contract"]),
      gla: findCol(["GLA", "SqFt", "ApxFinSqft", "Livable"]),
      yearBuilt: findCol(["Year Built", "Year"]),
      acres: findCol(["Acres", "Lot Size"]),
      bedrooms: findCol(["Bed", "Beds"]),
      baths: findCol(["Bath", "Baths"]),
      garage: findCol(["Garage Cap", "Garage Count", "Garage"]),
      garageType: findCol(["Garage Type"]),
      pool: findCol(["Pool", "In-Ground"]),
      concessions: findCol(["Concessions", "ClsContrib"]),
      reo: findCol(["REO", "FC", "Foreclosure"]),
      shortSale: findCol(["Short Sale"]),
      stories: findCol(["Stories", "Level"]),
    };

    const parsed = lines.slice(1).map((line) => {
      const cols = line.split("\t");
      const get = (key) => (colMap[key] >= 0 ? cols[colMap[key]]?.trim() || "" : "");
      return {
        mlsNumber: get("mlsNumber"),
        status: get("status"),
        listPrice: get("listPrice").replace(/[$,]/g, ""),
        salePrice: get("salePrice").replace(/[$,]/g, ""),
        listDate: get("listDate"),
        closeDate: get("closeDate"),
        dom: get("dom"),
        pendDate: get("pendDate"),
        gla: get("gla").replace(/,/g, ""),
        yearBuilt: get("yearBuilt"),
        acres: get("acres"),
        bedrooms: get("bedrooms"),
        baths: get("baths"),
        garage: get("garage"),
        garageType: get("garageType"),
        pool: get("pool"),
        concessions: get("concessions").replace(/[$,]/g, ""),
        reo: get("reo"),
        shortSale: get("shortSale"),
        stories: get("stories"),
      };
    }).filter((r) => r.mlsNumber || r.salePrice || r.listPrice);

    setMlsData(parsed);
  }, [rawText, setMlsData]);

  return (
    <div className="tab-content">
      <Card title="Import MLS Data">
        <p className="help-text">Paste tab-delimited MLS data below. The first row should contain column headers. This supports the same format as your TrendSheet's paste areas.</p>
        <textarea className="mls-input" rows={10} value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder={"MLS #\tStatus\tList Price\tSold Price\tList Date\tClose Date\tDOM\tGLA\tYear Built\t...\n12345\tSLD\t350000\t345000\t2024-01-15\t2024-03-01\t45\t1800\t2005\t..."} />
        <div className="mls-actions">
          <button className="btn btn-primary" onClick={parseMLS}>Import Data</button>
          <button className="btn btn-secondary" onClick={() => { setRawText(""); setMlsData([]); }}>Clear</button>
          <span className="mls-count">{mlsData.length} records loaded</span>
        </div>
      </Card>

      {mlsData.length > 0 && (
        <Card title={`MLS Records (${mlsData.length})`}>
          <div className="mls-table-wrap">
            <table className="mls-table">
              <thead>
                <tr>
                  <th>MLS #</th><th>Status</th><th>List $</th><th>Sale $</th>
                  <th>Close</th><th>DOM</th><th>GLA</th><th>YrBlt</th>
                  <th>Beds</th><th>Baths</th><th>$/SF</th>
                </tr>
              </thead>
              <tbody>
                {mlsData.slice(0, 100).map((r, i) => {
                  const sp = parseNum(r.salePrice), gla = parseNum(r.gla);
                  return (
                    <tr key={i}>
                      <td>{r.mlsNumber}</td>
                      <td><span className={`status-badge status-${r.status?.toLowerCase()?.substring(0, 3)}`}>{r.status}</span></td>
                      <td>{fmtCur(parseNum(r.listPrice))}</td>
                      <td>{fmtCur(sp)}</td>
                      <td>{r.closeDate}</td>
                      <td>{r.dom}</td>
                      <td>{fmt(parseNum(r.gla))}</td>
                      <td>{r.yearBuilt}</td>
                      <td>{r.bedrooms}</td>
                      <td>{r.baths}</td>
                      <td>{sp && gla ? fmtCur(Math.round(sp / gla)) : "N/A"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {mlsData.length > 100 && <p className="help-text">Showing first 100 of {mlsData.length} records</p>}
        </Card>
      )}
    </div>
  );
}

// ─── Main App ───
export default function TrendSheetApp() {
  const [activeTab, setActiveTab] = useState("subject");
  const [subject, setSubject] = useState(emptySubject);
  const [comps, setComps] = useState(() => Array.from({ length: 6 }, (_, i) => emptyComp(i)));
  const [mlsData, setMlsData] = useState([]);
  const [config, setConfig] = useState({
    glaPSF: "45", bgFinPct: "65", bgUnfinPct: "25", bathPct: "10",
    garagePerUnit: "5000", carportPerUnit: "2500", agePerYear: "500",
    bedroomPerUnit: "2000", lotPerSF: "1",
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="app-shell">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #0d1117;
          --surface: #161b22;
          --surface-2: #1c2128;
          --surface-3: #21262d;
          --border: #30363d;
          --border-light: #21262d;
          --text: #e6edf3;
          --text-dim: #8b949e;
          --text-muted: #6e7681;
          --accent: #58a6ff;
          --accent-dim: #1f6feb;
          --green: #3fb950;
          --green-dim: #238636;
          --red: #f85149;
          --red-dim: #da3633;
          --orange: #d29922;
          --purple: #bc8cff;
          --mono: 'JetBrains Mono', monospace;
          --sans: 'DM Sans', -apple-system, sans-serif;
          --radius: 8px;
          --radius-lg: 12px;
        }

        body { background: var(--bg); color: var(--text); }

        .app-shell {
          font-family: var(--sans);
          min-height: 100vh;
          background: var(--bg);
          color: var(--text);
          display: flex;
          flex-direction: column;
        }

        /* ── Header ── */
        .app-header {
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          padding: 0 24px;
          height: 60px;
          display: flex;
          align-items: center;
          gap: 16px;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .app-logo {
          font-weight: 700;
          font-size: 18px;
          letter-spacing: -0.5px;
          color: var(--accent);
          white-space: nowrap;
        }
        .app-logo span { color: var(--text-dim); font-weight: 400; }
        .mobile-menu-btn {
          display: none;
          background: none; border: none; color: var(--text);
          font-size: 24px; cursor: pointer; padding: 4px;
        }

        /* ── Nav ── */
        .nav-tabs {
          display: flex;
          gap: 2px;
          margin-left: auto;
          background: var(--surface-2);
          border-radius: var(--radius);
          padding: 3px;
        }
        .nav-tab {
          background: none;
          border: none;
          color: var(--text-dim);
          font-family: var(--sans);
          font-size: 13px;
          font-weight: 500;
          padding: 8px 14px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .nav-tab:hover { color: var(--text); background: var(--surface-3); }
        .nav-tab.active {
          background: var(--accent-dim);
          color: #fff;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
        .nav-tab .tab-icon { font-size: 14px; }

        /* ── Main ── */
        .app-main { flex: 1; padding: 24px; max-width: 1400px; margin: 0 auto; width: 100%; }

        /* ── Cards ── */
        .card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          margin-bottom: 16px;
        }
        .card-accent { border-color: var(--accent-dim); }
        .card-header {
          padding: 14px 20px;
          font-weight: 600;
          font-size: 14px;
          border-bottom: 1px solid var(--border);
          background: var(--surface-2);
          letter-spacing: -0.2px;
        }
        .card-body { padding: 16px 20px; }

        /* ── Fields ── */
        .field { margin-bottom: 12px; }
        .field label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-dim);
          margin-bottom: 4px;
          letter-spacing: 0.3px;
          text-transform: uppercase;
        }
        .field-input-wrap {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .field-prefix {
          color: var(--text-muted);
          font-size: 14px;
          font-family: var(--mono);
        }
        .field input[type="text"], .field input[type="number"], .field input[type="date"], .field select {
          width: 100%;
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 8px 10px;
          color: var(--text);
          font-family: var(--sans);
          font-size: 14px;
          outline: none;
          transition: border-color 0.15s;
        }
        .field input:focus, .field select:focus { border-color: var(--accent); }
        .field input.has-prefix { padding-left: 4px; }
        .field-unit {
          color: var(--text-muted);
          font-size: 12px;
          font-family: var(--mono);
          margin-left: 4px;
        }
        .field-sm { margin-bottom: 8px; }
        .field-sm label { font-size: 11px; margin-bottom: 2px; }
        .field-sm input, .field-sm select { padding: 6px 8px; font-size: 13px; }
        .field-row { display: flex; gap: 8px; }
        .field-row .field { flex: 1; }
        .field input[type="checkbox"] { width: auto; accent-color: var(--accent); }

        /* ── Grids ── */
        .section-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }
        .section-grid .card { margin-bottom: 0; }
        .cols-2 { grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); }

        /* ── Stats ── */
        .stats-row { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin-bottom: 20px; }
        .stat-box {
          background: var(--surface);
          border: 1px solid var(--border);
          border-left: 3px solid var(--accent);
          border-radius: var(--radius);
          padding: 16px;
        }
        .stat-value { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; font-family: var(--mono); }
        .stat-label { font-size: 12px; color: var(--text-dim); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.3px; }
        .stat-sub { font-size: 11px; color: var(--text-muted); margin-top: 2px; }

        /* ── Comp ── */
        .comp-actions { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .comp-count { color: var(--text-dim); font-size: 13px; }
        .comp-header-row { display: flex; align-items: center; gap: 12px; width: 100%; }
        .comp-include { display: flex; align-items: center; gap: 6px; font-weight: 600; cursor: pointer; }
        .comp-include input { accent-color: var(--accent); }
        .comp-addr { color: var(--text-dim); font-weight: 400; font-size: 13px; flex: 1; }
        .comp-excluded { opacity: 0.4; }
        .comp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 8px;
        }
        .btn-icon { background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px 8px; border-radius: 4px; }
        .btn-remove { color: var(--red); }
        .btn-remove:hover { background: rgba(248,81,73,0.1); }

        /* ── Buttons ── */
        .btn {
          font-family: var(--sans);
          font-size: 13px;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 6px;
          border: 1px solid var(--border);
          cursor: pointer;
          transition: all 0.15s;
        }
        .btn-primary { background: var(--accent-dim); color: #fff; border-color: var(--accent-dim); }
        .btn-primary:hover { background: var(--accent); }
        .btn-secondary { background: var(--surface-2); color: var(--text); }
        .btn-secondary:hover { background: var(--surface-3); }

        /* ── Adjustment Table ── */
        .adj-table-wrap { overflow-x: auto; }
        .adj-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .adj-table th, .adj-table td {
          padding: 8px 12px;
          border: 1px solid var(--border);
          text-align: right;
          white-space: nowrap;
        }
        .adj-table th {
          background: var(--surface-2);
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          color: var(--text-dim);
          position: sticky;
          top: 0;
        }
        .adj-label-col { text-align: left !important; min-width: 160px; }
        .adj-subj-col { min-width: 100px; }
        .adj-label { text-align: left !important; font-weight: 500; }
        .adj-subj { color: var(--text-muted); font-family: var(--mono); font-size: 12px; }
        .adj-price-row { background: var(--surface-2); }
        .adj-price-row td { font-family: var(--mono); font-weight: 600; }
        .adj-auto-row { background: rgba(88,166,255,0.03); }
        .auto-badge {
          font-size: 9px;
          background: var(--accent-dim);
          color: var(--accent);
          padding: 1px 5px;
          border-radius: 3px;
          margin-left: 4px;
          vertical-align: middle;
        }
        .adj-input {
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 4px 6px;
          color: var(--text);
          font-family: var(--mono);
          font-size: 13px;
          width: 90px;
          text-align: right;
          outline: none;
        }
        .adj-input:focus { border-color: var(--accent); }
        .adj-total-row { background: var(--surface-2); font-weight: 600; }
        .adj-total-row td { font-family: var(--mono); }
        .adj-final-row td { font-size: 14px; }
        .pos { color: var(--green); }
        .neg { color: var(--red); }

        /* ── Config ── */
        .config-card .card-body { padding: 12px 20px; }
        .config-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 8px;
        }

        /* ── Trend Table ── */
        .trend-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .trend-table th, .trend-table td { padding: 10px 14px; text-align: right; border-bottom: 1px solid var(--border); }
        .trend-table th { text-align: right; font-size: 11px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.3px; }
        .trend-table th:first-child, .trend-table td:first-child { text-align: left; }
        .trend-table td { font-family: var(--mono); font-size: 13px; }

        /* ── Recon Table ── */
        .recon-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .recon-table th, .recon-table td { padding: 10px 12px; border-bottom: 1px solid var(--border); text-align: right; }
        .recon-table th { font-size: 11px; color: var(--text-dim); text-transform: uppercase; }
        .recon-table th:first-child, .recon-table td:first-child { text-align: left; }
        .recon-table td { font-family: var(--mono); }
        .total-row { background: var(--surface-2); font-weight: 600; }
        .total-row td { border-top: 2px solid var(--border); }

        /* ── MLS ── */
        .mls-input {
          width: 100%;
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 12px;
          color: var(--text);
          font-family: var(--mono);
          font-size: 12px;
          resize: vertical;
          outline: none;
        }
        .mls-input:focus { border-color: var(--accent); }
        .mls-actions { display: flex; gap: 8px; margin-top: 12px; align-items: center; }
        .mls-count { color: var(--text-dim); font-size: 13px; margin-left: auto; }
        .mls-table-wrap { overflow-x: auto; max-height: 500px; overflow-y: auto; }
        .mls-table { width: 100%; border-collapse: collapse; font-size: 12px; }
        .mls-table th { position: sticky; top: 0; background: var(--surface-2); font-size: 10px; color: var(--text-dim);
          text-transform: uppercase; letter-spacing: 0.3px; padding: 8px 10px; text-align: right; border-bottom: 2px solid var(--border); }
        .mls-table th:first-child, .mls-table td:first-child { text-align: left; }
        .mls-table td { padding: 6px 10px; border-bottom: 1px solid var(--border-light); font-family: var(--mono); text-align: right; }
        .status-badge {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .status-sld { background: rgba(63,185,80,0.15); color: var(--green); }
        .status-act { background: rgba(88,166,255,0.15); color: var(--accent); }
        .status-pnd, .status-pen { background: rgba(210,153,34,0.15); color: var(--orange); }

        /* ── Chart ── */
        .mini-chart { padding: 8px 0; }
        .bar-chart { display: flex; align-items: flex-end; gap: 4px; height: 120px; }
        .bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; }
        .bar {
          width: 100%;
          background: linear-gradient(to top, var(--accent-dim), var(--accent));
          border-radius: 3px 3px 0 0;
          min-height: 2px;
          position: relative;
          transition: height 0.3s;
        }
        .bar-label {
          position: absolute;
          top: -18px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 10px;
          font-family: var(--mono);
          color: var(--text-dim);
        }
        .bar-x { font-size: 9px; color: var(--text-muted); margin-top: 4px; font-family: var(--mono); }

        /* ── Misc ── */
        .mini-stats { display: flex; flex-direction: column; gap: 8px; }
        .mini-stats div { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border-light); font-size: 13px; }
        .mini-stats span { color: var(--text-dim); }
        .value-summary { display: flex; flex-direction: column; gap: 12px; }
        .value-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border-light); }
        .value-row span:first-child { color: var(--text-dim); }
        .big-value { font-size: 20px; color: var(--accent); font-family: var(--mono); }
        .help-text { font-size: 13px; color: var(--text-dim); margin-bottom: 12px; line-height: 1.5; }
        .empty-state { text-align: center; padding: 40px; color: var(--text-muted); }
        .empty-state p { font-size: 14px; }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .app-header { padding: 0 12px; }
          .mobile-menu-btn { display: block; }
          .nav-tabs {
            display: ${mobileMenuOpen ? "flex" : "none"};
            position: absolute;
            top: 60px;
            left: 0; right: 0;
            flex-direction: column;
            background: var(--surface);
            border-bottom: 1px solid var(--border);
            padding: 8px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.4);
          }
          .nav-tabs.open { display: flex; }
          .app-main { padding: 12px; }
          .comp-grid { grid-template-columns: repeat(2, 1fr); }
          .section-grid { grid-template-columns: 1fr; }
          .cols-2 { grid-template-columns: 1fr; }
          .stats-row { grid-template-columns: repeat(2, 1fr); }
          .config-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <header className="app-header">
        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>☰</button>
        <div className="app-logo">TrendSheet <span>Appraisal Tool</span></div>
        <nav className={`nav-tabs ${mobileMenuOpen ? "open" : ""}`}>
          {TABS.map((t) => (
            <button key={t.id} className={`nav-tab ${activeTab === t.id ? "active" : ""}`}
              onClick={() => { setActiveTab(t.id); setMobileMenuOpen(false); }}>
              <span className="tab-icon">{t.icon}</span> {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="app-main">
        {activeTab === "subject" && <SubjectTab subject={subject} setSubject={setSubject} />}
        {activeTab === "comps" && <CompsTab comps={comps} setComps={setComps} subject={subject} />}
        {activeTab === "adjustments" && <AdjustmentsTab comps={comps} setComps={setComps} subject={subject} config={config} setConfig={setConfig} />}
        {activeTab === "trending" && <TrendingTab mlsData={mlsData} subject={subject} />}
        {activeTab === "reconciliation" && <ReconciliationTab comps={comps} subject={subject} setComps={setComps} />}
        {activeTab === "mls" && <MLSDataTab mlsData={mlsData} setMlsData={setMlsData} />}
      </main>
    </div>
  );
}
