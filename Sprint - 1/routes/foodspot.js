var express = require("express");
var fs = require("fs");
const foodspotHelper = require("../helper/foodspotHelper");
var router = express.Router();

const verifySignedIn = (req, res, next) => {
  if (req.session.signedInFoodspot) {
    next();
  } else {
    res.redirect("/foodspots/signin");
  }
};

/* GET foodspots listing. */
router.get("/", verifySignedIn, function (req, res, next) {
  let foodspots = req.session.foodspot;
    res.render("foodspots/home", { foodspot: true,layout:'food', foodspots });
});


router.route("/signup")
  .get(function (req, res) {
    if (req.session.signedInFoodspot) {
      res.redirect("/foodspots");
    } else {
      res.render("foodspots/signup", {
        foodspot: true,layout:'emptylayout',
        signUpErr: req.session.signUpErr,
      });
    }
  })
  .post(function (req, res) {
    foodspotHelper.doSignup(req.body).then((response) => {
      console.log(response);
      if (response.status == false) {
        req.session.signUpErr = "Invalid Code";
        res.redirect("/foodspots/signup");
      } else {
        req.session.signedInFoodspot = true;
        req.session.foodspot = response;
        res.redirect("/foodspots");
      }
    });
  });


  router.route("/signin")
  .get(function (req, res) {
    if (req.session.signedInFoodspot) {
      res.redirect("/foodspots");
    } else {
      res.render("foodspots/signin", {
        foodspot: true, layout:'emptylayout',
        signInErr: req.session.signInErr,
      });
      req.session.signInErr = null;
    }
  })
  .post(function (req, res) {
    foodspotHelper.doSignin(req.body).then((response) => {
      if (response.status) {
        req.session.signedInFoodspot = true;
        req.session.foodspot = response.foodspot;
        res.redirect("/foodspots");
      } else {
        req.session.signInErr = "Invalid Email/Password";
        res.redirect("/foodspots/signin");
      }
    });
  });


router.get("/signout", function (req, res) {
  req.session.signedInFoodspot = false;
  req.session.foodspot = null;
  res.redirect("/foodspots");
});


///////ALL menu/////////////////////                                         
router.get("/all-menus", verifySignedIn, function (req, res) {
  let foodspots = req.session.foodspots;
  foodspotHelper.getAllmenus().then((menus) => {
    res.render("foodspots/menu/all-menus", { foodspot: true, layout:"food", menus, foodspots });
  });
});

///////ADD menu/////////////////////                                         
router.get("/add-menu", verifySignedIn, async function (req, res) {
  let foodspots = req.session.foodspots;
  let fcatId = req.params.id;
  let fcats = await foodspotHelper.getfcats(fcatId);
  res.render("foodspots/menu/add-menu", { foodspot: true, layout:"food", fcats, foodspots });
});

///////ADD menu/////////////////////                                         
router.post("/add-menu", function (req, res) {
  foodspotHelper.addmenu(req.body, (id) => {
        res.redirect("/foodspots/menu/all-menus");
      });
});



///////EDIT menu/////////////////////                                         
router.get("/edit-menu/:id", verifySignedIn, async function (req, res) {
  let foodspots = req.session.foodspots;
  let menuId = req.params.id;
  let menu = await foodspotHelper.getmenuDetails(menuId);
  console.log(menu);
  res.render("foodspots/menu/edit-menu", { foodspot: true, layout:"food", menu, foodspots });
});

///////EDIT menu/////////////////////                                         
router.post("/edit-menu/:id", verifySignedIn, function (req, res) {
  let menuId = req.params.id;
  foodspotHelper.updatemenu(menuId, req.body).then(() => {
    if (req.files) {
      let image = req.files.Image;
      if (image) {
        image.mv("./public/images/menu-images/" + menuId + ".png");
      }
    }
    res.redirect("/foodspots/menu/all-menus");
  });
});

///////DELETE menu/////////////////////                                         
router.get("/delete-menu/:id", verifySignedIn, function (req, res) {
  let menuId = req.params.id;
  foodspotHelper.deletemenu(menuId).then((response) => {
    res.redirect("/foodspots/menu/all-menus");
  });
});

///////DELETE ALL menu/////////////////////                                         
router.get("/delete-all-menus", verifySignedIn, function (req, res) {
  foodspotHelper.deleteAllmenus().then(() => {
    res.redirect("/foodspots/menu/all-menus");
  });
});




///////ALL time/////////////////////                                         
router.get("/all-times", verifySignedIn, function (req, res) {
  let foodspots = req.session.foodspots;
  foodspotHelper.getAlltimes().then((times) => {
    res.render("foodspots/time/all-times", { foodspot: true, layout:"food", times, foodspots });
  });
});

///////ADD Time/////////////////////                                         
router.get("/add-time", verifySignedIn, function (req, res) {
  let foodspots = req.session.foodspots;
  res.render("foodspots/time/add-time", { foodspot: true, layout:"food", foodspots });
});

///////ADD Time/////////////////////                                         
router.post("/add-time", function (req, res) {
  foodspotHelper.addtime(req.body, (id) => {
        res.redirect("/foodspots/time/all-times");
      
    });
});

///////EDIT Time/////////////////////                                         
router.get("/edit-time/:id", verifySignedIn, async function (req, res) {
  let foodspots = req.session.foodspots;
  let timeId = req.params.id;
  let time = await foodspotHelper.gettimeDetails(timeId);
  console.log(time);
  res.render("foodspots/time/edit-time", { foodspot: true, layout:"food", time, foodspots });
});

///////EDIT Time/////////////////////                                         
router.post("/edit-time/:id", verifySignedIn, function (req, res) {
  let timeId = req.params.id;
  foodspotHelper.updatetime(timeId, req.body).then(() => {
    res.redirect("/foodspots/time/all-times");
  });
});

///////DELETE Time/////////////////////                                         
router.get("/delete-time/:id", verifySignedIn, function (req, res) {
  let timeId = req.params.id;
  foodspotHelper.deletetime(timeId).then((response) => {
    res.redirect("/foodspots/time/all-times");
  });
});

///////DELETE ALL Time/////////////////////                                         
router.get("/delete-all-times", verifySignedIn, function (req, res) {
  foodspotHelper.deleteAlltimes().then(() => {
    res.redirect("/foodspots/time/all-times");
  });
});




module.exports = router;
