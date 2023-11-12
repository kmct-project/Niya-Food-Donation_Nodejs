var express = require("express");
var adminHelper = require("../helper/adminHelper");
var fs = require("fs");
const userHelper = require("../helper/userHelper");
var router = express.Router();

///////VERIFY USER IS LOGGED IN OR NOT////////////
const verifySignedIn = (req, res, next) => {
  if (req.session.signedInAdmin) {
    next();
  } else {
    res.redirect("/admin/signin");
  }
};

/////////////HOME PAGE ROUTER////////////////////////////////
router.get("/", verifySignedIn, function (req, res, next) {
  let administator = req.session.admin;
  res.render("admin/home", { admin: true, layout: "adminlayout", administator });
});

/////////////SIGNUP PAGE ROUTER////////////////////////////////
router.route("/signup")
  .get(function (req, res) {
    if (req.session.signedInAdmin) {
      res.redirect("/admin");
    } else {
      res.render("admin/signup", {
        admin: true,
        layout: "emptylayout",
        signUpErr: req.session.signUpErr,
      });
    }
  })
  .post(function (req, res) {
    adminHelper.doSignup(req.body).then((response) => {
      console.log(response);
      if (response.status == false) {
        req.session.signUpErr = "Invalid Admin Code";
        res.redirect("/admin/signup");
      } else {
        req.session.signedInAdmin = true;
        req.session.admin = response;
        res.redirect("/admin");
      }
    });
  });

/////////////SIGNIN PAGE ROUTER////////////////////////////////
router.route("/signin")
  .get(function (req, res) {
    if (req.session.signedInAdmin) {
      res.redirect("/admin");
    } else {
      res.render("admin/signin", {
        admin: true,
        layout: "emptylayout",
        signInErr: req.session.signInErr,
      });
      req.session.signInErr = null;
    }
  })
  .post(function (req, res) {
    adminHelper.doSignin(req.body).then((response) => {
      if (response.status) {
        req.session.signedInAdmin = true;
        req.session.admin = response.admin;
        res.redirect("/admin");
      } else {
        req.session.signInErr = "Invalid Email/Password";
        res.redirect("/admin/signin");
      }
    });
  });

/////////////SIGNOUT PAGE ROUTER////////////////////////////////
router.get("/signout", function (req, res) {
  req.session.signedInAdmin = false;
  req.session.admin = null;
  res.redirect("/admin");
});


/////////////SIGNUP PAGE ROUTER////////////////////////////////
router.get("/all-cuisinereq", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  adminHelper.getAllcuisinereqs().then((cuisinereqs) => {
    res.render("admin/all-cuisinereq", { admin: true, layout: "adminlayout", administator, cuisinereqs });
  });
});


/////////////SIGNUP PAGE ROUTER////////////////////////////////
router.get("/all-food-category", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  adminHelper.getfcats().then((fcats) => {
    res.render("admin/all-food-category", { admin: true, layout: "adminlayout", administator, fcats });
  });
});

router.route("/all-food-category")
  .get(verifySignedIn, function (req, res) {
    let administator = req.session.admin;
    res.render("admin/all-food-category", { admin: true, administator });
  })
  .post(function (req, res) {
    adminHelper.addfcat(req.body, (id) => {
      let image = req.files.Image;
      image.mv("./public/images/food-category-images/" + id + ".png", (err, done) => {
        if (!err) {
          res.redirect("/admin/all-food-category");
        } else {
          console.log(err);
        }
      });
    });
  });





router.route("/edit-cat/:id")
  .get(verifySignedIn, async function (req, res) {
    let administator = req.session.admin;
    let fcatId = req.params.id;
    let fcat = await adminHelper.getcatdetails(fcatId);
    console.log(fcat);
    res.render("admin/edit-cat", { admin: true, fcat, layout: "adminlayout", administator });
  })
  .post(verifySignedIn, function (req, res) {
    let fcatId = req.params.id;
    adminHelper.updatefcat(fcatId, req.body).then(() => {
      if (req.files) {
        let image = req.files.Image;
        if (image) {
          image.mv("./public/images/food-category-images/" + fcatId + ".png");
        }
      }
      res.redirect("/admin/all-food-category");
    });
  });


router.get("/delete-fcat/:id", verifySignedIn, function (req, res) {
  let fcatId = req.params.id;
  adminHelper.deletefcat(fcatId).then((response) => {
    fs.unlinkSync("./public/images/food-category-images/" + fcatId + ".png");
    res.redirect("/admin/all-food-category");
  });
});



router.get("/all-users", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  adminHelper.getAllUsers().then((users) => {
    res.render("admin/all-users", { admin: true, layout: "adminlayout", administator, users });
  });
});

router.get("/all-doners", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  adminHelper.getalldoners().then((doners) => {
    res.render("admin/all-doners", { admin: true, layout: "adminlayout", administator, doners });
  });
});

router.get("/all-volunteers", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  adminHelper.getallvolunteers().then((volunteers) => {
    res.render("admin/all-volunteers", { admin: true, layout: "adminlayout", administator, volunteers });
  });
});

router.get("/all-trusts", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  adminHelper.getalltrusts().then((trusts) => {
    res.render("admin/all-trusts", { admin: true, layout: "adminlayout", administator, trusts });
  });
});

router.get("/all-foodspots", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  adminHelper.getallfoodspots().then((foodspots) => {
    res.render("admin/all-foodspots", { admin: true, layout: "adminlayout", administator, foodspots });
  });
});

router.get("/remove-foodspot/:id", verifySignedIn, function (req, res) {
  let foodspotId = req.params.id;
  adminHelper.removefoodspot(foodspotId).then(() => {
    res.redirect("/admin/all-foodspots");
  });
});


router.get("/remove-volunteer/:id", verifySignedIn, function (req, res) {
  let volunteerId = req.params.id;
  adminHelper.removevolunteer(volunteerId).then(() => {
    res.redirect("/admin/all-volunteers");
  });
});

router.get("/remove-trust/:id", verifySignedIn, function (req, res) {
  let trustId = req.params.id;
  adminHelper.removetrust(trustId).then(() => {
    res.redirect("/admin/all-trusts");
  });
});

router.get("/remove-doner/:id", verifySignedIn, function (req, res) {
  let donerId = req.params.id;
  adminHelper.removedoner(donerId).then(() => {
    res.redirect("/admin/all-doners");
  });
});

router.get("/remove-user/:id", verifySignedIn, function (req, res) {
  let userId = req.params.id;
  adminHelper.removeUser(userId).then(() => {
    res.redirect("/admin/all-users");
  });
});


module.exports = router;
