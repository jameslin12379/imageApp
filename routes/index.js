const express = require('express');
const router = express.Router();
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const passport = require('passport');
var multer  = require('multer');
var upload = multer();
var AWS = require('aws-sdk');
const s3 = new AWS.S3({
    accessKeyId: process.env.AWSAccessKeyId,
    secretAccessKey: process.env.AWSSecretKey
});
var moment = require('moment');
var faker = require('faker');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
var randomWords = require('random-words');

// var script = document.createElement('script');
// script.src = 'https://code.jquery.com/jquery-3.3.1.js';
// script.type = 'text/javascript';
// script.integrity = "sha256-2Kok7MbOyxpgUVvAk/HJ2jigOSYS2auK4Pfzbm7uH60=";
// script.crossorigin = "anonymous";

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

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('home/index', {
        req: req,
        title: 'GIF.com',
        alert: req.flash('alert')
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

// Generate 10000 users
router.get('/createusers', function(req, res){
    for (let i = 0; i < 5000; i++) {
        let randomEmail = faker.internet.email(); // Kassandra.Haley@erich.biz
        let randomP = faker.internet.password(); // Kassandra.Haley@erich.biz
        let randomName = faker.internet.userName(); // Rowan Nikolaus

        fs.appendFile("./routes/users.txt", `Users# ${i} Email ${randomEmail} Password ${randomP} Username ${randomName} \n`, function(err) {
            if(err) {
                return console.log(err);
            }
            // console.log("The file was saved!");
        });
        bcrypt.hash(randomP, saltRounds, function(err, hash) {
            // Store hash in your password DB.
            if (err) {
                throw error;
            }
            connection.query('INSERT INTO user (email, username, password) VALUES (?, ?, ?)', [randomEmail, randomName, hash], function (error, results, fields) {
                // error will be an Error if one occurred during the query
                // results will contain the results of the query
                // fields will contain information about the returned results fields (if any)
                if (error) {
                    throw error;
                }
                console.log('saved');
            });
        });
    }
});

// Generate 30 images for each topic (2100 images)
// for each topic, find 30 images from the internet,
// download images, upload them to AWS S3, get
// imageurl and save it to DB

// router.get('/createimages', function(req, res){
//     connection.query('select * from topic', function(error, results, fields){
//         if (error) {
//             throw error;
//         }
//         for (let i = 0; i < results.length; i++){
//             let topicname = results[i].name;
//             // for (let j = 0; j < 5; j++){
//                 // get a picture from unsplash.com related to current topic  and upload it
//                 // to AWS S3, get imageurl back and save it along with a randomly generated userid
//                 // from the 10000 user ids into DB and repeat
//                 // use unsplash API to get image (upper limit of 50 per hour)
//
//                 // https://images.unsplash.com/photo-1505664194779-8beaceb93744?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=100&q=60
//                 request(`https://www.pexels.com/search/${topicname}/`, function (error, response, body) {
//                     if (error) {
//                         throw error;
//                     }
//                     let $ = cheerio.load(body);
//                     let result = $('img.photo-item__img');
//                     let validurl = [];
//                     result.each(function (index, elem) {
//                         if (!(validurl.includes(elem.attribs.src))) {
//                             validurl.push(elem.attribs.src);
//                         }
//                     });
//                     for (let j = 0; j < validurl.length; j++) {
//                         const options = {
//                             url: validurl[j],
//                             encoding: null
//                         };
//                         request(options, function (e, r, b) {
//                             const uploadParams = {
//                                 Bucket: 'imageappbucket', // pass your bucket name
//                                 Key: 'images/' + validurl[j].substring(validurl[j].lastIndexOf('/')+1, validurl[j].lastIndexOf('?')), // file will be saved as testBucket/contacts.csv
//                                 Body: b,
//                                 ContentType: 'image/jpeg'
//                             };
//                             s3.upload(uploadParams, function (err, data) {
//                                 if (err) {
//                                     console.log("Error", err);
//                                 }
//                                 if (data) {
//                                     let userid = getRandomIntInclusive(1, 10000);
//                                     connection.query('INSERT INTO image (imageurl, userid, topicid) VALUES (?, ?, ?)', [data.Location,
//                                         userid, results[i].id], function (error, results, fields) {
//                                         // error will be an Error if one occurred during the query
//                                         // results will contain the results of the query
//                                         // fields will contain information about the returned results fields (if any)
//                                         if (error) {
//                                             throw error;
//                                         }
//                                     });
//                                 }
//                             });
//
//                         });
//
//                     }
//
//
//
//
//
//                     // let $ = cheerio.load(body);
//                         // let images = $('._1pn7R img').html();
//                         // console.log(images);
//                     // console.log($('._2zEKz').html());
//                     // console.log($('._2zEKz').attr('srcset'));
//
//
//                     // get link for each of images and send request to link and retrieve
//                     // image data to upload it to AWS S3 and get imageurl back and
//                     // save it along with randomized userid as a new image row into the DB
//
//                     // console.log(topicname);
//
//
//                     // $('h2.title').text('Hello there!')
//                     // $('h2').addClass('welcome')
//                     // var imgs = $(body).find('img');
//                     // console.log(imgs);
//                     // from topic page extract image links
//                 });
//                 // const uploadParams = {
//                 //     Bucket: 'imageappbucket', // pass your bucket name
//                 //     Key: 'images/' + req.file.originalname, // file will be saved as testBucket/contacts.csv
//                 //     Body: req.file.buffer,
//                 //     ContentType: req.file.mimetype
//                 // };
//                 // s3.upload (uploadParams, function (err, data) {
//                 //     if (err) {
//                 //         console.log("Error", err);
//                 //     } if (data) {
//                 //         connection.query('INSERT INTO image (imageurl, userid, topicid, originalname, ' +
//                 //             'encoding, mimetype, size) VALUES (?, ?, ?, ?, ?, ?, ?)', [data.Location,
//                 //             req.user.id, topic, req.file.originalname, req.file.encoding, req.file.mimetype, req.file.size], function (error, results, fields) {
//                 //             // error will be an Error if one occurred during the query
//                 //             // results will contain the results of the query
//                 //             // fields will contain information about the returned results fields (if any)
//                 //             if (error) {
//                 //                 throw error;
//                 //             }
//                 //             req.flash('alert', 'Photo uploaded.');
//                 //             res.redirect(`/users/${req.user.id}`);
//                 //         });
//                 //         // console.log("Upload Success", data.Location);
//                 //     }
//                 // });
//             // }
//         }
//     });
// });

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}

// create 10000 different profile pictures for 10000 users
// setup a list to hold 10000 urls and initially it is empty
// check if list is 10000 and if not send GET request to pixel image
// by randomly selecting a letter from the 26 letters and append it to
// get request and from the result returned (html string) parse it using
// cheerios and obtain the first image url and append it to list
// repeat and if next item retrieved is identical as last one repeat
// until it is different
// when the entire list is filled, loop over it and for each imageurl
// download the file, upload it to AWS S3, get returned imageurl,
// update it to current user's imageurl setting
// By end of loop, every user should have a new profile picture

// to AWS S3 and get imageurl and update
// router.get('/createprofileimages', function(req,res) {
//     // letters = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
//
//     // numbers = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
//     randomwords = [];
//
//     while (randomwords.length !== 10000) {
//         let word = randomWords();
//         if (!(randomwords.includes(word))) {
//             randomwords.push(word);
//         }
//     }
//     for (let i = 0; i < randomwords.length; i++){
//         // var letter = letters[Math.floor(Math.random()*letters.length)];
//         // var number = numbers[Math.floor(Math.random()*numbers.length)];
//         request(`https://www.pexels.com/search/${randomwords[i]}/`, function(e,r,b){
//             let $ = cheerio.load(b);
//             let result = $('img.photo-item__img');
//             console.log(result);
//         });
//     }
// });



router.get('/createimages', function(req,res) {
    request(`https://www.pexels.com/search/vintage/`, function (error, response, body) {
        if (error) {
            throw error;
        }
        let $ = cheerio.load(body);

        // let images = $('._1pn7R img').html();
        // console.log(images);
        let result = $('img.photo-item__img');
        let validurl = [];
        result.each(function (index, elem) {
            if (!(validurl.includes(elem.attribs.src))) {
                validurl.push(elem.attribs.src);
            }
        });
        for (let i = 0; i < validurl.length; i++) {
            const options = {
                url: validurl[i],
                encoding: null
            };
            request(options, function (e, r, b) {
                if (error) {
                    throw error;
                }
                const uploadParams = {
                    Bucket: 'imageappbucket', // pass your bucket name
                    Key: 'images/' + validurl[i].substring(validurl[i].lastIndexOf('/')+1, validurl[i].lastIndexOf('?')), // file will be saved as testBucket/contacts.csv
                    Body: b,
                    ContentType: 'image/jpeg'
                };
                s3.upload(uploadParams, function (err, data) {
                    if (err) {
                        console.log("Error", err);
                    }
                    if (data) {

                            let userid = getRandomIntInclusive(1, 10000);
                            connection.query('INSERT INTO image (imageurl, userid, topicid) VALUES (?, ?, ?)', [data.Location,
                                userid, 81], function (error, results, fields) {
                                // error will be an Error if one occurred during the query
                                // results will contain the results of the query
                                // fields will contain information about the returned results fields (if any)
                                if (error) {
                                    throw error;
                                }
                                console.log('saved');
                            });
                    }
                });

            });

        }
    });
});


router.get('/createimage', function(req,res){
    request(`https://www.pexels.com/search/comics/`, function (error, response, body) {
        if (error) {
            throw error;
        }
        let $ = cheerio.load(body);

        // let images = $('._1pn7R img').html();
        // console.log(images);
        let result = $('img.photo-item__img');
        let validurl = [];
        result.each(function(i, elem){

            if (!(validurl.includes(elem.attribs.src))) {
                validurl.push(elem.attribs.src);
            }
            });
            console.log(validurl);
        });
    });

// for each topic, generate 50 followers (make sure there are no repeating follower) (3500 topicfollowing rows)
router.get('/createtopicfollowings', function(req,res) {
    connection.query('SELECT * FROM topic', function(e, r, f){
        if (e){
            throw error;
        }
        for (let i = 0; i < r.length; i++){
            let topicid = r[i].id;
            followers = [];
            while (followers.length !== 50) {
                let userid = getRandomIntInclusive(1, 10000);
                if (!(followers.includes(userid))){
                    followers.push(userid);
                }
            }
            for (let j = 0; j < followers.length; j++) {
                connection.query('INSERT INTO topicfollowing (following, followed) VALUES (?, ?)', [followers[j], topicid], function (error, results, fields) {
                    // error will be an Error if one occurred during the query
                    // results will contain the results of the query
                    // fields will contain information about the returned results fields (if any)
                    if (error) {
                        throw error;
                    }

                });
            }

        }
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
        body('email', 'Empty email.').not().isEmpty(),
        body('password', 'Empty password.').not().isEmpty(),
        body('username', 'Empty username.').not().isEmpty(),
        body('email', 'Email must be between 5-100 characters.').isLength({min:5, max:100}),
        body('password', 'Password must be between 5-45 characters.').isLength({min:5, max:45}),
        body('username', 'Username must be between 5-45 characters.').isLength({min:5, max:45}),
        body('email', 'Invalid email.').isEmail(),
        body('password', 'Password must contain one lowercase character, one uppercase character, a number, and ' +
            'a special character.').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i")
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

// GET request for one User.
router.get('/users/:id', function(req, res){
    connection.query('SELECT id, username, datecreated, description, imageurl FROM `user` WHERE id = ?; SELECT id, imageurl FROM ' +
        'image WHERE userid = ? ORDER BY datecreated DESC LIMIT 12;SELECT count(*) as c FROM image WHERE userid = ?;', [req.params.id, req.params.id, req.params.id], function (error, results, fields) {
        // error will be an Error if one occurred during the query
        // results will contain the results of the query
        // fields will contain information about the returned results fields (if any)
        if (error) {
            throw error;
        }
        res.render('users/show', {
            req: req,
            title: 'Profile',
            results: results,
            moment: moment,
            alert: req.flash('alert')
        });
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
router.put('/users/:id', isAuthenticated, isSelf, upload.single('file'), [
    body('email', 'Empty email').not().isEmpty(),
    body('username', 'Empty username').not().isEmpty(),
    body('description', 'Empty password').not().isEmpty(),
    body('email', 'Email must be between 5-100 characters.').isLength({min:5, max:100}),
    body('username', 'Username must be between 5-45 characters.').isLength({min:5, max:45}),
    body('description', 'Username must be between 5-200 characters.').isLength({min:5, max:200}),
    body('email', 'Invalid email').isEmail()
], (req, res) => {
    // check if inputs are valid
    // if yes then upload picture to S3, get new imageurl, check existing imageurl and if it is not
    // default picture delete it using link, save imageurl and other fields into DB and if successful
    // return to user home page
    const errors = validationResult(req);
    let errorsarray = errors.array();
    // file is not empty
    // file size limit (max 30mb)
    // file type is image
    if (req.file.size === 0){
        errorsarray.push({msg: "File cannot be empty."});
    }
    if (req.file.mimetype.slice(0, 5) !== 'image'){
        errorsarray.push({msg: "File type needs to be image."});
    }
    if (req.file.size > 30000000){
        errorsarray.push({msg: "File cannot exceed 30MB."});
    }
    if (errorsarray.length !== 0) {
        // There are errors. Render form again with sanitized values/errors messages.
        // Error messages can be returned in an array using `errors.array()`.
        req.flash('errors', errorsarray);
        req.flash('inputs', {email: req.body.email, username: req.body.username, description: req.body.description});
        res.redirect(req._parsedOriginalUrl.pathname + '/edit');
    }
    else {
        sanitizeBody('email').trim().escape();
        sanitizeBody('username').trim().escape();
        sanitizeBody('description').trim().escape();
        const email = req.body.email;
        const username = req.body.username;
        const description = req.body.description;
        // upload image to AWS, get imageurl, check existing imageurl and if not pointing to default profile picture,
        // delete associated image from bucket, update row from DB with email, username, description, imageurl
        // console.log(req.file);
        const uploadParams = {
            Bucket: 'imageappbucket', // pass your bucket name
            Key: 'profiles/' + req.file.originalname, // file will be saved as testBucket/contacts.csv
            Body: req.file.buffer,
            ContentType: req.file.mimetype
        };
        s3.upload (uploadParams, function (err, data) {
            if (err) {
                console.log("Error", err);
            } if (data) {
                if (req.user.imageurl !== 'https://s3.amazonaws.com/imageappbucket/profiles/blank-profile-picture-973460_640.png'){
                    const uploadParams2 = {
                        Bucket: 'imageappbucket', // pass your bucket name
                        Key: 'profiles/' + req.user.imageurl.substring(req.user.imageurl.lastIndexOf('/') + 1) // file will be saved as testBucket/contacts.csv
                    };
                    s3.deleteObject(uploadParams2, function(err, data) {
                        if (err) console.log(err, err.stack);  // error
                        else     console.log();                 // deleted
                    });
                }
                connection.query('UPDATE user SET email = ?, username = ?, description = ?, imageurl = ? WHERE id = ?', [email, username, description, data.Location, req.params.id], function (error, results, fields) {
                    // error will be an Error if one occurred during the query
                    // results will contain the results of the query
                    // fields will contain information about the returned results fields (if any)
                    if (error) {
                        throw error;
                    }
                    req.flash('alert', 'Profile edited.');
                    res.redirect(req._parsedOriginalUrl.pathname);
                });
            }
        });
    }
});

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
        res.redirect('/');
    });
});

/// IMAGE ROUTES ///
// GET request for creating a Image. NOTE This must come before routes that display Image (uses id).
router.get('/images/new', isAuthenticated, function(req, res){
    res.render('images/new', {
        req: req,
        title: 'Upload a photo',
        errors: req.flash('errors'),
        inputs: req.flash('inputs')
    });
});

// POST request for creating Image.
router.post('/images', isAuthenticated, upload.single('file'), [
        // validation
        body('topic', 'Empty topic').not().isEmpty(),
    ], (req, res) => {
        const errors = validationResult(req);
        let errorsarray = errors.array();
        // file is not empty
        // file size limit (max 30mb)
        // file type is image
        if (req.file.size === 0){
            errorsarray.push({msg: "File cannot be empty."});
        }
        if (req.file.mimetype.slice(0, 5) !== 'image'){
            errorsarray.push({msg: "File type needs to be image."});
        }
        if (req.file.size > 30000000){
            errorsarray.push({msg: "File cannot exceed 30MB."});
        }
        if (errorsarray.length !== 0) {
            // There are errors. Render form again with sanitized values/errors messages.
            // Error messages can be returned in an array using `errors.array()`.
            req.flash('errors', errorsarray);
            req.flash('inputs', {topic: req.body.topic});
            res.redirect('/images/new');
        }
        else {
            // const redirect = req.query.redirect;
            // Data from form is valid.
            sanitizeBody('topic').trim().escape();
            const topic = req.body.topic;
            // upload image to AWS, get imageurl, insert row into DB with title, description, topic, imageurl, currentuserid, and
            // meta data fields for image (size, type, etc...)
            // console.log(req.file);
            const uploadParams = {
                Bucket: 'imageappbucket', // pass your bucket name
                Key: 'images/' + req.file.originalname, // file will be saved as testBucket/contacts.csv
                Body: req.file.buffer,
                ContentType: req.file.mimetype
            };
            s3.upload (uploadParams, function (err, data) {
                if (err) {
                    console.log("Error", err);
                } if (data) {
                    connection.query('INSERT INTO image (imageurl, userid, topicid, originalname, ' +
                        'encoding, mimetype, size) VALUES (?, ?, ?, ?, ?, ?, ?)', [data.Location,
                    req.user.id, topic, req.file.originalname, req.file.encoding, req.file.mimetype, req.file.size], function (error, results, fields) {
                        // error will be an Error if one occurred during the query
                        // results will contain the results of the query
                        // fields will contain information about the returned results fields (if any)
                        if (error) {
                            throw error;
                        }
                        req.flash('alert', 'Photo uploaded.');
                        res.redirect(`/users/${req.user.id}`);
                    });
                    // console.log("Upload Success", data.Location);
                }
            });
        }
    }
);

// GET request for one Image.
router.get('/images/:id', function(req, res){
    connection.query('select i.id, i.imageurl, i.datecreated, i.userid, i.topicid, u.username, t.name from image as i inner join user as u on i.userid = u.id inner join topic as t on i.topicid = t.id where i.id = ?', [req.params.id], function (error, results, fields) {
        // error will be an Error if one occurred during the query
        // results will contain the results of the query
        // fields will contain information about the returned results fields (if any)
        if (error) {
            throw error;
        }
        res.render('images/show', {
            req: req,
            title: 'Photo',
            result: results[0],
            moment: moment,
            alert: req.flash('alert')
        });
    });
});


// DELETE request to delete User.
router.delete('/images/:id', isAuthenticated, function(req, res){
    connection.query('SELECT userid FROM image WHERE id = ?', [req.params.id], function (error, results, fields) {
        // error will be an Error if one occurred during the query
        // results will contain the results of the query
        // fields will contain information about the returned results fields (if any)
        if (error) {
            throw error;
        }
        const userid = results[0].userid;
        if (req.user.id !== userid) {
            res.redirect('/403');
        }
        connection.query('DELETE FROM image WHERE id = ?', [req.params.id], function (error, results, fields) {
            // error will be an Error if one occurred during the query
            // results will contain the results of the query
            // fields will contain information about the returned results fields (if any)
            if (error) {
                throw error;
            }
            req.flash('alert', 'Photo deleted.');
            res.redirect(`/users/${req.user.id}`);
        });
    });
});


/// TOPIC ROUTES ///

// get topic information, get 10 images of the topic, if current user is logged in, check if he has
// followed topic or not if yes pass unfollow to button value else pass follow to button value
//

router.get('/topics/:id', function(req, res){
    connection.query('SELECT id, name, description, datecreated, url FROM `topic` WHERE id = ?; SELECT id, imageurl FROM `image` WHERE topicid = ? ORDER BY datecreated DESC LIMIT 12;' +
        'SELECT count(*) as c FROM image WHERE topicid = ?;SELECT count(*) as c2 FROM topicfollowing WHERE followed = ?', [req.params.id, req.params.id, req.params.id, req.params.id],
        function (error, results, fields) {
            // error will be an Error if one occurred during the query
            // results will contain the results of the query
            // fields will contain information about the returned results fields (if any)
            if (error) {
                throw error;
            }
            if (req.isAuthenticated()) {
                connection.query('SELECT count(*) as C FROM topicfollowing WHERE following = ? and followed = ?;', [req.user.id, req.params.id],
                    function (error, result, fields) {
                        if (error) {
                            throw error;
                        }
                        res.render('topics/show', {
                            req: req,
                            results: results,
                            status: result[0].C,
                            moment: moment,
                            alert: req.flash('alert')
                        });
                    });
            } else {
                res.render('topics/show', {
                    req: req,
                    results: results,
                    moment: moment,
                    alert: req.flash('alert')
                });
            }

        });
});

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

/// GET request for topic followers sorted by created date in descending order limit by 12
router.get('/topics/:id/followers', function(req, res){
    connection.query('SELECT id, name, description, url FROM `topic` WHERE id = ?;SELECT u.id, u.username, u.imageurl ' +
        'from topicfollowing as tf inner join user as u on tf.following = u.id where tf.followed = ? ' +
        'ORDER BY tf.datecreated DESC LIMIT 12; SELECT count(*) as followers FROM topicfollowing WHERE followed = ?',
        [req.params.id, req.params.id, req.params.id], function (error, results, fields) {
        // error will be an Error if one occurred during the query
        // results will contain the results of the query
        // fields will contain information about the returned results fields (if any)
        if (error) {
            throw error;
        }
        res.render('topics/followers', {
            req: req,
            results: results,
            alert: req.flash('alert')
        });
    });
});

/// TOPICFOLLOWING ROUTES ///

// POST request for creating Topicfollowing.
router.post('/topicfollowings', isAuthenticated, function(req, res) {
    connection.query('INSERT INTO topicfollowing (following, followed) VALUES (?, ?)', [req.user.id, req.body.topicid], function (error, results, fields) {
        // error will be an Error if one occurred during the query
        // results will contain the results of the query
        // fields will contain information about the returned results fields (if any)
        if (error) {
            throw error;
        }
        // console.log(results);
        // res.json({tfid: results.insertId});
        res.json({status: 'done'});
    });
});

// DELETE request for deleting Topicfollowing.
// router.delete('/topicfollowings/:id', isAuthenticated, function(req, res) {
//     connection.query('SELECT following FROM topicfollowing WHERE id = ?', [req.params.id], function (error, results, fields) {
//         // error will be an Error if one occurred during the query
//         // results will contain the results of the query
//         // fields will contain information about the returned results fields (if any)
//         if (error) {
//             throw error;
//         }
//         const userid = results[0].following;
//         if (req.user.id !== userid) {
//             res.redirect('/403');
//         }
//         connection.query('DELETE FROM topicfollowing WHERE id = ?', [req.params.id], function (error, results, fields) {
//             // error will be an Error if one occurred during the query
//             // results will contain the results of the query
//             // fields will contain information about the returned results fields (if any)
//             if (error) {
//                 throw error;
//             }
//             res.json({status: 'done'});
//         });
//     });
// });

router.delete('/topicfollowings', isAuthenticated, function(req, res) {
    connection.query('DELETE FROM topicfollowing WHERE following = ? and followed = ?', [req.user.id, req.body.topicid], function (error, results, fields) {
        // error will be an Error if one occurred during the query
        // results will contain the results of the query
        // fields will contain information about the returned results fields (if any)
        if (error) {
            throw error;
        }
        res.json({status: 'done'});
    });
    // connection.query('SELECT following FROM topicfollowing WHERE id = ?', [req.params.id], function (error, results, fields) {
    //     // error will be an Error if one occurred during the query
    //     // results will contain the results of the query
    //     // fields will contain information about the returned results fields (if any)
    //     if (error) {
    //         throw error;
    //     }
    //     const userid = results[0].following;
    //     if (req.user.id !== userid) {
    //         res.redirect('/403');
    //     }
    //     connection.query('DELETE FROM topicfollowing WHERE id = ?', [req.params.id], function (error, results, fields) {
    //         // error will be an Error if one occurred during the query
    //         // results will contain the results of the query
    //         // fields will contain information about the returned results fields (if any)
    //         if (error) {
    //             throw error;
    //         }
    //         res.json({status: 'done'});
    //     });
    // });
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

router.get('/404', function(req, res){
    res.render('404');
});

module.exports = router;
