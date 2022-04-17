require('dotenv').config();
const mongoose = require('mongoose');
// connect to mongodb by uri
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
// define schema
const shortUrlSchema = new mongoose.Schema({
  url: String,
  host: String,
  address: String,
  family: String,
  short: Number, // this is freecodecamp's requirement: type Number
});
// create Model
let ShortUrl = mongoose.model('ShortUrl', shortUrlSchema);

/**
 * handle error
 * @param {*} err error 
 */
const handleError = (err) => {
  console.log(err);
}

/**
 * Find the next "short" number by get the maximum value plus 1 (we can replace it with another solution)
 * @param {Function} done(err, data) the callback that handles the response 
 */
const findNextShortByIncrementing = (done) => {
  ShortUrl.findOne()
  .sort("-short")
  .limit(1)
  .exec((err, data) => {
    if(err) {
      return handleError(err);
    }
    if(data) {
      done(null, data.short + 1);
    } else {
      done(null, 1);
    }
  });
}

/**
 * Find new "short"
 * @param {Function} done(err, data) the callback that handles the response 
 */
const getNewShort = (done) => {
  findNextShortByIncrementing((err, newShort) => {
    if(err) {
      return handleError(err);
    }
    done(null, newShort);
  });
}

/**
 * Create short url 
 * @param {String} url original url
 * @param {String} host host
 * @param {String} address ip address
 * @param {String} family 
 * @param {Function} done(err, data) the callback that handles the response
 */
const createShortUrl = (url, host, address, family, done) => {
  getNewShort(function(err, newShort) {
    if(err) {
      return handleError(err);
    }
    let record = new ShortUrl({ url, host, address, family, short: newShort});

    record.save((err, res) => {
      if(err) {
        return handleError(err);
      } 
      done(null, res.short);
    })
  });
}

/**
 * Find url by "short"
 * @param {*} short short url
 * @param {*} done(err, data) the callback that handles the response 
 */
const findUrlByShort = (short, done) => {
  ShortUrl.findOne({short: short}, (err, data) => {
    if(err) {
      return handleError(err);
    }

    if(data) {
      done(null, data.url)
    } else {
      done(null, null)
    }
  });
}

/**
 * Find ShortUrl doc by url
 * @param {String} url url
 * @param {Function} done(err, data) callback handles the response 
 */
const findDocByUrl = (url, done) => {
  ShortUrl.findOne({url: url}, (err, data) => {
    if(err) {
      return handleError(err);
    }
    
    done(null, data);
  });
}

module.exports = {
  createShortUrl,
  findUrlByShort,
  findDocByUrl
}
