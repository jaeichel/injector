function colToArray(col) {
  return Array.prototype.slice.apply(col);
}

function collectItems() {
  const pledgeNames = colToArray(document.getElementsByClassName('js-pledge-name'));
  const rows = colToArray(document.getElementsByClassName('row'));
  for (let i = 0; i < rows.length; ++i) {
    const rowItems = rows[i].getElementsByClassName('item');
    for (let j = 0; j < rowItems.length; ++j) {
      rowItems[j].setAttribute('pledgeName', pledgeNames[i].value);
    }
  }
  
  const items = rows.map(row => colToArray(row.getElementsByClassName('item'))).flat();
  const contents = items
    .filter(item => item.getElementsByClassName('title')[0])
    .filter(item => item.getElementsByClassName('kind')[0])
    .map(item => ({
      name: item.getElementsByClassName('title')[0].innerText,
      kind: item.getElementsByClassName('kind')[0].innerText,
      pledgeName: item.getAttribute('pledgeName'),
    })).flat();
  const ships = contents.filter(item => item.kind === 'Ship');
  return ships;
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

function findShip(searchName, pledgeName) {
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
          pledgeName,
        }))
        .catch(e => {
          console.error(searchName, uri, detailsUri, e);
          return undefined;
        });
      }
      return undefined;
    });
}

function findShipPermuteName(ship) {
  const searchName = ship.name;
  const pledgeName = ship.pledgeName;
  return findShip(searchName, pledgeName)
    .then(ship => {
        if (ship) {
          return ship;
        }
    
        const promises = [];
        let shortName = searchName;
        while (shortName.split(' ').length > 1) {
          shortName = shortName.split(' ').slice(1).join(' ');
          promises.push(findShip(shortName, pledgeName));

          if (shortName.split(' ').length > 1) {
            const shortNameB = shortName.split(' ').slice(0, -1).join(' ');
            promises.push(findShip(shortNameB, pledgeName));
          }
        }

        shortName = searchName;
        while (shortName.split(' ').length > 1) {
          shortName = shortName.split(' ').slice(0, -1).join(' ');
          promises.push(findShip(shortName, pledgeName));

          if (shortName.split(' ').length > 1) {
            const shortNameB = shortName.split(' ').slice(1).join(' ');
            promises.push(findShip(shortNameB, pledgeName));
          }
        }

        return Promise.all(promises)
          .then(candidates => {
             validCandidates = candidates.filter(c => c);
            if (validCandidates.length > 0) {
              return validCandidates[0];
            } else {
              console.error(searchName, 'count not find');
              return {
                searchName,
                error: 'could not find',
              };
            }
          });
    });
}

window.shipPromises = Promise.all(collectItems()
  .map(ship => findShipPermuteName(ship)));

