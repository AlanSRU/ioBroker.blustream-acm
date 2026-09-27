'use strict';

/**
 * Parser for the routing block of an `OUT ooo STATUS` detail response.
 *
 * Verified layout (ACM200 FW 2.26):
 *
 *     >>Fast   Fr    Vid/Aud/IR_/Ser/USB/CEC      HDR   MCast
 *       On     001   000/000/000/001/000/000      On    On
 *
 * `Fr` is the main route set by `OUT ooo FR yyy`. The slash field holds the
 * per-signal fixed routes set by `VFR`/`AFR`/`RFR`/`SFR`/`UFR`/`CFR`, where
 * `000` means the signal follows the main route. STATUS only reports the main
 * route, so this block is the only place a split route can be read back.
 */

/** Slash-field label prefix -> route kind */
const KIND_BY_LABEL = [
    [/^vid/i, 'video'],
    [/^aud/i, 'audio'],
    [/^ir/i, 'ir'],
    [/^(ser|rs)/i, 'rs232'],
    [/^usb/i, 'usb'],
    [/^cec/i, 'cec'],
];

/**
 * Find and parse the routing block.
 *
 * @param {string[]} lines - Response lines
 * @returns {{ main: string, routes: Record<string, string> } | null} The main route and the
 *   effective source per signal kind (a `000` entry resolved to the main route), or null when
 *   the block is missing or malformed
 */
function parseRouteBlock(lines) {
    const headerIdx = lines.findIndex(line => /\bFr\b/.test(line) && line.includes('Vid/Aud'));
    if (headerIdx === -1 || headerIdx + 1 >= lines.length) {
        return null;
    }

    const header = lines[headerIdx].trim().replace(/^>>/, '').split(/\s+/);
    const values = lines[headerIdx + 1].trim().split(/\s+/);

    // Prefer column alignment; fall back to the token shape if the columns do not line up
    const frCol = header.indexOf('Fr');
    const main = /^\d{3}$/.test(values[frCol]) ? values[frCol] : values.find(v => /^\d{3}$/.test(v));

    const slashCol = header.findIndex(h => h.includes('/'));
    const isSlashValue = v => /^\d{3}(\/\d{3})+$/.test(v || '');
    const slashValue = isSlashValue(values[slashCol]) ? values[slashCol] : values.find(isSlashValue);

    if (!main || slashCol === -1 || !slashValue) {
        return null;
    }

    const labels = header[slashCol].split('/');
    const fixed = slashValue.split('/');
    const routes = {};
    labels.forEach((label, i) => {
        const entry = KIND_BY_LABEL.find(([re]) => re.test(label));
        if (entry && fixed[i] !== undefined) {
            routes[entry[1]] = fixed[i] === '000' ? main : fixed[i];
        }
    });

    return { main, routes };
}

module.exports = { parseRouteBlock };
