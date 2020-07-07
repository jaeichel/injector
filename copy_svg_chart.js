const createCopyMenuItem = (parentDiv) => {
  const scatterDiv = parentDiv.getElementsByTagName('svg')[0];
  const svgSerialized = unescape(encodeURIComponent(new XMLSerializer().serializeToString(scatterDiv)));
  const encodedData = 'data:image/svg+xml;base64,' + window.btoa(svgSerialized);
  
  const highchartsMenu = parentDiv.getElementsByClassName('highcharts-menu')[0];
  const copyMenuItem = highchartsMenu.children[0].cloneNode();
  copyMenuItem.innerText = 'Copy SVG';
  copyMenuItem.onclick = () => {
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
 
 waitFunc = () => {
 	const parentDiv = document.getElementById("sa_tmc_scatter");
 	if (parentDiv) {
 		const highchartsMenuButton = parentDiv.getElementsByClassName('highcharts-contextbutton')[0];
 		const createFunc = () => {
 			createCopyMenuItem(parentDiv);
 			highchartsMenuButton.removeEventListener('click', createFunc);
 		};
 		highchartsMenuButton.addEventListener('click', createFunc);
 	}
 };
 $(document).ready(waitFunc);
