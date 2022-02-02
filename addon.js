const { addonBuilder } = require("stremio-addon-sdk");
const parser = require ('./iptv-playlist-parser.js')
const fs = require('fs')
const playlist = fs.readFileSync('./new.m3u', 'utf8');
const defaults = require('./config.js')
const list = parser.parse(playlist)
const convertArrayToObject = (array, key) => {
  const initialValue = {};
  return array.reduce((obj, item) => {
    return {
      ...obj,
      [item[key]]: item,
    };
  }, initialValue);
};
const dataset = 
convertArrayToObject(
    list.items,
    'id',
  ) 
const grouping = list.items
let group = grouping.map(({ group }) => group)
  .filter(function(item, index, group) {
    return group.indexOf(item, index + 1) === -1;
  })

const catalogs = []
for (let key in group) {
		catalogs.push({
		id: group[key],
		name: group[key],
		type: "tv",
	})
	}



const manifest = { 
    "id": defaults.name,
    "version": "1.0.0",
    "name": defaults.name,
    "icon": defaults.icon,
    "description": defaults.description,
    "resources": ["catalog","stream"],
    "types": ["tv"], 
    catalogs

 };

const builder = new addonBuilder(manifest);


builder.defineStreamHandler(function(args) {
    if (dataset[args.id]) {
        return Promise.resolve({ streams: [dataset[args.id]] });
    } else {
        return Promise.resolve({ streams: [] });
    }
})

const generateMetaPreview = function(value, key) {
    const iptvId = key.split(":")[0]
    return {
        id: iptvId,
        type: 'tv',
        name: value.name,
        categorie: value.group,
        background: value.logo,
        logo: value.logo,
        poster: value.logo,
        posterShape: 'landscape',
        }
}

builder.defineCatalogHandler(function(args)  {
     const metas = Object.entries(dataset)
    .filter(([_, value]) => value.group === args.id)
	.map(([key, value]) => generateMetaPreview(value, key))

    return Promise.resolve({ metas: metas })


})

module.exports = builder.getInterface()
