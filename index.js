const express = require('express');
const morgan = require('morgan');
const app = express();
const cors = require('cors');
require('dotenv').config();
const Person = require('./models/person');

app.use(express.json());
app.use(cors());
app.use(express.static('dist'))

morgan.token('data', (request, response) => {
  return JSON.stringify(request.body);
});
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'));

app.get('/', (request, response) => {
    response.send('<h1>ET calls home!</h1>');
});

app.get('/info', (request, response) => {
  Person.find({}).then(persons => {
    response.send(`<div>
      <p>Phonebook has info for ${persons.length} people</p>
      <p>${new Date()}</p>
      </div>`);
  });
});

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
});

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(result => {
    if (result)
      response.json(result);
    else
      response.status(404).end();
  });
});

app.delete('/api/persons/:id', (request, response) => {
  Person.findByIdAndDelete(request.params.id).then(result => {
    if (result)
      response.status(204).end();
    else
      response.status(404).end();
  });
});

app.post('/api/persons', (request, response) => {
  const body = request.body;

  if (!body.name) {
    return response.status(400).json({ error: 'name missing' })
  }
  if (!body.number) {
    return response.status(400).json({ error: 'number missing' })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save()
    .then(savedPerson => {
      response.json(savedPerson);
    });
  });

app.put('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const body = request.body;

  if (!body.name) {
    return response.status(400).json({ error: 'name missing' });
  }

  if (!body.number) {
    return response.status(400).json({ error: 'number missing' });
  }

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(id, person, { new: true })
    .then(updatedPerson => {
      if (updatedPerson)
        response.json(updatedPerson);
      else
        response.status(404).end();
      });
    });


const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});
