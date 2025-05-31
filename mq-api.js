const axios = require('axios');

let authToken = null;
let deviceId = null;

async function login(username, password) {
  const response = await axios.post('https://api.myqdevice.com/api/v5/Login', {
    Username: username,
    Password: password
  }, {
    headers: {
      "User-Agent": "myQHomeBridgePlugin/1.0"
    }
  });

  authToken = response.data.SecurityToken;
  return authToken;
}

async function getDevice(username, password) {
  if (!authToken) await login(username, password);

  const resp = await axios.get('https://api.myqdevice.com/api/v5.1/Accounts/{accountId}/Devices', {
    headers: {
      "Authorization": `Bearer ${authToken}`
    }
  });

  const door = resp.data.items.find(item => item.device_family === "garagedoor");
  if (door) {
    deviceId = door.serial_number;
    return door;
  }

  throw new Error("Garage door not found");
}

async function getDoorState(username, password) {
  const device = await getDevice(username, password);
  return device.state.door_state.toLowerCase();
}

async function setDoorState(username, password, desiredState) {
  if (!deviceId) await getDevice(username, password);

  await axios.put(`https://api.myqdevice.com/api/v5.1/Accounts/{accountId}/Devices/${deviceId}/actions`, {
    action_type: desiredState === 'open' ? "open" : "close"
  }, {
    headers: {
      "Authorization": `Bearer ${authToken}`
    }
  });
}

module.exports = {
  getDoorState,
  setDoorState
};
