/**
 * Base interface for all notification platforms
 */
export interface NotificationPlatform {
  /**
   * Platform name (e.g., 'discord', 'telegram')
   */
  readonly name: string;

  /**
   * Send a message to the specified target
   * @param target - Channel ID, chat ID, or webhook URL
   * @param message - Message content
   * @param options - Additional options for formatting, etc.
   */
  sendMessage(target: string, message: string, options?: MessageOptions): Promise<MessageResult>;

  /**
   * Validate the configuration for this platform
   * @param config - Platform-specific configuration
   */
  validateConfig(config: any): boolean;

  /**
   * Test the connection/authentication for this platform
   */
  testConnection(): Promise<boolean>;
}

/**
 * Options for message formatting and delivery
 */
export interface MessageOptions {
  format?: 'plain' | 'markdown' | 'embed';
  silent?: boolean;
  title?: string;
  color?: string;
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
}

/**
 * Result of a message send operation
 */
export interface MessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: Date;
}

/**
 * Abstract base class for platform implementations
 */
export abstract class BasePlatform implements NotificationPlatform {
  abstract readonly name: string;

  abstract sendMessage(target: string, message: string, options?: MessageOptions): Promise<MessageResult>;
  abstract validateConfig(config: any): boolean;
  abstract testConnection(): Promise<boolean>;

  /**
   * Helper method to create a standardized error result
   */
  protected createErrorResult(error: string): MessageResult {
    return {
      success: false,
      error,
      timestamp: new Date()
    };
  }

  /**
   * Helper method to create a standardized success result
   */
  protected createSuccessResult(messageId?: string): MessageResult {
    return {
      success: true,
      messageId,
      timestamp: new Date()
    };
  }
}