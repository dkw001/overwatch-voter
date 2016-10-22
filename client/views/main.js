const get = require('lodash/get')
const html = require('choo/html')

const maps = require('../data/maps')
const heroes = require('../data/heroes')

var fetched = false
const mainView = module.exports = function (state, prev, send) {
  if (!fetched) {
    fetched = true
    send('fetchAll')
  }

  return render()

  function render () {
    return html`
      <main class="cf pa3 pa4-m pa5-l mw9 center">
        ${ state.loading ? renderLoading() : '' }

        ${ state.editTarget
          ? renderEdit()
          : html`
            <div>
              ${ renderHeader() }
              ${ renderTable() }
            </div>
          `
        }
      </main>
    `
  }

  function renderLoading () { return html`<div class='spinner'></div>` }

  function renderHeader () {
    return html`
      <div>
        <div class='fl w-25 pa2'></div>
        <div class="fl w-75 pa2">
          <p class="f6">
            Overwatch Counters Guide
          </p>
          <h1 class="f2 f1-l lh-title mt0 mb3">
            Choose the right hero for the job.
          </h1>
        </div>

      </div>
    `
  }

  function renderEdit () {
    var asHero = state.editTarget.asHero
    var againstHero = state.editTarget.againstHero
    var letterStyle = "f1 link grow b no-underline dib ph2 pv1"

    function rate (rating) {
      send('rateCombo', {
        asHero: asHero,
        againstHero: againstHero,
        rating: rating
      })
    }

    return html`
      <div class='tc'>
        <div class='f1 center'>
          How would you rate <strong>${asHero}'s</strong> ability to counter <strong>${againstHero}</strong>?
        </div>

        <section class="pa3 pa4-m pa5-l center">
          <a
            onclick=${(e) => rate(5)}
            class=${'hover-green ' + letterStyle} >
            A
          </a>
          <a
            onclick=${(e) => rate(4)}
            class=${'hover-dark-green ' + letterStyle} >
            B
          </a>
          <a
            onclick=${(e) => rate(3)}
            class=${'hover-gray ' + letterStyle} >
            C
          </a>
          <a
            onclick=${(e) => rate(2)}
            class=${'hover-dark-red ' + letterStyle} >
            D
          </a>
          <a
            onclick=${(e) => rate(1)}
            class=${'hover-red ' + letterStyle} >
            F
          </a>
        </section>

        <section class="pa3 pa4-m pa5-l center">
          <a
            onclick=${(e) => send('cancelEditCombo')}
            class="f3 gray dim">
            Cancel
          </a>
        </section>
      </div>
    `
  }

  function renderTable () {
    return html`
      <div class=''>
        <article class='fl w-25 pa2 pt6'>
          <h3 class='f3'>How to read this chart:</h3>
          <p class='f6 measure-narrow 1h-copy'>
            First, find the hero you'd like to counter along the left edge. Then, note the strength rating of each column's hero in that row.
          </p>
          <p class='f6 measure-narrow 1h-copy'>
            For example, if you'd like to counter Bastion, find the 7th row, and then note that Genji has an "A" rating in the first column.
          </p>
        </article>

        <div class='fl w-75 pa2'>
          <table class='table table-header-rotated'>
            <thead>
              <tr>
                <th></th>
                ${heroes.map( h => html`
                  <th class='rotate'>
                    <div><span>${h.name}</span></div>
                  </th>
                ` )}
              </tr>
            </thead>
            <tbody>
              ${heroes.map(renderRow)}
            </tbody>
          </table>
        </div>
      </div>
    `
  }

  function renderRow (agHero) {
    return html`
      <tr>
        <th class='row-header'>${agHero.name}</th>
          ${heroes.map( (asHero, j) => {
            return renderCell(asHero, agHero)
          } )}
      </tr>
    `
  }

  function renderCell (asHero, agHero) {
    var value = '?'
    var style = ''
    if (agHero.name === asHero.name) return html`<td></td>`

    var combo = {
      asHero: asHero.name,
      againstHero: agHero.name
    }

    var rating = get(state.heroCounters, [asHero.name, agHero.name])

    if (rating) {
      value = {5: 'A', 4: 'B', 3: 'C', 2: 'D', 1: 'F', undefined: '?'}[rating.rating]
      style = {
        5: 'white bg-green',
        4: 'light-gray bg-dark-green',
        3: 'light-silver bg-dark-gray',
        2: 'light-gray bg-dark-red',
        1: 'white bg-red',
        undefined: 'light-silver bg-dark-gray',
      }[rating.rating]
    }

    var nVotes = (rating || {}).count || 0

    return html`
      <td
        onclick=${(e) => send('startEditCombo', combo)}
        style='cursor: pointer'
        title='${asHero.name} countering ${agHero.name} (${nVotes} votes)'
        class=${'dim ' + style} >
        ${value}
      </td>
    `
  }
}
