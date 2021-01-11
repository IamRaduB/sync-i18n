#!/usr/bin/env node
import v from './version.json';
import { UtilService } from './src/services/util.service';
import { LoggerService } from './src/services/logger.service';
import { LOGGER } from './src/config/constants';
import { FileService } from './src/services/file.service';
import { SyncTranslations } from './src';

const utilService = new UtilService();
const mainLog = new LoggerService(LOGGER.main);
const fsLog = mainLog.child(LOGGER.fs);
const insync = new SyncTranslations(v.version, new FileService(fsLog), mainLog, utilService);
insync.run();
