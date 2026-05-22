import { BaseOpponentData } from "./base_opponent.mjs";

const { NumberField } = foundry.data.fields;

export class AdversaryData extends BaseOpponentData {
	/**
	 * @returns Object
	 */
	static defineSchema() {
		const schema = super.defineSchema();

		schema.level = new NumberField({
			required: true,
			min: 0,
			max: 12,
			initial: 1,
		});

		return schema;
	}

	get is_mook() {
		return false;
	}
}
