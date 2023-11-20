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
  res.render("users/welcome", { admin: false, layout: "welcome", user });
});

router.get("/home", async function (req, res, next) {
  let user = req.session.user;
  res.render("users/home", { admin: false, user });
});

router.get("/signup", function (req, res) {
  if (req.session.signedIn) {
    res.redirect("/home");
  } else {
    res.render("users/signup", { admin: false, layout: 'emptylayout', });
  }
});


router.post("/signup", async function (req, res) {
  const mobileRegex = /^[0-9\s-]{10}$/;
  const phone = req.body.Phone;
  const password = req.body.Password;
  const email = req.body.Email;
  const name = req.body.FName; // Assuming the name field is named "Name"
  const nameRegex = /^[A-Za-z]+$/; // Regular expression for name validation (letters only)
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i; // Regular expression for email validation

  const passwordCriteria = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

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
        res.status(200).send("Success"); // Return success message
      } else {
        console.log("User signup response does not contain a valid ID.");
        res.status(400).send("User signup response does not contain a valid ID.");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send(error.message); // Return the error message
    }
  } else {
    let errorMessage = "";

    if (!isValidMobile) {
      errorMessage += "Please enter a valid mobile number. ";
    }

    if (!isValidEmail) {
      errorMessage += "Please enter a valid email address. ";
    }

    if (!isValidName) {
      errorMessage += "Please enter a valid name with letters only. ";
    }

    if (!isValidPassword) {
      errorMessage += "Please enter a strong password with at least 8 characters, including uppercase, lowercase, numbers, and special characters.";
    }

    res.status(400).send(errorMessage.trim());
  }
});




router.get("/signin", function (req, res) {
  if (req.session.signedIn) {
    res.redirect("/home");
  } else {
    res.render("users/signin", {
      admin: false,
      layout: 'emptylayout',
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
      res.redirect("/home");
    } else {
      req.session.signInErr = "Invalid Email/Password";
      res.redirect("/signin");
    }
  });
});

router.get("/signout", function (req, res) {
  req.session.signedIn = false;
  req.session.user = null;
  res.redirect("/home");
});

module.exports = router;
