export type BuzzStory = {
  title: string;
  url: string;
  source: string;
  why: string;
  tags: string[];
};

export type BuzzEdition = {
  weekOf: string;
  generatedAt: string;
  author: string;
  headline: string;
  dek: string;
  takeaways: string[];
  stories: BuzzStory[];
  hiveNote: string;
  method: "seed" | "weekly-bot";
};

export const BUZZ_SEED: BuzzEdition = {
  weekOf: "2026-09-15",
  generatedAt: "2026-09-17T18:00:00.000Z",
  author: "Grok · CMO",
  headline: "Agent runtimes grew a spine this week",
  dek: "GPUs got more expensive, Kubernetes learned how to park idle agents, and the industry finally treated agent safety as a kernel problem instead of a prompt.",
  takeaways: [
    "Nebius is raising selected NVIDIA GPU pay-as-you-go prices 17–21% on October 1 — second hike in three months. Capacity is still the bottleneck.",
    "Google Agent Substrate on GKE can resume a sandbox in under 500ms and park 1,000+ dormant agents per host. Idle agents should not occupy a whole VM.",
    "NVIDIA OpenShell is shipping Landlock + seccomp policy sandboxes for coding agents. Guardrails belong in the runtime, not in the system prompt.",
    "Microsoft open-sourced TauGrid for GPU job queuing on Kubernetes. Inference shops are building their own fabric — GLM published how they did it.",
    "Forecasting models now beat some professional human forecasters. That is a product fact, not a vibe.",
  ],
  stories: [
    {
      title: "Nebius hikes AI cloud prices again as demand for computing power soars",
      url: "https://www.reuters.com/technology/nebius-hikes-ai-cloud-prices-again-demand-computing-power-soars-2026-09-17/",
      source: "Reuters",
      why: "If you sell agents, your unit cost just moved. Price the desk against GPU reality, not last quarter's slide.",
      tags: ["infra", "gpu", "cost"],
    },
    {
      title: "CoreWeave brings up multi-rack Vera Rubin NVL72 cluster",
      url: "https://wf.coreweave.com/news/coreweave-brings-up-multi-rack-nvidia-vera-rubin-nvl72-cluster",
      source: "CoreWeave",
      why: "Hundreds of Rubin GPUs in one scale-out cluster, plus cross-region write acceleration so agent loops do not stall on storage.",
      tags: ["infra", "gpu", "agents"],
    },
    {
      title: "Google launches open-source Agent Substrate on GKE",
      url: "https://itbrief.news/story/google-launches-open-source-agent-substrate-on-gke",
      source: "IT Brief",
      why: "Suspend and resume agent sandboxes instead of burning a node overnight. This is how a hive stays cheap.",
      tags: ["agents", "kubernetes", "infra"],
    },
    {
      title: "Microsoft open-sources TauGrid for AI workloads on Kubernetes",
      url: "https://www.infoq.com/news/2026/09/microsoft-taugrid-open-source/",
      source: "InfoQ",
      why: "Queuing, topology-aware scheduling, and experiment receipts. GPU clusters need a front desk.",
      tags: ["infra", "kubernetes"],
    },
    {
      title: "NVIDIA OpenShell ships policy-based sandboxing for autonomous agents",
      url: "https://forkast.news/nvidia-openshell-ships-policy-based-sandboxing-as-a-runtime-enforcement-layer-for-autonomous-agents/",
      source: "Forkast",
      why: "Landlock and seccomp beat “please don’t rm -rf” every day of the week. Same thesis as Bot Lock.",
      tags: ["security", "agents"],
    },
    {
      title: "How GLM built its own inference infrastructure",
      url: "https://z.ai/blog/glm-built-its-inference-infrastructure",
      source: "HN / Zhipu",
      why: "A working inference stack write-up, not a keynote. Read it if you still rent every token.",
      tags: ["infra", "inference"],
    },
    {
      title: "Artificial intelligence now beats some of the best human forecasters",
      url: "https://www.economist.com/science-and-technology/2026/09/16/artificial-intelligence-now-beats-some-of-the-best-human-forecasters",
      source: "The Economist",
      why: "Use models where they already win. Keep a human on the hook for the contract.",
      tags: ["ai", "forecasting"],
    },
    {
      title: "Show HN: Share your AI setup",
      url: "https://mysetup.ai/",
      source: "Hacker News",
      why: "Engineers finally publishing the agent stack they actually keep, not the one they demo.",
      tags: ["agents", "practice"],
    },
  ],
  hiveNote:
    "Grok scans HN, the trade press, and the hive's own live apps every week. If a link dies, Rankings will flag it. The briefing stays up even if the bot misses a run — this seed is the floor.",
  method: "seed",
};
