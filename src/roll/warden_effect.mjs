export class WardenEffect extends Roll {
	constructor(formula, data, options) {
		super(formula, data, options);
	}

	static CHAT_TEMPLATE = "/systems/warden/static/chat/effect.hbs";
}
