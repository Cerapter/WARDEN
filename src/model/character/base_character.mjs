import { DynamicResultResolver } from "../../dynamic_effects/resolver.mjs";

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
				required: true,
				choices: {
					0: this.sizeLocKey(0),
					1: this.sizeLocKey(1),
					2: this.sizeLocKey(2),
					3: this.sizeLocKey(3),
					4: this.sizeLocKey(4),
					5: this.sizeLocKey(5),
				},
				initial: 2,
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
	 *  | "bonus"
	 *  | "penalty"
	 *  | "effect_dice"
	 *  | "effect_potency"
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

			bonus: [],
			penalty: [],

			effect_dice: [],
			effect_potency: [],

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
	 * Returns a list of domains that describe the current status of the character.
	 * 
	 * @param {string} prefix A custom prefix to differentiate domains. Defaults to `character`.
	 * @returns {string[]} The relevant domains to the character.
	 */
	getDomains(prefix = "") {
		const determined_prefix = prefix.length > 0 ? prefix : "character";

		return [
			`${determined_prefix}.level.${this.level}`,
			`${determined_prefix}.level.${this.size}`,
			`${determined_prefix}.hit_points.current.${this.hit_points.value}`,
			`${determined_prefix}.hit_points.max.${this.hit_points.max}`,
			`${determined_prefix}.hit_points.percent.${Math.round(this.hit_points.value / this.hit_points.max * 100)}`,
			`${determined_prefix}.strain.current.${this.strain.value}`,
			`${determined_prefix}.strain.max.${this.strain.max}`,
			`${determined_prefix}.strain.percent.${Math.round(this.strain.value / this.strain.max * 100)}`
		]
	}

	/**
	 * Get a handler for all dynamic effects that belong to one of the domains and fulfills its applicability requirements
	 * @param {string[]|Set<string>} domains - The domains to filter the effects by, if any overlap it's applied
	 * @param {string[]|Set<string>} discriminators - Items used to filter an effect to see if it applies in the specific circumstance. Shape *very* much up for change
	 * @return DynamicResultResolver
	 */
	getDynamicResultResolver(domains, discriminators = []) {
		const target = game.user.targets.first()?.actor.system;
		
		const targetDomains = target !== undefined ? target.getDomains("target") : [];
		const raw_domains = [...domains, ...this.getDomains(), ...targetDomains];
		const domain_set = new Set(raw_domains);

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
				origin: this,
				target
			},
		);
	}
}
