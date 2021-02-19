const router = require("express").Router();

router.use (function(req, res, next){
  console.log(req.url, "@", Date.now());
  next();
});

router
  .route("/findAll")
  ///reviews/findAll
  .get(function(req, res) {
    Review.find(function(err, foundReviews) {
      if (!err) {
        res.send(foundReviews);
      } else {
        console.log(err);
      }
    });
  });

router
  .route("/ingest")
  .post(function(req, res) {
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
  });

router
  .route("/clear")
  .delete(function(req, res) {
    Review.deleteMany(function(err) {
      if (!err) {
        res.send("Successfully deleted all review!");
      } else {
        res.send(err);
      }
    });
  });

/////////////////////////////////Requests Targetting a specific review.
router
  .route("/:reviewID")
  .get(function(req, res) {
    Review.findOne({
      id: req.params.reviewID
    }, function(err, foundReviews) {
      if (foundReviews) {
        res.send(foundReviews);
      } else {
        res.send("Not found!");
      }
    });
  })
  //replace entirely
  .put(function(req, res) {
    Review.update({
        id: req.params.reviewID
      }, {
        id: req.body.id,
        comments: req.body.comments
      }, {
        overwrite: true
      },
      function(err) {
        if (!err) {
          res.send("Successfully updated!");
        } else {
          res.send(err);
        }
      });
  })

  //only replace rewrited part.
  .patch(function(req, res) {
    Review.update({
      id: req.params.reviewID
    }, {
      //set: replace the value of a field with the specific value
      $set: req.body
    }, function(err) {
      if (!err) {
        res.send("Successfully updated!");
      } else {
        res.send(err);
      }
    });
  })

  .delete(function(req, res) {
    Review.deleteOne({
      id: req.params.reviewID
    }, function(err) {
      if (!err) {
        res.send("Successfully deleted the specific reviews!");
      } else {
        res.send(err);
      }
    });
  });

module.exports = router;
