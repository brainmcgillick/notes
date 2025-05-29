import { useState } from "react"
import loginService from '../services/login'
import PropTypes from 'prop-types'

const LoginForm = ({ saveLogin, setErrorMessage }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (event) => {
      event.preventDefault()
      console.log('logging in with', username, password)
  
      try {
        const user = await loginService.login({
          username,
          password
        })
  
        window.localStorage.setItem(
          'loggedNoteappUser', JSON.stringify(user)
        )
  
        saveLogin(user)
        setUsername('')
        setPassword('')
      } catch(exception) {
        console.log(exception)
        setErrorMessage('Wrong credentials')
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
      }
    }

  return (
    <form onSubmit={handleLogin}>
        <div>
          Username
          <input type='text' value={username} name='username' onChange={({ target }) => setUsername(target.value)}/>
        </div>
        <div>
          Password
          <input type='password' value={password} name='password' onChange={({ target }) => setPassword(target.value)}/>
        </div>
        <button type='submit'>Login</button>
    </form>
  )
}

LoginForm.PropTypes = {
  saveLogin: PropTypes.func.isRequired,
  setErrorMessage: PropTypes.func.isRequired
}

export default LoginForm