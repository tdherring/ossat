# Canonical disk-scheduling policy behaviour

## Scope of the model

The classic algorithms below schedule a batch/queue of outstanding requests by cylinder (or track) position. They minimise or compare **seek distance/head movement**, not full I/O time. Full positioning time also depends on rotational latency, and transfer time is another component again. Modern drives normally hide enough physical geometry that an operating system cannot model rotation precisely; OSTEP therefore distinguishes SSTF from SPTF/SATF, which accounts for both seek and rotation.

Sources:

- University of Illinois Chicago, _Operating Systems: Mass-Storage Structure_: https://www.cs.uic.edu/~jbell/CourseNotes/OperatingSystems/10_MassStorage.html
- OSTEP, _Hard Disk Drives_: https://pages.cs.wisc.edu/~remzi/OSTEP/file-disks

## Policy rules

### FCFS

- Service every request in arrival/insertion order.
- Initial direction and disk endpoints are irrelevant.
- No reordering is allowed, including for an apparently closer request.

### SSTF

- From the current head cylinder, service a request on the nearest cylinder next.
- Re-evaluate after each service.
- It can starve distant requests under a continuing workload.
- Equal-distance ties do not have a universally specified winner. A simulator should define and expose a deterministic tie-breaker, ideally stable queue order.

OSTEP explicitly defines SSTF as ordering requests by track and choosing a request on the nearest track first: https://pages.cs.wisc.edu/~remzi/OSTEP/file-disks

### SCAN

- Requires an initial direction.
- Move in that direction, servicing requests encountered in cylinder order.
- Continue to the **physical endpoint** of the modelled cylinder range, even if the final request in that direction was earlier; then reverse.
- Endpoint travel is head movement and must be represented in the movement trace/metric even though the endpoint is not itself an I/O request.
- A scheduler that reverses at the furthest pending request is LOOK, not strict SCAN.

UIC describes SCAN as moving from one end of the disk to the other and back: https://www.cs.uic.edu/~jbell/CourseNotes/OperatingSystems/10_MassStorage.html

### C-SCAN

- Requires an initial servicing direction and services requests in that direction only.
- Continue to the physical endpoint, then reposition to the opposite endpoint **without servicing requests during that return**; resume in the original direction.
- The return is circular in scheduling order, but a real actuator does not teleport. The endpoint-to-endpoint reposition is physical head movement and belongs in total movement.
- Preserve the same servicing direction after the wrap.

The University of Michigan describes C-SCAN as sweeping end-to-end and then seeking all the way back: https://web.eecs.umich.edu/~bnoble/482/handouts/file.pdf

### LOOK

- Requires an initial direction.
- Service requests in that direction in cylinder order.
- Reverse immediately at the furthest pending request in that direction, rather than travelling to the physical endpoint.
- If there is no pending request ahead, reverse without first visiting the endpoint.

UIC explicitly defines LOOK as not moving farther toward the end than necessary: https://www.cs.uic.edu/~jbell/CourseNotes/OperatingSystems/10_MassStorage.html

### C-LOOK

- Requires an initial servicing direction and services requests in that direction only.
- Stop at the furthest pending request in that direction; then reposition directly to the furthest request at the other side of the pending set and resume in the original direction.
- It does not visit either physical disk endpoint unless an actual request is there.
- The reposition/wrap is still physical head movement, so include its absolute cylinder distance in total movement.

The UC Davis worked example includes a 169-cylinder C-LOOK wrap in a 322-cylinder total: https://nob.cs.ucdavis.edu/classes/ecs150-1999-02/io-example.html

## Movement accounting

For a cylinder-only simulator, total movement should be:

`sum(abs(nextHeadCylinder - currentHeadCylinder))`

over **every physical head transition**, including:

- movement from the initial head position to the first service;
- SCAN/C-SCAN travel to a physical endpoint;
- C-SCAN endpoint-to-endpoint return;
- C-LOOK last-request-to-first-request wrap;
- zero-distance services at the current cylinder.

Do not include a non-request endpoint in the count of serviced requests. A conventional average movement per request is `total movement / number of serviced requests`. UC Davis reports this form of total and average and, importantly, counts circular wraps: https://nob.cs.ucdavis.edu/classes/ecs150-1999-02/io-example.html

Calling that value **average seek time** is technically too strong unless the simulator also applies a seek-time function. Prefer **average seek distance** or **average head movement**. Textbook treatments often use cylinder distance as a seek-time proxy because seek time is approximately related to seek distance.

## Duplicate and current-cylinder requests

- Duplicate cylinder values can represent distinct I/O requests. Unless the simulator explicitly models request merging, it should retain and service every request.
- Once the head is at that cylinder, consecutive requests there add zero cylinder movement.
- A request at the initial/current head cylinder should be serviceable immediately and contribute zero movement.
- Stable arrival order is a sensible deterministic ordering for multiple requests at the same cylinder; it does not affect the movement metric.
- In a dynamic SCAN model, requests arriving after the head has already passed their cylinder wait for a later sweep. OSTEP states this sweep behaviour explicitly: https://pages.cs.wisc.edu/~remzi/OSTEP/file-disks

## Direction and endpoint conventions that must be explicit in the UI

- Define whether “increasing” means toward larger cylinder numbers; do not equate it with physical “inward” unless the cylinder numbering convention is also defined.
- Define the valid range precisely, e.g. `0..199` means the high endpoint is 199. Off-by-one endpoint assumptions materially change SCAN and C-SCAN totals.
- FCFS and SSTF do not use a direction control.
- SCAN, C-SCAN, LOOK, and C-LOOK do.
- Circular algorithms must keep their chosen servicing direction after the return/wrap.

## Authoritative worked-example cross-check

UC Davis uses requests `98, 183, 37, 122, 14, 124, 65, 67`, initial head `53`, and an outward direction. It reports:

| Policy | Service order                     | Total movement |
| ------ | --------------------------------- | -------------: |
| FCFS   | 98, 183, 37, 122, 14, 124, 65, 67 |            640 |
| SSTF   | 65, 67, 37, 14, 98, 122, 124, 183 |            236 |
| SCAN   | 37, 14, 65, 67, 98, 122, 124, 183 |            236 |
| LOOK   | 37, 14, 65, 67, 98, 122, 124, 183 |            208 |
| C-SCAN | 65, 67, 98, 122, 124, 183, 14, 37 |            384 |
| C-LOOK | 65, 67, 98, 122, 124, 183, 14, 37 |            322 |

Source: https://nob.cs.ucdavis.edu/classes/ecs150-1999-02/io-example.html

The same service order can have a different total if a course uses a different physical maximum cylinder. Therefore the implementation test must use the source's exact endpoint convention, or construct its own expected totals from the configured inclusive range.

## Validation checklist for OSSAT

1. Verify the six service orders against static traces in both increasing and decreasing directions where applicable.
2. Verify strict SCAN/C-SCAN insert non-service endpoint trace nodes; LOOK/C-LOOK do not.
3. Verify both C-SCAN and C-LOOK include the wrap distance in total movement.
4. Verify an inclusive maximum cylinder is used consistently in validation, SVG mapping, and policy logic.
5. Verify duplicates and initial-head requests remain distinct services with zero incremental movement.
6. Verify SSTF ties use a documented deterministic rule.
7. Label metrics as cylinder movement/distance, not elapsed seek or access time.
8. If the platter spins, label the animation as illustrative: these six cylinder-only algorithms do not calculate angular position, rotational latency, sector transfer, controller scheduling, or request merging.
