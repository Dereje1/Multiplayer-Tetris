import RESTcall from '../../../crud'

export const processMatch = async (oppLinesCleared, state, props, winnerAudio) => {
  const { floorsRaised, difficulty } = state;
  const {
    socket: {
      temp: {
        gameOver,
      },
    }, user, game,
  } = props;
  // test if client is winner
  const iAmWinner = gameOver.winnerUserId === user.profile.userId;
  // get floor level of processing client
  const floorLevel = game.floor.floorHeight;
  // message for canvas display
  let multiplayerMessage;
  // prepare match object for db, only winner will send results
  if (iAmWinner || gameOver.disqualified) {
    winnerAudio.current.play();
    const matchObject = {
      winnerUserId: gameOver.winnerUserId,
      looserUserId: gameOver.looserUserId,
      difficulty,
      winnerLinesCleared: game.points.totalLinesCleared,
      winnerFloorsRaised: floorsRaised,
      looserLinesCleared: oppLinesCleared,
      looserFloorsRaised: floorLevel,
      looserDisqualified: gameOver.disqualified || false,
    };
    await RESTcall({ address: '/api/multiplayer', method: 'post', payload: matchObject })
  }
  // prepare message for canvas
  if (iAmWinner && gameOver.disqualified) {
    multiplayerMessage = {
      message: 'You Won!',
      floors: '  Opponent Disqualified',
    };
  } else {
    multiplayerMessage = {
      message: iAmWinner ? 'You Won!' : 'You Lost!',
      floors: `        ${floorsRaised} Floors Raised`,
    };
  }
  return multiplayerMessage;
};

export const processSinglePlayer = async ({ game, user }) => {
  if (!user.profile.authenticated) return null;
  const singlePlayerObject = {
    playerUserId: user.profile.userId,
    linesCleared: game.points.totalLinesCleared,
    levelReached: game.points.level,
  };
  await RESTcall({ address: '/api/single', method: 'post', payload: singlePlayerObject })
  return null;
};
