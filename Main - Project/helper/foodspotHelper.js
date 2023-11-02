var db = require("../config/connection");
var collections = require("../config/collections");
var bcrypt = require("bcrypt");
const objectId = require("mongodb").ObjectID;

module.exports = {
 
    doSignup: async (foodspotData) => {
        foodspotData.Password = await bcrypt.hash(foodspotData.Password, 10);
        const result = await db.get()
            .collection(collections.FOODSPOT_COLLECTION)
            .insertOne(foodspotData);
        return result.ops[0];
    },

  doSignin: (foodspotData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let foodspot = await db
        .get()
        .collection(collections.FOODSPOT_COLLECTION)
        .findOne({ Email: foodspotData.Email });
      if (foodspot) {
        bcrypt
          .compare(foodspotData.Password, foodspot.Password)
          .then((status) => {
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

 



  getAllFoodspots: () => {
    return new Promise(async (resolve, reject) => {
      let foodspots = await db
        .get()
        .collection(collections.FOODSPOT_COLLECTION)
        .find()
        .toArray();
      resolve(foodspots);
    });
  },

  removeFoodspot: (foodspotId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.FOODSPOT_COLLECTION)
        .removeOne({ _id: objectId(foodspotId) })
        .then(() => {
          resolve();
        });
    });
  },

  
};
