require('dotenv').config()
const express = require('express')
const app = express()
const Note = require('./models/note')

app.use(express.json())
app.use(express.static('dist'))

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:', request.path)
  console.log('Body:', request.body)
  console.log('---')
  next()
}

app.use(requestLogger)

app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
})

app.get('/api/notes/:id', (req, res, next) => {
  Note.findById(req.params.id)
    .then(note => {
      if (note) {
        res.json(note)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/notes/:id', (req, res, next) => {
  Note.findByIdAndDelete(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/notes', (req, res, next) => {
  const body = req.body

  if (!body.content) {
    return res.status(400).json({ error: 'content missing' })
  }

  const note = new Note({
    'content': body.content,
    'important': body.important || false,
  })

  note.save()
    .then(savedNote => {
      res.json(savedNote)
    })
    .catch(error => next(error))
})

app.put('/api/notes/:id', (req, res, next) => {
  const { content, important } = req.body

  Note.findById(req.params.id)
    .then(note => {
      if (!note) {
        return res.status(404).end()
      }

      note.content = content
      note.important = important

      return note.save().then(updatedNote => {
        res.json(updatedNote)
      })
    })
    .catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformed id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})