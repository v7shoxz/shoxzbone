// Teste da nova lógica de emotes
const Emotes = {
  "Only Punch & Kick": -3,
  "Hug Only": -5,
  "Banana Only": -4,
  "Punch Only": -2,
  "Special Emotes": -1,
  "Happy": 1,
  "Cry": 2,
  "Angry": 3,
  "Hi": 10,
  "Punch": 9,
  "Fire Punch": 85,
  "Kick": 13,
  "Wet Kick": 123,
  "Hug": 8,
  "Charged Hug": 124,
  "Banana": 55,
  "Golden Banana": 122,
  "Ball": 156,
  "Invisibility": 174
};

// Simular a nova lógica
function GetDisabledEmotes(preset) {
  let DisabledEmotes = [preset];

  // Damage emotes (should be blocked in restrictive presets)
  const DamageEmotesNames = [
    "Hug", "Charged Hug", "Kick", "Wet Kick", "Punch", "Fire Punch",
    "Banana", "Golden Banana", "Ball", "Invisibility"
  ];

  // All special emotes (for "Special Emotes Only" preset)
  const SpecialEmotesNames = [
    ...DamageEmotesNames,
    "Ball", "Invisibility"
  ];

  if (DisabledEmotes.includes(-2)) {
    // Punch Only - disable damage emotes except Punch, allow all expression emotes
    DisabledEmotes = DisabledEmotes.filter((id) => id !== -2);

    // Disable all damage emotes except Punch variants
    for (const emoteName of DamageEmotesNames) {
      if (emoteName !== "Punch" && emoteName !== "Fire Punch") {
        const emoteId = Emotes[emoteName];
        if (emoteId != null && !DisabledEmotes.includes(emoteId)) {
          DisabledEmotes.push(emoteId);
        }
      }
    }
  }

  return DisabledEmotes;
}

// Teste
console.log('=== Teste Punch Only (-2) ===');
const result = GetDisabledEmotes(-2);
console.log('Emotes desabilitados:', result);

// Verificar se emotes de expressão estão liberados
const enabledEmotes = Object.values(Emotes).filter(id => typeof id === 'number' && id > 0 && !result.includes(id));
console.log('Emotes habilitados:', enabledEmotes);

// Verificar se Happy, Hi estão habilitados
const happyEnabled = !result.includes(1); // Happy
const hiEnabled = !result.includes(10); // Hi
const punchEnabled = !result.includes(9); // Punch
const kickDisabled = result.includes(13); // Kick should be disabled

console.log(`Happy (expressão): ${happyEnabled ? '✅ Habilitado' : '❌ Desabilitado'}`);
console.log(`Hi (expressão): ${hiEnabled ? '✅ Habilitado' : '❌ Desabilitado'}`);
console.log(`Punch (dano): ${punchEnabled ? '✅ Habilitado' : '❌ Desabilitado'}`);
console.log(`Kick (dano): ${kickDisabled ? '✅ Desabilitado' : '❌ Habilitado'}`);

console.log('\n✅ Teste concluído!');
