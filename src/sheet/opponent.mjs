import { runCheck } from "../roll/check_manager.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheet } = foundry.applications.sheets;

export class OpponentSheet extends HandlebarsApplicationMixin(ActorSheet) {
	static PARTS = {
		main: {
			template: "systems/warden/static/sheets/opponent-sheet.hbs",
		},
	};

	static DEFAULT_OPTIONS = {
		actions: {
			toggleValue: OpponentSheet.toggleValue,
			check: OpponentSheet.check,
			addAbility: OpponentSheet.addAbility,
			deleteAbility: OpponentSheet.deleteAbility,
		},
		window: {
			contentClasses: ["zero-pad"],
		},
		position: {
			width: 300,
		},
		form: {
			submitOnChange: true,
		},
	};

	async _prepareContext(options) {
		const context = await super._prepareContext(options);

		const actor = this.actor;
		const system = actor.system;

		context.actor = actor;
		context.system = system;

		context.fields = system.schema.fields;

		context.majorStatistic = this.#prepareStatisticDisplay("major", true);
		context.minorStatistic = this.#prepareStatisticDisplay("minor", false);

		context.proficiencies = [
			this.#prepareProficiencyDisplay("toughness", "defense.toughness"),
			this.#prepareProficiencyDisplay("combat", "path.combat"),
			this.#prepareProficiencyDisplay("perception", "defense.perception"),
			this.#prepareProficiencyDisplay("special", "path.special"),
			this.#prepareProficiencyDisplay("resolve", "defense.resolve"),
			this.#prepareProficiencyDisplay("skill", "path.skill"),
		];

		return context;
	}

	#prepareStatisticDisplay(name, is_major) {
		const resolver = this.actor.system.statisticResolver(is_major);
		const rank = resolver.resolve("proficiency_rank");
		const bonus = resolver.modifierSum();
		return { name, rank, bonus };
	}
	#prepareProficiencyDisplay(name, dataPath) {
		const resolver = this.actor.system.proficiencyCheckResolver(name);
		const is_major = this.actor.system[name].is_major;
		const bonus = resolver.modifierSum();
		return { name, is_major, bonus, path: dataPath };
	}

	/**
	 * Reject all dropped items
	 * @return {Promise<null>}
	 * @private
	 */
	async _onDropItem() {
		return null;
	}

	async _onRender(context, options) {
		await super._onRender(context, options);

		this.element
			.querySelectorAll(".textarea-auto-size-wrapper")
			.forEach((wrapper) => {
				const textarea = wrapper.querySelector("textarea");
				textarea.addEventListener("input", () => {
					wrapper.dataset.content = textarea.value;
				});
			});
	}

	static async toggleValue(_, target) {
		const path = target.dataset.path;
		this.actor.update({
			[path]: !foundry.utils.getProperty(this.actor, path),
		});
	}

	static async check(e, target) {
		const rollData = this.actor.getRollData();
		const speaker = ChatMessage.getSpeaker({ actor: this.actor });

		/**
		 * @type CheckParameters
		 */
		let parameters;
		let resolver;
		switch (target.dataset.type) {
			case "statistic":
				const major = target.dataset.major === "true";
				resolver = this.actor.system.statisticResolver(major);
				parameters = {
					title: _loc("warden.check_label", {
						type: _loc(
							`warden.character.statistic.${major ? "major" : "minor"}.label`,
						),
					}),
				};
				break;
			case "proficiency":
				const name = target.dataset.name;
				const locPath = target.dataset.path;
				resolver = this.actor.system.proficiencyCheckResolver(name);
				parameters = {
					title: _loc("warden.check_label", {
						type: _loc(`warden.character.FIELDS.${locPath}.label`),
					}),
				};
				break;
		}

		return runCheck(rollData, speaker, resolver, parameters, {
			skip: e.shiftKey,
		});
	}
	static async addAbility() {
		await this.actor.update({
			[`system.abilities.${foundry.utils.randomID()}`]: {},
		});
	}
	static async deleteAbility(_, target) {
		const id = target.dataset.id;

		await this.actor.update({
			[`system.abilities.${id}`]:
				new foundry.data.operators.ForcedDeletion(),
		});
	}
}
