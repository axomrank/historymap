'use strict';
// Preserve feature-local citation IDs while keeping bibliographic records in one registry.
(function (root) {
  function hydrate(records, registry) {
    const { sourceSet, ...data } = records;
    if (!sourceSet || !Object.hasOwn(registry, sourceSet)) throw new Error(`Unknown source set: ${sourceSet}`);
    return { ...data, sources: registry[sourceSet] };
  }
  const api = { hydrate };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AtlasDatasets = api;
})(typeof window === 'object' ? window : globalThis);
