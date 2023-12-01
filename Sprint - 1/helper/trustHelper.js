var db = require("../config/connection");
var collections = require("../config/collections");
var bcrypt = require("bcrypt");
const objectId = require("mongodb").ObjectID;

module.exports = {


  ///////ADD trustreq/////////////////////                                         
  addtrustreq: (trustreq, callback) => {
    console.log(trustreq);
    trustreq.Price = parseInt(trustreq.Price);
    db.get()
      .collection(collections.TRUSTREQ_COLLECTION)
      .insertOne(trustreq)
      .then((data) => {
        console.log(data);
        callback(data.ops[0]._id);
      });
  },

  ///////GET ALL trustreq/////////////////////                                            
  getAlltrustreqs: () => {
    return new Promise(async (resolve, reject) => {
      let trustreqs = await db
        .get()
        .collection(collections.TRUSTREQ_COLLECTION)
        .find()
        .toArray();
      resolve(trustreqs);
    });
  },

  ///////ADD trustreq DETAILS/////////////////////                                            
  gettrustreqDetails: (trustreqId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.TRUSTREQ_COLLECTION)
        .findOne({
          _id: objectId(trustreqId)
        })
        .then((response) => {
          resolve(response);
        });
    });
  },

  ///////DELETE trustreq/////////////////////                                            
  deletetrustreq: (trustreqId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.TRUSTREQ_COLLECTION)
        .removeOne({
          _id: objectId(trustreqId)
        })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },

  ///////UPDATE trustreq/////////////////////                                            
  updatetrustreq: (trustreqId, trustreqDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.TRUSTREQ_COLLECTION)
        .updateOne(
          {
            _id: objectId(trustreqId)
          },
          {
            $set: {
              name: trustreqDetails.name,
              type: trustreqDetails.type,
              quantity: trustreqDetails.quantity,
              Price: trustreqDetails.Price,
              location: trustreqDetails.location,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },


  ///////DELETE ALL trustreq/////////////////////                                            
  deleteAlltrustreqs: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.TRUSTREQ_COLLECTION)
        .remove({})
        .then(() => {
          resolve();
        });
    });
  },

  //////////////////CHARITY SIGNUP FUNCTION/////////////////////////////
  doSignup: async (trustData) => {
    trustData.Password = await bcrypt.hash(trustData.Password, 10);
    const result = await db.get()
      .collection(collections.TRUSTS_COLLECTION)
      .insertOne(trustData);
    return result.ops[0];
  },

  //////////////////CHARITY SIGNIN FUNCTION/////////////////////////////
  doSignin: (trustData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let trust = await db
        .get()
        .collection(collections.TRUSTS_COLLECTION)
        .findOne({ Email: trustData.Email });
      if (trust) {
        bcrypt.compare(trustData.Password, trust.Password).then((status) => {
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





};
