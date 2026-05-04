const { SchemaField, NumberField } = foundry.data.fields;
const { TypeDataModel } = foundry.abstract;

/**
 * Base class for characters and opponents
 * @property {0,1,2,3,4,5} size
 * @property {number} level
 * @property {{value: number, max: number}} hit_points
 * @property {{value: number, max: number}} strain
 */
export class BaseCharacterData extends TypeDataModel {
	static LOCALIZATION_PREFIXES = ["warden.character"];

	static defineSchema() {
		return {
			size: new NumberField({
				choices: {
					0: this.sizeLocKey(0),
					1: this.sizeLocKey(1),
					2: this.sizeLocKey(2),
					3: this.sizeLocKey(3),
					4: this.sizeLocKey(4),
					5: this.sizeLocKey(5),
				},
			}),

			level: new NumberField({
				required: true,
				integer: true,
				min: 0,
				max: 10,
				initial: 0,
			}),

			hit_points: new SchemaField({
				value: new NumberField({
					required: true,
					integer: true,
					min: 0,
					initial: 10,
				}),
			}),
			strain: new SchemaField({
				value: new NumberField({
					required: true,
					integer: true,
					min: 0,
					initial: 10,
				}),
			}),
		};
	}

	static sizeLocKey(size) {
		switch (size) {
			case 0:
				return "warden.character.size.tiny";
			case 1:
				return "warden.character.size.small";
			case 2:
				return "warden.character.size.medium";
			case 3:
				return "warden.character.size.large";
			case 4:
				return "warden.character.size.huge";
			case 5:
				return "warden.character.size.massive";
		}
	}
}
