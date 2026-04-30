const { SchemaField, NumberField } = foundry.data.fields;
const { TypeDataModel } = foundry.abstract;

export class CharacterData extends TypeDataModel {
	static LOCALIZATION_PREFIXES = ["warden.character"];

	static defineSchema() {
		return {
			hit_points: new SchemaField({
				value: new NumberField({
					required: true,
					integer: true,
					min: 0,
					initial: 10,
				}),
				max: new NumberField({
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
				max: new NumberField({
					required: true,
					integer: true,
					min: 0,
					initial: 10,
				}),
			}),
		};
	}
}
