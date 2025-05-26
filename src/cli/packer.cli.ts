import {version} from '../../package.json'
import {cac, CAC} from "cac";
import {PACKER_NAME} from "../constants.ts";
import {logger} from "../logger.ts";

export class PackerCli {
  cli: CAC = cac(PACKER_NAME).version(version).help();
  constructor() {
    const landingMessage = `🔥 ${PACKER_NAME} v${version}\n`;
    logger.greet(landingMessage);
  }
}
