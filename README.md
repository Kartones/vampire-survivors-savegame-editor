# vampire-survivors-savegame-editor

Tiny NodeJS application to fiddle with the game save files.

## Features

- Sets coins to 5,000,000
- Removes "bad eggs" from your characters. Currently only those that increase the `curse` value

## Instructions

1) Either disable Steam cloud saves for the game, or in case of conflict, always choose local files
2) Drop this file into the game's save folder. For versions prior to `1.0`, check [PCGamingWiki](https://www.pcgamingwiki.com/wiki/Vampire_Survivors#Save_game_data_location); for the current version, check *Method 2* folder location of [this Steam Guide](https://steamcommunity.com/sharedfiles/filedetails/?id=2847140637).
3) Run the file from a command line (`node vs-savegame-editor.js`)
4) Run the game. If coins are not changed, reset your power-ups

You can edit the amount of coins that will be set by editing the `NEW_COINS_AMOUNT` constant at the beginning of `vs-savegame-editor.js`. Note that the script sets the current amount of coins to this value, but adds to the "lifetime coins" total, so if you reset your power-ups you recover the lifetime amount.

Note that after editing the file, Steam can warn you about a cloud sync conflict. This is fine and you should tell it to keep your local file (with newer modification date).

Tested on Windows. Creates a backup copy of the original save file on each run, but still no responsibility if it messes up things!
