const createCopySvgMenuItem = (parentDiv) => {
  const highchartsMenu = parentDiv.getElementsByClassName('highcharts-menu')[0];
  const copyMenuItem = highchartsMenu.children[0].cloneNode();
  copyMenuItem.innerText = 'Copy SVG';
  copyMenuItem.onclick = () => {
  	const scatterDiv = parentDiv.getElementsByTagName('svg')[0];
	const svgSerialized = unescape(encodeURIComponent(new XMLSerializer().serializeToString(scatterDiv)));
	const encodedData = 'data:image/svg+xml;base64,' + window.btoa(svgSerialized);
  
    const byteCharacters = atob(window.btoa(encodedData));
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {type: 'text/plain'});

    navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
  };
  copyMenuItem.onmouseenter = () => {
    copyMenuItem.style.background = 'rgb(51, 92, 173)';
    copyMenuItem.style.color = 'rgb(255, 255, 255)';
  };
  copyMenuItem.onmouseleave = () => {
    copyMenuItem.style.background = 'rgb(255, 255, 255)';
    copyMenuItem.style.color = 'rgb(51, 51, 51)';
  };
  highchartsMenu.appendChild(copyMenuItem);
 };
 
 function dataURItoBlob(dataURI) {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  var byteString = atob(dataURI.split(',')[1]);

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length);

  // create a view into the buffer
  var ia = new Uint8Array(ab);

  // set the bytes of the buffer to the correct values
  for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
  }

  // write the ArrayBuffer to a blob, and you're done
  var blob = new Blob([ab], {type: mimeString});
  return blob;

}
 
 const createCopyPngMenuItem = (parentDiv) => {
  const highchartsMenu = parentDiv.getElementsByClassName('highcharts-menu')[0];
  const copyMenuItem = highchartsMenu.children[0].cloneNode();
  copyMenuItem.innerText = 'Copy PNG';
  copyMenuItem.onclick = () => {
  	const scatterDiv = parentDiv.getElementsByTagName('svg')[0];
  	const svgSerialized = new XMLSerializer().serializeToString(scatterDiv);
  	
  	const canvas = document.createElement('canvas');
  	canvas.width = scatterDiv.width;
  	canvas.height = scatterDiv.height;
  	parentDiv.appendChild(canvas);
  	const ctx = canvas.getContext('2d');
  	const v = canvg.Canvg.fromString(ctx, svgSerialized);
  	v.render().then(() => {
  		const encodedData = canvas.toDataURL("image/png");
	    const blob = dataURItoBlob(encodedData);
	
	    navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
	    parentDiv.removeChild(canvas);
  	});
  };
  copyMenuItem.onmouseenter = () => {
    copyMenuItem.style.background = 'rgb(51, 92, 173)';
    copyMenuItem.style.color = 'rgb(255, 255, 255)';
  };
  copyMenuItem.onmouseleave = () => {
    copyMenuItem.style.background = 'rgb(255, 255, 255)';
    copyMenuItem.style.color = 'rgb(51, 51, 51)';
  };
  highchartsMenu.appendChild(copyMenuItem);
 };
 	
 
 waitFunc = () => {
 	const parentDiv = document.getElementById("sa_tmc_scatter");
 	if (parentDiv) {
 		const highchartsMenuButton = parentDiv.getElementsByClassName('highcharts-contextbutton')[0];
 		const createFunc = () => {
 			createCopyPngMenuItem(parentDiv);
 			// createCopySvgMenuItem(parentDiv);
 			highchartsMenuButton.removeEventListener('click', createFunc);
 		};
 		highchartsMenuButton.addEventListener('click', createFunc);
 	}
 };
 $(document).ready(waitFunc);
