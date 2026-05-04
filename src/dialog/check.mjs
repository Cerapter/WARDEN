const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * The window used to describe and edit check rolls.
 * @property {CheckManager} manager
 * @property {Modifier} pending_modifier - The work in progress modifier being input.
 */
export class CheckWindow extends HandlebarsApplicationMixin(ApplicationV2) {
	/**
	 * Create a CheckWindow.
	 * @param {CheckManager} manager
	 * @param {object} options
	 * @param {function} resolve
	 */
	constructor(manager, options, resolve = null) {
		super(options);

		this.manager = manager;

		this.resolve = resolve;
		this.pending_modifier = {
			value: 0,
			label: "",
			type: "circumstance",
			enabled: true,
		};
	}

	static PARTS = {
		main: {
			template: "systems/warden/static/dialog/check-window.hbs",
			forms: {
				".add-modifier-form": {
					handler: CheckWindow.#addModifier,
					submitOnChange: true,
					closeOnSubmit: false,
				},
			},
		},
	};

	static DEFAULT_OPTIONS = {
		actions: {
			execute: CheckWindow.#confirm,
			toggleModifier: CheckWindow.#toggleModifier,
		},
	};

	get title() {
		return this.manager.parameters.title ?? "Check";
	}

	async _prepareContext(options) {
		const context = await super._prepareContext(options);

		context.parameters = this.manager.parameters;
		context.formula = this.manager.formula;

		context.pending_modifier = this.pending_modifier;
		context.choices = {
			universal: "warden.modifier_type_abbr.universal",
			proficiency: "warden.modifier_type_abbr.proficiency",
			item: "warden.modifier_type_abbr.item",
			status: "warden.modifier_type_abbr.status",
			circumstance: "warden.modifier_type_abbr.circumstance",
		};

		return context;
	}

	static async #confirm() {
		this.close({ submit: true });
		if (this.resolve !== null) {
			this.resolve(true);
		}
	}

	static async #toggleModifier(_, target) {
		const id = target.dataset.id;
		this.manager.toggle(id);

		this.render();
	}
	static async #addModifier(e, form, data) {
		Object.assign(this.pending_modifier, data.object);

		if (e.type !== "submit") return;

		this.manager.addModifier(this.pending_modifier);

		this.pending_modifier = {
			value: 0,
			label: "",
			type: "circumstance",
			enabled: true,
		};

		this.render();
	}

	static async wait(manager, options) {
		return new Promise((resolve) => {
			const prompt = new this(manager, options, resolve);

			prompt.addEventListener(
				"close",
				() => {
					resolve(false);
				},
				{ once: true },
			);

			prompt.render(true);
		});
	}
}
