var express = require("express");
var donerHelper = require("../helper/donerHelper");
var router = express.Router();

const verifySignedIn = (req, res, next) => {
  if (req.session.signedIn) {
    next();
  } else {
    res.redirect("/doners/signin");
  }
};

/* GET home page. */
router.get("/", async function (req, res, next) {
  let doner = req.session.doner;
    res.render("doners/home", { admin: false, doner });
});

router.get("/signup", function (req, res) {
  if (req.session.signedIn) {
    res.redirect("/doners");
  } else {
    res.render("doners/signup", { admin: false });
  }
});

router.post("/signup", function (req, res) {
  donerHelper.doSignup(req.body).then((response) => {
    req.session.signedIn = true;
    req.session.doner = response;
    res.redirect("/doners");
  });
});

router.get("/signin", function (req, res) {
  if (req.session.signedIn) {
    res.redirect("/doners");
  } else {
    res.render("doners/signin", {
      admin: false,
      signInErr: req.session.signInErr,
    });
    req.session.signInErr = null;
  }
});

router.post("/signin", function (req, res) {
  donerHelper.doSignin(req.body).then((response) => {
    if (response.status) {
      req.session.signedIn = true;
      req.session.doner = response.doner;
      res.redirect("/doners");
    } else {
      req.session.signInErr = "Invalid Email/Password";
      res.redirect("/doners/signin");
    }
  });
});

router.get("/signout", function (req, res) {
  req.session.signedIn = false;
  req.session.doner = null;
  res.redirect("/doners");
});

module.exports = router;
