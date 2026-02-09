# ioBroker.blustream-acm200

![Logo](admin/blustream-acm200.png)

[![NPM version](https://img.shields.io/npm/v/iobroker.blustream-acm200.svg)](https://www.npmjs.com/package/iobroker.blustream-acm200)
[![Downloads](https://img.shields.io/npm/dm/iobroker.blustream-acm200.svg)](https://www.npmjs.com/package/iobroker.blustream-acm200)
[![Dependency Status](https://img.shields.io/david/yourgithub/iobroker.blustream-acm200.svg)](https://david-dm.org/yourgithub/iobroker.blustream-acm200)
[![Known Vulnerabilities](https://snyk.io/test/github/yourgithub/ioBroker.blustream-acm200/badge.svg)](https://snyk.io/test/github/yourgithub/ioBroker.blustream-acm200)

[![NPM](https://nodei.co/npm/iobroker.blustream-acm200.png?downloads=true)](https://nodei.co/npm/iobroker.blustream-acm200/)

## Blustream ACM200 Matrix Controller for ioBroker

This adapter allows you to control a Blustream ACM200 matrix controller for audio/video distribution over IP.

## Features

* Automatic discovery of connected transmitters and receivers
* Video/audio routing control
* Status monitoring for all devices
* Preview image support (requires separate preview service)
* Integration with other ioBroker adapters

## Installation

1. Install the adapter from NPM
   ```
   npm install iobroker.blustream-acm200
   ```

2. Add an instance of the adapter in the ioBroker admin interface

3. Configure the adapter with the IP address and credentials for your ACM200 controller

## Configuration

### Main Settings

* **IP Address**: The IP address of your ACM200 controller (default: 192.168.0.225)
* **Port**: The Telnet port of your ACM200 controller (default: 23)
* **Username**: The username for the ACM200 controller (default: admin)
* **Password**: The password for the ACM200 controller (default: 1234)

### Advanced Settings

* **Polling Interval**: How often to poll for status updates, in milliseconds (default: 30000)
* **Command Timeout**: Timeout for commands sent to the ACM200, in milliseconds (default: 5000)

## States

The adapter creates the following states:

### System States

* **system.status.connected**: Connection status to the ACM200
* **system.status.lastUpdate**: Timestamp of the last status update
* **system.commands.refresh**: Trigger a manual refresh of all status information

### Transmitter States (for each transmitter)

* **transmitters.[id].id**: Transmitter ID
* **transmitters.[id].name**: Name of the transmitter
* **transmitters.[id].ip**: IP address of the transmitter
* **transmitters.[id].connected**: Connection status of the transmitter
* **transmitters.[id].edid**: EDID setting of the transmitter
* **transmitters.[id].previewUrl**: URL to the preview image

### Receiver States (for each receiver)

* **receivers.[id].id**: Receiver ID
* **receivers.[id].name**: Name of the receiver
* **receivers.[id].ip**: IP address of the receiver
* **receivers.[id].connected**: Connection status of the receiver
* **receivers.[id].route**: Current transmitter ID that the receiver is displaying
* **receivers.[id].resolution**: Output resolution of the receiver
* **receivers.[id].previewUrl**: URL to the preview image

## Usage

### Routing Video

To route a transmitter (source) to a receiver (display), simply set the `receivers.[id].route` state to the transmitter ID:

```javascript
setState('blustream-acm200.0.receivers.001.route', '002');  // Route transmitter 2 to receiver 1
```

### Routing to All Receivers

You can use a script to route a transmitter to all receivers:

```javascript
// Route transmitter 3 to all receivers
const adapter = 'blustream-acm200.0';
const txId = '003';

// Get all receivers
$('state[id=' + adapter + '.receivers.*.id]').each(function(id, i) {
    const rxId = id.split('.').pop();
    setState(adapter + '.receivers.' + rxId + '.route', txId);
});
```

## Integration with Web Interface

This adapter works seamlessly with the provided drag and drop web interface. The web interface displays all transmitters and receivers with preview images and allows for intuitive routing.

## Troubleshooting

* If the adapter cannot connect to the ACM200, check the IP address and port settings
* If transmitters or receivers are missing, try triggering a manual refresh using the `system.commands.refresh` state
* Check the ioBroker logs for detailed error messages

## Changelog

### 1.0.0 (2023-10-01)
* Initial release

## License

MIT License

Copyright (c) 2023 Your Name <your.email@example.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.