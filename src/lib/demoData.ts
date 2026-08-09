export interface DemoAssessment {
  id: string;
  variant: string;
  score: number;
  submitted: boolean;
  questionSet: { id: string }[];
}

interface AssessmentData {
  id: string;
  variant: string;
  score: number;
  submitted: boolean;
}

const questionSet = (assessmentId: string, count = 3) =>
  Array.from({ length: count }, (_, index) => ({ id: `${assessmentId}-q${index + 1}` }));

const assessment = (
  id: string,
  variant: string,
  score: number,
  submitted = true,
): DemoAssessment => ({
  id,
  variant,
  score,
  submitted,
  questionSet: questionSet(id),
});

export const demoUser = {
  id: "demo-teacher",
  username: "demo.teacher",
  firstName: "Morgan",
  lastName: "Lee",
  email: "morgan.lee@example.edu",
  isOrgCreator: true,
  managerOf: [],
  memberOf: [],
};

export const demoOrganisations = [
  {
    name: "Operating Systems · Group A",
    invitationCode: "OSSAT-A1",
    members: [
      { username: "ada", firstName: "Ada", lastName: "Okafor" },
      { username: "ben", firstName: "Ben", lastName: "Morgan" },
      { username: "charlie", firstName: "Charlie", lastName: "Singh" },
      { username: "dina", firstName: "Dina", lastName: "Evans" },
    ],
    managers: [{ username: "demo.teacher", firstName: "Morgan", lastName: "Lee" }],
  },
  {
    name: "Operating Systems · Group B",
    invitationCode: "OSSAT-B2",
    members: [
      { username: "eli", firstName: "Eli", lastName: "Adams" },
      { username: "fatima", firstName: "Fatima", lastName: "Rahman" },
    ],
    managers: [{ username: "demo.teacher", firstName: "Morgan", lastName: "Lee" }],
  },
];

const commonAssessments = (prefix: string, scores: number[]) => [
  assessment(`${prefix}-initial`, "Initial Assessment", scores[0]),
  assessment(`${prefix}-generated`, "Generated Assessment", scores[1]),
  assessment(`${prefix}-fcfs-1`, "FCFS I", scores[2]),
  assessment(`${prefix}-fcfs-2`, "FCFS II", scores[3]),
  assessment(`${prefix}-priority-1`, "Priority I", scores[4]),
  assessment(`${prefix}-priority-2`, "Priority II", scores[5]),
  assessment(`${prefix}-first-fit-1`, "First Fit I", scores[6]),
  assessment(`${prefix}-first-fit-2`, "First Fit II", scores[7]),
  assessment(`${prefix}-best-fit-1`, "Best Fit I", scores[8]),
];

export const demoAssessmentsByUser: Record<string, DemoAssessment[]> = {
  "demo.teacher": commonAssessments("teacher", [3, 3, 3, 3, 3, 3, 2, 2, 2]),
  ada: commonAssessments("ada", [3, 3, 3, 3, 3, 3, 2, 2, 2]),
  ben: commonAssessments("ben", [3, 3, 3, 3, 3, 3, 2, 2, 2]),
  charlie: commonAssessments("charlie", [3, 3, 3, 3, 3, 3, 2, 2, 2]),
  dina: commonAssessments("dina", [3, 3, 3, 3, 3, 3, 2, 2, 2]),
  eli: commonAssessments("eli", [3, 3, 3, 3, 3, 3, 2, 2, 2]),
  fatima: commonAssessments("fatima", [3, 3, 3, 3, 3, 3, 2, 2, 2]),
};

const cpuProcesses = [
  { name: "P1", arrival_time: 0, burst_time: 5, priority: 3 },
  { name: "P2", arrival_time: 1, burst_time: 3, priority: 1 },
  { name: "P3", arrival_time: 2, burst_time: 4, priority: 2 },
];

const memoryProcesses = [
  { name: "P1", size: 120 },
  { name: "P2", size: 240 },
  { name: "P3", size: 80 },
];

const memoryBlocks = [
  { name: "Block 1", size: 160 },
  { name: "Block 2", size: 300 },
  { name: "Block 3", size: 100 },
];

const cpuQuestion = (assessmentData: AssessmentData, index: number) => ({
  id: `${assessmentData.id}-q${index}`,
  questionText:
    index === 1
      ? "Which process is selected first?"
      : index === 2
        ? "Which process runs after P2 completes?"
        : "Which process has the shortest burst time?",
  selectedAnswer: JSON.stringify(cpuProcesses[index === 2 ? 2 : 1]),
  correctAnswer: JSON.stringify(cpuProcesses[index === 3 ? 1 : index === 2 ? 2 : 1]),
  processes: JSON.stringify(cpuProcesses),
  blocks: JSON.stringify(null),
  assessment: {
    submitted: assessmentData.submitted,
    variant: assessmentData.variant,
    score: assessmentData.score,
  },
  answer: { answers: JSON.stringify(cpuProcesses) },
});

const memoryQuestion = (assessmentData: AssessmentData, index: number) => ({
  id: `${assessmentData.id}-q${index}`,
  questionText:
    index === 1
      ? "Which process leaves the least unused space in Block 1?"
      : index === 2
        ? "Which process leaves the least unused space in Block 2?"
        : "Which process fits in Block 3?",
  selectedAnswer: JSON.stringify(memoryProcesses[index === 2 ? 1 : 2]),
  correctAnswer: JSON.stringify(memoryProcesses[index - 1]),
  processes: JSON.stringify(memoryProcesses),
  blocks: JSON.stringify(memoryBlocks),
  assessment: {
    submitted: assessmentData.submitted,
    variant: assessmentData.variant,
    score: assessmentData.score,
  },
  answer: { answers: JSON.stringify(memoryProcesses) },
});

export const findDemoAssessment = (assessmentId: string): DemoAssessment =>
  Object.values(demoAssessmentsByUser)
    .flat()
    .find(({ id }) => id === assessmentId) ?? demoAssessmentsByUser[demoUser.username][2];

export const getDemoQuestions = (assessmentId = ""): ReturnType<typeof cpuQuestion>[] => {
  const assessmentData = findDemoAssessment(assessmentId);
  const makeQuestion = assessmentData.variant.includes("Fit") ? memoryQuestion : cpuQuestion;
  return [1, 2, 3].map((index) => makeQuestion(assessmentData, index));
};
