var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");
;

var PORT = 3000;


var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Connect to the Mongo DB
// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scraper";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

mongoose.connect("mongodb://localhost:27017/scraper");

app.get("/scrape", function (req, res) {
    var cheerio = require("cheerio");
    var request = require("request");

    // Make a request call to grab the HTML body from the site of your choice
    request("https://old.reddit.com/", function (error, response, html) {


        var $ = cheerio.load(html);

        $("a.title").each(function (i, element) {

            var link = $(element).attr("href");
            var title = $(element).text();

            var result = {};

            result.title = $(this).text();
            result.link = $(this).attr("href");


            db.Article.create(result)
                .then(function (dbArticle) {
                    // View the added result in the console
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    // If an error occurred, send it to the client
                    res.json(err);
                });
        });
        // Log the results once you've looped through each of the elements found with cheerio
        res.json("scraped!");
    });
});

app.get("/articles", function (req, res) {

    db.Article.find({})
        .populate("comment")
        .then(function (data) {
            res.json(data);
        })
        .catch(function (err) {
            res.json(err);
        })
});

app.get("/articles/:id", function (req, res) {
    db.Article.findOne({ _id: req.params.id })
        .populate("comment")
        .then(function (data) {
            res.json(data);
        })
        .catch(function (err) {
            res.json(err);
        })
});

app.post("/articles/:id", function (req, res) {
    db.Comment.create(req.body)
        .then(function (data) {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { $set: { comment: data._id } }, { new: true });
        })
        .then(function (data) {
            res.json(data);
        })
        .catch(function (err) {
            res.json(err);
        })
});

app.post("articles/:id", function (req, res) {
    db.Comment.findOneAndUpdate({
        _id: req.params.id 
    },
    {
        $set: {
            comment: "",
            title: ""
        }
    }
    )
});

app.get("/comments", function (req, res) {
    db.Comment.find({})
        .then(function (data) {
            // If all Users are successfully found, send them back to the client
            res.json(data);
        })
        .catch(function (err) {
            // If an error occurs, send the error back to the client
            res.json(err);
        });
})

app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});