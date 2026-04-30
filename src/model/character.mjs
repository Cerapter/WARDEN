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
				combat: new SchemaField({
					rank: new NumberField({
						required: true,
						integer: true,
						min: 0,
						max: 5,
						initial: 0,
					}),
				}),
				skill: new SchemaField({
					rank: new NumberField({
						required: true,
						integer: true,
						min: 0,
						max: 5,
						initial: 0,
					}),
				}),
				special: new SchemaField({
					rank: new NumberField({
						required: true,
						integer: true,
						min: 0,
						max: 5,
						initial: 0,
					}),
				}),
			}),

			defense: new SchemaField({
				toughness: new SchemaField({
					rank: new NumberField({
						required: true,
						integer: true,
						min: 0,
						max: 5,
						initial: 0,
					}),
				}),
				resolve: new SchemaField({
					rank: new NumberField({
						required: true,
						integer: true,
						min: 0,
						max: 5,
						initial: 0,
					}),
				}),
				perception: new SchemaField({
					rank: new NumberField({
						required: true,
						integer: true,
						min: 0,
						max: 5,
						initial: 0,
					}),
				}),
			}),

			skill_proficiency: new SchemaField({
				crafting: new BooleanField({ required: true }),
				deception: new BooleanField({ required: true }),
				diplomacy: new BooleanField({ required: true }),
				force: new BooleanField({ required: true }),
				intimidation: new BooleanField({
					required: true,
				}),
				medicine: new BooleanField({ required: true }),
				mobility: new BooleanField({ required: true }),
				skullduggery: new BooleanField({
					required: true,
				}),
				stealth: new BooleanField({ required: true }),
				survival: new BooleanField({ required: true }),
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
