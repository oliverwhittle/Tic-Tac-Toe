const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const publicPath    = path.join(__dirname, '/../public');
const port = process.env.PORT || 3000;
let app = express();
let server = http.createServer(app);
let io = socketIO(server);
var userNames = {};
var gamestate = {board: ["","","","","","","","",""], turn: "X", origional: "O"};

var clients =[];
let origionalTurn
let assignedTurn

app.use(express.static(publicPath));

server.listen(port, ()=> {
    console.log(`Server is up on port ${port}.`)
});


io.on('connection', (socket) => {
   
    console.log('A user just connected.');
    var total = io.engine.clientsCount
    console.log(total);
    if (total <= "2"){
        console.log('two players');
    }else if (total > "2"){
        console.log('more than two players');
        console.log(socket.id);
        io.to(socket.id).emit('maxPlayers');
    }
    
    clients =[]
    io.emit('refresh', total)

    socket.on('storeClientInfo', (data) => {

        var clientInfo = new Object();
        clientInfo.clientId = socket.id;
        clients.push(clientInfo);
        if(clients.length < 2){
            clients.push("X")
        } else if(clients.length >= 2){
            clients.push("O")
        }
        console.log(clients)
    })

    socket.on('disconnect', (socket) => {
    console.log('A user has disconnected.');
    var total = io.engine.clientsCount
    console.log(total)
    io.emit('disconecting', total)
    for( var i=0, len=clients.length; i<len; ++i ){
        var c = clients[i];

        if(c.clientId == socket.id){
            clients.splice(i,1);
            break;
        }
    }
    })

    socket.on('startGame', () => {
        gamestate = {board: ["","","","","","","","",""], turn: "X", origional: "O"};
    console.log('Game started');
    io.emit('startGame', gamestate);
    })

    socket.on('associateTurn', (data) => {
        if(socket.id == clients[0].clientId){
            assignedTurn = clients[1]
        } else if (socket.id == clients[2].clientId) {
            assignedTurn = clients[3]
        }
    io.to(socket.id).emit("assigned", assignedTurn)
    })

    socket.on('placed', (data) => { 
        console.log(gamestate)
    gamestate.board[data.cell] = data.class; 
    if(socket.id == clients[0].clientId && gamestate.turn == "X"){
        origionalTurn = gamestate.turn
        console.log(gamestate.turn)
        gamestate.turn = "O"
        console.log(gamestate.turn)
    } else if (socket.id == clients[2].clientId && gamestate.turn == "O") {
        origionalTurn = gamestate.turn
        console.log(gamestate.turn)
        gamestate.turn = "X"
        console.log(gamestate.turn)
    }
    gamestate.origional = origionalTurn
    console.log(data);
    io.emit('placed', gamestate);
    })
    
    socket.on('win', (data) => {
    console.log(data);  
    io.emit('win', data);
    })

    socket.on('draw', (data) => {  
    io.emit('draw');
    })
});
