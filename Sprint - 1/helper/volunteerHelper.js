var db = require("../config/connection");
var collections = require("../config/collections");
var bcrypt = require("bcrypt");
const objectId = require("mongodb").ObjectID;

module.exports = {

//////////////////VOLUNTEER SIGNUP FUNCTION/////////////////////////////
    doSignup: async (volunteerData) => {
        volunteerData.Password = await bcrypt.hash(volunteerData.Password, 10);
        const result = await db.get()
            .collection(collections.VOLUNTEER_COLLECTION)
            .insertOne(volunteerData);
        return result.ops[0];
    },

//////////////////VOLUNTEER SIGNIN FUNCTION/////////////////////////////
  doSignin: (volunteerData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let volunteer = await db
        .get()
        .collection(collections.VOLUNTEER_COLLECTION)
        .findOne({ Email: volunteerData.Email });
      if (volunteer) {
        bcrypt.compare(volunteerData.Password, volunteer.Password).then((status) => {
          if (status) {
            console.log("Login Success");
            response.volunteer = volunteer;
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
