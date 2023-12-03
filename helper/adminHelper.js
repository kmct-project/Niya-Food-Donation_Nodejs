var db = require('../config/connection');
var collections = require('../config/collections');
var bcrypt = require('bcrypt');
const objectId = require('mongodb').ObjectID;

module.exports = {
  //////////////////ADMIN SIGNUP FUNCTION/////////////////////////////
  doSignup: (adminData) => {
    return new Promise(async (resolve, reject) => {
      if (adminData.Code == 'admin123') {
        adminData.Password = await bcrypt.hash(adminData.Password, 10);
        db.get()
          .collection(collections.ADMIN_COLLECTION)
          .insertOne(adminData)
          .then((data) => {
            resolve(data.ops[0]);
          });
      } else {
        resolve({ status: false });
      }
    });
  },

  //////////////////////ADMIN SIGNIN FUNCTION//////////////////////////
  doSignin: (adminData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let admin = await db
        .get()
        .collection(collections.ADMIN_COLLECTION)
        .findOne({ Email: adminData.Email });
      if (admin) {
        bcrypt.compare(adminData.Password, admin.Password).then((status) => {
          if (status) {
            console.log('Login Success');
            response.admin = admin;
            response.status = true;
            resolve(response);
          } else {
            console.log('Login Failed');
            resolve({ status: false });
          }
        });
      } else {
        console.log('Login Failed');
        resolve({ status: false });
      }
    });
  },
  ////////////////////////////////////////////////////

  ///////GET ALL menu/////////////////////
  getAllcuisinereqs: () => {
    return new Promise(async (resolve, reject) => {
      let cuisinereqs = await db
        .get()
        .collection(collections.REQ_COLLECTION)
        .find()
        .toArray();
      resolve(cuisinereqs);
    });
  },

  ////////CATEGORY FUNCTION CRUD///////////////////
  //                                             //
  ////////ADD FOOD CATEGORY TO DB FUNCTION/////////
  addfcat: (fcat, callback) => {
    console.log(fcat);
    db.get()
      .collection(collections.FCATEGORY_COLLECTION)
      .insertOne(fcat)
      .then((data) => {
        console.log(data);
        callback(data.ops[0]._id);
      });
  },

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

  ////////GET ALL CATEGORY'S DETAILS FROM DB FUNCTION/////////
  getcatdetails: (fcatId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.FCATEGORY_COLLECTION)
        .findOne({ _id: objectId(fcatId) })
        .then((response) => {
          resolve(response);
        });
    });
  },

  ////////DELETE A CATEGORY FROM DB FUNCTION/////////
  deletefcat: (fcatId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.FCATEGORY_COLLECTION)
        .removeOne({ _id: objectId(fcatId) })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },

  ////////UPDATE A CATEGORY FROM DB FUNCTION/////////
  updatefcat: (fcatId, fcatDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.FCATEGORY_COLLECTION)
        .updateOne(
          { _id: objectId(fcatId) },
          {
            $set: {
              Name: fcatDetails.Name,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },
  //////////////////////////////////////////////////////////////////

  ////////CALLING OTHER COLLECTION TO ADMIN FUNCTION ///////////////////
  //
  ////////GET ALL USERS FROM DB FUNCTION/////////
  getAllUsers: () => {
    return new Promise(async (resolve, reject) => {
      let users = await db
        .get()
        .collection(collections.USERS_COLLECTION)
        .find()
        .toArray();
      resolve(users);
    });
  },

  ////////GET ALL DONERS FROM DB FUNCTION/////////
  getalldoners: () => {
    return new Promise(async (resolve, reject) => {
      let doners = await db
        .get()
        .collection(collections.DONOR_COLLECTION)
        .find()
        .toArray();
      resolve(doners);
    });
  },

  ////////GET ALL VOLUNTEERS FROM DB FUNCTION/////////
  getallvolunteers: () => {
    return new Promise(async (resolve, reject) => {
      let volunteers = await db
        .get()
        .collection(collections.VOLUNTEER_COLLECTION)
        .find()
        .toArray();
      resolve(volunteers);
    });
  },

  ////////GET ALL CHARITIES FROM DB FUNCTION/////////
  getalltrusts: () => {
    return new Promise(async (resolve, reject) => {
      let trusts = await db
        .get()
        .collection(collections.TRUSTS_COLLECTION)
        .find()
        .toArray();
      resolve(trusts);
    });
  },

  ////////GET ALL FOODSPOT FROM DB FUNCTION/////////
  getallfoodspots: () => {
    return new Promise(async (resolve, reject) => {
      let foodspots = await db
        .get()
        .collection(collections.FOODSPOT_COLLECTION)
        .find()
        .toArray();
      resolve(foodspots);
    });
  },
  ////////////////////////////////////////////////////////

  ////////FUNCTIONS TO REMOVE COLLECTION FROM DB/////////
  //
  ////////REMOVE FOODSPOT FROM DB FUNCTION/////////
  removefoodspot: (foodspotId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.FOODSPOT_COLLECTION)
        .removeOne({ _id: objectId(foodspotId) })
        .then(() => {
          resolve();
        });
    });
  },

  ////////REMOVE CHARITIE FROM DB FUNCTION/////////
  removetrust: (trustId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.TRUSTS_COLLECTION)
        .removeOne({ _id: objectId(trustId) })
        .then(() => {
          resolve();
        });
    });
  },

  ////////REMOVE VOLUNTEER FROM DB FUNCTION/////////
  removevolunteer: (volunteerId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.VOLUNTEER_COLLECTION)
        .removeOne({ _id: objectId(volunteerId) })
        .then(() => {
          resolve();
        });
    });
  },

  ////////REMOVE USER FROM DB FUNCTION/////////
  removeUser: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.USERS_COLLECTION)
        .removeOne({ _id: objectId(userId) })
        .then(() => {
          resolve();
        });
    });
  },

  ////////REMOVE DONER FROM DB FUNCTION/////////
  removedoner: (donerId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.DONOR_COLLECTION)
        .removeOne({ _id: objectId(donerId) })
        .then(() => {
          resolve();
        });
    });
  },

  ///////////////////////////////////////////////
};
