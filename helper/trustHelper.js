var db = require("../config/connection");
var collections = require("../config/collections");
var bcrypt = require("bcrypt");
const objectId = require("mongodb").ObjectID;

module.exports = {


  ///////ADD req/////////////////////                                         
  addreq: (req, callback) => {
    console.log(req);
    db.get()
      .collection(collections.REQ_COLLECTION)
      .insertOne(req)
      .then((data) => {
        console.log(data);
        callback(data.ops[0]._id);
      });
  },

  ///////GET ALL req/////////////////////                                            
  getAllreqs: () => {
    return new Promise(async (resolve, reject) => {
      let reqs = await db
        .get()
        .collection(collections.REQ_COLLECTION)
        .find()
        .toArray();
      resolve(reqs);
    });
  },

  ///////ADD req DETAILS/////////////////////                                            
  getreqDetails: (reqId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.REQ_COLLECTION)
        .findOne({
          _id: objectId(reqId)
        })
        .then((response) => {
          resolve(response);
        });
    });
  },

  ///////DELETE req/////////////////////                                            
  deletereq: (reqId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.REQ_COLLECTION)
        .removeOne({
          _id: objectId(reqId)
        })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },

  ///////UPDATE req/////////////////////                                            
  updatereq: (reqId, reqDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.REQ_COLLECTION)
        .updateOne(
          {
            _id: objectId(reqId)
          },
          {
            $set: {
              Name: reqDetails.Name,
              Category: reqDetails.Category,
              Price: reqDetails.Price,
              Description: reqDetails.Description,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },


  ///////DELETE ALL req/////////////////////                                            
  deleteAllreqs: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.REQ_COLLECTION)
        .remove({})
        .then(() => {
          resolve();
        });
    });
  },


  addToTrustCart: (productData, userId) => {
    return new Promise(async (resolve, reject) => {
      let orderObject = {
        productId: productData.productId,
        address: productData.address,
        date: new Date(),
        trust_id: userId,
        status: 'active'
      };

      try {
        await db.get().collection(collections.TRUST_CART).insertOne(orderObject);

        await db.get().collection(collections.PRODUCTS_COLLECTION).updateOne(
          { _id: objectId(productData.productId) },
          { $set: { status: 'inactive' } }
        );

        resolve({ status: true });
      } catch (error) {
        reject(error);
      }
    });
  },
  removeFromTrustCart: (cartId) => {
    return new Promise(async (resolve, reject) => {
      let cart = await db.get().collection(collections.TRUST_CART).findOne({ _id: objectId(cartId) });
      let productId = cart.productId
      try {
        await db.get().collection(collections.TRUST_CART).removeOne({ _id: objectId(cartId) })

        await db.get().collection(collections.PRODUCTS_COLLECTION).updateOne(
          { _id: objectId(productId) },
          { $set: { status: 'active' } }
        );
        resolve({ status: true });
      } catch (error) {
        reject(error);
      }
    });
  },

  getTrustCartById: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let orders = await db.get().collection(collections.TRUST_CART).aggregate([
          {
            $match: { trust_id: userId, status: 'active' }
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
            $unwind: '$productDetails'
          }
        ]).toArray();

        resolve(orders);
      } catch (error) {
        reject(error);
      }
    });
  },


  ///////ADD userreq/////////////////////                                         
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
  doSignup: async (userData) => {
    userData.Password = await bcrypt.hash(userData.Password, 10);
    const result = await db.get()
      .collection(collections.TRUSTS_COLLECTION)
      .insertOne(userData);
    return result.ops[0];
  },

  //////////////////CHARITY SIGNIN FUNCTION/////////////////////////////
  doSignin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let user = await db
        .get()
        .collection(collections.TRUSTS_COLLECTION)
        .findOne({ Email: userData.Email });
      if (user) {
        bcrypt.compare(userData.Password, user.Password).then((status) => {
          if (status) {
            console.log("Login Success");
            response.user = user;
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




  addToCart: (productId, userId) => {
    console.log(userId);
    let productObject = {
      item: objectId(productId),
      quantity: 1,
    };
    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collections.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      if (userCart) {
        let productExist = userCart.products.findIndex(
          (products) => products.item == productId
        );
        console.log(productExist);
        if (productExist != -1) {
          db.get()
            .collection(collections.CART_COLLECTION)
            .updateOne(
              { user: objectId(userId), "products.item": objectId(productId) },
              {
                $inc: { "products.$.quantity": 1 },
              }
            )
            .then(() => {
              resolve();
            });
        } else {
          db.get()
            .collection(collections.CART_COLLECTION)
            .updateOne(
              { user: objectId(userId) },
              {
                $push: { products: productObject },
              }
            )
            .then((response) => {
              resolve();
            });
        }
      } else {
        let cartObject = {
          user: objectId(userId),
          products: [productObject],
        };
        db.get()
          .collection(collections.CART_COLLECTION)
          .insertOne(cartObject)
          .then((response) => {
            resolve();
          });
      }
    });
  },




  getCartProductList: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cart = await db
        .get()
        .collection(collections.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      resolve(cart.products);
    });
  },



  getUserOrder: (userId) => {
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collections.ORDER_COLLECTION)
        .find({ "orderObject.userId": objectId(userId) })
        .toArray();
      // console.log(orders);
      resolve(orders);
    });
  },

  getOrderProducts: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collections.ORDER_COLLECTION)
        .aggregate([
          {
            $match: { _id: objectId(orderId) },
          },
          {
            $unwind: "$orderObject.products",
          },
          {
            $project: {
              item: "$orderObject.products.item",
              quantity: "$orderObject.products.quantity",
            },
          },
          {
            $lookup: {
              from: collections.PRODUCTS_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();
      resolve(products);
    });
  },

  /////////FUNCTION FOR GET USER'S ORDER BY ID///////////////// 
  getOrderById: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let order = await db
        .get()
        .collection(collections.ORDER_COLLECTION)
        .findOne({ _id: objectId(orderId) });
      resolve(order);
    });
  },



  cancelOrder: (orderId) => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collections.ORDER_COLLECTION)
        .removeOne({ _id: objectId(orderId) })
        .then(() => {
          resolve();
        });
    });
  },




};
