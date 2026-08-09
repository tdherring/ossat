class MemoryProcess {
  readonly name: string;
  readonly size: number;
  readonly timeAdded: number;

  constructor(name: string, size: number) {
    this.name = name;
    this.size = size;
    this.timeAdded = Date.now();
  }

  getName() {
    return this.name;
  }

  getSize() {
    return this.size;
  }

  getTimeAdded() {
    return this.timeAdded;
  }
}

export default MemoryProcess;
