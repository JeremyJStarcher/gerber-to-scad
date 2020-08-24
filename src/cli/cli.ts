import {LAYER_TYPE, exportToScad, unzipGerbers} from "../gerber-to-scad";
import fs from "fs";
import assert from "assert";

const TEST_FILE_DIR = "./src/cli/sample";

async function  main() {
  console.log("Reading file");
  const zipFile = fs.readFileSync(`${TEST_FILE_DIR}/arduino-as-isp.zip`);
  console.log("Unzipping file");
  const layers = await unzipGerbers(zipFile);
  console.log(`${layers.length} files found.`);
  assert(layers.length === 11, "Right number of layers found");

  const layersToRender = layers.filter(l => l.layerType !== LAYER_TYPE.IGNORED);

  const text = await exportToScad(layersToRender);
  const outputFileName = `${TEST_FILE_DIR}/project.scad`;
  fs.writeFileSync(outputFileName, text);
  console.log(`Output file written to: ${outputFileName}`)
}

main();