export class WardenItem extends Item {
	async _preCreate(data, options, user) {
		if ((await super._preCreate(data, options, user)) === false)
			return false;

		if (data.type === "origin" && this.parent.type === "character") {
			if (this.parent.system.origins.length >= 2) {
				ui.notifications.warn(
					"warden.character.sheet.warnings.too-many-origins",
				);
				return false;
			}
		}
	}
}
