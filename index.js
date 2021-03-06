const express = require("express")
const morgan = require("morgan")
const cors = require("cors")
require("dotenv").config()
const Person = require("./models/person")

const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static("build"))

morgan.token("body", (req) => JSON.stringify(req.body))
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :body"))

app.get("/api/persons", (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get("/info", (request, response) => {

  Person.estimatedDocumentCount({})
    .then(count => {
      const info = `Phonebook has info for ${count} people`
      const date = new Date()
      response.send(`<div><p>${info}<p/><p>${date}<p/><div/>`)
    })
})

app.get("/api/persons/:id", (request, response) => {
  Person.findById(request.params.id).then(person => {
    response.json(person)
  }).catch(e => {
    response.status(404).json({ error: e.message })
  })
})

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post("/api/persons", (request, response, next) => {
  const { name, number } = request.body
  Person.find({ name }).then(person => {
    if (person.length>0) {
      console.log("inside person",person)
      response.status(400).send({ error: "duplicate entry" })
    } else {
      const person = new Person({
        name: name,
        number: number,
      })

      person.save()
        .then(savedPerson =>
          response.json(savedPerson)
        )
        .catch(error => next(error)
        )
    }
  })
})

app.put("/api/persons/:id", (req, res, next) => {
  const { number } = req.body

  Person.findByIdAndUpdate(
    req.params.id, { number },
    { new: true, runValidators: true, context: "query" }
  )
    .then(updatedPerson =>
      res.json(updatedPerson)
    )
    .catch(error => next(error)
    )
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unkown endpoint" })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformed id" })
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})