const express = require('express');
const router = express.Router();
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const bcrypt = require('bcrypt');
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
        console.log('equal');
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
router.get('/mysql', function(req, res, next) {
    let title = 'image';
    let description = 'image description';
    let imageurl = '/images/animals/david-clode-363878-unsplash.jpg';
    let userid = 2;
    let topicid = 1;
    for (let i = 0; i < 50; i++){
        connection.query('INSERT INTO image (title, description, imageurl, userid, topicid) VALUES (?, ?, ?, ?, ?)', [title, description, imageurl, userid, topicid], function (error, results, fields) {
            // error will be an Error if one occurred during the query
            // results will contain the results of the query
            // fields will contain information about the returned results fields (if any)
            if (error) {
                throw error;
            }

        });
    }
    res.send('done');

});

router.get('/userget', function(req, res, next) {
    // let title = 'image';
    // let description = 'image description';
    // let imageurl = '/images/animals/david-clode-363878-unsplash.jpg';
    // let userid = 2;
    // let topicid = 1;
    // for (let i = 0; i < 50; i++){
        connection.query('SELECT isadmin FROM user WHERE id = 1', function (error, results, fields) {
            // error will be an Error if one occurred during the query
            // results will contain the results of the query
            // fields will contain information about the returned results fields (if any)
            if (error) {
                throw error;
            }
            console.log(results);
            console.log(typeof results[0].isadmin);
            if (results[0].isadmin) {
                console.log('true');
            }
        });
    // connection.query('SELECT isadmin FROM user WHERE id = 2', function (error, results, fields) {
    //     // error will be an Error if one occurred during the query
    //     // results will contain the results of the query
    //     // fields will contain information about the returned results fields (if any)
    //     if (error) {
    //         throw error;
    //     }
    //     console.log(results);
    //     console.log(typeof results[0].isadmin);
    //     if (results[0].isadmin) {
    //         console.log('true');
    //     }
    // });
    // }
    res.send('done');

});

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
    console.log(req);
    if (req.isAuthenticated()) {

        res.render('home/feed', {
            req: req
        })
    }
    res.render('home/index', {
        req: req,
        title: 'Clients',
        alert: req.flash('alert'),
    });
});

/// CLIENT ROUTES ///

// GET request for creating a Client. NOTE This must come before routes that display Client (uses id).
router.get('/clients/new', isAuthenticated, isAdmin, function(req, res){
    res.render('clients/new', {
        req: req,
        title: 'Create client',
        errors: req.flash('errors'),
        inputs: req.flash('inputs')
    });
});

// POST request for creating Client.
router.post('/clients', isAuthenticated, isAdmin, [
    // validation
    body('firstname', 'Empty firstname').not().isEmpty(),
    body('lastname', 'Empty lastname').not().isEmpty(),
    body('dob', 'Empty dob').not().isEmpty(),
    body('gender', 'Empty gender').not().isEmpty(),
    body('city', 'Empty city').not().isEmpty(),
    body('state', 'Empty state').not().isEmpty(),
    body('email', 'Empty email').not().isEmpty(),
    body('phone', 'Empty phone').not().isEmpty(),

    body('firstname', 'First name must be between 5-45 characters.').isLength({min:5, max:45}),
    body('lastname', 'Last name must be between 5-45 characters.').isLength({min:5, max:45}),
    body('city', 'City must be between 5-45 characters.').isLength({min:5, max:45}),
    body('state', 'State must be between 5-45 characters.').isLength({min:5, max:45}),
    body('email', 'Email must be between 5-255 characters.').isLength({min:5, max:255}),
    body('phone', 'Phone must be 10 characters.').isLength({min:10, max:10}),

    body('dob', 'Invalid DOB').isISO8601(),
    body('email', 'Invalid email').isEmail(),
    body('phone', 'Invalid phone').isMobilePhone()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/errors messages.
        // Error messages can be returned in an array using `errors.array()`.
        req.flash('errors', errors.array());
        req.flash('inputs', req.body );
        res.redirect('/clients/new');
        // res.render('users/new', {
        //     errors: errors.array(),
        //     email: req.body.email,
        //     username: req.body.username
        // });
    }
    else {
        // Data from form is valid.
        console.log(req.body);
        sanitizeBody('firstname').trim().escape();
        sanitizeBody('lastname').trim().escape();
        sanitizeBody('dob').trim().escape();
        sanitizeBody('gender').trim().escape();
        sanitizeBody('city').trim().escape();
        sanitizeBody('state').trim().escape();
        sanitizeBody('email').trim().escape();
        sanitizeBody('phone').trim().escape();
        const firstname = req.body.firstname;
        const lastname = req.body.lastname;
        const dob = req.body.dob;
        const gender = req.body.gender;
        const city = req.body.city;
        const state = req.body.state;
        const email = req.body.email;
        const phone = req.body.phone;
        connection.query('INSERT INTO client (firstName, lastName, dob, gender, city, state, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [firstname, lastname, dob, gender, city, state, email, phone], function (error, results, fields) {
            // error will be an Error if one occurred during the query
            // results will contain the results of the query
            // fields will contain information about the returned results fields (if any)
            if (error) {
                throw error;
            }
            req.flash('alert', 'Client created.');
            res.redirect('/clients');
        });
    }
});

// DELETE request to delete Client.
router.delete('/clients/:id', isAuthenticated, isAdmin, function(req, res){
    connection.query('DELETE FROM client WHERE id = ?', [req.params.id], function (error, results, fields) {
        // error will be an Error if one occurred during the query
        // results will contain the results of the query
        // fields will contain information about the returned results fields (if any)
        if (error) {
            throw error;
        }
        req.flash('alert', 'Client deleted.');
        res.redirect('/clients');
    });
});

// GET request to update Client.
router.get('/clients/:id/edit', isAuthenticated, isAdmin, function(req, res){
    connection.query('SELECT firstName, lastName, dob, gender, city, state, email, phone FROM client WHERE id = ?', [req.params.id], function (error, results, fields) {
        // error will be an Error if one occurred during the query
        // results will contain the results of the query
        // fields will contain information about the returned results fields (if any)
        if (error) {
            throw error;
        }
        results[0].dob = JSON.stringify(results[0].dob).slice(1,11);
        //results[0].dob = s.slice(6,8) + '-' + s.slice(9,11) + '-' + s.slice(1,5);
        // console.log(results[0].dob);
        //console.log(results[0].city);

        res.render('clients/edit', {
            req: req,
            data: results,
            id: req.params.id,
            title: 'Edit client',
            errors: req.flash('errors'),
            inputs: req.flash('inputs')
        });
    });
});

// PUT request to update Client.
router.put('/clients/:id', isAuthenticated, isAdmin, [
    // validation
    body('firstname', 'Empty firstname').not().isEmpty(),
    body('lastname', 'Empty lastname').not().isEmpty(),
    body('dob', 'Empty dob').not().isEmpty(),
    body('gender', 'Empty gender').not().isEmpty(),
    body('city', 'Empty city').not().isEmpty(),
    body('state', 'Empty state').not().isEmpty(),
    body('email', 'Empty email').not().isEmpty(),
    body('phone', 'Empty phone').not().isEmpty(),

    body('firstname', 'First name must be between 5-45 characters.').isLength({min:5, max:45}),
    body('lastname', 'Last name must be between 5-45 characters.').isLength({min:5, max:45}),
    body('city', 'City must be between 5-45 characters.').isLength({min:5, max:45}),
    body('state', 'State must be between 5-45 characters.').isLength({min:5, max:45}),
    body('email', 'Email must be between 5-255 characters.').isLength({min:5, max:255}),
    body('phone', 'Phone must be 10 characters.').isLength({min:10, max:10}),

    body('dob', 'Invalid DOB').isISO8601(),
    body('email', 'Invalid email').isEmail(),
    body('phone', 'Invalid phone').isMobilePhone()
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
        sanitizeBody('firstname').trim().escape();
        sanitizeBody('lastname').trim().escape();
        sanitizeBody('dob').trim().escape();
        sanitizeBody('gender').trim().escape();
        sanitizeBody('city').trim().escape();
        sanitizeBody('state').trim().escape();
        sanitizeBody('email').trim().escape();
        sanitizeBody('phone').trim().escape();
        const firstname = req.body.firstname;
        const lastname = req.body.lastname;
        const dob = req.body.dob;
        const gender = req.body.gender;
        const city = req.body.city;
        const state = req.body.state;
        const email = req.body.email;
        const phone = req.body.phone;
        connection.query('UPDATE client SET firstName = ?, lastName = ?, dob = ?, gender = ?, city = ?, state = ?, email = ?, phone = ? WHERE id = ?', [firstname, lastname, dob, gender, city, state, email, phone, req.params.id], function (error, results, fields) {
            // error will be an Error if one occurred during the query
            // results will contain the results of the query
            // fields will contain information about the returned results fields (if any)
            if (error) {
                throw error;
            }
            req.flash('alert', 'Client edited.');
            res.redirect('/clients');
        });
    }
});

// GET request for list of all Client items.
router.get('/clients', isAuthenticated, function(req, res){
    console.log(req.route.path);
    connection.query('SELECT * FROM `client`', function (error, results, fields) {
        // error will be an Error if one occurred during the query
        // results will contain the results of the query
        // fields will contain information about the returned results fields (if any)
        if (error) {
            throw error;
        }
        res.render('clients/index', {
            req: req,
            clients: results,
            title: 'Clients',
            alert: req.flash('alert'),
        });
    });
});

/// EMPLOYEE ROUTES ///

// GET request for creating a Employee. NOTE This must come before routes that display Employee (uses id).
router.get('/employees/new', isAuthenticated, isAdmin, function(req, res){
    res.render('employees/new', {
        req: req,
        title: 'Create employee',
        errors: req.flash('errors'),
        inputs: req.flash('inputs')
    });
});

// POST request for creating Employee.
router.post('/employees', isAuthenticated, isAdmin, [
    // validation
    body('firstname', 'Empty firstname').not().isEmpty(),
    body('lastname', 'Empty lastname').not().isEmpty(),
    body('position', 'Empty dob').not().isEmpty(),
    body('email', 'Empty email').not().isEmpty(),
    body('phone', 'Empty phone').not().isEmpty(),

    body('firstname', 'First name must be between 5-45 characters.').isLength({min:5, max:45}),
    body('lastname', 'Last name must be between 5-45 characters.').isLength({min:5, max:45}),
    body('email', 'Email must be between 5-255 characters.').isLength({min:5, max:255}),
    body('phone', 'Phone must be 10 characters.').isLength({min:10, max:10}),

    body('email', 'Invalid email').isEmail(),
    body('phone', 'Invalid phone').isMobilePhone()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/errors messages.
        // Error messages can be returned in an array using `errors.array()`.
        req.flash('errors', errors.array());
        req.flash('inputs', req.body );
        res.redirect('/employees/new');
        // res.render('users/new', {
        //     errors: errors.array(),
        //     email: req.body.email,
        //     username: req.body.username
        // });
    }
    else {
        // Data from form is valid.
        sanitizeBody('firstname').trim().escape();
        sanitizeBody('lastname').trim().escape();
        sanitizeBody('position').trim().escape();
        sanitizeBody('email').trim().escape();
        sanitizeBody('phone').trim().escape();
        const firstname = req.body.firstname;
        const lastname = req.body.lastname;
        const position = req.body.position;
        const email = req.body.email;
        const phone = req.body.phone;
        connection.query('INSERT INTO employee (firstName, lastName, position, email, phone) VALUES (?, ?, ?, ?, ?)', [firstname, lastname, position, email, phone], function (error, results, fields) {
            // error will be an Error if one occurred during the query
            // results will contain the results of the query
            // fields will contain information about the returned results fields (if any)
            if (error) {
                throw error;
            }
            req.flash('alert', 'Employee created.');
            res.redirect('/employees');
        });
    }
});

// DELETE request to delete Employee.
router.delete('/employees/:id', isAuthenticated, isAdmin, function(req, res){
    connection.query('DELETE FROM employee WHERE id = ?', [req.params.id], function (error, results, fields) {
        // error will be an Error if one occurred during the query
        // results will contain the results of the query
        // fields will contain information about the returned results fields (if any)
        if (error) {
            throw error;
        }
        req.flash('alert', 'Employee deleted.');
        res.redirect('/employees');
    });
});

// GET request to update Employee.
router.get('/employees/:id/edit', isAuthenticated, isAdmin, function(req, res){
    connection.query('SELECT firstName, lastName, position, email, phone FROM employee WHERE id = ?', [req.params.id], function (error, results, fields) {
        // error will be an Error if one occurred during the query
        // results will contain the results of the query
        // fields will contain information about the returned results fields (if any)
        if (error) {
            throw error;
        }
        // results[0].dob = JSON.stringify(results[0].dob).slice(1,11);
        //results[0].dob = s.slice(6,8) + '-' + s.slice(9,11) + '-' + s.slice(1,5);
        // console.log(results[0].dob);
        //console.log(results[0].city);

        res.render('employees/edit', {
            req: req,
            data: results,
            id: req.params.id,
            title: 'Edit employee',
            errors: req.flash('errors'),
            inputs: req.flash('inputs')
        });
    });
});

// PUT request to update Employee.
router.put('/employees/:id', isAuthenticated, isAdmin, [
    // validation
    body('firstname', 'Empty firstname').not().isEmpty(),
    body('lastname', 'Empty lastname').not().isEmpty(),
    body('position', 'Empty dob').not().isEmpty(),
    body('email', 'Empty email').not().isEmpty(),
    body('phone', 'Empty phone').not().isEmpty(),

    body('firstname', 'First name must be between 5-45 characters.').isLength({min:5, max:45}),
    body('lastname', 'Last name must be between 5-45 characters.').isLength({min:5, max:45}),
    body('email', 'Email must be between 5-255 characters.').isLength({min:5, max:255}),
    body('phone', 'Phone must be 10 characters.').isLength({min:10, max:10}),

    body('email', 'Invalid email').isEmail(),
    body('phone', 'Invalid phone').isMobilePhone()
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
        sanitizeBody('firstname').trim().escape();
        sanitizeBody('lastname').trim().escape();
        sanitizeBody('position').trim().escape();
        sanitizeBody('email').trim().escape();
        sanitizeBody('phone').trim().escape();
        const firstname = req.body.firstname;
        const lastname = req.body.lastname;
        const position = req.body.position;
        const email = req.body.email;
        const phone = req.body.phone;
        connection.query('UPDATE employee SET firstName = ?, lastName = ?, position = ?, email = ?, phone = ? WHERE id = ?', [firstname, lastname, position, email, phone, req.params.id], function (error, results, fields) {
            // error will be an Error if one occurred during the query
            // results will contain the results of the query
            // fields will contain information about the returned results fields (if any)
            if (error) {
                throw error;
            }
            req.flash('alert', 'Employee edited.');
            res.redirect('/employees');
        });
    }
});

// GET request for list of all Employee items.
router.get('/employees', isAuthenticated, function(req, res){
    console.log(req.route.path);
    connection.query('SELECT * FROM `employee`', function (error, results, fields) {
        // error will be an Error if one occurred during the query
        // results will contain the results of the query
        // fields will contain information about the returned results fields (if any)
        if (error) {
            throw error;
        }
        res.render('employees/index', {
            req: req,
            employees: results,
            title: 'Employees',
            alert: req.flash('alert')
        });
    });
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
    // let redirect = '';
    // if (req.isAuthenticated()) {
    //     redirect = '/users';
    // } else {
    //     redirect = '/login';
    // }
    res.render('users/new', {
        req: req,
        title: 'Register',
        // redirect: redirect,
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
                    console.log('done');
                    req.flash('alert', 'You have successfully registered.');
                    res.redirect('/login');
                });
            });
        }
    }
);


// DELETE request to delete User.
router.delete('/users/:id', isAuthenticated, isAdmin, function(req, res){
    connection.query('DELETE FROM user WHERE id = ?', [req.params.id], function (error, results, fields) {
        // error will be an Error if one occurred during the query
        // results will contain the results of the query
        // fields will contain information about the returned results fields (if any)
        if (error) {
            throw error;
        }
        req.flash('alert', 'User deleted.');
        res.redirect('/users');
    });
});

// GET request to update User.
router.get('/users/:id/edit', isAuthenticated, isSelf, function(req, res){
    connection.query('SELECT email, password, username, description FROM user WHERE id = ?', [req.params.id], function (error, results, fields) {
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
            data: results,
            id: req.params.id,
            title: 'Edit user',
            errors: req.flash('errors'),
            inputs: req.flash('inputs')
        });
    });
});

// PUT request to update User.
router.put('/users/:id', isAuthenticated, isAdminOrSelf, [
    // validation
    body('username', 'Empty username').not().isEmpty(),
    body('email', 'Empty email').not().isEmpty(),
    body('password', 'Empty password').not().isEmpty(),

    body('username', 'Username must be between 5-45 characters.').isLength({min:5, max:45}),
    body('email', 'Email must be between 5-100 characters.').isLength({min:5, max:100}),
    body('password', 'Password must be between 5-45 characters.').isLength({min:5, max:45}),

    body('email', 'Invalid email').isEmail(),
    body('password', 'Password must contain one lowercase character, one uppercase character, a number, and ' +
        'a special character').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i")
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
        sanitizeBody('username').trim().escape();
        sanitizeBody('email').trim().escape();
        sanitizeBody('password').trim().escape();
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;
        connection.query('UPDATE user SET username = ?, email = ?, password = ? WHERE id = ?', [username, email, password, req.params.id], function (error, results, fields) {
            // error will be an Error if one occurred during the query
            // results will contain the results of the query
            // fields will contain information about the returned results fields (if any)
            if (error) {
                throw error;
            }
            req.flash('alert', 'User edited.');
            res.redirect(req._parsedOriginalUrl.pathname);
        });
    }
});

// GET request for one User.
router.get('/users/:id', function(req, res){
    connection.query('SELECT id, username, email, password, datecreated, description FROM `user` WHERE id = ?', [req.params.id], function (error, results, fields) {
        // error will be an Error if one occurred during the query
        // results will contain the results of the query
        // fields will contain information about the returned results fields (if any)
        if (error) {
            throw error;
        }
        res.render('users/show', {
            req: req,
            user: results,
            // title: req.user.username,
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
