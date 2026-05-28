import { BaseEquipment } from "./base_equipment.mjs";

const { NumberField, StringField, SetField } = foundry.data.fields;
const { renderTemplate } = foundry.applications.handlebars;

/**
 * @property {number} armor
 * @property {string[]} strength
 * @property {string[]} weakness
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

			strength: new SetField(
				new StringField({
					required: true,
					nullable: true,
					initial: null,
					choices: {
						...WARDEN.DAMAGE_TYPE_CHOICES,
						...WARDEN.DAMAGE_CATEGORY_CHOICES,
					},
					label: "warden.apparel.strength.label",
				}),
				{
					required: true,
					initial: [],
					label: "warden.apparel.strength.label",
				},
			),
			weakness: new SetField(
				new StringField({
					required: true,
					nullable: true,
					initial: null,
					choices: {
						...WARDEN.DAMAGE_TYPE_CHOICES,
						...WARDEN.DAMAGE_CATEGORY_CHOICES,
					},
					label: "warden.apparel.weakness.label",
				}),
				{
					required: true,
					initial: [],
					label: "warden.apparel.weakness.label",
				},
			),
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

	/**
	 * Displays armor value, strength, and weakness
	 * @returns {HTMLElement}
	 */
	async equippedSnippet() {
		return renderTemplate(
			"systems/warden/static/sheets/item/apparel-snippet.hbs",
			{
				apparel: this,
			},
		);
	}
}
