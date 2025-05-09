const notesRouter = require('express').Router()
const Note = require('../models/note')

notesRouter.get('/', async (req, res, next) => {
  const notes = await Note.find({})
  res.json(notes)
})

notesRouter.get('/:id', async (req, res, next) => {
  const note = await Note.findById(req.params.id)
  
  if (note) {
    res.json(note)
  } else {
    res.status(404).end()
  }
})

notesRouter.delete('/:id', async (req, res, next) => {
  await Note.findByIdAndDelete(req.params.id)
  res.status(204).end()
})

notesRouter.post('/', async (req, res, next) => {
  const body = req.body

  if (!body.content) {
    return res.status(400).json({ error: 'content missing' })
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
  })

  const savedNote = await note.save()
  res.status(201).json(savedNote)
})

notesRouter.put('/:id', (req, res, next) => {
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

module.exports = notesRouter