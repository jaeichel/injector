// https://www.guggenheim.org/artwork/*

function getArtData() {
  return {
    title: document.getElementsByTagName('article')[0].children[0].children[2].children[1].children[1].children[1].innerText,
    description: document.getElementsByTagName('figure')[0].children[0].alt,
    src: `${document.getElementsByTagName('figure')[0].children[0].attributes['proxy-src'].value}?w=1920`
  };
}

function downloadJpeg(src) {
  return fetch(src)
    .then(res => res.arrayBuffer())
    .then((buffer) => {
      const base64Flag = 'data:image/jpeg;base64,';
      const imageStr = arrayBufferToBase64(buffer);
      const imageData = `${base64Flag}${imageStr}`;
      return imageData;
    });
}

function arrayBufferToBase64(buffer) {
  var binary = '';
  var bytes = [].slice.call(new Uint8Array(buffer));
  bytes.forEach((b) => binary += String.fromCharCode(b));
  return window.btoa(binary);
};

function insertDownloadJpegLink() {
  const artData = getArtData();
  return downloadJpeg(artData.src)
    .then((imageData) => {
      const link = document.createElement('a');
      link.href = imageData;
      link.innerHTML = '<div>download</div>';
      link.download = `${artData.title}.jpg`;
      document.getElementsByTagName('article')[0].children[0].children[2].children[0].appendChild(link);
    });
}

if (document.getElementsByTagName('figure').length > 0) {
  insertDownloadJpegLink();
}
