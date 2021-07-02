import React, { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faPlay, faStepBackward, faStepForward, faFastBackward, faFastForward, faPlus, faPause, faTimes } from "@fortawesome/free-solid-svg-icons";
import { ResizeContext } from "../../../contexts/ResizeContext";

const MemoryControls = () => {
  const [widthValue] = useContext(ResizeContext).width;

  return (
    <div className={`field is-grouped is-grouped-multiline ${widthValue < 1127 && "is-grouped-centered"}`}>
      {" "}
      <span className="control buttons is-grouped has-addons">
        <button className="button is-primary" href="/#">
          <FontAwesomeIcon icon={faFastBackward} />
        </button>
        <button className="button is-primary" href="/#">
          <FontAwesomeIcon icon={faStepBackward} />
        </button>
        <button className="button is-primary" href="/#">
          <FontAwesomeIcon icon={faPlay} />
        </button>
        <button className="button is-primary" href="/#">
          <FontAwesomeIcon icon={faStepForward} />
        </button>
        <button className="button is-primary" href="/#">
          <FontAwesomeIcon icon={faFastForward} />
        </button>
      </span>
    </div>
  );
};

export default MemoryControls;
