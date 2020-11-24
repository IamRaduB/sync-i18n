export class Invalid {
  message: string;
  rootValue: any;
  langValue: any;

  constructor(message: string, rootValue: any, langValue: any) {
    this.message = message;
    this.langValue = langValue;
    this.rootValue = rootValue;
  }

  toString() {
    return `${this.message} - rootValue: ${JSON.stringify(this.rootValue)} / langValue: ${JSON.stringify(this.langValue)}`;
  }
}

export class NotFoundError extends Invalid {
  constructor(path: string, key: string, rootValue: any, langValue: any) {
    super(`Property ${path}${key} is missing from lang file`, rootValue, langValue);
  }
}

export class OutOfSyncError extends Invalid {
  constructor(path: string, key: string, rootValue: any, langValue: any) {
    super(`Property ${path}${key} is out of sync in lang file`, rootValue, langValue);
  }
}
