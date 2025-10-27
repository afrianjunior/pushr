import yargs, { type Argv } from 'yargs';
import { hideBin } from 'yargs/helpers';
import { ConfigManager } from '../config/index.js';
import { DiscordPlatform } from '../platforms/discord.js';
import { TelegramPlatform } from '../platforms/telegram.js';
import type { MessageOptions } from '../platforms/base.js';

export interface SendCommandArgs {
  m: string;
  message?: string;
  discord?: boolean;
  telegram?: boolean;
  channelID?: string;
  channel?: string;
  format?: 'plain' | 'markdown' | 'embed';
  silent?: boolean;
  config?: string;
  'dry-run'?: boolean;
}

/**
 * Handle the send command
 */
export async function handleSendCommand(args: SendCommandArgs): Promise<void> {
  try {
    // Initialize configuration
    const config = new ConfigManager(args.config);
    const validation = config.validateConfig();
    
    if (!validation.valid) {
      console.error('Configuration validation failed:');
      validation.errors.forEach(error => console.error(`  - ${error}`));
      process.exit(1);
    }

    // Determine target platform(s)
    const platforms: string[] = [];
    if (args.discord) platforms.push('discord');
    if (args.telegram) platforms.push('telegram');
    
    // If no platform specified, use default
    if (platforms.length === 0) {
      const defaultPlatform = config.getConfig().defaults.platform || 'discord';
      platforms.push(defaultPlatform);
    }

    // Prepare message options
    const messageOptions: MessageOptions = {
      format: args.format || 'plain',
      silent: args.silent || false,
    };

    // Send messages to each platform
    for (const platformName of platforms) {
      await sendToPlatform(platformName, args, config, messageOptions);
    }

  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
}

/**
 * Send message to a specific platform
 */
async function sendToPlatform(
  platformName: string, 
  args: SendCommandArgs, 
  config: ConfigManager, 
  options: MessageOptions
): Promise<void> {
  let target: string | undefined;
  
  // Determine target based on platform
  switch (platformName) {
    case 'discord':
      target = args.channelID || args.channel;
      if (!target) {
        target = config.getConfig().defaults.channel || 'general';
      }
      break;
      
    case 'telegram':
      target = args.channelID || args.channel;
      if (!target) {
        target = config.getConfig().defaults.channel;
      }
      if (!target) {
        console.error('Telegram requires --channelID or --channel parameter');
        return;
      }
      break;
      
    default:
      console.error(`Unsupported platform: ${platformName}`);
      return;
  }

  if (!target) {
    console.error(`No target specified for ${platformName}`);
    return;
  }

  // Dry run mode
  if (args['dry-run']) {
    console.log(`[DRY RUN] Would send to ${platformName}:`);
    console.log(`  Target: ${target}`);
    console.log(`  Message: ${args.m}`);
    console.log(`  Options: ${JSON.stringify(options, null, 2)}`);
    return;
  }

  // Create platform instance and send message
  try {
    let platform;
    
    switch (platformName) {
      case 'discord':
        platform = new DiscordPlatform(config);
        break;
        
      case 'telegram':
        platform = new TelegramPlatform(config);
        break;
        
      default:
        console.error(`Platform ${platformName} not implemented`);
        return;
    }

    if (!options.silent) {
      console.log(`Sending message to ${platformName}...`);
    }

    const result = await platform.sendMessage(target, args.m, options);
    
    if (result.success) {
      if (!options.silent) {
        console.log(`✅ Message sent successfully to ${platformName}`);
        if (result.messageId) {
          console.log(`   Message ID: ${result.messageId}`);
        }
      }
    } else {
      console.error(`❌ Failed to send message to ${platformName}: ${result.error}`);
    }
    
  } catch (error) {
    console.error(`❌ Error sending to ${platformName}: ${error}`);
  }
}

/**
 * Configure the send command with yargs
 */
export function configureSendCommand(yargsInstance: Argv): Argv {
  return yargsInstance
    .option('m', {
      alias: 'message',
      type: 'string',
      description: 'Message content to send',
      demandOption: true,
    })
    .option('discord', {
      type: 'boolean',
      description: 'Send to Discord',
      default: false,
    })
    .option('telegram', {
      type: 'boolean',
      description: 'Send to Telegram',
      default: false,
    })
    .option('channelID', {
      type: 'string',
      description: 'Channel ID (Discord channel ID/webhook alias or Telegram chat ID)',
    })
    .option('channel', {
      type: 'string',
      description: 'Channel alias (works for both Discord and Telegram)',
    })
    .option('format', {
      type: 'string',
      choices: ['plain', 'markdown', 'embed'] as const,
      description: 'Message format',
      default: 'plain' as const,
    })
    .option('silent', {
      type: 'boolean',
      description: 'Silent mode (no output)',
      default: false,
    })
    .option('config', {
      type: 'string',
      description: 'Path to configuration file',
    })
    .option('dry-run', {
      type: 'boolean',
      description: 'Preview the message without sending',
      default: false,
    })
    .example('$0 --discord --channelID 123456789 -m "Hello World!"', 'Send to Discord channel')
    .example('$0 --discord --channel alerts -m "Server is down!"', 'Send to Discord using alias')
    .example('$0 --telegram --channelID -987654321 -m "Deployment complete"', 'Send to Telegram channel')
    .example('$0 --telegram --channel general -m "Build finished"', 'Send to Telegram using alias')
    .example('$0 --discord --format embed -m "Title|Description|#ff0000"', 'Send Discord embed')
    .middleware((argv) => {
      // Execute the send command by default
      handleSendCommand(argv as SendCommandArgs);
    });
}