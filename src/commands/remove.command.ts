import { Command } from 'commander';
import { join } from 'path';
import { from } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { Logger } from '../services/logger.service';
import { FileService } from '../services/file.service';
import { Lang } from '../util/common';
import { AppCommand } from '../util/app.command';

export class RemoveCommand implements AppCommand {
  private command: Command;

  constructor(private program: Command, private log: Logger, private fileService: FileService) {
    this.command = program.command('remove') as Command;
    this.setup();
  }

  setup() {
    this.command.requiredOption('-p, --path <path>', 'JSON path to remove').action(() => {
      this.remove().subscribe();
    });
  }

  remove() {
    return from(this.fileService.getLanguageFiles(this.program.dir)).pipe(
      mergeMap((langs) => {
        return from(langs);
      }),
      mergeMap((lang: string) => {
        const filePath: string = join(process.cwd(), this.program.dir, `${lang}.json`);
        return this.fileService.readFile(filePath);
      }),
      map((fileData: Lang) => {}),
    );
  }

  getCommand(): Command {
    return this.command;
  }

  setVerbose(state: boolean) {
    this.log.setVerbose(state);
  }
}
