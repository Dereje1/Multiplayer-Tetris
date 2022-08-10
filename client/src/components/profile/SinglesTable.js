import * as React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
/* MUI */
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

export default function SinglesTable({rows}) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell align="center">Lines Cleared</TableCell>
            <TableCell align="center">Level Reached</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row._id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {moment.utc(row.createdAt).format('MMMM Do YYYY, h:mm:ss a')}
              </TableCell>
              <TableCell align="center">{row.linesCleared}</TableCell>
              <TableCell align="center">{row.levelReached}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

SinglesTable.propTypes = {
  rows:PropTypes.arrayOf(PropTypes.object).isRequired
}