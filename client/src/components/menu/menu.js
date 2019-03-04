import React from 'react';
import PropTypes from 'prop-types';
import { NavLink, withRouter } from 'react-router-dom';
/* font awesome */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars, faTimes, faSignOutAlt, faUser, faGamepad,
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

  componentDidUpdate(prevprops) {
    const { location: { pathname: currentPath } } = this.props;
    const { location: { pathname: prevPath } } = prevprops;
    if (prevPath !== currentPath) this.closeMenu();
  }

  componentWillUnmount() {
    window.removeEventListener('click');
    clearTimeout(this.closeId);
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
      this.closeId = setTimeout(() => {
        clearTimeout(this.closeId);
        this.setState({ showMenu: false, delay: false });
      }, 475);
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
          <NavLink className="menuitems" exact to="/profile">
            <FontAwesomeIcon
              icon={faUser}
            />
            <p>Profile</p>
          </NavLink>
          <div>
            <NavLink className="menuitems" exact to="/">
              <FontAwesomeIcon
                icon={faGamepad}
              />
              <p>Game</p>
            </NavLink>
          </div>
        </div>
      </div>);
  }

}

export default withRouter(Menu);

Menu.propTypes = {
  onLogOut: PropTypes.func.isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
};
