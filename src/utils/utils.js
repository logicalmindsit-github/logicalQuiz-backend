export const deepEqualObjectAnswer = (obj, obj2) => {
  const key1 = Object.keys(obj);
  const key2 = Object.keys(obj2);
  if (key1.length !== key2.length) {
    return false;
  }
  let isSuccess = true;
  for (const [key, value] of Object.entries(obj)) {
    const val = obj2[key];
    if (val !== value) {
      isSuccess = false;
      break;
    }
  }
  return isSuccess;
};
