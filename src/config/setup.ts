import { existsSync, mkdirSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';

/**
 * Configuration setup utilities for first-time initialization
 */
export class ConfigSetup {
  private static readonly CONFIG_DIR = join(homedir(), '.pushr');
  private static readonly CONFIG_FILE = join(ConfigSetup.CONFIG_DIR, 'config.json');
  private static readonly EXAMPLE_CONFIG = 'config.json.example';

  /**
   * Check if configuration exists
   */
  static hasConfig(): boolean {
    return existsSync(ConfigSetup.CONFIG_FILE);
  }

  /**
   * Get the path to the user's configuration file
   */
  static getConfigPath(): string {
    return ConfigSetup.CONFIG_FILE;
  }

  /**
   * Initialize configuration from example
   */
  static initializeConfig(): void {
    try {
      // Create .pushr directory if it doesn't exist
      if (!existsSync(ConfigSetup.CONFIG_DIR)) {
        mkdirSync(ConfigSetup.CONFIG_DIR, { recursive: true });
      }

      // Find the example config file
      const examplePath = ConfigSetup.findExampleConfig();
      if (!examplePath) {
        throw new Error('Could not find config.json.example file');
      }

      // Copy example config to user's config directory
      copyFileSync(examplePath, ConfigSetup.CONFIG_FILE);
      
      console.log(`✅ Configuration file created at: ${ConfigSetup.CONFIG_FILE}`);
      console.log('');
      console.log('📝 Please edit the configuration file to add your platform credentials:');
      console.log(`   ${ConfigSetup.CONFIG_FILE}`);
      console.log('');
      console.log('💡 After configuring, you can use pushr like this:');
      console.log('   npx pushr --discord --channel alerts -m "Hello World!"');
      console.log('   npx pushr --telegram --channel general -m "Deployment complete"');
      console.log('');
    } catch (error) {
      throw new Error(`Failed to initialize configuration: ${error}`);
    }
  }

  /**
   * Find the example config file in various possible locations
   */
  private static findExampleConfig(): string | null {
    // Possible locations for the example config
    const possiblePaths = [
      // When running from source
      join(process.cwd(), ConfigSetup.EXAMPLE_CONFIG),
      // When installed via npm/npx
      join(dirname(dirname(__dirname)), ConfigSetup.EXAMPLE_CONFIG),
      join(dirname(__dirname), ConfigSetup.EXAMPLE_CONFIG),
      // When running from dist
      ...(process.argv[1] ? [join(dirname(process.argv[1]), '..', ConfigSetup.EXAMPLE_CONFIG)] : []),
    ];

    for (const path of possiblePaths) {
      if (existsSync(path)) {
        return path;
      }
    }

    return null;
  }

  /**
   * Show configuration help message
   */
  static showConfigHelp(): void {
    console.log('🔧 Configuration Setup Required');
    console.log('');
    console.log('It looks like this is your first time using pushr!');
    console.log('A configuration file has been created for you.');
    console.log('');
    console.log('Please follow these steps:');
    console.log('1. Edit the configuration file with your platform credentials');
    console.log(`2. File location: ${ConfigSetup.CONFIG_FILE}`);
    console.log('3. Configure Discord bot token and channel IDs');
    console.log('4. Configure Telegram bot token and channel IDs');
    console.log('5. Run your command again');
    console.log('');
  }
}