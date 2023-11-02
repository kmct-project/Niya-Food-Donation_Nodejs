///////MONGODB CONNECTION & CONFIG////////////////

const mongoClient = require("mongodb").MongoClient;

const state = {
  db: null,
};
module.exports.connect = function (done) {
  const url = "mongodb+srv://thevectorcrop:msb.com001@niya-food-donation-node.6f8njak.mongodb.net/?retryWrites=true&w=majority";
  const dbname = "Food-Donation";

  mongoClient.connect(url, { useUnifiedTopology: true }, (err, data) => {
    if (err) {
      return done(err);
    }
    state.db = data.db(dbname);

    done();
  });
};

module.exports.get = function () {
  return state.db;
};
