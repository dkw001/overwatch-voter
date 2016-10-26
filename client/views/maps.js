const html = require('choo/html')
const xtend = require('xtend')

const renderEdit = require('./edit')
const renderTable = require('./table')
const renderHeader = require('./header')
const renderSearch = require('./search')
const renderLoading = require('./loading')
const renderInstructions = require('./instructions')
const renderDistribution = require('./distribution')

var fetched = false
module.exports = function (state, prev, send) {
  if (!fetched) {
    fetched = true
    send('fetchAllMaps')
  }

  var highlight = state.highlight || {}
  var combo = xtend(highlight, {
    agent: highlight.agent,
    target: highlight.target
  })

  var tableOpts = {
    agents: state.sortedMapHeroes,
    targets: state.filteredMaps,
    combos: state.heroMaps,
    onSearch: search,
    onRate: (combo) => send('startEditCombo', combo),
    onHighlight: (combo) => send('setHighlight', combo)
  }

  return render()

  function render () {
    return html`
      <main class="cf pa3 pa4-m pa5-l mw9 center">
        ${state.loading ? renderLoading() : ''}

        ${edit(state, send)}
        ${renderHeader()}

        <div>
          <div class='fl w-25 pa2 pt6 light-gray'>
            ${renderInstructions(instructions())}
            ${renderSearch(state.searchTerm, search)}
            ${renderDistribution(combo)}
          </div>

          <div class='fl w-75 pa2'>
            ${renderTable(tableOpts, state, send)}
          </div>
        </div>

      </main>
    `
  }

  function search (term) { send('setSearchTerm', term) }
}

function edit (state, send) {
  if (!state.editTarget) return ''

  var agent = state.editTarget.agent
  var target = state.editTarget.target

  return renderEdit(agent, target, 'on', function (rating) {
    if (!rating) return send('cancelEditCombo')

    send('rateMapCombo', {
      agent: rating.agent,
      target: rating.target,
      rating: rating.rating
    })
  })
}

function instructions () {
  return [
    `First, find the map you'd like to play along the left edge. Then, note the strength rating of each column's hero in that row.`,
    `For example, if you'd like to play Temple of Anubis - Attack, find the 4th row, and then note that Ana has an "A" rating in her column.`
  ]
}
