export type HighlightColor = "yellow" | "blue" | "pink" | "green" | "orange";

export interface Highlight {
  id: string;
  text: string;
  sourceTitle: string;
  sourceUrl: string;
  color: HighlightColor;
  folderId: string;
  createdAt: string;
  type: "text" | "image" | "video";
  imageUrl?: string;
  videoId?: string;
  videoTimestamp?: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  highlightCount: number;
  createdAt: string;
}

export const folders: Folder[] = [
  { id: "f1", name: "Thesis Research", parentId: null, highlightCount: 24, createdAt: "2026-01-15" },
  { id: "f1a", name: "Literature Review", parentId: "f1", highlightCount: 12, createdAt: "2026-01-16" },
  { id: "f1b", name: "Methodology", parentId: "f1", highlightCount: 8, createdAt: "2026-01-18" },
  { id: "f1c", name: "Case Studies", parentId: "f1", highlightCount: 4, createdAt: "2026-01-20" },
  { id: "f2", name: "Market Analysis", parentId: null, highlightCount: 18, createdAt: "2026-01-22" },
  { id: "f2a", name: "Competitor Landscape", parentId: "f2", highlightCount: 9, createdAt: "2026-01-23" },
  { id: "f2b", name: "Pricing Models", parentId: "f2", highlightCount: 6, createdAt: "2026-01-25" },
  { id: "f3", name: "Kitchen Renovation", parentId: null, highlightCount: 31, createdAt: "2026-02-01" },
  { id: "f4", name: "AI Ethics Essay", parentId: null, highlightCount: 15, createdAt: "2026-02-03" },
  { id: "f4a", name: "Bias & Fairness", parentId: "f4", highlightCount: 7, createdAt: "2026-02-04" },
  { id: "f4b", name: "Regulation", parentId: "f4", highlightCount: 5, createdAt: "2026-02-05" },
  { id: "f5", name: "Guitar Learning", parentId: null, highlightCount: 22, createdAt: "2026-02-06" },
];

export const highlights: Highlight[] = [
  {
    id: "h1",
    text: "The most significant finding was that transformer architectures consistently outperformed traditional RNN models in long-range dependency tasks, with improvements of 15-23% across all benchmark datasets.",
    sourceTitle: "Attention Is All You Need: Revisited",
    sourceUrl: "https://arxiv.org/papers/2026/transformers-revisited",
    color: "yellow",
    folderId: "f1a",
    createdAt: "2026-01-17",
    type: "text",
  },
  {
    id: "h2",
    text: "Qualitative research methods provide richer contextual understanding, but the challenge remains in scaling these insights across large populations without losing nuance.",
    sourceTitle: "Methods in Modern Research",
    sourceUrl: "https://journals.sage.com/methods-modern-research",
    color: "blue",
    folderId: "f1b",
    createdAt: "2026-01-19",
    type: "text",
  },
  {
    id: "h3",
    text: "The Nordic countries' approach to education policy demonstrates that high investment in teacher training correlates directly with student outcomes, independent of class size.",
    sourceTitle: "Education Policy: A Comparative Study",
    sourceUrl: "https://www.oecd.org/education-policy-comparison",
    color: "green",
    folderId: "f1c",
    createdAt: "2026-01-21",
    type: "text",
  },
  {
    id: "h4",
    text: "Companies that adopted value-based pricing saw 24% higher margins compared to cost-plus models, with customer retention rates improving by 12 percentage points.",
    sourceTitle: "SaaS Pricing Strategies 2026",
    sourceUrl: "https://openviewpartners.com/saas-pricing-2026",
    color: "orange",
    folderId: "f2b",
    createdAt: "2026-01-26",
    type: "text",
  },
  {
    id: "h5",
    text: "The competitive landscape has consolidated significantly, with the top 5 players now controlling 78% of market share, up from 52% just three years ago.",
    sourceTitle: "Market Dynamics Report Q1 2026",
    sourceUrl: "https://mckinsey.com/market-dynamics-q1-2026",
    color: "pink",
    folderId: "f2a",
    createdAt: "2026-01-24",
    type: "text",
  },
  {
    id: "h6",
    text: "Shaker-style cabinets remain the most popular choice for kitchen renovations in 2026, with matte black hardware trending as the preferred finish for a modern-classic look.",
    sourceTitle: "Kitchen Design Trends 2026",
    sourceUrl: "https://architecturaldigest.com/kitchen-trends-2026",
    color: "yellow",
    folderId: "f3",
    createdAt: "2026-02-02",
    type: "text",
  },
  {
    id: "h7",
    text: "Algorithmic bias in hiring tools disproportionately affected candidates from underrepresented backgrounds, with rejection rates 34% higher when AI screening was used without human oversight.",
    sourceTitle: "AI Bias in Employment Decisions",
    sourceUrl: "https://nature.com/ai-bias-employment-2026",
    color: "pink",
    folderId: "f4a",
    createdAt: "2026-02-04",
    type: "text",
  },
  {
    id: "h8",
    text: "The EU AI Act's risk-based classification framework represents the most comprehensive attempt at AI regulation to date, establishing precedents likely to influence global policy.",
    sourceTitle: "Regulating Artificial Intelligence: Global Approaches",
    sourceUrl: "https://brookings.edu/regulating-ai-global",
    color: "blue",
    folderId: "f4b",
    createdAt: "2026-02-05",
    type: "text",
  },
  {
    id: "h9",
    text: "Start with the four basic open chords\u2014G, C, D, and E minor. These four chords alone will let you play hundreds of popular songs. Practice transitioning between them smoothly before adding complexity.",
    sourceTitle: "Beginner Guitar: The Complete Guide",
    sourceUrl: "https://justinguitar.com/beginner-guide",
    color: "green",
    folderId: "f5",
    createdAt: "2026-02-07",
    type: "text",
  },
  {
    id: "h10",
    text: "The average cost of a mid-range kitchen renovation is $25,000\u2013$40,000. Major cost drivers: cabinetry (30-35%), countertops (10-15%), labor (20-25%), appliances (15-20%).",
    sourceTitle: "Kitchen Renovation Cost Breakdown",
    sourceUrl: "https://houzz.com/kitchen-renovation-costs",
    color: "orange",
    folderId: "f3",
    createdAt: "2026-02-03",
    type: "text",
  },
  {
    id: "h11",
    text: "Mixed-methods research designs that combine quantitative surveys with ethnographic observation produce findings that are both generalizable and deeply contextual.",
    sourceTitle: "Bridging Quantitative and Qualitative",
    sourceUrl: "https://journals.apa.org/bridging-methods",
    color: "blue",
    folderId: "f1b",
    createdAt: "2026-01-20",
    type: "text",
  },
  {
    id: "h12",
    text: "Quartz countertops have overtaken granite as the most specified surface material, offering better consistency, lower maintenance, and comparable durability at a similar price point.",
    sourceTitle: "Countertop Materials Compared",
    sourceUrl: "https://consumerreports.org/countertops-2026",
    color: "green",
    folderId: "f3",
    createdAt: "2026-02-04",
    type: "text",
  },
  {
    id: "h13",
    text: "Complete beginner guitar lesson covering proper hand positioning, basic strumming patterns, and your first three chords.",
    sourceTitle: "Your First Guitar Lesson \u2014 Justin Guitar",
    sourceUrl: "https://www.youtube.com/watch?v=BBz-Jyr23M4",
    color: "yellow",
    folderId: "f5",
    createdAt: "2026-02-08",
    type: "video",
    videoId: "BBz-Jyr23M4",
    videoTimestamp: "2:34",
  },
  {
    id: "h14",
    text: "Kitchen renovation walkthrough showing before/after of a complete remodel with budget breakdown and contractor tips.",
    sourceTitle: "Our $30K Kitchen Renovation \u2014 Full Tour",
    sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    color: "pink",
    folderId: "f3",
    createdAt: "2026-02-05",
    type: "video",
    videoId: "dQw4w9WgXcQ",
    videoTimestamp: "0:45",
  },
  {
    id: "h15",
    text: "Fingerpicking pattern tutorial for acoustic guitar \u2014 the Travis picking technique explained step by step.",
    sourceTitle: "Travis Picking for Beginners",
    sourceUrl: "https://www.youtube.com/watch?v=BBz-Jyr23M4",
    color: "blue",
    folderId: "f5",
    createdAt: "2026-02-09",
    type: "video",
    videoId: "BBz-Jyr23M4",
    videoTimestamp: "5:12",
  },
];

export function getFolderTree() {
  const roots = folders.filter((f) => f.parentId === null);
  return roots.map((root) => ({
    ...root,
    children: folders.filter((f) => f.parentId === root.id),
  }));
}

export function getFolderById(id: string) {
  return folders.find((f) => f.id === id);
}

export function getHighlightsByFolder(folderId: string) {
  const folder = getFolderById(folderId);
  if (!folder) return [];
  const childIds = folders.filter((f) => f.parentId === folderId).map((f) => f.id);
  const allIds = [folderId, ...childIds];
  return highlights.filter((h) => allIds.includes(h.folderId));
}

export function getRecentHighlights(count: number = 8) {
  return [...highlights]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, count);
}

export function searchHighlights(query: string) {
  const q = query.toLowerCase();
  return highlights.filter(
    (h) =>
      h.text.toLowerCase().includes(q) ||
      h.sourceTitle.toLowerCase().includes(q)
  );
}

export const HIGHLIGHT_COLORS: Record<HighlightColor, { bg: string; text: string; border: string; dot: string }> = {
  yellow: { bg: "bg-amber-100/80", text: "text-amber-900", border: "border-amber-200", dot: "bg-amber-400" },
  blue: { bg: "bg-sky-100/80", text: "text-sky-900", border: "border-sky-200", dot: "bg-sky-400" },
  pink: { bg: "bg-rose-100/70", text: "text-rose-900", border: "border-rose-200", dot: "bg-rose-400" },
  green: { bg: "bg-emerald-100/70", text: "text-emerald-900", border: "border-emerald-200", dot: "bg-emerald-400" },
  orange: { bg: "bg-orange-100/70", text: "text-orange-900", border: "border-orange-200", dot: "bg-orange-400" },
};

export const stats = {
  totalHighlights: highlights.length,
  totalFolders: folders.filter((f) => f.parentId === null).length,
  totalDocuments: 4,
  thisWeek: 6,
};
