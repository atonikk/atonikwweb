const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const numeradmin = 573208435424;
const numeradmin2 = 573228519140;

const app = express();
const port = 3000; // El puerto en el que correrá el servidor

// Middleware para parsear el body de las peticiones POST como JSON
app.use(bodyParser.json());

// Crear un cliente de WhatsApp usando el sistema de autenticación local para manejar sesiones
const client = new Client({
  authStrategy: new LocalAuth({
    // El directorio donde se almacenarán las sesiones
    clientId: "client-one",
  }),
});

// Generar el QR si es necesario para una nueva sesión
client.on("qr", (qr) => {
  console.log("Escanea el código QR para iniciar sesión en WhatsApp.");
  qrcode.generate(qr, { small: true });
});

// Confirmar que el cliente está listo
client.on("ready", () => {
  console.log("WhatsApp client is ready!");
});

// Endpoint para recibir solicitudes y enviar mensajes
app.post("/send-message", (req, res) => {
  const { number, code } = req.body;

  if (!number || !code) {
    return res.status(400).send({ error: "Número y código son requeridos." });
  }

  // Convertir el número al formato de WhatsApp
  const chatId = `${number}@c.us`;

  // Mensaje que se enviará
  const message = `🔒 Verificación de Código

Hola, para continuar con la verificación de tu cuenta, por favor ingresa el siguiente código:
${code}
✅ Responde "OK" para confirmar que has recibido el código.`;

  // Enviar el mensaje a través de WhatsApp
  client
    .sendMessage(chatId, message)
    .then((response) => {
      res
        .status(200)
        .send({ success: true, message: "Mensaje enviado", response });
    })
    .catch((err) => {
      res.status(500).send({
        success: false,
        error: "Error al enviar el mensaje",
        details: err,
      });
    });
});
app.post("/send-messageevent", (req, res) => {
  const { user, id } = req.body;

  if (!user || !id) {
    return res.status(400).send({ error: "Número y código son requeridos." });
  }

  const chatId = `${numeradmin2}@c.us`;
  const chatId2 = `${numeradmin}@c.us`;
  const message = `🔒 Aviso de evento
Hola admin, el usuario ${user} ha creado un evento con el id "${id}" y espera tu aprobación.
✅ Responde "OK" para confirmar que has recibido el aviso.`;

  client
    .sendMessage(chatId, message)
    .then((response) => {
      // Si el mensaje se envía correctamente al primer admin, enviar al segundo
      client
        .sendMessage(chatId2, message)
        .then((response2) => {
          res.status(200).send({
            success: true,
            message: "Mensaje enviado a ambos administradores",
            responses: [response, response2],
          });
        })
        .catch((err2) => {
          res.status(500).send({
            success: false,
            error: "Error al enviar el mensaje al segundo administrador",
            details: err2,
          });
        });
    })
    .catch((err) => {
      res.status(500).send({
        success: false,
        error: "Error al enviar el mensaje al primer administrador",
        details: err,
      });
    });
});

// Inicializar el cliente de WhatsApp
client.initialize();

// Iniciar el servidor en el puerto especificado
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
