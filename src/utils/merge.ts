type PlainObject = Record<string, any>;

export function merge<T extends PlainObject, U extends PlainObject>(
  target: T,
  source: U
): T & U {
  const result: PlainObject = { ...target };

  for (const key of Object.keys(source)) {
    const targetValue = target[key];
    const sourceValue = source[key];

    if (targetValue === undefined) {
      result[key] = sourceValue;
    } else if (isObject(targetValue) && isObject(sourceValue)) {
      result[key] = merge(targetValue, sourceValue);
    } else {
      result[key] = targetValue;
    }
  }

  return result as T & U;
}

function isObject(value: any): value is PlainObject {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}