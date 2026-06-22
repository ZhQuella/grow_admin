import { run } from './base';
import { commandArgv } from './helper';
const args = commandArgv();
run('build', true, args.all);
