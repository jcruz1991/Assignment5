var main = function() {
    'use strict';
    $('#sign-in-form').show();
    $('#newQuestionForm').hide();
    $('#startNewRound').hide();
    $('#answerForm').hide();
    $('#answer_Two .result_Two_ID').hide();
    $('#scoreArea').hide();

    var socket = io.connect('http://localhost:3000', {
        reconnect: true
    });

    // Add New User
    $('#getUsername').on('click', function(event) {
        if ($('#usernameInput').val() !== '') {
            var username = $('#usernameInput').val();
            socket.emit('join', username);
            $('#userInputDiv').hide();
            $('#startNewRound').show();
            $('#answerForm').show();
            $('#newQuestionForm').show();
            $('#scoreArea').show();
        }
        return false;
    });

    // Update User List
    socket.on("update-users", function(user) {
        $("#users").empty();
        $.each(user, function(clientID, name) {
            $('#users').append("<li>" + name + "</li>");
        });
    });

    socket.on("get-question", function(id, question) {
        $('#answer_Two .result_Two_ID').text(id);
        $('#answer_Two .result_Two_Question').text('Question: ' + question);
    });

    socket.on("get-correct", function(user, answer) {
        $.get('score', function(res) {
            $('#scoreArea #right').text("Right: " + res.right);
            $('#scoreArea #wrong').text("Wrong: " + res.wrong);
        });
        $('#answer_Two .correctAnswer').append("<br>" + user + ":" + answer);
    });

    $('#answerToCheckButton').on('click', function(event) {

        if ($('#idInput').val() !== '') {
            var ID = $('#answer_Two .result_Two_ID').text();
            var answer = $('#answerInputFromAnswerForm').val();

            $.ajax({
                type: "POST",
                url: 'answer',
                data: JSON.stringify({
                    "ID": ID,
                    "Answer": answer
                }),
                success: function(res) {
                    socket.emit('answer', res.correct);
                    //$('#answer_Two .result_Two').text('Correct: ' + res.correct);
                },
                contentType: "application/json",
                dataType: 'json'
            });
        }
        return false;

    });

    $('#startNewRound').on('click', function(event) {
        $('#answer_Two .correctAnswer').empty();
        $('#answerInputFromAnswerForm').val('');
        $.get('question', function(res) {
            socket.emit('getQuestion', res._id, res.Question);
            if (res.length === 0) {
                $('#answer_Two .result_Two').text('Database is Empty!');
            } else {
                $('#answer_Two .result_Two').text('Question: ' + res.Question + " ID: " + res._id);
            }
        });
        return false;
    });

    $('#addQuestionToDatabase').on('click', function(event) {

        if ($('#questionInput').val() !== '') {

            var question = $('#questionInput').val();
            var answer = $('#answerInput').val();

            $.ajax({
                type: "POST",
                url: 'question',
                data: JSON.stringify({
                    "Question": question,
                    "Answer": answer
                }),
                success: function(res) {
                    $('#answer .result').text('Question: ' + res.Question + " Answer: " + res.Answer);
                },
                contentType: "application/json",
                dataType: 'json'
            });
        }
        return false;
    });

    // $('#getQuestionFromDatabase').on('click', function(event) {

    //     $.get('question', function(res) {
    //         if (res.length === 0) {
    //             $('#answer_Two .result_Two').text('Database is Empty!');
    //         } else {
    //             $('#answer_Two .result_Two').text('Question: ' + res.Question + " ID: " + res._id);
    //         }
    //     });
    //     return false;
    // });

    // $('#checkAnswerToQuestionInDatabase').on('click', function(event) {

    //     if ($('#idInput').val() !== '') {
    //         var ID = $('#idInput').val();
    //         var answer = $('#answerInputTwo').val();

    //         $.ajax({
    //             type: "POST",
    //             url: 'answer',
    //             data: JSON.stringify({
    //                 "ID": ID,
    //                 "Answer": answer
    //             }),
    //             success: function(res) {
    //                 $('#answer_Three .result_Three').text('Correct: ' + res.correct);
    //             },
    //             contentType: "application/json",
    //             dataType: 'json'
    //         });
    //     }
    //     return false;
    // });

    $('#getScoreFromDatabase').on('click', function(event) {

        $.get('score', function(res) {
            if (res.length === 0) {
                $('#answer_Four .result_Two').text('Database is Empty!');
            } else {
                $('#answer_Four .result_Four').text('Right: ' + res.right + " Wrong: " + res.wrong);
            }
        });
        return false;
    });

    function QuestionModel() {
        this.Question = ko.observable("hi");
        this._id = ko.observable("2");

        self.getQuestion = function() {
            $('#answer_Two .correctAnswer').empty();
            $('#answerInputFromAnswerForm').val('');
            var question = this.Question;
            var id = this._id;
            $.get('question', {question, id}, function(res) {
                socket.emit('getQuestion', res._id, res.Question);
                question(res.Question);
                id(res._id);
                // if (res.length === 0) {
                //     $('#answer_Two .result_Two').text('Database is Empty!');
                // } else {
                //     $('#answer_Two .result_Two').text('Question: ' + res.Question + " ID: " + res._id);
                // }
            });
            return false;
        }
    }

    // Activates knockout.js
    ko.applyBindings(new QuestionModel());
};

$(document).ready(main);
