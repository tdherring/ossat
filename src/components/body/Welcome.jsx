import React from "react";
import fullLogo from "../assets/images/full-logo.svg";

const Welcome = () => {
  return (
    <div className="container py-6 px-6">
      <h1 className="title is-2 has-text-centered">Welcome to</h1>
      <img src={fullLogo} alt="OSSAT Logo" style={{ maxHeight: "250px" }}></img>
      <div className="columns pt-6">
        <div className="column has-text-right">
          <button className="button is-primary">
            <strong>Get Started</strong>
          </button>
        </div>
        <div className="column">
          <button className="button is-light">Learn More</button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
