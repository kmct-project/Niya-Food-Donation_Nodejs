var express = require("express");
var fs = require("fs");
const userHelper = require("../helper/userHelper");
const volunteerHelper = require("../helper/volunteerHelper");

var router = express.Router();

const verifySignedIn = (req, res, next) => {
  if (req.session.signedInVolunteer) {
    next();
  } else {
    res.redirect("/volunteer/signin");
  }
};

/* GET volunteers listing. */
router.get("/", verifySignedIn, function (req, res, next) {
  let volunteering = req.session.volunteer;
  volunteerHelper.getAllProducts().then((products) => {
    res.render("volunteer/home", { volunteer: true, products, volunteering });
  });
});

router.get("/all-products", verifySignedIn, function (req, res) {
  let volunteering = req.session.volunteer;
  volunteerHelper.getAllProducts().then((products) => {
    res.render("volunteer/all-products", {
      volunteer: true,
      products,
      volunteering,
    });
  });
});

router.get("/signup", function (req, res) {
  if (req.session.signedInVolunteer) {
    res.redirect("/volunteer");
  } else {
    res.render("volunteer/signup", {
      volunteer: true,
      signUpErr: req.session.signUpErr,
    });
  }
});

router.post("/signup", function (req, res) {
  volunteerHelper.doSignup(req.body).then((response) => {
    console.log(response);
    if (response.status == false) {
      req.session.signUpErr = "Invalid Code";
      res.redirect("/volunteer/signup");
    } else {
      req.session.signedInVolunteer = true;
      req.session.volunteer = response;
      res.redirect("/volunteer");
    }
  });
});

router.get("/signin", function (req, res) {
  if (req.session.signedInVolunteer) {
    res.redirect("/volunteer");
  } else {
    res.render("volunteer/signin", {
      volunteer: true,
      signInErr: req.session.signInErr,
    });
    req.session.signInErr = null;
  }
});

router.post("/signin", function (req, res) {
  volunteerHelper.doSignin(req.body).then((response) => {
    if (response.status) {
      req.session.signedInVolunteer = true;
      req.session.volunteer = response.volunteer;
      res.redirect("/volunteer");
    } else {
      req.session.signInErr = "Invalid Email/Password";
      res.redirect("/volunteer/signin");
    }
  });
});

router.get("/signout", function (req, res) {
  req.session.signedInVolunteer = false;
  req.session.volunteer = null;
  res.redirect("/volunteer");
});

router.get("/add-product", verifySignedIn, function (req, res) {
  let volunteering = req.session.volunteer;
  res.render("volunteer/add-product", { volunteer: true, volunteering });
});

router.post("/add-product", function (req, res) {
  volunteerHelper.addProduct(req.body, (id) => {
    let image = req.files.Image;
    image.mv("./public/images/product-images/" + id + ".png", (err, done) => {
      if (!err) {
        res.redirect("/volunteer/add-product");
      } else {
        console.log(err);
      }
    });
  });
});

router.get("/edit-product/:id", verifySignedIn, async function (req, res) {
  let volunteering = req.session.volunteer;
  let productId = req.params.id;
  let product = await volunteerHelper.getProductDetails(productId);
  console.log(product);
  res.render("volunteer/edit-product", {
    volunteer: true,
    product,
    volunteering,
  });
});

router.post("/edit-product/:id", verifySignedIn, function (req, res) {
  let productId = req.params.id;
  volunteerHelper.updateProduct(productId, req.body).then(() => {
    if (req.files) {
      let image = req.files.Image;
      if (image) {
        image.mv("./public/images/product-images/" + productId + ".png");
      }
    }
    res.redirect("/volunteer/all-products");
  });
});

router.get("/delete-product/:id", verifySignedIn, function (req, res) {
  let productId = req.params.id;
  volunteerHelper.deleteProduct(productId).then((response) => {
    fs.unlinkSync("./public/images/product-images/" + productId + ".png");
    res.redirect("/volunteer/all-products");
  });
});

router.get("/delete-all-products", verifySignedIn, function (req, res) {
  volunteerHelper.deleteAllProducts().then(() => {
    res.redirect("/volunteer/all-products");
  });
});

router.get("/all-users", verifySignedIn, function (req, res) {
  let volunteering = req.session.volunteer;
  volunteerHelper.getAllUsers().then((users) => {
    res.render("volunteer/all-users", { volunteer: true, volunteering, users });
  });
});

router.get("/remove-volunteer/:id", verifySignedIn, function (req, res) {
  let userId = req.params.id;
  volunteerHelper.removeUser(userId).then(() => {
    res.redirect("/volunteer/all-volunteers");
  });
});

router.get("/remove-all-users", verifySignedIn, function (req, res) {
  volunteerHelper.removeAllUsers().then(() => {
    res.redirect("/volunteer/all-users");
  });
});

router.get("/all-orders", verifySignedIn, async function (req, res) {
  let volunteering = req.session.volunteer;
  let orders = await volunteerHelper.getAllOrders();
  res.render("volunteer/all-orders", {
    volunteer: true,
    volunteering,
    orders,
  });
});

router.get(
  "/view-ordered-products/:id",
  verifySignedIn,
  async function (req, res) {
    let volunteering = req.session.volunteer;
    let orderId = req.params.id;
    let products = await userHelper.getOrderProducts(orderId);
    res.render("volunteer/order-products", {
      volunteer: true,
      volunteering,
      products,
    });
  }
);

router.get("/change-status/", verifySignedIn, function (req, res) {
  let status = req.query.status;
  let orderId = req.query.orderId;
  volunteerHelper.changeStatus(status, orderId).then(() => {
    res.redirect("/volunteer/all-orders");
  });
});

router.get("/cancel-order/:id", verifySignedIn, function (req, res) {
  let orderId = req.params.id;
  volunteerHelper.cancelOrder(orderId).then(() => {
    res.redirect("/volunteer/all-orders");
  });
});

router.get("/cancel-all-orders", verifySignedIn, function (req, res) {
  volunteerHelper.cancelAllOrders().then(() => {
    res.redirect("/volunteer/all-orders");
  });
});

router.post("/search", verifySignedIn, function (req, res) {
  let volunteering = req.session.volunteer;
  volunteerHelper.searchProduct(req.body).then((response) => {
    res.render("volunteer/search-result", {
      volunteer: true,
      volunteering,
      response,
    });
  });
});

module.exports = router;
