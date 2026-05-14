const { HTMLField } = foundry.data.fields;
const { TypeDataModel } = foundry.abstract;

/**
 * @property {string} description
 */
export class Ability extends TypeDataModel {
	static LOCALIZATION_PREFIXES = ["warden.ability"];

	static defineSchema() {
		return {
			description: new HTMLField({
				required: true,
			}),
		};
	}

	get supportedTabs() {
		return ["description"];
	}
}
