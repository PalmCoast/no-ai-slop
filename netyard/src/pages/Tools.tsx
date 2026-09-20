import { useMemo, useState } from "react";
import { describeCidr } from "../../shared/cidr";

export default function Tools() {
  const [cidr, setCidr] = useState("10.10.10.0/24");
  const info = useMemo(() => {
    try {
      return describeCidr(cidr);
    } catch (error) {
      return error instanceof Error ? error.message : "Invalid CIDR";
    }
  }, [cidr]);

  return (
    <section className="section">
      <div className="container">
        <h1 className="display">Tools a shop admin actually uses</h1>
        <p className="lede">
          The wizard stands the network up. These are the jobs that still show up on Tuesday: split a subnet, pick a
          DHCP range, keep VLANs straight.
        </p>

        <div className="card-grid plan-grid">
          <article className="card">
            <h2>Subnet calculator</h2>
            <label htmlFor="cidr">CIDR</label>
            <input id="cidr" value={cidr} onChange={(e) => setCidr(e.target.value)} />
            {typeof info === "string" ? (
              <p className="error">{info}</p>
            ) : (
              <dl className="kv">
                <div>
                  <dt>Network</dt>
                  <dd>
                    <code>{info.network}/{info.prefix}</code>
                  </dd>
                </div>
                <div>
                  <dt>Mask</dt>
                  <dd>
                    <code>{info.mask}</code>
                  </dd>
                </div>
                <div>
                  <dt>Gateway</dt>
                  <dd>
                    <code>{info.gateway}</code>
                  </dd>
                </div>
                <div>
                  <dt>Broadcast</dt>
                  <dd>
                    <code>{info.broadcast}</code>
                  </dd>
                </div>
                <div>
                  <dt>Usable</dt>
                  <dd>{info.usable}</dd>
                </div>
                <div>
                  <dt>DHCP</dt>
                  <dd>
                    <code>
                      {info.dhcpStart}–{info.dhcpEnd}
                    </code>
                  </dd>
                </div>
              </dl>
            )}
          </article>
          <article className="card">
            <h2>VLAN cheat sheet</h2>
            <p>NetYard uses this numbering so a second tech can read the switch in six months.</p>
            <ul className="takeaways">
              <li>10 Staff — PCs and phones</li>
              <li>20 Servers — directory, files, print</li>
              <li>30 Guest — internet only</li>
              <li>40 IoT — cameras and plugs</li>
              <li>50 POS — card terminals</li>
              <li>90 Mgmt — switches, APs, ILO</li>
            </ul>
          </article>
          <article className="card">
            <h2>Jobs the wizard already did</h2>
            <ul className="takeaways">
              <li>IP plan that does not collide DHCP with dc01</li>
              <li>Samba AD vs workgroup vs no directory</li>
              <li>Guest and POS isolation on the firewall</li>
              <li>Windows Server CAL math vs Samba $0</li>
              <li>Debian bootstrap and a user CSV</li>
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
