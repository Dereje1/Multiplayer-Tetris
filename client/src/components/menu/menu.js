import React from 'react';
import PropTypes from 'prop-types';
/* font awesome */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars, faTimes, faSignOutAlt, faUser,
} from '@fortawesome/free-solid-svg-icons';
import './styles/menu.css';

class Menu extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      showMenu: false,
      delay: false,
    };
  }

  componentDidMount() {
    window.addEventListener('click', () => this.closeMenu());
  }

  componentWillUnmount() {
    window.removeEventListener('click');
  }

  openMenu = (e) => {
    this.setState({ showMenu: true });
    e.stopPropagation();
  }

  closeMenu = () => {
    const { showMenu } = this.state;
    if (!showMenu) return;
    // added delay so slide out css effect can be seen
    this.setState({ delay: true }, () => {
      const closeId = setTimeout(() => {
        clearTimeout(closeId);
        this.setState({ showMenu: false, delay: false });
      }, 500);
    });
  }

  render() {
    const { showMenu, delay } = this.state;
    const { onLogOut } = this.props;

    if (!showMenu && !delay) {
      return (
        <FontAwesomeIcon
          className="burger"
          icon={faBars}
          onClick={e => this.openMenu(e)}
        />
      );
    }

    return (
      <div
        id="menu"
        className={!delay ? 'show' : 'hide'}
        onKeyDown={() => {}}
        tabIndex={-1}
        role="menuitem"
        onClick={e => this.openMenu(e)}
      >
        <FontAwesomeIcon
          className="close"
          icon={faTimes}
          onClick={() => this.closeMenu()}
        />
        <div id="items">
          <div
            className="menuitems"
            onClick={() => onLogOut()}
            onKeyDown={() => {}}
            role="menuitem"
            tabIndex={-1}
          >
            <FontAwesomeIcon
              icon={faSignOutAlt}
            />
            <p>Logout</p>
          </div>
          <div
            className="menuitems"
            onClick={() => {}}
            onKeyDown={() => {}}
            role="menuitem"
            tabIndex={-1}
          >
            <FontAwesomeIcon
              icon={faUser}
            />
            <p>Profile</p>
          </div>
        </div>
      </div>);
  }

}

export default Menu;

Menu.propTypes = {
  onLogOut: PropTypes.func.isRequired,
};
