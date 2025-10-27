import { BasePlatform, type MessageOptions, type MessageResult } from './base.js';
import { ConfigManager } from '../config/index.js';

/**
 * Telegram platform implementation
 */
export class TelegramPlatform extends BasePlatform {
  readonly name = 'telegram';
  private config: ConfigManager;

  constructor(config: ConfigManager) {
    super();
    this.config = config;
  }

  async sendMessage(target: string, message: string, options?: MessageOptions): Promise<MessageResult> {
    try {
      const token = this.config.getTelegramToken();
      if (!token) {
        return this.createErrorResult('Telegram bot token not configured');
      }

      // Resolve channel ID (chat ID in Telegram terms)
      const channelId = this.config.getTelegramChannel(target);
      if (!channelId) {
        return this.createErrorResult(`Invalid Telegram channel: ${target}`);
      }

      return await this.sendBotMessage(token, channelId, message, options);
    } catch (error) {
      return this.createErrorResult(`Telegram send error: ${error}`);
    }
  }

  /**
   * Send message via Telegram Bot API
   */
  private async sendBotMessage(token: string, channelId: string, message: string, options?: MessageOptions): Promise<MessageResult> {
    try {
      const payload = this.createMessagePayload(message, options);
      payload.chat_id = channelId;

      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json() as { description?: string };
        return this.createErrorResult(`Telegram API request failed: ${response.status} ${errorData.description || 'Unknown error'}`);
      }

      const result = await response.json() as { result: { message_id: number } };
      return this.createSuccessResult(result.result.message_id.toString());
    } catch (error) {
      return this.createErrorResult(`Telegram API error: ${error}`);
    }
  }

  /**
   * Create payload for Telegram message
   */
  private createMessagePayload(message: string, options?: MessageOptions): any {
    const payload: any = {
      text: message,
      disable_notification: options?.silent || false,
    };

    // Handle different message formats
    switch (options?.format) {
      case 'markdown':
        payload.parse_mode = 'MarkdownV2';
        payload.text = this.escapeMarkdownV2(message);
        break;
        
      case 'embed':
        // For Telegram, we'll format embeds as rich text with markdown
        payload.parse_mode = 'MarkdownV2';
        payload.text = this.formatAsEmbed(message, options);
        break;
        
      default:
        // Plain text - no special formatting
        break;
    }

    return payload;
  }

  /**
   * Format message as an embed-like structure for Telegram
   */
  private formatAsEmbed(message: string, options?: MessageOptions): string {
    const parts = message.split('|');
    const title = parts[0] || options?.title || 'Notification';
    const description = parts[1] || message;
    
    let formatted = `*${this.escapeMarkdownV2(title)}*\n\n`;
    formatted += this.escapeMarkdownV2(description);
    
    if (options?.fields && options.fields.length > 0) {
      formatted += '\n\n';
      for (const field of options.fields) {
        formatted += `*${this.escapeMarkdownV2(field.name)}:* ${this.escapeMarkdownV2(field.value)}\n`;
      }
    }
    
    return formatted;
  }

  /**
   * Escape special characters for MarkdownV2
   */
  private escapeMarkdownV2(text: string): string {
    // Characters that need to be escaped in MarkdownV2
    const specialChars = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'];
    let escaped = text;
    
    for (const char of specialChars) {
      escaped = escaped.replace(new RegExp('\\' + char, 'g'), '\\' + char);
    }
    
    return escaped;
  }

  validateConfig(config: any): boolean {
    if (!config) return false;
    
    // Must have bot configuration
    return !!(config.bot && config.bot.token);
  }

  async testConnection(): Promise<boolean> {
    const token = this.config.getTelegramToken();
    if (!token) {
      return false;
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      return response.ok;
    } catch {
      return false;
    }
  }
}