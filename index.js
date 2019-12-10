class Field {
   score = 0;
   constructor(size) {
      this.field = Array(size).fill(0).map(() => Array(20).fill(0));
      this.field[0][1] = 2;
      this.field[0][0] = 1;
      this.headCoords = {
         row: 0,
         column: 1,
      };
      this.neckCoords = {
         row: 0,
         column: 0,
      };
      this.snakeLength = 2;
      this.generateFeed();
   }
   getField() {
      return this.field;
   }
   generateFeed() {
      while (true) {
         const coords = this.getRandomCoords();
         if (this.field[coords.row][coords.column] === 0) {
            this.field[coords.row][coords.column] = -1;
            break;
         }
      }
   }
   getRandomCoords() {
      return {
         row: ~~(Math.random() * this.field.length),
         column: ~~(Math.random() * this.field.length),
      }
   }
   nextTick(keyPress) {
      let nextHeadCoords;
      if (keyPress === 'ArrowUp') {
         nextHeadCoords = {
            row: this.headCoords.row - 1,
            column: this.headCoords.column,
         };
      }
      if (keyPress === 'ArrowDown') {
         nextHeadCoords = {
            row: this.headCoords.row + 1,
            column: this.headCoords.column,
         };
      }
      if (keyPress === 'ArrowRight') {
         nextHeadCoords = {
            row: this.headCoords.row,
            column: this.headCoords.column + 1,
         };
      }
      if (keyPress === 'ArrowLeft') {
         nextHeadCoords = {
            row: this.headCoords.row,
            column: this.headCoords.column - 1,
         };
      }
      if (nextHeadCoords.row === this.neckCoords.row && nextHeadCoords.column === this.neckCoords.column) {
         nextHeadCoords = {
            row: this.headCoords.row + (this.headCoords.row - this.neckCoords.row),
            column: this.headCoords.column + (this.headCoords.column - this.neckCoords.column),
         }
      }
      if (nextHeadCoords.row < 0 ||
         nextHeadCoords.row > this.field.length - 1 ||
         nextHeadCoords.column > this.field.length - 1 ||
         nextHeadCoords.column < 0 || this.field[nextHeadCoords.row][nextHeadCoords.column] > 0) throw new Error('endGame');
      if (this.field[nextHeadCoords.row][nextHeadCoords.column] === 0) {
         for (let i = 0; i < this.field.length; i++) {
            for (let g = 0; g < this.field.length; g++) {
               this.field[i][g] = this.field[i][g] === 0 ? 0 : this.field[i][g] - 1;
            }
         }
         this.field[nextHeadCoords.row][nextHeadCoords.column] = this.snakeLength;
      } else {
         this.snakeLength += 1;
         this.generateFeed();
         this.field[nextHeadCoords.row][nextHeadCoords.column] = this.snakeLength;
         this.score += 100 + (~~(Math.random() * 50));
      }
      this.neckCoords = this.headCoords;
      this.headCoords = nextHeadCoords;
   }
}

class Game {
   score = 0;
   lastKeyboardPress = 'ArrowRight';
   constructor(divField, size) {
      this.divField = divField;
      this.field = new Field(size);
      this.fieldDivs = Array(size).fill(0).map(() => Array(size).fill(0));
      console.log(this.field);
   }
   initializeField() {
      if (this.divField.childElementCount !== this.field.getField().length) {
         while (this.divField.firstChild) {
            this.divField.removeChild(this.divField.firstChild);
         }
      }
      let i = 0;
      let g = 0;
      for (const a of this.field.getField()) {
         const child = this.divField.appendChild(document.createElement('div'));
         child.setAttribute('class', 'row-square');
         for (const b of this.field.getField()) {
            const square = child.appendChild(document.createElement('div'));
            square.setAttribute('class', 'square');
            this.fieldDivs[i][g] = square;
            g++;
         }
         g = 0;
         i++;
      }
   }
   drawField() {
      for (let indexRow = 0; indexRow < this.fieldDivs.length; indexRow++) {
         for (let indexColumn = 0; indexColumn < this.fieldDivs.length; indexColumn++) {
            const square = this.fieldDivs[indexRow][indexColumn];
            if (this.field.getField()[indexRow][indexColumn] > 0) {
               square.setAttribute('class', 'square snake');
            }
            if (this.field.getField()[indexRow][indexColumn] === 0) {
               square.setAttribute('class', 'square');
            }
            if (this.field.getField()[indexRow][indexColumn] < 0) {
               square.setAttribute('class', 'square feed');
            }
         }
      }
   }
   gameLoop(onScoreChange) {
      this.field.nextTick(this.lastKeyboardPress);
      if (this.score !== this.field.score) onScoreChange(this.field.score);
      this.score = this.field.score;
      this.drawField();
   }
   startGame(diff, onScoreChange) {
      this.loop = setInterval(() => {
         try {
            this.gameLoop(onScoreChange);
         } catch (e) {
            alert(e.message);
            this.stopGame();
         }
      }, 1000 / diff);
      window.onkeydown = (e) => this.lastKeyboardPress = e.code;
   }
   stopGame() {
      clearInterval(this.loop);
      window.onkeydown = undefined;
   }
}

function startGame() {
   console.log('initializing');
   const field = document.getElementById('field');
   while (field.firstChild) field.removeChild(field.firstChild);
   const game = new Game(field, 20);
   game.initializeField();
   game.drawField();
   try {
      game.startGame(4, onScoreChange);
   } catch (e) {
      game.stopGame();
      alert(e.message);
   }
}

function onScoreChange(score) {
   document.getElementById('score').innerText = score;
}
