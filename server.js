const express = require('express');
const path = require('path');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Serve i file statici dalla directory 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Reindirizza tutte le richieste a index.html (utile per SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Gestione delle connessioni socket.io
io.on('connection', (socket) => {
  console.log('Un utente si è connesso');

  socket.on('disconnect', () => {
    console.log('Un utente si è disconnesso');
  });
});

const port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log(`Server in ascolto sulla porta ${port}`);
}); 