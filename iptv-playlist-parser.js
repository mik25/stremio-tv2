const Parser = {}

Parser.parse = content => {
  let playlist = {
    header: {},
    items: []
  }

  let manifest = content.split(/(?=#EXTINF)/).map(l => l.trim())
  const lines = content.split('\n').map(l => l.trim())
  let cursor = 0
  var i = 0
  const defaults = require('./config.js')
  const firstLine = manifest.shift()

  if (!firstLine || !/#EXTM3U/.test(firstLine)) throw new Error('Playlist is not valid')

  playlist.header = parseHeader(firstLine)
 
  for (let stream of manifest) {
    const item = {
      id: defaults.prefix + i++,
      name: stream.getName(),
      logo: stream.getAttribute('tvg-logo='),
      group: stream.getAttribute('group-title='),
      url: stream.getURL(),
      raw: stream,
      line: indexOf(lines, stream)
      }

    playlist.items.push(item)
  }

  function indexOf(lines, stream) {
    const line = stream.split('\n')[0]
    const index = lines.indexOf(line.trim(), cursor)
    cursor = index + 1

    return index + 1
  }

  return playlist
}

function parseHeader(line) {
  const supportedAttrs = ['x-tvg-url', 'url-tvg']

  let attrs = {}
  for (let attrName of supportedAttrs) {
    const tvgUrl = line.getAttribute(attrName)
    if (tvgUrl) {
      attrs[attrName] = tvgUrl
    }
  }

  return {
    attrs,
    raw: line
  }
}

function getFullUrl(url) {
  const supportedTags = ['#EXTVLCOPT', '#EXTINF', '#EXTGRP']
  const last = url
    .split('\n')
    .filter(l => l)
    .map(l => l.trim())
    .filter(l => {
      return supportedTags.every(t => !l.startsWith(t))
    })
    .shift()
  return last || ''
}

String.prototype.getAttribute = function (name) {
  let regex = new RegExp(name + '"(.*?)"', 'gi')
  let match = regex.exec(this)

  return match && match[1] ? match[1] : ''
}

String.prototype.getName = function () {
  let name = this.split(/[\r\n]+/)
    .shift()
    .split(',')
    .pop()

  return name || ''
}

String.prototype.getURL = function () {
  const last = getFullUrl(this).split('|')[0]
  return last || ''
}

module.exports = Parser
