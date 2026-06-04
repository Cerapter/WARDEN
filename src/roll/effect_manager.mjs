import { EffectWindow } from "../dialog/effect.mjs";
import { WardenEffect } from "./warden_effect.mjs";

/**
 * All the data and descriptions for rolling an effect
 * @typedef {Object} EffectParameters
 * @property {string} title - Title for the roll window and chat message.
 * @property {number} num_dice - Number of dice to pick from
 * @property {4|6|8|10|12} die_size - Die size to roll
 * @property {number} potency - Number of dice to pick
 * @property {number} modifier - Base modifier to roll
 * */

/**
 * @property {object} rollData
 * @property {ChatSpeakerData} speaker - Who should the roll message originate from.
 * @property {EffectParameters} parameters - The parameters used for the roll.
 */
class EffectManager {
	/**
	 * Create a CheckManager.
	 * @param {object} rollData
	 * @param {ChatSpeakerData} speaker
	 * @param {EffectParameters} parameters
	 */
	constructor(rollData, speaker, parameters) {
		this.rollData = rollData;
		this.speaker = speaker;
		this.parameters = parameters;

		this.#validateParameters();
	}

	/**
	 * Generate the roll formula to be used.
	 * @returns {string} - The formula used for the roll.
	 */
	get formula() {
		const mod = this.parameters.modifier;
		const modStr = mod === 0 ? "" : mod < 0 ? mod.toString() : `+${mod}`;

		return `${this.parameters.num_dice}d${this.parameters.die_size}kh${this.parameters.potency}${modStr}`;
	}

	async display() {
		return EffectWindow.wait(this, {});
	}

	setNumDice(num_dice) {
		this.parameters.num_dice = num_dice;
		this.#validateParameters();
	}
	setDieSize(die_size) {
		this.parameters.die_size = die_size;
		this.#validateParameters();
	}
	setPotency(potency) {
		this.parameters.potency = potency;
		this.#validateParameters();
	}
	setModifier(modifier) {
		this.parameters.modifier = modifier;
		this.#validateParameters();
	}
	#validateParameters() {
		if (this.parameters.num_dice > 5) {
			this.parameters.modifier += this.parameters.num_dice - 5;
		}

		this.parameters.num_dice = Math.clamp(this.parameters.num_dice, 1, 5);
		this.parameters.die_size = Math.clamp(this.parameters.die_size, 4, 12);
		this.parameters.potency = Math.clamp(
			this.parameters.potency,
			1,
			this.parameters.num_dice,
		);
	}

	async executeCheck() {
		const rollMode = game.settings.get("core", "messageMode");

		this.roll = new WardenEffect(this.formula, this.rollData, {});

		await this.roll.evaluate();

		await this.roll.toMessage({
			speaker: this.speaker,
			rollMode,
			flavor: this.parameters.title,
		});

		return this.roll;
	}
}

/**
 * Create an EffectWindow.
 * @param {object} rollData
 * @param {ChatSpeakerData} speaker
 * @param {Partial<EffectParameters>} parameters
 * @param {{skip?:boolean}} options
 */
export const runEffect = async (rollData, speaker, parameters, options) => {
	const manager = new EffectManager(rollData, speaker, parameters);

	options.skip ??= false;

	if (!options.skip) {
		const success = await manager.display();
		if (!success) {
			return null;
		}
	}

	return manager.executeCheck();
};
