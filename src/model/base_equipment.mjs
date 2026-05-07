const { NumberField, StringField } = foundry.data.fields;
const { TypeDataModel } = foundry.abstract;

/**
 * @typedef {"light"|"normal"|"heavy"|"huge"} Weight
 */

/**
 * Base class for equipment, i.e. anything that can go in the inventory
 * @property {number} rarity
 * @property {"light"|"normal"|"heavy"|"huge"} weight
 * @property {"undamaged"|"damaged"|"broken"} condition
 */
export class BaseEquipment extends TypeDataModel {
	static LOCALIZATION_PREFIXES = ["warden.equipment"];

	static isItemEquipment = (item) => {
		return item.system?.isEquipment?.() ?? false;
	};

	static defineSchema() {
		return {
			rarity: new NumberField({
				required: true,
				min: 0,
				max: 10,
				initial: 0,
				integer: true,
			}),

			weight: new StringField({
				required: true,
				initial: "normal",
				choices: {
					light: "warden.equipment.weight.light",
					normal: "warden.equipment.weight.normal",
					heavy: "warden.equipment.weight.heavy",
					huge: "warden.equipment.weight.huge",
				},
			}),

			condition: new StringField({
				required: true,
				initial: "undamaged",
				choices: {
					undamaged: "warden.equipment.condition.undamaged",
					damaged: "warden.equipment.condition.damaged",
					broken: "warden.equipment.condition.broken",
				},
			}),
		};
	}

	getProperties() {
		const properties = {};

		properties.rarity = {
			field: this.schema.fields.rarity,
			value: this.rarity,
			type: "number",
		};
		properties.weight = {
			field: this.schema.fields.weight,
			value: this.weight,
		};
		properties.condition = {
			field: this.schema.fields.condition,
			value: this.condition,
		};

		return properties;
	}

	isEquipment() {
		return true;
	}
}
