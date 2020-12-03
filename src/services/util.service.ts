import { isObjectLike } from 'lodash';
import { Invalid, NotFoundError, OutOfSyncError } from '../util/error';

export class UtilService {
  compareLangObjects(path: string, rootLevel: any, langLevel: any): Invalid[] {
    const rootKeys = Object.keys(rootLevel);

    return rootKeys
      .flatMap((rkey) => {
        let keyPath = path ? path + '.' : '';

        // consider undefined and empty string as "missing"
        // empty string is marked as missing only of the root file has an actual string value
        if (langLevel[rkey] === undefined ||
          (typeof rootLevel[rkey] === 'string' && rootLevel[rkey] !== '' && langLevel[rkey] === '')) {
          return new NotFoundError(keyPath, rkey, rootLevel[rkey], langLevel[rkey]);
        }

        if (typeof rootLevel[rkey] !== typeof langLevel[rkey]) {
          return new OutOfSyncError(keyPath, rkey, rootLevel[rkey], langLevel[rkey]);
        }

        if (isObjectLike(rootLevel[rkey])) {
          return this.compareLangObjects(`${keyPath}${rkey}`, rootLevel[rkey], langLevel[rkey]);
        }

        return null;
      })
      .filter(err => err !== null) as Invalid[];
  }

  createEntry(keyPath: string, value: string) {
    const keyParts = keyPath.split('.');
    const entry: any = {};

    // if reached the deepest level
    // set the value
    if (keyParts.length === 1) {
      entry[keyParts[0]] = value;
      return entry;
    }

    entry[keyParts[0]] = this.createEntry(keyParts.splice(1).join('.'), value);
    return entry;
  }
}
