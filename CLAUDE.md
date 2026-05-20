# CLAUDE.md — Blustream ACM200 Matrix Controller Adapter

> **Maintenance:** Update this file as changes are made during each session. Do not wait until end of session.

## Overview

ioBroker adapter for controlling Blustream ACM200 HDMI matrix distribution systems. Manages transmitters (sources) and receivers (displays) via telnet commands over TCP.

**Base path:** `blustream-acm200.0`
**Protocol:** Telnet (TCP socket on port 23)
**Source:** `main.js` (single file, ~2,500 lines)
**Credentials default:** admin / 1234

## Build & Test

No build step — plain JavaScript. Deploy by copying to ioBroker adapter directory.

## Communication Protocol

**Commands sent over telnet with `\r\n` termination:**
- `STATUS` — Full device status (transmitters + receivers + routes)
- `OUT{rxId}FR{txId}` — Route video+audio (e.g. `OUT001FR002`)
- `OUT{rxId}VFR{txId}` — Route video only
- `OUT{rxId}AFR{txId}` — Route audio only
- `IN{txId} AUD {SOURCE}` — Set transmitter audio source (HDMI/ANA — Auto blocked in UI)
- `OUT{id}` / `IN{id}` — Get detailed device info

**Response markers:** `[SUCCESS]...` or `[ERROR]...`. Multi-line responses end with `=====` separator lines.

## Command Queue

All commands are serialized through a queue to prevent garbled responses. Key behaviour:
- `executeCommand(command, timeout)` adds to queue
- 100ms delay between command completion and next command
- STATUS polling skips if queue is busy (`this.commandQueue.length > 0 || this.processingCommand`)
- Heartbeat also skips if queue is busy

## State Tree

```
system/status/{connected, lastUpdate, firmwareVersion, ...}
system/commands/{refresh, refreshAll}
transmitters/{id}/{id, name, ip, connected, edid, model, audioSource, previewUrl}
receivers/{id}/{id, name, ip, connected, route, videoRoute, audioRoute, resolution, mode, model, previewUrl}
```

- `receivers.{id}.route` — write to trigger video+audio routing
- `receivers.{id}.videoRoute` — write for video-only routing
- `receivers.{id}.audioRoute` — write for audio-only routing
- `transmitters.{id}.audioSource` — write to set audio source (validated: HDMI/ANA only)

## Configuration (io-package.json)

| Option | Default | Description |
|---|---|---|
| `host` | `192.168.0.225` | Device IP |
| `port` | `23` | Telnet port |
| `pollInterval` | `30000` | Status poll interval (ms) |
| `timeout` | `5000` | Command timeout (ms) |
| `username` | `admin` | Login username |
| `password` | `1234` | Login password |

## Timing Constants

| Value | Purpose |
|---|---|
| 10,000ms | Heartbeat interval |
| 15,000ms | Heartbeat timeout (1.5x interval) |
| 30,000ms | Status poll interval |
| 30,000ms | Reconnect delay |
| 100ms | Inter-command delay |
| 10,000ms | Command timeout |

## Key Methods

- `connectToACM()` — TCP socket connection, auth, test STATUS
- `executeCommand(command, timeout)` — Queue command
- `processNextCommand()` — Send next queued command with `\r\n`
- `processResponse(line)` — Parse incoming response line
- `refreshDeviceStatus()` — Poll STATUS (skips if queue busy)
- `refreshAllDeviceDetails()` — Full TX/RX detail refresh
- `routeVideo(txId, rxId)` / `routeVideoOnly()` / `routeAudioOnly()` — Routing commands
- `setTransmitterAudioSource(txId, source)` — Audio source command
- `parseTransmitters(data)` / `parseReceivers(data)` — STATUS response parsing

## Audio Source Notes

- Device reports Auto/HDMI/ANA via STATUS (case normalized to uppercase)
- Auto causes receiver dropout on IP200UHD-TX hardware — removed from UI selection
- Adapter validates only HDMI/ANA on write; Auto shown read-only if reported by device
- STATUS is always ground truth — always overwrites internal state on refresh

## Dependencies

- `@iobroker/adapter-core` — ioBroker framework
- `net` — Node.js native TCP socket (no npm dependency)

## Files

```
main.js              Core adapter (~2,500 lines)
io-package.json      Metadata & config schema
package.json         NPM config
admin/index_m.html   Configuration UI (Materialize CSS)
admin/words.js       i18n translations
admin/style.css      Blustream-branded styling
```
