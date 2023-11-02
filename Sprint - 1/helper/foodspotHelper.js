var db = require("../config/connection");
var collections = require("../config/collections");
var bcrypt = require("bcrypt");
const objectId = require("mongodb").ObjectID;

module.exports = {

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





};
