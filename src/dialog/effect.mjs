const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * The window used to describe and edit effect rolls.
 * @property {EffectManager} manager
 */
export class EffectWindow extends HandlebarsApplicationMixin(ApplicationV2) {
	/**
	 * Create an EffectWindow.
	 * @param {EffectManager} manager
	 * @param {object} options
	 * @param {function} resolve
	 */
	constructor(manager, options, resolve = null) {
		super(options);

		this.manager = manager;

		this.resolve = resolve;
	}

	static PARTS = {
		main: {
			template: "systems/warden/static/dialog/effect-window.hbs",
		},
	};

	static DEFAULT_OPTIONS = {
		actions: {
			num_dice: EffectWindow.#numDice,
			die_size: EffectWindow.#dieSize,
			potency: EffectWindow.#potency,
			modifier: EffectWindow.#modifier,
		},
		tag: "form",
		form: {
			closeOnSubmit: false,
			handler: EffectWindow.#formHandler,
			submitOnChange: true,
		},
	};

	get title() {
		return this.manager.parameters.title ?? "Effect";
	}

	async _prepareContext(options) {
		const context = await super._prepareContext(options);

		context.manager = this.manager;
		context.parameters = this.manager.parameters;

		return context;
	}

	static async #formHandler(e, form, data) {
		this.manager.setNumDice(parseInt(data.get("num_dice")));
		this.manager.setDieSize(parseInt(data.get("die_size")));
		this.manager.setPotency(parseInt(data.get("potency")));
		this.manager.setModifier(parseInt(data.get("modifier")));

		if (e.type !== "submit") {
			this.render();
			return;
		}

		this.close({ submit: true });
		if (this.resolve !== null) {
			this.resolve(true);
		}
	}

	static async #numDice(e, target) {
		const new_value =
			this.manager.parameters.num_dice +
			(target.dataset.dir === "up" ? +1 : -1);
		this.manager.setNumDice(new_value);

		this.render();
	}
	static async #dieSize(e, target) {
		const new_value =
			this.manager.parameters.die_size +
			(target.dataset.dir === "up" ? +2 : -2);
		this.manager.setDieSize(new_value);

		this.render();
	}
	static async #potency(e, target) {
		const new_value =
			this.manager.parameters.potency +
			(target.dataset.dir === "up" ? +1 : -1);
		this.manager.setPotency(new_value);

		this.render();
	}
	static async #modifier(e, target) {
		const new_value =
			this.manager.parameters.modifier +
			(target.dataset.dir === "up" ? +1 : -1);
		this.manager.setModifier(new_value);

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
