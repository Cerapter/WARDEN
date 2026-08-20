const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheet } = foundry.applications.sheets;

export class BaseCharacterSheet extends HandlebarsApplicationMixin(ActorSheet) {
	async _prepareContext(options) {
		const context = await super._prepareContext(options);

		context.actor = this.actor;
		context.system = this.actor.system;

		context.fields = this.actor.system.schema.fields;

        const conditions = await Promise.all(
			context.system.conditions.map(async (a) => ({
				id: a.id,
				name: a.name,
                variant: a.system.variant,
                type: a.system.type,
				description:
					await foundry.applications.ux.TextEditor.implementation.enrichHTML(
						a.system.description,
					),
			}))
		);

        context.conditions = {
            temporary: conditions.filter((a) => a.variant === "condition" && a.type === "temporary"),
            persistent: conditions.filter((a) => a.variant === "condition" && a.type === "persistent"),
            permanent: conditions.filter((a) => a.variant === "condition" && a.type === "permanent"),
        } 

        context.warden_active_effects = {
            temporary: conditions.filter((a) => a.variant === "active_effect" && a.type === "temporary"),
            persistent: conditions.filter((a) => a.variant === "active_effect" && a.type === "persistent"),
            permanent: conditions.filter((a) => a.variant === "active_effect" && a.type === "permanent"),
        } 

        return context;
    }

	async _onDropItem(event, item) {
        if (this.actor.uuid !== item.parent?.uuid) {
            if (item.type === "condition")
                return this.onDropCondition(event, item);
        }

        return super._onDropItem(event, item);
    }

    async onDropCondition(event, item) {
		await this.actor.system.editConditions(item, { destArea: "condition_item_ids" });
    }
}