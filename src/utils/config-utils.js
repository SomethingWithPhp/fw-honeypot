export const mergeConfigs = (configA, configB) => {
  configA ??= {}
  configB ??= {}

  const merged = {...configB}

  for (const [k, v] of Object.entries(configA)) {
    merged[k] ??= v
  }

  return merged
}
