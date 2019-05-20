import React from 'react';
import lineClearSoundFile from './styles/clearedline.wav';
import maxLineClearSoundFile from './styles/maxclearedlines.wav';
import looserSoundFile from './styles/Looser.wav';
import winnerSoundFile from './styles/Winner.wav';

export const audioTypes = {
  winnerAudio: winnerSoundFile,
  looserAudio: looserSoundFile,
  clearAudio: lineClearSoundFile,
  maxClearAudio: maxLineClearSoundFile,
};

export const Audio = ({ ...props }) => (
  Object.keys(audioTypes).map(audio => (
    <audio ref={props[audio]} key={audio} src={audioTypes[audio]}>
      <track kind="captions" />
    </audio>
  ))
);
