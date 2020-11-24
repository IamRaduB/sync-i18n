import { readFile as rf } from 'fs';
import { promisify } from 'util';
import { Logger } from './logger.service';
import { join } from "path";

const readFile = promisify(rf);

export class FileService {
  constructor(private log: Logger) {
  }

  async readFile(path: string): Promise<Object> {
    try {
      const fileData = await readFile(path, { encoding: 'utf8' });
      return JSON.parse(fileData);
    } catch (e) {
      this.log.error(`Unable to read file ${path}`, e);
      throw e;
    }
  }

  static async getVersion() {
    const packageInfo = await readFile(join('__dirname', '../','package.json'), { encoding: 'utf8' });
    const packageJson = JSON.parse(packageInfo);
    return packageJson.version;
  }
}
