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
  determineColor (rawRating) {
    // red if 2 stars or less. yellow if 3 stars. green if 4 or more stars
    let ratingNumber = parseInt(rawRating)
    if (ratingNumber <= 2) {
      return 'danger'
    } else if (ratingNumber === 3) {
      return 'warning'
    } else {
      return 'good'
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
  },
  getReviewContent (data, content) {
    const contentIndex = data.indexOf(content) + 1
    return data[contentIndex]
  }
}

module.exports = {
  sendReviews (reviews) {
    return new Promise((resolve, reject) => {
      let attachments = []
      
      for (const review of reviews) {
        let rating = helpers.parseRating(review.rating)
        
        let attachment = {
          fallback: review.title,
          color: helpers.determineColor(review.rating),
          author_name: rating,
          title: review.title.replace(/"/g, ''), //remove quotes from title
          title_link: `https://www.glassdoor.com${review.url}`,
          text: review.employment,
          fields: [
            {
              title: 'Pros',
              value: helpers.getReviewContent(review.pros, 'Pros'),
              short: false
            },
            {
              title: 'Cons',
              value: helpers.getReviewContent(review.cons, 'Cons'),
              short: false
            }
          ],
          thumb_url: helpers.getThumbUrl(review.url), // need to calculate,
          footer: review.job,
          ts: moment(review.date).unix()
        }
        
        // advice to management is optional
        if (review.advice) {
          attachment.fields.push({
            title: 'Advice to Management',
            value: helpers.getReviewContent(review.advice, 'Advice to Management'),
            short: false
          })
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
