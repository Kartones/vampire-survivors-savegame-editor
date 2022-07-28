# vampire-survivors-savegame-editor

Tiny NodeJS application to fiddle with the game save files.

## Instructions

1) Either disable Steam cloud saves for the game, or in case of conflict, always choose local files
2) Drop this file into the game's save folder (https://www.pcgamingwiki.com/wiki/Vampire_Survivors#Save_game_data_location)
3) Run the file from a command line (`node vs-savegame-editor.js`)
4) Run the game. If coins are not changed, reset your power-ups

You can edit the amount of coins that will be set by editing the `newCoinsAmount` constant at the beginning of `vs-savegame-editor.js`. Note that the script sets the current amount of coins to this value, but adds to the "lifetime coins" total, so if you reset your powerups you recover the lifetime amount.

It creates a backup copy of the original save file on each run, but still no responsibilites if it messes up things!
