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
    'Origin',
  ];
  return names.filter(name => iconPath.includes(name))[0];
}

function findShip(name) {
  const uri = `https://robertsspaceindustries.com/pledge/ships?  sort=store&search=${name}&itemType=ships`;
  let detailsUri;
  let shipId;
  return fetch('https://robertsspaceindustries.com/pledge/ships?  sort=store&search=890%20jump&itemType=ships')
    .then(res => res.text())
    .then((text) => {
      const div = document.createElement('html');
      div.innerHTML = text;
      return div;
    })
    .then((div) => {
      const ship = div.getElementsByClassName('ship-item')[0];
      shipId = ship.getAttribute('data-ship-id')
      detailsUri = ship.firstElementChild.firstElementChild.href;
      return fetch(detailsUri);
    })
    .then(res => res.text())
    .then((text)  => {
      const div = document.createElement('html');
      div.innerHTML = text;
      return div;
    })
    .then(div => ({
      name: document.getElementsByClassName('main-view')[0].firstElementChild.firstElementChild.innerText,
      manufacturer: parseManufacturer(div.getElementsByClassName('headline')[0].firstElementChild.children[1].children[1].src),
      detailsUri,
      shipId,
    }));
}



ships = await Promise.all(collectItems()
  .map(ship => findShip(ship)))
  
