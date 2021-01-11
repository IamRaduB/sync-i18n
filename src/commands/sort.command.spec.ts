import chai, { expect } from 'chai';
import chaiArrays from 'chai-arrays';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { Command } from 'commander';
import { FileService } from '../services/file.service';
import { Logger, LoggerService } from '../services/logger.service';
import { SortCommand } from './sort.command';

chai.use(chaiArrays);

describe('SortCommand', () => {
  let cmd: SortCommand;
  let program: SinonStubbedInstance<Command>;
  let command: any;
  let log: Logger;
  let fileService: SinonStubbedInstance<FileService>;

  beforeEach(() => {
    program = createStubInstance(Command);
    command = createStubInstance(Command);
    fileService = createStubInstance(FileService);
    log = new LoggerService('test', true);
    program.command.returns(command);
    command.version.returns(command);
    command.option.returns(command);
    command.action.returns(command);
    fileService.getLanguageFiles.resolves(['en', 'nl']);
    fileService.readFile.resolves({
      name: 'Nume',
      age: 'Varsta',
      address: {
        street: 'Strada',
        number: 'Numar',
      },
    });
    cmd = new SortCommand((program as unknown) as Command, log, (fileService as unknown) as FileService);
  });

  describe(SortCommand.prototype.sort.name, () => {
    it('should sort the JSON file alphabetically', (done) => {
      program.dir = 'i18n';
      fileService.writeJsonToFile.resolves();
      cmd.sort().subscribe(
        () => {
          const translationData = fileService.writeJsonToFile.getCall(0).lastArg;
          expect(translationData).deep.eq({
            address: {
              number: 'Numar',
              street: 'Strada',
            },
            age: 'Varsta',
            name: 'Nume',
          });
          expect(Object.keys(translationData)).sorted();
          expect(Object.keys(translationData.address)).sorted();
        },
        () => {},
        () => {
          done();
        },
      );
    });
  });
});
