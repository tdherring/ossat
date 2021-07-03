class MemoryBlock {
  constructor(size) {
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
