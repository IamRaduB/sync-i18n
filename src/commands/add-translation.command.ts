import { Command } from 'commander';
import { merge } from 'lodash';
import inquirer, { Answers, Question } from 'inquirer';
import { Logger } from '../services/logger.service';
import { FileService } from '../services/file.service';
import { UtilService } from '../services/util.service';
import { from, Observable } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';
import { join } from 'path';

export interface Answer {
  key: string;
  [key: string]: string;
}

export class AddTranslationCommand {
  version = '0.0.1';
  private command: Command;

  constructor(private program: Command, private log: Logger, private fileService: FileService, private utilService: UtilService) {
    this.command = program.command('add') as Command;
    this.setup();
  }

  setup() {
    this.command
      .version(this.version)
      .action(() => {
        this.loadPrompt()
          .subscribe();
      });
  }

  loadPrompt(): Observable<void> {
    return from(this.createQuestions())
      .pipe(
        mergeMap((questions) => {
          return inquirer.prompt(questions);
        }),
        mergeMap((answers) => {
          if (!answers.confirmation) {
            return this.loadPrompt();
          }

          return this.addTranslation(answers);
        }),
      );
  }

  addTranslation(answers: Answers, directory = 'i18n') {
    return from(Object.keys(answers))
      .pipe(
        filter((keyName) => !['key', 'confirmation'].includes(keyName)),
        mergeMap((lang) => {
          const filePath: string = join(process.cwd(), directory, `${lang}.json`);
          return from(this.fileService.readFile(filePath))
            .pipe(
              map((fileData: any) => {
                return [lang, filePath, fileData];
              }),
            );
        }),
        mergeMap(([lang, filePath, fileData]) => {
          const entry = this.utilService.createEntry(answers.key, answers[lang]);
          const combined = merge(fileData, entry);

          return this.fileService.writeJsonToFile(filePath, combined);
        }),
      );
  }

  async createQuestions(): Promise<Question[]> {
    return [
      {
        type: 'input',
        name: 'key',
        message: 'New key path'
      },
      ...(await this.fileService.getLanguageFiles())
        .map((langFile): Question => {
          return {
            type: 'input',
            name: `${langFile}`,
            message: `Value for ${langFile} file`,
          }
        }),
      {
        type: 'confirm',
        name: 'confirmation',
        message: 'Is this correct?'
      },
    ];
  }

  getCommand(): Command {
    return this.command;
  }
}
