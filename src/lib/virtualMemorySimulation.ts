export type PageReplacementPolicy = "FIFO" | "LRU" | "Clock" | "Optimal";

export interface TLBEntry {
  page: number;
  frame: number;
}

export interface VirtualMemoryStep {
  index: number;
  page: number;
  frame: number;
  frames: (number | null)[];
  tlb: TLBEntry[];
  hit: boolean;
  tlbHit: boolean;
  evicted: number | null;
  faults: number;
  hits: number;
}

export interface VirtualMemoryDemo {
  id: string;
  label: string;
  policy: PageReplacementPolicy;
  frameCount: number;
  tlbSize: number;
  references: number[];
}

export const VIRTUAL_MEMORY_DEMOS: VirtualMemoryDemo[] = [
  {
    id: "locality-lru",
    label: "LRU · Locality and reuse",
    policy: "LRU",
    frameCount: 4,
    tlbSize: 3,
    references: [0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2],
  },
  {
    id: "fifo-belady",
    label: "FIFO · Replacement pressure",
    policy: "FIFO",
    frameCount: 3,
    tlbSize: 2,
    references: [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5],
  },
  {
    id: "clock-working-set",
    label: "Clock · Second chance",
    policy: "Clock",
    frameCount: 4,
    tlbSize: 3,
    references: [2, 3, 2, 1, 5, 2, 4, 5, 3, 2, 5, 2],
  },
  {
    id: "optimal-baseline",
    label: "Optimal · Comparison baseline",
    policy: "Optimal",
    frameCount: 3,
    tlbSize: 2,
    references: [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2],
  },
];

export const parsePageReferences = (value: string) =>
  value
    .split(/[\s,]+/)
    .filter(Boolean)
    .map(Number)
    .filter((page) => Number.isInteger(page) && page >= 0)
    .slice(0, 40);

interface PageMetadata {
  loadedAt: number;
  lastUsed: number;
  referenced: boolean;
}

const getReplacementScore = (
  policy: Exclude<PageReplacementPolicy, "Clock">,
  metadata: PageMetadata | undefined,
  nextUse: number,
) => {
  if (policy === "FIFO") return metadata?.loadedAt ?? 0;
  if (policy === "LRU") return metadata?.lastUsed ?? 0;
  return nextUse === -1 ? Number.POSITIVE_INFINITY : nextUse;
};

const selectVictim = (
  policy: PageReplacementPolicy,
  frames: (number | null)[],
  metadata: Map<number, PageMetadata>,
  references: number[],
  index: number,
  clockHand: { value: number },
) => {
  if (policy === "Clock") {
    while (true) {
      const page = frames[clockHand.value];
      if (page === null) return clockHand.value;
      const pageMetadata = metadata.get(page);
      if (!pageMetadata?.referenced) {
        const victim = clockHand.value;
        clockHand.value = (clockHand.value + 1) % frames.length;
        return victim;
      }
      pageMetadata.referenced = false;
      clockHand.value = (clockHand.value + 1) % frames.length;
    }
  }

  let victim = 0;
  let score = policy === "Optimal" ? -1 : Number.POSITIVE_INFINITY;

  frames.forEach((page, frame) => {
    if (page === null) return;
    const pageMetadata = metadata.get(page);
    const nextUse = references.slice(index + 1).findIndex((candidate) => candidate === page);
    const candidateScore = getReplacementScore(policy, pageMetadata, nextUse);

    if (
      (policy === "Optimal" && candidateScore > score) ||
      (policy !== "Optimal" && candidateScore < score)
    ) {
      score = candidateScore;
      victim = frame;
    }
  });

  return victim;
};

export const simulateVirtualMemory = (
  references: number[],
  frameCount: number,
  tlbSize: number,
  policy: PageReplacementPolicy,
): VirtualMemoryStep[] => {
  const frames: (number | null)[] = Array.from({ length: frameCount }, () => null);
  const metadata = new Map<number, PageMetadata>();
  const clockHand = { value: 0 };
  let tlb: TLBEntry[] = [];
  let faults = 0;
  let hits = 0;

  return references.map((page, index) => {
    const tlbEntry = tlb.find((entry) => entry.page === page && frames[entry.frame] === page);
    const tlbHit = Boolean(tlbEntry);
    let frame = tlbEntry?.frame ?? frames.indexOf(page);
    const hit = frame !== -1;
    let evicted: number | null = null;

    if (hit) {
      hits += 1;
    } else {
      faults += 1;
      frame = frames.indexOf(null);
      if (frame === -1) {
        frame = selectVictim(policy, frames, metadata, references, index, clockHand);
        evicted = frames[frame];
        if (evicted !== null) {
          metadata.delete(evicted);
          tlb = tlb.filter((entry) => entry.page !== evicted);
        }
      }
      frames[frame] = page;
      metadata.set(page, { loadedAt: index, lastUsed: index, referenced: true });
    }

    const pageMetadata = metadata.get(page);
    if (pageMetadata) {
      pageMetadata.lastUsed = index;
      pageMetadata.referenced = true;
    }

    tlb = [{ page, frame }, ...tlb.filter((entry) => entry.page !== page)].slice(0, tlbSize);

    return {
      index,
      page,
      frame,
      frames: [...frames],
      tlb: tlb.map((entry) => ({ ...entry })),
      hit,
      tlbHit,
      evicted,
      faults,
      hits,
    };
  });
};
