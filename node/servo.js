'use strict';

// シリアルポートに定期的に書き込んではデータを受け取る
// パーストークンは \n
// 1秒おき送信

const SerialPort = require('serialport');
var g_angle = 0;
var g_dir = 1;

const port = new SerialPort('/dev/tty96B0', {
  parser: SerialPort.parsers.readline('\n'),
  baudrate: 9600
});

port.on('open', function () {
  console.log('Serial open.');
  //setInterval(setAngle, 100);
});

port.on('data', function (data) {
  console.log('> ' + data);
});

function write(data) {
  console.log(data);
  var str = data + '\n';
  port.write(new Buffer(str), function(err, results) {
    if(err) {
      console.log('Err: ' + err);
      console.log('Results: ' + results);
    }
  });
}

function setAngle() {
  console.log();
  g_angle = g_angle + g_dir;
  if ( g_angle <= 0) {
    g_dir = 1;
  } else if (g_angle >= 180) {
    g_dir = -1;
  }
  write(g_angle);
}





var EventHubClient = require('azure-event-hubs').Client;
var connectionString = 'HostName=twintest.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=aH23urz+48JHl0JQuNOxcnJAU76bY23fyZs6eR6p+SE=';
//var connectionString = 'HostName=iotkithandson.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=1CB3UjpoNLLoxc8MAg7CsGfXAdU4bw0lRp0Zhlz0r+w=';

var printError = function (err) {
  console.log(err.message);
};

var printMessage = function (message) {
  console.log('Message received: ');
//  console.log(JSON.stringify(message.body));
  var str = JSON.stringify(message.body.lux);
  write(parseInt(str));
  //console.log(str);
  //console.log('');
};

var client = EventHubClient.fromConnectionString(connectionString);
client.open()
    .then(client.getPartitionIds.bind(client))
    .then(function (partitionIds) {
        return partitionIds.map(function (partitionId) {
            return client.createReceiver('$Default', partitionId, { 'startAfterTime' : Date.now()}).then(function(receiver) {
                console.log('Created partition receiver: ' + partitionId)
                receiver.on('errorReceived', printError);
                receiver.on('message', printMessage);
            });
        });
    })
    .catch(printError);

