const Slack = require(`./Slack`);
const Docker = require(`dockerode`);
const docker = new Docker();
const dockerCompose = require(`docker-compose`);
const fs = require(`fs`);
const composePath = `/docker-compose`;
const composeFilePath = `${composePath}/${process.env.COMPOSE_FILE_NAME || `docker-compose.yml`}`;
const yaml = require(`yaml`);
const _ = require(`lodash`);

module.exports = class Monit {

  constructor () {
    this.serverLess = false;
    this.slack = new Slack();
    this.composeFile = null;
    this.dockerComposeContent = null;
    this.servicesNames = [];
    this.composeServicesNames = [];
    this.init();
  }

  init () {
    if (!process.env.PROJECT_NAME) {
      throw new Error(`Err: PROJECT_NAME env variable is missing`);
    }
    if (!process.env.SOCKET_URL) {
      console.info(`Info: SOCKET_URL env variable is missing, running in serverless mode.`);
      this.serverLess = true;
    }
    if (!fs.existsSync(composePath)) {
      throw new Error(`Err: Compose path "${composePath}" does not exist or is not readable`);
    }
    if (!fs.existsSync(composeFilePath)) {
      throw new Error(`Err: Compose file "${composeFilePath}" does not exist or is not readable, please tell me what is the docker-compose.yml file name with COMPOSE_FILE_NAME env variable if it is different from the default one.`);
    }

    this.composeFile = fs.readFileSync(composeFilePath, 'utf8');
    this.dockerComposeContent = yaml.parse(this.composeFile);
    for (const service in this.dockerComposeContent.services) {
      this.composeServicesNames.push(`${process.env.PROJECT_NAME}_${service}`);
    }
  }

  async main () {
    setTimeout(async () => await this.checkAvailability(this), 1000);
  }

  async checkAvailability (that) {
    const runningContainers = await docker.listContainers();
    that.servicesNames = [];
    for (const container of runningContainers) {
      const name = container.Names[0];
      const firstSplit = name.split(`/`);
      const splitedName = firstSplit[1].split(`_`);
      splitedName.pop();
      const serviceName = splitedName.join(`_`);
      that.servicesNames.push(serviceName);
      if (container.State === `running`) {
        await that.serviceUp(serviceName);
      } else {
        await that.serviceDown(serviceName);
      }
    }

    for (const aRunningService of that.composeServicesNames) {
      const service = _.indexOf(that.servicesNames, aRunningService);
      if (service !== -1) {
        that.serviceUp(aRunningService);
      } else {
        that.serviceDown(aRunningService);
      }
    }
    setTimeout(async () => await that.checkAvailability(that), 5000);
  }

  async serviceDown (serviceName) {
    await this.slack.notifyDown(serviceName);
  }

  async serviceUp (serviceName) {
    await this.slack.notifyUp(serviceName);
  }
};