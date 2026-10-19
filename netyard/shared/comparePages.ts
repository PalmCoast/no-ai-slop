/**
 * No-link comparison pages (Oct 19, 2026).
 * Rules: competitor names appear only on these pages; sources are plain text with a checked date (no outbound links);
 * every CTA points to NetYard (free plan, /buy, Calendly, +1 320-335-6186); no trials, guarantees, stats, or client names.
 */
import { FD_PRICE } from "./brand.ts";

export const COMPARE_CHECKED = "October 19, 2026";
export const COMPARE_CHECKED_ISO = "2026-10-19";

export type CompareSection = {
  h2: string;
  paras?: string[];
  bullets?: string[];
  table?: { head: string[]; rows: string[][]; note?: string };
};

export type ComparePageData = {
  path: string;
  title: string;
  description: string;
  h1: string;
  lede: string;
  sections: CompareSection[];
  pickThem: { h2: string; bullets: string[] };
  pickUs: { h2: string; bullets: string[] };
  faqs: { q: string; a: string }[];
  sources: string[];
};

const OUR_BUILD = `NetYard writes the plan for free: addressing, a Samba Active Directory on Debian that Windows PCs join, shared drives by team, guest Wi-Fi on its own network, a WireGuard VPN stub, a shopping list, install scripts, a user CSV, and a runbook. If you would rather not run it yourself, First Deploy AI builds it from that same written plan for ${FD_PRICE}. Hardware is bought separately.`;

const OUR_SOURCE = `NetYard: this site's home page, pricing card, and FAQ (${FD_PRICE}; the plan, shopping list, and scripts are free with no account), checked ${COMPARE_CHECKED}.`;

export const COMPARE_PAGES: ComparePageData[] = [
  {
    path: "/zentyal-alternative",
    title: "Zentyal alternative: a done-for-you Samba network | NetYard",
    description:
      "Zentyal is a Linux server you license per server and run yourself. NetYard writes a free Samba network plan and can build it for you. Facts checked Oct 19, 2026.",
    h1: "Zentyal alternative: have the network built instead of licensing a server",
    lede: "Zentyal and NetYard both skip Windows Server CALs. The difference is who runs it. Zentyal sells a server license you install and administer. NetYard writes the plan for free, and First Deploy AI can build and look after the network for you.",
    sections: [
      {
        h2: `What Zentyal publishes (checked ${COMPARE_CHECKED})`,
        bullets: [
          "Zentyal Server is a Linux server for Windows networks, with Active Directory compatibility, mail, and network services. Its home page lists the current release as Zentyal 8.1 on Ubuntu 24.04 LTS.",
          "Its pricing page says one license per server and no client access licenses.",
          "Annual subscription per server: Micro $230 (up to 25 users, 1 support ticket), Small $600 (up to 75 users), Medium $1,200 (up to 300 users), Enterprise $3,600.",
          "Lifetime licenses are also listed: $460, $1,200, $2,400, and $7,200 for the same four tiers.",
          "Its pricing FAQ says that if a subscription is not renewed, the server stops working and you lose updates, upgrades, and the support portal. You can switch to a lifetime license before it expires.",
        ],
      },
      { h2: "What NetYard does instead", paras: [OUR_BUILD, "Email stays in Google Workspace or Microsoft 365. NetYard does not plan an on-site mail server."] },
      {
        h2: "Side by side",
        table: {
          head: ["", "Zentyal Server", "NetYard"],
          rows: [
            ["What you get", "A server license and the software", "A written plan, scripts, and an optional build"],
            ["Windows Server CALs", "None, per Zentyal's pricing page", "None. Samba and Debian carry no CAL"],
            ["Who installs and runs it", "You or your admin", "You from the free plan, or First Deploy AI"],
            ["Mail", "Mail services included", "Stays in Google Workspace or Microsoft 365"],
            ["Price", "From $230 per server per year (Micro)", "Plan free. Build $1,750 setup ($875 to start), then $250/mo"],
          ],
          note: `Zentyal figures from zentyal.com home and pricing pages, checked ${COMPARE_CHECKED}. Hardware is extra on both sides.`,
        },
      },
    ],
    pickThem: {
      h2: "Pick Zentyal if",
      bullets: [
        "You have your own admin who wants an all-in-one server with a web console",
        "You want mail hosted on your own server",
        "You would rather pay a per-server license than a monthly operator",
      ],
    },
    pickUs: {
      h2: "Pick NetYard if",
      bullets: [
        "Nobody in the shop wants to be the server admin",
        "You want a written plan before anyone buys hardware",
        "Your email already lives in Google Workspace or Microsoft 365",
      ],
    },
    faqs: [
      {
        q: "Does Zentyal need Windows Server CALs?",
        a: `Zentyal's pricing page says one license per server and no client access licenses. Checked ${COMPARE_CHECKED}.`,
      },
      {
        q: "What does NetYard cost compared with a Zentyal license?",
        a: `The NetYard plan, shopping list, and scripts are free. A done-for-you build is ${FD_PRICE}, with hardware separate. Zentyal lists annual licenses from $230 per server (Micro, up to 25 users) and lifetime licenses from $460, checked ${COMPARE_CHECKED}. Those are different things: a license you run versus a build someone runs for you.`,
      },
      {
        q: "Can I talk it through before deciding?",
        a: "Yes. Book the free 30-minute call or ring +1 320-335-6186. We look at your shop and your plan before you pay anything.",
      },
    ],
    sources: [
      `Zentyal: zentyal.com home page (product description, current release) and zentyal.com/pricing (per-server licensing, annual and lifetime prices, renewal FAQ), checked ${COMPARE_CHECKED}.`,
      OUR_SOURCE,
    ],
  },
  {
    path: "/nethserver-alternative",
    title: "NethServer or a done-for-you Samba network for a small shop | NetYard",
    description:
      "NethServer is free, open-source, and self-run. NetYard writes a free Samba network plan and can build and look after it. Facts checked Oct 19, 2026.",
    h1: "NethServer or a done-for-you Samba network for a 12-person shop",
    lede: "NethServer is a free, open-source platform for people who run their own Linux servers. NetYard is for shops that want the plan written down and, if they like, someone else to build and look after it. Both can give Windows PCs a Samba Active Directory to join.",
    sections: [
      {
        h2: `What NethServer publishes (checked ${COMPARE_CHECKED})`,
        bullets: [
          "NethServer describes itself as a small business Linux server and a multi-node application platform built on Linux and containers.",
          "It says it is 100% open source and free, with its source code on GitHub, developed by Nethesis together with a community.",
          "It runs on several Linux distributions, including Rocky Linux, CentOS Stream, Alma, and Debian, with a web interface and a Software Center for apps.",
          "Its administrator manual says you can create an internal user domain with Samba Active Directory from the Domains and users page, and that Samba can host one user domain per node.",
          "Nethesis sells optional yearly subscriptions for an enterprise updates repository, automatic updates, monitoring, and support tickets. Prices are on its subscription page, in euros.",
        ],
      },
      { h2: "What NetYard does", paras: [OUR_BUILD] },
      {
        h2: "Side by side",
        table: {
          head: ["", "NethServer", "NetYard"],
          rows: [
            ["Software cost", "Free and open source", "Samba and Debian, free and open source"],
            ["Directory", "Internal Samba Active Directory option", "Samba Active Directory on Debian"],
            ["Who sets it up", "You or your Linux admin", "You from the free plan, or First Deploy AI"],
            ["Ongoing help", "Optional yearly subscription from Nethesis", "Optional $250/mo named operator after a build"],
            ["Also covers", "Container apps across nodes", "Addressing, guest Wi-Fi, VPN, shopping list, runbook"],
          ],
          note: `NethServer facts from nethserver.org, its subscription page, and its administrator manual, checked ${COMPARE_CHECKED}.`,
        },
      },
    ],
    pickThem: {
      h2: "Pick NethServer if",
      bullets: [
        "You have someone comfortable running Linux servers and containers",
        "You want to host several self-run apps across more than one node",
        "You want free software and will do the setup yourself",
      ],
    },
    pickUs: {
      h2: "Pick NetYard if",
      bullets: [
        "You want a plan that covers the whole shop network, not only the server",
        "Nobody in the shop wants to be the Linux admin",
        "You want one named operator to call after the build",
      ],
    },
    faqs: [
      {
        q: "Is NethServer free?",
        a: `NethServer's site says it is 100% open source and available for free. Nethesis sells optional yearly subscriptions for enterprise updates and support. Checked ${COMPARE_CHECKED}.`,
      },
      {
        q: "Do both use Samba Active Directory?",
        a: `NethServer's manual describes an internal Samba Active Directory user domain. NetYard plans Samba Active Directory on Debian. The difference is who plans, builds, and looks after it.`,
      },
      {
        q: "What does a NetYard build cost?",
        a: `The plan and scripts are free. A build is ${FD_PRICE}. Hardware is separate and listed at street prices in your plan.`,
      },
    ],
    sources: [
      `NethServer: nethserver.org home page (open source, free, Nethesis, supported distributions), nethserver.org/subscription (optional yearly plans), and the NethServer 8 administrator manual, user domains page (internal Samba Active Directory), checked ${COMPARE_CHECKED}.`,
      OUR_SOURCE,
    ],
  },
  {
    path: "/windows-sbs-replacement",
    title: "Windows Small Business Server replacement (2026) for a 12-person shop | NetYard",
    description:
      "What replaces Windows Small Business Server in 2026: Microsoft's current editions, and a Samba directory on Debian. Facts from Microsoft's pages, checked Oct 19, 2026.",
    h1: "Windows Small Business Server replacement (2026): what a 12-person shop actually needs",
    lede: "A 12-person shop that once ran Small Business Server still needs the same few things: one login per person, a shared drive, printers, guest Wi-Fi kept off the office network, and a way in from home. Here is what Microsoft sells today and how NetYard covers the same jobs without CALs.",
    sections: [
      {
        h2: `What Microsoft publishes (checked ${COMPARE_CHECKED})`,
        bullets: [
          "Microsoft's lifecycle page for Windows Small Business Server 2011 lists the Essentials, Premium Add-On, and Standard editions under the Fixed Lifecycle Policy, says support follows each component product's lifecycle, and links migration guidance to Windows Server Essentials.",
          "Microsoft's Windows Server 2025 licensing guide lists three editions: Datacenter, Standard, and Essentials.",
          "Essentials is described as a first server for small businesses with up to 25 users and 50 devices, on a single-processor server with up to 10 cores, sold through OEM server hardware partners only. The guide's CAL table shows no base Windows Server CAL for Essentials.",
          "Standard and Datacenter are licensed per core plus CALs, with a minimum of 16 core licenses per server. Microsoft's pricing page lists Standard at a suggested $1,176 and Datacenter at $6,771 for 16 core licenses, and says prices may vary.",
        ],
      },
      {
        h2: "The jobs, mapped",
        table: {
          head: ["What the shop needs", "On Windows Server", "In a NetYard plan"],
          rows: [
            ["One login per person", "Active Directory domain", "Samba Active Directory on Debian; Windows PCs join it"],
            ["Shared drive", "File server role", "Shares by team plus a home folder per person"],
            ["Printers", "Print server", "Printers on the office network"],
            ["Email", "A mail server, or cloud mail", "Stays in Google Workspace or Microsoft 365"],
            ["Guest Wi-Fi", "Separate network gear", "Guest VLAN with a firewall matrix"],
            ["Remote access", "Remote access or VPN roles", "WireGuard VPN stub"],
          ],
          note: "The Windows column describes general roles, not a priced quote.",
        },
      },
      { h2: "What NetYard does", paras: [OUR_BUILD] },
    ],
    pickThem: {
      h2: "Pick a Microsoft edition if",
      bullets: [
        "You run Windows-only server software that has to sit on a Windows server",
        "You are buying a new server from an OEM anyway and stay under the Essentials limits",
        "You need Remote Desktop Services or other Windows Server roles",
      ],
    },
    pickUs: {
      h2: "Pick NetYard if",
      bullets: [
        "The server's only jobs are logins, files, and printers",
        "You want guest Wi-Fi, VPN, and the shopping list planned in the same pass",
        "You would rather not buy CALs as the shop grows",
      ],
    },
    faqs: [
      {
        q: "Is there still a Windows server edition for small businesses?",
        a: `Yes. Microsoft's Windows Server 2025 licensing guide lists Essentials for up to 25 users and 50 devices, sold through OEM hardware partners only. Checked ${COMPARE_CHECKED}.`,
      },
      {
        q: "What about email that used to live on Small Business Server?",
        a: "NetYard keeps email in Google Workspace or Microsoft 365 and does not plan an on-site mail server.",
      },
      {
        q: "We still run an old Small Business Server. Can you work with that?",
        a: "Tell us on the free 30-minute call what it runs today. We list what moves to Samba, what stays, and what goes to the cloud before you pay anything.",
      },
    ],
    sources: [
      `Microsoft: Windows Small Business Server 2011 lifecycle page on learn.microsoft.com, checked ${COMPARE_CHECKED}.`,
      `Microsoft: Windows Server 2025 licensing guidance (editions, Essentials limits, core minimums, CAL table), checked ${COMPARE_CHECKED}.`,
      `Microsoft: Windows Server 2025 pricing page (suggested MSRP, 16-core note), checked ${COMPARE_CHECKED}.`,
      OUR_SOURCE,
    ],
  },
  {
    path: "/windows-server-cal-math",
    title: "Do I need Windows Server CALs? The math for a 12-person shop | NetYard",
    description:
      "Windows Server CAL math for 12 people using Microsoft's published Standard price and a reseller's published CAL list price, next to a Samba directory with no CAL. Checked Oct 19, 2026.",
    h1: "Do I need Windows Server CALs? The math for a 12-person shop",
    lede: "If people sign in to a Windows Server or use its file shares and printers, Microsoft's rules say each user or device needs a Client Access License on top of the server license. Here is the arithmetic for 12 people, using only published list prices with their dates.",
    sections: [
      {
        h2: `What Microsoft says (checked ${COMPARE_CHECKED})`,
        bullets: [
          "Microsoft's Client Access License page says a CAL is not a software product but a license that gives a user the right to access the server's services, such as file storage or printing.",
          "A User CAL covers one person on any number of devices. A Device CAL covers one device for any number of users. The page's product table lists Windows Server under Core/CAL.",
          "Microsoft's Windows Server 2025 pricing page lists Standard at a suggested $1,176 and Datacenter at $6,771, says that pricing is for 16 core licenses, and says CALs are required for every user or device accessing a server. It also says pricing varies by country and to ask a Microsoft representative for a quote.",
          "Microsoft's licensing guide sets a minimum of 16 core licenses per server and 8 per processor, and lists Remote Desktop Services as an additional CAL on top of the base CAL.",
          "Microsoft's pricing page does not list a CAL price.",
        ],
      },
      {
        h2: "The arithmetic for 12 people",
        paras: [
          `For the CAL price we use one Microsoft reseller's published US list (o365hq.com, which says its figures come from Microsoft's CSP price list for October 2026): $50 for one Windows Server 2025 User CAL and $39 for one Device CAL, one-time purchase, commercial. Checked ${COMPARE_CHECKED}. Your reseller's price may differ.`,
        ],
        table: {
          head: ["Line", "User CALs", "Device CALs", "Samba directory (NetYard plan)"],
          rows: [
            ["Server license", "$1,176 (Standard, 16 cores)", "$1,176 (Standard, 16 cores)", "$0 (Samba on Debian)"],
            ["Access licenses", "12 × $50 = $600", "12 × $39 = $468", "$0 (no CAL)"],
            ["License total", "$1,776", "$1,644", "$0"],
          ],
          note: "Arithmetic on the published list prices above, not a quote. Hardware, a UPS, Remote Desktop CALs, and Software Assurance are not included. A server with more than 16 cores needs more core licenses.",
        },
      },
      {
        h2: "What the Samba side still costs",
        paras: [
          "Samba and Debian carry no client access license, but the network is not free to run. You still buy the server box, switch, access points, disks, and a UPS. NetYard's plan lists them at street prices.",
          `If you want it built, First Deploy AI charges ${FD_PRICE}. The plan and scripts stay free if you run them yourself.`,
        ],
      },
    ],
    pickThem: {
      h2: "Buy Windows Server and CALs if",
      bullets: [
        "You run Windows-only server software or need Remote Desktop Services",
        "Your accountant or software vendor requires a Windows server",
        "Your shop fits Essentials and you are buying an OEM server anyway (Microsoft's guide shows no base CAL for Essentials)",
      ],
    },
    pickUs: {
      h2: "Pick a Samba plan if",
      bullets: [
        "The server only does logins, shared drives, and printers",
        "You expect to hire and do not want a CAL purchase with each new person",
        "Your email is already in Google Workspace or Microsoft 365",
      ],
    },
    faqs: [
      {
        q: "Do I need a Windows Server CAL for every employee?",
        a: `Microsoft's pricing page says CALs are required for every user or device accessing a server. You choose User CALs (per person) or Device CALs (per device). Checked ${COMPARE_CHECKED}.`,
      },
      {
        q: "How much is a Windows Server User CAL?",
        a: `Microsoft's pricing page does not list one. One reseller's published US list shows $50 per Windows Server 2025 User CAL and $39 per Device CAL, one-time, checked ${COMPARE_CHECKED}. Ask your reseller for a quote.`,
      },
      {
        q: "Does a Samba directory need CALs?",
        a: "No. Samba and Debian carry no client access license. Windows PCs join the Samba directory and sign in with one password.",
      },
    ],
    sources: [
      `Microsoft: Client Access Licenses and Management Licenses page (Microsoft Volume Licensing), checked ${COMPARE_CHECKED}.`,
      `Microsoft: Windows Server 2025 pricing page (Standard $1,176 and Datacenter $6,771 suggested MSRP, 16-core note, CAL footnote), checked ${COMPARE_CHECKED}.`,
      `Microsoft: Windows Server 2025 licensing guidance (core minimums, CAL table), checked ${COMPARE_CHECKED}.`,
      `o365hq.com: Windows Server CAL 2025 price page (User CAL $50, Device CAL $39, one-time, commercial, US), checked ${COMPARE_CHECKED}. A reseller, not Microsoft.`,
      OUR_SOURCE,
    ],
  },
  {
    path: "/samba-ad-small-business",
    title: "Samba AD for small business: what it does and what it can't | NetYard",
    description:
      "What a Samba Active Directory on Debian does for a small shop, what Samba's own docs say it does not do, and how NetYard plans around each gap. Checked Oct 19, 2026.",
    h1: "Samba AD for small business: what it does and what it can't",
    lede: "Samba can act as an Active Directory domain controller that Windows PCs join. It is not a full copy of Windows Server. Here is what it does, what Samba's own documentation says is missing, and how a NetYard plan works around each gap.",
    sections: [
      {
        h2: "What it does for a small shop",
        bullets: [
          "Windows 10 and 11 PCs join the domain and each person signs in with one password",
          "Shared drives by team and a home folder per person",
          "Group Policy, edited from a Windows PC with Microsoft's free RSAT tools",
          "DNS for the office network",
          "No client access licenses. Samba and Debian are free and open source",
        ],
      },
      {
        h2: `What Samba's own documentation says (checked ${COMPARE_CHECKED})`,
        bullets: [
          "The Samba wiki FAQ says Samba AD is stable for production and that AD domain controller support arrived in version 4.0, released in December 2012.",
          "The same FAQ says some features are unimplemented, such as Sysvol replication: Samba does not support the DFS-R protocol Windows uses to copy Sysvol between domain controllers.",
          "It also says the Samba AD DC file service does not support network browsing, so Network Neighbourhood can look empty.",
          "Samba's security documentation says password changes on a Samba read-only domain controller are rejected rather than passed on to a writable one.",
        ],
      },
      {
        h2: "How NetYard plans around each gap",
        table: {
          head: ["Gap", "What NetYard does"],
          rows: [
            ["On-premises Exchange", "Email stays in Google Workspace or Microsoft 365"],
            ["Microsoft Enterprise CA", "Not planned. We raise it on the call if a program needs one"],
            ["Read-only domain controllers", "Not planned for a single small office"],
            ["Sysvol replication between DCs", "Raised on the call if you need a second domain controller"],
            ["Network browsing", "Shares are mapped by group, so nobody has to browse for them"],
            ["Windows-only server programs", "Listed on the free call, before anything is bought"],
          ],
        },
      },
      { h2: "What NetYard does", paras: [OUR_BUILD] },
    ],
    pickThem: {
      h2: "Stay on Windows Server if",
      bullets: [
        "You need on-premises Exchange or a Microsoft Enterprise CA",
        "You run several sites that need read-only domain controllers",
        "A line-of-business program only runs on a Windows server",
      ],
    },
    pickUs: {
      h2: "A Samba plan fits if",
      bullets: [
        "One office, Windows PCs, shared drives, and printers",
        "Email already lives in Google Workspace or Microsoft 365",
        "You want to stop buying CALs",
      ],
    },
    faqs: [
      {
        q: "Is Samba AD stable enough for a small business?",
        a: `The Samba wiki FAQ says Samba AD is stable for production environments, with AD DC support since version 4.0 in December 2012. Checked ${COMPARE_CHECKED}.`,
      },
      {
        q: "What can Samba not do?",
        a: "NetYard does not plan on-premises Exchange, a Microsoft Enterprise CA, or read-only domain controllers on Samba. Samba's docs also list Sysvol replication and network browsing as unimplemented. Email stays in Google Workspace or Microsoft 365.",
      },
      {
        q: "Can Windows PCs still get Group Policy?",
        a: "Yes. Windows PCs joined to a Samba domain receive Group Policy, and you edit policies from a Windows PC with Microsoft's free RSAT tools.",
      },
    ],
    sources: [
      `Samba: Samba wiki FAQ (production stability, version 4.0 in December 2012, Sysvol/DFS-R, browsing), checked ${COMPARE_CHECKED}.`,
      `Samba: Samba wiki, Samba Security Documentation (read-only domain controller password changes), checked ${COMPARE_CHECKED}.`,
      OUR_SOURCE,
    ],
  },
];

export function comparePageFor(path: string): ComparePageData | undefined {
  return COMPARE_PAGES.find((page) => page.path === path);
}
