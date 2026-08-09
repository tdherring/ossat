import MemoryManager from "../memory_manager";

class WorstFit extends MemoryManager {
  allocateProcesses() {
    console.debug("\nOSSAT-WorstFit\n-----------------------------------------");

    this.initializeAllocations();

    for (const process of this.jobQueue) {
      let bestBlockIndex = 0;
      let bestBlock;
      for (const [blockIndex, block] of this.blocks.entries()) {
        // If the process fits in the block and it hasn't been allocated yet, and the next block is a worse fit.
        if (
          !this.isBlockAllocated(block) &&
          process.getSize() <= block.getSize() &&
          (bestBlock == null || block.getSize() > bestBlock.getSize())
        ) {
          bestBlock = block;
          bestBlockIndex = blockIndex;
        }
      }
      this.allocated[process.getName()] = bestBlock ?? null;
      if (bestBlock) {
        console.debug(
          `Process ${process.getName()} (${process.getSize()}) allocated to Block ${bestBlockIndex} (${bestBlock.getSize()})`,
        );
      }
    }
  }
}

export default WorstFit;
