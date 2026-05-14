const { HTMLField } = foundry.data.fields;
const { TypeDataModel } = foundry.abstract;

/**
 * @property {string} description
 */
export class Origin extends TypeDataModel {
	static LOCALIZATION_PREFIXES = ["warden.origin"];

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
