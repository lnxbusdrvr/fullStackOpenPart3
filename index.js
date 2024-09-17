const express = require('express');
const morgan = require('morgan');
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(cors());
app.use(express.static('dist'))

morgan.token('data', (request, response) => {
  return JSON.stringify(request.body);
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'));

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
  ]

app.get('/api/persons', (request, response) => {
  response.json(persons)
});

app.get('/info', (request, response) => {
  response.send(`<div>
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date()}</p>
  </div>`);
});

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id;
  const person = persons.find(p => p.id === id);

  if (person)
    response.json(person);
  else
    response.status(404).end();
});

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  persons = persons.filter(p => p.id !== id)

  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name)
    return response.status(400).json({
      error: 'name is missing'
    });

  if (!body.number)
    return response.status(400).json({
      error: 'number is missing'
    });

  if (persons.filter(p => p.name === body.name))
    return response.status(400).json({
      error: 'name must be unique'
    });

  const person = {
    id: Math.floor(Math.random() * 999999999),
    name: body.name,
    number: body.number
  }

  persons = persons.concat(person)

  response.json(person)
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});

