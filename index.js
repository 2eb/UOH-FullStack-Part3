const express = require("express")
const morgan = require("morgan")
const cors = require("cors")

app = express()
app.use(express.json())
app.use(cors())

morgan.token("body", (req,res) => JSON.stringify(req.body))
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :body"))

// const requestLogger = (request, response, next) => {
//     console.log("Method: ", request.method);
//     console.log("Path: ", request.path);
//     console.log("Body: ", request.body);
//     console.log("--- ");
//     next()
// }
// app.use(requestLogger)

let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

app.get("/api/persons", (request, response) => {
    response.json(persons)
})

app.get("/info", (request, response) => {
    const info = `Phonebook has info for ${persons.length} people`
    const date = new Date()
    response.send(`<div><p>${info}<p/><p>${date}<p/><div/>`)
})

app.get("/api/persons/:id", (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(p => p.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete("/api/persons/:id", (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(p => p.id !== id)
    response.status(204).end()
})

const generateId = () => {
    return Math.floor(Math.random() * 100000)
}

app.post("/api/persons", (request, response) => {
    const body = request.body
    if (!(body.name && body.number)) {
        return response.status(400).json({ error: "missing name or number" })
    }

    const isUnique = persons.filter(p =>
        p.name.toLowerCase() === body.name.toLowerCase()).length === 0
    if (!isUnique) {
        return response.status(400).json({ error: "name must be unique" })
    }

    const person = {
        name: body.name,
        number: body.number,
        id: generateId()
    }
    persons = persons.concat(person)
    response.json(person)
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: "unkown endpoint" })
}
app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})