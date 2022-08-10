import React from 'react';
import PropTypes from 'prop-types';
import RESTcall from '../../crud';
import { connect } from 'react-redux';
import SinglesTable from './SinglesTable';
import MatchesTable from './MatchesTable'
/* MUI */
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

const mapStateToProps = ({ user }) => ({ user });

export class Profile extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      userData: null, // fetched from db
      mode: false // switch table mode
    };
  }

  componentDidMount() {
    this.fetchUserStats();
  }

  fetchUserStats = async () => {
    try {
      const userData = await RESTcall({ address: '/api/user' });
      this.setState({ userData });
    } catch {
      this.setState({ userData: null });
    }
  };

  deleteResult = (id) => {
    const { userData: { singleStats } } = this.state;
    const updatedSingleStats = singleStats.filter(stat => stat._id !== id)
    this.setState({
      userData: {
        ...this.state.userData,
        singleStats: updatedSingleStats
      }
    }, async () => await RESTcall({ address: `/api/delete_single/${id}`, method: 'delete' }))
  }

  render() {
    const { userData, mode } = this.state;
    const { user } = this.props;
    if (!userData) return (
      <Box sx={{
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: 10,
        width: 900,
        height: 550,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <CircularProgress />
      </Box>
    );
    return (
      <Box
        sx={{
          marginLeft: 'auto',
          marginRight: 'auto',
          marginTop: 10,
          width: 900,
          height: 550,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Typography sx={{ fontSize: 22 }} color="primary">
          {
            `Hi ${user.profile.displayname}`
          }
        </Typography>
        <FormControl component="fieldset" variant="standard" >
          <FormGroup>
            <FormControlLabel
              control={
                <Switch checked={mode} onChange={() => { this.setState({ mode: !mode }) }} name="display_mode" />
              }
              label={mode ? 'Matches' : 'Single games'}
            />
          </FormGroup>
        </FormControl>
        {
          mode ?
            <MatchesTable
              rows={userData.matchStats}
              opponents={userData.opponentNames}
              userId={user.profile.username}
            />
            :
            <SinglesTable rows={userData.singleStats} onDelete={this.deleteResult} />
        }
      </Box>
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
      username: PropTypes.string,
    }),
  }),
};
