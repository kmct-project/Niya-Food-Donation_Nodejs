var express = require("express");
var fs = require("fs");
const trustHelper = require("../helper/trustHelper");

var router = express.Router();

const verifySignedIn = (req, res, next) => {
  if (req.session.signedInTrust) {
    next();
  } else {
    res.redirect("/trusts/signin");
  }
};

/* GET trusts listing. */
router.get("/", verifySignedIn, function (req, res, next) {
  let trusts = req.session.trust;
  trustHelper.getAlltrustreqs().then((trustreqs) => {
    res.render("trusts/home", { trust: true, trusts, layout: "trust", trustreqs });
  })
});


///////ALL trustreq/////////////////////                                         
router.get("/all-trustreqs", verifySignedIn, function (req, res) {
  let trusts = req.session.trust;
  trustHelper.getAlltrustreqs().then((trustreqs) => {
    res.render("trusts/all-trustreqs", { trust: true, layout: "trust", trustreqs, trusts });
  });
});

///////ADD trustreq/////////////////////                                         
router.get("/add-trustreq", verifySignedIn, function (req, res) {
  let trusts = req.session.trust;
  res.render("trusts/add-trustreq", { trust: true, layout: "trust", trusts });
});

///////ADD trustreq/////////////////////                                         
router.post("/add-trustreq", function (req, res) {
  trustHelper.addtrustreq(req.body, (id) => {
    res.redirect("/trusts/");

  });
});

///////EDIT trustreq/////////////////////                                         
router.get("/edit-trustreq/:id", verifySignedIn, async function (req, res) {
  let trusts = req.session.trust;
  let trustreqId = req.params.id;
  let trustreq = await trustHelper.gettrustreqDetails(trustreqId);
  console.log(trustreq);
  res.render("trusts/edit-trustreq", { trust: true, layout: "trust", trustreq, trusts });
});

///////EDIT trustreq/////////////////////                                         
router.post("/edit-trustreq/:id", verifySignedIn, function (req, res) {
  let trustreqId = req.params.id;
  trustHelper.updatetrustreq(trustreqId, req.body).then(() => {
    if (req.files) {
      let image = req.files.Image;
      if (image) {
        image.mv("./public/images/trustreq-images/" + trustreqId + ".png");
      }
    }
    res.redirect("/trusts/");
  });
});

///////DELETE trustreq/////////////////////                                         
router.get("/delete-trustreq/:id", verifySignedIn, function (req, res) {
  let trustreqId = req.params.id;
  trustHelper.deletetrustreq(trustreqId).then((response) => {
    res.redirect("/trusts/");
  });
});

///////DELETE ALL trustreq/////////////////////                                         
router.get("/delete-all-trustreqs", verifySignedIn, function (req, res) {
  trustHelper.deleteAlltrustreqs().then(() => {
    res.redirect("/trusts/all-trustreqs");
  });
});


router.route("/signup")
  .get(function (req, res) {
    if (req.session.signedInTrust) {
      res.redirect("/trusts");
    } else {
      res.render("trusts/signup", {
        trust: true,
        layout: "trust",
        signUpErr: req.session.signUpErr,
      });
    }
  })
  .post(function (req, res) {
    trustHelper.doSignup(req.body).then((response) => {
      console.log(response);
      if (response.status == false) {
        req.session.signUpErr = "Invalid Code";
        res.redirect("/trusts/signup");
      } else {
        req.session.signedInTrust = true;
        req.session.trust = response;
        res.redirect("/trusts");
      }
    });
  });


router.route("/signin")
  .get(function (req, res) {
    if (req.session.signedInTrust) {
      res.redirect("/trusts");
    } else {
      res.render("trusts/signin", {
        trust: true,
        layout: "trust",
        signInErr: req.session.signInErr,
      });
      req.session.signInErr = null;
    }
  })
  .post(function (req, res) {
    trustHelper.doSignin(req.body).then((response) => {
      if (response.status) {
        req.session.signedInTrust = true;
        req.session.trust = response.trust;
        res.redirect("/trusts");
      } else {
        req.session.signInErr = "Invalid Email/Password";
        res.redirect("/trusts/signin");
      }
    });
  });



router.get("/signout", function (req, res) {
  req.session.signedInTrust = false;
  req.session.trust = null;
  res.redirect("/trusts");
});



module.exports = router;
