# NetYard

Stand up a shop network without Microsoft Server.

**NetYard** is a [First Deploy AI](https://firstdeploy.ai/) product. A plumber, HVAC shop, clinic, or office answers six questions and gets a LAN plan: addressing, a Samba directory Windows PCs can join, file shares, guest Wi-Fi, VPN, a shopping list, and Debian install scripts. No Windows Server CALs.

## What it does

- Wizard: shop name, headcount, jobs (files, printers, guest Wi-Fi, cameras, VPN, POS), desktops, sites, gear budget.
- Plan: VLANs, DHCP, reservations, firewall matrix, Samba AD or workgroup, Wi-Fi SSIDs.
- Cost: Windows Server Standard + User CALs versus Samba at $0. Hardware is still in the shopping list.
- Files: `NETYARD-PLAN.md`, `install-office-server.sh`, `users.csv`, `wg0.conf`, CSVs for the switch tech.
- Tools: CIDR calculator and the VLAN numbering NetYard uses.

Email stays on Google Workspace or Microsoft 365. This does not replace Exchange.

## Local

```bash
cd netyard
npm install
npm test
npm run dev
```

Vite serves the app at [http://localhost:5177](http://localhost:5177). `npm run build` writes `dist/` with unique HTML per route.

## Deploy

This folder is a separate Netlify site from corp, AskYard, Stateside, and Sonaris. In the Netlify UI:

1. Base directory: `netyard`
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add the custom domain `netyard.firstdeploy.ai`

No API keys. The planner runs in the browser.

## Brand

Gold lattice node on a black field, cream type. Same family as AskYard. Copy stays concrete: CALs, Debian 12, VLAN 30, street prices.

## Price next to the free plan

The plan and scripts are free. First Deploy AI is $1,500 setup, then $250/month if you want the shop racked for you. Live this week or you do not pay the setup. Consult is a free 30-minute qualifier, then $75 / 30 min or $150 / hour.
