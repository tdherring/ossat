# HDD geometry and access-time evidence

## Sources

### University of Wisconsin–Madison, CS 537: Disk Scheduling

Source: https://pages.cs.wisc.edu/~ganoop/cs537/disksched.html

- An operating disk spins rapidly; its read/write heads are attached to a common arm and move toward or away from the spindle.
- A track is a ring-shaped region at one radius on one recording surface. A cylinder is the set of corresponding equal-radius tracks swept by all heads, across the recording surfaces.
- Seeking is the physical repositioning and settling of the arm at the required cylinder. Rotational latency is the subsequent wait for the required angular location to pass beneath the head. Transfer is a separate final phase.
- The notes explicitly describe the disk as **constantly spinning** while it waits for the required sector.

Relevant material: lines 20–30 and 69–86 in the web version.

### University of Wisconsin–Madison, CS 537: Lecture 23

Source: https://pages.cs.wisc.edu/~cao/cs537/lecture23.html

- Disk access comprises seek latency, rotational latency, and transfer latency.
- The notes distinguish classic shortest-seek-time-first, which considers head/cylinder distance, from algorithms that also account for rotational position.
- They explain that rotational latency requires sector-position information. A simulator whose requests contain only cylinder numbers cannot calculate it.

Relevant material: lines 3–16.

### Schlosser, Ganger, Dusseau and Dusseau, _Memories and Storage_, University of Wisconsin / CMU disk-characterisation paper

Source: https://pages.cs.wisc.edu/~remzi/Postscript/disk.pdf

- Platters contain concentric tracks divided into sectors; equal-radius tracks across surfaces form a cylinder.
- Heads are ganged on the disk arm. Moving the arm to the required cylinder is seek time; waiting for a sector to rotate beneath the head is rotational latency; moving the data is transfer time.
- Zoned-bit recording means outer tracks may contain more sectors than inner tracks.
- Seek time is not linear with seek distance. Therefore a cylinder-distance total is a scheduling cost proxy, not a physical time measurement.

Relevant material: PDF page 1, especially extracted lines 70–84; non-linearity is noted around extracted lines 198–200.

### Seagate, Cheetah 15K.7 SAS Product Manual

Source: https://www.seagate.com/files/www-content/support-content/documentation/product%20manuals/en-us/enterprise/Cheetah/15K.7/SAS/100516226f.pdf

- A real example has a 15,000 RPM spindle and 2.0 ms average rotational latency.
- Single-track, average, and full-stroke seek times differ materially, confirming that seeking is mechanical and distance-dependent.
- The manual describes a straight-arm actuator assembly and separately specifies spindle rotation, seek performance, rotational latency, and media transfer rate.
- The spindle stops only through stop/power-management behaviour; scheduler playback being paused is not a physical reason for an active drive to stop spinning.

Relevant material: PDF pages 9–13 (manual sections 3.3, 4.1 and 4.2).

### IBM, DASD physical characteristics and AIX hardware hierarchy

Sources:

- https://www.ibm.com/docs/en/zos/3.2.0?topic=media-dasd-physical-characteristics
- https://www.ibm.com/docs/en/aix/7.1.0?topic=performance-hardware-hierarchy

- IBM describes tracks as concentric circles and cylinders as groups of tracks.
- IBM separates seeking the arm to the correct cylinder, waiting for the block to rotate under the head, and transmitting the data.

## Validation implications for OSSAT

### Correct for a cylinder-only teaching model

- A platter with concentric request rings is a reasonable **projection** of cylinder positions onto one surface. Strictly, each visible ring is a track on that surface; the cylinder includes the same-radius tracks on all surfaces.
- A rigid actuator arm rotating about a fixed base pivot, with its head meeting the selected radius, is an appropriate schematic of a rotary HDD actuator.
- Showing the platter rotating provides useful hardware context.
- Computing movement as `abs(nextCylinder - currentCylinder)` is the conventional cylinder-distance metric for these algorithms, provided it is labelled as cylinders/positions travelled rather than milliseconds or total access time.

### Important limitations and required wording

1. **The platter should not start and stop with scheduler playback.** In an active HDD, it normally spins continuously. Pausing the teaching animation may pause all motion for UI purposes, but that is not a claim about drive mechanics. The more technically faithful choice is continuous slow rotation whenever the simulator is mounted/active, with only `prefers-reduced-motion` stopping it.
2. **Rotation must not affect cylinder-only results.** Without sector/angular addresses, OSSAT cannot calculate rotational latency, sector arrival, or transfer time. A note such as “Cylinder seek model — rotational latency and transfer time not simulated” is accurate.
3. **Only platter artwork rotates.** Track/cylinder rings are rotationally symmetric and request cylinders have no angular position. The actuator, head, labels, and cylinder rail must remain fixed to the chassis; otherwise the rendering is mechanically false.
4. **Do not draw a cylinder request as a sector marker.** A dot or wedge at a particular angle would invent sector information. Concentric rings or a separate linear cylinder rail are correct abstractions.
5. **Movement is not time.** Seek time is nonlinear and includes acceleration, deceleration, and settling. Equal-duration arm animations and totals measured in cylinder units are pedagogical, not physical timing.
6. **Cylinder 0's radial side is a convention in this visualisation.** Traditional teaching examples use numbered endpoints, but modern logical block addressing hides actual geometry. If 0 is mapped to the outer edge, treat that as an explicit diagram convention rather than a hardware guarantee.
7. **One visible platter is schematic.** A real multi-platter drive has one head per surface with the heads ganged at the same radius. The diagram should not imply that a cylinder is only one ring on one surface.

## Bottom line

The disk rendering is technically sound **as a cylinder-seek schematic** if it uses concentric cylinder positions, a chassis-fixed rotary actuator, and continuous contextual platter rotation. It is not a full disk-access simulation: it omits head/surface selection, sectors, rotational latency, transfer time, controller caching, and the nonlinear relationship between cylinder distance and seek duration. The UI should state that boundary clearly.
