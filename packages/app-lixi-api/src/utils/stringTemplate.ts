function isObj(obj: any): boolean {
  return obj !== null && typeof (obj) === 'object';
}

/**
 * @description get nested properties from a given
 * object using dot notation
 *
 * @method prop
 *
 * @param  {Object} obj
 * @param  {String} path
 *
 * @return {Mixed}
 */
function prop(obj: any, path: string) {
  if (!isObj(obj) || typeof path !== 'string') {
    return obj;
  }
  const pathArr = path.split('.');
  for (let i = 0; i < pathArr.length; i++) {
    const p = pathArr[i];
    obj = obj.hasOwnProperty(p) ? obj[p] : null;
    if (obj === null) {
      break;
    }
  }
  return;
}

/**
 * @description parses a given template string and
 * replace dynamic placeholders with actual data.
 *
 * @method pope
 *
 * @param  {String} string
 * @param  {Object} data
 *
 * @return {String}
 */
export function template(input: string, data: Object, options?: { skipUndefined: boolean, throwOnUndefined: boolean }): string {
  options = options || { skipUndefined: false, throwOnUndefined: false };

  const regex = /{{2}(.+?)}{2}/g;

  let result;
  let formattedString = input;

  while ((result = regex.exec(input)) !== null) {
    const item = result[1].trim();
    if (item) {
      const value = prop(data, item);
      if (value !== undefined && value !== null) {
        formattedString = formattedString.replace(result[0], value);
      } else if (options.throwOnUndefined) {
        const error = new Error('Missing value for ' + result[0])
        throw error
      } else if (!options.skipUndefined) {
        formattedString = formattedString.replace(result[0], '');
      }
    }
  }
  return formattedString;

}

