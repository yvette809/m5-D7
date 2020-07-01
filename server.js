const express = require("express")
const cors = require("cors")
const { join } = require("path")
// const listEndpoints = require("express-list-endpoints")
const helmet = require("helmet")

const booksRouter = require("./src/services/books")
const commentsRouter= require("./src/services/comments")
const {
  notFoundHandler,
  badRequestHandler,
  genericErrorHandler,
} = require("./src/errorHandler")

const server = express()



// MIDDLEWARES
const staticFolderPath = join(__dirname, "../public")
server.use(express.static(staticFolderPath))
server.use(express.json())

const whitelist =
  process.env.NODE_ENV === "production"
    ? [process.env.FE_URL]
    : ["http://localhost:3000", "http://localhost:3002"]

const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
}

server.use(cors(corsOptions))


server.use(helmet())

//ROUTES
server.use("/books", booksRouter)
server.use("/comments",commentsRouter)

// ERROR HANDLERS
server.use(badRequestHandler)
server.use(notFoundHandler)
server.use(genericErrorHandler)

//console.log(listEndpoints(server))
const port = process.env.PORT 
server.listen(port, () => {
  console.log("Running on port", port)
})