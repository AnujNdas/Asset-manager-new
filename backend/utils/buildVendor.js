function buildVendor(incoming = {}, existing = {}) {
  return {
    name:
      incoming.name !== undefined
        ? incoming.name?.trim() || null
        : existing?.name ?? null,

    contact:
      incoming.contact !== undefined
        ? incoming.contact?.trim() || null
        : existing?.contact ?? null,

    supportEmail:
      incoming.supportEmail !== undefined
        ? incoming.supportEmail?.trim() || null
        : existing?.supportEmail ?? null,
  };
}

module.exports = buildVendor;