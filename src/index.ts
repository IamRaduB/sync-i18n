import { Command } from 'commander';
import { FileService } from './services/file.service';
import { LoggerService } from './services/logger.service';
import { LOGGER, NAME } from './config/constants';
import { ValidateCommand } from './commands/validate.command';
import { UtilService } from './services/util.service';

class SyncTranslations {
  private program: Command;

  constructor(private version: string, private fs: FileService, private log: LoggerService, private utilService: UtilService) {
    this.program = new Command(NAME) as Command;
    this.setup();
    this.run();
  }

  setup() {
    const validateCommand = new ValidateCommand(this.program, this.log.child(LOGGER.validate), this.fs, this.utilService);

    this.program
      .version(this.version);
    this.program.description('Sync your translation files')
      .option('-d, --debug', 'Display verbose logs');

    this.program.addCommand(validateCommand.getCommand());

    this.log
      .setContextVisible(false)
      .info(NAME, 'Version: ', this.version)
      .setContextVisible(true);
  }

  run() {
    this.program.parseAsync(process.argv);
    this.log.setVerbose(this.program.debug === true);
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
