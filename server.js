var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var mongojs = require("mongojs");
// Require all models
var databaseUrl = "scraper";
var collections = ["scrapedData"];
var db = mongojs(databaseUrl, collections);
db.on("error", function (error) {
  console.log("Database Error:", error);
});

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost:27017/week18Populater");

app.get("/scrape", function (req, res) {
    var cheerio = require("cheerio");
    var request = require("request");
  
    // Make a request call to grab the HTML body from the site of your choice
    request("https://www.manutd.com/", function (error, response, html) {
  
      // Load the HTML into cheerio and save it to a variable
      // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
      var $ = cheerio.load(html);
  
      // Select each element in the HTML body from which you want information.
      // NOTE: Cheerio selectors function similarly to jQuery's selectors,
      // but be sure to visit the package's npm page to see how it works
      $("div.mu-item__info").each(function (i, element) {
  
        var link = $(element).children().attr("href");
        var title = $(element).children().children().text();
        // var summ = $(element).children().class("mu-item__treasure");
  
        // Save these results in an object that we'll push into the results array we defined earlier
        db.manchester.insert({
          title: title,
          link: link
        });
      });
      // Log the results once you've looped through each of the elements found with cheerio
      res.json("scraped!");
    });
  });

  app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
  });