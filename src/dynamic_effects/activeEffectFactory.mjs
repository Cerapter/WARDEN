export const getBaseActiveEffect = (label, type) => {
	type ??= "bonus";

	return {
		name: "dynamicEffectHolder",
		changes: [
			{
				key: `system.dynamic_effects.${type}`,
				type: "add",
				phase: "initial",
				value: getDefaultValue(label, type),
			},
		],
	};
};

const getDefaultValue = (label, type) => {
	const value = {
		label: label,
		domains: [],

		value: 0,

		applicable_if: [],

		defaultEnabled: true,
	};

	switch (type) {
		case "bonus":
		case "penalty":
			value.mode = "upgrade";
			value.modifier_type = "universal";
			break;
		default:
			value.mode = "add";
	}

	return value;
};
