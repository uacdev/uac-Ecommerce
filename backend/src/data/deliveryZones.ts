export type DeliveryZone = {
    name: string;
    fee: number;
};

export const DELIVERY_ZONES: DeliveryZone[] = [
    { name: 'VI/Lekki', fee: 8000 },
    { name: 'Ikoyi', fee: 7000 },
    { name: 'Surulere', fee: 4500 },
    { name: 'Ikeja/Maryland/Onipanu', fee: 3000 },
    { name: 'Agege/Ogba', fee: 4500 },
    { name: 'Festac/Ago Okota', fee: 6000 },
    { name: 'Magodo', fee: 4000 },
    { name: 'Ebute Meta', fee: 5500 },
    { name: 'Gbagada', fee: 3000 },
    { name: 'Ketu', fee: 3000 },
    { name: 'Ikorodu', fee: 6500 }
];

export const findZoneByName = (name: string): DeliveryZone | undefined =>
    DELIVERY_ZONES.find(z => z.name.toLowerCase() === name.toLowerCase());
