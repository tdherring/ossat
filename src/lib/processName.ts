export const getNextProcessName = (processes: readonly { name: string }[]) => {
  const existingNames = new Set(processes.map((process) => process.name));
  let index = 1;

  while (existingNames.has(`Process ${index}`)) index += 1;

  return `Process ${index}`;
};
