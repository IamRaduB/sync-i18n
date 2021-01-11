/* eslint-disable no-console */
import chalk from 'chalk';

export interface Logger {
  child(context: string): Logger;

  title(...args: any[]): this;

  info(...args: any[]): this;

  error(...args: any[]): this;

  debug(...args: any[]): this;

  valid(...args: any[]): this;

  invalid(...args: any[]): this;

  invalidDetails(...args: any[]): this;

  setVerbose(value: boolean): void;
}

export class LoggerService implements Logger {
  constructor(private context: string, private verbose: boolean = false) {}

  child(context: string): Logger {
    return new LoggerService(`${this.context}-${context}`, this.verbose);
  }

  title(...args: any[]): this {
    const message = chalk.bold.underline.blueBright(...args);
    console.log(message);
    return this;
  }

  info(...args: any[]): this {
    const message = chalk.white(...args);
    console.log(message);
    return this;
  }

  error(...args: any[]): this {
    const message = chalk.bold.red(...args);
    console.log(message);
    return this;
  }

  debug(...args: any[]): this {
    if (!this.verbose) {
      return this;
    }

    const message = chalk.green(...args);
    console.log(message);
    return this;
  }

  valid(...args: any[]): this {
    const message = chalk.greenBright('✔', ...args);
    console.log(message);
    return this;
  }

  invalid(...args: any[]): this {
    const message = chalk.redBright('❌', ...args);
    console.log(message);
    return this;
  }

  invalidDetails(...args: any[]): this {
    const message = chalk.yellow(...args);
    console.log(message);
    return this;
  }

  setVerbose(value: boolean): this {
    this.verbose = value;
    return this;
  }
}
