import MemoryBlock from "./memory_block";
import MemoryProcess from "./memory_process";

class MemoryManager {
  protected jobQueue: MemoryProcess[] = [];
  protected blocks: MemoryBlock[] = [];
  protected allocated: Record<string, MemoryBlock | null> = {};

  createBlock(size: number) {
    this.blocks.push(new MemoryBlock(size));
  }

  createProcess(name: string, size: number) {
    if (this.jobQueue.some((process) => process.name === name)) {
      console.warn(
        "You can't have two processes with the same ID. Skipping (" +
          name +
          ", " +
          size +
          ") and continuing silently.",
      );
      return;
    }
    this.jobQueue.push(new MemoryProcess(name, size));
  }

  reset() {
    this.jobQueue = [];
    this.blocks = [];
    this.allocated = {};
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

  getProcessByName(name: string) {
    return this.jobQueue.find((process) => process.name === name);
  }

  initializeAllocations() {
    for (const process of this.jobQueue) {
      this.allocated[process.getName()] = null;
    }
  }

  isBlockAllocated(block: MemoryBlock) {
    return Object.values(this.allocated).includes(block);
  }
}

export default MemoryManager;
