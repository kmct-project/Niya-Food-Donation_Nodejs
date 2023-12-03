var db = require("../config/connection");
var collections = require("../config/collections");
const bcrypt = require("bcrypt");
const objectId = require("mongodb").ObjectID;


module.exports = {


  ///////ADD donate/////////////////////                                         
  addProduct: (product, callback) => {
    product.Price = parseInt(product.Price);
    db.get()
      .collection(collections.PRODUCTS_COLLECTION)
      .insertOne({ ...product, status: 'active', })
      .then((data) => {
        console.log(data);
        callback(data.ops[0]._id);
      });
  },

  ///////GET ALL donate/////////////////////                                            
  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collections.PRODUCTS_COLLECTION)
        .find({ status: 'active' })
        .toArray();
      resolve(products);
    });
  },

  getProductById: (donarId) => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collections.PRODUCTS_COLLECTION)
        .find({ donatedBy: donarId })
        .toArray();
      resolve(products);
    });
  },



  ///////ADD donate DETAILS/////////////////////                                            
  getProductDetails: (productId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.PRODUCTS_COLLECTION)
        .findOne({ _id: objectId(productId) })
        .then((response) => {
          resolve(response);
        });
    });
  },

  ///////DELETE donate/////////////////////                                            
  deleteProduct: (productId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.PRODUCTS_COLLECTION)
        .removeOne({ _id: objectId(productId) })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },

  ///////UPDATE donate/////////////////////   

  updateProduct: (productId, productDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.PRODUCTS_COLLECTION)
        .updateOne(
          { _id: objectId(productId) },
          {
            $set: {
              name: productDetails.name,
              type: productDetails.type,
              quantity: productDetails.quantity,
              Price: productDetails.Price,
              location: productDetails.location,
              status: 'active'
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },

  ///////DELETE ALL donate/////////////////////                                            
  deleteAllProducts: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.PRODUCTS_COLLECTION)
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
