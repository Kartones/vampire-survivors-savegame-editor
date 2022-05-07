# vampire-survivors-savegame-editor

NodeJS tiny application to toy with the game savegames. 

Validates that checksum calculation is correct (before changing anything), then changes the coins to `100000`. Also changes lifetime coins, so if actual ones don't appear modified reset all powerups and the total amount should have `+100000`.

Make a backup of your savegame file before overriding with the `MODIFIED.sav` generated new one!
