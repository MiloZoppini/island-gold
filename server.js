const express = require('express');
const path = require('path');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
  }
});

// Configura gli header di sicurezza e MIME types
app.use((req, res, next) => {
  // Imposta i MIME types corretti
  if (req.url.endsWith('.js')) {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  }
  
  // Configura CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Permetti l'esecuzione di script cross-origin
  res.removeHeader('Cross-Origin-Resource-Policy');
  res.removeHeader('Cross-Origin-Embedder-Policy');
  res.removeHeader('Cross-Origin-Opener-Policy');
  
  // Permetti il caricamento di moduli ES6
  if (req.url.endsWith('.js')) {
    res.setHeader('Access-Control-Allow-Private-Network', 'true');
  }
  
  next();
});

// Serve i file statici dalla directory 'public'
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.removeHeader('Cross-Origin-Resource-Policy');
    }
  }
}));

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
http.listen(port, '0.0.0.0', () => {
  console.log(`Server in ascolto sulla porta ${port}`);
}); 