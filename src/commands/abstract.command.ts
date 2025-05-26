import {AbstractAction} from '../actions/abstract.action';
import {PackerCli} from "../cli/packer.cli.ts";

export abstract class AbstractCommand {
  constructor(protected action: AbstractAction) {
  }

  public abstract load(packerCli: PackerCli): void;
}
