import React from "react";
import CPUModule from "./body/cpu/CPUModule";
import MemoryModule from "./body/memory/MemoryModule";

const Body = () => {
  return (
    <div className="p-3">
      <div className="tile is-ancestor">
        <MemoryModule />
        <CPUModule />
      </div>
    </div>
  );
};

export default Body;
