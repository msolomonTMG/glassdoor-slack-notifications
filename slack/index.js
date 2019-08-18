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
    const contentIndex = data.indexOf(content) ? data.indexOf(content) + 1 : null
    if (contentIndex) {
      return data[contentIndex]
    } else {
      return null
    }
  },
  formatInterviewOutcomes (outcomes) {
    let outcomeString = ''
    let uniqueOutcomes = [...new Set(outcomes)]
    console.log('uniqueOutcomes', uniqueOutcomes)
    let validOutcomes = uniqueOutcomes.filter(outcome => {
      return outcome !== "" && !outcome.includes('Share') && !outcome.includes('Link')
    })
    console.log('validOutcomes', validOutcomes)
    validOutcomes.forEach(outcome => {
      if (outcome.includes('Positive') || outcome.includes('Easy') || outcome.includes('Accepted Offer')) {
        outcomeString += `:white_check_mark: ${outcome}  `
      } else if (outcome.includes('Average') || outcome.includes('Neutral') || outcome.includes('Declined Offer')) {
        outcomeString += `:warning: ${outcome}  `
      } else if (outcome.includes('Negative') || outcome.includes('No Offer') || outcome.includes('Difficult')) {
        outcomeString += `:no_entry: ${outcome}  `
      }
    })
    console.log('outcomeString', outcomeString)
    return outcomeString
  },
  buildInterviewBlocks (interview) {
    console.log('building interview blocks for ' + interview.title + ' interview')
    let blocks = []
    const application = interview.application
    const review = interview.interview
    const author = interview.author
    const outcomes = helpers.formatInterviewOutcomes(interview.outcomes)
    blocks.push(
      {
        type: 'divider'
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*<https://www.glassdoor.com${review.url}|${interview.title.replace(/"/g, '')} Interview>*\n${outcomes}\n\n*Application*\n${application}\n\n*Interview*\n${review}`,
        },
        accessory: {
          type: 'image',
          image_url: helpers.getThumbUrl(interview.url),
          alt_text: 'brand logo'
        }
      }
    )
    blocks.push(
      {
        type: 'context',
        elements: [
          {
            type: 'plain_text',
            emoji: true,
            text: `${author}`
          },
          {
            type: 'plain_text',
            emoji: true,
            text: `${moment(interview.date).format('MMMM Do, YYYY')}`
          }
        ]
      }
    )
    return blocks
  },
  buildReviewBlocks (review) {
    let blocks = []
    const pros = helpers.getReviewContent(review.pros, 'Pros')
    const cons = helpers.getReviewContent(review.cons, 'Cons')
    const rating = helpers.parseRating(review.rating)
    const advice = helpers.getReviewContent(review.advice, 'Advice to Management')
    blocks.push(
      {
        type: 'divider'
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*<https://www.glassdoor.com${review.url}|${review.title.replace(/"/g, '')}>*\n${rating}\n\n*Pros*\n${pros}\n\n*Cons*\n${cons}`,
        },
        accessory: {
          type: 'image',
          image_url: helpers.getThumbUrl(review.url),
          alt_text: 'brand logo'
        }
      }
    )
    if (advice) {
      blocks.push(
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `\n\n*Advice to Management*\n${advice}`,
          }
        }
      )
    }
    blocks.push(
      {
        type: 'context',
        elements: [
          {
            type: 'plain_text',
            emoji: true,
            text: `${review.job}`
          },
          {
            type: 'plain_text',
            emoji: true,
            text: `${moment(review.date).format('MMMM Do, YYYY')}`
          }
        ]
      }
    )
    return blocks
  }
}

module.exports = {
  sendReviews (reviews) {
    return new Promise((resolve, reject) => {
      let blocks = [{
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'There are new glassdoor reviews'
        }
      }]
      
      for (const review of reviews) {
        if (review.type === 'interviews') {
          blocks = blocks.concat(helpers.buildInterviewBlocks(review))
        } else {
          blocks = blocks.concat(helpers.buildReviewBlocks(review))
        }
      }
      
      let options = {
        method: 'post',
        body: {
          text: ':wave: There are new Glassdoor reviews!',
          blocks: blocks
        },
        json: true,
        url: process.env.SLACK_HOOK_URL
      }
      request(options, function(err, response, body) {
        if (err) { console.log(err); return reject(err) }
        console.log('resp body', body)
        return resolve(body)
      })
      
    })
  }
}
