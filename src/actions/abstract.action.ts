import { Input } from "../commands/command.input";

export abstract class AbstractAction {
  public abstract handle(options?: Input[]): Promise<void>;
}
