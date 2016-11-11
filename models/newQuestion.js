var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var QuestionSchema = new mongoose.Schema({
  question: String,
  answer: String,
  answerID: Number
});

QuestionSchema.plugin(passportLocalMongoose);

// Points back to Excuse and in server.js
var Question = mongoose.model('Question', QuestionSchema);
module.exports = Question;
