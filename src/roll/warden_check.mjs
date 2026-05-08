export class WardenCheck extends Roll {
	constructor(formula, data, options) {
		super(formula, data, options);
	}

	static CHAT_TEMPLATE = "/systems/warden/static/chat/check.hbs";
}
