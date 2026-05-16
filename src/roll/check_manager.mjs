import { CheckWindow } from "../dialog/check.mjs";
import { WardenCheck } from "./warden_check.mjs";

/**
 * @typedef {"universal"|"proficiency"|"item"|"status"|"circumstance"} ModifierType
 */

/**
 * All the data and descriptions for presenting and making a Check.
 * @typedef {Object} CheckParameters
 * @property {string} title - Title for the roll window and chat message.
 * @property {number|"open"?} difficulty - The difficulty of the check, or "open" if open
 * @property {boolean?} benefit - Should the roll gain a benefit. TODO: temp until dynamic effects can deal with it
 * @property {boolean?} detriment - Should the roll suffer a detriment. TODO: temp until dynamic effects can deal with it
 */

/**
 * The window used to describe and edit check rolls.
 * @property {object} rollData
 * @property {ChatSpeakerData} speaker - Who should the roll message originate from.
 * @property {CheckParameters} parameters - The parameters used for the roll.
 */
class CheckManager {
	/**
	 * Create a CheckManager.
	 * @param {object} rollData
	 * @param {ChatSpeakerData} speaker
	 * @param {DynamicResultResolver} resolver
	 * @param {CheckParameters} parameters
	 */
	constructor(rollData, speaker, resolver, parameters) {
		this.id = foundry.utils.randomID();
		this.idDomain = `check.${this.id}`;

		this.rollData = rollData;
		this.speaker = speaker;
		this.parameters = parameters;
		this.resolver = resolver;
		this.resolver.domains.add(this.idDomain);

		this.parameters.difficulty ??= "open";
		this.parameters.benefit ??= false;
		this.parameters.detriment ??= false;

		this.resolver.resolveAll();
	}

	/**
	 * Disabled all modifiers of a give type and sign
	 * @param {string} path
	 * @param {ModifierType} modifierType
	 */
	#disableModifierType(path, modifierType) {
		this.resolver.effects[path]
			.filter((m) => m.modifier_type === modifierType)
			.forEach((m) => (m.enabled = false));
	}

	/**
	 * Add a new modifier to the check
	 * @param {PendingEffect} pendingEffect
	 */
	addModifier(pendingEffect) {
		const path = pendingEffect.value < 0 ? "penalty" : "bonus";

		if (pendingEffect.modifier_type !== "universal") {
			this.#disableModifierType(path, pendingEffect.modifier_type);
		}

		/** @type DynamicEffect */
		const newEffect = {
			label: pendingEffect.label,
			mode:
				pendingEffect.modifier_type === "universal" ? "add" : "upgrade",

			domains: new Set([this.idDomain]),
			applicable_if: true,
			enabled: true,

			modifier_type: pendingEffect.modifier_type,
			value: Math.abs(pendingEffect.value),
		};

		this.resolver.effects[path].push(newEffect);
		this.resolver.reset();
	}

	/**
	 * Toggle the effect, will disable all others of type and sign if needed.
	 * @param {string} path
	 * @param {string} index
	 */
	toggle(path, index) {
		const effect = this.resolver.effects[path][index];

		// If we're enabling a non-universal modifier we disable all with the same type and sign first
		if (!effect.enabled && effect.modifier_type !== "universal") {
			this.#disableModifierType(path, effect.modifier_type);
		}

		effect.enabled = !effect.enabled;
		this.resolver.reset();
	}

	/**
	 * Set the check base difficulty
	 * @param {number|"open"} difficulty
	 */
	setDifficulty(difficulty) {
		this.parameters.difficulty = difficulty;
	}

	toggleBenefit() {
		this.parameters.benefit = !this.parameters.benefit;
	}
	toggleDetriment() {
		this.parameters.detriment = !this.parameters.detriment;
	}

	/**
	 * Generate the roll formula to be used.
	 * @returns {string} - The formula used for the roll.
	 */
	get formula() {
		const sum = this.resolver.modifierSum();

		const sumStr = sum === 0 ? "" : sum < 0 ? sum.toString() : `+${sum}`;

		return `d20${sumStr}`;
	}

	/**
	 * Is the check currently an open check
	 * @returns {boolean}
	 */
	get isOpen() {
		return this.parameters.difficulty === "open";
	}

	/**
	 * Benefit and detriment-adjusted difficulty, or "open"
	 */
	get difficulty() {
		return this.isOpen
			? "open"
			: this.parameters.difficulty -
					(this.parameters.benefit ? 5 : 0) +
					(this.parameters.detriment ? 5 : 0);
	}

	async display() {
		return CheckWindow.wait(this, {});
	}

	/**
	 * Calculate the result tier and difference
	 * @returns {{difference: number, result_tier: -1|0|1|2}}
	 */
	calculateResult() {
		const difference = this.roll.total - this.difficulty;

		let result_tier;
		if (difference >= 10) result_tier = 2;
		else if (difference >= 0) result_tier = 1;
		else if (difference > -10) result_tier = 0;
		else result_tier = -1;

		const d20_result = this.roll.d20_result;

		if (d20_result === 20) result_tier += 1;
		else if (d20_result === 1) result_tier -= 1;

		result_tier = Math.clamp(result_tier, -1, 2);

		return {
			difference,
			result_tier,
		};
	}

	async executeCheck() {
		this.resolver.resolveAll();

		const rollMode = game.settings.get("core", "messageMode");

		this.roll = new WardenCheck(this.formula, this.rollData, {
			difficulty: this.difficulty,
			modifiers: transformEffectsForDisplay(
				this.resolver.appliedEffects,
				this.resolver,
			),
		});

		await this.roll.evaluate();

		if (!this.isOpen) {
			Object.assign(this.roll.options, this.calculateResult());
		}

		await this.roll.toMessage({
			speaker: this.speaker,
			rollMode,
			flavor: this.parameters.title,
		});

		return this.roll;
	}
}

/**
 * Create a CheckWindow.
 * @param {object} rollData
 * @param {ChatSpeakerData} speaker
 * @param {DynamicResultResolver} resolver
 * @param {Partial<CheckParameters>} parameters
 * @param {{skip?:boolean}} options
 */
export const runCheck = async (
	rollData,
	speaker,
	resolver,
	parameters,
	options,
) => {
	const manager = new CheckManager(rollData, speaker, resolver, parameters);

	options.skip ??= false;

	if (!options.skip) {
		const success = await manager.display();
		if (!success) {
			return null;
		}
	}

	return manager.executeCheck();
};

const TYPES_ORDER = {
	universal: 0,
	proficiency: 1,
	item: 2,
	status: 3,
	circumstance: 4,
};
// Sort by modifier type, bonus/penalty, label, then index
const modifierSort = (a, b) => {
	return (
		TYPES_ORDER[a.modifier_type] - TYPES_ORDER[b.modifier_type] ||
		a.dir - b.dir ||
		a.label.localeCompare(b.label) ||
		a.index - b.index
	);
};
export const transformEffectsForDisplay = (effects, resolver) => {
	const annotatedBonuses =
		effects.bonus?.map((e, i) => ({
			path: "bonus",
			index: i,
			modifier_type: e.modifier_type,
			dir: 1,
			label: e.label ?? "",
			value: resolver.parseValue(e.value),
			enabled: e.enabled,
		})) ?? [];
	const annotatedPenalties =
		effects.penalty?.map((e, i) => ({
			path: "penalty",
			index: i,
			modifier_type: e.modifier_type,
			dir: -1,
			label: e.label ?? "",
			value: -resolver.parseValue(e.value),
			enabled: e.enabled,
		})) ?? [];

	const modifiers = annotatedBonuses.concat(annotatedPenalties);
	modifiers.sort(modifierSort);

	return modifiers;
};
