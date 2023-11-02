var db = require("../config/connection");
var collections = require("../config/collections");
const bcrypt = require("bcrypt");
const objectId = require("mongodb").ObjectID;


module.exports = {

//////////////////DONER SIGNUP FUNCTION/////////////////////////////
  doSignup: (donerData) => {
    return new Promise(async (resolve, reject) => {
      donerData.Password = await bcrypt.hash(donerData.Password, 10);
      db.get()
        .collection(collections.DONOR_COLLECTION)
        .insertOne(donerData)
        .then((data) => {
          resolve(data.ops[0]);
        });
    });
  },

//////////////////DONER SIGNIN FUNCTION/////////////////////////////
  doSignin: (donerData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let doner = await db
        .get()
        .collection(collections.DONOR_COLLECTION)
        .findOne({ Email: donerData.Email });
      if (doner) {
        bcrypt.compare(donerData.Password, doner.Password).then((status) => {
          if (status) {
            console.log("Login Success");
            response.doner = doner;
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
