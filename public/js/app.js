let socket = io();
const startingSection = document.querySelector('.starting-section');
const maxPlayersSection = document.querySelector('.max-players-section');
const filled = document.querySelector('.filled');
const results = document.querySelector('.results');
const winningPlayer = document.querySelector('.winningPlayer');
const startButton = document.querySelector('.btn-start');
const container = document.querySelector('.container');
const grid = document.querySelector('.grid');

const x_class = 'X'
const o_class = 'O'
const winningCombos = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
const drawingCombos = [0,1,2,3,4,5,6,7,8]
const cellElement = document.querySelectorAll('[data-cell]')
const gridElement = document.getElementById('grid')

var AIgamestate = ["","","","","","","","",""];
const startAI = document.querySelector('.btn-start-AI');

let xTurn = "X"
let origionalTurn
let clientTurn
let playerCount = 0

socket.on('maxPlayers', () => {
    startButton.style.display = "none";
    //grid.style.display = "none";
    results.style.display = "none";
    filled.style.display = "block";
    maxPlayersSection.style.display = "block";
    socket.disconnect(true);
}); //if the start button breaks then its probably here

startButton.addEventListener('click', () => {
    socket.emit('startGame');
});

socket.on('refresh', (data) => {
    playerCount = data
    socket.emit('storeClientInfo', { socketID: socket.io.engine.id});
});

socket.on('disconecting', (data) => {
    playerCount = data
});

$("#startButton").hover(function(){
    $(this).html("Start\n" + playerCount + "/2");
},function(){
    $(this).html("Start");
});

socket.on('startGame', (data) => {
    document.body.style.backgroundColor = "#FFD166";
    updateBoard(data);
    socket.emit('associateTurn', function() {
        const sessionID = socket.io.engine.id; 
      }
)});

socket.on('assigned', (data) => {
    clientTurn = data
    console.log("this is the client turn", clientTurn)
    
    startGame();  
});

function startGame() { 
    startButton.style.display = "none";
    grid.style.display = "grid";
    startAI.style.display = "none";
    container.style.display = "block"
    results.style.display = "none";
    startingSection.style.display = "block";
    cellElement.forEach(cell => {
    cell.addEventListener('click', handleClick, {once: false})
    })
    setHoverClass()
}
function handleClick(e){
    const cell = e.target
    if(clientTurn == xTurn){
        placePiece(cell, xTurn)
    } else {
        //cell.classList.remove(currentClass)
        console.log("no")
    }
}

socket.on('win', (data) => {
    playerWin(data);
});

socket.on('draw', (data) => {
    playerDraw();
});

function playerWin(origionalTurn){
    startButton.style.display = "none";
    grid.style.display = "none";
    startingSection.style.display = "none";
    container.style.display = "none";
    document.body.style.backgroundColor = "#06D6A0";
    results.style.display = "block";
    winningPlayer.textContent = origionalTurn + " is the winner!"
    //alert(origionalTurn + ' Wins!')
}

function playerDraw(){
    startButton.style.display = "none";
    grid.style.display = "none";
    startingSection.style.display = "none";
    container.style.display = "none";
    document.body.style.backgroundColor = "#06D6A0";
    results.style.display = "block";
    winningPlayer.textContent = "It is a draw!"
    //alert(origionalTurn + ' Wins!')
}

function placePiece(cell, currentClass){
    console.log(currentClass) 
    cell.classList.add(currentClass)
    socket.emit('placed', 
        {class: currentClass,
          cell: $(cell).index()
        }
    );  
}

function setHoverClass(gamestate){
    gridElement.classList.remove(x_class)
    gridElement.classList.remove(o_class)
    if (clientTurn == x_class){
        gridElement.classList.add(x_class)
    } else if (clientTurn == o_class){
        gridElement.classList.add(o_class)
    }
    //if (xTurn == x_class){
    //    gridElement.classList.add(x_class)
    //} else {
    //    gridElement.classList.add(o_class)
    //}

}
function checkWin(origionalTurn){
    return winningCombos.some(combinations => {
        return combinations.every(index => {
            return cellElement[index].classList.contains(origionalTurn)
        })
    })
}

function checkDraw(){
    return drawingCombos.every(index => {
        return cellElement[index].classList.contains(x_class) || cellElement[index].classList.contains(o_class)
        
    })
}

socket.on('placed', (data) => {
    console.log('recieved')
    console.log(data)
    updateBoard(data);
});

function updateBoard(gamestate){
    xTurn = gamestate.turn;
    origionalTurn = gamestate.origional;
    cellElement.forEach((cell, position) => {
            cell.classList.remove(x_class);
            cell.classList.remove(o_class);
            if (gamestate.board[position] == x_class) {
                cell.classList.add(x_class);
            } else if (gamestate.board[position] == o_class) {
                cell.classList.add(o_class);
            }
    })
    console.log("We get to here")
    if (checkWin(origionalTurn)){
        console.log("win")
        socket.emit('win', origionalTurn);  
    } else if(!checkWin(origionalTurn)){
        if(checkDraw()){
            console.log("draw")
            socket.emit('draw'); 
        }
    }
    cellElement.forEach(cell => {
        cell.removeEventListener('click', handleClick, {once: true})
        if(cell.classList.contains("X") || cell.classList.contains("O")){
            console.log("Hello")
        } else {
            cell.addEventListener('click', handleClick, {once: true})
        }})
    setHoverClass(gamestate)
}

startAI.addEventListener('click', () => {
    document.body.style.backgroundColor = "#FFD166";
    startAI.style.display = "none";
    startButton.style.display = "none";
    grid.style.display = "grid";
    container.style.display = "block"
    results.style.display = "none";
    startingSection.style.display = "block";
    cellElement.forEach(cell => {
    cell.addEventListener('click', xPlaced, {once: true})
    });
    setAIHoverClass()
});

function setAIHoverClass(){
    gridElement.classList.remove(x_class)
    gridElement.classList.add(x_class)
}

function xPlaced(e){
    const cell = e.target  
    if(!(cell.classList.contains(x_class) || cell.classList.contains(o_class))){
        placeXPiece(cell, x_class)
    } else {
        console.log("no")
    }
}

function placeXPiece(cell, x_class){
    console.log(x_class) 
    cell.classList.add(x_class) 
    AIgamestate[$(cell).index()] = x_class;
    console.log(AIgamestate)
    updateAIBoard(AIgamestate) 
    chooseAIplace(AIgamestate)  
}

function updateAIBoard(AIgamestate){
    cellElement.forEach((cell, position) => {
            cell.classList.remove(x_class);
            cell.classList.remove(o_class);
            if (AIgamestate[position] == x_class) {
                cell.classList.add(x_class);
            } else if (AIgamestate[position] == o_class) {
                cell.classList.add(o_class);
            }
    })
    winningplayerCheck()
}

function winningplayerCheck(){
    console.log(AIgamestate)
    console.log("This is the bit to check who wins")
    if (checkWin(o_class)){
        console.log("win o")
        playerWin(o_class)  
    } else if (checkWin(x_class)){
        console.log("win x")
        playerWin(x_class)
    } else if(!checkWin(x_class)){
        if(checkDraw()){
            console.log("draw")
            playerDraw()
        }
    }
}

function chooseAIplace(AIgamestate){
    //let tempgameState = AIgamestate
    let blankCell = ""
    let chosenPlace = false
    console.log(AIgamestate);
    winningplayerCheck()
    cellElement.forEach((cell, position) => {
        if(!chosenPlace && !checkWin(x_class)){
            if (AIgamestate[position] == x_class){
                
            } else if (AIgamestate[position] == o_class) {
                    
            } else if (AIgamestate[position] == blankCell) {
                console.log("found blank space")
                cell.classList.add(o_class);
                AIgamestate[position] = o_class;
                console.log(AIgamestate)
                if (checkWin(o_class)){
                    console.log("checkwin o worked")
                    chosenPlace = true
                    winningplayerCheck()
                } else if(!checkWin(o_class)){
                    console.log("checkwin o didnt worked")
                    cell.classList.remove(o_class);
                    AIgamestate[position] = blankCell
                    chosenPlace = false
                }
            }

            if (AIgamestate[position] == x_class){
                
            } else if (AIgamestate[position] == o_class) {
                    
            } else if (AIgamestate[position] == blankCell) {
                console.log("found blank space")
                cell.classList.add(x_class);
                AIgamestate[position] = x_class;
                console.log(AIgamestate)
                if (checkWin(x_class)){
                    console.log("checkwin worked")
                    cell.classList.remove(x_class);
                    AIgamestate[position] = o_class
                    cell.classList.add(o_class);
                    chosenPlace = true
                    winningplayerCheck()
                } else if(!checkWin(x_class)){
                    console.log("checkwin didnt worked")
                    cell.classList.remove(x_class);
                    AIgamestate[position] = blankCell
                    chosenPlace = false
                }
            }
            
            console.log("WEGETHERE")
            if(position == 8 && chosenPlace == false){
                console.log(position)
                if(checkDraw()){
                
                }else{
                    console.log("WE GET HERE")
                    console.log(AIgamestate)
                    do{
                        let randomPos = getRandomInt(9)
                        console.log(randomPos)
                        if (AIgamestate[randomPos] == blankCell) {
                            console.log("WE NEVER GET HERE")
                            cellElement.forEach((cell, pos) => {
                                if (pos == randomPos){
                                    cell.classList.add(o_class);
                                    AIgamestate[pos] = o_class
                                    chosenPlace = true
                                    winningplayerCheck()
                                } 
                            })
                        } else {
                            
                        }
                    } while(!chosenPlace);
                }
            }
        } else{

        }
    });
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }