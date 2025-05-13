const { test, after, describe, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Note = require('../models/note')
const User = require('../models/user')

const api = supertest(app)

describe('when there are initial notes saved', () => {
    beforeEach(async () => {
        await Note.deleteMany({})
        await Note.insertMany(helper.initialNotes)

        await User.deleteMany({})
        const user = new User(await helper.createInitialUser())
        await user.save()
    })

    test('notes are returned as json', async () => {
        await api
        .get('/api/notes')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })
    
    test('all notes are returned', async () => {
        const response = await api.get('/api/notes')
        
        assert.strictEqual(response.body.length, helper.initialNotes.length)
    })
    
    test('a specific note is within the returned notes', async () => {
        const response = await api.get('/api/notes')
        
        const contents = response.body.map(e => e.content)
        assert(contents.includes('HTML is easy'))
    })

    describe('viewing a specific note', () => {
        test('succeeds with the correct id', async () => {
            const notesAtStart = await helper.notesInDb()
            const noteToView = notesAtStart[0]
        
            const resultNote = await api
                .get(`/api/notes/${noteToView.id}`)
                .expect(200)
                .expect('Content-Type', /application\/json/)
        
            assert.deepStrictEqual(resultNote.body, noteToView)
        })

        test('fails with status code 404 if note doesn\'t exist', async () => {
            const fakeId = await helper.nonExistingId()

            await api
                .get(`/api/notes/${fakeId}`)
                .expect(404)
        })

        test('fails with status code 400 if invalid id', async () => {
            const invalidId = '5a3d5da59070081a82a3445'

            await api.get(`/api/notes/${invalidId}`).expect(400)
        })
    })

    describe('addition of a new note', () => {
        test('succeeds with valid data', async () => {
            const users = await helper.usersInDb()
            const user = users[0]

            const newNote = {
                content: 'async/await simplifies making async calls',
                important: true,
                user: user.id
            }

            // need to log in user
            const login = await api
                .post('/api/login')
                .send({
                    username: user.username,
                    password: 'password'
                })
        
            await api
                .post('/api/notes')
                .send(newNote)
                .set('Authorization', `Bearer ${login.body.token}`)
                .expect(201)
                .expect('Content-Type', /application\/json/)
            
            const notesAtEnd = await helper.notesInDb()
            assert.strictEqual(notesAtEnd.length, helper.initialNotes.length + 1)
        
            const contents = notesAtEnd.map(n => n.content)
            assert(contents.includes('async/await simplifies making async calls'))
        })
        
        test.only('fails with status code 400 if data invalid', async () => {
            const users = await helper.usersInDb()
            const user = users[0]
            
            const newNote = {
                important: false,
                user: user.id
            }

            // need to log in user
            const login = await api
                .post('/api/login')
                .send({
                    username: user.username,
                    password: 'password'
                })
        
            await api
                .post('/api/notes')
                .set('Authorization', `Bearer ${login.body.token}`)
                .send(newNote)
                .expect(400)
            
            const notesAtEnd = await helper.notesInDb()
        
            assert.strictEqual(notesAtEnd.length, helper.initialNotes.length)
        })
    })
    
    describe('deletion of a note', () => {
        test('succeeds with status code 204 if id is valid', async () => {
            const notesAtStart = await helper.notesInDb()
            const noteToDelete = notesAtStart[0]
        
            await api
                .delete(`/api/notes/${noteToDelete.id}`)
                .expect(204)
        
            const notesAtEnd = await helper.notesInDb()
            const contents = notesAtEnd.map(n => n.content)
        
            assert(!contents.includes(noteToDelete.content))
        
            assert.strictEqual(notesAtEnd.length, helper.initialNotes.length - 1)
        })

    })
})

after(async () => {
    await mongoose.connection.close()
})