const { HTMLField } = foundry.data.fields;
const { TypeDataModel } = foundry.abstract;

/**
 * @property {string} description
 */
export class Feat extends TypeDataModel {
	static LOCALIZATION_PREFIXES = ["warden.feat"];

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
