import chalk from 'chalk';

export interface Logger {
  child(context: string): Logger;
  info(...args: any[]): this;
  error(...args: any[]): this;
  debug(...args: any[]): this;

  setVerbose(value: boolean): void;
  setContextVisible(hide: boolean): this;
}

export  class LoggerService implements Logger{
  private contextVisible: boolean = false;

  constructor(private context: string, private verbose: boolean = false) {
  }

  child(context: string): Logger {
    return new LoggerService(`${this.context}-${context}`, this.verbose);
  }

  info(...args: any[]): this {
    const message = chalk.blueBright(`${this.contextVisible ? this.context + ':': ''}`, ...args);
    console.log(message);
    return this;
  }

  error(...args: any[]): this {
    const message = chalk.bold.red(`${this.contextVisible ? this.context + ':': ''}`, ...args);
    console.log(message);
    return this;
  }

  debug(...args: any[]): this {
    if (!this.verbose) {
      return this;
    }

    const message = chalk.green(`${this.contextVisible ? this.context + ':': ''}`, ...args);
    console.log(message);
    return this;
  }

  setVerbose(value: boolean): this {
    this.verbose = value;
    return this;
  }

  setContextVisible(hide: boolean): this {
    this.contextVisible = hide;
    return this;
  }
}
