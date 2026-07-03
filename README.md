# ioBroker.blustream-acm200

[![NPM version](https://img.shields.io/npm/v/iobroker.blustream-acm200.svg)](https://www.npmjs.com/package/iobroker.blustream-acm200)
[![Downloads](https://img.shields.io/npm/dm/iobroker.blustream-acm200.svg)](https://www.npmjs.com/package/iobroker.blustream-acm200)
![Number of Installations](https://iobroker.live/badges/blustream-acm200-installed.svg)
![Current version in stable repository](https://iobroker.live/badges/blustream-acm200-stable.svg)

[![NPM](https://nodei.co/npm/iobroker.blustream-acm200.png?downloads=true)](https://nodei.co/npm/iobroker.blustream-acm200/)

**Tests:** ![Test and Release](https://github.com/AlanSRU/ioBroker.blustream-acm200/workflows/Test%20and%20Release/badge.svg)

## Blustream ACM200 Matrix Controller for ioBroker

Controls a Blustream ACM200 matrix controller for HDMI-over-IP audio/video distribution. Discovers connected transmitters and receivers via the ACM200's telnet interface and exposes routing/status states for each.

## Features

- Automatic discovery of connected transmitters and receivers
- Video/audio routing control (combined and independent per stream)
- Transmitter audio source selection (AUTO / HDMI / ANA)
- "Route to all displays" commands (audio+video, video only, audio only)
- Status monitoring for all devices
- Preview image support (requires separate preview service)

## Installation

Install the adapter from the ioBroker admin interface (Adapters → search for "blustream").

## Configuration

### Main Settings

- **IP Address**: IP address of your ACM200 controller (default: 192.168.0.225)
- **Port**: Telnet port (default: 23)
- **Username**: ACM200 login (default: admin)
- **Password**: ACM200 password (default: 1234) — encrypted at rest

### Advanced Settings

- **Polling Interval (ms)**: How often to poll for status updates (default: 30000)
- **Command Timeout (ms)**: Timeout for commands sent to the ACM200 (default: 5000)

## States

### System

- `info.connection` — Connection status to the ACM200
- `system.status.connected` — Same as info.connection (legacy)
- `system.status.lastUpdate` — Timestamp of the last status update
- `system.commands.refresh` — Trigger a manual refresh of all status information
- `system.commands.refreshAll` — Force a complete state rebuild
- `system.commands.routeAll` — Write a transmitter ID to route audio + video to all displays
- `system.commands.routeAllVideo` — Write a transmitter ID to route video only to all displays
- `system.commands.routeAllAudio` — Write a transmitter ID to route audio only to all displays

### Transmitters (per transmitter)

- `transmitters.<id>.id` — Transmitter ID
- `transmitters.<id>.name` — Display name
- `transmitters.<id>.ip` — IP address
- `transmitters.<id>.connected` — Connection status
- `transmitters.<id>.edid` — EDID setting
- `transmitters.<id>.audioSource` — Audio source selection (AUTO/HDMI/ANA)
- `transmitters.<id>.previewUrl` — URL to preview image (if preview service is enabled)

### Receivers (per receiver)

- `receivers.<id>.id` — Receiver ID
- `receivers.<id>.name` — Display name
- `receivers.<id>.ip` — IP address
- `receivers.<id>.connected` — Connection status
- `receivers.<id>.route` — Combined audio+video route (write a transmitter ID)
- `receivers.<id>.videoRoute` — Video-only route
- `receivers.<id>.audioRoute` — Audio-only route
- `receivers.<id>.resolution` — Output resolution
- `receivers.<id>.previewUrl` — URL to preview image

## Usage examples

Route transmitter 2 to receiver 1:

```javascript
setState('blustream-acm200.0.receivers.001.route', '002');
```

Route transmitter 3 to all receivers:

```javascript
setState('blustream-acm200.0.system.commands.routeAll', '003');
```

## Troubleshooting

- If the adapter cannot connect, verify the IP address, port, and that the ACM200's telnet interface is enabled.
- If transmitters or receivers are missing after start-up, trigger a refresh via `system.commands.refresh`.
- Enable debug logging in Admin → instance → log level to see telnet traffic.

## Changelog
<!--
	Placeholder for the next version (at the beginning of the line):
	### __WORK IN PROGRESS__
-->
### __WORK IN PROGRESS__
- (Alan Paris) Resolve adapter-checker errors: use framework-managed timers, add missing config help translations, and clean up redundant devDependencies

### 0.2.2 (2026-07-02)
- (Alan Paris) Corrected state roles (routing/audio selectors, connection status, device info) for object-checker compliance

### 0.2.1 (2026-05-20)
- (Alan Paris) Bundle adapter icon in the npm tarball

### 0.2.0 (2026-05-20)
- (Alan Paris) Add `routeAll`, `routeAllVideo`, `routeAllAudio` commands to route a source to every display in one call
- (Alan Paris) Modernized internal tooling (release-script, ESLint 9, ioBroker testing actions, trusted publishing)

### 0.1.0
- (Alan Paris) Initial release: transmitter/receiver discovery, video and audio routing (combined and independent), transmitter audio source selection

## License

MIT License

Copyright (c) 2026 Alan Paris <alan.paris@scottish.rugby>

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
