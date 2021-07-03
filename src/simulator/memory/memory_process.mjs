class MemoryProcess {
  constructor(name, size) {
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
