import { Command } from 'commander';
import { FileService } from './services/file.service';
import { LoggerService } from './services/logger.service';
import { LOGGER, NAME } from './config/constants';
import { ValidateCommand } from './commands/validate.command';
import { UtilService } from './services/util.service';
import { AddTranslationCommand } from './commands/add-translation.command';
import { SortCommand } from './commands/sort.command';
import { AppCommand } from './util/app.command';

export class SyncTranslations {
  private program: Command;

  private appCommands: AppCommand[];

  constructor(
    private version: string,
    private fs: FileService,
    private log: LoggerService,
    private utilService: UtilService,
  ) {
    this.program = new Command(NAME) as Command;
    this.appCommands = [];
    this.setup();
  }

  setup() {
    this.appCommands.push(
      new ValidateCommand(this.program, this.log.child(LOGGER.validate), this.fs, this.utilService),
      new AddTranslationCommand(this.program, this.log.child(LOGGER.add), this.fs, this.utilService),
      new SortCommand(this.program, this.log.child(LOGGER.sort), this.fs),
    );

    this.program.version(this.version);
    this.program
      .description('Sync your translation files')
      .option('-d, --debug', 'Display verbose logs', false)
      .option('--dir <dir>', 'Custom directory that holds language files', './i18n');

    this.appCommands.forEach((appCommand) => this.program.addCommand(appCommand.getCommand()));

    this.log.title(NAME, `v${this.version}`);
  }

  // sync <dir ./i18n> [add|validate]
  async run() {
    await this.program.parseAsync(process.argv);
    this.log.setVerbose(this.program.debug === true);
    this.appCommands.forEach((appCommand) => appCommand.setVerbose(this.program.debug === true));
    await this.validateDir(this.program.dir);
  }

  async validateDir(dir: string) {
    try {
      await this.fs.getLanguageFiles(dir);
    } catch (e) {
      this.log.error(`Path ${dir} to language files is invalid`, e);
    }
  }
}
