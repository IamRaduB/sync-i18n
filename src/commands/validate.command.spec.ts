import { Command } from 'commander';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { ValidateCommand } from './validate.command';
import { Logger, LoggerService } from '../services/logger.service';
import { FileService } from '../services/file.service';
import { UtilService } from '../services/util.service';
import { expect } from 'chai';

describe('ValidateCommand', () => {
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
    log = new LoggerService('test', true);
    utilService = new UtilService();
  });

  beforeEach(() => {
    program.command.returns(command);
    command.version.returns(command);
    command.action.returns(command);
    fileService.readFile.resolves({
      "name": "Nume",
      "age": "Varsta",
      "address": {
        "number": "Numar"
      },
    });
    cmd = new ValidateCommand((program as unknown) as Command, log, (fileService as unknown) as FileService, utilService);
  });

  describe('validateFile', () => {
    it('should throw an assertion error if the files do not match', async () => {
      const result = await cmd.validateFile({
        "name": "Name",
        "age": "Age",
        "address": {
          "street": "Street",
          "number": "Number"
        },
      }, 'mockPath2');
      expect(result).eq(false);
    });
  });
});
