import { expect } from 'chai';
import { UtilService } from './util.service';
import { NotFoundError, OutOfSyncError } from '../util/error';

describe('UtilService', () => {
  let utilService: UtilService;

  beforeEach(() => {
    utilService = new UtilService();
  });
  describe('compareLangObjects', () => {
    it('should identify undefined properties in the root level', () => {
      const root = {
        a: '1',
        b: '2',
      };

      const lang = {
        a: '1',
      };

      const result = utilService.compareLangObjects('', root, lang);
      expect(result.length).greaterThan(0);
      expect(result[0]).deep.eq({
        message: 'Property b is missing from lang file',
        rootValue: '2',
        langValue: undefined,
      });
    });

    it('should identify out of sync properties in the root level', () => {
      const root = {
        a: '1',
        b: '2',
      };

      const lang = {
        a: '1',
        b: {
          c: '2',
        },
      };

      const result = utilService.compareLangObjects('', root, lang);
      expect(result.length).eq(1);
      expect(result[0]).deep.eq({
        message: 'Property b is out of sync in lang file',
        rootValue: '2',
        langValue: {
          c: '2',
        },
      });
    });

    it('should identify undefined properties in deeper levels', () => {
      const root = {
        name: 'name',
        age: 'age',
        address: {
          street: 'street',
          number: 'number',
        },
      };

      const lang = {
        name: 'nume',
        age: 'varsta',
        address: {
          street: 'strada',
        },
      };

      const result = utilService.compareLangObjects('', root, lang);
      expect(result.length).eq(1);
      expect(result[0]).haveOwnProperty('message');
      expect(result[0].message).eq('Property address.number is missing from lang file');
    });

    it('should identify out of sync properties in deeper levels', () => {
      const root = {
        name: 'name',
        age: 'age',
        address: {
          street: 'street',
          number: 'number',
        },
      };

      const lang = {
        name: 'nume',
        age: 'varsta',
        address: {
          street: 'strada',
          number: {
            value: '12',
            addition: 'B',
          },
        },
      };

      const result = utilService.compareLangObjects('', root, lang);
      expect(result.length).eq(1);
      expect(result[0]).haveOwnProperty('message');
      expect(result[0].message).eq('Property address.number is out of sync in lang file');
    });

    it('should return multiple varied errors', () => {
      const root = {
        name: 'name',
        age: 'age',
        address: {
          street: 'street',
          number: 'number',
        },
        address2: {
          street: 'street',
          number: {
            value: 'value',
            addition: 'suffix',
          },
        },
      };

      const lang = {
        name: 'nume',
        address: 'strada',
        address2: {
          street: 'strada',
          number: '22',
        },
      };

      const result = utilService.compareLangObjects('', root, lang);
      expect(result.length).eq(3);
      expect(result[0]).instanceOf(NotFoundError);
      expect(result[1]).instanceOf(OutOfSyncError);
      expect(result[2]).instanceOf(OutOfSyncError);
    });
  });

  describe('createEntry', () => {
    it('should create a complete object based on the key path', () => {
      const [keyPath, value] = ['parents.mother', 'Mother'];
      const expected = {
        parents: {
          mother: 'Mother',
        },
      };

      const result = utilService.createEntry(keyPath, value);
      expect(result).deep.eq(expected);
    });
  });
});
