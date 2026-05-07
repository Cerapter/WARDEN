import { registerHelpers } from "./handlebars.mjs";
import { Apparel } from "./model/apparel.mjs";
import { BaseCharacterData } from "./model/base_character.mjs";
import { CharacterData } from "./model/character.mjs";
import { Kit } from "./model/kit.mjs";
import { Shield } from "./model/shield.mjs";
import { UtilityItem } from "./model/utility_item.mjs";
import { Weapon } from "./model/weapon.mjs";
import { WardenCheck } from "./roll/warden_check.mjs";
import { CharacterSheet } from "./sheet/character.mjs";
import { EquipmentSheet } from "./sheet/item.mjs";

Hooks.once("init", () => {
	CONFIG.Actor.dataModels.character = CharacterData;
	CONFIG.Actor.trackableAttributes = {
		character: {
			bar: ["hit_points", "strain"],
			value: [],
		},
	};

	CONFIG.Item.dataModels.utilityItem = UtilityItem;
	CONFIG.Item.dataModels.weapon = Weapon;
	CONFIG.Item.dataModels.apparel = Apparel;
	CONFIG.Item.dataModels.shield = Shield;
	CONFIG.Item.dataModels.kit = Kit;

	CONFIG.Dice.rolls.push(WardenCheck);

	const DocumentSheetConfig = foundry.applications.apps.DocumentSheetConfig;
	DocumentSheetConfig.registerSheet(Actor, "warden", CharacterSheet, {
		types: ["character"],
		makeDefault: true,
		label: "warden.character.sheet.label",
	});

	DocumentSheetConfig.registerSheet(Item, "warden", EquipmentSheet, {
		types: ["utilityItem", "weapon", "apparel", "shield", "kit"],
		makeDefault: true,
		label: "warden.equipment.sheet.label",
	});

	registerHelpers();
});

Hooks.once("i18nInit", () => {
	foundry.helpers.Localization.localizeDataModel(BaseCharacterData);
	foundry.helpers.Localization.localizeDataModel(CharacterData);
});
