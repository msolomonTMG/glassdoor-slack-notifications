const request = require('request')
const moment = require('moment')

const helpers = {
  parseRating (rawRating) {
    const numStars = parseInt(rawRating)
    let rating = ''
    
    if (numStars === 0) {
      return rating
    } else {
      for (let i = 0; i < numStars; i++) {
        rating += ':star: '
        
        if (i + 1 === numStars) {
          return rating
        }
      }
    }
  },
  getThumbUrl (url) {
    const groupNineLogoUrl = 'https://www.drupal.org/files/styles/grid-3/public/g9.png?itok=hm2kGgmx'
    const dodoLogoUrl      = 'https://www.thedodo.com/images/dodo/mission-statement/dodo_logo_full.png'
    const thrillistLogoUrl = 'https://www.thrillist.com/images/thrillist/apple-touch-icon-retina.png'
    const nowThisLogoUrl   = 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Nowthis_logo16.png'
    
    if (url.includes('The-Dodo')) {
      return dodoLogoUrl
    } else if (url.includes('Thrillist')) {
      return thrillistLogoUrl
    } else if (url.includes('NowThis')) {
      return nowThisLogoUrl
    } else {
      return groupNineLogoUrl
    }
  }
}

module.exports = {
  sendReviews (reviews) {
    return new Promise((resolve, reject) => {
      let attachments = []
      
      for (const review of reviews) {
        let rating = helpers.parseRating(review.rating)
        let color = 'success' // need to calculate
        
        let attachment = {
          fallback: review.title,
          color: color,
          author_name: rating,
          title: review.title.replace(/"/g, ''), //remove quotes from title
          title_link: `https://www.glassdoor.com${review.url}`,
          text: review.employment,
          fields: [
            {
              title: 'Pros',
              value: review.pros,
              short: false
            },
            {
              title: 'Cons',
              value: review.cons,
              short: false
            }
          ],
          thumb_url: helpers.getThumbUrl(review.url), // need to calculate,
          footer: review.job,
          ts: moment(review.date).unix()
        }
        
        attachments.push(attachment)
      }
      
      let options = {
        method: 'post',
        body: {
          text: ':wave: There are new Glassdoor reviews!',
          attachments: attachments
        },
        json: true,
        url: process.env.SLACK_HOOK_URL
      }
      
      request(options, function(err, response, body) {
        if (err) { console.log(err); return reject(err) }
        return resolve(body)
      })
      
    })
  }
}
