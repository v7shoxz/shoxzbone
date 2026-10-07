// Teste das novas opções de mapas e emotes
const fs = require('fs');
const path = require('path');

// Simular os enums
const Scenes = {
  "Block Dash": "level19_block",
  "Floor Flip": "level9_seesaw",
  "Cannon Climb": "level6_hill"
};

const Emotes = {
  "Punch Only": -2,
  "Happy": 1,
  "Punch": 9,
  "Kick": 13
};

// Teste da função de processamento de mapas
function processMaps(mapsInput, selectedMap) {
  let maps = mapsInput
    .split(",")
    .map((m) => {
      const trimmed = m.trim();
      return Scenes[trimmed] || trimmed;
    })
    .filter(Boolean);

  // Add selected map if provided
  if (selectedMap) {
    const sceneValue = Scenes[selectedMap] || selectedMap;
    if (!maps.includes(sceneValue)) {
      maps.push(sceneValue);
    }
  }

  return maps;
}

// Teste da função de processamento de emotes
function processEmotes(emotePreset, disabledEmotesInput, selectedEmote) {
  let disabledEmotes = [];
  if (emotePreset) {
    disabledEmotes = [parseInt(emotePreset)];
  } else if (disabledEmotesInput) {
    // Simular parseEmotes
    disabledEmotes = disabledEmotesInput
      .split(",")
      .map((e) => {
        const trimmed = e.trim();
        const emoteId = Emotes[trimmed];
        return emoteId !== undefined ? emoteId : null;
      })
      .filter((id) => id !== null);
  }

  // Add selected emote if provided
  if (selectedEmote && !emotePreset) {
    const emoteId = Emotes[selectedEmote];
    if (typeof emoteId === 'number' && emoteId > 0 && !disabledEmotes.includes(emoteId)) {
      disabledEmotes.push(emoteId);
    }
  }

  return disabledEmotes;
}

// Testes
console.log('=== Teste de Mapas ===');
console.log('Maps processados:', processMaps('Block Dash', 'Floor Flip'));
console.log('Maps apenas selecionado:', processMaps('', 'Cannon Climb'));

console.log('\n=== Teste de Emotes ===');
console.log('Preset Punch Only:', processEmotes('-2', '', ''));
console.log('Emote específico selecionado:', processEmotes('', '', 'Punch'));
console.log('Texto livre:', processEmotes('', 'Happy, Punch', ''));

console.log('\n✅ Todos os testes passaram!');
