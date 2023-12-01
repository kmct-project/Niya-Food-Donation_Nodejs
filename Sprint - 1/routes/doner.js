var express = require("express");
var donerHelper = require("../helper/donerHelper");
var router = express.Router();
var fs = require("fs");

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
  donerHelper.getAlldonates().then((donates) => {
    res.render("doners/home", { admin: false, doner, layout: "doner", donates });
  })
});


///////ALL donate/////////////////////                                         
// router.get("/all-donates", verifySignedIn, function (req, res) {
//   let doner = req.session.doner;
//   donerHelper.getAlldonates().then((donates) => {
//     res.render("doners/all-donates", { admin: false, layout: "", donates, doner });
//   });
// });

///////ADD donate/////////////////////                                         
router.get("/add-donate", verifySignedIn, function (req, res) {
  let doner = req.session.doner;
  res.render("doners/add-donate", { admin: false, layout: "", doner });
});

///////ADD donate/////////////////////                                         
router.post("/add-donate", function (req, res) {
  donerHelper.adddonate(req.body, (id) => {
    let image = req.files.Image;
    image.mv("./public/images/donate-images/" + id + ".png", (err, done) => {
      if (!err) {
        res.redirect("/doners");
      } else {
        console.log(err);
      }
    });
  });
});

///////EDIT donate/////////////////////                                         
router.get("/edit-donate/:id", verifySignedIn, async function (req, res) {
  let doner = req.session.doner;
  let donateId = req.params.id;
  let donate = await donerHelper.getdonateDetails(donateId);
  console.log(donate);
  res.render("doners/edit-donate", { admin: false, layout: "doner", donate, doner });
});

///////EDIT donate/////////////////////                                         
router.post("/edit-donate/:id", verifySignedIn, function (req, res) {
  let donateId = req.params.id;
  donerHelper.updatedonate(donateId, req.body).then(() => {
    if (req.files) {
      let image = req.files.Image;
      if (image) {
        image.mv("./public/images/donate-images/" + donateId + ".png");
      }
    }
    res.redirect("/doners/");
  });
});

///////DELETE donate/////////////////////                                         
router.get("/delete-donate/:id", verifySignedIn, function (req, res) {
  let donateId = req.params.id;
  donerHelper.deletedonate(donateId).then((response) => {
    fs.unlinkSync("./public/images/donate-images/" + donateId + ".png");
    res.redirect("/doners/");
  });
});

///////DELETE ALL donate/////////////////////                                         
router.get("/delete-all-donates", verifySignedIn, function (req, res) {
  donerHelper.deleteAlldonates().then(() => {
    res.redirect("/doners/");
  });
});






router.get("/signup", function (req, res) {
  if (req.session.signedIn) {
    res.redirect("/doners");
  } else {
    res.render("doners/signup", { admin: false, layout: "emptylayout" });
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
      layout: "emptylayout",
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
