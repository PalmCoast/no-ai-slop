export const MICROSOFT_CAL_URL = "https://www.microsoft.com/en-us/licensing/product-licensing/client-access-license";
export const LICENSING_CHECKED = "October 4, 2026";

export type Faq = { q: string; a: string };

export const COMPARE_FAQS: Faq[] = [
  {
    q: "Does a small shop need a Windows Server CAL?",
    a: `Microsoft's licensing page says a Client Access License is not a software product. It is a license that gives a user the right to access the services of the server, such as file storage or printing. Microsoft sells a User CAL (one per person, any number of devices) or a Device CAL (one per device). The product table on that page lists Windows Server under Core/CAL. Source: ${MICROSOFT_CAL_URL} — checked ${LICENSING_CHECKED}.`,
  },
  {
    q: "Can Windows PCs still domain-join without a Microsoft CAL?",
    a: "NetYard uses Samba AD on Debian so Windows PCs can join a realm and sign in with one password. This page states that Samba has no CAL and that Debian is the OS. Email stays on Google Workspace or Microsoft 365. Someone still has to rack the switch and test a restore.",
  },
  {
    q: "Does per-core licensing remove Windows Server CALs?",
    a: `Microsoft's page says some server products are licensed per core, and under that model you do not buy additional CALs. The same table lists Windows Server on the Core/CAL row, so a Windows Server purchase can still require CALs. The dollar figures elsewhere on this page are street estimates, not a price from Microsoft. Source: ${MICROSOFT_CAL_URL} — checked ${LICENSING_CHECKED}.`,
  },
];
