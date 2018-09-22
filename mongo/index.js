const mongoose = require('mongoose')
const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/mongo_test";


mongoose.connect(MONGO_URI, function (err, res) {
  if (err) {
  console.log ('ERROR connecting to: ' + MONGO_URI + '. ' + err)
  } else {
  console.log ('Succeeded connected to: ' + MONGO_URI)
  }
});

const glassdoorReviewSchema = new mongoose.Schema({
  glassdoorId: String
})

const GlassdoorReview = mongoose.model('GlassdoorReviews', glassdoorReviewSchema)

module.exports = {
  findByGlassdoorId (glassdoorId) {
    return new Promise((resolve, reject) => {
      GlassdoorReview.findOne({
        glassdoorId: glassdoorId
      }, function(err, glassdoorReview) {
        if (err) { return reject(err) }
        return resolve(glassdoorReview)
      })
    })
  },
  saveGlassdoorReview (glassdoorId) {
    return new Promise((resolve, reject) => {
      if (!glassdoorId) {
        return reject({
          error: {
            msg: 'cannot save without id'
          }
        })
      } else {
        newGlassdoorReview = new GlassdoorReview ({
          glassdoorId: glassdoorId
        })
        newGlassdoorReview.save((err, glassdoorReview) => {
          if (err) { return reject(err) }
          return resolve(glassdoorReview)
        })
      }
    })
  },
  getAllGlassdoorReviews () {
    console.log('getting existing reviews...')
    return new Promise((resolve, reject) => {
      GlassdoorReview.find({}, function(err, glassdoorReviews) {
        console.log('got existing reviews...')
        if (err) { return reject(err) }
        return resolve(glassdoorReviews)
      })
    })
  }
}
