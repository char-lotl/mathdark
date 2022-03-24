
const bothInputs = document.querySelector('#both-inputs');
const killsOutput = document.querySelector('#kills-output');

let defense = 1;
let toughness = 1;

let quality = 5;
let attacks = 1;
let ap = 0;
let deadly = 1;

const profiles = {
  defense: 1,
  toughness: 1,
  quality: 5,
  attacks: 1,
  ap: 0,
  deadly: 1
};

const defenseParser = {
  "two-plus": 1,
  "three-plus": 2,
  "four-plus": 3,
  "five-plus": 4,
  "six-plus": 5
};

const toughParser = {
  "not-tough": 1,
  "tough-three": 3,
  "tough-six": 6,
  "tough-twelve": 12,
  "tough-eighteen": 18,
  "tough-twenty-four": 24
};

const qualityParser = {
  "two-plus": 5,
  "three-plus": 4,
  "four-plus": 3,
  "five-plus": 2,
  "six-plus": 1
};

const attacksParser = {
  "a1": 1,
  "a2": 2,
  "a3": 3,
  "a4": 4,
  "a5": 5,
  "a6": 6,
  "a8": 8,
  "a12": 12,
  "a15": 15,
  "a16": 16,
  "a18": 18,
  "a20": 20,
};

const apParser = {
  "not-ap": 0,
  "ap1": 1,
  "ap2": 2,
  "ap3": 3,
  "ap4": 4
};

const deadlyParser = {
  "not-deadly": 1,
  "deadly3": 3,
  "deadly6": 6
};

const parseSelector = {
  "defense": defenseParser,
  "toughness": toughParser,
  "quality": qualityParser,
  "attacks": attacksParser,
  "ap": apParser,
  "deadly": deadlyParser
};

const killsPerWound = function(d, t) {
  return d < t ? d / t : 1;
};

const effectiveDefense = function(d, ap) {
  const modifiedDef = d + ap;
  return modifiedDef <= 5 ? modifiedDef : 5;
}

const recompute = function(p) {
  const kpw = killsPerWound(p.deadly, p.toughness);
  const ed = effectiveDefense(p.defense, p.ap);
  const expectedWounds = p.attacks * p.quality * ed / 36;
  return expectedWounds * kpw;
};

const updateOutput = function() {
  const expectedKills = recompute(profiles);
  killsOutput.textContent = expectedKills;
};

bothInputs.addEventListener('change', e => {
  const changedFieldID = e.target.id;
  profiles[changedFieldID] = parseSelector[changedFieldID][e.target.value];
  updateOutput();
});
