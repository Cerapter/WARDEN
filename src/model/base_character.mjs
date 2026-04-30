const {
	BooleanField,
	SchemaField,
	StringField,
	NumberField,
	TypedObjectField,
} = foundry.data.fields;
const { TypeDataModel } = foundry.abstract;

export class BaseCharacterData extends TypeDataModel {
	static LOCALIZATION_PREFIXES = ["warden.character"];

	static defineSchema() {
		return {
			size: new NumberField({
				choices: {
					0: "warden.character.size.tiny",
					1: "warden.character.size.small",
					2: "warden.character.size.medium",
					3: "warden.character.size.large",
					4: "warden.character.size.huge",
					5: "warden.character.size.massive",
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

			/*
			 * There are some shadow properties that need to be defined by
			 * subclasses. Things will/do rely on them existing:
			 * hit_points.max
			 * strain.max
			 *
			 * path.combat.proficiency_bonus
			 * path.skill.proficiency_bonus
			 * path.special.proficiency_bonus
			 *
			 * defense.toughness.proficiency_bonus
			 * defense.resolve.proficiency_bonus
			 * defense.perception.proficiency_bonus
			 * */
		};
	}
}
