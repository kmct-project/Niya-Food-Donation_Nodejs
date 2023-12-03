var express = require('express');
var userHelper = require('../helper/userHelper');
var donerHelper = require('../helper/donerHelper');
const foodspotHelper = require('../helper/foodspotHelper');
var router = express.Router();

const verifySignedIn = (req, res, next) => {
  if (req.session.signedIn) {
    next();
  } else {
    res.redirect('/signin');
  }
};

/* GET home page. */
router.get('/', async function (req, res, next) {
  let user = req.session.user;

  res.render('users/welcome', { admin: false, layout: 'welcome', user });
});

router.get('/home', async function (req, res, next) {
  let user = req.session.user;
  let products = (await foodspotHelper.getAllmenus()) ?? [];
  res.render('users/home', {
    admin: false,
    user,
    products,
    isUser: user ? true : false,
  });
});

router.get('/signup', function (req, res) {
  if (req.session.signedIn) {
    res.redirect('/home');
  } else {
    res.render('users/signup', { admin: false, layout: 'emptylayout' });
  }
});

router.post('/signup', async function (req, res) {
  const mobileRegex = /^[0-9\s-]{10}$/;
  const phone = req.body.Phone;
  const password = req.body.Password;
  const email = req.body.Email;
  const name = req.body.FName; // Assuming the name field is named "Name"
  const nameRegex = /^[A-Za-z]+$/; // Regular expression for name validation (letters only)
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i; // Regular expression for email validation

  const passwordCriteria =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  let isValidMobile = mobileRegex.test(phone);
  let isValidPassword = passwordCriteria.test(password);
  let isValidEmail = emailRegex.test(email);
  let isValidName = nameRegex.test(name);

  if (isValidMobile && isValidPassword && isValidEmail && isValidName) {
    try {
      const response = await userHelper.doSignup(req.body);
      if (response && response._id) {
        req.session.signedIn = true;
        req.session.user = response;
        res.status(200).send('Success'); // Return success message
      } else {
        console.log('User signup response does not contain a valid ID.');
        res
          .status(400)
          .send('User signup response does not contain a valid ID.');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send(error.message); // Return the error message
    }
  } else {
    let errorMessage = '';

    if (!isValidMobile) {
      errorMessage += 'Please enter a valid mobile number. ';
    }

    if (!isValidEmail) {
      errorMessage += 'Please enter a valid email address. ';
    }

    if (!isValidName) {
      errorMessage += 'Please enter a valid name with letters only. ';
    }

    if (!isValidPassword) {
      errorMessage +=
        'Please enter a strong password with at least 8 characters, including uppercase, lowercase, numbers, and special characters.';
    }

    res.status(400).send(errorMessage.trim());
  }
});

router.get('/signin', function (req, res) {
  if (req.session.signedIn) {
    res.redirect('/home');
  } else {
    res.render('users/signin', {
      admin: false,
      layout: 'emptylayout',
      signInErr: req.session.signInErr,
    });
    req.session.signInErr = null;
  }
});

router.post('/signin', function (req, res) {
  userHelper.doSignin(req.body).then((response) => {
    if (response.status) {
      req.session.signedIn = true;
      req.session.user = response.user;
      res.redirect('/home');
    } else {
      req.session.signInErr = 'Invalid Email/Password';
      res.redirect('/signin');
    }
  });
});

router.get('/signout', function (req, res) {
  req.session.signedIn = false;
  req.session.user = null;
  res.redirect('/home');
});

router.get('/cart', verifySignedIn, async function (req, res) {
  let user = req.session.user;
  let userId = req.session.user._id;
  let cartCount = await userHelper.getCartCount(userId);
  let cartProducts = await userHelper.getCartProducts(userId);
  let total = null;
  if (cartCount != 0) {
    total = await userHelper.getTotalAmount(userId);
  }
  res.render('users/cart', {
    admin: false,
    user,
    cartCount,
    cartProducts,
    total,
  });
});

router.get('/add-to-cart/:id', verifySignedIn, function (req, res) {
  console.log('api call');
  let productId = req.params.id;
  let userId = req.session.user._id;
  if (!userId) {
    res.render('users/signin', {
      admin: false,
      layout: 'emptylayout',
      signInErr: req.session.signInErr,
    });
    req.session.signInErr = null;
  } else {
    userHelper.addToCart(productId, userId).then(() => {
      res.json({ status: true });
    });
  }
});

router.post('/change-product-quantity', function (req, res) {
  console.log(req.body);
  userHelper.changeProductQuantity(req.body).then((response) => {
    res.json(response);
  });
});

router.post('/remove-cart-product', (req, res, next) => {
  userHelper.removeCartProduct(req.body).then((response) => {
    res.json(response);
  });
});

router.get('/place-order/:id', verifySignedIn, async (req, res) => {
  let user = req.session.user;
  let productId = req.params.id;
  let allProduct = (await foodspotHelper.getAllmenus()) ?? [];

  let selectedProductDetails = allProduct.find((item) => item._id == productId);
  if (!user || !selectedProductDetails) {
    res.redirect('/signin');
  } else {
    res.render('users/place-order', {
      admin: false,
      user,
      selectedProductDetails,
    });
  }
});

router.post('/place-order', async (req, res) => {
  let user = req.session.user;
  console.log(req.body)
  userHelper
    .placeOrder(req.body, user)
    .then((orderId) => {
      let ProductID = req?.body?.product_id || ''
      // update the product status
      foodspotHelper.updateProductStatusInactive(ProductID)

      if (req.body['payment-method'] === 'COD') {
        res.json({ codSuccess: true });
      } else {
        console.log(req?.body)
        userHelper.generateRazorpay(orderId, req?.body?.total_price || 0).then((order) => {
          res.json({ order, razorpay: true });
        });
      }

    });
});

router.post('/verify-payment', async (req, res) => {
  console.log(req.body);
  userHelper
    .verifyPayment(req.body)
    .then(() => {
      userHelper.changePaymentStatus(req.body['order[receipt]']).then(() => {
        res.json({ status: true });
      });
    })
    .catch((err) => {
      res.json({ status: false, errMsg: 'Payment Failed' });
    });
});

router.get('/order-placed', verifySignedIn, async (req, res) => {
  let user = req.session.user;
  let userId = req.session.user._id;
  let cartCount = await userHelper.getCartCount(userId);
  res.render('users/order-placed', { admin: false, user, cartCount });
});

router.get('/orders', verifySignedIn, async function (req, res) {
  let user = req.session.user;
  let userId = req.session.user._id;
  let cartCount = await userHelper.getCartCount(userId);
  let orders = await userHelper.getUserOrder(userId);
  res.render('users/orders', { admin: false, user, cartCount, orders });
});

router.get(
  '/view-ordered-products/:id',
  verifySignedIn,
  async function (req, res) {
    let user = req.session.user;
    let orderId = req.params.id;
    const order = await userHelper.getOrderById(orderId);
    res.render('users/order-products', {
      admin: false,
      user,
      order: [order],
      totalAmount: order?.orderObject?.totalAmount || 0
    });
  }
);

router.get('/cancel-order/:id', verifySignedIn, function (req, res) {
  let orderId = req.params.id;
  userHelper.cancelOrder(orderId).then(() => {
    res.redirect('/orders');
  });
  // update the product status
});

module.exports = router;
