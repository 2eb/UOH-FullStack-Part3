const express = require("express")
const morgan = require("morgan")
const cors = require("cors")
require("dotenv").config()
const Person = require("./models/person")

app = express()
app.use(express.json())
app.use(cors())
app.use(express.static("build"))

morgan.token("body", (req,res) => JSON.stringify(req.body))
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :body"))

app.get("/api/persons", (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get("/info", (request, response) => {
    const info = `Phonebook has info for ${persons.length} people`
    const date = new Date()
    response.send(`<div><p>${info}<p/><p>${date}<p/><div/>`)
})

app.get("/api/persons/:id", (request, response) => {
    Person.findById(request.params.id).then(person => {
        response.json(person)
    }).catch(e => {
        response.status(404).json({error: e.message})
    })
})

app.delete("/api/persons/:id", (request, response) => {
    // const id = Number(request.params.id)
    // persons = persons.filter(p => p.id !== id)
    // response.status(204).end()
    Person.findByIdAndRemove(request.params.id)
    .then(result => {
        response.status(204).end()
    })
    .catch(error => {
        console.log(error.message);
        response.json({error: error.message})
    })
})

app.post("/api/persons", (request, response) => {
    const body = request.body
    if (!(body.name && body.number)) {
        return response.status(400).json({ error: "missing name or number" })
    }

    // const isUnique = persons.filter(p =>
    //     p.name.toLowerCase() === body.name.toLowerCase()).length === 0
    // if (!isUnique) {
    //     return response.status(400).json({ error: "name must be unique" })
    // }

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    console.log(person)

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: "unkown endpoint" })
}
app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})