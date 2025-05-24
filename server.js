const express = require('express');
const app = express();
const port = Number(process.env.PORT || 3000);
const server = app.listen(port);

const io = require('socket.io')(server);  // Add Socket.IO

app.use(express.static('public'));

console.log(`Server is listening on port ${port}`);

// Socket.IO logic
io.on('connection', (socket) => {
  console.log("New connection: " + socket.id);

  socket.on('update', (data) => {
    // Broadcast the drawing data to all other clients
    socket.broadcast.emit('userUpdate', data);
  });

  socket.on('disconnect', () => {
    console.log("Client disconnected: " + socket.id);
  });
});
