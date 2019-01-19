import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import './styles/footer.css';

const Footer = () => (
  <div id="footer">
    <p>{'Dereje Getahun \u00A9 2019'}</p>
    <FontAwesomeIcon
      id="github"
      icon={faGithub}
      onClick={() => window.open('https://github.com/Dereje1')}
    />
  </div>
);

export default Footer;
