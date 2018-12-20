const express = require('express');
const router = express.Router();
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const passport = require('passport');

function isAuthenticated(req, res, next) {
    // do any checks you want to in here

    // CHECK THE USER STORED IN SESSION FOR A CUSTOM VARIABLE
    // you can do this however you want with whatever variables you set up
    if (req.isAuthenticated())
        return next();

    // IF A USER ISN'T LOGGED IN, THEN REDIRECT THEM SOMEWHERE
    res.redirect('/login');
}

function isSelf(req, res, next) {
    // do any checks you want to in here

    // CHECK THE USER STORED IN SESSION FOR A CUSTOM VARIABLE
    // you can do this however you want with whatever variables you set up
    if (req.user.id.toString() === req.params.id){
        return next();
    }
    // IF A USER ISN'T LOGGED IN, THEN REDIRECT THEM SOMEWHERE
    res.redirect('/403');
}

function isNotAuthenticated(req, res, next) {
    // do any checks you want to in here

    // CHECK THE USER STORED IN SESSION FOR A CUSTOM VARIABLE
    // you can do this however you want with whatever variables you set up
    if (!(req.isAuthenticated())){
        return next();
    }

    // IF A USER IS LOGGED IN, THEN REDIRECT THEM SOMEWHERE
    res.redirect('/403');
}

function isAdmin(req, res, next) {
    // do any checks you want to in here

    // CHECK THE USER STORED IN SESSION FOR A CUSTOM VARIABLE
    // you can do this however you want with whatever variables you set up
    if (req.user.username === 'admin') {
        return next();
    }

    // IF A USER IS NOT ADMIN, THEN REDIRECT THEM SOMEWHERE
    res.redirect('/403');
}

function isAdminOrSelf(req, res, next) {
    // do any checks you want to in here

    // CHECK THE USER STORED IN SESSION FOR A CUSTOM VARIABLE
    // you can do this however you want with whatever variables you set up
    if (req.user.username === 'admin' || req.user.id.toString() === req.params.id ) {
        return next();
    }

    // IF A USER IS NOT ADMIN, THEN REDIRECT THEM SOMEWHERE
    res.redirect('/403');
}

function isNotAuthenticatedOrAdmin(req, res, next) {
    // do any checks you want to in here

    // CHECK THE USER STORED IN SESSION FOR A CUSTOM VARIABLE
    // you can do this however you want with whatever variables you set up
    if ((!(req.isAuthenticated())) || req.user.isadmin) {
        return next();
    }
    // IF A USER IS NOT ADMIN, THEN REDIRECT THEM SOMEWHERE
    res.redirect('/403');
}

/* DB code */
// router.get('/mysql', function(req, res, next) {
//     let title = 'image';
//     let description = 'image description';
//     let imageurl = '/images/animals/david-clode-363878-unsplash.jpg';
//     let userid = 2;
//     let topicid = 1;
//     for (let i = 0; i < 50; i++){
//         connection.query('INSERT INTO image (title, description, imageurl, userid, topicid) VALUES (?, ?, ?, ?, ?)', [title, description, imageurl, userid, topicid], function (error, results, fields) {
//             // error will be an Error if one occurred during the query
//             // results will contain the results of the query
//             // fields will contain information about the returned results fields (if any)
//             if (error) {
//                 throw error;
//             }
//
//         });
//     }
//     res.send('done');
//
// });

// router.get('/userget', function(req, res, next) {
//     // let title = 'image';
//     // let description = 'image description';
//     // let imageurl = '/images/animals/david-clode-363878-unsplash.jpg';
//     // let userid = 2;
//     // let topicid = 1;
//     // for (let i = 0; i < 50; i++){
//         connection.query('SELECT isadmin FROM user WHERE id = 1', function (error, results, fields) {
//             // error will be an Error if one occurred during the query
//             // results will contain the results of the query
//             // fields will contain information about the returned results fields (if any)
//             if (error) {
//                 throw error;
//             }
//             console.log(results);
//             console.log(typeof results[0].isadmin);
//             if (results[0].isadmin) {
//                 console.log('true');
//             }
//         });
//     // connection.query('SELECT isadmin FROM user WHERE id = 2', function (error, results, fields) {
//     //     // error will be an Error if one occurred during the query
//     //     // results will contain the results of the query
//     //     // fields will contain information about the returned results fields (if any)
//     //     if (error) {
//     //         throw error;
//     //     }
//     //     console.log(results);
//     //     console.log(typeof results[0].isadmin);
//     //     if (results[0].isadmin) {
//     //         console.log('true');
//     //     }
//     // });
//     // }
//     res.send('done');
//
// });

router.get('/update', function(req, res, next) {

    //let imageurl = '/images/animals/wexor-tmg-26886-unsplash.jpg';
    var imageurl = '/images/travel/';
    var index = 46;
    var url = '';
    for(let i = 0; i < 5; i++){

        switch (i) {
            case 0:
                url = 'capturing-the-human-heart-528371-unsplash.jpg';
                break;
            case 1:
                url = 'ishan-seefromthesky-118523-unsplash.jpg';
                break;
            case 2:
                url = 'ishan-seefromthesky-1113277-unsplash.jpg';
                break;
            case 3:
                url = 'nils-nedel-386683-unsplash.jpg';
                break;
            case 4:
                url = 'simon-migaj-421505-unsplash.jpg';
                break;
            default:
                console.log('Sorry, we are out of ');
        }

        connection.query('UPDATE image SET imageurl = ?, topicid = ? WHERE id = ?', [imageurl + url, 10, index] ,function (error, results, fields) {
            // error will be an Error if one occurred during the query
            // results will contain the results of the query
            // fields will contain information about the returned results fields (if any)
            if (error) {
                throw error;
            }

        });
        index++;
    }


    res.send('done');

});


/* GET home page. */
router.get('/', function(req, res, next) {
    console.log(req.user);
    console.log(req.isAuthenticated());
    res.render('home/index', {
        req: req,
        title: 'Imagz.com'
    });
    // if (req.isAuthenticated()) {
    //     res.render('home/feed', {
    //         req: req
    //     })
    // }
    // res.render('home/index', {
    //     req: req,
    //     alert: req.flash('alert'),
    // });
});



/// ORDERS ROUTES ///

// GET request for creating a Order. NOTE This must come before routes that display Order (uses id).
router.get('/orders/new', isAuthenticated, isAdmin, function(req, res){
    res.render('orders/new', {
        req: req,
        title: 'Create order',
        errors: req.flash('errors'),
        inputs: req.flash('inputs')
    });
});

// POST request for creating Order.
router.post('/orders', isAuthenticated, isAdmin, [
    // validation
    body('amount', 'Empty amount').not().isEmpty(),
    body('date', 'Empty date').not().isEmpty(),
    body('description', 'Empty description').not().isEmpty(),

    body('description', 'Description must be between 5-45 characters.').isLength({min:5, max:45}),

    body('date', 'Invalid date').isISO8601(),

], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/errors messages.
        // Error messages can be returned in an array using `errors.array()`.
        req.flash('errors', errors.array());
        req.flash('inputs', req.body );
        res.redirect('/orders/new');
        // res.render('users/new', {
        //     errors: errors.array(),
        //     email: req.body.email,
        //     username: req.body.username
        // });
    }
    else {
        // Data from form is valid.
        sanitizeBody('amount').trim().escape();
        sanitizeBody('date').trim().escape();
        sanitizeBody('description').trim().escape();
        const amount = req.body.amount;
        const date = req.body.date;
        const description = req.body.description;
        console.log(amount,date,description);
        connection.query('INSERT INTO orders (amount, date, description) VALUES (?, ?, ?)', [amount, date, description], function (error, results, fields) {
            // error will be an Error if one occurred during the query
            // results will contain the results of the query
            // fields will contain information about the returned results fields (if any)
            if (error) {
                throw error;
            }
            req.flash('alert', 'Order created.');
            res.redirect('/orders');
        });
    }
});

// DELETE request to delete Order.
router.delete('/orders/:id', isAuthenticated, isAdmin, function(req, res){
    connection.query('DELETE FROM orders WHERE id = ?', [req.params.id], function (error, results, fields) {
        // error will be an Error if one occurred during the query
        // results will contain the results of the query
        // fields will contain information about the returned results fields (if any)
        if (error) {
            throw error;
        }
        req.flash('alert', 'Order deleted.');
        res.redirect('/orders');
    });
});

// GET request to update Order.
router.get('/orders/:id/edit', isAuthenticated, isAdmin, function(req, res){
    connection.query('SELECT amount, date, description FROM orders WHERE id = ?', [req.params.id], function (error, results, fields) {
        // error will be an Error if one occurred during the query
        // results will contain the results of the query
        // fields will contain information about the returned results fields (if any)
        if (error) {
            throw error;
        }
        results[0].date = JSON.stringify(results[0].date).slice(1,11);
        //results[0].dob = s.slice(6,8) + '-' + s.slice(9,11) + '-' + s.slice(1,5);
        // console.log(results[0].dob);
        //console.log(results[0].city);

        res.render('orders/edit', {
            req: req,
            data: results,
            id: req.params.id,
            title: 'Edit order',
            errors: req.flash('errors'),
            inputs: req.flash('inputs')
        });
    });
});

// PUT request to update Order.
router.put('/orders/:id', isAuthenticated, isAdmin, [
    // validation
    body('amount', 'Empty amount').not().isEmpty(),
    body('date', 'Empty date').not().isEmpty(),
    body('description', 'Empty description').not().isEmpty(),

    body('description', 'Description must be between 5-45 characters.').isLength({min:5, max:45}),

    body('date', 'Invalid date').isISO8601(),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/errors messages.
        // Error messages can be returned in an array using `errors.array()`.
        req.flash('errors', errors.array());
        req.flash('inputs', req.body );
        res.redirect(req._parsedOriginalUrl.pathname + '/edit');
        // res.render('users/new', {
        //     errors: errors.array(),
        //     email: req.body.email,
        //     username: req.body.username
        // });
    }
    else {
        // Data from form is valid.
        sanitizeBody('amount').trim().escape();
        sanitizeBody('date').trim().escape();
        sanitizeBody('description').trim().escape();
        const amount = req.body.amount;
        const date = req.body.date;
        const description = req.body.description;
        connection.query('UPDATE orders SET amount = ?, date = ?, description = ? WHERE id = ?', [amount, date, description, req.params.id], function (error, results, fields) {
            // error will be an Error if one occurred during the query
            // results will contain the results of the query
            // fields will contain information about the returned results fields (if any)
            if (error) {
                throw error;
            }
            req.flash('alert', 'Order edited.');
            res.redirect('/orders');
        });
    }
});

// GET request for list of all Order items.
router.get('/orders', isAuthenticated, function(req, res){
    connection.query('SELECT * FROM `orders`', function (error, results, fields) {
        // error will be an Error if one occurred during the query
        // results will contain the results of the query
        // fields will contain information about the returned results fields (if any)
        if (error) {
            throw error;
        }
        res.render('orders/index', {
            req: req,
            orders: results,
            title: 'Orders',
            alert: req.flash('alert')
        });
    });
});


/// USERS ROUTES ///

// GET request for creating a User. NOTE This must come before routes that display User (uses id).
router.get('/users/new', isNotAuthenticated, function(req, res){
    res.render('users/new', {
        req: req,
        title: 'Sign up',
        errors: req.flash('errors'),
        inputs: req.flash('inputs')
    });
});

// POST request for creating User.
router.post('/users', isNotAuthenticated, [
        // validation
        body('email', 'Empty email').not().isEmpty(),
        body('password', 'Empty password').not().isEmpty(),
        body('username', 'Empty username').not().isEmpty(),
        body('email', 'Email must be between 5-100 characters.').isLength({min:5, max:100}),
        body('password', 'Password must be between 5-45 characters.').isLength({min:5, max:45}),
        body('username', 'Username must be between 5-45 characters.').isLength({min:5, max:45}),
        body('email', 'Invalid email').isEmail(),
        body('password', 'Password must contain one lowercase character, one uppercase character, a number, and ' +
            'a special character').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i")
    ], (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            // Error messages can be returned in an array using `errors.array()`.
            req.flash('errors', errors.array());
            req.flash('inputs', {email: req.body.email, username: req.body.username});
            res.redirect('/users/new');
        }
        else {
            // const redirect = req.query.redirect;
            // Data from form is valid.
            sanitizeBody('email').trim().escape();
            sanitizeBody('password').trim().escape();
            sanitizeBody('username').trim().escape();
            const email = req.body.email;
            const password = req.body.password;
            const username = req.body.username;
            bcrypt.hash(password, saltRounds, function(err, hash) {
                // Store hash in your password DB.
                if (err) {
                    throw error;
                }
                connection.query('INSERT INTO user (email, username, password) VALUES (?, ?, ?)', [email, username, hash], function (error, results, fields) {
                    // error will be an Error if one occurred during the query
                    // results will contain the results of the query
                    // fields will contain information about the returned results fields (if any)
                    if (error) {
                        throw error;
                    }
                    req.flash('alert', 'You have successfully registered.');
                    res.redirect('/login');
                });
            });
        }
    }
);


// DELETE request to delete User.
router.delete('/users/:id', isAuthenticated, isSelf, function(req, res){
    connection.query('DELETE FROM user WHERE id = ?', [req.params.id], function (error, results, fields) {
        // error will be an Error if one occurred during the query
        // results will contain the results of the query
        // fields will contain information about the returned results fields (if any)
        if (error) {
            throw error;
        }
        req.flash('alert', 'Profile deleted.');
        req.logout();
        res.redirect('/login');
    });
});

// GET request to update User.
router.get('/users/:id/edit', isAuthenticated, isSelf, function(req, res){
    connection.query('SELECT id, email, username, description FROM user WHERE id = ?', [req.params.id], function (error, results, fields) {
        // error will be an Error if one occurred during the query
        // results will contain the results of the query
        // fields will contain information about the returned results fields (if any)
        if (error) {
            throw error;
        }
        // results[0].date = JSON.stringify(results[0].date).slice(1,11);
        //results[0].dob = s.slice(6,8) + '-' + s.slice(9,11) + '-' + s.slice(1,5);
        // console.log(results[0].dob);
        //console.log(results[0].city);
        res.render('users/edit', {
            req: req,
            title: 'Edit profile',
            result: results[0],
            errors: req.flash('errors'),
            inputs: req.flash('inputs')
        });
    });
});

// PUT request to update User.
router.put('/users/:id', isAuthenticated, isSelf, [
    body('email', 'Empty email').not().isEmpty(),
    body('password', 'Empty password').not().isEmpty(),
    body('username', 'Empty username').not().isEmpty(),
    body('description', 'Empty password').not().isEmpty(),
    body('email', 'Email must be between 5-100 characters.').isLength({min:5, max:100}),
    body('password', 'Password must be between 5-45 characters.').isLength({min:5, max:45}),
    body('username', 'Username must be between 5-45 characters.').isLength({min:5, max:45}),
    body('description', 'Username must be between 5-200 characters.').isLength({min:5, max:200}),
    body('email', 'Invalid email').isEmail(),
    body('password', 'Password must contain one lowercase character, one uppercase character, a number, and ' +
        'a special character').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i")
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/errors messages.
        // Error messages can be returned in an array using `errors.array()`.
        req.flash('errors', errors.array());
        req.flash('inputs', {email: req.body.email, username: req.body.username, description: req.body.description});
        res.redirect(req._parsedOriginalUrl.pathname + '/edit');
        // res.render('users/new', {
        //     errors: errors.array(),
        //     email: req.body.email,
        //     username: req.body.username
        // });
    }
    else {
        // Data from form is valid.
        sanitizeBody('email').trim().escape();
        sanitizeBody('password').trim().escape();
        sanitizeBody('username').trim().escape();
        sanitizeBody('description').trim().escape();
        const email = req.body.email;
        const password = req.body.password;
        const username = req.body.username;
        const description = req.body.description;
        bcrypt.hash(password, saltRounds, function(err, hash) {
            // Store hash in your password DB.
            if (err) {
                throw error;
            }
            connection.query('UPDATE user SET email = ?, password = ?, username = ?, description = ? WHERE id = ?', [email, hash, username, description, req.params.id], function (error, results, fields) {
                // error will be an Error if one occurred during the query
                // results will contain the results of the query
                // fields will contain information about the returned results fields (if any)
                if (error) {
                    throw error;
                }
                req.flash('alert', 'Profile edited');
                res.redirect(req._parsedOriginalUrl.pathname);
            });
            // connection.query('INSERT INTO user (email, username, password) VALUES (?, ?, ?)', [email, username, hash], function (error, results, fields) {
            //     // error will be an Error if one occurred during the query
            //     // results will contain the results of the query
            //     // fields will contain information about the returned results fields (if any)
            //     if (error) {
            //         throw error;
            //     }
            //     req.flash('alert', 'You have successfully registered.');
            //     res.redirect('/login');
            // });
        });


    }
});

// GET request for one User.
router.get('/users/:id', function(req, res){
    connection.query('SELECT id, username, email, datecreated, description FROM `user` WHERE id = ?', [req.params.id], function (error, results, fields) {
        // error will be an Error if one occurred during the query
        // results will contain the results of the query
        // fields will contain information about the returned results fields (if any)
        if (error) {
            throw error;
        }
        res.render('users/show', {
            req: req,
            title: 'Profile',
            result: results[0],
            alert: req.flash('alert')
        });
    });
});

// GET request for list of all User items.
router.get('/users', isAuthenticated, isAdmin, function(req, res){
    connection.query('SELECT * FROM `user`', function (error, results, fields) {
        // error will be an Error if one occurred during the query
        // results will contain the results of the query
        // fields will contain information about the returned results fields (if any)
        if (error) {
            throw error;
        }
        res.render('users/index', {
            req: req,
            users: results,
            title: 'Users',
            alert: req.flash('alert')
        });
    });
});

/// TOPIC ROUTES ///
// GET request for list of all User items.
router.get('/topics', function(req, res){
    connection.query('SELECT * FROM `topic`', function (error, results, fields) {
        // error will be an Error if one occurred during the query
        // results will contain the results of the query
        // fields will contain information about the returned results fields (if any)
        if (error) {
            throw error;
        }
        console.log(results);
        res.render('topics/index', {
            req: req,
            topics: results,
            title: 'Users',
            alert: req.flash('alert')
        });
    });
});

// get topic information, get 10 images of the topic, if current user is logged in, check if he has
// followed topic or not if yes pass unfollow to button value else pass follow to button value
//
router.get('/topics/:id', function(req, res){
    connection.query('SELECT * FROM `topic` WHERE id = ?; SELECT * FROM `image` WHERE topicid = ? LIMIT 9; SELECT * ' +
        'FROM `topicfollowing` WHERE following = ? AND followed = ?', [req.params.id, req.params.id, req.user.id,
            req.params.id],
        function (error, results, fields) {
        // error will be an Error if one occurred during the query
        // results will contain the results of the query
        // fields will contain information about the returned results fields (if any)
        if (error) {
            throw error;
        }

        console.log(results);
        res.render('topics/show', {
            req: req,
            topic: results[0],
            alert: req.flash('alert')
        });
    });
});

/// LOGIN ROUTES ///

router.get('/login', isNotAuthenticated, function(req, res) {
    res.render('login', {
        req: req,
        title: 'Log in',
        errors: req.flash('errors'),
        input: req.flash('input'),
        alert: req.flash('alert')
    });
});

router.post('/login', isNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
})
);

router.get('/logout', isAuthenticated, function(req, res){
    req.logout();
    res.redirect('/login');
});

/// ERROR ROUTES ///

router.get('/403', function(req, res){
    res.render('403');
});

router.get('/test', function (req, res) {
    res.render('test');
})

module.exports = router;
