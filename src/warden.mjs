import { BaseCharacterData } from "./model/base_character.mjs";
import { CharacterSheet } from "./sheet/character.mjs";

Hooks.once("init", () => {
	CONFIG.Actor.dataModels.character = BaseCharacterData;
	CONFIG.Actor.trackableAttributes = {
		character: {
			bar: ["hit_points", "strain"],
			value: [],
		},
	};

	const DocumentSheetConfig = foundry.applications.apps.DocumentSheetConfig;
	DocumentSheetConfig.registerSheet(Actor, "warden", CharacterSheet, {
		types: ["character"],
		makeDefault: true,
		label: "warden.character.sheet.label",
	});
});

Hooks.once("i18nInit", () => {
	foundry.helpers.Localization.localizeDataModel(BaseCharacterData);
});
