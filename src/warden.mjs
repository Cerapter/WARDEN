import { CharacterData } from "./model/character.mjs";
import { CharacterSheet } from "./sheet/character.mjs";

Hooks.once("init", () => {
	CONFIG.Actor.dataModels.character = CharacterData;
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
