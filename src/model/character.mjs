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
				is_proficient: new BooleanField({ required: true }),
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
					topic: new StringField({ required: true }),
					is_niche: new BooleanField({
						required: true,
						default: false,
					}),
				}),
			),
		};
	}

	get untrainedBonus() {
		return Math.min(Math.floor(this.level / 2), 10);
	}

	#calcProficiencyBonus(rank) {
		if (rank === 0) return this.untrainedBonus;

		return this.level + rank;
	}
	#populateProficiencyFields(prof) {
		prof.proficiency_bonus = this.#calcProficiencyBonus(prof.rank);
		prof.bonus = prof.proficiency_bonus;
	}

	prepareDerivedData() {
		super.prepareDerivedData();

		this.hit_points.max = 10 + 2 * this.defense.toughness.rank;
		this.hit_points.value = Math.min(
			this.hit_points.value,
			this.hit_points.max,
		);

		this.strain.max = 10 + 2 * this.defense.resolve.rank;
		this.strain.value = Math.min(this.strain.value, this.strain.max);

		this.#populateProficiencyFields(this.path.combat);
		this.#populateProficiencyFields(this.path.skill);
		this.#populateProficiencyFields(this.path.special);

		this.#populateProficiencyFields(this.defense.toughness);
		this.#populateProficiencyFields(this.defense.resolve);
		this.#populateProficiencyFields(this.defense.perception);

		for (const [_, skill] of Object.entries(this.skill)) {
			skill.proficiency_bonus = skill.is_proficient
				? this.path.skill.proficiency_bonus
				: this.untrainedBonus;
			skill.bonus = skill.proficiency_bonus;
		}

		for (const [_, skill] of Object.entries(this.knowledge_skills)) {
			skill.proficiency_bonus = this.path.skill.proficiency_bonus;
			skill.bonus = skill.proficiency_bonus;
		}

		this.speed = {};
		this.speed.base = 5;
		this.speed.value = this.speed.base;

		this.wealth = Math.min(this.wealth, this.vocation.value);
	}
}
