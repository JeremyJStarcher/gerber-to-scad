import { MyLibrary } from './MyLibrary';
import {exportToScad, unzipGerbers} from "./gerber-to-scad";
import * as Config from "./config";

console.log('See this in your browser console: Typescript Webpack Starter Launched');

const myLibrary = new MyLibrary();
const result = myLibrary.executeDependency();

console.log(`A random number ${result}`);

const displayConfig = () => {
  const configContainer = document.querySelector("#options-container") as HTMLDivElement;
  configContainer.classList.add('container');

  const names = Object.keys(Config.configOptions);

  names.forEach((configName) => {
    const opt = Config.configOptions[configName];

    const labelId = `label-${configName}`;
    const inputId = `input-${configName}`;

    const cont = document.createElement("div");
    cont.classList.add("row");

    const label = document.createElement("label");
    label.appendChild(document.createTextNode(opt.shortDesc));
    label.id = labelId;
    label.classList.add("col-6", "col-12-sm");
    cont.appendChild(label);

    switch (opt.type) {
      case Config.InputType.float:
        const input = document.createElement("input");
        input.type = "number";
        input.id = inputId;
        input.dataset.name = configName;
        label.htmlFor = inputId;
        input.classList.add("col-5", "col-11-sm");
        input.value = opt.value.toString();
        cont.appendChild(input);

        input.addEventListener("change", (event) => {
          const target = event.currentTarget as HTMLInputElement;
          opt.value = parseFloat(target.value);
        });
        break;
      case Config.InputType.integer:
        break;
      case Config.InputType.options:
        break;
      case Config.InputType.str:
        break;
      default:
        ((_: never): void => {})(opt);
    }

    configContainer.appendChild(cont);
  });
};


window.addEventListener("load", () => {
  const fileSelectorEl = document.querySelector("#file-input") as HTMLInputElement;
  displayConfig();

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
      const layers =  await unzipGerbers(zipFile as ArrayBuffer);

      const text = await exportToScad(layers);

      const out = document.getElementById("scad-out") as HTMLTextAreaElement;
      out.value = text;
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
