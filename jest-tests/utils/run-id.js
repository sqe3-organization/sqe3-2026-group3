// Id of a run with the local date and time, for example 2026-11-22-21-05-33
const createRunId = (date = new Date()) => date.toLocaleString('sv-SE').replace(/[: ]/g, '-');

module.exports = { createRunId };
