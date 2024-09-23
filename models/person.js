const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

const url = process.env.MONGODB_URI;

console.log('connecting to Atlas url (censored, just in case)');

mongoose.connect(url)
  .then(() => {
    console.log('connecting to MongoDB');
  })
  .catch((error) => {
    console.log(`error connecting to MongoDB:${error.message}`);
  });

const personSchema = new mongoose.Schema({
  name : {
    type: String,
    minlength: 3,
    required: [true, 'name is required']
  },
  number: {
    type: String,
    validate: {
      validator: (v) => /^(?:\d{2}-\d{7}|\d{3}-\d{8})$/.test(v),
      message: props => `${props.value} is not valid number (eg. 12-1234567, or 123-12345678).`
    },
    required: [true, 'number is required']
  }
});

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('Person', personSchema);
