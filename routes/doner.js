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
  donerHelper.getProductById(doner?._id || '').then((products) => {
    res.render("doners/home", { admin: false, doner, layout: "doner", products });
  })
});

router.get("/home", async function (req, res, next) {
  let doner = req.session.doner;
  if (doner) {
    donerHelper.getProductById(doner._id).then((products) => {
      res.render("doners/home", { admin: false, doner, layout: "doner", products });
    })
  } else {
    res.redirect("/doners/signin");
  }
});


///////ALL donate/////////////////////                                         
// router.get("/all-products", verifySignedIn, function (req, res) {
//   let doner = req.session.doner;
//   donerHelper.getAllproducts().then((products) => {
//     res.render("doners/all-products", { admin: false, layout: "", products, doner });
//   });
// });

///////ADD donate/////////////////////                                         
router.get("/add-product", verifySignedIn, function (req, res) {
  let doner = req.session.doner;
  res.render("doners/add-product", { admin: false, layout: "", doner });
});

///////ADD donate/////////////////////                                         
router.post("/add-product", function (req, res) {
  let doner = req.session.doner;
  req.body.donatedBy = doner?._id || ''
  donerHelper.addProduct(req.body, (id) => {
    let image = req.files.Image;
    image.mv("./public/images/donate-images/" + id + ".png", (err, done) => {
      if (!err) {
        res.redirect("/doners/home");
      } else {
        console.log(err);
      }
    });
  });
});

///////EDIT donate/////////////////////                                         
router.get("/edit-donate/:id", verifySignedIn, async function (req, res) {
  let doner = req.session.doner;
  let productId = req.params.id;
  let product = await donerHelper.getProductDetails(productId);
  console.log(product);
  res.render("doners/edit-donate", { admin: false, layout: "doner", product, doner });
});

///////EDIT donate/////////////////////                                         
router.post("/edit-donate/:id", verifySignedIn, function (req, res) {
  let productId = req.params.id;
  donerHelper.updateProduct(productId, req.body).then(() => {
    if (req.files) {
      let image = req.files.Image;
      if (image) {
        image.mv("./public/images/donate-images/" + productId + ".png");
      }
    }
    res.redirect("/doners/home");
  });
});

///////DELETE donate/////////////////////                                         
router.get("/delete-donate/:id", verifySignedIn, function (req, res) {
  let productId = req.params.id;
  donerHelper.deleteProduct(productId).then((response) => {
    fs.unlinkSync("./public/images/donate-images/" + productId + ".png");
    res.redirect("/doners/home");
  });
});

///////DELETE ALL donate/////////////////////                                         
router.get("/delete-all-products", verifySignedIn, function (req, res) {
  donerHelper.deleteAllProducts().then(() => {
    res.redirect("/doners/home");
  });
});






router.get("/signup", function (req, res) {
  if (req.session.signedIn) {
    res.redirect("/doners/home");
  } else {
    res.render("doners/signup", { admin: false, layout: "doner" });
  }
});

router.post("/signup", function (req, res) {
  donerHelper.doSignup(req.body).then((response) => {
    req.session.signedIn = true;
    req.session.doner = response;
    res.redirect("/doners/home");
  });
});

router.get("/signin", function (req, res) {
  if (req.session.signedIn) {
    res.redirect("/doners/home");
  } else {
    res.render("doners/signin", {
      admin: false,
      layout: "doner",
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
      res.redirect("/doners/home");
    } else {
      req.session.signInErr = "Invalid Email/Password";
      res.redirect("/doners/signin");
    }
  });
});



router.get("/orders", verifySignedIn, function (req, res) {
  let doner = req.session.doner;
  donerHelper.getAllOrders(doner._id).then((orders) => {
    res.render("doners/orders", { orders });
  });
});





router.get("/signout", function (req, res) {
  req.session.signedIn = false;
  req.session.doner = null;
  res.redirect("/doners/home");
});

module.exports = router;
