const {
	BooleanField,
	SchemaField,
	StringField,
	NumberField,
	TypedObjectField,
} = foundry.data.fields;
const { TypeDataModel } = foundry.abstract;

export class CharacterData extends TypeDataModel {
	static LOCALIZATION_PREFIXES = ["warden.character"];

	static defineSchema() {
		return {
			pronouns: new StringField({ required: true }),
			description: new StringField({ required: true }),

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
			temporary_hit_points: new NumberField({
				required: true,
				integer: true,
				min: 0,
				initial: 0,
			}),
			strain: new SchemaField({
				value: new NumberField({
					required: true,
					integer: true,
					min: 0,
					initial: 10,
				}),
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
				perception: new SchemaField({
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
