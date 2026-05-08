import { BaseCharacterData } from "./base_character.mjs";
import { BaseEquipment } from "./base_equipment.mjs";

const {
	BooleanField,
	DocumentIdField,
	SchemaField,
	SetField,
	StringField,
	NumberField,
	TypedObjectField,
} = foundry.data.fields;

/**
 * @typedef ProficiencyData
 * @property {number} rank
 * @property {number} proficiency_bonus
 * @property {number} bonus
 */
/**
 * @typedef SkillData
 * @property {boolean} is_proficient
 * @property {number} proficiency_bonus
 * @property {number} bonus
 */
/**
 * @typedef KnowledgeSkillData
 * @property {string} topic
 * @property {boolean} is_niche
 * @property {number} proficiency_bonus
 * @property {number} bonus
 */

/**
 * The PC class
 * @property {string} pronouns
 * @property {string} description
 * @property {number} temporary_hit_points
 * @property {0|1|2|3} fate_points
 * @property {{title: string, value: number}} vocation
 * @property {number} wealth
 * @property {boolean} has_savings
 * @property {{combat: ProficiencyData, skill: ProficiencyData, special: ProficiencyData}} path
 * @property {{toughness: ProficiencyData, resolve: ProficiencyData, perception: ProficiencyData}} defense
 * @property {{ crafting: SkillData,
 * 				deception: SkillData,
 * 				diplomacy: SkillData,
 * 				force: SkillData,
 * 				intimidation: SkillData,
 * 				medicine: SkillData,
 * 				mobility: SkillData,
 * 				skullduggery: SkillData,
 * 				stealth: SkillData,
 * 				survival: SkillData }} skill
 * @property {Object.<string, KnowledgeSkillData>} knowledge_skills
 * @property {string} kit_item_id
 * @property {string[]} equipped_item_ids
 * @property {string[]} pocket_item_ids
 * @property {string[]} pack_item_ids
 */
export class CharacterData extends BaseCharacterData {
	static LOCALIZATION_PREFIXES = ["warden.character"];

	/**
	 * @returns Object
	 */
	static defineSchema() {
		const proficiencyField = () =>
			new SchemaField({
				rank: new NumberField({
					required: true,
					integer: true,
					min: 0,
					max: 5,
					initial: 0,
				}),
			});

		const skillField = () =>
			new SchemaField({
				is_proficient: new BooleanField({ required: true }),
			});

		return {
			...super.defineSchema(),

			pronouns: new StringField({ required: true }),
			description: new StringField({ required: true }),

			temporary_hit_points: new NumberField({
				required: true,
				integer: true,
				min: 0,
				initial: 0,
			}),

			fate_points: new NumberField({
				required: true,
				integer: true,
				min: 0,
				max: 3,
				initial: 1,
			}),

			vocation: new SchemaField({
				title: new StringField({ required: true }),
				value: new NumberField({
					required: true,
					integer: true,
					min: 0,
					max: 10,
					initial: 3,
				}),
			}),

			wealth: new NumberField({
				required: true,
				integer: true,
				min: 0,
				initial: 3,
			}),
			has_savings: new BooleanField({ required: true }),

			path: new SchemaField({
				combat: proficiencyField(),
				skill: proficiencyField(),
				special: proficiencyField(),
			}),

			defense: new SchemaField({
				toughness: proficiencyField(),
				resolve: proficiencyField(),
				perception: proficiencyField(),
			}),

			skill: new SchemaField({
				crafting: skillField(),
				deception: skillField(),
				diplomacy: skillField(),
				force: skillField(),
				intimidation: skillField(),
				medicine: skillField(),
				mobility: skillField(),
				skullduggery: skillField(),
				stealth: skillField(),
				survival: skillField(),
			}),

			knowledge_skills: new TypedObjectField(
				new SchemaField({
					topic: new StringField({ required: true }),
					is_niche: new BooleanField({
						required: true,
						default: false,
					}),
				}),
			),

			// TODO: creation hook to fill this with the standard kit
			kit_item_id: new DocumentIdField({
				type: "Item",
				readonly: false,
			}),
			equipped_item_ids: new SetField(
				new DocumentIdField({
					type: "Item",
					readonly: false,
				}),
			),
			pocket_item_ids: new SetField(
				new DocumentIdField({ type: "Item", readonly: false }),
			),
			pack_item_ids: new SetField(
				new DocumentIdField({ type: "Item", readonly: false }),
			),
		};
	}

	get kit() {
		return this.parent.items.get(this.kit_item_id);
	}
	get equipped_items() {
		const mapped = this.equipped_item_ids.map((id) =>
			this.parent.items.get(id),
		);
		return Array.from(mapped).sort((i1, i2) => i1.sort - i2.sort);
	}
	get pocket_items() {
		const mapped = this.pocket_item_ids.map((id) =>
			this.parent.items.get(id),
		);
		return Array.from(mapped).sort((i1, i2) => i1.sort - i2.sort);
	}
	get pack_items() {
		const mapped = this.pack_item_ids.map((id) =>
			this.parent.items.get(id),
		);
		return Array.from(mapped).sort((i1, i2) => i1.sort - i2.sort);
	}

	/**
	 * Could the area contain the item in theory? i.e. this does not check if it can currently fit, only if it possibly could
	 * @param {Item} item
	 * @param {"kit"|"equipped"|"pockets"|"pack"} area
	 * @return {boolean|string} Success or a warning message
	 */
	couldAreaStoreEquipment(item, area) {
		if (item.type === "kit" && area !== "kit") {
			return game.i18n.localize(
				"warden.character.sheet.warnings.kit-in-non-kit-slot",
			);
		}
		if (item.type !== "kit" && area === "kit") {
			return game.i18n.localize(
				"warden.character.sheet.warnings.non-kit-in-kit-slot",
			);
		}
		if (area === "pockets" && item.system.weight !== "light") {
			return game.i18n.localize(
				"warden.character.sheet.warnings.pocket-weight",
			);
		}

		return true;
	}
	/**
	 * Find out if a piece of equipment can be inserted in a specified area at a specified slot
	 * @param {Item} item
	 * @param {"kit"|"equipped"|"pockets"|"pack"} area
	 * @return {true|string} Success or a warning message
	 */
	canAreaFitEquipment(item, area) {
		if (!BaseEquipment.isItemEquipment(item)) return false;

		switch (area) {
			case "kit":
				return true;
			case "equipped":
				return this.equipped_item_ids.size < 5;
			case "pockets":
				return this.pocket_item_ids.size < 4;
			case "pack":
				return this.pack_item_ids.size < this.kit.system.pack_slots;
		}

		return false;
	}

	areaToPath(area) {
		switch (area) {
			case "equipped":
				return "equipped_item_ids";
			case "pockets":
				return "pocket_item_ids";
			case "pack":
				return "pack_item_ids";
		}
	}
	inventoryListByName(name) {
		switch (name) {
			case "equipped":
				return this.equipped_items;
			case "pockets":
				return this.pocket_items;
			case "pack":
				return this.pack_items;
		}
	}

	async replaceKit(newKit) {
		newKit = newKit.inCompendium
			? game.items.fromCompendium(newKit, { clearFolder: true })
			: newKit.toObject();

		const id = foundry.utils.randomID();
		newKit._id = id;

		return foundry.documents.modifyBatch([
			{
				action: "delete",
				documentName: "Item",
				ids: [this.kit.id],
				parent: this.parent,
			},
			{
				action: "create",
				documentName: "Item",
				data: [newKit],
				keepId: true,
				parent: this.parent,
			},
			{
				action: "update",
				documentName: "Actor",
				updates: [
					{
						_id: this.parent.id,
						"system.kit_item_id": id,
					},
				],
			},
		]);
	}
	/**
	 * Performs mutation of the inventory, adding a new item, removing an existing item, or swapping the area of items.
	 * There are many forms the function can take depending on what options are supplied
	 * - If srcArea and destArea are specified we move the item between areas
	 * - If srcArea, destArea and destItem are specified we swap the items' areas and sort order
	 * - If destArea is specified but not srcArea, we create the item ex nihilo
	 * - If srcArea are specified but not destArea we delete the item
	 * @param {Item} srcItem
	 * @param options
	 * @param {"equipped"|"pockets"|"pack"?} options.destArea
	 * @param {"equipped"|"pockets"|"pack"} options.srcArea
	 * @param {Item?} options.destItem
	 */
	async editInventory(srcItem, { destArea, srcArea, destItem }) {
		if (srcItem.type === "kit") {
			return this.replaceKit(srcItem);
		}

		const operations = [];

		// The relative path to the target Set, or null
		const srcPath = srcArea == null ? srcArea : this.areaToPath(srcArea);
		// A copy of the target Set to modify, or null
		const srcSet =
			srcPath == null
				? srcPath
				: new Set(foundry.utils.getProperty(this, srcPath));

		// The relative path to the target Set, or null
		const destPath =
			destArea == null ? destArea : this.areaToPath(destArea);
		// A copy of the target Set to modify, or null
		const destSet =
			destPath == null
				? destPath
				: new Set(foundry.utils.getProperty(this, destPath));

		let id = srcItem.id;

		if (srcArea == null) {
			// If the srcItem comes from nowhere we need to create it
			srcItem = srcItem.inCompendium
				? game.items.fromCompendium(srcItem, { clearFolder: true })
				: srcItem.toObject();

			id = foundry.utils.randomID();

			srcItem._id = id;

			operations.push({
				action: "create",
				documentName: "Item",
				data: [srcItem],
				keepId: true,
				parent: this.parent,
			});
		} else {
			// Else we'll need to edit where it came from
			srcSet.delete(id);
			operations.push({
				action: "update",
				documentName: "Actor",
				updates: [
					{
						_id: this.parent.id,
						[`system.${srcPath}`]: srcSet,
					},
				],
			});
		}

		if (destArea == null) {
			// If the item is going nowhere we delete it
			operations.push({
				action: "delete",
				documentName: "Item",
				ids: [srcItem.id],
				parent: this.parent,
			});
		} else {
			// Else we add it to the destination
			destSet.add(id);
			operations.push({
				action: "update",
				documentName: "Actor",
				updates: [
					{ _id: this.parent.id, [`system.${destPath}`]: destSet },
				],
			});
		}

		if (destItem != null) {
			// If we're swapping the Sets need to be updated inversely to the dropped srcItem
			srcSet.add(destItem.id);
			destSet.delete(destItem.id);

			// And we can just swap their sort values to preserve orders
			operations.push({
				action: "update",
				documentName: "Item",
				updates: [
					{ _id: srcItem.id, sort: destItem.sort },
					{ _id: destItem.id, sort: srcItem.sort },
				],
				parent: this.parent,
			});
		}

		await foundry.documents.modifyBatch(operations);
	}

	get untrainedBonus() {
		return Math.min(Math.floor(this.level / 2), 10);
	}

	#calcProficiencyBonus(rank) {
		if (rank === 0) return this.untrainedBonus;

		return this.level + rank;
	}
	#populateProficiencyFields(prof) {
		prof.proficiency_bonus = this.#calcProficiencyBonus(prof.rank);
		prof.bonus = prof.proficiency_bonus;
	}

	prepareDerivedData() {
		super.prepareDerivedData();

		this.hit_points.max = 10 + 2 * this.defense.toughness.rank;
		this.hit_points.value = Math.min(
			this.hit_points.value,
			this.hit_points.max,
		);

		this.strain.max = 10 + 2 * this.defense.resolve.rank;
		this.strain.value = Math.min(this.strain.value, this.strain.max);

		this.#populateProficiencyFields(this.path.combat);
		this.#populateProficiencyFields(this.path.skill);
		this.#populateProficiencyFields(this.path.special);

		this.#populateProficiencyFields(this.defense.toughness);
		this.#populateProficiencyFields(this.defense.resolve);
		this.#populateProficiencyFields(this.defense.perception);

		for (const [_, skill] of Object.entries(this.skill)) {
			skill.proficiency_bonus = skill.is_proficient
				? this.path.skill.proficiency_bonus
				: this.untrainedBonus;
			skill.bonus = skill.proficiency_bonus;
		}

		for (const [_, skill] of Object.entries(this.knowledge_skills)) {
			skill.proficiency_bonus = this.path.skill.proficiency_bonus;
			skill.bonus = skill.proficiency_bonus;
		}

		this.speed = {};
		this.speed.base = 5;
		this.speed.value = this.speed.base;

		this.wealth = Math.min(this.wealth, this.vocation.value);
	}

	formatProficiency(rank) {
		return game.i18n.format(`warden.proficiency_rank.${rank}`);
	}

	/**
	 * Parameters to make an untrained check.
	 * @returns CheckParameters
	 */
	untrainedCheckParameters() {
		return {
			title: game.i18n.localize("warden.check_label", {
				type: game.i18n.localize("warden.proficiency_rank.0"),
			}),
			modifiers: [
				{
					label: this.formatProficiency(0),
					type: "proficiency",
					value: this.untrainedBonus,
				},
			],
		};
	}

	/**
	 * Parameters to make a check with a path.
	 * @param {string} proficiency_name - The path of the proficiency, e.g. "path.combat".
	 * @returns CheckParameters
	 */
	proficiencyCheckParameters(proficiency_name) {
		const path = foundry.utils.getProperty(this, proficiency_name);
		return {
			title: game.i18n.localize("warden.check_label", {
				type: game.i18n.localize(
					`warden.character.FIELDS.${proficiency_name}.label`,
				),
			}),
			modifiers: [
				{
					label: this.formatProficiency(path.rank),
					type: "proficiency",
					value: path.proficiency_bonus,
				},
			],
		};
	}

	/**
	 * Parameters to make a check with a skill.
	 * @param {string} skill_name - The skill name to check e.g. "crafting", "medicine".
	 * @returns CheckParameters
	 */
	skillCheckParameters(skill_name) {
		const skill = this.skill[skill_name];
		return {
			title: game.i18n.localize("warden.check_label", {
				type: game.i18n.localize(
					`warden.character.FIELDS.skill.${skill_name}.name`,
				),
			}),
			modifiers: [
				{
					label: this.formatProficiency(
						skill.is_proficient ? this.path.skill.rank : 0,
					),
					type: "proficiency",
					value: skill.proficiency_bonus,
				},
			],
		};
	}
	/**
	 * Parameters to make a check with a knowledge skill.
	 * @param {string} id - The id of the knowledge skill.
	 * @returns CheckParameters
	 */
	knowledgeCheckParameters(id) {
		const skill = this.knowledge_skills[id];
		return {
			title: game.i18n.localize("warden.check_label", {
				type: skill.topic,
			}),
			benefit: skill.is_niche,
			modifiers: [
				{
					label: this.formatProficiency(this.path.skill.rank),
					type: "proficiency",
					value: skill.proficiency_bonus,
				},
			],
		};
	}
}
