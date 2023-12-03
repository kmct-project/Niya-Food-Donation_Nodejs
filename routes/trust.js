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
  donerHelper.getAllProducts().then((products) => {
    res.render("trusts/home", { admin: false, user, layout: "trust", products });
  })
});

router.get("/home", verifySignedIn, async function (req, res, next) {
  let user = req.session.user;
  donerHelper.getAllProducts().then((products) => {
    res.render("trusts/home", { admin: false, user, layout: "trust", products });
  })
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
    user,
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


router.post("/remove-cart-product", (req, res, next) => {
  userHelper.removeCartProduct(req.body).then((response) => {
    res.json(response);
  });
});




router.get("/orders", verifySignedIn, async function (req, res) {
  let user = req.session.user;
  let userId = req.session.user._id;
  let orders = await trustHelper.getTrustCartById(userId);
  res.render("trusts/orders", { admin: false, user, orders });
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
      user,
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
      res.redirect("/trusts/home");
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
        res.redirect("/trusts/home");
      }
    });
  });


router.route("/signin")
  .get(function (req, res) {
    if (req.session.signedInTrust) {
      res.redirect("/trusts/home");
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
        res.redirect("/trusts/home");
      } else {
        req.session.signInErr = "Invalid Email/Password";
        res.redirect("/trusts/signin");
      }
    });
  });



router.get("/signout", function (req, res) {
  req.session.signedInTrust = false;
  req.session.user = null;
  res.redirect("/trusts");
});



module.exports = router;
