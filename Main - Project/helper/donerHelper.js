var db = require("../config/connection");
var collections = require("../config/collections");
var bcrypt = require("bcrypt");
const objectId = require("mongodb").ObjectID;

module.exports = {
  doSignup: async (donerData) => {
    donerData.Password = await bcrypt.hash(donerData.Password, 10);
    const result = await db.get()
        .collection(collections.DONOR_COLLECTION)
        .insertOne(donerData);
    return result.ops[0];
},

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



  getAllDoners: () => {
    return new Promise(async (resolve, reject) => {
      let doners = await db
        .get()
        .collection(collections.DONOR_COLLECTION)
        .find()
        .toArray();
      resolve(doners);
    });
  },

  removeDoner: (donerId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.DONOR_COLLECTION)
        .removeOne({ _id: objectId(donerId) })
        .then(() => {
          resolve();
        });
    });
  },


};
