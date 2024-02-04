# slack-age

This is code for a Slack App running in Cloudflare. It adds a slash command `/age` that generates customized Age of Empires memes. Meme images are generated using the imgflip API.

To deploy you will need:
 * Cloudflare Account (https://cloudflare.com/)
 * An imgflip account to access their image API (https://imgflip.com/)
 * A custom Slash Command for Slack with authentication token (https://api.slack.com/slash-commands)

In Cloudflare, set the following environment variables for the worker. It is recommended that you encrypt these environment variables.

* `APP_IMGFLIP_PASS` - imgflip Password
* `APP_IMGFLIP_USER` - imgflip Username
* `APP_SLACK_SIGNING_SECRET` - Slack App Signing Secret
* `APP_SLACK_TOKEN` - Slack App Token