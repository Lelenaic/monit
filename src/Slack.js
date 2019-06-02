const slackNotify = require(`slack-notify`);
const _ = require(`lodash`);
const publicationChanel = process.env.SLACK_CHANEL || `monitoring`;

module.exports = class Slack {
  constructor () {
    this.hasSlack = false;
    this.notifiedDown = [];
    if (process.env.SLACK_WEBHOOK) {
      console.info(`Slack webhook enabled`);
      this.hasSlack = true;
      this.slack = slackNotify(process.env.SLACK_WEBHOOK);
      this.slackOptions = {
        chanel: publicationChanel,
        username: `Monit Agent`,
        icon_url: `https://i.ibb.co/8mPSXMC/te-le-chargement.jpg`,
      };
      this.slack.send({
        ...this.slackOptions,
        text: `Slack notifications registered with docker monit agent.`,
      });
    }
  }

  async notifyDown (serviceName) {
    if (this.hasSlack && !this.isNotifiedDown(serviceName)) {
      await this.slack.send({
        ...this.slackOptions,
        text: `Hum, it looks like ${serviceName} is down on ${process.env.SERVER_NAME || `default server`}.`,
      });
      this.notifiedDown.push(serviceName);
    }
  }

  async notifyUp (serviceName) {
    if (this.hasSlack && this.isNotifiedDown(serviceName)) {
      await this.slack.send({
        ...this.slackOptions,
        text: `Hurray, ${serviceName} is up on ${process.env.SERVER_NAME || `default server`} !`,
      });
      _.remove(this.notifiedDown, service => service === serviceName);
    }
  }

  isNotifiedDown (serviceName) {
    return _.indexOf(this.notifiedDown, serviceName) !== -1;
  }
}