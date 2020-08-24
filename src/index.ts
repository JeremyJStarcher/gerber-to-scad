import { MyLibrary } from './MyLibrary';
import {LAYER_TYPE, exportToScad, unzipGerbers} from "./gerber-to-scad";

console.log('See this in your browser console: Typescript Webpack Starter Launched');

const myLibrary = new MyLibrary();
const result = myLibrary.executeDependency();

console.log(`A random number ${result}`);

window.addEventListener("load", () => {
  const fileSelectorEl = document.querySelector("#file-input") as HTMLInputElement;

  document.querySelector("#read-button").addEventListener('click', async function () {
    if (fileSelectorEl.files.length === 0) {
      alert('Error : No file selected');
      return;
    }

    // first file selected by user
    let file = fileSelectorEl.files[0];

    // perform validation on file type & size if required

    let reader = new FileReader();

    reader.addEventListener('loadstart', function () {
      console.log('File reading started');
    });

    reader.addEventListener('load', async function (e) {
      // contents of file in variable
      let zipFile = e.target.result;
      const layers = await unzipGerbers(zipFile as ArrayBuffer);

      const layersToRender = layers.filter(l => l.layerType !== LAYER_TYPE.IGNORED);
      const text = await exportToScad(layersToRender);

      alert(text);
    });

    reader.addEventListener('error', function () {
      alert('Error : Failed to read file');
    });

    reader.addEventListener('progress', function (e) {
      if (e.lengthComputable) {
        let percentRead = Math.floor((e.loaded / e.total) * 100);
        console.log(percentRead + '% read');
      }
    });

    reader.readAsBinaryString(file);
  });

});
