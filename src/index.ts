#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { configureSendCommand } from './commands/send.js';
import { ConfigSetup } from './config/setup.js';

/**
 * Main CLI application entry point
 */
async function main() {
  try {
    // Check if this is a first-time setup
    if (!ConfigSetup.hasConfig()) {
      console.log('🚀 Welcome to notife!');
      console.log('');
      ConfigSetup.initializeConfig();
      ConfigSetup.showConfigHelp();
      process.exit(0);
    }

    const cli = yargs(hideBin(process.argv))
      .scriptName('notife')
      .usage('$0 [options]')
      .version('0.1.0')
      .help()
      .alias('h', 'help')
      .alias('v', 'version')
      .strict()
      .recommendCommands()
      .showHelpOnFail(false, 'Specify --help for available options');

    // Configure commands - make send the default command
    configureSendCommand(cli);

    // Parse and execute
    await cli.parse();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
}

// Run the CLI if this file is executed directly
if (import.meta.main) {
  main();
}