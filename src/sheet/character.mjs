const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheet } = foundry.applications.sheets;

export class CharacterSheet extends HandlebarsApplicationMixin(ActorSheet) {
	static PARTS = {
		main: {
			template: "systems/warden/static/sheets/character-sheet.hbs",
			scrollable: [""],
		},
	};

	static DEFAULT_OPTIONS = {
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

		return context;
	}
}
