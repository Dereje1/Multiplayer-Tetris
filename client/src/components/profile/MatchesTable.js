import * as React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
/* MUI */
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';

const getStatusIcon = (isWinner) => (
  isWinner ? <EmojiEventsIcon sx={{ color: 'green', fontSize: 26 }} />
    :
    <SentimentVeryDissatisfiedIcon sx={{ color: 'red', fontSize: 26 }} />
)

const extractRowInfo = ({ row, opponents, userId }) => {
  const isWinner = userId === row.winnerGoogleId
  const opponentId = isWinner ? row.looserGoogleId : row.winnerGoogleId
  const details = ['You', opponents[opponentId]].map((player, idx) => {
    if (idx === 0) {
      return isWinner ?
        {
          player,
          linesCleared: row.winnerLinesCleared,
          floorsRaised: row.winnerFloorsRaised,
          isDisqualified: 'No'
        }
        :
        {
          player,
          linesCleared: row.looserLinesCleared,
          floorsRaised: row.looserFloorsRaised,
          isDisqualified: row.looserDisqualified ? 'Yes' : 'No'
        }
    }

    return isWinner ?
      {
        player,
        linesCleared: row.looserLinesCleared,
        floorsRaised: row.looserFloorsRaised,
        isDisqualified: row.looserDisqualified ? 'Yes' : 'No'
      }
      :
      {
        player,
        linesCleared: row.winnerLinesCleared,
        floorsRaised: row.winnerFloorsRaised,
        isDisqualified: 'No'
      }
  })
  return {
    ...row,
    opponentName: opponents[opponentId],
    isWinner: getStatusIcon(isWinner),
    details
  }
}

export const Row = ({ row, opponents, userId }) => {
  const [open, setOpen] = React.useState(false);
  const rowInfo = extractRowInfo({ row, opponents, userId })
  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {moment.utc(rowInfo.createdAt).format('MMMM Do YYYY, h:mm a')}
        </TableCell>
        <TableCell align="center">{rowInfo.opponentName}</TableCell>
        <TableCell align="center">{rowInfo.isWinner}</TableCell>
        <TableCell align="center">{rowInfo.difficulty}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography  gutterBottom component="div" sx={{fontWeight:'bold'}}>
                Details
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell align="center">Lines cleared</TableCell>
                    <TableCell align="center">Floors raised</TableCell>
                    <TableCell align="center">Disqualified</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rowInfo.details.map((detailsRow, idx) => (
                    <TableRow key={`${rowInfo._id}_${idx}`}>
                      <TableCell component="th" scope="row">
                        {detailsRow.player}
                      </TableCell>
                      <TableCell align="center">{detailsRow.linesCleared}</TableCell>
                      <TableCell align="center">{detailsRow.floorsRaised}</TableCell>
                      <TableCell align="center">
                        {detailsRow.isDisqualified}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

export default function MatchesTable({ rows, opponents, userId }) {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Date (UTC)</TableCell>
            <TableCell align="center">Opponent</TableCell>
            <TableCell align="center">Win/Loss</TableCell>
            <TableCell align="center">Difficulty level</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <Row
              key={row._id}
              row={row}
              opponents={opponents}
              userId={userId}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

MatchesTable.propTypes = {
  rows:PropTypes.arrayOf(PropTypes.object).isRequired,
  opponents: PropTypes.object.isRequired,
  userId:PropTypes.string.isRequired
}

Row.propTypes = {
  row: PropTypes.object.isRequired,
  opponents: PropTypes.object.isRequired,
  userId:PropTypes.string.isRequired
}