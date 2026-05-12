import { DAMAGE_TYPE_CHOICES, DAMAGE_TYPES } from "./damage_type.mjs";
import { registerHelpers } from "./handlebars.mjs";
import { BaseCharacterData } from "./model/character/base_character.mjs";
import { CharacterData } from "./model/character/character.mjs";
import { Apparel } from "./model/item/equipment/apparel.mjs";
import { Kit } from "./model/item/equipment/kit.mjs";
import { Shield } from "./model/item/equipment/shield.mjs";
import { UtilityItem } from "./model/item/equipment/utility_item.mjs";
import { Weapon } from "./model/item/equipment/weapon.mjs";
import { WardenCheck } from "./roll/warden_check.mjs";
import { WardenEffect } from "./roll/warden_effect.mjs";
import { CharacterSheet } from "./sheet/character.mjs";
import { EquipmentSheet } from "./sheet/item.mjs";

globalThis["WARDEN"] = {};
globalThis["WARDEN"].DAMAGE_TYPES = DAMAGE_TYPES;
globalThis["WARDEN"].DAMAGE_TYPE_CHOICES = DAMAGE_TYPE_CHOICES;

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
	CONFIG.Dice.rolls.push(WardenEffect);

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
