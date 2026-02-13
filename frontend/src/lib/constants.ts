export const PROPERTY_TYPES = {
    APARTMENT: "Apartment",
    PENTHOUSE: "Penthouse",
    PLOT: "Plot",
    VILLA: "Villa",
} as const;

export const UNIT_TYPES_BY_PROPERTY: Record<string, string[]> = {
    [PROPERTY_TYPES.APARTMENT]: ["1 RK", "1 BHK", "2 BHK", "2.5 BHK", "3 BHK", "3.5 BHK", "4 BHK", "5+ BHK", "Studio"],
    [PROPERTY_TYPES.PENTHOUSE]: ["3 BHK", "4 BHK", "5+ BHK"],
    [PROPERTY_TYPES.PLOT]: ["Residential Plot", "Commercial Plot"],
    [PROPERTY_TYPES.VILLA]: ["3 BHK", "4 BHK", "5+ BHK"],
};

export const ALL_UNIT_TYPES = Array.from(
    new Set(Object.values(UNIT_TYPES_BY_PROPERTY).flat())
).sort();
