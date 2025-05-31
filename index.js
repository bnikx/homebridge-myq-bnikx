const myq = require('./myq-api');

let Service, Characteristic;

module.exports = (homebridge) => {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-myq-custom", "MyQGarage", MyQGarage);
};

class MyQGarage {
  constructor(log, config) {
    this.log = log;
    this.username = config.username;
    this.password = config.password;
    this.name = config.name || "MyQ Garage";

    this.service = new Service.GarageDoorOpener(this.name);

    this.service
      .getCharacteristic(Characteristic.CurrentDoorState)
      .onGet(() => this.getCurrentState());

    this.service
      .getCharacteristic(Characteristic.TargetDoorState)
      .onSet((value) => this.setTargetState(value));

    this.service
      .getCharacteristic(Characteristic.ObstructionDetected)
      .onGet(() => false);
  }

  async getCurrentState() {
    const state = await myq.getDoorState(this.username, this.password);
    return state === 'open' ? 0 : 1; // 0: open, 1: closed
  }

  async setTargetState(value) {
    const desired = value === 0 ? 'open' : 'close';
    await myq.setDoorState(this.username, this.password, desired);
  }

  getServices() {
    return [this.service];
  }
}
