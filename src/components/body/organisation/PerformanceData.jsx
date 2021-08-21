import React from "react";

const PerformanceData = ({ organisations }) => {
  return (
    <div className="tile is-child box">
      <p className="title is-size-4">Performance Statistics</p>

      <hr className="is-divider mt-2" />
      <div className="content">
        <div className="select is-fullwidth">
          <select>
            {organisations.map((org) => (
              <option key={org.name} href="/#" className="dropdown-item" value={org.name}>
                {org.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default PerformanceData;
