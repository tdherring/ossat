import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
  return (
    <footer className="footer" id="page-footer">
      <div className="content has-text-centered">
        <p>
          <strong>OSSAT</strong>, a Final Year MSc Project by Tom Herring. Developed for <a href="https://kcl.ac.uk">Kings College London</a>.
        </p>
        <p>
          <a href="https://github.com/tdherring/OSSAT-Frontend" className="has-text-grey">
            <FontAwesomeIcon icon={faGithub} className="is-size-4" />
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
