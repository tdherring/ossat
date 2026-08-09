class MemoryBlock {
  readonly size: number;
  readonly timeAdded: number;

  constructor(size: number) {
    this.size = size;
    this.timeAdded = Date.now();
  }

  getSize() {
    return this.size;
  }

  getTimeAdded() {
    return this.timeAdded;
  }
}

export default MemoryBlock;
