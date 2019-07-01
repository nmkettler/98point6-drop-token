import React from 'react';

const GameInfo = (props) => {
  
  
  return (
    <React.Fragment>
      <div className={`start-game-wrapper ${props.playing || props.win || props.draw || props.serviceFirst ? 'hidden' : ''}`}>
        <p>Who do you want to go first?</p>
        <button onClick={() => props.getCompMove()}>The Service?</button>
        <button className={`${props.playing || props.win || props.draw ? 'hidden' : ''}`} onClick={() => props.startUserGame()}>You</button>
      </div>
      <p id="win">{props.message}</p>
      <p className={props.error ? 'error' : 'hidden'}>{props.errorMessage}</p>
      <button className={` ${!props.message ? 'hidden' : 'replay-button'}`} onClick={() => props.reloadGame()}>Replay?</button>
    </React.Fragment>
  );
};

export default GameInfo;