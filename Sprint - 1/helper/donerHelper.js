var db = require("../config/connection");
var collections = require("../config/collections");
const bcrypt = require("bcrypt");
const objectId = require("mongodb").ObjectID;


module.exports = {


  ///////ADD donate/////////////////////                                         
  adddonate: (donate, callback) => {
    console.log(donate);
    donate.Price = parseInt(donate.Price);
    db.get()
      .collection(collections.DONATE_COLLECTION)
      .insertOne(donate)
      .then((data) => {
        console.log(data);
        callback(data.ops[0]._id);
      });
  },

  ///////GET ALL donate/////////////////////                                            
  getAlldonates: () => {
    return new Promise(async (resolve, reject) => {
      let donates = await db
        .get()
        .collection(collections.DONATE_COLLECTION)
        .find()
        .toArray();
      resolve(donates);
    });
  },

  ///////ADD donate DETAILS/////////////////////                                            
  getdonateDetails: (donateId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.DONATE_COLLECTION)
        .findOne({
          _id: objectId(donateId)
        })
        .then((response) => {
          resolve(response);
        });
    });
  },

  ///////DELETE donate/////////////////////                                            
  deletedonate: (donateId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.DONATE_COLLECTION)
        .removeOne({
          _id: objectId(donateId)
        })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },

  ///////UPDATE donate/////////////////////                                            
  updatedonate: (donateId, donateDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.DONATE_COLLECTION)
        .updateOne(
          {
            _id: objectId(donateId)
          },
          {
            $set: {
              name: donateDetails.name,
              type: donateDetails.type,
              quantity: donateDetails.quantity,
              Price: donateDetails.Price,
              location: donateDetails.location,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },


  ///////DELETE ALL donate/////////////////////                                            
  deleteAlldonates: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.DONATE_COLLECTION)
        .remove({})
        .then(() => {
          resolve();
        });
    });
  },






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
