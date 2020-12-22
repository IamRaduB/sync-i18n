import { Command } from 'commander';
import { FileService } from './services/file.service';
import { LoggerService } from './services/logger.service';
import { LOGGER, NAME } from './config/constants';
import { ValidateCommand } from './commands/validate.command';
import { UtilService } from './services/util.service';
import { AddTranslationCommand } from './commands/add-translation.command';

export class SyncTranslations {
  private program: Command;

  constructor(private version: string, private fs: FileService, private log: LoggerService, private utilService: UtilService) {
    this.program = new Command(NAME) as Command;
    this.setup();
    this.run();
  }

  setup() {
    const validateCommand = new ValidateCommand(this.program, this.log.child(LOGGER.validate), this.fs, this.utilService);
    const addCommand = new AddTranslationCommand(this.program, this.log.child(LOGGER.add), this.fs, this.utilService);

    this.program
      .version(this.version);
    this.program.description('Sync your translation files')
      .option('-d, --debug', 'Display verbose logs')
      .option('--dir <dir>', 'Custom directory that holds language files. Defaults to "./i18n"');

    this.program.addCommand(validateCommand.getCommand());
    this.program.addCommand(addCommand.getCommand());

    this.log.title(NAME, `v${this.version}`);
  }

  // sync <dir ./i18n> [add|validate]
  async run() {
    await this.program.parseAsync(process.argv);
    this.log.setVerbose(this.program.debug === true);
    await this.validateDir(this.program.dir);
  }

  async validateDir(dir: string) {
    try {
      await this.fs.getLanguageFiles(dir);
    } catch (e) {
      this.log.error(`Path ${dir} to language files is invalid`, e)
    }
  }
}

FileService.getVersion()
  .then((version: string) => {
    const utilService = new UtilService();
    const mainLog = new LoggerService(LOGGER.main);
    const fsLog = mainLog.child(LOGGER.fs);
    new SyncTranslations(version, new FileService(fsLog), mainLog, utilService);
  });
