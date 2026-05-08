import { CheckWindow } from "../dialog/check.mjs";
import { WardenCheck } from "./warden_check.mjs";

/**
 * @typedef {"universal"|"proficiency"|"item"|"status"|"circumstance"} ModifierType
 */

/**
 * The label, type, and value of a modifier for a check.
 * @typedef {Object} Modifier
 * @property {string} label - The label used to identify the modifier in the roll window and chat.
 * @property {ModifierType} type - The modifier type.
 * @property {number} value - The value of the modifier, positive or negative.
 * @property {boolean?} enabled - Whether to apply the modifier. Defaults to true for universal modifiers and the highest/lowset per type.
 */

/**
 * All the data and descriptions for presenting and making a Check.
 * @typedef {Object} CheckParameters
 * @property {string} title - Title for the roll window and chat message.
 * @property {Modifier[]} modifiers - All the applicable modifiers for the roll.
 * @property {number|"open"?} difficulty - The difficulty of the check, or "open" if open
 * @property {boolean?} benefit - Should the roll gain a benefit.
 * @property {boolean?} detriment - Should the roll suffer a detriment.
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
	 * @param {CheckParameters} parameters
	 */
	constructor(rollData, speaker, parameters) {
		this.rollData = rollData;
		this.speaker = speaker;
		this.parameters = parameters;

		this.parameters.difficulty ??= "open";
		this.parameters.benefit ??= false;
		this.parameters.detriment ??= false;

		for (const modifier of this.parameters.modifiers) {
			modifier.enabled = modifier.type === "universal";
		}

		this.#enableBiggestModifiers("proficiency");
		this.#enableBiggestModifiers("item");
		this.#enableBiggestModifiers("status");
		this.#enableBiggestModifiers("circumstance");
	}
	/**
	 * Enables the biggest (positive or negative) modifier of a type.
	 * @param {ModifierType} type
	 */
	#enableBiggestModifiers(type) {
		this.#disableModifierType(type, 1);
		this.#disableModifierType(type, -1);

		const sorted = this.parameters.modifiers
			.filter((m) => m.type === type)
			.sort((a, b) => a.value - b.value);

		const smallest = sorted[0];
		const biggest = sorted[sorted.length - 1];

		if (smallest && smallest.value < 0) {
			smallest.enabled = true;
		}
		if (biggest && biggest.value >= 0) {
			biggest.enabled = true;
		}
	}

	/**
	 * Disabled all modifiers of a give type and sign
	 * @param {ModifierType} modifierType
	 * @param {-1|1} sign
	 */
	#disableModifierType(modifierType, sign) {
		this.parameters.modifiers
			.filter((m) => m.type === modifierType)
			.filter((m) => Math.sign(m.value) === sign)
			.forEach((m) => (m.enabled = false));
	}

	/**
	 * Add a new modifier to the check
	 * @param {Modifier} modifier
	 */
	addModifier(modifier) {
		if (modifier.enabled && modifier.type !== "universal") {
			this.#disableModifierType(modifier.type, Math.sign(modifier.value));
		}
		this.parameters.modifiers.push(modifier);
	}

	/**
	 * Toggle the modifier with a give id, will disable all others of type and sign if needed.
	 * @param {number} id
	 */
	toggle(id) {
		const modifier = this.parameters.modifiers[id];

		// If we're enabling a non-universal modifier we disable all with the same type and sign first
		if (!modifier.enabled && modifier.type !== "universal") {
			this.#disableModifierType(modifier.type, Math.sign(modifier.value));
		}

		modifier.enabled = !modifier.enabled;
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
		const sum =
			this.parameters.modifiers
				?.filter((o) => o.enabled ?? false)
				?.map((o) => o.value)
				?.reduce((a, b) => a + b, 0) ?? 0;

		const sumStr = sum === 0 ? "" : sum < 0 ? sum.toString() : `+${sum}`;

		return `d20${sumStr}`;
	}

	/**
	 * Benefit and detriment-adjusted difficulty
	 */
	get difficulty() {
		return (
			this.parameters.difficulty -
			(this.parameters.benefit ? 5 : 0) +
			(this.parameters.detriment ? 5 : 0)
		);
	}

	async display() {
		return CheckWindow.wait(this, {});
	}

	async execute() {
		const rollMode = game.settings.get("core", "messageMode");

		const roll = new WardenCheck(this.formula, this.rollData);

		await roll.evaluate();
		await roll.toMessage({
			speaker: this.speaker,
			rollMode,
			flavor: this.parameters.title,
		});

		return roll;
	}
}

/**
 * Create a CheckWindow.
 * @param {object} rollData
 * @param {ChatSpeakerData} speaker
 * @param {CheckParameters} parameters
 * @param {{skip?:boolean}} options
 */
export const runCheck = async (rollData, speaker, parameters, options) => {
	const manager = new CheckManager(rollData, speaker, parameters);

	options.skip ??= false;

	if (!options.skip) {
		const success = await manager.display();
		if (!success) {
			return null;
		}
	}

	return manager.execute();
};
