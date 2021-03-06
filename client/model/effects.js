const mapLimit = require('async/mapLimit')

const db = require('../db')
const maps = require('../data/maps')
const heroes = require('../data/heroes')

module.exports = {
  fetchAllCounters: function (data, state, send, done) {
    var combos = []
    heroes.forEach(function (target) {
      heroes.forEach(function (agent) {
        if (agent.name === target.name) return
        combos.push({agent: agent.name, target: target.name})
      })
    })

    mapLimit(combos, 64, spy, function (err, results) {
      if (err) return done(err)
      send('setCounterRatings', results, done)
    })

    function spy (combo, cb) {
      getCounterCombo(combo, function (err, res) {
        if (err) return cb(err)
        cb(null, res)
        send('setCounterRating', res, function () {})
      })
    }
  },

  fetchAllSynergy: function (data, state, send, done) {
    var combos = []
    heroes.forEach(function (target) {
      heroes.forEach(function (agent) {
        if (agent.name === target.name) return
        combos.push({agent: agent.name, target: target.name})
      })
    })

    mapLimit(combos, 64, spy, function (err, results) {
      if (err) return done(err)
      send('setSynergyRatings', results, done)
    })

    function spy (combo, cb) {
      getSynergyCombo(combo, function (err, res) {
        if (err) return cb(err)
        cb(null, res)
        send('setSynergyRating', res, function () {})
      })
    }
  },

  fetchAllMaps: function (data, state, send, done) {
    var combos = []
    maps.forEach(function (target) {
      heroes.forEach(function (agent) {
        combos.push({agent: agent.name, target: target.name})
      })
    })

    mapLimit(combos, 64, spy, function (err, results) {
      if (err) return done(err)
      send('setMapRatings', results, done)
    })

    function spy (combo, cb) {
      getMapCombo(combo, function (err, res) {
        if (err) return cb(err)
        cb(null, res)
        send('setMapRating', res, function () {})
      })
    }
  },

  rateCounterCombo: function (data, state, send, done) {
    send('setCounterRating', data, function () { })

    db.setCounterRating(data.agent, data.target, data.rating, function (err) {
      if (err) return done(err)
      send('cancelEditCombo', null, done)
    })
  },

  rateSynergyCombo: function (data, state, send, done) {
    send('setSynergyRating', data, function () { })

    db.setSynergyRating(data.agent, data.target, data.rating, function (err) {
      if (err) return done(err)
      send('cancelEditCombo', null, done)
    })
  },

  rateMapCombo: function (data, state, send, done) {
    send('setMapRating', data, function () { })

    db.setMapRating(data.agent, data.target, data.rating, function (err) {
      if (err) return done(err)
      send('cancelEditCombo', null, done)
    })
  }
}

function getCounterCombo (combo, cb) {
  var agent = combo.agent
  var target = combo.target

  db.getCounterRating(agent, target, function (err, rating) {
    if (err) return cb(err)

    cb(null, {
      agent: agent,
      target: target,
      rating: (rating || {}).rating,
      localRating: (rating || {}).localRating,
      dist: (rating || {}).dist,
      count: (rating || {}).nVotes
    })
  })
}

function getSynergyCombo (combo, cb) {
  var agent = combo.agent
  var target = combo.target

  db.getSynergyRating(agent, target, function (err, rating) {
    if (err) return cb(err)

    cb(null, {
      agent: agent,
      target: target,
      rating: (rating || {}).rating,
      localRating: (rating || {}).localRating,
      dist: (rating || {}).dist,
      count: (rating || {}).nVotes
    })
  })
}

function getMapCombo (combo, cb) {
  var agent = combo.agent
  var target = combo.target

  db.getMapRating(agent, target, function (err, rating) {
    if (err) return cb(err)

    cb(null, {
      agent: agent,
      target: target,
      rating: (rating || {}).rating,
      localRating: (rating || {}).localRating,
      dist: (rating || {}).dist,
      count: (rating || {}).nVotes
    })
  })
}
