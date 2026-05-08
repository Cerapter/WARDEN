import { runCheck } from "../roll/check_manager.mjs";
import { WardenEffect } from "../roll/warden_effect.mjs";
import { BaseEquipment } from "./base_equipment.mjs";

const { NumberField, StringField } = foundry.data.fields;

/**
 * @property {"melee"|"ranged"} type
 * @property {number} hands
 * @property {number} range
 * @property {4|6|8|10|12} dic_size
 * @property {string} damage_type
 */
export class Weapon extends BaseEquipment {
	static defineSchema() {
		return {
			...super.defineSchema(),

			type: new StringField({
				required: true,
				initial: "melee",
				choices: {
					melee: "warden.weapon.type.melee",
					ranged: "warden.weapon.type.ranged",
				},
				label: "warden.weapon.type.label",
			}),

			hands: new NumberField({
				required: true,
				initial: 1,
				choices: {
					1: "1",
					2: "2",
				},
				label: "warden.weapon.hands.label",
			}),

			range: new NumberField({
				required: true,
				initial: 1,
				integer: true,
				label: "warden.weapon.range.label",
			}),

			damage_die: new NumberField({
				required: true,
				initial: 6,
				choices: {
					4: "d4",
					6: "d6",
					8: "d8",
					10: "d10",
					12: "d12",
				},
				label: "warden.weapon.damage_die.label",
			}),
			damage_type: new StringField({
				required: true,
				initial: "slash",
				choices: WARDEN.DAMAGE_TYPE_CHOICES,
				label: "warden.weapon.damage_type.label",
			}),
		};
	}

	getProperties() {
		const properties = { ...super.getProperties() };

		properties.type = {
			field: this.schema.fields.type,
			value: this.type,
		};
		properties.hands = {
			field: this.schema.fields.hands,
			value: this.hands,
		};
		properties.range = {
			field: this.schema.fields.range,
			value: this.range,
		};
		properties.damage_die = {
			field: this.schema.fields.damage_die,
			value: this.damage_die,
		};
		properties.damage_type = {
			field: this.schema.fields.damage_type,
			value: this.damage_type,
		};

		return properties;
	}

	/**
	 * @returns {ActionButton[]}
	 */
	get equippedButtons() {
		const rollData = this.parent.actor.getRollData();
		const speaker = ChatMessage.getSpeaker({
			actor: this.parent.actor,
		});

		const parameters =
			this.parent.actor.system.proficiencyCheckParameters("path.combat");
		const strike_title = _loc(
			this.type === "melee"
				? "warden.action.melee_strike_weapon_title"
				: "warden.action.ranged_strike_weapon_title",
			{ weapon: this.parent.name },
		);

		return [
			{
				label: "Strike v. 10",
				onClick: (e) =>
					runCheck(
						rollData,
						speaker,
						{
							...parameters,
							difficulty: 10,
							title: strike_title,
						},
						{ skip: e.shiftKey },
					),
			},
			{
				label: "v. 15",
				onClick: (e) =>
					runCheck(
						rollData,
						speaker,
						{
							...parameters,
							difficulty: 15,
							title: strike_title,
						},
						{ skip: e.shiftKey },
					),
			},
			{
				label: "v. 20",
				onClick: (e) =>
					runCheck(
						rollData,
						speaker,
						{
							...parameters,
							difficulty: 20,
							title: strike_title,
						},
						{ skip: e.shiftKey },
					),
			},
			{
				label: _loc("warden.weapon.damage_button"),
				onClick: async () => {
					const rollMode = game.settings.get("core", "messageMode");

					const roll = WardenEffect.fromParts(
						this.damage_die,
						Math.max(this.parent.actor.system.path.combat.rank, 1),
						1,
						0,
						rollData,
					);

					await roll.toMessage({
						speaker,
						rollMode,
						flavor: _loc("warden.weapon.damage_flavor", {
							weapon: this.parent.name,
						}),
					});
				},
			},
		];
	}
}
