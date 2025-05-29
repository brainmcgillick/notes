import { useState, useEffect, useRef } from 'react'
import Footer from "./components/Footer"
import Note from "./components/Note"
import Notification from "./components/Notification"
import LoginForm from "./components/LoginForm"
import NoteForm from "./components/NoteForm"
import Togglable from './components/Togglable'
import noteService from "./services/notes"

const App = () => {
  const [notes, setNotes] = useState([])
  const [showAll, setShowAll] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)
  const [user, setUser] = useState(null)
  const noteFormRef = useRef()
  
  useEffect(() => {
    noteService
    .getAll()
    .then(initialNotes => {
      setNotes(initialNotes)
    })}, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedNoteappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      noteService.setToken(user.token)
    }
  }, [])

  const createNote = (noteObject) => {
    noteFormRef.current.toggleVisibility()
    noteService
      .create(noteObject)
      .then(returnedNote => {
        setNotes(notes.concat(returnedNote))
      })
  }
    
  // if showAll = true, then notesToShow = notes, otherwise notesToShow is notes filtered to important only
  const notesToShow = showAll
    ? notes
    // filter returns true evaluations only so note.important will be returned in the new array
    : notes.filter(note => note.important)

  const toggleImportanceOf = (id) => {
    const note = notes.find(n => n.id === id)
    const changedNote = { ...note, important: !note.important }

    noteService
      .update(id, changedNote)
      .then(response => {
        setNotes(notes.map(n => {
          return n.id === response.id ? response : n
        }))
      })
      .catch(error => {
        setErrorMessage(
          `the note "${note.content}" does not exist on the server`
        )
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
        setNotes(notes.filter(n => n.id !== id))
      })
  }

  const saveLogin = (user) => {
    noteService.setToken(user.token)
    setUser(user)
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedNoteappUser')
    setUser(null)
  }

  return (
    <div>
      <h1>Notes</h1>
      <Notification message={errorMessage}/>
      {user === null ?
        <div>
          <Togglable buttonLabel='Log In' >
            <LoginForm
              saveLogin={saveLogin}
              setErrorMessage={setErrorMessage}
              />
          </Togglable>
        </div> : 
        <div>
          <div>
            <button onClick={handleLogout}>
              Log Out
            </button>
          </div>
          <p>{user.name} logged in</p>
          <Togglable buttonLabel='New Note' ref={noteFormRef}>
            <NoteForm
              createNote={createNote}
            />
          </Togglable>
        </div>
      }

      <h2>Notes</h2>
      <div>
        <button onClick={() => setShowAll(!showAll)}>
          show {showAll ? "important" : "all"}
        </button>
      </div>
      <ul>
        {notesToShow.map(note => {
          return (
          <Note 
            key={note.id} 
            note={note} 
            toggleImportance={() => toggleImportanceOf(note.id)} />
        )
        })}
      </ul>
      <Footer />
    </div>
  )
}

export default App
