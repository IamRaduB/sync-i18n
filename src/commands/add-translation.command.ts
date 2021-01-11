import { Command } from 'commander';
import { merge } from 'lodash';
import { Reorder } from '@hovrcat/reorder-json';
import inquirer, { Answers, Question } from 'inquirer';
import { from, Observable } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';
import { join } from 'path';
import { Logger } from '../services/logger.service';
import { FileService } from '../services/file.service';
import { UtilService } from '../services/util.service';

export class AddTranslationCommand {
  private command: Command;

  constructor(
    private program: Command,
    private log: Logger,
    private fileService: FileService,
    private utilService: UtilService,
  ) {
    this.command = program.command('add') as Command;
    this.setup();
  }

  setup() {
    this.command
      .option('-o, --order', 'Instruct the command to order the keys added in alphabetical order', false)
      .action(() => {
        this.loadPrompt().subscribe();
      });
  }

  loadPrompt(): Observable<void> {
    return from(this.createQuestions()).pipe(
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

  /**
   * Takes the dictionary of answers, processes each response
   * and saves the entries to the corresponding translation file
   *
   * {
   *   key: 'json.key.path',
   *   xx: 'Value for lang xx',
   *   yy: 'Value for lang yy',
   *   confirmation: true
   * }
   *
   * @param answers
   */
  addTranslation(answers: Answers): Observable<void> {
    return from(Object.keys(answers)).pipe(
      filter((keyName) => !['key', 'confirmation'].includes(keyName)),
      // read the JSON file
      mergeMap((lang) => {
        const filePath: string = join(process.cwd(), this.program.dir, `${lang}.json`);
        return from(this.fileService.readFile(filePath)).pipe(
          map((fileData: any) => {
            return [lang, filePath, fileData];
          }),
        );
      }),
      // create the addition
      // and reorder it if necessary
      map(([lang, filePath, fileData]) => {
        const reorder = new Reorder();
        const entry = this.utilService.createEntry(answers.key, answers[lang]);
        let combined = merge(fileData, entry);
        if (this.command.order) {
          combined = reorder.reorderLevel(combined);
          return [filePath, combined];
        }

        return [filePath, combined];
      }),
      // save the updated json
      mergeMap(([filePath, combined]) => {
        return this.fileService.writeJsonToFile(filePath, combined);
      }),
    );
  }

  async createQuestions(): Promise<Question[]> {
    return [
      {
        type: 'input',
        name: 'key',
        message: 'New key path',
      },
      ...(await this.fileService.getLanguageFiles(this.program.dir)).map(
        (langFile): Question => {
          return {
            type: 'input',
            name: `${langFile}`,
            message: `Value for ${langFile} file`,
          };
        },
      ),
      {
        type: 'confirm',
        name: 'confirmation',
        message: 'Is this correct?',
      },
    ];
  }

  getCommand(): Command {
    return this.command;
  }
}
