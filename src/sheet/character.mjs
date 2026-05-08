import { BaseEquipment } from "../model/base_equipment.mjs";
import { runCheck } from "../roll/check_manager.mjs";

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

		context.kit = system.kit;

		context.equipped_items = this.paddedInventoryList(
			system.equipped_items,
			5,
		);
		context.pocket_items = this.paddedInventoryList(system.pocket_items, 4);
		context.pack_items = this.paddedInventoryList(
			system.pack_items,
			system.kit?.system?.pack_slots ?? 2,
		);

		return context;
	}

	/**
	 * Pads lists with nulls, so handlebars #each works better
	 * @param {any[]} list - The list to pad
	 * @param {number} length - The desired minimum length of the output
	 * @return {any[]}
	 */
	paddedInventoryList(list, length) {
		const sorted = this.sortedInventoryList(list);
		return Array.fromRange(Math.max(length, sorted.length)).map(
			(i) => sorted[i] ?? null,
		);
	}
	/**
	 * Sorts list according to element. sorted
	 * @param {any[]} list
	 * @returns {any[]}
	 */
	sortedInventoryList(list) {
		return Array.from(list).sort((i1, i2) => i1.sort - i2.sort);
	}

	/**
	 * Handle dropping equipment in specified inventory areas
	 * @param {DragEvent} event
	 * @param {Item} item
	 * @return {Promise<documents.Item | null | undefined>}
	 * @private
	 */
	async _onDropItem(event, item) {
		if (!BaseEquipment.isItemEquipment(item))
			return super._onDropItem(event, item);

		// We're either sorting or swapping
		if (this.actor.uuid === item.parent?.uuid) {
			const destElement = event.target.closest("[data-item-id]");
			const destArea = event.target.closest("[data-inventory-area]")
				?.dataset?.inventoryArea;
			const srcElement = this.element.querySelector(
				`[data-item-id="${item.id}"]`,
			);
			const srcArea = srcElement.closest("[data-inventory-area]")?.dataset
				?.inventoryArea;

			if (destArea === srcArea) {
				// We're sorting, let the base implementation handle it.
				if (event.target.closest("[data-empty]") === null) {
					return super._onDropItem(event, item);
				}

				// We're putting in a past-the-end empty slot, sort just after the end element
				const sortedList = this.sortedInventoryList(
					this.actor.system.inventoryListByName(destArea),
				);
				await item.update({
					sort: sortedList[sortedList.length - 1].sort + 1,
				});
				return item;
			}

			const couldStoreDroppedItem =
				this.actor.system.couldAreaStoreEquipment(item, destArea);
			if (couldStoreDroppedItem !== true) {
				if (typeof couldStoreDroppedItem === "string") {
					ui.notifications.warn(couldStoreDroppedItem);
				}
				return null;
			}
			if (event.target.closest("[data-empty]") !== null) {
				if (couldStoreDroppedItem !== true) {
					return null;
				}

				await this.actor.system.editInventory(item, {
					destArea,
					srcArea,
				});
				return item;
			}

			const destItem = this.actor.items.get(destElement.dataset.itemId);

			const couldStoreTargetItem =
				this.actor.system.couldAreaStoreEquipment(destItem, srcArea);

			if (typeof couldStoreTargetItem === "string") {
				ui.notifications.warn(couldStoreTargetItem);
			}
			if (
				couldStoreDroppedItem !== true ||
				couldStoreTargetItem !== true
			) {
				return null;
			}

			await this.actor.system.editInventory(item, {
				destArea,
				srcArea,
				destItem,
			});
			return item;
		}

		const destArea = event.target.closest("[data-inventory-area]")?.dataset
			?.inventoryArea;

		if (destArea === undefined) {
			ui.notifications.warn(
				game.i18n.localize(
					"warden.character.sheet.warnings.no-inventory-area",
				),
			);
			return null;
		}

		const canStore = this.actor.system.couldAreaStoreEquipment(
			item,
			destArea,
		);
		if (canStore !== true) {
			if (typeof canStore === "string") ui.notifications.warn(canStore);
			return null;
		}

		const canFit = this.actor.system.canAreaFitEquipment(item, destArea);
		if (canFit !== true) {
			if (typeof canFit === "string") ui.notifications.warn(canFit);
			return null;
		}

		await this.actor.system.editInventory(item, { destArea });
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

	static async check(e, target) {
		const rollData = this.actor.getRollData();
		const speaker = ChatMessage.getSpeaker({ actor: this.actor });

		/**
		 * @type CheckParameters
		 */
		let parameters;
		switch (target.dataset.type) {
			case "untrained":
				parameters = this.actor.system.untrainedCheckParameters();
				break;
			case "proficiency":
				const path = target.dataset.path;
				parameters = this.actor.system.proficiencyCheckParameters(path);
				break;
			case "skill":
				const skill = target.dataset.skill;
				parameters = this.actor.system.skillCheckParameters(skill);
				break;
			case "knowledge":
				const id = target.dataset.id;
				parameters = this.actor.system.knowledgeCheckParameters(id);
				break;
		}

		return runCheck(rollData, speaker, parameters, { skip: e.shiftKey });
	}
}
