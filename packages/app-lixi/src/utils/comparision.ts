import _, { isEqual } from 'lodash';

const isEqualIgnoreUndefined = (a: any, b: any) => {
  if (_.isArray(a) || _.isArray(b)) return;
  if (!_.isObject(a) || !_.isObject(b)) return;

  if (!_.includes(a, undefined) && !_.includes(b, undefined)) return;

  // Call recursively, after filtering all undefined properties
  return _.isEqualWith(
    _.omitBy(a, value => value === undefined),
    _.omitBy(b, value => value === undefined),
    isEqualIgnoreUndefined
  );
};

export default isEqualIgnoreUndefined;
