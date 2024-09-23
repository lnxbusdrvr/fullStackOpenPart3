const express = require('express');
const morgan = require('morgan');
const app = express();
require('dotenv').config();
const Person = require('./models/person');

app.use(express.json());
const cors = require('cors');
app.use(cors());
app.use(express.static('dist'));

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method);
  console.log('Path:  ', request.path);
  console.log('Body:  ', request.body);
  console.log('---');
  next();
};

const errorsHandler = (error, request, response, next) => {
  console.error(error.message);
  if (error.name === 'CastError')
    return response.status(400).send({ error: 'malformatted id' });
  else if (error.name === 'ValidationError')
    return response.status(400).json({ error: error.message });

  next(error);
};

const nonExistUrlHandler = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

morgan.token('data', request => {
  return JSON.stringify(request.body);
});
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'));

app.use(requestLogger);

app.get('/', (request, response) => {
  response.send('<h1>ET calls home!</h1>');
});

app.get('/info', (request, response, next) => {
  Person.find({})
    .then(persons => {
      response.send(`
        <div>
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${new Date()}</p>
        </div>`);
    })
    .catch(error => next(error));
});

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons);
  });
});

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(result => {
      if (result)
        response.json(result);
      else
        response.status(404).end();
    })
    .catch(error => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      if (result)
        response.status(204).end();
      else
        response.status(404).end();
    })
    .catch(error => next(error));
});

app.post('/api/persons', (request, response, next) => {
  const body = request.body;

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save()
    .then(savedPerson => {
      response.json(savedPerson);
    })
    .catch(error => next(error));
});

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body;

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      response.json(updatedPerson);
    })
    .catch(error => next(error));
});

app.use(nonExistUrlHandler);
app.use(errorsHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
