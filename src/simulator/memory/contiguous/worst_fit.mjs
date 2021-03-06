import MemoryManager from "../memory_manager.mjs";

class WorstFit extends MemoryManager {
  allocateProcesses(verbose = false) {
    if (verbose) console.log("\nOSSAT-WorstFit\n-----------------------------------------");

    // Set all process to be unallocated (null).
    for (let i = 0; i < this.jobQueue.length; i++) {
      this.allocated[this.jobQueue[i].getName()] = null;
    }

    for (let process of this.jobQueue) {
      let blockCounter = 0;
      let bestBlockCounter = 0;
      let bestBlock;
      for (let block of this.blocks) {
        // If the process fits in the block and it hasn't been allocated yet, and the next block is a worse fit.
        if (!Object.values(this.allocated).includes(block) && process.getSize() <= block.getSize() && (bestBlock == null || block.getSize() > bestBlock.getSize())) {
          bestBlock = block;
          bestBlockCounter = blockCounter;
        }
        blockCounter++;
      }
      this.allocated[process.getName()] = bestBlock;
      if (verbose && this.allocated[process.getName()])
        console.log("Process " + process.getName() + " (" + process.getSize() + ") allocated to Block " + bestBlockCounter + " (" + bestBlock.getSize() + ")");
    }
  }
}

// Syntax for use on frontend.

// let test_worst_fit = new WorstFit();

// // Create the blocks.

// test_worst_fit.createBlock(100);
// test_worst_fit.createBlock(500);
// test_worst_fit.createBlock(200);
// test_worst_fit.createBlock(300);
// test_worst_fit.createBlock(600);

// // Create the processes.

// test_worst_fit.createProcess("p1", 212);
// test_worst_fit.createProcess("p2", 417);
// test_worst_fit.createProcess("p3", 112);
// test_worst_fit.createProcess("p4", 426);

// test_worst_fit.allocateProcesses(true);

export default WorstFit;
