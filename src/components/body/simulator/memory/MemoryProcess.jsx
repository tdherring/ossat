import React, { useContext } from "react";
import { ResizeContext } from "../../../../contexts/ResizeContext";

const MemoryProcess = ({ name, size }) => {
  const [widthValue] = useContext(ResizeContext).width;

  return (
    <div className={`column ${widthValue > 2400 ? "is-2" : widthValue > 1680 ? "is-3" : widthValue > 1250 ? "is-4" : widthValue > 930 ? "is-6" : "is-12"}`}>
      <div className="box has-background-white-bis">
        <h6 className="is-size-6">
          <strong>{name}</strong>
        </h6>
        <hr className="is-divider my-3" />
        <h6 className="is-size-6">Size: {size}</h6>
      </div>
    </div>
  );
};

export default MemoryProcess;
