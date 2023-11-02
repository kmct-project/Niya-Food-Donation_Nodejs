var express = require("express");
var fs = require("fs");
const foodspotHelper = require("../helper/foodspotHelper");
var router = express.Router();

const verifySignedIn = (req, res, next) => {
  if (req.session.signedInFoodspot) {
    next();
  } else {
    res.redirect("/foodspots/signin");
  }
};

/* GET foodspots listing. */
router.get("/", verifySignedIn, function (req, res, next) {
  let foodspots = req.session.foodspot;
    res.render("foodspots/home", { foodspot: true, foodspots });
});


router.route("/signup")
  .get(function (req, res) {
    if (req.session.signedInFoodspot) {
      res.redirect("/foodspots");
    } else {
      res.render("foodspots/signup", {
        foodspot: true,
        signUpErr: req.session.signUpErr,
      });
    }
  })
  .post(function (req, res) {
    foodspotHelper.doSignup(req.body).then((response) => {
      console.log(response);
      if (response.status == false) {
        req.session.signUpErr = "Invalid Code";
        res.redirect("/foodspots/signup");
      } else {
        req.session.signedInFoodspot = true;
        req.session.foodspot = response;
        res.redirect("/foodspots");
      }
    });
  });


  router.route("/signin")
  .get(function (req, res) {
    if (req.session.signedInFoodspot) {
      res.redirect("/foodspots");
    } else {
      res.render("foodspots/signin", {
        foodspot: true,
        signInErr: req.session.signInErr,
      });
      req.session.signInErr = null;
    }
  })
  .post(function (req, res) {
    foodspotHelper.doSignin(req.body).then((response) => {
      if (response.status) {
        req.session.signedInFoodspot = true;
        req.session.foodspot = response.foodspot;
        res.redirect("/foodspots");
      } else {
        req.session.signInErr = "Invalid Email/Password";
        res.redirect("/foodspots/signin");
      }
    });
  });



router.get("/signout", function (req, res) {
  req.session.signedInFoodspot = false;
  req.session.foodspot = null;
  res.redirect("/foodspots");
});



module.exports = router;
