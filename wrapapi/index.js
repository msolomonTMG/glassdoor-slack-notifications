const request = require('request')

const helpers = {
  getReviewsFromPage (pageName, pageApiVersion, type) {
    return new Promise((resolve, reject) => {
      let options = {
        method: 'get',
        url: `https://wrapapi.com/use/msolomon/glassdoor/${pageName}/${pageApiVersion}?wrapAPIKey=${process.env.WRAP_API_KEY}`
      }
      request(options, function(err, response, body) {
        if (err) { console.log(err); return reject(err) }
        let data = JSON.parse(body).data[type]
        return resolve(data.map(review => {
          review.type = type
          return review
        }))
      })
    })
  }
}

module.exports = {
  getNewGlassdoorReviews () {
    return new Promise((resolve, reject) => {
      const groupNineReviews = helpers.getReviewsFromPage('Group-Nine', '0.0.9', 'reviews')
      const dodoReviews      = helpers.getReviewsFromPage('dodo', '0.0.3', 'reviews')
      const thrillistReviews = helpers.getReviewsFromPage('thrillist', '0.0.3', 'reviews')
      const nowThisReviews   = helpers.getReviewsFromPage('nowthis', '0.0.4', 'reviews')
      
      const groupNineInterviews = helpers.getReviewsFromPage('Group-Nine-interviews', '0.0.11', 'interviews')
      
      Promise.all([groupNineReviews, dodoReviews, thrillistReviews, nowThisReviews, groupNineInterviews])
        .then(reviews => {
          return resolve(reviews.reduce((acc, val) => acc.concat(val), [])) // would like to replace with flat() once its available
        })
        .catch(err => {
          console.error(err)
          return reject(err)
        })
      
    });
  }
}
