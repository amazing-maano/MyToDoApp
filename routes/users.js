const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { ensureAuthenticated } = require('../config/auth');
const multer = require('multer');
const sharp = require('sharp');

//User Model
const User = require('../models/User')

//login page
router.get('/login', (req, res) => {
    res.render('login');
});

//registration page
router.get('/register', (req, res) => {
    res.render('register');
});


//Register handle
router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];
    //check required fields
    if (!name || !email || !password || !password2) {
        errors.push({ text: 'Please enter all fields' });
    }

    //check passwords match
    if (password != password2) {
        errors.push({ text: 'Passwords do not match' });
    }

    //check pass length
    if (password.length < 4) {
        errors.push({ text: 'Password must be at least 6 characters' });
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        User.findOne({ email: email }).then(user => {
            if (user) {
                errors.push({ text: 'Email already exists' });
                res.render('register', {
                    errors,
                    name,
                    email,
                    password,
                    password2
                });
            } else {
                const newUser = new User({
                    name,
                    email,
                    password
                });

                //Hash password
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        //set password to hashed
                        newUser.password = hash;
                        //save the user
                        newUser.save()
                            .then(user => {
                                req.flash('success_msg', 'Welcome' + user.name)
                                res.render('dashboard');
                            })
                            .catch(err => console.log(err));
                    });
                });
            }
        });
    }
});

// Login Handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Logout Handle
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});


module.exports = router;