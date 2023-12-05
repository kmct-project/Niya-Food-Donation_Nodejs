var express = require("express");
var userHelper = require("../helper/userHelper");
var donerHelper = require("../helper/donerHelper");
var trustHelper = require("../helper/trustHelper");
var router = express.Router();

const verifySignedIn = (req, res, next) => {
  if (req.session.signedInTrust) {
    next();
  } else {
    res.redirect("/trusts/signin");
  }
};

/* GET trusts listing. */
router.get("/", verifySignedIn, async function (req, res, next) {
  let user = req.session.user;
  products = await donerHelper.getAllProducts();
  trustreqs = await donerHelper.getAlltrustreqs();

  res.render("trusts/home", { admin: false, layout: "trust", user, products, trustreqs });

});

// router.get("/home", verifySignedIn, async function (req, res, next) {
//   let user = req.session.user;
//   trustHelper.getAlltrustreqs().then((trustreqs) => {
//     res.render("trusts/home", { admin: true, layout: "trust",trustreqs, user });
//   });
// });

///////ALL req/////////////////////                                         
// router.get("/all-reqs", verifySignedIn, function (req, res) {
//   let user = req.session.user;
//   trustHelper.getAllreqs().then((reqs) => {
//     res.render("trusts/all-reqs", { admin: true, layout: "trust",reqs, user });
//   });
// });

///////ADD req/////////////////////                                         
router.get("/add-req", verifySignedIn, function (req, res) {
  let user = req.session.user;
  res.render("trusts/charityreq", { admin: true, layout: "trust", user });
});

///////ADD req/////////////////////                                         
router.post("/add-req", function (req, res) {
  let user = req.session.user;
  trustHelper.addtrustreq({ ...req.body, requestedBy: user._id }, (id) => {
    res.redirect("/trusts/charityreq");

  });
});

router.get("/profile", verifySignedIn, function (req, res) {
  let user = req.session.user;
  res.render("trusts/profile", { admin: false, layout: "trust", user });
});

///////EDIT req/////////////////////                                         
router.get("/edit-req/:id", verifySignedIn, async function (req, res) {
  let user = req.session.user;
  let reqId = req.params.id;
  let reqs = await donerHelper.getreqDetails(reqId);
  console.log(req);
  res.render("trusts/edit-req", { admin: true, layout: "trust", reqs, user });
});

///////EDIT req/////////////////////                                         
router.post("/edit-req/:id", verifySignedIn, function (req, res) {
  let reqId = req.params.id;
  donerHelper.updatereq(reqId, req.body).then(() => {
    if (req.files) {
      let image = req.files.Image;
      if (image) {
        image.mv("./public/images/req-images/" + reqId + ".png");
      }
    }
    res.redirect("/trusts/all-reqs");
  });
});

///////DELETE req/////////////////////                                         
router.get('/delete-req', verifySignedIn, function (req, res) {
  let trustreqId = req.query.id;
  trustHelper.deletetrustreq(trustreqId).then((response) => {
    res.redirect("/trusts/charityreq");
  });
});

///////DELETE ALL req/////////////////////                                         
router.get("/delete-all-reqs", verifySignedIn, function (req, res) {
  donerHelper.deleteAllreqs().then(() => {
    res.redirect("/trusts/all-reqs");
  });
});

router.get("/welcome", verifySignedIn, function (req, res) {
  let user = req.session.user;
  res.render("trusts/welcome", { admin: false, layout: "trust", user });
});

router.get("/charityreq", verifySignedIn, async function (req, res, next) {
  let user = req.session.user;
  trustreqs = await donerHelper.getAlltrustreqsWithId(user._id);
  res.render("trusts/charityreq", { admin: false, layout: "trust", user, trustreqs });
});

router.get("/request", verifySignedIn, async function (req, res, next) {
  let user = req.session.user;
  products = await donerHelper.getAllProducts();
  trustreqs = await donerHelper.getAlltrustreqs();
  res.render("trusts/request", { admin: false, layout: "trust", user, products, trustreqs });
});

router.get("/home", verifySignedIn, async function (req, res, next) {
  let user = req.session.user;
  products = await donerHelper.getAllProducts();
  trustreqs = await donerHelper.getAlltrustreqs();
  res.render("trusts/home", { admin: false, layout: "trust", user, products, trustreqs });
});

router.get("/cart", verifySignedIn, async function (req, res) {
  let user = req.session.user;
  let userId = req.session.user._id;
  let cartCount = await userHelper.getCartCount(userId);
  let cartProducts = await userHelper.getCartProducts(userId);
  let total = null;
  if (cartCount != 0) {
    total = await userHelper.getTotalAmount(userId);
  }
  res.render("users/cart", {
    admin: false,
    layout: "trust", user,
    cartCount,
    cartProducts,
    total,
  });
});

// accepting  the food donated by Donator
router.get("/accept-donation/:id", verifySignedIn, function (req, res) {
  let productId = req.params.id;
  let userId = req.session.user._id;
  trustHelper.addToTrustCart(productId, userId).then(() => {
    res.redirect("/trusts/home");
  });
});

router.post("/accept-donation", verifySignedIn, function (req, res) {
  let productData = { productId: Array.isArray(req.body.productId) ? req.body.productId[0] : req.body.productId, address: req.body.address };
  let userId = req.session.user._id;
  trustHelper.addToTrustCart(productData, userId).then(() => {
    res.redirect("/trusts/home");
  });
});

router.post("/remove-cart-product", (req, res, next) => {
  userHelper.removeCartProduct(req.body).then((response) => {
    res.json(response);
  });
});




router.get("/orders", verifySignedIn, async function (req, res) {
  let user = req.session.user;
  let userId = req.session.user._id;
  let orders = await trustHelper.getTrustCartById(userId);
  res.render("trusts/orders", { admin: false, layout: "trust", user, orders });
});




router.get(
  "/view-ordered-products/:id",
  verifySignedIn,
  async function (req, res) {
    let user = req.session.user;
    let userId = req.session.user._id;
    let cartCount = await userHelper.getCartCount(userId);
    let orderId = req.params.id;
    const order = await userHelper.getOrderById(orderId);
    let products = await userHelper.getOrderProducts(orderId);
    res.render("users/order-products", {
      admin: false,
      layout: "trust", user,
      cartCount,
      products,
      order
    });
  }
);

router.get("/cancel-order/:id", verifySignedIn, function (req, res) {
  let orderId = req.params.id;
  trustHelper.removeFromTrustCart(orderId).then(() => {
    res.redirect("/trusts/orders");
  });
});




router.route("/signup")
  .get(function (req, res) {
    if (req.session.signedInTrust) {
      res.redirect("/trusts/welcome");
    } else {
      res.render("trusts/signup", {
        admin: false,
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
        req.session.user = response;
        res.redirect("/trusts/welcome");
      }
    });
  });


router.route("/signin")
  .get(function (req, res) {
    if (req.session.signedInTrust) {
      res.redirect("/trusts/welcome");
    } else {
      res.render("trusts/signin", {
        admin: false,
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
        req.session.user = response.user;
        res.redirect("/trusts/welcome");
      } else {
        req.session.signInErr = "Invalid Email/Password";
        res.redirect("/trusts/signin");
      }
    });
  });



router.get("/signout", function (req, res) {
  req.session.signedInTrust = false;
  req.session.user = null;
  res.redirect("/trusts/");
});



module.exports = router;
