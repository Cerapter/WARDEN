import { BaseCharacterData } from "./base_character.mjs";

const {
	BooleanField,
	SchemaField,
	StringField,
	NumberField,
	TypedObjectField,
} = foundry.data.fields;

export class CharacterData extends BaseCharacterData {
	static LOCALIZATION_PREFIXES = ["warden.character"];

	static defineSchema() {
		const proficiencyField = () =>
			new SchemaField({
				rank: new NumberField({
					required: true,
					integer: true,
					min: 0,
					max: 5,
					initial: 0,
				}),
			});

		const skillField = () =>
			new SchemaField({
				proficient: new BooleanField({ required: true }),
			});

		return {
			...super.defineSchema(),

			pronouns: new StringField({ required: true }),
			description: new StringField({ required: true }),

			temporary_hit_points: new NumberField({
				required: true,
				integer: true,
				min: 0,
				initial: 0,
			}),

			fate_points: new NumberField({
				required: true,
				integer: true,
				min: 0,
				max: 3,
				initial: 1,
			}),

			vocation: new SchemaField({
				title: new StringField({ required: true }),
				value: new NumberField({
					required: true,
					integer: true,
					min: 0,
					max: 10,
					initial: 3,
				}),
			}),

			wealth: new NumberField({
				required: true,
				integer: true,
				min: 0,
				initial: 3,
			}),
			has_savings: new BooleanField({ required: true }),

			path: new SchemaField({
				combat: proficiencyField(),
				skill: proficiencyField(),
				special: proficiencyField(),
			}),

			defense: new SchemaField({
				toughness: proficiencyField(),
				resolve: proficiencyField(),
				perception: proficiencyField(),
			}),

			skill: new SchemaField({
				crafting: skillField(),
				deception: skillField(),
				diplomacy: skillField(),
				force: skillField(),
				intimidation: skillField(),
				medicine: skillField(),
				mobility: skillField(),
				skullduggery: skillField(),
				stealth: skillField(),
				survival: skillField(),
			}),

			knowledge_skills: new TypedObjectField(
				new SchemaField({
					is_niche: new BooleanField({
						required: true,
						default: false,
					}),
				}),
			),
		};
	}
}
