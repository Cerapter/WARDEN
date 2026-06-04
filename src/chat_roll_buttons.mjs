import { runEffect } from "./roll/effect_manager.mjs";

const buttonElement = document.createElement("button");

// Thanks to fvtt-dice-tray for aa lot of this
export const setupRollButton = () => {
	Hooks.once("renderChatLog", () => {
		setupButtonElement();
		moveButton();
	});

	Hooks.on("renderChatLog", (chatlog) => {
		if (!chatlog.isPopout) return;
		moveButton();
	});
	Hooks.on("closeChatLog", (chatlog) => {
		if (!chatlog.isPopout) return;
		moveButton();
	});
	Hooks.on("activateChatLog", (chatlog) => {
		if (ui.chat.popout?.rendered && !ui.chat.isPopout) return;
		moveButton();
	});
	Hooks.on("deactivateChatLog", (chatlog) => {
		if (ui.chat.popout?.rendered && !ui.chat.isPopout) return;
		moveButton();
	});
	Hooks.on("collapseSidebar", (sidebar, wasExpanded) => {
		if (ui.chat.popout?.rendered && !ui.chat.isPopout) return;
		moveButton();
	});
};

function moveButton() {
	const chatInput = document.getElementById("chat-message");

	chatInput.insertAdjacentElement("beforebegin", buttonElement);
}

function setupButtonElement() {
	buttonElement.textContent = _loc("warden.ui.effect_roll_button");
	buttonElement.id = "warden-chat-roll-button";
	buttonElement.type = "button";

	buttonElement.addEventListener("click", (e) => {
		const speaker = ChatMessage.getSpeaker();
		runEffect({}, speaker, {}, { skip: e.shiftKey }).then();
	});
}
