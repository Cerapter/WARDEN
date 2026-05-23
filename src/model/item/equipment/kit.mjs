import { BaseEquipment } from "./base_equipment.mjs";

const { SchemaField, NumberField } = foundry.data.fields;

/**
 * @property {{current: number, max:number}} charges
 * @property {number} pack_slots
 */
export class Kit extends BaseEquipment {
	static defineSchema() {
		return {
			...super.defineSchema(),

			charges: new SchemaField({
				current: new NumberField({
					required: true,
					min: 0,
					initial: 1,
					label: "warden.kit.charges.current.label",
				}),
				max: new NumberField({
					required: true,
					min: 1,
					max: 3,
					initial: 1,
					label: "warden.kit.charges.max.label",
				}),
			}),

			pack_slots: new NumberField({
				required: true,
				min: 2,
				max: 6,
				initial: 2,
				label: "warden.kit.pack_slots.label",
			}),
		};
	}

	prepareDerivedData() {
		super.prepareDerivedData();

		this.charges.current = Math.min(this.charges.current, this.charges.max);
	}

	getProperties() {
		const properties = { ...super.getProperties() };

		properties.current_charges = {
			field: this.schema.fields.charges.fields.current,
			value: this.charges.current,
		};
		properties.max_charges = {
			field: this.schema.fields.charges.fields.max,
			value: this.charges.max,
		};

		properties.pack_slots = {
			field: this.schema.fields.pack_slots,
			value: this.pack_slots,
		};

		return properties;
	}
}
