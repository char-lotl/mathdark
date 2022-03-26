
const allInputs = document.querySelector('#all-inputs');
const killsOutput = document.querySelector('#kills-output');
const pointsKilledOutput = document.querySelector('#points-killed-output');
const kppOutput = document.querySelector('#kpp-output');
const killEfficacyOutput = document.querySelector('#kill-efficacy-output');

const profiles = {
  defense: 1,
  toughness: 1,
  quality: 5,
  attacks: 1,
  ap: 0,
  blast: 1,
  deadly: 1,
  poison: false,
  rending: false,
  relentless: false,
  defenderPPU: 0,
  defenderUnitSize: 1,
  attackerPPU: 0,
  attackerUnitSize: 1
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
  "tough-nine": 9,
  "tough-twelve": 12,
  "tough-fifteen": 15,
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

const blastParser = {
  "not-blast": 1,
  "blast-three": 3,
  "blast-six": 6,
  "blast-nine": 9,
  "blast-twelve": 12
};

const deadlyParser = {
  "not-deadly": 1,
  "deadly-three": 3,
  "deadly-six": 6
};

const unitSizeParser = {
  "size-one": 1,
  "size-three": 3,
  "size-five": 5,
  "size-ten": 10
};

const parseSelector = {
  "defense": defenseParser,
  "toughness": toughParser,
  "quality": qualityParser,
  "attacks": attacksParser,
  "ap": apParser,
  "blast": blastParser,
  "deadly": deadlyParser,
  "defenderUnitSize": unitSizeParser,
  "attackerUnitSize": unitSizeParser
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
  const blastFactor = p.blast > p.defenderUnitSize ? p.defenderUnitSize : p.blast;
  const rendFactor = p.rending ? effectiveDefense(ed, 4) / ed : 1;
  const poisonFactor = p.poison ? 3 : 1;
  const relentlessFactor = p.relentless ? 7/6 : 1;
  const expectedAttacks = p.attacks * relentlessFactor;
  const effectiveQuality = p.quality - 1 + rendFactor * poisonFactor;
  const expectedHits = expectedAttacks * effectiveQuality * blastFactor;
  const expectedWounds = expectedHits * ed / 36;
  return expectedWounds * kpw;
};

const displayValueIn = function(value, container) {
  container.textContent = value.toFixed(4);
}

const updateOutput = function() {
  const expectedKills = recompute(profiles);
  displayValueIn(expectedKills, killsOutput);

  if (profiles.defenderPPU != 0) {
    const pointsKilled = expectedKills * profiles.defenderPPU;
    displayValueIn(pointsKilled, pointsKilledOutput);
  }

  if (profiles.attackerPPU != 0) {
    const killsPerPoint = expectedKills / profiles.attackerPPU;
    displayValueIn(killsPerPoint, kppOutput);
  }

  if (profiles.defenderPPU != 0 && profiles.attackerPPU != 0) {
    const killEfficacy = expectedKills * profiles.defenderPPU / profiles.attackerPPU;
    displayValueIn(killEfficacy, killEfficacyOutput);
  }

};

updateOutput();

allInputs.addEventListener('change', e => {
  const changedFieldID = e.target.id;
  if (e.target.type === 'select-one') {
    profiles[changedFieldID] = parseSelector[changedFieldID][e.target.value];
  } else if (e.target.type === 'checkbox') {
    profiles[changedFieldID] = e.target.checked;
  } else if (e.target.type === 'number') {
    console.log(e.target.value);
    profiles[changedFieldID] = Number(e.target.value);
  } else {
    console.log(e.target.type);
    console.log(e.target.value);
  }
  updateOutput();

});
