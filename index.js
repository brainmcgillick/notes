const express = require("express")
const cors = require("cors")
const app = express()

const requestLogger = (request, response, next) => {
  console.log("Method:", request.method)
  console.log("Path:", request.path)
  console.log("Body:", request.body)
  console.log("---")
  next()
}

app.use(express.json())
app.use(requestLogger)
app.use(cors())
app.use(express.static("dist"))

const generateId = () => {
  const maxID = notes.length > 0
  ? Math.max(...notes.map(n => Number(n.id)))
  : 0

  return String(maxID + 1)
}

let notes = [
    {
      id: "1",
      content: "HTML is easy",
      important: true
    },
    {
      id: "2",
      content: "Browser can execute only JavaScript",
      important: false
    },
    {
      id: "3",
      content: "GET and POST are the most important methods of HTTP protocol",
      important: true
    }
  ]

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>")
})

app.get("/api/notes", (request, response) => {
  response.json(notes)
})

app.get("/api/notes/:id", (req, res) => {
  const id = req.params.id
  const note = notes.find(note => note.id === id)
  
  if (note) {
    res.json(note)
  } else {
    res.statusMessage = "ID does not exist."
    res.status(404).end()
  }
})

app.delete("/api/notes/:id", (req, res) => {
  const id = req.params.id
  notes = notes.filter(note => note.id !== id)

  res.status(204).end()
})

app.post("/api/notes", (req, res) => {
  const body = req.body
  if (!body.content) {
    return res.status(400).json({
      error: "content missing"
    })
  }

  const note = {
    "content": body.content,
    "important": body.important || false,
    "id": generateId()
  }

  const unknownEndpoint = (req, res) => {
    express.res.status(404).send({ error: "unknown endpoint" })
  }

  app.use(unknownEndpoint)

  notes = notes.concat(note)
  res.json(note)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})