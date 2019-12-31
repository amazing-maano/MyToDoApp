const express = require('express');
const router = express.Router();
const {
    unlink
} = require('fs-extra');
const multer = require('multer')

const {
    ensureAuthenticated
} = require('../config/auth');

const Todo = require('../models/Todo')
const User = require('../models/User')
const Image = require('../models/Image')

// welcome page
router.get('/', (req, res) => res.render('welcome'));

// user profile
router.get('/profile', ensureAuthenticated, (req, res) => res.render('profile'));

router.post('/profile', ensureAuthenticated, async(req, res) => {
    console.log("req.file");
    console.log(req.file); //form files

    const image = new Image();
    image.filename = req.file.filename;
    image.path = '/images/uploads/' + req.file.filename;
    image.originalname = req.file.originalname;
    image.mimetype = req.file.mimetype;
    image.size = req.file.size;
    image.user = req.user.id;
    await image.save();
    res.redirect('/profile');

});


router.get('/profile', ensureAuthenticated, async(req, res) => {
    Image.findById({
            _id: req.params.id
        })
        .then(image => {
            res.render('profile')
        })
});


// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => {

    Todo.find({
            user: req.user.id
        })
        .sort({
            date: 'desc'
        })
        .then(todos => {
            res.render('dashboard', {

                todos: todos
            })
        })
    console.log(req.user.id);
});


router.post('/dashboard', ensureAuthenticated, (req, res) => {
    let errors = []
    if (!req.body.task) {
        errors.push({
            text: 'Please add a task'
        })
    }

    if (errors.length > 0) {
        res.render('dashboard', {
            errors: errors,
            task: req.body.task
        })
    } else {
        const newTask = {
            task: req.body.task,
            user: req.user.id
        }
        new Todo(newTask)
            .save()
            .then(task => {
                res.redirect('/dashboard')
            })
    }
});

// Edit Form Process

router.get('/:id', ensureAuthenticated, (req, res, next) => {
    Todo.findOne({
            _id: req.params.id,
            user: req.user.id
        }, {
            task: 1,
            completed: 1
        })
        .then(function(todo) {
            res.json({
                todo: todo
            });
        })
        .catch(next);
});

router.put('/:id', ensureAuthenticated, (req, res, next) => {
    var todo = {};
    var prop;
    for (prop in req.body) {
        todo[prop] = req.body[prop];
    }
    Todo.updateOne({
            _id: req.params.id,
            user: req.user.id
        }, todo)
        .then((updateLog) => {
            return res.json({
                updated: true
            });
        })
        .catch(next);
});

// Delete task

router.delete('/:id', ensureAuthenticated, (req, res) => {
    Todo.deleteOne({
        _id: req.params.id
    }).then(() => {
        res.redirect('/dashboard')
    })
});


module.exports = router;