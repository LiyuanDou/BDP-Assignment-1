const express = require("express");
const app = express();
const port = process.env.port || 3000;
const bodyParser = require("body-parser");
const mongodb = require("mongodb").MongoClient;
const mongoose = require('mongoose');
const csv = require("csv-parser");
const fs = require("fs");
const fastcsv = require("fast-csv");

app.use(bodyParser.urlencoded({
  extended: true
}));

//Import Routes
// const roomRoute = require("../routes/roomsRoute");
// const reviewRoute = require("../routes/reviewsRoute");

//middleware
// app.use(express.json());

//Route Middlewares
// app.use("/rooms", roomRoute);
// app.use("/reviews", reviewRoute);


//Read CSV file and uploand into MongoDB Atlas
const reviews = [];
const listings = [];

fs.createReadStream("../data/reviews.csv")
  .pipe(csv({}))
  .on("data", (data) => reviews.push(data))
  .on("end", () => {
    console.log(reviews);
  });

mongodb.connect(
  "mongodb+srv://admin-liyuan:rice1128@cluster0.dcods.mongodb.net/BDP?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true
  },
  (err, client) => {
    if (err) throw err;
    client
      .db("airbnb")
      .collection("reviews")
      .insertMany(reviews, (err, res) => {
        if (err) throw err;
        console.log(`Inserted: ${res.insertedCount} rows`);
        client.close();
      });
  }
);

// fs.createReadStream("../data/listings.csv")
//   .pipe(csv({}))
//   .on("data", (data) => listings.push(data))
//   .on("end", () => {
//     console.log(listings);
//   });
//
// mongodb.connect(
//   "mongodb+srv://admin-liyuan:rice1128@cluster0.dcods.mongodb.net/BDP?retryWrites=true&w=majority", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
//   },
//   (err, client) => {
//     if (err) throw err;
//     client
//       .db("airbnb")
//       .collection("listings")
//       .insertMany(listings, (err, res) => {
//         if (err) throw err;
//         console.log(`Inserted: ${res.insertedCount} rows`);
//         client.close();
//       });
//   }
// );


// Create Schema for each collection
const reviewSchema = {
  listing_id: Number,
  id: Number,
  date: Date,
  reviewer_id: Number,
  reviewer_name: String,
  comments: String
}
//
const Review = mongoose.model("Review", reviewSchema);
//
const listingSchema = {
  id: Number,
  name: String,
  host_id: Number,
  neighbourhood_group: String,
  neighbourhood: String,
  latitude: Number,
  longitude: Number,
  room_type: String,
  price: Number,
  minimum_nights: Number,
  number_of_reviews: Number,
  last_review: Date,
  reviews_per_month: Number,
  calculated_host_listings_count: Number,
  availability_365: Number
}
//
const Listing = mongoose.model("Listing", listingSchema);
//

// RESTful APIs
/////////////////////////////////Requests Targetting all rooms.
app.get("/airbnb/findAll", function(req, res) {
  Room.find(function(err, foundReviews) {
    if (!err) {
      res.send(foundReviews);
    } else {
      console.log(err);
    }
  });
})

app.post("/airbnb/ingest", function(req, res) {
  const newReview = new Review({
    listing_id: req.body.listing_id,
    id: req.body.id,
    date: req.body.date,
    reviewer_id: req.body.reviewer_id,
    reviewer_name: req.body.reviewer_name,
    comments: req.body.comments
  });
  newReview.save(function(err) {
    if (!err) {
      res.send("Successfully added a new review!");
    } else {
      res.send(err);
    }
  });
})
//
app.delete("/clear", function(req, res) {
  Room.deleteMany(function(err) {
    if (!err) {
      res.send("Successfully deleted all review!");
    } else {
      res.send(err);
    }
  });
});
//
//
//
// /////////////////////////////////Requests Targetting a specific review.
//
// app.get("/airbnb/:reviewID", function(req, res) {
//     Review.findOne({
//       id: req.params.reviewID
//     }, function(err, foundReviews) {
//       if (foundReviews) {
//         res.send(foundReviews);
//       } else {
//         res.send("Not found!");
//       }
//     });
//   })
//
//   //replace entirely
//   .put(function(req, res) {
//     Review.update({
//         id: req.params.reviewID
//       }, {
//         id: req.body.id,
//         comments: req.body.comments
//       }, {
//         overwrite: true
//       },
//       function(err) {
//         if (!err) {
//           res.send("Successfully updated!");
//         } else {
//           res.send(err);
//         }
//       });
//   })
//
//   //only replace rewrited part.
//   .patch(function(req, res) {
//     Review.update({
//       id: req.params.reviewID
//     }, {
//       //set: replace the value of a field with the specific value
//       $set: req.body
//     }, function(err) {
//       if (!err) {
//         res.send("Successfully updated!");
//       } else {
//         res.send(err);
//       }
//     });
//   })
//
//   .delete( function( req, res) {
//     Review.deleteOne({
//       id: req.params.reviewID
//     }, function(err) {
//       if (!err) {
//         res.send("Successfully deleted the specific reviews!");
//       } else {
//         res.send(err);
//       }
//     });
//   });




// app.listen(3000, function() {
//   console.log("Server started on port 3000");
// });
