var db = require("../config/connection");
var collections = require("../config/collections");
var bcrypt = require("bcrypt");
const objectId = require("mongodb").ObjectID;

module.exports = {

  ////////GET ALL CATEGORIES FROM DB FUNCTION/////////
  getfcats: () => {
    return new Promise(async (resolve, reject) => {
      let fcats = await db
        .get()
        .collection(collections.FCATEGORY_COLLECTION)
        .find()
        .toArray();
      resolve(fcats);
    });
  },

  //////////////////FOODSPOT SIGNUP FUNCTION/////////////////////////////
  doSignup: async (foodspotData) => {
    foodspotData.Password = await bcrypt.hash(foodspotData.Password, 10);
    const result = await db.get()
      .collection(collections.FOODSPOT_COLLECTION)
      .insertOne(foodspotData);
    return result.ops[0];
  },

  //////////////////FOODSPOT SIGNIN FUNCTION/////////////////////////////
  doSignin: (foodspotData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let foodspot = await db
        .get()
        .collection(collections.FOODSPOT_COLLECTION)
        .findOne({ Email: foodspotData.Email });
      if (foodspot) {
        bcrypt.compare(foodspotData.Password, foodspot.Password).then((status) => {
          if (status) {
            console.log("Login Success");
            response.foodspot = foodspot;
            response.status = true;
            resolve(response);
          } else {
            console.log("Login Failed");
            resolve({ status: false });
          }
        });
      } else {
        console.log("Login Failed");
        resolve({ status: false });
      }
    });
  },

  ///////ADD cuisinereq/////////////////////                                         
  addcuisinereq: (cuisinereq, callback) => {
    console.log(cuisinereq);
    db.get()
      .collection(collections.REQ_COLLECTION)
      .insertOne(cuisinereq)
      .then((data) => {
        console.log(data);
        callback(data.ops[0]._id);
      });
  },

  ///////GET ALL menu/////////////////////                                            
  getAllgetAllcuisinereqs: () => {
    return new Promise(async (resolve, reject) => {
      let getAllcuisinereqs = await db
        .get()
        .collection(collections.REQ_COLLECTION)
        .find()
        .toArray();
      resolve(getAllcuisinereqs);
    });
  },


  ///////ADD menu/////////////////////                                         
  addmenu: (menu, callback) => {
    console.log(menu);
    menu.Price = parseInt(menu.Price);
    db.get()
      .collection(collections.MENU_COLLECTION)
      .insertOne(menu)
      .then((data) => {
        console.log(data);
        callback(data.ops[0]._id);
      });
  },

  ///////GET ALL menu/////////////////////                                            
  getAllmenus: () => {
    return new Promise(async (resolve, reject) => {
      let menus = await db
        .get()
        .collection(collections.MENU_COLLECTION)
        .find()
        .toArray();
      resolve(menus);
    });
  },

  ///////ADD menu DETAILS/////////////////////                                            
  getmenuDetails: (menuId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.MENU_COLLECTION)
        .findOne({
          _id: objectId(menuId)
        })
        .then((response) => {
          resolve(response);
        });
    });
  },

  ///////DELETE menu/////////////////////                                            
  deletemenu: (menuId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.MENU_COLLECTION)
        .removeOne({
          _id: objectId(menuId)
        })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },

  ///////UPDATE menu/////////////////////                                            
  updatemenu: (menuId, menuDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.MENU_COLLECTION)
        .updateOne(
          {
            _id: objectId(menuId)
          },
          {
            $set: {
              Name: menuDetails.Name,
              Category: menuDetails.Category,
              Price: menuDetails.Price,
              size: menuDetails.size,
              time: menuDetails.time,
              timeampm: menuDetails.timeampm,
              cuisine: menuDetails.cuisine,


              Description: menuDetails.Description,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },


  ///////DELETE ALL menu/////////////////////                                            
  deleteAllmenus: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.MENU_COLLECTION)
        .remove({})
        .then(() => {
          resolve();
        });
    });
  },


  ///////ADD Time/////////////////////                                         
  addtime: (time, callback) => {
    console.log(time);
    time.Price = parseInt(time.Price);
    db.get()
      .collection(collections.TIME_COLLECTION)
      .insertOne(time)
      .then((data) => {
        console.log(data);
        callback(data.ops[0]._id);
      });
  },

  ///////GET ALL Time/////////////////////                                            
  getAlltimes: () => {
    return new Promise(async (resolve, reject) => {
      let times = await db
        .get()
        .collection(collections.TIME_COLLECTION)
        .find()
        .toArray();
      resolve(times);
    });
  },

  ///////ADD Time DETAILS/////////////////////                                            
  gettimeDetails: (timeId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.TIME_COLLECTION)
        .findOne({
          _id: objectId(timeId)
        })
        .then((response) => {
          resolve(response);
        });
    });
  },

  ///////DELETE Time/////////////////////                                            
  deletetime: (timeId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.TIME_COLLECTION)
        .removeOne({
          _id: objectId(timeId)
        })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },

  ///////UPDATE Time/////////////////////                                            
  updatetime: (timeId, timeDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.TIME_COLLECTION)
        .updateOne(
          {
            _id: objectId(timeId)
          },
          {
            $set: {
              from: timeDetails.from,
              to: timeDetails.to,
              fromampm: timeDetails.fromampm,
              toampm: timeDetails.toampm,

            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },


  ///////DELETE ALL Time/////////////////////                                            
  deleteAlltimes: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.TIME_COLLECTION)
        .remove({})
        .then(() => {
          resolve();
        });
    });
  },






};
