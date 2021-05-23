import { Command } from 'commander';

export interface AppCommand {
  setup: () => void;
  getCommand: () => Command;
  setVerbose: (state: boolean) => void;
}
