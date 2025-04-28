const express = require("express");
const { MongoClient } = require("mongodb");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function start() {
  await client.connect();
  const db = client.db("BigDataDemo");
  const collection = db.collection("temperatura_actual");

  const changeStream = collection.watch();

  changeStream.on("change", (next) => {
    if (next.fullDocument) {
      io.emit("nueva-temperatura", {
        estacion_id: next.fullDocument.estacion_id,
        fecha: next.fullDocument.fecha,
        temperatura: next.fullDocument.temperatura
      });
    }
  });

  console.log("🛰️ Monitoreando temperaturas...");
}

start();

app.use(express.static("public"));

server.listen(3000, () => {
  console.log("🌐 Servidor corriendo en http://localhost:3000");
});