var express = require("express");
var fs = require("fs");
const userHelper = require("../helper/userHelper");
const donerHelper = require("../helper/donerHelper");

var router = express.Router();

const verifySignedIn = (req, res, next) => {
  if (req.session.signedInDoner) {
    next();
  } else {
    res.redirect("/doner/signin");
  }
};

/* GET doners listing. */
router.get("/", verifySignedIn, function (req, res, next) {
  let donation = req.session.doner;
  donerHelper.getAllProducts().then((products) => {
    res.render("doner/home", { doner: true, products, donation });
  });
});

router.get("/all-products", verifySignedIn, function (req, res) {
  let donation = req.session.doner;
  donerHelper.getAllProducts().then((products) => {
    res.render("doner/all-products", { doner: true, products, donation });
  });
});

router.get("/signup", function (req, res) {
  if (req.session.signedInDoner) {
    res.redirect("/doner");
  } else {
    res.render("doner/signup", {
      doner: true,
      signUpErr: req.session.signUpErr,
    });
  }
});

router.post("/signup", function (req, res) {
  donerHelper.doSignup(req.body).then((response) => {
    console.log(response);
    if (response.status == false) {
      req.session.signUpErr = "Invalid Code";
      res.redirect("/doner/signup");
    } else {
      req.session.signedInDoner = true;
      req.session.doner = response;
      res.redirect("/doner");
    }
  });
});

router.get("/signin", function (req, res) {
  if (req.session.signedInDoner) {
    res.redirect("/doner");
  } else {
    res.render("doner/signin", {
      doner: true,
      signInErr: req.session.signInErr,
    });
    req.session.signInErr = null;
  }
});

router.post("/signin", function (req, res) {
  donerHelper.doSignin(req.body).then((response) => {
    if (response.status) {
      req.session.signedInDoner = true;
      req.session.doner = response.doner;
      res.redirect("/doner");
    } else {
      req.session.signInErr = "Invalid Email/Password";
      res.redirect("/doner/signin");
    }
  });
});

router.get("/signout", function (req, res) {
  req.session.signedInDoner = false;
  req.session.doner = null;
  res.redirect("/doner");
});

router.get("/add-product", verifySignedIn, function (req, res) {
  let donation = req.session.doner;
  res.render("doner/add-product", { doner: true, donation });
});

router.post("/add-product", function (req, res) {
  donerHelper.addProduct(req.body, (id) => {
    let image = req.files.Image;
    image.mv("./public/images/product-images/" + id + ".png", (err, done) => {
      if (!err) {
        res.redirect("/doner/add-product");
      } else {
        console.log(err);
      }
    });
  });
});

router.get("/edit-product/:id", verifySignedIn, async function (req, res) {
  let donation = req.session.doner;
  let productId = req.params.id;
  let product = await donerHelper.getProductDetails(productId);
  console.log(product);
  res.render("doner/edit-product", { doner: true, product, donation });
});

router.post("/edit-product/:id", verifySignedIn, function (req, res) {
  let productId = req.params.id;
  donerHelper.updateProduct(productId, req.body).then(() => {
    if (req.files) {
      let image = req.files.Image;
      if (image) {
        image.mv("./public/images/product-images/" + productId + ".png");
      }
    }
    res.redirect("/doner/all-products");
  });
});

router.get("/delete-product/:id", verifySignedIn, function (req, res) {
  let productId = req.params.id;
  donerHelper.deleteProduct(productId).then((response) => {
    fs.unlinkSync("./public/images/product-images/" + productId + ".png");
    res.redirect("/doner/all-products");
  });
});

router.get("/delete-all-products", verifySignedIn, function (req, res) {
  donerHelper.deleteAllProducts().then(() => {
    res.redirect("/doner/all-products");
  });
});

router.get("/all-users", verifySignedIn, function (req, res) {
  let donation = req.session.doner;
  donerHelper.getAllUsers().then((users) => {
    res.render("doner/all-users", { doner: true, donation, users });
  });
});

router.get("/remove-user/:id", verifySignedIn, function (req, res) {
  let userId = req.params.id;
  donerHelper.removeUser(userId).then(() => {
    res.redirect("/doner/all-users");
  });
});

router.get("/remove-all-users", verifySignedIn, function (req, res) {
  donerHelper.removeAllUsers().then(() => {
    res.redirect("/doner/all-users");
  });
});

router.get("/all-orders", verifySignedIn, async function (req, res) {
  let donation = req.session.doner;
  let orders = await donerHelper.getAllOrders();
  res.render("doner/all-orders", {
    doner: true,
    donation,
    orders,
  });
});

router.get(
  "/view-ordered-products/:id",
  verifySignedIn,
  async function (req, res) {
    let donation = req.session.doner;
    let orderId = req.params.id;
    let products = await userHelper.getOrderProducts(orderId);
    res.render("doner/order-products", {
      doner: true,
      donation,
      products,
    });
  }
);

router.get("/change-status/", verifySignedIn, function (req, res) {
  let status = req.query.status;
  let orderId = req.query.orderId;
  donerHelper.changeStatus(status, orderId).then(() => {
    res.redirect("/doner/all-orders");
  });
});

router.get("/cancel-order/:id", verifySignedIn, function (req, res) {
  let orderId = req.params.id;
  donerHelper.cancelOrder(orderId).then(() => {
    res.redirect("/doner/all-orders");
  });
});

router.get("/cancel-all-orders", verifySignedIn, function (req, res) {
  donerHelper.cancelAllOrders().then(() => {
    res.redirect("/doner/all-orders");
  });
});

router.post("/search", verifySignedIn, function (req, res) {
  let donation = req.session.doner;
  donerHelper.searchProduct(req.body).then((response) => {
    res.render("doner/search-result", { doner: true, donation, response });
  });
});

module.exports = router;
