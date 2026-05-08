import { registerHelpers } from "./handlebars.mjs";
import { BaseCharacterData } from "./model/base_character.mjs";
import { CharacterData } from "./model/character.mjs";
import { WardenCheck } from "./roll/warden_check.mjs";
import { CharacterSheet } from "./sheet/character.mjs";

Hooks.once("init", () => {
	CONFIG.Actor.dataModels.character = CharacterData;
	CONFIG.Actor.trackableAttributes = {
		character: {
			bar: ["hit_points", "strain"],
			value: [],
		},
	};

	CONFIG.Dice.rolls.push(WardenCheck);

	const DocumentSheetConfig = foundry.applications.apps.DocumentSheetConfig;
	DocumentSheetConfig.registerSheet(Actor, "warden", CharacterSheet, {
		types: ["character"],
		makeDefault: true,
		label: "warden.character.sheet.label",
	});

	registerHelpers();
});

Hooks.once("i18nInit", () => {
	foundry.helpers.Localization.localizeDataModel(BaseCharacterData);
	foundry.helpers.Localization.localizeDataModel(CharacterData);
});
