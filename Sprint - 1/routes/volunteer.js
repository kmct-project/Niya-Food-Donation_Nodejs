var express = require("express");
var fs = require("fs");
const volunteerHelper = require("../helper/volunteerHelper");

var router = express.Router();

const verifySignedIn = (req, res, next) => {
  if (req.session.signedInVolunteer) {
    next();
  } else {
    res.redirect("/volunteers/signin");
  }
};

/* GET volunteers listing. */
router.get("/", verifySignedIn, function (req, res, next) {
  let volunteering = req.session.volunteer;
    res.render("volunteers/home", { volunteer: true, layout:"volunteer", volunteering });
});


router.route("/signup")
  .get(function (req, res) {
    if (req.session.signedInVolunteer) {
      res.redirect("/volunteers");
    } else {
      res.render("volunteers/signup", {
        volunteer: true,
        signUpErr: req.session.signUpErr,
      });
    }
  })
  .post(function (req, res) {
    volunteerHelper.doSignup(req.body).then((response) => {
      console.log(response);
      if (response.status == false) {
        req.session.signUpErr = "Invalid Code";
        res.redirect("/volunteers/signup");
      } else {
        req.session.signedInVolunteer = true;
        req.session.volunteer = response;
        res.redirect("/volunteers");
      }
    });
  });


  router.route("/signin")
  .get(function (req, res) {
    if (req.session.signedInVolunteer) {
      res.redirect("/volunteers");
    } else {
      res.render("volunteers/signin", {
        volunteer: true,
        signInErr: req.session.signInErr,
      });
      req.session.signInErr = null;
    }
  })
  .post(function (req, res) {
    volunteerHelper.doSignin(req.body).then((response) => {
      if (response.status) {
        req.session.signedInVolunteer = true;
        req.session.volunteer = response.volunteer;
        res.redirect("/volunteers");
      } else {
        req.session.signInErr = "Invalid Email/Password";
        res.redirect("/volunteers/signin");
      }
    });
  });



router.get("/signout", function (req, res) {
  req.session.signedInVolunteer = false;
  req.session.volunteer = null;
  res.redirect("/volunteers");
});



module.exports = router;
