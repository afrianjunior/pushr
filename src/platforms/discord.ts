import { BasePlatform, type MessageOptions, type MessageResult } from './base.js';
import { ConfigManager } from '../config/index.js';

/**
 * Discord platform implementation
 */
export class DiscordPlatform extends BasePlatform {
  readonly name = 'discord';
  private config: ConfigManager;

  constructor(config: ConfigManager) {
    super();
    this.config = config;
  }

  async sendMessage(target: string, message: string, options?: MessageOptions): Promise<MessageResult> {
    try {
      const token = this.config.getDiscordToken();
      if (!token) {
        return this.createErrorResult('Discord bot token not configured');
      }

      // Get channel ID
      const channelId = this.config.getDiscordChannel(target);
      if (!channelId) {
        return this.createErrorResult(`Invalid Discord channel: ${target}`);
      }

      return await this.sendBotMessage(token, channelId, message, options);
    } catch (error) {
      return this.createErrorResult(`Discord send error: ${error}`);
    }
  }

  /**
   * Send message via Discord bot API
   */
  private async sendBotMessage(token: string, channelId: string, message: string, options?: MessageOptions): Promise<MessageResult> {

    try {
      const payload = this.createBotPayload(message, options);
      const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return this.createErrorResult(`Bot API request failed: ${response.status} ${errorText}`);
      }

      const result = await response.json() as { id: string };
      return this.createSuccessResult(result.id);
    } catch (error) {
      return this.createErrorResult(`Bot API error: ${error}`);
    }
  }

  /**
   * Create payload for bot API message
   */
  private createBotPayload(message: string, options?: MessageOptions): any {
    const payload: any = {};

    if (options?.format === 'embed') {
      // Parse embed format: "Title|Description|Color"
      const parts = message.split('|');
      const embed: any = {
        title: parts[0] || 'Notification',
        description: parts[1] || message,
        timestamp: new Date().toISOString(),
      };

      if (parts[2]) {
        embed.color = parseInt(parts[2].replace('#', ''), 16);
      } else if (options.color) {
        embed.color = parseInt(options.color.replace('#', ''), 16);
      }

      if (options.fields) {
        embed.fields = options.fields;
      }

      payload.embeds = [embed];
    } else {
      payload.content = message;
    }

    return payload;
  }

  validateConfig(config: any): boolean {
    if (!config) return false;
    
    // Must have bot configuration
    return !!(config.bot && config.bot.token);
  }

  async testConnection(): Promise<boolean> {
    const token = this.config.getDiscordToken();
    if (!token) {
      return false;
    }

    try {
      const response = await fetch('https://discord.com/api/v10/users/@me', {
        headers: {
          'Authorization': `Bot ${token}`,
        },
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}