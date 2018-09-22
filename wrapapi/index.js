const request = require('request')

module.exports = {
  getNewGlassdoorReviews () {
    console.log('getting new reviews...')
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
      
    });
  }
}
