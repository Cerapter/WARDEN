import { BaseEquipment } from "./base_equipment.mjs";

const { NumberField } = foundry.data.fields;
const { renderTemplate } = foundry.applications.handlebars;

/**
 * @property {number} defense
 * @property {number} block
 */
export class Shield extends BaseEquipment {
	static defineSchema() {
		return {
			...super.defineSchema(),

			defense: new NumberField({
				required: true,
				initial: 0,
				min: 0,
				integer: true,
				label: "warden.shield.defense.label",
			}),

			block: new NumberField({
				required: true,
				initial: 0,
				min: 0,
				integer: true,
				label: "warden.shield.block.label",
			}),
		};
	}

	getProperties() {
		const properties = { ...super.getProperties() };

		properties.defense = {
			field: this.schema.fields.defense,
			value: this.defense,
		};
		properties.block = {
			field: this.schema.fields.block,
			value: this.block,
		};

		return properties;
	}

	/**
	 * Displays defense and block values
	 * @returns {HTMLElement}
	 */
	async equippedSnippet() {
		return renderTemplate(
			"systems/warden/static/sheets/item/shield-snippet.hbs",
			{
				shield: this,
			},
		);
	}
}
