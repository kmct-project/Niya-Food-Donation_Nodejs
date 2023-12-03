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
  getAllProductsForVolunteers: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let products = await db.get().collection(collections.TRUST_CART).aggregate([
          {
            $match: { status: 'active' }
          },
          {
            $lookup: {
              from: collections.PRODUCTS_COLLECTION,
              let: { productIdStr: '$productId' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ['$_id', { $toObjectId: '$$productIdStr' }]
                    }
                  }
                }
              ],
              as: 'productDetails'
            }
          },
          {
            $lookup: {
              from: collections.TRUSTS_COLLECTION,
              let: { trustIdStr: '$trust_id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ['$_id', { $toObjectId: '$$trustIdStr' }]
                    }
                  }
                }
              ],
              as: 'trustDetails'
            }
          },
          {
            $unwind: '$productDetails'
          },
          {
            $unwind: '$trustDetails'
          }
        ]).toArray();

        resolve(products);
      } catch (error) {
        reject(error);
      }
    });
  },

  addToVolunteerCart: (donationId, userId) => {
    return new Promise(async (resolve, reject) => {
      let orderObject = {
        donationId: donationId,
        date: new Date(),
        volunteer_id: userId,
        status: 'active'
      };

      try {
        await db.get().collection(collections.VOLUNTEER_CART).insertOne(orderObject);

        await db.get().collection(collections.TRUST_CART).updateOne(
          { _id: objectId(donationId) },
          { $set: { status: 'inactive' } }
        );
        resolve({ status: true });
      } catch (error) {
        reject(error);
      }
    });
  },

  getVolunteerCartById: async (userId) => {
    try {
      // Fetch data from VOLUNTEER_CART collection
      const volunteerCarts = await db.get().collection(collections.VOLUNTEER_CART).find({
        volunteer_id: userId,
        status: 'active'
      }).toArray();

      if (volunteerCarts.length === 0) {
        return null; // or handle as needed
      }

      // Fetch additional details for each volunteer cart
      const results = await Promise.all(volunteerCarts.map(async (volunteerCart) => {
        // Fetch data from TRUST_CART collection
        const trustCart = await db.get().collection(collections.TRUST_CART).findOne({
          _id: objectId(volunteerCart.donationId),
        });

        if (!trustCart) {
          return null; // or handle as needed
        }

        // Fetch data from PRODUCTS_COLLECTION
        const productDetails = await db.get().collection(collections.PRODUCTS_COLLECTION).findOne({
          _id: objectId(trustCart.productId),
        });

        if (!productDetails) {
          return null; // or handle as needed
        }

        // Fetch data from USER_COLLECTION for trust user
        const trustUserDetails = await db.get().collection(collections.TRUSTS_COLLECTION).findOne({
          _id: objectId(trustCart.trust_id)
        });

        if (!trustUserDetails) {
          return null; // or handle as needed
        }

        // Combine the data for each volunteer cart
        return {
          volunteerCart: volunteerCart,
          trustCart: trustCart,
          productDetails: productDetails,
          trustUserDetails: trustUserDetails,
        };
      }));

      return results.filter(result => result !== null); // Filter out any null results
    } catch (error) {
      throw error;
    }
  }





};
