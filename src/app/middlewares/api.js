export default function api() {
  return next => action => {
    const result = next(action);
    return result;
  };
}
