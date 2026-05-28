/**
 * @typedef DamageType
 * @property {"physical"|"energy"|"special"} category
 * @property {string} abbreviation
 */

/**
 *
 * @type {Record<string, DamageType>}
 */
export const DAMAGE_TYPES = {
	bleed: { category: "physical", abbreviation: "Be" },
	blunt: { category: "physical", abbreviation: "B" },
	pierce: { category: "physical", abbreviation: "P" },
	slash: { category: "physical", abbreviation: "S" },

	acid: { category: "energy", abbreviation: "Ac" },
	cold: { category: "energy", abbreviation: "C" },
	electricity: { category: "energy", abbreviation: "E" },
	fire: { category: "energy", abbreviation: "F" },
	toxic: { category: "energy", abbreviation: "T" },

	aether: { category: "special", abbreviation: "Ae" },
	dark: { category: "special", abbreviation: "D" },
	holy: { category: "special", abbreviation: "H" },
	psychic: { category: "special", abbreviation: "Psy" },
};

export const DAMAGE_TYPE_CHOICES = Object.fromEntries(
	Object.entries(DAMAGE_TYPES).map(([k, _]) => [
		k,
		`warden.damage_type.${k}`,
	]),
);

export const DAMAGE_CATEGORY_CHOICES = Object.fromEntries(
	Object.entries(DAMAGE_TYPES).map(([_, v]) => [
		v.category,
		`warden.damage_category.${v.category}`,
	]),
);
