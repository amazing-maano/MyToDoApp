const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TodoSchema = new Schema({
  task: {
    type: String,
    required: true
  },
  user: {
    type: String,
    required: true
  },
  completed: {
    type: 'Boolean'
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
})

const Todo = mongoose.model('Todo', TodoSchema);

module.exports = Todo;