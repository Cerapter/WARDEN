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
		description: {
			template: "systems/warden/static/sheets/item/description.hbs",
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

	static DEFAULT_OPTIONS = {
		actions: {},
		window: {
			contentClasses: ["zero-pad", "item-sheet"],
			resizable: true,
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

	_getTabsConfig(_) {
		const tabs =
			this.item.system.supportedTabs?.map((tab) => ({ id: tab })) ?? [];

		return {
			labelPrefix: "warden.item.sheet.tab",
			tabs,
			initial: tabs[0]?.id,
		};
	}
	async _preparePartContext(partId, context, options) {
		await super._preparePartContext(partId, context, options);

		context.tab = context.tabs[partId];

		switch (partId) {
			case "properties":
				context.properties = this.item.system.getProperties?.() ?? [];
				break;
			case "traits":
				break;
			case "description":
				context.description =
					await foundry.applications.ux.TextEditor.implementation.enrichHTML(
						this.item.system.description,
					);
				break;
		}

		return context;
	}
}
