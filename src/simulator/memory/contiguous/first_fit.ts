import MemoryManager from "../memory_manager";

class FirstFit extends MemoryManager {
  allocateProcesses() {
    console.debug("\nOSSAT-FirstFit\n-----------------------------------------");

    this.initializeAllocations();

    for (const process of this.jobQueue) {
      for (const [blockIndex, block] of this.blocks.entries()) {
        if (!this.isBlockAllocated(block) && process.getSize() <= block.getSize()) {
          this.allocated[process.getName()] = block;
          console.debug(
            `Process ${process.getName()} (${process.getSize()}) allocated to Block ${blockIndex} (${block.getSize()})`,
          );
          break;
        }
      }
    }
  }
}

export default FirstFit;
