const { AnyField, SchemaField, NumberField, ArrayField } = foundry.data.fields;
const { TypeDataModel } = foundry.abstract;

/**
 * Base class for characters and opponents
 * @property {0,1,2,3,4,5} size
 * @property {number} level
 * @property {{value: number, max: number}} hit_points
 * @property {{value: number, max: number}} strain
 * @property {Record<string, DynamicEffect[]>} dynamic_effects
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

	prepareBaseData() {
		super.prepareBaseData();

		this.prepareDynamicEffects();
	}

	/*================================================================================================================*/
	/*|-------------------------------------Dynamic Result system implementation-------------------------------------|*/
	/*================================================================================================================*/

	/**
	 * @typedef {
	 *    "proficiency_rank"
	 *  | "check_bonus"
	 *  | "check_penalty"
	 *  | "effect_dice"
	 *  | "effect_potency"
	 *  | "effect_bonus"
	 *  | "effect_penalty"
	 *  | "benefit"
	 *  | "detriment"
	 * } DynamicEffectType
	 */

	/** TODO: Priority?
	 * @typedef {
	 *    "add"
	 *  | "subtract"
	 *  | "downgrade"
	 *  | "upgrade"
	 * } DynamicEffectMode
	 */

	/**
	 * @typedef DynamicEffect
	 * @property {string} label
	 * @property {Set<string>} domains
	 * @property {DynamicEffectMode} mode
	 * @property {boolean|string|string[]} applicable_if
	 * @property {any} value
	 * @property {boolean?} defaultEnabled
	 */

	/**
	 * Prepare the sets where effects are stored
	 */
	prepareDynamicEffects() {
		/** @type {Record<string, DynamicEffect[]>} */
		this.dynamic_effects = {
			proficiency_rank: [],

			check_bonus: [],
			check_penalty: [],

			effect_dice: [],
			effect_potency: [],
			effect_bonus: [],
			effect_penalty: [],

			benefit: [],
			detriment: [],
		};

		// I don't like this, but without a fake field it coerces all values to strings
		this.dynamic_effect_field_type = new ArrayField(new AnyField());
	}

	getFieldForProperty(key) {
		if (
			(typeof key === "string" && key.startsWith("dynamic_effects.")) ||
			(Array.isArray(key) && key[0] === "dynamic_effect")
		) {
			return this.dynamic_effect_field_type;
		} else {
			return super.getFieldForProperty(key);
		}
	}

	/**
	 * Get a handler for all dynamic effects that belong to one of the domains and fulfills its applicability requirements
	 * @param {string[]|Set<string>} domains - The domains to filter the effects by, if any overlap it's applied
	 * @param {string[]|Set<string>} discriminators - Items used to filter an effect to see if it applies in the specific circumstance. Shape *very* much up for change
	 * @return DynamicResultResolver
	 */
	getDynamicResultResolver(domains, discriminators = []) {
		const domain_set = Array.isArray(domains) ? new Set(domains) : domains;
		const discriminator_set = Array.isArray(discriminators)
			? new Set(discriminators)
			: discriminators;

		const filtered_effects = {};

		for (const [type, effects] of Object.entries(this.dynamic_effects)) {
			filtered_effects[type] = effects.filter((e) => {
				if (e.domains === undefined) {
					return false;
				}
				if (Array.isArray(e.domains)) {
					e.domains = new Set(e.domains);
				}

				return !e.domains.isDisjointFrom(domain_set);
			});
		}

		return new DynamicResultResolver(
			domain_set,
			discriminator_set,
			filtered_effects,
			{
				level: this.level,
			},
		);
	}
}

class DynamicResultResolver {
	/**
	 * @param {Set<string>} domains
	 * @param {Set<string>} discriminators
	 * @param {Record<string, DynamicEffect[]>} effects
	 * @param {Record<string, any>} data
	 */
	constructor(domains, discriminators, effects, data) {
		this.domains = domains;
		this.discriminators = discriminators;
		this.effects = effects;
		this.data = data;

		this.#resetResults();

		for (const effect_type of Object.values(this.effects)) {
			for (const effect of effect_type) {
				effect.enabled = effect.defaultEnabled ?? false;
			}
		}
	}

	get applicableEffects() {
		return Object.fromEntries(
			Object.entries(this.effects).map(([key, type]) => [
				key,
				type.filter((effect) => this.#isEffectApplicable(effect)),
			]),
		);
	}

	#calcModifierSum(type) {
		return Object.values(this.results[type]).reduce((a, b) => a + b, 0);
	}
	checkModifierSum() {
		this.#resolveType("check_bonus");
		this.#resolveType("check_penalty");

		return (
			this.#calcModifierSum("check_bonus") -
			this.#calcModifierSum("check_penalty")
		);
	}
	effectModifierSum() {
		this.#resolveType("effect_bonus");
		this.#resolveType("effect_penality");

		return (
			this.#calcModifierSum("effect_bonus") -
			this.#calcModifierSum("effect_penality")
		);
	}

	resolve(type) {
		this.#resetResults();

		this.#resolveType(type);

		return this.results[type];
	}
	resolveAll() {
		this.#resetResults();

		this.#resolveType("proficiency_rank");

		this.#resolveType("check_bonus");
		this.#resolveType("check_penalty");

		this.#resolveType("effect_dice");
		this.#resolveType("effect_potency");
		this.#resolveType("effect_bonus");
		this.#resolveType("effect_penalty");

		this.#resolveType("benefit");
		this.#resolveType("detriment");

		return this.results;
	}

	#getDefaultValue(type) {
		switch (type) {
			case "check_bonus":
			case "check_penalty":
			case "effect_bonus":
			case "effect_penalty":
				return {
					universal: 0,
					proficiency: 0,
					item: 0,
					status: 0,
					circumstance: 0,
				};
			default:
				return 0;
		}
	}
	#resetResults() {
		this.results = {};
		this.appliedEffects = [];
	}

	#resolveType(type) {
		if (this.results[type] !== undefined) return this.results[type];

		this.results[type] = this.#getDefaultValue(type);

		for (const effect of this.applicableEffects[type]) {
			this.#resolveEffect(type, effect);
		}

		return this.results[type];
	}
	#resolveEffect(type, effect) {
		if (!effect.enabled) return;

		if (this.#isEffectApplicable(effect)) this.#applyEffect(type, effect);
	}
	#isEffectApplicable(effect) {
		if (effect.applicable_if === undefined) return true;
		if (typeof effect.applicable_if === "boolean")
			return effect.applicable_if;
		if (!Array.isArray(effect.applicable_if))
			return this.discriminators.has(effect.applicable_if);

		// TODO: More complex resolution mechanics
		return effect.applicable_if.all((cond) =>
			this.discriminators.has(cond),
		);
	}

	#getEffectTarget(type, effect) {
		switch (type) {
			case "check_bonus":
			case "check_penalty":
			case "effect_bonus":
			case "effect_penalty":
				return [
					this.results[type][effect.modifier_type],
					(v) => (this.results[type][effect.modifier_type] = v),
				];
			default:
				return [this.results[type], (v) => (this.results[type] = v)];
		}
	}
	#getEffectValue(type, effect) {
		if (typeof effect.value === "string" && effect.value.startsWith("@")) {
			if (effect.value === "@profCalc") {
				// Very special case here
				const rank = this.#resolveType("proficiency_rank");
				if (rank > 0) {
					return rank + this.data.level;
				} else {
					return Math.floor(this.data.level / 2);
				}
			}

			return this.#resolveType(effect.value.substring(1));
		} else {
			return effect.value;
		}
	}
	#applyEffect(type, effect) {
		let [accumulator, setter] = this.#getEffectTarget(type, effect);
		const value = this.#getEffectValue(type, effect);

		switch (effect.mode) {
			case "add":
				setter(accumulator + value);
				this.appliedEffects.push(effect);
				break;
			case "subtract":
				setter(accumulator - value);
				this.appliedEffects.push(effect);
				break;
			case "upgrade":
				if (accumulator < value) {
					setter(value);
					this.appliedEffects.push(effect); // This will double count TODO: Fix
				}
				break;
			case "downgrade":
				if (accumulator > value) {
					setter(value);
					this.appliedEffects.push(effect); // This will double count TODO: Fix
				}
				break;
		}
	}
}
