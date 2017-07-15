'use strict';
var clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;
//var clientFromConnectionString = require('azure-iot-device-http').clientFromConnectionString;
var Message = require('azure-iot-device').Message;

var IoTDevice = (function() {
  // コンストラクタ
  var IoTDevice = function(hostName, deviceId, accessKey) {
      if(!(this instanceof IoTDevice)) {
          return new IoTDevice(hostName, deviceId, accessKey);
      }
      this.hostName = hostName;
      this.deviceId = deviceId;
      this.accessKey = accessKey;
      var connectionString = 'HostName=' + hostName + ';DeviceId=' + deviceId + ';SharedAccessKey=' + accessKey;
      this.client = clientFromConnectionString(connectionString);
      this.client.open(function (err) {
        if (err) {
          console.log('Could not connect: ' + err);
        } else {
          console.log('Client connected');
        }
      });
  }

  var p = IoTDevice.prototype;

  // プロトタイプ内でメソッドを定義
  p.send = function(val) {
    var data = JSON.stringify({ deviceId: this.deviceId, lux: val });
    var message = new Message(data);
    console.log("Sending message: " + message.getData());
    this.client.sendEvent(message, function (err) {
      if (err) {
          console.log('send error: ' + err);
      } else {
        console.log('send success');
      }
    });
  }

  return IoTDevice;
})();

var device = new IoTDevice('twintest.azure-devices.net', 'myFirstNodeDevice', '4PyCv2pxj0VMXs/3+05KK251f3L7RV92EARmRZWIQ2E=');

//setInterval(function(){
//    var lux = Math.floor(Math.random() * 180);
//    device.send(lux);
//}, 1000);



var ws = require("websocket.io");
var server = ws.listen(8080,
  function () {
    console.log("ws start");
  }
);

server.on("connection",
  function(socket) {
    socket.on("message",
      function(data) {
        console.log(data);
        device.send(parseInt(data));
        //server.clients.forEach(
        //  function(client) {
        //    client.send(data);
        //  }
        //);
      }
    );
  }
);
