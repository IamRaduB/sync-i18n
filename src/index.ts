import { Command } from 'commander';
import { FileService } from './services/file.service';
import { LoggerService } from './services/logger.service';
import { LOGGER, NAME } from './config/constants';
import { ValidateCommand } from './commands/validate.command';
import { UtilService } from './services/util.service';
import { AddTranslationCommand } from './commands/add-translation.command';

class SyncTranslations {
  private program: Command;

  constructor(private version: string, private fs: FileService, private log: LoggerService, private utilService: UtilService) {
    this.program = new Command(NAME) as Command;
    this.setup();
    this.run();
  }

  setup() {
    const validateCommand = new ValidateCommand(this.program, this.log.child(LOGGER.validate), this.fs, this.utilService);
    const addCommand = new AddTranslationCommand(this.program, this.log.child(LOGGER.validate), this.fs, this.utilService);

    this.program
      .version(this.version);
    this.program.description('Sync your translation files')
      .option('-d, --debug', 'Display verbose logs')
      .option('--dir <dir>', 'Custom directory that holds logs. Defaults to "./i18n"');

    this.program.addCommand(validateCommand.getCommand());
    this.program.addCommand(addCommand.getCommand());

    this.log
      .setContextVisible(false)
      .info(NAME, 'Version: ', this.version)
      .setContextVisible(true);
  }

  // TODO: Add config file support that reads the directory or receives it as a parameter on the main command
  // sync <directory ./i18n> [add|validate]
  run() {
    this.program.parseAsync(process.argv)
      .then(() => {
        this.log.setVerbose(this.program.debug === true);
      });
  }
}

FileService.getVersion()
  .then((version: string) => {
    const utilService = new UtilService();
    const mainLog = new LoggerService(LOGGER.main);
    mainLog.setVerbose(true);
    const fsLog = mainLog.child(LOGGER.fs);
    new SyncTranslations(version, new FileService(fsLog), mainLog, utilService);
  });
