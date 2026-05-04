const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class CheckWindow extends HandlebarsApplicationMixin(ApplicationV2) {
	constructor(rollData, speaker, parameters) {
		super();

		this.rollData = rollData;
		this.speaker = speaker;
		this.parameters = parameters;

		for (const modifier of this.parameters.modifiers) {
			modifier.enabled = modifier.type === "universal";
		}

		this.#enableBiggestModifiers("proficiency");
		this.#enableBiggestModifiers("item");
		this.#enableBiggestModifiers("status");
		this.#enableBiggestModifiers("circumstance");
	}
	#enableBiggestModifiers(type) {
		const sorted = this.parameters.modifiers
			.filter((m) => m.type === type)
			.sort((a, b) => a.value - b.value);

		const smallest = sorted[0];
		const biggest = sorted[sorted.length - 1];

		if (smallest && smallest.value < 0) {
			smallest.enabled = true;
		}
		if (biggest && biggest.value > 0) {
			biggest.enabled = true;
		}
	}

	static PARTS = {
		main: {
			template: "systems/warden/static/dialog/check-window.hbs",
		},
	};

	static DEFAULT_OPTIONS = {
		actions: {
			execute: CheckWindow.#execute,
			toggleModifier: CheckWindow.#toggleModifier,
		},
	};

	get title() {
		return this.parameters.title ?? "Check";
	}

	async _prepareContext(options) {
		const context = await super._prepareContext(options);

		context.parameters = this.parameters;
		context.formula = this.#formula;

		return context;
	}

	get #formula() {
		const sum =
			this.parameters.modifiers
				?.filter((o) => o.enabled ?? false)
				?.map((o) => o.value)
				?.reduce((a, b) => a + b, 0) ?? 0;

		const sumStr = sum === 0 ? "" : sum < 0 ? sum.toString() : `+${sum}`;

		return `d20${sumStr}`;
	}

	static async #execute() {
		const rollMode = game.settings.get("core", "messageMode");

		const roll = new Roll(this.#formula, this.rollData);

		await roll.evaluate();
		await roll.toMessage({
			speaker: this.speaker,
			rollMode,
			flavor: this.parameters.title,
		});

		this.close();
		return roll;
	}
	static async #toggleModifier(_, target) {
		const id = target.dataset.id;

		const mod = this.parameters.modifiers[id];

		// If we're enabling a non-universal modifier we disable all with the same type and sign first
		if (!mod.enabled && mod.type !== "universal") {
			this.parameters.modifiers
				.filter((m) => m.type === mod.type)
				.filter((m) => Math.sign(m.value) === Math.sign(mod.value))
				.forEach((m) => (m.enabled = false));
		}

		mod.enabled = !mod.enabled;

		this.render();
	}
}
