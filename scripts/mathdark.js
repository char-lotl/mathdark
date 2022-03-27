
const allInputs = document.querySelector('#all-inputs');
const killsOutput = document.querySelector('#kills-output');
const pointsKilledOutput = document.querySelector('#points-killed-output');
const kppOutput = document.querySelector('#kpp-output');
const killEfficacyOutput = document.querySelector('#kill-efficacy-output');

const profiles = {
  defense: 1,
  toughness: 1,
  regeneration: false,
  stealth: false,
  quality: 5,
  attacks: 1,
  ap: 0,
  blast: 1,
  deadly: 1,
  poison: false,
  rending: false,
  relentless: false,
  sniper: false,
  lockOn: false,
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

const killsPerWound = function(d, t, regen, rendFrac) {
  if (!regen) {
    return d < t ? d / t : 1;
  }
  const nonRendFrac = 1 - rendFrac;
  if (d === 1) {
    return 1 / t * (1 - (nonRendFrac / 3));
  }
  if (t === 1) {
    return 1 - nonRendFrac * ((1/3) ** d);
  }
  const damDist = (d === 3) ? [0, 6/26, 12/26, 8/26] :
  [0, 12/728, 60/728, 160/728, 240/728, 192/728, 64/728];
  const discount = (d === 3) ? 26/27 : 728 / 729;
  const woundDist = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  for (let i = 0; i < t; i++) {
    for (let j in damDist) {
      j = Number(j);
      if (i + j < t) {
        woundDist[i + j] += woundDist[i] * damDist[j] * nonRendFrac;
      }
    }
    if (i + d < t) {
      woundDist[i + d] += woundDist[i] * rendFrac;
    }
  }
  const sum = woundDist.reduce((partialSum, a) => partialSum + a, 0);
  return discount / sum;
};

const effectiveDefense = function(d, ap) {
  const modifiedDef = d + ap;
  return modifiedDef <= 5 ? modifiedDef : 5;
}

/*const effectiveQuality = function(p, ed) {
  const poisonFactor = p.poison ? 3 : 1;
  const rendFactor = p.rending ? effectiveDefense(ed, 4) / ed : 1;
  const snipeQuality = p.sniper ? 5 : p.quality;
  const stealthActive = p.stealth && (!p.lockOn);
  const stealthQuality = snipeQuality - (((snipeQuality > 1) && stealthActive) ? 1 : 0);
  return stealthQuality - 1 + rendFactor * poisonFactor;
}*/

const recompute = function(p) {
  const ed = effectiveDefense(p.defense, p.ap);
  const blastFactor = p.blast > p.defenderUnitSize ? p.defenderUnitSize : p.blast;
  const relentlessFactor = p.relentless ? 7/6 : 1;
  const expectedAttacks = p.attacks * relentlessFactor;
  //const effQuality = effectiveQuality(p, ed);
  const poisonFactor = p.poison ? 3 : 1;
  const rendFactor = p.rending ? effectiveDefense(ed, 4) / ed : 1;
  const snipeQuality = p.sniper ? 5 : p.quality;
  const stealthActive = p.stealth && (!p.lockOn);
  const stealthQuality = snipeQuality - (((snipeQuality > 1) && stealthActive) ? 1 : 0);
  const effectiveQuality = stealthQuality - 1 + rendFactor * poisonFactor;
  const rendFraction = p.rending ? rendFactor * poisonFactor / effectiveQuality : 0;
  const kpw = killsPerWound(p.deadly, p.toughness, p.regeneration, rendFraction);
  const expectedHits = expectedAttacks * effectiveQuality * blastFactor;
  const expectedWounds = expectedHits * ed / 36;
  return expectedWounds * kpw * p.attackerUnitSize;
};

const displayValueIn = function(value, container) {
  container.textContent = value.toFixed(4);
}

const clearDisplay = function(container) {
  container.textContent = "";
}

const updateOutput = function() {
  const expectedKills = recompute(profiles);
  displayValueIn(expectedKills, killsOutput);

  if (profiles.defenderPPU != 0) {
    const pointsKilled = expectedKills * profiles.defenderPPU;
    displayValueIn(pointsKilled, pointsKilledOutput);
  } else {
    clearDisplay(pointsKilledOutput)
  }

  if (profiles.attackerPPU != 0) {
    const killsPerPoint = expectedKills / profiles.attackerPPU;
    displayValueIn(killsPerPoint, kppOutput);
  } else {
    clearDisplay(kppOutput);
  }

  if ((profiles.defenderPPU != 0) && (profiles.attackerPPU != 0)) {
    const killEfficacy = expectedKills * profiles.defenderPPU / profiles.attackerPPU;
    displayValueIn(killEfficacy, killEfficacyOutput);
  } else {
    clearDisplay(killEfficacyOutput);
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
    profiles[changedFieldID] = Number(e.target.value);
  } else {
    console.log(e.target.type);
    console.log(e.target.value);
  }
  updateOutput();

});
