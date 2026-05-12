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
				}),
				max: new NumberField({
					required: true,
					min: 1,
					max: 3,
					initial: 1,
				}),
			}),

			pack_slots: new NumberField({
				required: true,
				min: 2,
				max: 6,
				initial: 2,
			}),
		};
	}

	get chargesBoolArray() {
		return Array.fromRange(this.charges.max).map(
			(i) => i < this.charges.current,
		);
	}
}
