import MemoryBlock from "./memory_block.mjs";
import MemoryProcess from "./memory_process.mjs";

class MemoryManager {
  constructor() {
    this.jobQueue = [];
    this.blocks = [];
    this.allocated = [];
  }

  createBlock(size) {
    this.blocks.push(new MemoryBlock(size));
  }

  createProcess(name, size) {
    if (this.jobQueue.filter((process) => process.name === name).length > 0) {
      console.warn("You can't have two processes with the same ID. Skipping (" + name + ", " + size + ") and continuing silently.");
      return;
    }
    this.jobQueue.push(new MemoryProcess(name, size));
  }

  getJobQueue() {
    return this.jobQueue;
  }

  getBlocks() {
    return this.blocks;
  }

  getAllocated() {
    return this.allocated;
  }

  getProcessByName(name) {
    return this.jobQueue.filter((process) => process.name === name)[0];
  }
}

export default MemoryManager;
