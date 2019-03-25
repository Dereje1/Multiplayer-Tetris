import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import moment from 'moment';
import { connect } from 'react-redux';
/* font awesome */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faInfoCircle, faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';
import './styles/profile.css';

const mapStateToProps = state => state;

class Profile extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      userData: null, // fetched from db
      computedData: null, //  computed
      detail: [null, null], // overview mode or detail mode
    };
  }

  componentDidMount() {
    const { user } = this.props;
    // check if redux store has updated user before rendering takes over for a router mount
    if (Object.keys(user).length) {
      this.fetchUserStats();
    }
  }

  componentDidUpdate(prevProps) {
    const { user } = this.props;
    const { user: prevUser } = prevProps;
    // check if redux store has updated user before rendering takes over for a fresh mount
    if (!Object.keys(prevUser).length && Object.keys(user).length) {
      this.fetchUserStats();
    }
  }

  fetchUserStats = async () => {
    try {
      // get data
      const { data: userData } = await axios.get('/api/user');
      // compute data
      this.crunchData(userData);
    } catch {
      console.log('Error fetching user Data');
    }
  }

  crunchData = (userData) => {
    const { user } = this.props;
    const obj = {};
    /* MP */
    const matches = [...userData.matchStats];
    const winArr = matches.filter(m => m.winnerGoogleId === user.profile.username);
    const lossArr = matches.filter(m => m.winnerGoogleId !== user.profile.username);
    obj.wins = winArr.length;
    obj.losses = lossArr.length;
    obj.disqualifications = lossArr.filter(l => l.looserDisqualified).length;
    /* SP */
    const singles = [...userData.singleStats];
    const spLinesCleared = singles.reduce((a, b) => (a + b.linesCleared), 0);
    const avLevel = singles.reduce((a, b) => (a + b.levelReached), 0) / singles.length;
    obj.spTotalLinesCleared = spLinesCleared;
    obj.averageLevel = Math.floor(avLevel);
    // ready to render after set state
    this.setState({ userData, computedData: obj });
  }

  getRecentMatches = () => {
    // displays the last 4 mathces user played
    const { userData } = this.state;
    const { user } = this.props;
    const matches = userData.matchStats.slice(0, 4);
    const recent = matches.map((m) => {
      const gmtDateTime = moment.utc(m.createdAt);
      const happened = gmtDateTime.utc().fromNow();
      const win = m.winnerGoogleId === user.profile.username;
      const opponentName = win
        ? userData.opponentNames[m.looserGoogleId]
        : userData.opponentNames[m.winnerGoogleId];
      return (
        <span key={m._id} className="recentDescription">
          {`${opponentName.split(' ')[0]}, ${happened} `}
          <FontAwesomeIcon
            icon={faInfoCircle}
            className={`info ${win ? 'Won' : 'Lost'}`}
            onClick={() => this.setState({ detail: ['match', m] })}
          />
        </span>
      );
    });
    return (
      <React.Fragment>
        <span className="recentDescriptionHeader">Recent Matches</span>
        {recent}
      </React.Fragment>
    );
  }

  getRecentGames = () => {
    // displays last 4 games user played
    const { userData } = this.state;
    const games = userData.singleStats.slice(0, 4);
    const recent = games.map((g) => {
      const gmtDateTime = moment.utc(g.createdAt);
      const happened = gmtDateTime.utc().fromNow();
      return (
        <span key={g._id} className="recentDescription">
          {`${happened} `}
          <FontAwesomeIcon
            icon={faInfoCircle}
            className="info"
            onClick={() => this.setState({ detail: ['single', g] })}
          />
        </span>
      );
    });
    return (
      <React.Fragment>
        <span className="recentDescriptionHeader">Recent Games</span>
        {recent}
      </React.Fragment>
    );
  }

  generateMatchDetail = () => {
    // displays a match detail
    const { detail, userData } = this.state;
    const { user } = this.props;
    const [, match] = detail;
    const win = match.winnerGoogleId === user.profile.username;
    const opponentId = win ? match.looserGoogleId : match.winnerGoogleId;
    const opponetName = userData.opponentNames[opponentId];
    const disqualified = !win && match.looserDisqualified;
    const tweetMessage = win
      ? `${moment(match.createdAt).format('MMMM Do YYYY')}, I Won against ${opponetName} In Multi Player Tetris`
      : `${moment(match.createdAt).format('MMMM Do YYYY')}, I Lost to ${opponetName} In Multi Player Tetris`;
    return (
      <React.Fragment>
        <span className="detailitems">{moment(match.createdAt).format('MMMM Do YYYY, h:mm:ss a')}</span>
        <span className="detailitems">{`You ${win ? 'Won' : 'Lost'} against ${opponetName}`}</span>
        {disqualified ? <span>Lost By Disqualification!</span> : null}
        <span className="detailitems">{`Lines Cleared by You: ${win ? match.winnerLinesCleared : match.looserLinesCleared}`}</span>
        <span className="detailitems">{`Lines Cleared by ${opponetName.split(' ')[0]}: ${!win ? match.winnerLinesCleared : match.looserLinesCleared}`}</span>
        <span className="detailitems">{`Floors Raised by You: ${win ? match.winnerFloorsRaised : match.looserFloorsRaised}`}</span>
        <span className="detailitems">{`Floors Raised by ${opponetName.split(' ')[0]}: ${!win ? match.winnerFloorsRaised : match.looserFloorsRaised}`}</span>
        <span className="detailitems">{`Game Difficulty Level: ${match.difficulty}`}</span>
        <FontAwesomeIcon
          className="action tweet"
          icon={faTwitter}
          onClick={() => window.open(`https://twitter.com/intent/tweet?hashtags=Tetris&url=https://multiplayer-tetris.herokuapp.com/&text=${tweetMessage}`)}
        />
      </React.Fragment>
    );
  }

  generateSingleDetail = () => {
    const { detail } = this.state;
    const [, single] = detail;
    const tweetMessage = `${moment(single.createdAt).format('MMMM Do YYYY')}, I cleared ${single.linesCleared} Lines in Single Player Tetris`;
    return (
      <React.Fragment>
        <span className="detailitems">{moment(single.createdAt).format('MMMM Do YYYY, h:mm:ss a')}</span>
        <span className="detailitems">{`Total Lines Cleared: ${single.linesCleared}`}</span>
        <span className="detailitems">{`Level Reached : ${single.levelReached}`}</span>
        <FontAwesomeIcon
          className="action tweet"
          icon={faTwitter}
          onClick={() => window.open(`https://twitter.com/intent/tweet?hashtags=Tetris&url=https://multiplayer-tetris.herokuapp.com/&text=${tweetMessage}`)}
        />
      </React.Fragment>
    );
  }

  overView = () => {
    const { userData, computedData } = this.state;
    const { user } = this.props;
    return (
      <div id="card">
        <span id="name">{user.profile.displayname}</span>
        <div id="detail">
          <div id="match">
            <span className="head">{`${userData.matchStats.length} Matches`}</span>
            <span>{`Wins - ${computedData.wins}`}</span>
            <span>{`Losses - ${computedData.losses} (DQ - ${computedData.disqualifications})`}</span>
            <div className="recentmatches">
              {this.getRecentMatches()}
            </div>
          </div>
          <div id="Single">
            <span className="head">{`${userData.singleStats.length} Single Player Games`}</span>
            <span>{`Total Lines Cleared - ${computedData.spTotalLinesCleared}`}</span>
            <span>{`Average Level Reached - ${computedData.averageLevel}`}</span>
            <div className="recentgames">
              {this.getRecentGames()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  detailView = () => {
    const { detail } = this.state;
    return (
      <div id="gameDetail">
        <FontAwesomeIcon
          className="action"
          icon={faTimes}
          onClick={() => this.setState({ detail: [null, null] })}
        />
        {
          detail[0] === 'match'
            ? this.generateMatchDetail()
            : this.generateSingleDetail()
        }
      </div>
    );
  }

  render() {
    const { userData, detail } = this.state;
    if (!userData) return null;
    return (
      <div id="profile">
        {
          detail[0]
            ? this.detailView()
            : this.overView()
        }
      </div>
    );
  }

}

export default connect(mapStateToProps)(Profile);

Profile.defaultProps = {
  user: null,
};

Profile.propTypes = {
  user: PropTypes.shape({
    profile: PropTypes.shape({
      displayname: PropTypes.string,
    }),
  }),
};
