// Teste dos emotes
const fs = require('fs');
const path = require('path');

// Simular o enum Emotes
const Emotes = {
  "Only Punch & Kick": -3,
  "Hug Only": -5,
  "Banana Only": -4,
  "Punch Only": -2,
  "Special Emotes": -1,
  "Happy": 1,
  "Cry": 2,
  "Angry": 3,
  "Cool": 4,
  "Thumbs Up": 5,
  "Punch": 9,
  "Kick": 13,
  "Hug": 8,
  "Banana": 55,
  "Fire Punch": 85,
  "Wet Kick": 123,
  "Charged Hug": 124,
  "Golden Banana": 122
};

// Simular a função GetProperties
function GetProperties(DatabaseTournament) {
  let DisabledEmotes = DatabaseTournament.Properties?.DisabledEmotes || [];

  if (DisabledEmotes.includes(0)) {
    DisabledEmotes = Array.from({ length: 255 }, (_, i) => i + 1);
  }

  // Get all available emotes (excluding presets)
  const AllEmoteIds = Object.values(Emotes).filter(id => typeof id === 'number' && id > 0);

  const SpecialEmotesNames = [
    "Hug", "Charged Hug", "Kick", "Wet Kick", "Punch", "Fire Punch",
    "Banana", "Golden Banana"
  ];

  if (DisabledEmotes.includes(-2)) {
    console.log('Aplicando Punch Only (-2)');
    DisabledEmotes = DisabledEmotes.filter((id) => id !== -2);
    const AllowedEmotes = ["Punch", "Fire Punch"];

    // Disable all emotes except allowed ones
    for (const emoteId of AllEmoteIds) {
      if (!DisabledEmotes.includes(emoteId)) {
        const emoteName = Object.keys(Emotes).find(key => Emotes[key] === emoteId);
        if (emoteName && !AllowedEmotes.includes(emoteName)) {
          DisabledEmotes.push(emoteId);
        }
      }
    }
  }

  return DisabledEmotes;
}

// Teste
const tournament = {
  Properties: {
    DisabledEmotes: [-2] // Punch Only
  }
};

const result = GetProperties(tournament);
console.log('Emotes desabilitados:', result.length, 'emotes');
console.log('Primeiros 10:', result.slice(0, 10));

// Verificar se apenas Punch e Fire Punch estão habilitados
const enabledEmotes = Object.values(Emotes).filter(id => typeof id === 'number' && id > 0 && !result.includes(id));
console.log('Emotes habilitados:', enabledEmotes);

const enabledNames = enabledEmotes.map(id => Object.keys(Emotes).find(key => Emotes[key] === id)).filter(Boolean);
console.log('Nomes dos emotes habilitados:', enabledNames);
