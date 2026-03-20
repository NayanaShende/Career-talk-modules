require("dotenv").config(); // ✅ First line

const http = require("http");
const app = require("./app");
const { initSocket } = require("./socket");

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = initSocket(server);
app.set("io", io);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
