import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

/**
 * Configuration structure for the application
 */
export interface Config {
  platforms: {
    discord?: DiscordConfig;
    telegram?: TelegramConfig;
  };
  defaults: {
    platform?: string;
    channel?: string;
  };
}

export interface DiscordConfig {
  bot: {
    token: string;
    channels?: Record<string, string>;
  };
}

export interface TelegramConfig {
  bot?: {
    token: string;
    channels?: Record<string, string>;
  };
}

/**
 * Configuration manager class
 */
export class ConfigManager {
  private config: Config;
  private configPath: string;

  constructor(configPath?: string) {
    this.configPath = configPath || this.findConfigFile();
    this.config = this.loadConfig();
  }

  /**
   * Get the current configuration
   */
  getConfig(): Config {
    return this.config;
  }

  /**
   * Get platform-specific configuration
   */
  getPlatformConfig(platform: string): any {
    return this.config.platforms[platform as keyof typeof this.config.platforms];
  }

  /**
   * Get a Discord channel ID by alias or return the input if it's already an ID
   */
  getDiscordChannel(aliasOrId: string): string | undefined {
    const discordConfig = this.config.platforms.discord;
    if (!discordConfig?.bot?.channels) return aliasOrId;

    // If it looks like a channel ID (numeric), return it
    if (/^\d+$/.test(aliasOrId)) {
      return aliasOrId;
    }

    // Otherwise, look up the alias
    return discordConfig.bot.channels[aliasOrId] || aliasOrId;
  }

  /**
   * Get a Telegram channel ID by alias or return the input if it's already an ID
   */
  getTelegramChannel(aliasOrId: string): string | undefined {
    const telegramConfig = this.config.platforms.telegram;
    if (!telegramConfig?.bot?.channels) return aliasOrId;

    // If it looks like a channel ID (numeric, possibly negative), return it
    if (/^-?\d+$/.test(aliasOrId)) {
      return aliasOrId;
    }

    // Otherwise, look up the alias
    return telegramConfig.bot.channels[aliasOrId] || aliasOrId;
  }

  /**
   * Get Discord bot token from config or environment
   */
  getDiscordToken(): string | undefined {
    return process.env.NOTIFE_DISCORD_TOKEN || this.config.platforms.discord?.bot?.token;
  }

  /**
   * Get Telegram bot token from config or environment
   */
  getTelegramToken(): string | undefined {
    return process.env.NOTIFE_TELEGRAM_TOKEN || this.config.platforms.telegram?.bot?.token;
  }

  /**
   * Find the configuration file in common locations
   */
  private findConfigFile(): string {
    const possiblePaths = [
      process.env.NOTIFE_CONFIG_PATH,
      join(homedir(), '.notife', 'config.json'), // User's home directory config (highest priority)
      join(process.cwd(), 'config.json'),
      join(process.cwd(), '.notife.json'),
      join(homedir(), '.notife.json'),
    ].filter(Boolean) as string[];

    for (const path of possiblePaths) {
      if (existsSync(path)) {
        return path;
      }
    }

    // Return user's home directory config path as default
    return join(homedir(), '.notife', 'config.json');
  }

  /**
   * Load configuration from file
   */
  private loadConfig(): Config {
    const defaultConfig: Config = {
      platforms: {},
      defaults: {}
    };

    if (!existsSync(this.configPath)) {
      console.warn(`Config file not found at ${this.configPath}. Using default configuration.`);
      return defaultConfig;
    }

    try {
      const configContent = readFileSync(this.configPath, 'utf-8');
      const parsedConfig = JSON.parse(configContent);
      
      // Merge with default config to ensure all required fields exist
      return {
        ...defaultConfig,
        ...parsedConfig,
        platforms: {
          ...defaultConfig.platforms,
          ...parsedConfig.platforms
        },
        defaults: {
          ...defaultConfig.defaults,
          ...parsedConfig.defaults
        }
      };
    } catch (error) {
      console.error(`Error loading config file: ${error}`);
      return defaultConfig;
    }
  }

  /**
   * Validate the configuration
   */
  validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check if at least one platform is configured
    const platforms = Object.keys(this.config.platforms);
    if (platforms.length === 0) {
      errors.push('No platforms configured');
    }

    // Validate Discord configuration
    if (this.config.platforms.discord) {
      const discord = this.config.platforms.discord;
      if (!discord.bot) {
        errors.push('Discord platform configured but no bot configuration found');
      }
      if (!discord.bot.token && !process.env.NOTIFE_DISCORD_TOKEN) {
        errors.push('Discord bot configured but no token provided');
      }
    }

    // Validate Telegram configuration
    if (this.config.platforms.telegram) {
      const telegram = this.config.platforms.telegram;
      if (!telegram.bot) {
        errors.push('Telegram platform configured but no bot configuration found');
      }
      if (telegram.bot && !telegram.bot.token && !process.env.NOTIFE_TELEGRAM_TOKEN) {
        errors.push('Telegram bot configured but no token provided');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}