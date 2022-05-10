# vampire-survivors-savegame-editor

NodeJS tiny application to toy with the game savegame files. 

Validates that checksum calculation is correct (before changing anything), then changes the coins to `300000`. Also changes lifetime coins, so if available coins don't appear modified simply reset all powerups and the total amount should have `+300000`.

Make a backup of your savegame file before overriding with the `MODIFIED.sav` generated new one!
