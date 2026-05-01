import { BaseCharacterData } from "./model/base_character.mjs";

export const registerHelpers = async () => {
	Handlebars.registerHelper(
		"warden-size-loc-key",
		BaseCharacterData.sizeLocKey,
	);

	await foundry.applications.handlebars.loadTemplates({
		"warden-diamond": "systems/warden/static/partials/diamond.hbs",
		"warden-diamonds": "systems/warden/static/partials/diamonds.hbs",
	});
};
