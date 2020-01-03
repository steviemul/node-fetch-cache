const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const merge = (target, source) => {
  // 2 objects may require deep merging
  if (isObject(target) && isObject(source)) {
    for (const key of Object.keys(source)) {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(target, {[key]: source[key]});
        } else {
          target[key] = merge(target[key], source[key]);
        }
      } else if (!target[key]) {
        Object.assign(target, {
          [key]: source[key]
        });
      }
    }
  } else if (Array.isArray(target) && Array.isArray(source)) {
    // for arrays, just add in non existing values to target from source.
    target = target.slice();

    for (const value of Object.values(source)) {
      if (!target.includes(value)) {
        target.push(value);
      }
    }
  }

  return target;
};

module.exports = merge;
