import { BaseOpponentData } from "./base_opponent.mjs";

const { BooleanField } = foundry.data.fields;

export class MookData extends BaseOpponentData {
	/**
	 * @returns Object
	 */
	static defineSchema() {
		return {
			...super.defineSchema(),

			is_elite: new BooleanField({ required: true, default: false }),
		};
	}

	prepareDerivedData() {
		super.prepareDerivedData();

		if (this.is_elite) {
			this.dynamic_effects.bonus.push({
				label: "Elite",
				domains: new Set([
					"major-statistic",
					"minor-statistic",
					"toughness",
					"perception",
					"resolve",
					"combat",
					"special",
					"skill",
				]),

				defaultEnabled: true,

				modifier_type: "universal",

				mode: "add",
				value: 2,
			});
		}
	}

	get level() {
		return 0;
	}

	get is_mook() {
		return true;
	}
}
