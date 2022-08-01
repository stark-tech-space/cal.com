const regionCharWeight: Record<string, number> = {
  A: 1,
  B: 10,
  C: 19,
  D: 28,
  E: 37,
  F: 46,
  G: 55,
  H: 64,
  I: 39,
  J: 73,
  K: 82,
  L: 2,
  M: 11,
  N: 20,
  O: 48,
  P: 29,
  Q: 38,
  R: 47,
  S: 56,
  T: 65,
  U: 74,
  V: 83,
  W: 21,
  X: 3,
  Y: 12,
  Z: 30,
};

export default function isIdNumber(id: string) {
  const residenceReg = /^[A-Z]{1}[ABCD]{1}[0-9]{8}/;
  const idReg = /^[A-Z]{1}[1289]{1}[0-9]{8}$/;

  if (!idReg.test(id)) {
    return residenceReg.test(id);
  }
  const [region, ...rest] = id.split('');
  const checkNum = rest.pop() || '-1';

  const acc =
    rest.reduce((prev, cur, index) => prev + parseInt(cur) * (8 - index), 0) +
    regionCharWeight[region];

  const computedCheckNum = (10 - (acc % 10)) % 10;
  return computedCheckNum === parseInt(checkNum);
}
