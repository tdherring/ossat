# Physical-disk validation for OSSAT

## Verdict

The proposed rendering is technically defensible **as a cylinder-seek schematic**, not as a complete hard-disk access simulation. Concentric rings and a rigid rotary actuator are appropriate. The current decision to make the platter spin only while scheduler playback is running is the main physical inaccuracy: an active HDD spindle normally rotates continuously, independently of whether the scheduler trace is playing.

## What the hardware model gets right

- Tracks are concentric recording rings on each platter surface. A cylinder is the collection of equal-radius tracks across all recording surfaces. Showing cylinder requests as concentric rings on one schematic platter is therefore a reasonable projection, provided the UI does not call each visible ring the entire physical cylinder.
- A conventional HDD positions ganged read/write heads with a rotary voice-coil actuator. A rigid arm rotating about a chassis-fixed pivot, with the head meeting the selected radius, is an appropriate schematic.
- Cylinder movement can be counted as `|next - current|`. This is the conventional distance metric used to compare seek-oriented policies.
- Only the platter artwork should rotate. The actuator, head, labels, and linear cylinder scale are fixed to the chassis. Track rings are rotationally symmetric, so their appearance does not change as the platter turns.

Sources:

- University of Wisconsin, _Operating Systems: Three Easy Pieces — Hard Disk Drives_: https://pages.cs.wisc.edu/~remzi/OSTEP/file-disks.pdf
- Seagate/Maxtor product manual, rotary voice-coil actuator definition: https://www.seagate.com/staticfiles/maxtor/en_us/documentation/manuals/d540x-4d_ata100_manual.pdf
- Seagate, magnetic-storage organisation: https://www.seagate.com/blog/how-magnetic-storage-devices-are-organized/

## Access time and what OSSAT does not model

The standard simplified decomposition is:

`I/O time = seek time + rotational latency + transfer time`

- **Seek time** is the time for the actuator to accelerate, move, decelerate, and settle over the target track/cylinder.
- **Rotational latency** is the wait for the required sector's angular position to reach the head after the correct track is selected.
- **Transfer time** is the time spent reading or writing the data once the sector is beneath the head.

OSSAT's requests contain cylinder positions only. It has no sector/angular address, rotational phase, transfer size, media rate, or seek-time curve. It therefore cannot calculate rotational latency, transfer time, or physical access time. It models only service order and cylinder distance.

Cylinder distance is not milliseconds. Real seek time is nonlinear with distance and includes settling; an equal-duration arm transition is explanatory animation, not a timing model. A label such as **“Cylinder seek model — rotational latency and transfer time are not simulated”** is technically accurate. Metrics should say **cylinders/positions travelled**, not seek time.

Sources:

- OSTEP, access-time equation and seek phases: https://pages.cs.wisc.edu/~remzi/OSTEP/file-disks.pdf
- University of Wisconsin CS 537, disk latency components: https://pages.cs.wisc.edu/~cao/cs537/lecture23.html
- Seagate Medalist manual, seek defined through head settling and latency specified separately: https://www.seagate.com/support/disc/manuals/ata/31220pm.pdf
- Schlosser et al., disk geometry and nonlinear seek behaviour: https://pages.cs.wisc.edu/~remzi/Postscript/disk.pdf

## Correct spinning behaviour

- In a powered, active HDD, the spindle runs at its operating RPM; it does not stop because a scheduling demonstration is paused. Drive power-management or stop commands are separate behaviours.
- The platter should therefore rotate continuously while the simulator is present/active, or remain entirely static if the application chooses a diagram rather than an animation.
- `prefers-reduced-motion` should disable the cosmetic rotation.
- Rotation must remain contextual only. It must not advance the trace, alter request order, or suggest a sector arriving beneath the head, because the model has no sector positions.
- Do not draw cylinder requests as dots or wedges at arbitrary angles: that invents sector information. Concentric rings plus a separate exact cylinder rail are the correct abstraction.

Sources:

- University of Wisconsin CS 537, active disk described as constantly spinning: https://pages.cs.wisc.edu/~ganoop/cs537/disksched.html
- Seagate product manual, spindle operating speed and separate stop/power-management behaviour: https://www.seagate.com/files/www-content/support-content/documentation/product%20manuals/en-us/enterprise/Cheetah/15K.7/SAS/100516226f.pdf
- Seagate Medalist manual, spindle start/stop sequence: https://www.seagate.com/support/disc/manuals/ata/31220pm.pdf

## Remaining schematic conventions

- Mapping cylinder `0` to the outer or inner edge is a diagram convention, not a universal modern-drive guarantee. State the convention if it matters pedagogically.
- A single displayed platter suppresses head/surface selection and the ganged multi-head assembly.
- Modern drives expose logical block addresses rather than usable physical geometry to the host; OSSAT is intentionally teaching the classic abstract cylinder model.
- Zoned-bit recording means outer tracks often hold more sectors than inner tracks, another reason not to infer transfer timing or angular sector positions from the rings.

## Required correction

Decouple platter rotation from the scheduler's play/pause state. Keep the platter continuously spinning as ambient hardware context (subject to reduced-motion preferences), while the actuator moves only when the trace advances. Preserve the explicit note that rotational latency and transfer time are excluded.
