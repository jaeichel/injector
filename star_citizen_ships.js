function colToArray(col) {
  return Array.prototype.slice.apply(col);
}

function collectItems() {
  const rows = colToArray(document.getElementsByClassName('row'));
  const items = rows.map(row => colToArray(row.getElementsByClassName('item'))).flat();
  const contents = items
    .filter(item => item.getElementsByClassName('title')[0])
    .filter(item => item.getElementsByClassName('kind')[0])
    .map(item => ({
      name: item.getElementsByClassName('title')[0].innerText,
      kind: item.getElementsByClassName('kind')[0].innerText,
    })).flat();
  const ships = contents.filter(item => item.kind === 'Ship');
  return ships.map(ship => ship.name);
}

function parseManufacturer(iconPath) {
  const names = [
    'Anvil',
    'Aegis',
    'Argo',
    'Aopoa',
    'Banu',
    'Consolidated',
    'Crusader',
    'Drake',
    'Esperia',
    'Kruger',
    'MISC',
    'Origin',
    'RSI',
    'Tumbril',
    'Vanduul',
  ];
  return names.filter(name => iconPath.includes(name))[0];
}

function findShip(searchName) {
  const uri = `https://robertsspaceindustries.com/pledge/ships?sort=store&search=${searchName}&itemType=ships`;
  let detailsUri;
  let shipId;
  return fetch(uri)
    .then(res => res.text())
    .then((text) => {
      const div = document.createElement('html');
      div.innerHTML = text;
      return div;
    })
    .then((div) => {
      const shipItem = div.getElementsByClassName('ship-item');
      if (shipItem.length > 0) {
        const ship = shipItem[0];
        shipId = ship.getAttribute('data-ship-id')
        detailsUri = ship.firstElementChild.firstElementChild.href;
        return fetch(detailsUri)
        .then(res => res.text())
        .then((text)  => {
          const div = document.createElement('html');
          div.innerHTML = text;
          return div;
        })
        .then(div => ({
          shipName: div.getElementsByClassName('main-view')[0].firstElementChild.firstElementChild.innerText,
          manufacturer: parseManufacturer(div.getElementsByClassName('headline')[0].firstElementChild.children[1].children[1].src),
          detailsUri,
          shipId,
          searchName,
        }))
        .catch(e => {
          console.error(searchName, uri, detailsUri, e);
          return undefined;
        });
      }
      return undefined;
    });
}

function findShipPermuteName(searchName) {
  const promises = []
  promises.push(findShip(searchName));
  
  let shortName = searchName;
  while (shortName.split(' ').length > 1) {
    shortName = shortName.split(' ').slice(1).join(' ');
    promises.push(findShip(shortName));
  }
  
  shortName = searchName;
  while (shortName.split(' ').length > 1) {
    shortName = shortName.split(' ').slice(0, -1).join(' ');
    promises.push(findShip(shortName));
  }

  return Promise.all(promises)
    .then(candidates => {
       validCandidates = candidates.filter(c => c);
      if (validCandidates.length > 0) {
        return validCandidates[0];
      } else {
        console.error(searchName, uri, detailsUri, 'count not find');
        return {
          searchName,
          error: 'could not find',
        };
      }
    });
}

window.ships = Promise.all(collectItems()
  .map(ship => findShipPermuteName(ship)))
  
