const http = require("http");
const app = require("./app");
const { initSocket } = require("./socket");
const { sequelize } = require("./models");

const PORT = process.env.PORT || 3000;

// Create HTTP server from express app
const server = http.createServer(app);

// Init socket ONCE here only
const io = initSocket(server);

// Make io accessible in routes via req.app.get("io")
app.set("io", io);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});