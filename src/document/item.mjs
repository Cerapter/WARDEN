export class WardenItem extends Item {
	async _preCreate(data, options, user) {
		if ((await super._preCreate(data, options, user)) === false)
			return false;

		if (data.type === "origin" && this.parent?.type === "character") {
			if (this.parent.system.origins.length >= 2) {
				ui.notifications.warn(
					"warden.character.sheet.warnings.too-many-origins",
				);
				return false;
			}
		}
		if (data.type === "ability") {
			if (
				this.parent &&
				this.parent.system.abilities?.some(
					(a) => a.system.slug === data.system.slug,
				)
			) {
				ui.notifications.warn(
					"warden.character.sheet.warnings.duplicate-ability",
				);
				return false;
			}
		}
		if (data.type === "feat") {
			if (
				this.parent &&
				this.parent.system.feats.some(
					(f) => f.system.slug === data.system.slug,
				)
			) {
				ui.notifications.warn(
					"warden.character.sheet.warnings.duplicate-feat",
				);
				return false;
			}
			if (
				this.parent &&
				!this.parent.system.abilities.some(
					(a) => a.system.slug === data.system.parentAbilitySlug,
				)
			) {
				ui.notifications.warn(
					"warden.character.sheet.warnings.no-required-ability",
				);
				return false;
			}
		}
	}

	async _preDelete(options, user) {
		if ((await super._preDelete(options, user)) === false) return false;

		if (this.parent && this.type === "ability") {
			this.parent.system.feats
				.filter((f) => f.system.parentAbilitySlug === this.system.slug)
				.forEach((f) => f.delete());
		}
	}
}
