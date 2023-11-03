var express = require("express");
var userHelper = require("../helper/userHelper");
var router = express.Router();

const verifySignedIn = (req, res, next) => {
  if (req.session.signedIn) {
    next();
  } else {
    res.redirect("/signin");
  }
};

/* GET home page. */
router.get("/", async function (req, res, next) {
  let user = req.session.user;
    res.render("users/welcome", { admin: false, user });
});

router.get("/home", async function (req, res, next) {
  let user = req.session.user;
    res.render("users/home", { admin: false, user });
});

router.get("/signup", function (req, res) {
  if (req.session.signedIn) {
    res.redirect("/");
  } else {
    res.render("users/signup", { admin: false });
  }
});

router.route("/signup")
  .get(function (req, res) {
    if (req.session.signedIn) {
      res.redirect("/");
    } else {
      res.render("/signup", {
        admin: false,
        layout: 'emptylayout',
        signUpErr: req.session.signUpErr,
      });
    }
  })
  .post(function (req, res) {
    const phoneRegex = /^\d{10}$/; // Match 10-digit phone numbers
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/; // Basic email validation

    const { Phone, Email, Password } = req.body;

    // Validate phone number
    if (!Phone.match(phoneRegex)) {
      const error = "Invalid phone number (10 digits required)";
      return sendValidationAlert(res, error);
    }

    // Validate email
    if (!Email.match(emailRegex)) {
      const error = "Invalid email address";
      return sendValidationAlert(res, error);
    }

    // Validate password length
    if (Password.length < 6) {
      const error = "Password must be at least 6 characters long";
      return sendValidationAlert(res, error);
    }

    // If all validations pass, proceed with signup
    userHelper.doSignup(req.body).then((response) => {
      console.log(response);
      if (response.status == false) {
        req.session.signUpErr = "Invalid Code";
        return sendValidationAlert(res, "Invalid Code");
      } else {
        req.session.signedIn = true;
        req.session.user = response;
        res.redirect("/");
      }
    });
  });

  function sendValidationAlert(res, message) {
    res.setHeader('Content-Type', 'text/html');
    res.status(400).send(`
      <script>
        alert("${message}");
        window.history.back();
      </script>
    `);
  }
  

router.get("/signin", function (req, res) {
  if (req.session.signedIn) {
    res.redirect("/");
  } else {
    res.render("users/signin", {
      admin: false,
      signInErr: req.session.signInErr,
    });
    req.session.signInErr = null;
  }
});

router.post("/signin", function (req, res) {
  userHelper.doSignin(req.body).then((response) => {
    if (response.status) {
      req.session.signedIn = true;
      req.session.user = response.user;
      res.redirect("/");
    } else {
      req.session.signInErr = "Invalid Email/Password";
      res.redirect("/signin");
    }
  });
});

router.get("/signout", function (req, res) {
  req.session.signedIn = false;
  req.session.user = null;
  res.redirect("/");
});

module.exports = router;
