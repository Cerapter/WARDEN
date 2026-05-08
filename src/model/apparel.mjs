import { BaseEquipment } from "./base_equipment.mjs";

const { NumberField, StringField } = foundry.data.fields;

/**
 * @property {number} armor
 * @property {string} strength
 * @property {string} weakness
 */
export class Apparel extends BaseEquipment {
	static defineSchema() {
		return {
			...super.defineSchema(),

			armor: new NumberField({
				required: true,
				initial: 0,
				min: 0,
				integer: true,
				label: "warden.apparel.armor.label",
			}),

			strength: new StringField({
				required: true,
				nullable: true,
				initial: null,
				choices: WARDEN.DAMAGE_TYPE_CHOICES,
				label: "warden.apparel.strength.label",
			}),
			weakness: new StringField({
				required: true,
				nullable: true,
				initial: null,
				choices: WARDEN.DAMAGE_TYPE_CHOICES,
				label: "warden.apparel.weakness.label",
			}),
		};
	}

	getProperties() {
		const properties = { ...super.getProperties() };

		properties.armor = {
			field: this.schema.fields.armor,
			value: this.armor,
		};
		properties.strength = {
			field: this.schema.fields.strength,
			value: this.strength,
		};
		properties.weakness = {
			field: this.schema.fields.weakness,
			value: this.weakness,
		};

		return properties;
	}
}
