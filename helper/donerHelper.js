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
  getAlltrustreqsWithId: (userId) => {
    return new Promise(async (resolve, reject) => {
      let trustreqs = await db
        .get()
        .collection(collections.TRUSTREQ_COLLECTION)
        .find({ requestedBy: userId, status: 'active' })
        .toArray();
      resolve(trustreqs);
    });
  },

  getAlltrustreqs: (userId) => {
    return new Promise(async (resolve, reject) => {
      let trustreqs = await db
        .get()
        .collection(collections.TRUSTREQ_COLLECTION)
        .find({ status: 'active' })
        .toArray();
      resolve(trustreqs);
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
              location: productDetails.location,
              pdate: productDetails.pdate,
              ptime: productDetails.ptime,
              desc: productDetails.desc,

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

  getAllOrders: async (doner_id) => {
    try {
      const donatedProducts = await db.get().collection(collections.PRODUCTS_COLLECTION).find({ donatedBy: doner_id }).toArray();

      const productIds = donatedProducts.map(product => product._id.toString());
      console.log("file: donerHelper.js:195 ~ getAllOrders: ~ productIds:", productIds)

      const trustCartData = await db.get().collection(collections.TRUST_CART).find({
        productId: { $in: productIds },
        // status: 'inactive'
      }).toArray();
      console.log("file: donerHelper.js:201 ~ trustCartData ~ trustCartData:", trustCartData)

      const trustCartMap = trustCartData.reduce((acc, entry) => {
        acc[entry.productId] = entry;
        return acc;
      }, {});

      const trustDetails = await Promise.all(trustCartData.map(async (trustCartEntry) => {
        if (trustCartEntry) {
          return await db.get().collection(collections.TRUSTS_COLLECTION).findOne({
            _id: objectId(trustCartEntry.trust_id)
          });
        } else {
          return null;
        }
      }));

      const orders = donatedProducts.map((product) => {
        const productIdStr = product._id.toString();
        const trustCartEntry = trustCartMap[productIdStr] || null;

        const tempTrustDetails = trustDetails.find(details => details && details._id.toString() === (trustCartEntry?.trust_id || null)) || null;
        if (tempTrustDetails && trustCartEntry) {
          return {
            product: product,
            trustCart: trustCartEntry,
            trustDetails: tempTrustDetails,
          };
        }

      });

      return orders;
    } catch (error) {
      throw error;
    }
  },

  acceptRequest: (productData, doner) => {
    return new Promise(async (resolve, reject) => {
      try {
        let product = await db.get().collection(collections.TRUSTREQ_COLLECTION).findOne({ _id: objectId(productData.productId) });

        if (!product) {
          return reject({ message: 'Trust request not found' });
        }

        let newProductObject = {
          "donername": doner.Orgname,
          "donernumber": productData.phone,
          "name": product.name,
          "type": product.type,
          "quantity": product.qty,
          "location": productData.address,
          "pdate": product.dd,
          "ptime": product.td,
          "desc": product.desc,
          "donatedBy": doner._id,
          "status": "inactive"
        };

        let { insertedId } = await db.get().collection(collections.PRODUCTS_COLLECTION).insertOne(newProductObject);

        let orderObject = {
          productId: insertedId.toString(),
          address: product.Address,
          date: new Date(),
          trust_id: product.requestedBy,
          status: 'active',
        };

        await db.get().collection(collections.TRUST_CART).insertOne(orderObject);

        await db.get().collection(collections.TRUSTREQ_COLLECTION).updateOne(
          { _id: objectId(productData.productId) },
          { $set: { status: 'inactive' } }
        );

        resolve({ status: true });
      } catch (error) {
        reject(error);
      }
    });
  }


};
