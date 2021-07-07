import MemoryManager from "../memory_manager.mjs";

class FirstFit extends MemoryManager {
  allocateProcesses(verbose = false) {
    if (verbose) console.log("\nOSSAT-FirstFit\n-----------------------------------------");

    // Set all process to be unallocated (null).
    for (let i = 0; i < this.jobQueue.length; i++) {
      this.allocated[this.jobQueue[i].getName()] = null;
    }

    for (let process of this.jobQueue) {
      let blockCounter = 0;
      for (let block of this.blocks) {
        if (!Object.values(this.allocated).includes(block) && process.getSize() <= block.getSize()) {
          this.allocated[process.getName()] = block;
          break;
        }
        blockCounter++;
      }
      if (verbose && this.allocated[process.getName()])
        console.log("Process " + process.getName() + " (" + process.getSize() + ") allocated to Block " + blockCounter + " (" + this.allocated[process.getName()].getSize() + ")");
    }
  }
}

// Syntax for use on frontend.

// let test_first_fit = new FirstFit();

// // Create the blocks.

// test_first_fit.createBlock(100);
// test_first_fit.createBlock(500);
// test_first_fit.createBlock(200);
// test_first_fit.createBlock(300);
// test_first_fit.createBlock(600);

// // Create the processes.

// test_first_fit.createProcess("p1", 212);
// test_first_fit.createProcess("p2", 417);
// test_first_fit.createProcess("p3", 112);
// test_first_fit.createProcess("p4", 426);

// test_first_fit.allocateProcesses(true);

export default FirstFit;
