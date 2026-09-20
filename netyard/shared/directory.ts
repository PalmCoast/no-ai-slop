import type { Answers, DirectoryMode, DirectoryPlan, Naming, SharePlan } from "./types.ts";

export function directoryMode(answers: Answers): DirectoryMode {
  const wantsFiles = answers.needs.includes("files") || answers.needs.includes("printers");
  const windowsLike = answers.desktops === "windows" || answers.desktops === "mixed";
  if (windowsLike && (wantsFiles || answers.peopleCount >= 5 || answers.headcount !== "solo")) {
    return "samba-ad";
  }
  if (wantsFiles) return "workgroup";
  return "none";
}

export function buildDirectory(answers: Answers, naming: Naming): DirectoryPlan {
  const mode = directoryMode(answers);
  if (mode === "samba-ad") {
    return {
      mode,
      why: "Windows PCs join a Samba Active Directory domain on Debian. Same idea as a Windows Server DC, without CALs.",
      realm: naming.realm,
      adminUser: `${naming.netbios}\\Administrator`,
      passwordPolicy: "12 characters, complexity on, 180-day max age, lockout after 10 failures for 15 minutes.",
      groups: shopGroups(answers),
    };
  }
  if (mode === "workgroup") {
    return {
      mode,
      why: "No Windows domain join. Samba runs as a workgroup file server so Macs, Chromebooks, and a NAS share folders.",
      realm: null,
      adminUser: "shopadmin",
      passwordPolicy: "12 characters on the Samba admin account. Rotate when someone leaves.",
      groups: shopGroups(answers),
    };
  }
  return {
    mode,
    why: "Skip the directory. Chromebooks and cloud drives do not need a local DC. Keep DNS and DHCP on the firewall.",
    realm: null,
    adminUser: "admin on the firewall",
    passwordPolicy: "Unique passphrase on the firewall and Wi-Fi. Store it in a password manager.",
    groups: [],
  };
}

export function shopGroups(answers: Answers): string[] {
  const groups = ["Shop Admins", "Office", "Field"];
  if (answers.needs.includes("files")) groups.push("File Admins");
  if (answers.needs.includes("pos")) groups.push("Registers");
  return groups;
}

export function buildShares(answers: Answers, naming: Naming): SharePlan[] {
  if (!answers.needs.includes("files") && !answers.needs.includes("printers")) return [];
  const root = `/srv/samba/${naming.netbios.toLowerCase()}`;
  const shares: SharePlan[] = [];
  if (answers.needs.includes("files")) {
    shares.push(
      {
        name: "Company",
        path: `${root}/company`,
        group: "Office",
        permission: "Domain Users: modify. Shop Admins: full.",
        purpose: "Shared job files, PDFs, price lists.",
      },
      {
        name: "Field",
        path: `${root}/field`,
        group: "Field",
        permission: "Field: modify. Office: read.",
        purpose: "Photos and forms from the truck.",
      },
      {
        name: "Users",
        path: `${root}/users`,
        group: "Domain Users",
        permission: "Each person gets a home folder. Others cannot read it.",
        purpose: "Private documents. Maps as U: on Windows.",
      },
      {
        name: "Public",
        path: `${root}/public`,
        group: "Domain Users",
        permission: "Everyone in the shop: modify. Recycle bin VFS on.",
        purpose: "Drop files without hunting a department share.",
      },
    );
  }
  if (answers.needs.includes("printers")) {
    shares.push({
      name: "Printers",
      path: "CUPS",
      group: "Domain Users",
      permission: "Print. Shop Admins manage the queue.",
      purpose: "Point Windows at the CUPS printer published in the directory.",
    });
  }
  return shares;
}
