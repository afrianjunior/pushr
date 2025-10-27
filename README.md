# 🚀 pushr

> A simple, powerful CLI tool for sending notifications across multiple platforms

[![npm version](https://badge.fury.io/js/notife.svg)](https://badge.fury.io/js/notife)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 💡 Why notife?

In today's fast-paced development world, staying informed about your applications, deployments, and system events is crucial. Whether you're:

- 🔄 **Deploying applications** and need to notify your team
- 📊 **Monitoring systems** and want alerts in your favorite chat platform
- 🤖 **Running automated scripts** that need to report their status
- 🎯 **Building CI/CD pipelines** with notification requirements

**notife** makes it incredibly easy to send notifications to Discord, Telegram, and other platforms with a single, unified command-line interface. No more juggling multiple APIs, webhook URLs, or platform-specific tools!

## ✨ Features

- 🎯 **Multi-platform support**: Discord, Telegram (more coming soon!)
- 🚀 **Zero-config start**: Automatic setup on first run
- 💻 **Cross-platform**: Works on Linux, macOS, and Windows
- 🔧 **Flexible configuration**: JSON-based config with environment variable support
- 🎨 **Rich formatting**: Support for markdown, embeds, and platform-specific features
- 📦 **Easy installation**: Use with `npx` - no global installation required
- 🔒 **Secure**: Keep your tokens safe in local configuration

## 🚀 Quick Start

### Using npx (Recommended)

The easiest way to get started is with `npx` - no installation required!

```bash
# First run - automatically creates configuration
npx pushr

# After configuration, send your first notification
npx pushr -m "Hello from pushr! 🎉"
```

### Installation

If you prefer to install globally:

```bash
npm install -g pushr
```

## 📋 Configuration

On your first run, pushr will automatically create a configuration file at `~/.pushr/config.json`. Here's what you need to set up:

### Discord Setup

1. Create a Discord application at [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a bot and copy the bot token
3. Invite the bot to your server with "Send Messages" permission
4. Get your channel ID (enable Developer Mode in Discord, right-click channel → Copy ID)

### Telegram Setup

1. Create a bot by messaging [@BotFather](https://t.me/botfather) on Telegram
2. Copy the bot token
3. Add the bot to your channel/group
4. Get your chat ID (you can use [@userinfobot](https://t.me/userinfobot))

### Example Configuration

```json
{
  "platforms": {
    "discord": {
      "token": "your_discord_bot_token",
      "channels": {
        "alerts": "123456789012345678",
        "general": "987654321098765432"
      }
    },
    "telegram": {
      "token": "your_telegram_bot_token",
      "channels": {
        "alerts": "-1001234567890",
        "general": "@your_channel_username"
      }
    }
  },
  "defaults": {
    "platform": "discord",
    "channel": "general"
  }
}
```

## 🎯 Usage

### Basic Usage

```bash
# Send to default platform and channel
npx pushr -m "Deployment completed successfully! ✅"

# Send to specific platform
npx pushr --discord -m "Server is back online"
npx pushr --telegram -m "Build finished"

# Send to specific channel
npx pushr --discord --channel alerts -m "Critical error detected!"
```

### Advanced Usage

```bash
# Dry run (see what would be sent without actually sending)
npx pushr --dry-run -m "Test message"

# Send with custom formatting (Discord)
npx pushr --discord -m "**Bold text** and *italic text*"

# Send to multiple platforms (coming soon!)
npx pushr --all -m "Important announcement"
```

### Environment Variables
You can override the config file location using:
```bash
export PUSHR_CONFIG_PATH=/path/to/your/config.json
```

### Command Line Options

```
Usage: pushr [options]

Options:
  -m, --message <text>     Message to send (required)
  --discord               Send to Discord
  --telegram              Send to Telegram
  --channel <name>        Target channel name
  --channelID <id>        Direct channel/chat ID
  --format <type>         Message format (plain, markdown, embed)
  --silent                Silent mode (no output)
  --config <path>         Custom config file path
  --dry-run              Show what would be sent without sending
  -h, --help             Show help
  -v, --version          Show version
```

## 🛠️ Development

### Setup
```bash
git clone https://github.com/juunnx/pushr.git
cd pushr
npm install
```

### Build
```bash
npm run build
```

### Test locally
```bash
# Test the built CLI
node dist/index.js --help

# Test with npx
npm pack
npm install -g pushr-*.tgz
```

## 🤝 Contributing

We love contributions! Whether it's:

- 🐛 Bug reports
- 💡 Feature requests
- 📖 Documentation improvements
- 🔧 Code contributions

Please feel free to open an issue or submit a pull request.

### Adding New Platforms

Want to add support for Slack, Microsoft Teams, or other platforms? Check out our [contribution guide](CONTRIBUTING.md) for details on how to implement new platform integrations.

## 📚 Examples

### CI/CD Integration

```bash
# GitHub Actions
- name: Notify deployment
  run: npx pushr --discord --channel deployments -m "🚀 Production deployment completed for ${{ github.sha }}"

# GitLab CI
script:
  - npx pushr --telegram -m "✅ Pipeline $CI_PIPELINE_ID completed successfully"
```

### System Monitoring

```bash
# Cron job for disk space monitoring
0 */6 * * * /usr/bin/npx pushr -m "💾 Disk usage: $(df -h / | awk 'NR==2{print $5}')"

# Docker container health check
npx pushr --discord --channel alerts -m "🐳 Container $CONTAINER_NAME is healthy"
```

### Development Workflow

```bash
# After successful tests
npm test && npx pushr -m "✅ All tests passed!"

# Database backup completion
pg_dump mydb > backup.sql && npx pushr -m "💾 Database backup completed"
```

## 🔒 Security

- 🔐 Tokens are stored locally in your home directory
- 🚫 No data is sent to external services except the target platforms
- 🛡️ Configuration files have restricted permissions (600)
- 🔍 Use `--dry-run` to verify messages before sending

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Bun](https://bun.com) for blazing fast performance
- Powered by [yargs](https://yargs.js.org/) for excellent CLI experience
- Inspired by the need for simple, unified notifications

---

<div align="center">

**Made with ❤️ for developers who love staying connected**

[Report Bug](https://github.com/yourusername/notife/issues) · [Request Feature](https://github.com/yourusername/notife/issues) · [Documentation](https://github.com/yourusername/notife/wiki)

</div>
