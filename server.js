//importações básicas
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessages = require('./utils/messages')
const { userJoin,getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');
//variáveis gerais
const app = express();
const server = http.createServer(app);
var io = socketio(server);
const botName = 'Bot';

//setando páginas estáticas
app.use(express.static(path.join(__dirname, 'public')));

//porta 3000 ou a que ta na variável de ambiente
const PORT = 3011 || process.env.PORT;

server.listen(PORT, () => console.log(`servidor rodando na porta ${PORT}`));

//roda quando o cliente se conecta
io.on('connection', function (socket) {
  //join Room
  socket.on('joinRoom', ({ username, room })=> {

    const user = userJoin(socket.id,username,room);

    socket.join(user.room);

    //printando lado servidor    
    console.log(`uma nova conexão com id :${socket.id} || o usuario ${user.username} || na sala ${user.room}`);

    // emitindo mensagem de boas-vindas
    socket.emit('message', formatMessages(botName, `Bem-vindo ${user.username}`));

    // Brodcast quando o usuario conecta
    socket.broadcast.to(user.room).emit('message', formatMessages(botName, `${user.username} foi adicionado a sala`));    

    // envia informações de user e room

    io.to(user.room).emit('roomUsers',{
      room: user.room,
      users: getRoomUsers(user.room)
    });

  });

  //ouvindo de chatMessage no lado do servidor
  socket.on('chatMessage', function (msg) {
    const user = getCurrentUser(socket.id);
     

    io.to(user.room).emit('message', formatMessages(user.username, msg));
  });

  //desconectando usuario
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if(user){
      io.to(user.room).emit('message', formatMessages(botName, `${user.username} saiu da sala`));
       
      io.to(user.room).emit('roomUsers',{
        room: user.room,
        users: getRoomUsers(user.room)
      });
    
    } 
  });
  
});
