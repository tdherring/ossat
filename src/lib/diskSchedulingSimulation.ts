export type DiskSchedulingPolicy = "FCFS" | "SSTF" | "SCAN" | "C-SCAN" | "LOOK" | "C-LOOK";
export type DiskDirection = "left" | "right";

export interface DiskVisit {
  index: number;
  cylinder: number;
  kind: "start" | "request" | "boundary";
  movement: number;
  cumulativeMovement: number;
}

export interface DiskDemo {
  id: string;
  label: string;
  policy: DiskSchedulingPolicy;
  direction: DiskDirection;
  head: number;
  maxCylinder: number;
  requests: number[];
}

interface PendingVisit {
  cylinder: number;
  kind: "request" | "boundary";
}

export const DISK_DEMOS: DiskDemo[] = [
  {
    id: "scan-mixed-queue",
    label: "SCAN · Mixed request queue",
    policy: "SCAN",
    direction: "right",
    head: 53,
    maxCylinder: 199,
    requests: [98, 183, 37, 122, 14, 124, 65, 67],
  },
  {
    id: "sstf-clustered",
    label: "SSTF · Clustered requests",
    policy: "SSTF",
    direction: "right",
    head: 90,
    maxCylinder: 199,
    requests: [18, 38, 55, 58, 92, 150, 160, 184],
  },
  {
    id: "cscan-fairness",
    label: "C-SCAN · Uniform waiting",
    policy: "C-SCAN",
    direction: "right",
    head: 75,
    maxCylinder: 199,
    requests: [10, 44, 77, 89, 120, 150, 176, 188],
  },
];

export const constrainDiskGeometry = (requestedMaxCylinder: number, currentHead: number) => {
  const maxCylinder = Number.isFinite(requestedMaxCylinder)
    ? Math.min(999, Math.max(20, requestedMaxCylinder))
    : 199;
  return {
    maxCylinder,
    head: Math.min(maxCylinder, Math.max(0, currentHead)),
  };
};

const ascending = (values: number[]) => [...values].sort((a, b) => a - b);
const descending = (values: number[]) => [...values].sort((a, b) => b - a);

const nearestFirst = (requests: number[], head: number) => {
  const remaining = [...requests];
  const order: number[] = [];
  let current = head;
  while (remaining.length > 0) {
    let nearestIndex = 0;
    for (let index = 1; index < remaining.length; index += 1) {
      const candidateDistance = Math.abs(remaining[index] - current);
      const nearestDistance = Math.abs(remaining[nearestIndex] - current);
      if (
        candidateDistance < nearestDistance ||
        (candidateDistance === nearestDistance && remaining[index] < remaining[nearestIndex])
      )
        nearestIndex = index;
    }
    current = remaining.splice(nearestIndex, 1)[0];
    order.push(current);
  }
  return order;
};

const directionalOrder = (
  requests: number[],
  head: number,
  maxCylinder: number,
  policy: Exclude<DiskSchedulingPolicy, "FCFS" | "SSTF">,
  direction: DiskDirection,
) => {
  const lower = ascending(requests.filter((request) => request < head));
  const higher = ascending(requests.filter((request) => request >= head));
  const visits: PendingVisit[] = [];
  const addRequests = (values: number[]) =>
    values.forEach((cylinder) => visits.push({ cylinder, kind: "request" }));
  const addBoundary = (cylinder: number) => visits.push({ cylinder, kind: "boundary" });
  const circular = policy === "C-SCAN" || policy === "C-LOOK";
  const touchesBoundary = policy === "SCAN" || policy === "C-SCAN";

  if (direction === "right") {
    addRequests(higher);
    if (lower.length > 0) {
      if (touchesBoundary && visits.at(-1)?.cylinder !== maxCylinder) addBoundary(maxCylinder);
      if (circular) {
        if (policy === "C-SCAN") addBoundary(0);
        addRequests(lower);
      } else {
        addRequests(descending(lower));
      }
    }
  } else {
    addRequests(descending(lower));
    if (higher.length > 0) {
      if (touchesBoundary && visits.at(-1)?.cylinder !== 0) addBoundary(0);
      if (circular) {
        if (policy === "C-SCAN") addBoundary(maxCylinder);
        addRequests(descending(higher));
      } else {
        addRequests(higher);
      }
    }
  }

  return visits;
};

const getVisitOrder = (
  requests: number[],
  head: number,
  maxCylinder: number,
  policy: DiskSchedulingPolicy,
  direction: DiskDirection,
): PendingVisit[] => {
  if (policy === "FCFS") {
    return requests.map((cylinder) => ({ cylinder, kind: "request" }));
  }

  if (policy === "SSTF") {
    return nearestFirst(requests, head).map((cylinder) => ({ cylinder, kind: "request" }));
  }

  return directionalOrder(requests, head, maxCylinder, policy, direction);
};

export const simulateDiskScheduling = (
  requests: number[],
  head: number,
  maxCylinder: number,
  policy: DiskSchedulingPolicy,
  direction: DiskDirection,
): DiskVisit[] => {
  const visits = getVisitOrder(requests, head, maxCylinder, policy, direction);

  let current = head;
  let cumulativeMovement = 0;
  const trace: DiskVisit[] = [
    { index: 0, cylinder: head, kind: "start", movement: 0, cumulativeMovement: 0 },
  ];

  visits.forEach((visit, index) => {
    const movement = Math.abs(visit.cylinder - current);
    cumulativeMovement += movement;
    trace.push({
      index: index + 1,
      cylinder: visit.cylinder,
      kind: visit.kind,
      movement,
      cumulativeMovement,
    });
    current = visit.cylinder;
  });

  return trace;
};
