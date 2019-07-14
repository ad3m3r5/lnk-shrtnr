// app/routes.js

var async = require('async');

var nanoid = require('nanoid');
var Url = require('url-parse');

var Link = require('../models/link');

module.exports = function(app) {
    // Index Page
    app.get('/', function(req, res) {
        res.render('index.ejs', {
            title: 'Home',
            message: req.flash('urlMessage'),
            messageL: req.flash('linkMessage')
        });
    });
    
    app.post('/', function(req, res) {
        var url = prepareUrl(req.body.urltxt);
        if ( url.length == 0 || !(validateUrl(req.body.urltxt)) ) {
            req.flash('urlMessage', 'Please provide a valid URL');
            res.redirect('/');
        } else {
            Link.findOne({ 'ol' : url }, function(err, link) {
                if (err) {
                    console.log('Error creating link: ' + url);
                    req.flash('urlMessage', 'An error occured shortening your link');
                    res.redirect('/');
                } else {
                    if (link) {
                        req.flash('urlMessage', 'Shortened link: /' + link.sl);
                        req.flash('linkMessage', '/' + link.sl);
                        res.redirect('/');
                    } else {

                        async.forever(
                            function(next) {
                                slID = getShortenedLink();
                                Link.findOne({ 'sl' : slID }, function(err, slink) {
                                    if (slink) {
                                        console.log('NOT UNIQUE, REMAKING: ' + slID);
                                        return next();
                                    } else {
                                        console.log('UNIQUE NanoID FOUND: ' + slID);
                                        req.newslID = slID;
                                        next(new Error());
                                    }
                                }).catch(function (err) {
                                    next(err);
                                    return response.send(500);
                                });
                            },
                            function(err) {
                                var slID = req.newslID;
                                if (slID) {
                                    var newLink = new Link();
                                    newLink.ol = url;
                                    newLink.sl = slID;
                                    newLink.save(function(err) {
                                        if (err) {
                                            console.log('Error saving link: ' + newLink);
                                            req.flash('urlMessage', 'An error occured shortening your link');
                                            res.redirect('/');
                                        } else {
                                            console.log('Link created: ' + newLink);
                                            req.flash('urlMessage', 'Shortened link: /' + newLink.sl);
                                            req.flash('linkMessage', '/' + newLink.sl);
                                            res.redirect('/');
                                        }
                                    });
                                } else {
                                    console.log('Error creating slID');
                                }
                            }
                        );

                    }
                }
            });
        }
    });

    // Error Page
    app.get('/linkerror', function(req, res) {
        res.render('linkerror.ejs', {
            title: 'Error',
            message: req.flash('linkerrorMessage')
        });
    });

    // Link Redirecting
    app.get('/:link', function(req, res) {
        Link.findOne({ 'sl' : req.params.link }, function(err, link) {
            console.log('REQ: ' + req.params.link);
            if (!link) {
                req.flash('linkerrorMessage', 'The link you have requested could not be found');
                res.redirect('/linkerror');
            } else {
                res.redirect(link.ol);
            }
        });
    });

    // 404 Error Page
    app.get('*', function(req, res) {
        res.render('error.ejs', {
            title: 'Error',
            message: req.flash('errorMessage')
        });
    });

};

function getShortenedLink() {
    var gen = Math.floor(Math.random() * (7 - 3 + 1) + 3);
    var input = nanoid(gen);
    return input;
}

function sanitizeUrl(sanUrl) {
    input = encodeURI(sanUrl);
    if(input.substr(-1) === '/') {
        input = input.replace(/\/$/, "");
    }
    var parsedUrl = new Url(input);
    if (parsedUrl.protocol == '') {
        input = 'http://' + (parsedUrl.hostname).toLowerCase() + parsedUrl.pathname + parsedUrl.query
    } else {
        input = parsedUrl.protocol + '//' + (parsedUrl.hostname).toLowerCase() + parsedUrl.pathname + parsedUrl.query;
    }
    parsedNew = new Url(input);
    input = parsedNew.protocol + '//' + (parsedNew.hostname).toLowerCase() + parsedNew.pathname + parsedNew.query;
    return input;
}

function prepareUrl(prepUrl) {
    var input = sanitizeUrl(prepUrl);
    console.log(input);
    return input;
}

function validateUrl(valUrl) {
    var input = sanitizeUrl(valUrl);
    var parseHost = new Url(input);
    input = parseHost.origin;
    var flag;
    regexp =  /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
    if (regexp.test(input)) {
        flag = true;
    } else {
        flag = false;
    }
    return flag;
}
