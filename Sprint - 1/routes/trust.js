var express = require("express");
var fs = require("fs");
const trustHelper = require("../helper/trustHelper");
var donerHelper = require("../helper/donerHelper");


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
  let trusts = req.session.trust;
  donerHelper.getAllProducts().then((products) => {
    res.render("trusts/home", { trust: true, trusts, layout: "trust", products });
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



router.get("/cart", verifySignedIn, async function (req, res) {
  let trusts = req.session.trust;
  let userId = req.session.user._id;
  let cartCount = await userHelper.getCartCount(userId);
  let cartProducts = await userHelper.getCartProducts(userId);
  let total = null;
  if (cartCount != 0) {
    total = await userHelper.getTotalAmount(userId);
  }
  res.render("users/cart", {
    admin: false,
    trusts,
    cartCount,
    cartProducts,
    total,
  });
});

router.get("/add-to-cart/:id", verifySignedIn, function (req, res) {
  console.log("api call");
  let productId = req.params.id;
  let userId = req.session.user._id;
  userHelper.addToCart(productId, userId).then(() => {
    res.json({ status: true });
  });
});

router.post("/change-product-quantity", function (req, res) {
  console.log(req.body);
  userHelper.changeProductQuantity(req.body).then((response) => {
    res.json(response);
  });
});

router.post("/remove-cart-product", (req, res, next) => {
  userHelper.removeCartProduct(req.body).then((response) => {
    res.json(response);
  });
});

router.get("/place-order", verifySignedIn, async (req, res) => {
  let trusts = req.session.trust;
  let userId = req.session.user._id;
  let cartCount = await userHelper.getCartCount(userId);
  let total = await userHelper.getTotalAmount(userId);
  res.render("users/place-order", { admin: false, trusts, cartCount, total });
});

router.post("/place-order", async (req, res) => {
  let trusts = req.session.trust;
  let products = await userHelper.getCartProductList(req.body.userId);
  let totalPrice = await userHelper.getTotalAmount(req.body.userId);
  userHelper
    .placeOrder(req.body, products, totalPrice, user)
    .then((orderId) => {
      if (req.body["payment-method"] === "COD") {
        res.json({ codSuccess: true });
      } else {
        userHelper.generateRazorpay(orderId, totalPrice).then((response) => {
          res.json(response);
        });
      }
    });
});

router.post("/verify-payment", async (req, res) => {
  console.log(req.body);
  userHelper
    .verifyPayment(req.body)
    .then(() => {
      userHelper.changePaymentStatus(req.body["order[receipt]"]).then(() => {
        res.json({ status: true });
      });
    })
    .catch((err) => {
      res.json({ status: false, errMsg: "Payment Failed" });
    });
});

router.get("/order-placed", verifySignedIn, async (req, res) => {
  let trusts = req.session.trust;
  let userId = req.session.user._id;
  let cartCount = await userHelper.getCartCount(userId);
  res.render("users/order-placed", { admin: false, trusts, cartCount });
});

router.get("/orders", verifySignedIn, async function (req, res) {
  let trusts = req.session.trust;
  let userId = req.session.user._id;
  let cartCount = await userHelper.getCartCount(userId);
  let orders = await userHelper.getUserOrder(userId);
  res.render("users/orders", { admin: false, trusts, cartCount, orders });
});

router.get(
  "/view-ordered-products/:id",
  verifySignedIn,
  async function (req, res) {
    let trusts = req.session.trust;
    let userId = req.session.user._id;
    let cartCount = await userHelper.getCartCount(userId);
    let orderId = req.params.id;
    const order = await userHelper.getOrderById(orderId);
    let products = await userHelper.getOrderProducts(orderId);
    res.render("users/order-products", {
      admin: false,
      trusts,
      cartCount,
      products,
      order
    });
  }
);

router.get("/cancel-order/:id", verifySignedIn, function (req, res) {
  let orderId = req.params.id;
  userHelper.cancelOrder(orderId).then(() => {
    res.redirect("/orders");
  });
});




module.exports = router;
