const express = require('express');
const path = require('path');
const app = express();

// Servi i file statici dalla directory public
app.use(express.static('public'));

// Gestisci tutte le altre richieste reindirizzandole a index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Avvia il server sulla porta specificata da Render.com o sulla 3000 di default
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server in esecuzione sulla porta ${PORT}`);
}); 