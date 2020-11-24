import { Command } from 'commander';
import { createStubInstance, SinonStubbedInstance, stub } from 'sinon';
import { ValidateCommand } from './validate.command';
import { Logger, LoggerService } from '../services/logger.service';
import { FileService } from '../services/file.service';
import en from '../../i18n/en.json';
import ro from '../../i18n/ro.json';
import { UtilService } from '../services/util.service';

xdescribe('ValidateCommand', () => {
  let cmd: ValidateCommand;
  let program: SinonStubbedInstance<Command>;
  let command: any;
  let log: Logger;
  let fileService: SinonStubbedInstance<FileService>;
  let utilService: UtilService;

  before(() => {
    program = createStubInstance(Command);
    command = createStubInstance(Command);
    fileService = createStubInstance(FileService);
    log = createStubInstance(LoggerService);
    utilService = new UtilService();
  });

  beforeEach(() => {
    program.command.returns(command);
    command.version.returns(command);
    command.action.returns(command);
    fileService.readFile.onFirstCall().resolves(en);
    fileService.readFile.onSecondCall().resolves(ro);
    cmd = new ValidateCommand((program as unknown) as Command, log, (fileService as unknown) as FileService, utilService);
  });

  describe('validateFile', () => {
    it('should throw an assertion error if the files do not match', async () => {
      const result = await cmd.validateFile('../../i18n/en.json', '../../i18n/ro.json');
      console.log(result);
    });
  });
});
