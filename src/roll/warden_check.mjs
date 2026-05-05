export class WardenCheck extends Roll {
	constructor(formula, data, options) {
		super(formula, data, options);

		this.difficulty = options.difficulty;
	}

	/**
	 * The base d20's result, for nat20/nat1 tier adjustment
	 * @return {number}
	 */
	get d20_result() {
		return this.dice
			.find((d) => d.faces === 20)
			.results.find((r) => r.active).result;
	}

	/**
	 * Was the check open
	 * @return {boolean}
	 */
	get isOpen() {
		return this.difficulty === "open";
	}

	/**
	 * Get the classes for displaying a specific tier of result
	 * @param {-1|0|1|2} tier
	 * @returns {string}
	 */
	getTierClasses(tier) {
		switch (tier) {
			case -1:
				return "failure-color bold";
			case 0:
				return "failure-color";
			case 1:
				return "success-color";
			case 2:
				return "success-color bold";
		}
	}

	/**
	 * Get the i18n key for a success tier.
	 * @param {-1|0|1|2} tier
	 * @returns {string}
	 */
	resultTierKey(tier) {
		switch (tier) {
			case -1:
				return "critical_failure";
			case 0:
				return "failure";
			case 1:
				return "success";
			case 2:
				return "critical_success";
		}
	}

	async _prepareChatRenderContext(options) {
		const context = await super._prepareChatRenderContext(options);

		if (!this.isOpen) {
			context.difference = this.options.difference;

			context.result_tier = this.options.result_tier;

			context.result_key = this.resultTierKey(this.options.result_tier);
			context.tier_classes = this.getTierClasses(
				this.options.result_tier,
			);
		}

		context.isOpen = this.isOpen;
		context.d20_result = this.d20_result;
		context.difficulty = this.difficulty;
		context.nat_class =
			this.d20_result === 20
				? "success-color"
				: this.d20_result === 1
					? "failure-color"
					: "";

		return context;
	}

	static CHAT_TEMPLATE = "/systems/warden/static/chat/check.hbs";
}
