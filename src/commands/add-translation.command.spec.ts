import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { Command } from 'commander';
import chai, { expect } from 'chai';
import chaiArrays from 'chai-arrays';
import { Logger, LoggerService } from '../services/logger.service';
import { FileService } from '../services/file.service';
import { UtilService } from '../services/util.service';
import { AddTranslationCommand } from './add-translation.command';

chai.use(chaiArrays);

describe('ValidateCommand', () => {
  let cmd: AddTranslationCommand;
  let program: SinonStubbedInstance<Command>;
  let command: any;
  let log: Logger;
  let fileService: SinonStubbedInstance<FileService>;
  let utilService: UtilService;

  beforeEach(() => {
    program = createStubInstance(Command);
    command = createStubInstance(Command);
    fileService = createStubInstance(FileService);
    log = new LoggerService('test', true);
    utilService = new UtilService();
    program.command.returns(command);
    command.version.returns(command);
    command.option.returns(command);
    command.action.returns(command);
    fileService.readFile.resolves({
      name: 'Nume',
      age: 'Varsta',
      address: {
        number: 'Numar',
      },
    });
    cmd = new AddTranslationCommand(
      (program as unknown) as Command,
      log,
      (fileService as unknown) as FileService,
      utilService,
    );
  });

  describe('createQuestions', () => {
    it('should dynamically generate the questions for all files in the i18n dir, as well as the key path and confirmation prompts', async () => {
      fileService.getLanguageFiles.resolves(['en', 'de', 'nl', 'it']);
      const expectedMessages = [
        'New key path',
        'Value for en file',
        'Value for de file',
        'Value for nl file',
        'Value for it file',
        'Is this correct?',
      ];
      const questions = await cmd.createQuestions();
      expect(questions.length).eq(6);
      expect(questions.map((q) => q.message)).deep.eq(expectedMessages);
    });
  });

  describe('addTranslation', () => {
    it('should add a new translation to the translation file', (done) => {
      program.dir = 'i18n';
      fileService.readFile.resolves({
        address: {
          street: 'Street',
          number: 'Number',
        },
      });
      fileService.writeJsonToFile.resolves();
      cmd
        .addTranslation({
          key: 'address.add',
          en: 'Addition',
          confirmation: 'yes',
        })
        .subscribe(() => {
          const translationData = fileService.writeJsonToFile.getCall(0).lastArg;
          expect(translationData).deep.eq({
            address: {
              street: 'Street',
              number: 'Number',
              add: 'Addition',
            },
          });
          done();
        });
    });

    it('should reorder the JSON keys if the --order flag was set', (done) => {
      program.dir = 'i18n';
      command.order = true;
      fileService.readFile.resolves({
        user: 'John',
        address: {
          street: 'Street',
          number: 'Number',
        },
      });
      fileService.writeJsonToFile.resolves();
      cmd
        .addTranslation({
          key: 'address.add',
          en: 'Addition',
          confirmation: 'yes',
        })
        .subscribe(() => {
          const translationData = fileService.writeJsonToFile.getCall(0).lastArg;
          expect(translationData).deep.eq({
            address: {
              add: 'Addition',
              number: 'Number',
              street: 'Street',
            },
            user: 'John',
          });
          expect(Object.keys(translationData)).sorted();
          expect(Object.keys(translationData.address)).sorted();
          done();
        });
    });

    it('should NOT reorder the JSON keys if the --order flag was NOT set', (done) => {
      program.dir = 'i18n';
      command.order = true;
      fileService.readFile.resolves({
        user: 'John',
        address: {
          street: 'Street',
          number: 'Number',
        },
      });
      fileService.writeJsonToFile.resolves();
      cmd
        .addTranslation({
          key: 'address.add',
          en: 'Addition',
          confirmation: 'yes',
        })
        .subscribe(() => {
          const translationData = fileService.writeJsonToFile.getCall(0).lastArg;
          expect(translationData).deep.eq({
            user: 'John',
            address: {
              street: 'Street',
              number: 'Number',
              add: 'Addition',
            },
          });
          expect(Object.keys(translationData)).sorted();
          expect(Object.keys(translationData.address)).sorted();
          done();
        });
    });
  });
});
