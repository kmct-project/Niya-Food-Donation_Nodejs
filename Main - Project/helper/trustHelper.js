var db = require("../config/connection");
var collections = require("../config/collections");
var bcrypt = require("bcrypt");
const objectId = require("mongodb").ObjectID;

module.exports = {


    doSignup: async (trustData) => {
        trustData.Password = await bcrypt.hash(trustData.Password, 10);
        const result = await db.get()
            .collection(collections.TRUSTS_COLLECTION)
            .insertOne(trustData);
        return result.ops[0];
    },

  doSignin: (trustData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let trust = await db
        .get()
        .collection(collections.TRUSTS_COLLECTION)
        .findOne({ Email: trustData.Email });
      if (trust) {
        bcrypt
          .compare(trustData.Password, trust.Password)
          .then((status) => {
            if (status) {
              console.log("Login Success");
              response.trust = trust;
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



  getAllTrusts: () => {
    return new Promise(async (resolve, reject) => {
      let trusts = await db
        .get()
        .collection(collections.TRUSTS_COLLECTION)
        .find()
        .toArray();
      resolve(trusts);
    });
  },

  removeTrust: (trustId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.TRUSTS_COLLECTION)
        .removeOne({ _id: objectId(trustId) })
        .then(() => {
          resolve();
        });
    });
  },

  
 
};
