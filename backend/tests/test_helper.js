const Note = require('../models/note')
const User = require('../models/user')
const bcrypt = require('bcrypt')

const initialNotes = [
  {
    content: 'HTML is easy',
    important: false,
  },
  {
    content: 'Browser can execute only JavaScript',
    important: true,
  },
]


const createInitialUser = async () => {
  const passwordHash = await bcrypt.hash('password', 10)

  const initialUser = {
    username: 'brainmcgillick',
    name: 'Brian McGillick',
    passwordHash: passwordHash,
  }

  return initialUser
}


const nonExistingId = async () => {
  const note = new Note({ content: 'willremovethissoon' })
  await note.save()
  await note.deleteOne()

  return note._id.toString()
}

const notesInDb = async () => {
  const notes = await Note.find({})
  return notes.map(note => note.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

module.exports = {
  initialNotes,
  createInitialUser,
  nonExistingId,
  notesInDb,
  usersInDb
}