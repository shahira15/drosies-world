// Run with:  node tests/run-tests.mjs
import { runAll } from './engine.tests.js';
const { pass, total } = await runAll();
process.exit(pass === total ? 0 : 1);
