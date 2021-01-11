import { Command } from 'commander';
import { join } from 'path';
import { readdir } from 'fs';
import { promisify } from 'util';
import { Logger } from '../services/logger.service';
import { FileService } from '../services/file.service';
import { UtilService } from '../services/util.service';
import { Invalid } from '../util/error';

const readdirPromise = promisify(readdir);

export class ValidateCommand {
  private version = '0.0.1';

  private command: Command;

  constructor(
    private program: Command,
    private log: Logger,
    private fileService: FileService,
    private utilService: UtilService,
  ) {
    this.command = program.command('validate <rootFile> [specificFiles...]') as Command;
    this.setup();
  }

  setup() {
    this.command.version(this.version).action((rootFile: string, specificFiles: string[]) => {
      this.log.info('Validating...');
      if (specificFiles && specificFiles.length) {
        return this.validateSpecificFiles(this.program.dir, rootFile, specificFiles);
      }

      return this.validateAllFiles(this.program.dir, rootFile);
    });
  }

  async validateFile(rootLangData: any, langFile: string): Promise<boolean> {
    this.log.debug(`Validating file ${langFile}`);
    let lang;

    try {
      lang = await this.fileService.readFile(langFile);
    } catch (e) {
      this.log.error(`Unable to read language file ${langFile}`, e);
      throw e;
    }

    const errors = this.utilService.compareLangObjects('', rootLangData, lang);
    if (!errors.length) {
      this.log.valid(langFile);
      return true;
    }

    this.printErrors(errors, langFile);
    return false;
  }

  async validateSpecificFiles(inputDir: string, rootFile: string, specificFiles: string[]) {
    this.log.debug(`Validating a subset of files in ${inputDir}. Root ${rootFile}`);
    this.log.debug(`Root file ${rootFile}. Specific files: ${specificFiles.join(',')}`);

    let root: any;
    const rootPath = join(process.cwd(), inputDir, rootFile);
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
    this.log.debug(`Validating all files in ${inputDir} against root ${rootFile}`);

    let root: any;
    const rootPath = join(process.cwd(), inputDir, rootFile);
    try {
      root = await this.fileService.readFile(rootPath);
    } catch (e) {
      this.log.error(`Unable to read root file ${rootPath}`, e);
      throw e;
    }

    // read the contents of the translations directory
    // and filter out the root file
    const fileNames = (await readdirPromise(join(process.cwd(), inputDir))).filter((fname) => fname !== rootFile);

    const promises = fileNames.map((fname) => {
      return this.validateFile(root, join(inputDir, fname));
    });

    await Promise.all(promises);
  }

  printErrors(errors: Invalid[], langFile: string) {
    errors.forEach((error) => {
      this.log.invalid(langFile);
      this.log.invalidDetails(error.message);
      this.log.invalidDetails('Root:', error.rootValue);
      this.log.invalidDetails(`${langFile}:`, error.lang);
    });
  }

  getCommand(): Command {
    return this.command;
  }
}
