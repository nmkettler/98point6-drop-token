import React, { Component } from 'react';
import './App.css';
import axios from 'axios';
import GameInfo from './components/game-intro'

class App extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      board: [
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null]
      ],
      serviceFirst: false,
      player: undefined,
      p1: 'red',
      p2: 'blue',
      row: 4,
      col: 4,
      winningCells: 4,
      errorMessage: '',
      playing: false,
      firstMove: false,
      invalidMove: false,
      message: '',
      win: false,
      draw: false,
      error: false,
      allMoves: [],
      rows: [0,1,2,3,],
    }
    
    // Binding all functions here for a cleaner look
    this.startUserGame = this.startUserGame.bind(this)
    this.handleMove = this.handleMove.bind(this)
    this.togglePlayer = this.togglePlayer.bind(this)
    this.serviceRequest = this.serviceRequest.bind(this)
    this.getCompMove = this.getCompMove.bind(this)
    this.addGamePiece = this.addGamePiece.bind(this)
    this.checkGameStatus = this.checkGameStatus.bind(this)
    this.checkPlayerCounts = this.checkPlayerCounts.bind(this)
    this.winByRow = this.winByRow.bind(this)
    this.winDiagonally = this.winDiagonally.bind(this)
    this.setGameWin = this.setGameWin.bind(this)
    this.gameStatusDraw = this.gameStatusDraw.bind(this)
    this.setError = this.setError.bind(this)
    this.reloadGame = this.reloadGame.bind(this)
    this.renderCell = this.renderCell.bind(this)
  }
  
  startUserGame() {
    // Set state when the user goes first
    this.setState ({
      playing:  true,
      firstMove:  true,
      draw:  false,
      win:  false,
      allMoves:  [],
      serviceFirst:  false,
      player:  'gamePlayer',
    })
  }

  reloadGame () {
    window.location.reload()
  }

  handleMove(column) {
    // Set amount of initial cells (3 because it's zero based indexing)
    let cell = 3;
    
    this.togglePlayer()

    if (this.state.draw || this.state.win) {
      // Prevent next move
      return;
    }

    this.state.board[column].map((currentcell) => {
      // Prevent cells from overlapping
      if (currentcell) {
        cell--;
      }
    })

    if (cell === -1) {
      // Throw error if the cell is falsey
      this.setError();
    }
    else {
      this.setState({
        invalidMove: false,
        error: false,
        errorMessage: '',
      })

      if (this.state.serviceFirst && this.state.player === 'service' || !this.state.serviceFirst && this.state.player === 'gamePlayer') {
        let boardArrayState = this.state.board;
        boardArrayState[column][cell] = 1;

        this.setState({
          board: boardArrayState,
        })
        this.addGamePiece(column, cell, this.state.p1);
      }
      else {
        let boardArrayState = this.state.board;
        boardArrayState[column][cell] = 2;

        this.setState({
          board: boardArrayState,
        })
        this.addGamePiece(column, cell, this.state.p2);
      }
    }

    if (!this.state.invalidMove && this.state.player === 'gamePlayer') {
      this.getCompMove(column);
    }
    else if (this.state.invalidMove && this.state.player === 'service') {
      this.getCompMove();
    }

    if (!this.state.invalidMove) {
      if (this.state.player === 'service') {
        this.setState({
          player: 'gamePlayer'
        })
      } else {
        this.setState({
          player: 'service'
        })
      }
      
      return true;
    }
  }

  togglePlayer() {
    if (!this.state.player) {
      if (this.state.serviceFirst) {
        this.setState({
          player: 'service',
        })
      }
      else {
        this.setState({
          player: 'gamePlayer',
        })
      }
    }
  }

  serviceRequest() {
    axios.get(`https://w0ayb2ph1k.execute-api.us-west-2.amazonaws.com/production?moves=[${this.state.allMoves}]`)
      .then(response => {
        if (response.status !== 200) {
          this.setState({
            error: true,
            errorMessage: response.responseText,
          })
        }
        let serviceColNum = response.data[response.data.length - 1];

        this.setState({
          error: false,
        })
        if (this.handleMove(serviceColNum)) {
          this.setState({
            allMoves: [...this.state.allMoves, response.data[response.data.length - 1]],
          })
        }
      }).catch(e => {
        console.log(e)
      })
  }

  getCompMove(column) {
    if (this.state.allMoves.length === 0) {
      this.setState({
        firstMove: false,
      })

      if (!column && column !== 0) {
        this.setState({
          serviceFirst: true,
        })
      }
    }

    this.serviceRequest()
  }

  addGamePiece(columnNum, cellNum, playerColor) {
    this['dataRow' + cellNum + 'Col' + columnNum].classList.add(playerColor)
    this.checkGameStatus();
  }

  checkGameStatus() {
    let cell = 15;

    this.state.board.map((column) => {
      let playerOneCount = 0,
        playerTwoCount = 0;

      for (let i = 0; i < column.length; i++) {
        if (column[i]) {
          column[i] === 1 ? playerOneCount++ : playerTwoCount++;
          cell--;
        }
      }

      if (cell === -1) {
        this.gameStatusDraw();
        return;
      }

      this.checkPlayerCounts(playerOneCount, playerTwoCount);
    })

    this.winByRow();
    this.winDiagonally();
  }

  checkPlayerCounts(playerOneCount, playerTwoCount) {
    if (playerOneCount === this.state.winningCells) {
      this.setGameWin('p1');
    }
    else if (playerTwoCount === this.state.winningCells) {
      this.setGameWin('p2');
    }
  }

  winDiagonally() {
    let winner;
    const board = this.state.board;
    
    // Using double equals for now because board[x][y] is an object which === will do a 
    // type conversion. May need to convert to integer first
    if (board[3][3] == board[2][2] == board[1][1] == board[0][0]) {
      winner = board[0][0];
    }
    else if (board[0][3] == board[1][2] == board[2][1] == board[3][0]) {
      winner = board[0][3];
    }

    if (winner === 1) {
      this.setGameWin('p1');
    }
    else if (winner === 2) {
      this.setGameWin('p2');
    }
  }

  winByRow() {
    for (let i = 0; i < this.state.col; i++) {
      let playerOneCount = 0,
        playerTwoCount = 0;
      let row = this.state.board.map((column) => {
        return column[i];
      });

      for (let x = 0; x < this.state.row; x++) {
        if (row[x]) {
          row[x] === 1 ? playerOneCount++ : playerTwoCount++;
        }
      }

      this.checkPlayerCounts(playerOneCount, playerTwoCount);
    }
  }

  setGameWin(winningPlayer) {
    this.setState({
      win: true,
      playing: false,
    })

    if (winningPlayer === 'p1' && this.state.serviceFirst) {
      this.setState({
        message: 'The computer  won!',
      })
    }
    else if (winningPlayer === 'p2' && !this.state.serviceFirst) {
      this.setState({
        message: 'The computer  won!',
      })
    }
    else {
      this.setState({
        message: 'You won!',
      })
    }
  }

  gameStatusDraw() {
    this.setState({
      draw: true,
      playing: false,
      message: 'The game was a draw!',
    })
  }

  setError() {
    this.setState({
      invalidMove: true,
    })

    if (this.player === 'gamePlayer') {
      this.setState({
        error: true,
        errorMessage: 'Invalid move. Try that again.',
      })
    }
  }
  
  renderCell (column) {
    let cell = this.state.rows.map((i, item) => {
      return (
        <div ref={(ctx) => this[`dataRow${i}Col${column}`] = ctx} className="cell"></div>
      )
    })
    return cell;
  }
  
  render() {
    return (
      <React.Fragment>
        <GameInfo {...this.state} startUserGame={this.startUserGame} getCompMove={this.getCompMove} reloadGame={this.reloadGame} />
        <div className={`cell-wrapper ${this.state.playing || this.state.serviceFirst ? '' : 'prevent-click'}`}>
          <div className="column" onClick={() => this.handleMove(0)}>
            {this.renderCell(0)}
          </div>
          <div className="column" onClick={() => this.handleMove(1)}>
            {this.renderCell(1)}
          </div>
          <div className="column" onClick={() => this.handleMove(2)}>
            {this.renderCell(2)}
          </div>
          <div className="column" onClick={() => this.handleMove(3)}>
            {this.renderCell(3)}
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default App;