const request = require('request')

const helpers = {
  getReviewsFromPage (pageName, pageApiVersion) {
    return new Promise((resolve, reject) => {
      let options = {
        method: 'get',
        url: `https://wrapapi.com/use/msolomon/glassdoor/${pageName}/${pageApiVersion}?wrapAPIKey=${process.env.WRAP_API_KEY}`
      }
      request(options, function(err, response, body) {
        if (err) { console.log(err); return reject(err) }
        console.log(pageName)
        console.log(JSON.parse(body).data)
        return resolve(JSON.parse(body).data.reviews)
      })
    })
  }
}

module.exports = {
  getNewGlassdoorReviews () {
    return new Promise((resolve, reject) => {
      
      const groupNineReviews = helpers.getReviewsFromPage('Group-Nine', '0.0.9')
      const dodoReviews      = helpers.getReviewsFromPage('dodo', '0.0.3')
      const thrillistReviews = helpers.getReviewsFromPage('thrillist', '0.0.3')
      const nowThisReviews   = helpers.getReviewsFromPage('nowthis', '0.0.3')
      
      Promise.all([groupNineReviews, dodoReviews, thrillistReviews, nowThisReviews])
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
