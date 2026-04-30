const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheet } = foundry.applications.sheets;

export class CharacterSheet extends HandlebarsApplicationMixin(ActorSheet) {
	static PARTS = {
		main: {
			template: "systems/warden/static/sheets/character-sheet.hbs",
		},
	};

	static DEFAULT_OPTIONS = {
		form: {
			submitOnChange: true,
		},
	};

	async _prepareContext(options) {
		const context = await super._prepareContext(options);
		context.actor = this.actor;
		context.system = this.actor.system;
		return context;
	}
}
