import { Command } from 'commander';
import { from } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { join } from 'path';
import { Reorder } from '@hovrcat/reorder-json';
import { FileService } from '../services/file.service';
import { Logger } from '../services/logger.service';

export class SortCommand {
  private command: Command;

  constructor(private program: Command, private log: Logger, private fileService: FileService) {
    this.command = program.command('sort') as Command;
    this.setup();
  }

  setup() {
    this.command.action(() => {
      this.log.info('Sorting language files...');
      this.sort().subscribe(
        () => {},
        (err) => {
          this.log.error('An error occurred while sorting the language files');
          this.log.error(err);
        },
        () => {
          this.log.info('✔ Sorting complete!');
        },
      );
    });
  }

  sort() {
    return from(this.fileService.getLanguageFiles(this.program.dir)).pipe(
      mergeMap((langFiles) => {
        this.log.info(`Found ${langFiles.length} language files`);
        return from(langFiles);
      }),
      mergeMap((lang: string) => {
        const filePath: string = join(process.cwd(), this.program.dir, `${lang}.json`);
        this.log.info(`Sorting ${lang} file...`);
        return from(this.fileService.readFile(filePath)).pipe(
          map((fileData: any) => {
            return [filePath, fileData];
          }),
        );
      }),
      // sort the JSON file alphabetically
      map(([filePath, fileData]) => {
        const reorder = new Reorder();
        return [filePath, reorder.reorderLevel(fileData)];
      }),
      // save the updated json
      mergeMap(([filePath, combined]) => {
        this.log.debug(`${filePath} sorted`);
        return this.fileService.writeJsonToFile(filePath, combined);
      }),
    );
  }

  getCommand(): Command {
    return this.command;
  }
}
