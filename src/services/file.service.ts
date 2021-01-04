import { readFile as rf, readdir, writeFile as wf } from 'fs';
import { promisify } from 'util';
import { Logger } from './logger.service';
import { join } from "path";

const readFile = promisify(rf);
const readDir = promisify(readdir);
const writeFile = promisify(wf);

export class FileService {
  constructor(private log: Logger) {
  }

  async getLanguageFiles(directory = 'i18n') {
    const dirPath = join(process.cwd(), directory);
    try {
      return (await readDir(dirPath))
        .map((file) => {
          return file.substring(0, file.lastIndexOf('.'));
        });
    } catch (e) {
      this.log.error(`Unable to read directory ${directory}`);
      throw e;
    }
  }

  async readFile(path: string): Promise<any> {
    try {
      const fileData = await readFile(path, { encoding: 'utf8' });
      return JSON.parse(fileData);
    } catch (e) {
      this.log.error(`Unable to read file ${path}`, e);
      throw e;
    }
  }

  async writeJsonToFile(file: string, data: any) {
    try {
      await writeFile(file, JSON.stringify(data, null, 2), {
        encoding: 'utf8',
      });
    } catch (e) {
      this.log.error(`Failed to write language file ${file}`);
      throw e;
    }
  }
}
