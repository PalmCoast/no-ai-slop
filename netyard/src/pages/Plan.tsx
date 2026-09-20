import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { generatePlan } from "../../shared/planner";
import { bomTotal } from "../../shared/bom";
import type { GeneratedFile, NetworkPlan } from "../../shared/types";
import { RackCta } from "./Buy";
import { loadAnswers, loadDemo } from "../storage";

const TABS = ["Overview", "Addressing", "Directory", "Shopping", "Runbook", "Files"] as const;
type Tab = (typeof TABS)[number];

export default function Plan() {
  const [params] = useSearchParams();
  const [tab, setTab] = useState<Tab>("Overview");
  const plan = useMemo(() => {
    const answers = params.get("demo") === "1" ? loadDemo() : loadAnswers();
    if (!answers) return null;
    try {
      return generatePlan(answers);
    } catch {
      return null;
    }
  }, [params]);

  if (!plan) {
    return (
      <section className="section">
        <div className="container">
          <h1 className="display">No plan yet</h1>
          <p className="lede">Answer the six questions. It takes a minute.</p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/">
              Stand up a network
            </Link>
            <Link className="btn btn-outline" to="/plan?demo=1">
              Load the plumbing shop
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <p className="eyebrow">
          <span className="dot" /> {plan.naming.dnsDomain} · {plan.directory.mode}
        </p>
        <h1 className="display">Your shop network</h1>
        <p className="lede">{plan.summary}</p>
        <div className="totals">
          <div className="total">
            <b>{plan.answers.peopleCount}</b>
            <span>people</span>
          </div>
          <div className="total">
            <b>{plan.networks.length}</b>
            <span>networks</span>
          </div>
          <div className="total">
            <b>${plan.microsoft.savingsUsd.toLocaleString()}</b>
            <span>CAL money kept</span>
          </div>
          <div className="total">
            <b>${bomTotal(plan.bom).toLocaleString()}</b>
            <span>gear (street)</span>
          </div>
          <div className="total">
            <b>{plan.wifi.apCount}</b>
            <span>access points</span>
          </div>
        </div>

        <div className="filters" role="tablist" aria-label="Plan sections">
          {TABS.map((item) => (
            <button key={item} type="button" className={tab === item ? "filter on" : "filter"} onClick={() => setTab(item)}>
              {item}
            </button>
          ))}
        </div>

        {tab === "Overview" ? <Overview plan={plan} /> : null}
        {tab === "Addressing" ? <Addressing plan={plan} /> : null}
        {tab === "Directory" ? <Directory plan={plan} /> : null}
        {tab === "Shopping" ? <Shopping plan={plan} /> : null}
        {tab === "Runbook" ? <Runbook plan={plan} /> : null}
        {tab === "Files" ? <Files plan={plan} /> : null}
      </div>
    </section>
  );
}

function Overview({ plan }: { plan: NetworkPlan }) {
  return (
    <div className="card-grid plan-grid">
      <article className="card">
        <h3>Directory</h3>
        <p>{plan.directory.why}</p>
        <p className="fine">Admin: {plan.directory.adminUser}</p>
      </article>
      <article className="card">
        <h3>Wi-Fi</h3>
        <ul className="takeaways">
          {plan.wifi.ssids.map((s) => (
            <li key={s.name}>
              {s.name} → {s.vlan}
            </li>
          ))}
        </ul>
      </article>
      <article className="card">
        <h3>Vs Microsoft Server</h3>
        <p>
          Standard + {plan.answers.peopleCount} User CALs ≈ ${plan.microsoft.windowsTotalUsd.toLocaleString()}. Samba
          licenses $0.
        </p>
        <Link to="/compare">Read the tradeoffs</Link>
      </article>
      <article className="card warnings">
        <h3>Do this, not that</h3>
        <ul className="takeaways">
          {plan.warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      </article>
      <RackCta shop={plan.answers.businessName} />
    </div>
  );
}

function Addressing({ plan }: { plan: NetworkPlan }) {
  return (
    <>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Network</th>
              <th>VLAN</th>
              <th>CIDR</th>
              <th>Gateway</th>
              <th>DHCP</th>
            </tr>
          </thead>
          <tbody>
            {plan.networks.map((n) => (
              <tr key={n.name}>
                <td>
                  <strong>{n.name}</strong>
                  <div className="fine">{n.purpose}</div>
                </td>
                <td>{n.vlan ?? "—"}</td>
                <td>
                  <code>{n.cidr}</code>
                </td>
                <td>
                  <code>{n.gateway}</code>
                </td>
                <td>{n.dhcpStart ? `${n.dhcpStart}–${n.dhcpEnd}` : "static"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3 className="table-title">Reservations</h3>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Host</th>
              <th>Address</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {plan.hosts.map((h) => (
              <tr key={h.name + h.address}>
                <td>
                  <code>{h.name}</code>
                </td>
                <td>
                  <code>{h.address}</code>
                </td>
                <td>
                  {h.role}
                  <div className="fine">{h.notes}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3 className="table-title">Firewall</h3>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>From</th>
              <th>To</th>
              <th>Action</th>
              <th>Ports</th>
            </tr>
          </thead>
          <tbody>
            {plan.firewall.map((r, i) => (
              <tr key={`${r.from}-${r.to}-${i}`}>
                <td>{r.from}</td>
                <td>{r.to}</td>
                <td className={r.action === "deny" ? "deny" : "allow"}>{r.action}</td>
                <td>
                  <code>{r.ports}</code>
                  <div className="fine">{r.reason}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {plan.vpn ? (
        <p className="fine" style={{ marginTop: "1rem" }}>
          WireGuard {plan.vpn.serverAddress} UDP/{plan.vpn.listenPort}. {plan.vpn.notes}
        </p>
      ) : null}
    </>
  );
}

function Directory({ plan }: { plan: NetworkPlan }) {
  return (
    <div className="card-grid plan-grid">
      <article className="card">
        <h3>{plan.directory.mode}</h3>
        <p>{plan.directory.why}</p>
        {plan.directory.realm ? (
          <p>
            Realm <code>{plan.directory.realm}</code> · NetBIOS <code>{plan.naming.netbios}</code> · DC{" "}
            <code>{plan.naming.dcFqdn}</code>
          </p>
        ) : null}
        <p className="fine">{plan.directory.passwordPolicy}</p>
      </article>
      <article className="card">
        <h3>Groups</h3>
        {plan.directory.groups.length ? (
          <ul className="takeaways">
            {plan.directory.groups.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        ) : (
          <p>No local groups. Cloud identities are enough.</p>
        )}
      </article>
      <article className="card">
        <h3>Shares</h3>
        {plan.shares.length ? (
          <ul className="takeaways">
            {plan.shares.map((s) => (
              <li key={s.name}>
                <code>{s.name}</code> — {s.purpose}
              </li>
            ))}
          </ul>
        ) : (
          <p>No file server in this plan.</p>
        )}
      </article>
    </div>
  );
}

function Shopping({ plan }: { plan: NetworkPlan }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Each</th>
            <th>Line</th>
          </tr>
        </thead>
        <tbody>
          {plan.bom.map((b) => (
            <tr key={b.item}>
              <td>
                {b.item}
                <div className="fine">{b.notes}</div>
              </td>
              <td>{b.qty}</td>
              <td>${b.unitUsd}</td>
              <td>${b.qty * b.unitUsd}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="fine" style={{ marginTop: "0.8rem" }}>
        Street estimates, not a quote. Hardware ≈ ${bomTotal(plan.bom).toLocaleString()}. Windows Server licenses ≈ $
        {plan.microsoft.windowsTotalUsd.toLocaleString()}.
      </p>
    </div>
  );
}

function Runbook({ plan }: { plan: NetworkPlan }) {
  return (
    <ol className="runbook">
      {plan.runbook.map((step, index) => (
        <li key={step.title}>
          <strong>
            {index + 1}. {step.title}
          </strong>
          <p>{step.detail}</p>
        </li>
      ))}
    </ol>
  );
}

function Files({ plan }: { plan: NetworkPlan }) {
  return (
    <>
      <div className="hero-actions" style={{ marginBottom: "1rem" }}>
        <button type="button" className="btn btn-primary" onClick={() => downloadAll(plan.files)}>
          Download every file
        </button>
      </div>
      <div className="card-grid">
        {plan.files.map((file) => (
          <article className="card" key={file.filename}>
            <h3>
              <code>{file.filename}</code>
            </h3>
            <p className="fine">{file.contents.split("\n").length} lines</p>
            <div className="copy-row">
              <button type="button" className="btn btn-outline" onClick={() => downloadFile(file)}>
                Download
              </button>
              <button type="button" className="btn btn-outline" onClick={() => copyText(file.contents)}>
                Copy
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function downloadFile(file: GeneratedFile) {
  const blob = new Blob([file.contents], { type: `${file.mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadAll(files: GeneratedFile[]) {
  for (const file of files) downloadFile(file);
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    /* headless */
  }
}
