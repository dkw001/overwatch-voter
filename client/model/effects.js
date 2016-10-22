const mapLimit = require('async/mapLimit')

const db = require('../db')
const heroes = require('../data/heroes')

module.exports = {
  fetchAll: function (data, state, send, done) {
    var combos = []
    heroes.forEach(function (agHero) {
      heroes.forEach(function (asHero) {
        if (asHero.name === agHero.name) return
        combos.push({asHero: asHero.name, agHero: agHero.name})
      })
    })

    mapLimit(combos, 64, spy, function (err, results) {
      if (err) return done(err)
      send('setRatings', results, done)
    })

    function spy (combo, cb) {
      getCombo(combo, function (err, res) {
        if (err) return cb(err)
        cb(null, res)
        send('setRating', res, function () {})
      })
    }
  },

  rateCombo: function (data, state, send, done) {
    send('setRating', data, function () { })

    db.setRating(data.asHero, data.againstHero, data.rating, function (err) {
      if (err) return done(err)
      send('cancelEditCombo', null, done)
    })
  }
}

function getCombo (combo, cb) {
  var asHero = combo.asHero
  var agHero = combo.agHero

  db.getRating(asHero, agHero, function (err, rating) {
    if (err) return cb(err)

    cb(null, {
      asHero: asHero,
      againstHero: agHero,
      rating: (rating || {}).rating,
      count: (rating || {}).nVotes
    })
  })
}