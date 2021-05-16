import React from 'react';
import PropTypes from 'prop-types';
import './styles/header.scss';
import {
  DialogTitle, Dialog, Button, ButtonGroup, Chip, Avatar, DialogContent, DialogActions,
} from '@material-ui/core';

const Invitation = ({
  invite, onDeclineInvite, onAcceptInvite,
}) => {
  const isOpen = Boolean(invite) && Boolean(invite.length);
  if (!isOpen) return null;
  return (
    <Dialog aria-labelledby="simple-dialog-title" open={isOpen}>
      <DialogTitle id="simple-dialog-title">{`${invite[0]} invites you to a duel!`}</DialogTitle>

      <DialogContent>
        <Chip
          color="primary"
          avatar={<Avatar>{invite[1]}</Avatar>}
          label="Difficulty"
          size="medium"
          style={{ marginLeft: 70 }}
        />
      </DialogContent>
      <DialogActions>
        <ButtonGroup
          color="primary"
          aria-label="vertical outlined primary button group"
        >
          <Button
            variant="contained"
            size="large"
            onClick={() => onAcceptInvite()}
            style={{ marginLeft: 10, marginBottom: 20, background: 'green' }}
          >
        Accept
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={() => onDeclineInvite()}
            style={{ marginLeft: 50, marginBottom: 20, background: 'red' }}
          >
        Decline
          </Button>
        </ButtonGroup>
      </DialogActions>

    </Dialog>
  );
};

export default Invitation;

Invitation.defaultProps = {
  invite: null,
};

Invitation.propTypes = {
  invite: PropTypes.arrayOf(PropTypes.any),
  onDeclineInvite: PropTypes.func.isRequired,
  onAcceptInvite: PropTypes.func.isRequired,
};
