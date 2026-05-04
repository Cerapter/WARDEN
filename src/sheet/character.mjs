import { CheckWindow } from "../dialog/check.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheet } = foundry.applications.sheets;

export class CharacterSheet extends HandlebarsApplicationMixin(ActorSheet) {
	static PARTS = {
		main: {
			template: "systems/warden/static/sheets/character-sheet.hbs",
			scrollable: ["", ".description textarea"],
			templates: [
				"systems/warden/static/partials/proficiency-display.hbs",
				"systems/warden/static/partials/skill-display.hbs",
				"systems/warden/static/partials/knowledge-skill-display.hbs",
			],
		},
	};

	static DEFAULT_OPTIONS = {
		actions: {
			clickChanger: {
				handler: CharacterSheet.clickChanger,
				buttons: [0, 2],
			},
			toggleValue: CharacterSheet.toggleValue,
			addKnowledgeSkill: CharacterSheet.addKnowledgeSkill,
			deleteKnowledgeSkill: CharacterSheet.deleteKnowledgeSkill,
			check: CharacterSheet.check,
		},
		window: {
			contentClasses: ["zero-pad"],
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

		context.three_fields = Array.fromRange(3);
		context.five_fields = Array.fromRange(5);

		return context;
	}

	static async clickChanger(e, target) {
		const path = target.dataset.path;
		const dataField = this.actor.getFieldForProperty(path);
		const property = foundry.utils.getProperty(this.actor, path);

		const change = e.button === 0 ? 1 : -1;
		this.actor.update({
			[path]: Math.clamp(
				property + change,
				dataField.options.min,
				dataField.options.max,
			),
		});
	}
	static async toggleValue(_, target) {
		const path = target.dataset.path;
		this.actor.update({
			[path]: !foundry.utils.getProperty(this.actor, path),
		});
	}
	static async addKnowledgeSkill() {
		await this.actor.update({
			[`system.knowledge_skills.${foundry.utils.randomID()}`]: {},
		});
	}
	static async deleteKnowledgeSkill(_, target) {
		const id = target.dataset.id;

		await this.actor.update({
			[`system.knowledge_skills.${id}`]:
				new foundry.data.operators.ForcedDeletion(),
		});
	}

	static async check(_, target) {
		const rollData = this.actor.getRollData();
		const speaker = ChatMessage.getSpeaker({ actor: this.actor });

		let parameters;
		switch (target.dataset.type) {
			case "untrained":
				parameters = this.actor.system.untrainedRollParameters();
				break;
			case "proficiency":
				const path = target.dataset.path;
				parameters = this.actor.system.proficiencyRollParameters(path);
				break;
		}

		new CheckWindow(rollData, speaker, parameters).render(true);
	}
}
