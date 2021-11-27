const express = require('express')
const app = express()
const { Server } = require('socket.io')
const http = require("http")
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: "*" } })
const flash = require('connect-flash')
const cors = require('cors')
const bodyParser = require('body-parser')
const session = require('express-session');
const mongoose = require('mongoose')
const port = process.env.PORT || 9999
/** Route Main */
const wpRoute = require('../Routes/wpRoute')(io) //Dependency injection
require('../Socket/Connection')(io) //Dependency injection
/** Data base connection */
mongoose.connect(String(process.env.ENDPOINT_MONGO))

//  Adicionar e configurar middleware
app.use(session({
  secret: 'sessionSecretKey',
  resave: true,
  saveUninitialized: true
}));

app.use(flash());
app.use(cors({ origin: '*' }));
app.options('*', cors())
app.use(bodyParser.json());

app.set('port', port)
app.set('io', io)

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.use('/server', (request, response) => {
  response.json({ message: `Hi! I'm Sysbot! Welcome to this server! :)` })
})

app.use('/', wpRoute)

server.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

