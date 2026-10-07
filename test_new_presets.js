// Teste dos novos presets de emotes
const Emotes = {
  "Kick and Punch only": -6,
  "Banana No Special Emote": -7,
  "No Special Emote": -8,
  "Only Punch & Kick": -3,
  "Hug Only": -5,
  "Banana Only": -4,
  "Punch Only": -2,
  "Special Emotes": -1,
  "Happy": 1,
  "Punch": 9,
  "Kick": 13,
  "Banana": 55,
  "Ball": 156,
  "Invisibility": 174
};

// Simular getEnabledEmotesText
function getEnabledEmotesText(disabledEmotes) {
  if (!disabledEmotes || disabledEmotes.length === 0) {
    return "all emotes enabled";
  }

  const preset = disabledEmotes[0];

  if (preset < 0) {
    switch (preset) {
      case -1: return "special emotes only";
      case -2: return "punch only";
      case -3: return "punch & kick only";
      case -4: return "banana only";
      case -5: return "hug only";
      case -6: return "kick and punch only";
      case -7: return "banana no special emote";
      case -8: return "no special emote";
      case 0: return "disable all";
      default: return "unknown preset";
    }
  }

  return "individual emotes";
}

// Testar os novos presets
console.log('=== Teste dos Novos Presets ===');
console.log('Kick and Punch only (-6):', getEnabledEmotesText([-6]));
console.log('Banana No Special Emote (-7):', getEnabledEmotesText([-7]));
console.log('No Special Emote (-8):', getEnabledEmotesText([-8]));
console.log('Disable all (0):', getEnabledEmotesText([0]));

console.log('\n✅ Todos os presets foram adicionados!');
