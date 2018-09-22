const request = require('request')

const helpers = {
  getReviewsFromPage (pageName, pageApiVersion) {
    return new Promise((resolve, reject) => {
      let options = {
        method: 'get',
        url: `https://wrapapi.com/use/msolomon/glassdoor/${pageName}/${pageApiVersion}?wrapAPIKey=${process.env.WRAP_API_KEY}`
      }
      request(options, function(err, response, body) {
        console.log('got reviews...')
        if (err) { console.log(err); return reject(err) }
        return resolve(JSON.parse(body).data.reviews)
      })
    })
  },
  getGroupNineReviews () {
    return new Promise((resolve, reject) => {
      let options = {
        method: 'get',
        url: `https://wrapapi.com/use/msolomon/glassdoor/Group-Nine/${process.env.WRAP_API_VERSION}?wrapAPIKey=${process.env.WRAP_API_KEY}`
      }
      
      request(options, function(err, response, body) {
        console.log('got reviews...')
        if (err) { console.log(err); return reject(err) }
        return resolve(JSON.parse(body).data.reviews)
      })
    })
  },
  getDodoReviews () {
    return new Promise((resolve, reject) => {
      let options = {
        method: 'get',
        url: `https://wrapapi.com/use/msolomon/glassdoor/dodo/${process.env.WRAP_API_VERSION}?wrapAPIKey=${process.env.WRAP_API_KEY}`
      }
      
      request(options, function(err, response, body) {
        console.log('got reviews...')
        if (err) { console.log(err); return reject(err) }
        return resolve(JSON.parse(body).data.reviews)
      })
    })
  }
}

module.exports = {
  getNewGlassdoorReviews () {
    console.log('getting new reviews...')
    return new Promise((resolve, reject) => {
      
      const groupNineReviews = helpers.getReviewsFromPage('Group-Nine', '0.0.6')
      const dodoReviews      = helpers.getReviewsFromPage('dodo', '0.0.1')
      const thrillistReviews = helpers.getReviewsFromPage('thrillist', '0.0.1')
      const nowThisReviews   = helpers.getReviewsFromPage('nowthis', '0.0.1')
      
      //const groupNineReviews = helpers.getGroupNineReviews()
      // const dodoReviews      = helpers.getDodoReviews()
      // const thrillistReviews = helpers.getThrillistReviews()
      // const nowThisReviews   = helpers.getNowThisReviews()
      
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
