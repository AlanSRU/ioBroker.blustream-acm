'use strict';

/**
 * Per-model capability and command definitions for Blustream ACM controllers.
 *
 * `features` gates which states the adapter exposes and which actions it will
 * accept for a given model. A feature that is absent/falsy means the model does
 * not support it — the corresponding states are not created and writes are
 * rejected.
 *
 * `commands` builds the exact telnet command string for each supported action:
 *   - ACM200 uses the compact, no-space routing form (`OUT001FR002`) that is
 *     verified working on real hardware. DO NOT change it.
 *   - ACM210 / ACM500 / ACM1000 use the spaced form documented in their API
 *     guides (`OUT 001 FR 002`).
 *
 * A command builder is only present when the model supports that action; callers
 * must check `features` (or the builder's existence) before invoking it.
 *
 * Scope note: this iteration implements Tiers 1–3 (routing + breakaway, output
 * power/mute, audio matrix + ARC). Model-exotic features (Video Wall, Multiview,
 * Secondary Stream, Presets/Groups/Macros/Scheduler, GPIO, resolution) are
 * intentionally omitted and can be added as additive entries later.
 */

/**
 * Zero-pad a port id to 3 digits ('2' -> '002').
 *
 * @param {string|number} id - Port id
 * @returns {string} 3-digit zero-padded id
 */
function pad(id) {
    return String(id).padStart(3, '0');
}

/**
 * Compact command form used by the ACM200 (no spaces in the OUT…FR routing
 * tokens). The audio-source command keeps its single spaces, matching the
 * verified working ACM200 behaviour.
 */
const compactCommands = {
    routeVideoAudio: (rx, tx) => `OUT${pad(rx)}FR${pad(tx)}`,
    routeVideo: (rx, tx) => `OUT${pad(rx)}VFR${pad(tx)}`,
    routeAudio: (rx, tx) => `OUT${pad(rx)}AFR${pad(tx)}`,
    setAudioSource: (tx, src) => `IN${pad(tx)} AUD ${src}`,
};

/**
 * Spaced command form documented for the ACM210 / ACM500 / ACM1000 API guides.
 */
const spacedCommands = {
    routeVideoAudio: (rx, tx) => `OUT ${pad(rx)} FR ${pad(tx)}`,
    routeVideo: (rx, tx) => `OUT ${pad(rx)} VFR ${pad(tx)}`,
    routeAudio: (rx, tx) => `OUT ${pad(rx)} AFR ${pad(tx)}`,
    routeIR: (rx, tx) => `OUT ${pad(rx)} RFR ${pad(tx)}`,
    routeRS232: (rx, tx) => `OUT ${pad(rx)} SFR ${pad(tx)}`,
    routeUSB: (rx, tx) => `OUT ${pad(rx)} UFR ${pad(tx)}`,
    routeCEC: (rx, tx) => `OUT ${pad(rx)} CFR ${pad(tx)}`,
    setAudioSource: (tx, src) => `IN ${pad(tx)} AUD ${src}`,
    outputPower: (rx, on) => `OUT ${pad(rx)} ${on ? 'ON' : 'OFF'}`,
    outputMute: (rx, on) => `OUT ${pad(rx)} MUTE ${on ? 'ON' : 'OFF'}`,
    // Tier 3 — audio matrix. `mode` is the raw AUDxx / ARC token (validated by
    // the caller against the mode maps below).
    audioOutput: (rx, mode) => `OUT ${pad(rx)} ${mode}`,
    audioInput: (tx, mode) => `IN ${pad(tx)} ${mode}`,
    arc: (rx, mode) => `OUT ${pad(rx)} ARC ${mode}`,
};

/**
 * Output-side audio matrix paths (`OUT ooo AUDxx`). Key = command token, value
 * = human label. Source→destination: S=SPDIF, H=HDMI, A=Analogue, D=Dante.
 */
const AUDIO_OUTPUT_MODES = {
    AUDHH: 'HDMI → HDMI',
    AUDHA: 'HDMI → Analogue',
    AUDHD: 'HDMI → Dante',
    AUDSD: 'SPDIF → Dante',
    AUDDA: 'Dante → Analogue',
    AUDDH: 'Dante → HDMI',
};

/** Input-side audio matrix paths (`IN iii AUDxx`). */
const AUDIO_INPUT_MODES = {
    AUDHH: 'HDMI → HDMI',
    AUDHA: 'HDMI → Analogue',
    AUDHD: 'HDMI → Dante',
    AUDAH: 'Analogue → HDMI',
    AUDAD: 'Analogue → Dante',
    AUDDA: 'Dante → Analogue',
    AUDDH: 'Dante → HDMI',
};

/** ARC modes (`OUT ooo ARC xxx`). */
const ARC_MODES = {
    OFF: 'Off',
    HDMI: 'HDMI',
    OPT: 'Optical',
};

const MODELS = {
    ACM200: {
        label: 'ACM200',
        features: {
            routeVideoAudio: true,
            routeVideo: true,
            routeAudio: true,
            audioSource: true,
        },
        commands: compactCommands,
    },
    ACM210: {
        label: 'ACM210',
        features: {
            routeVideoAudio: true,
            routeVideo: true,
            routeAudio: true,
            routeIR: true,
            routeRS232: true,
            routeUSB: true,
            routeCEC: true,
            outputPower: true,
            outputMute: true,
            audioSource: true,
            audioMatrix: true,
            arc: true,
        },
        commands: spacedCommands,
    },
    ACM500: {
        label: 'ACM500',
        features: {
            routeVideoAudio: true,
            routeVideo: true,
            routeAudio: true,
            routeIR: true,
            routeRS232: true,
            routeUSB: true,
            routeCEC: true,
            outputPower: true,
            outputMute: true,
            audioSource: true,
            // No Dante audio matrix / ARC on the ACM500.
        },
        commands: spacedCommands,
    },
    ACM1000: {
        label: 'ACM1000',
        features: {
            routeVideoAudio: true,
            routeVideo: true,
            routeAudio: true,
            routeIR: true,
            routeRS232: true,
            routeUSB: true,
            routeCEC: true,
            outputPower: true,
            outputMute: true,
            audioSource: true,
            audioMatrix: true,
            arc: true,
        },
        commands: spacedCommands,
    },
};

/** Default model when config is missing or invalid. */
const DEFAULT_MODEL = 'ACM200';

/**
 * Resolve a configured model id to its definition, falling back to the default.
 *
 * @param {string} model - Configured model id (e.g. 'ACM500')
 * @returns {{id: string, def: object, valid: boolean}} resolved model
 */
function resolveModel(model) {
    const id = typeof model === 'string' ? model.trim().toUpperCase() : '';
    if (MODELS[id]) {
        return { id, def: MODELS[id], valid: true };
    }
    return { id: DEFAULT_MODEL, def: MODELS[DEFAULT_MODEL], valid: false };
}

module.exports = {
    MODELS,
    DEFAULT_MODEL,
    resolveModel,
    pad,
    AUDIO_OUTPUT_MODES,
    AUDIO_INPUT_MODES,
    ARC_MODES,
};
