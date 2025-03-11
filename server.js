const express = require('express');
const path = require('path');
const app = express();

// Serve i file statici dalla directory 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Reindirizza tutte le richieste a index.html (utile per SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server in ascolto sulla porta ${port}`);
}); 