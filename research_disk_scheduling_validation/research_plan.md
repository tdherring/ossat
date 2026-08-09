# Disk scheduling validation plan

## Main question

Does OSSAT's disk-scheduling simulator implement the standard policies and movement metrics correctly, and does its hardware visualization accurately communicate what the model does and does not simulate?

## Subtopics

1. **Scheduling policies and movement accounting**
   - Confirm the canonical behavior of FCFS, SSTF, SCAN, C-SCAN, LOOK, and C-LOOK.
   - Check boundary visits, wrap movement, duplicate requests, initial-head requests, and direction handling.
   - Compare those rules with the simulation implementation and test representative traces.

2. **Physical-disk model and visualization semantics**
   - Confirm how tracks, cylinders, platters, actuator arms, seek time, rotational latency, and transfer time relate.
   - Determine whether a spinning platter, concentric cylinder rings, and a fixed actuator are accurate for a cylinder-only scheduling model.
   - Identify any visual claim that exceeds the implemented model.

## Synthesis

Combine authoritative operating-systems and storage references with direct code inspection and executable trace checks. Report required correctness findings first, followed by technically accurate limitations and optional pedagogical improvements.
