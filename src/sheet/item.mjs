const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheet } = foundry.applications.sheets;

export class EquipmentSheet extends HandlebarsApplicationMixin(ItemSheet) {
	static PARTS = {
		header: {
			template: "systems/warden/static/sheets/item/header.hbs",
		},
		tabs: {
			template: "templates/generic/tab-navigation.hbs",
		},
		properties: {
			template: "systems/warden/static/sheets/item/properties.hbs",
			scrollable: [""],
		},
		traits: {
			template: "systems/warden/static/sheets/item/traits.hbs",
			scrollable: [""],
		},
	};

	static TABS = {
		primary: {
			initial: "properties",
			labelPrefix: "warden.item.sheet.tab",
			tabs: [{ id: "properties" }, { id: "traits" }],
		},
	};

	static DEFAULT_OPTIONS = {
		actions: {},
		window: {
			contentClasses: ["zero-pad", "item-sheet"],
		},
		form: {
			submitOnChange: true,
		},
	};

	async _prepareContext(options) {
		const context = await super._prepareContext(options);

		context.tabs = await this._prepareTabs("primary");

		const item = this.item;
		const system = item.system;

		context.item = item;
		context.system = system;

		context.fields = system.schema.fields;

		return context;
	}
	async _preparePartContext(partId, context, options) {
		await super._prepareContext(partId, context, options);

		switch (partId) {
			case "properties":
				context.tab = context.tabs[partId];
				context.properties = this.item.system.getProperties();
				break;
			case "traits":
				context.tab = context.tabs[partId];
				break;
		}

		return context;
	}
}
