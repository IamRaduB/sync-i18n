import { Command } from 'commander';
import { Logger } from '../services/logger.service';
import { FileService } from '../services/file.service';
import { UtilService } from '../services/util.service';
import { join } from 'path';
import { readdir } from 'fs';
import { promisify } from 'util';

const readdirPromise = promisify(readdir);


export class ValidateCommand {
  private version = '0.0.1';
  private command: Command;

  constructor(private program: Command, private log: Logger, private fileService: FileService, private utilService: UtilService) {
    this.command = program.command('validate <inputDir> <rootFile> [specificFiles...]') as Command;
    this.setup();
  }

  setup() {
    this.command
      .version(this.version)
      .action((inputDir: string, rootFile: string, specificFiles: string[]) => {
        if (specificFiles && specificFiles.length) {
          return this.validateSpecificFiles(inputDir, rootFile, specificFiles);
        }

        return this.validateAllFiles(inputDir, rootFile);
      });
  }

  async validateFile(root: any, langFile: string) {
    this.log.info(`Validating file ${langFile}`);
    let lang;

    try {
      lang = await this.fileService.readFile(langFile);
    } catch (e) {
      this.log.error(`Unable to read language file ${langFile}`, e);
      throw e;
    }

    const result = this.utilService.compareLangObjects('', root, lang);
    if (!result.length) {
      this.log.info(`${langFile} validated successfully`);
    }

    this.log.error(result);
  }

  async validateSpecificFiles(inputDir: string, rootFile: string, specificFiles: string[]) {
    this.log.info(`Validating a set of files in ${inputDir}. Root ${rootFile}`);
    this.log.debug(`Root file ${rootFile}`);
    this.log.debug(`Specific files: ${specificFiles.join(',')}`);

    let root: any;
    let rootPath = join(process.cwd(), inputDir, rootFile);
    try {
      root = await this.fileService.readFile(rootPath);
    } catch (e) {
      this.log.error(`Unable to read root file ${join(process.cwd(), inputDir, rootFile)}`, e);
      throw e;
    }

    const promises = specificFiles.map((fileName) => {
      const filePath = join(process.cwd(), inputDir, fileName);
      return this.validateFile(root, filePath);
    });

    await Promise.all(promises);
  }

  async validateAllFiles(inputDir: string, rootFile: string) {
    this.log.info(`Validating all files in ${inputDir}`);
    this.log.debug(`Root: ${rootFile}`);

    let root: any;
    let rootPath = join(process.cwd(), inputDir, rootFile);
    try {
      root = await this.fileService.readFile(rootPath);
    } catch (e) {
      this.log.error(`Unable to read root file ${rootPath}`, e);
      throw e;
    }

    // read the contents of the translations directory
    // and filter out the root file
    const fileNames = (await readdirPromise(join(process.cwd(), inputDir)))
      .filter((fname) => fname !== rootFile);

    const promises = fileNames.map((fname) => {
      return this.validateFile(root, join(inputDir, fname));
    });

    await Promise.all(promises);
  }

  getCommand(): Command {
    return this.command;
  }
}
