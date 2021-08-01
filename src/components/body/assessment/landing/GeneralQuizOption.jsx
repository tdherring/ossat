import React, { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { QuizContext } from "../../../../contexts/QuizContext";
import { PageContext } from "../../../../contexts/PageContext";

const GeneralQuizOption = ({ name, completed, cpu, memory, id, score, totalQs }) => {
  const [, setActiveQuizID] = useContext(QuizContext).active;
  const [, setActivePage] = useContext(PageContext);

  return (
    <tr>
      <td>
        <a
          href="/#"
          onClick={() => {
            setActiveQuizID(id);
            localStorage.setItem("activeQuizID", id);
            setActivePage("quiz");
          }}
        >
          {cpu ? `CPU Scheduling: ${name}` : memory ? `Memory Management: ${name}` : null}
        </a>
      </td>
      <td className="has-text-centered">{completed && <FontAwesomeIcon icon={faCheck} />}</td>
      <td className="has-text-centered">
        {completed && (
          <>
            {score}/{totalQs}
          </>
        )}
      </td>
    </tr>
  );
};

export default GeneralQuizOption;
