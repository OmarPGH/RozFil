function isJsonObjectOrArray(value) {
  if (typeof value !== 'string') return false;

  try {
    const parsed = JSON.parse(value);
    return parsed !== null && typeof parsed === 'object';
  } catch {
    return false;
  }
}

export { isJsonObjectOrArray };
