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
  // Rimuovi l'header X-Content-Type-Options per permettere il caricamento degli script
  res.removeHeader('X-Content-Type-Options');
  
  // Imposta i MIME types corretti
  if (req.url.endsWith('.js')) {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  }
  
  // Configura CORS per Render.com
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Permetti l'esecuzione di script
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  
  next();
});

// Serve i file statici dalla directory 'public'
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
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