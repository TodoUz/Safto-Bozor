const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public")); // Frontend fayllar uchun

// Foydalanuvchilar ulanishi
io.on("connection", (socket) => {
  console.log("A user connected");

  // Xabar olish va barcha foydalanuvchilarga yuborish
  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });

  // Foydalanuvchi uzilganini ko'rsatish
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Serverni ishga tushirish
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
