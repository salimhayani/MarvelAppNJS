const express = require('express');
const User = require('../core/user');
const MarvelController = require('../core/marvelController');
const router = express.Router();


// create an object from the class User in the file core/user.js
const user = new User();
const marvelController = new MarvelController();

// Get the index page
router.get('/', (req, res, next) => {
    let user = req.session.user;
    // If there is a session named user that means the use is logged in. so we redirect him to home page by using /home route below
    if(user) {
        res.redirect('/list');
        return;
    }
    // IF not we just send the index page.
    res.render('index', {title:"MarvelApp",'error':null});
});

// Post login data
router.post('/login', (req, res, next) => {
    // The data sent from the user are stored in the req.body object.
    // call our login function and it will return the result(the user data).
    user.login(req.body.username, req.body.password, function(result) {
        if(result) {
            // Store the user data in a session.
            req.session.user = result;
            req.session.opp = 1;
            // redirect the user to the home page.
            res.redirect('/list');
        }else {
            // if the login function returns null send this error message back to the user.
            res.render('index', {title:"MarvelApp",'error':'Utilisateur/Mot de passe incorrect !'});
        }
    })

});


// Get logout page
router.get('/logout', (req, res, next) => {
    // Check if the session is exist
    if(req.session.user) {
        // destroy the session and redirect the user to the index page.
        req.session.destroy(function() {
            res.redirect('/');
        });
    }
});

// Get character list
router.get('/list/:page?', (req, res, next) => {
    marvelController.getCharacterList(req, res, next)
});

// Get character details
router.get('/heroDetails/:id', (req, res, next) => {
    marvelController.getCharacterInfo(req, res, next)
});



module.exports = router;