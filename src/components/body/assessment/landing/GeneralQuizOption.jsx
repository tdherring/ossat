import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

const GeneralQuizOption = ({ name, completed, cpu, memory }) => {
  return (
    <tr>
      <td>
        <a href="/#">{cpu ? `CPU Scheduling: ${name}` : memory ? `Memory Management: ${name}` : null}</a>
      </td>
      <td className="has-text-centered">{completed && <FontAwesomeIcon icon={faCheck} />}</td>
      <td className="has-text-centered">{completed && <>10/10</>}</td>
    </tr>
  );
};

export default GeneralQuizOption;
