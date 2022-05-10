const crypto = require("crypto");
const fs = require("fs");

/**
 * Instructions
 *
 * 1) Disable Steam Cloud saves for the game
 * 2.1) Main expected location for the savegame: https://www.pcgamingwiki.com/wiki/Vampire_Survivors#Save_game_data_location
 * 2.2) Copy your `SaveData.sav` contents as the value of `saveGameData`, replacing also the `{}`
 * 3) Edit at the last line the number `300000` to whatever amount of coins you wish to have
 * 4) Run the game, reset your powerups, etc. (sometimes coins amount is not updated but total coins will be upon reset) and quit the game
 * 5) reactivate Steam Cloud saves
 */
const saveGameData = {};

const copyData = (data) => {
  return JSON.parse(JSON.stringify(data));
};

const calculateChecksum = (jsonObject) =>
  crypto
    .createHash("sha256", "DefinitelyNotSaveDataSecretKey")
    .update(JSON.stringify(jsonObject))
    .digest("hex");

const validateChecksum = (saveData) => {
  const saveDataCopy = copyData(saveData);
  saveDataCopy["checksum"] = "";

  return calculateChecksum(saveDataCopy) === saveData["checksum"];
};

const changeAvailableCoins = (saveData, desiredAmount) => {
  const saveDataCopy = copyData(saveData);
  saveDataCopy["checksum"] = "";

  saveDataCopy["LifetimeCoins"] -= saveDataCopy["Coins"];
  saveDataCopy["Coins"] = desiredAmount;
  saveDataCopy["LifetimeCoins"] += desiredAmount;

  saveDataCopy["checksum"] = calculateChecksum(saveDataCopy);

  const filename = "MODIFIED.sav";
  fs.writeFileSync(filename, JSON.stringify(saveDataCopy));
  console.log(`Modified game saved as '${filename}'`);
};

console.log("checksum correct?", validateChecksum(saveGameData));
if (validateChecksum(saveGameData)) {
  changeAvailableCoins(saveGameData, 300000);
}
