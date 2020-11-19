

const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users'); 
// pegando o usuario e sala pela url
const { username, room } = Qs.parse(location.search,{
    ignoreQueryPrefix: true
});


console.log(username,room);


var socket = io();

// join room
socket.emit('joinRoom',{username,room});

//pegando informacao de user e room
socket.on('roomUsers',({room,users})=>{
    outputRoomName(room);
    outputUsers(users);
});


// emitindo mensagem vinda do servidor para cliente
socket.on('message', (message) => {
    console.log(message);
    mensagemSaida(message);
    //scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// mensagem no lado cliente
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // pegando mensagem de texto
    const msg = e.target.elements.msg.value;
    //emitindo do cliente ao servidor
    socket.emit('chatMessage', msg);
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

// mensagemSaida
function mensagemSaida(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

//adicionando nome da room

function outputRoomName(room){
    roomName.innerText = room;
}

//adicionando nomes de usuarios em lista
function outputUsers(users) {
    userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}