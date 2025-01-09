console.log("Iniciando el servidor...");

const express = require('express');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

console.log("Servidor configurado, configurando rutas...");

app.get('/register-visit', (req, res) => {
    console.log("Se recibió una solicitud a /register-visit");
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const visit = { ip, timestamp: new Date().toISOString() };

    fs.appendFile('visits.log', JSON.stringify(visit) + '\n', (err) => {
        if (err) {
            console.error('Error al registrar visita:', err);
            res.status(500).send('Error interno del servidor');
        } else {
            res.status(200).send('Visita registrada');
        }
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
